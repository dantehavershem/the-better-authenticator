import { AccountOtp, OtpAlgorithm, GeneratedCode } from '../types/auth';

// Standard RFC 4648 Base32 alphabet
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Decodes a Base32 string into a Uint8Array byte array
 */
export function base32ToBytes(base32: string): Uint8Array {
  // Clean string: uppercase, remove spaces, dashes, and padding '='
  const clean = base32.toUpperCase().replace(/[\s\-=]/g, '');
  if (!clean) {
    return new Uint8Array(0);
  }

  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    const index = BASE32_ALPHABET.indexOf(char);
    if (index === -1) {
      // Ignore invalid characters gracefully
      continue;
    }

    value = (value << 5) | index;
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return new Uint8Array(bytes);
}

/**
 * Converts a 64-bit integer counter to an 8-byte big-endian buffer
 */
function counterToBuffer(counter: number): Uint8Array {
  const buffer = new Uint8Array(8);
  let temp = counter;
  for (let i = 7; i >= 0; i--) {
    buffer[i] = temp & 0xff;
    temp = Math.floor(temp / 256);
  }
  return buffer;
}

/**
 * Maps algorithm string to Web Crypto format
 */
function getHashName(algo: OtpAlgorithm): string {
  switch (algo) {
    case 'SHA256':
      return 'SHA-256';
    case 'SHA512':
      return 'SHA-512';
    case 'SHA1':
    default:
      return 'SHA-1';
  }
}

/**
 * Generates an OTP code given key bytes, counter, algorithm and digits
 */
async function generateHmacOtp(
  keyBytes: Uint8Array,
  counter: number,
  algorithm: OtpAlgorithm = 'SHA1',
  digits: number = 6
): Promise<string> {
  if (keyBytes.length === 0) {
    return '000000';
  }

  const hashName = getHashName(algorithm);
  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    keyBytes as BufferSource,
    { name: 'HMAC', hash: { name: hashName } },
    false,
    ['sign']
  );

  const counterBuf = counterToBuffer(counter);
  const signature = await window.crypto.subtle.sign('HMAC', cryptoKey, counterBuf as BufferSource);
  const digest = new Uint8Array(signature);

  // Dynamic truncation (RFC 4226 Section 5.4)
  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  const otp = binary % Math.pow(10, digits);
  return otp.toString().padStart(digits, '0');
}

/**
 * Formats a code with middle space for readability (e.g. 123 456 or 1234 5678)
 */
export function formatOtpCode(code: string): string {
  if (code.length === 6) {
    return `${code.slice(0, 3)} ${code.slice(3)}`;
  }
  if (code.length === 8) {
    return `${code.slice(0, 4)} ${code.slice(4)}`;
  }
  return code;
}

/**
 * Generates the current TOTP code and cycle information for an account
 */
export async function getTotpCode(
  account: Pick<AccountOtp, 'secret' | 'algorithm' | 'digits' | 'period' | 'type' | 'counter'>,
  epochMs: number = Date.now()
): Promise<GeneratedCode> {
  const period = account.period || 30;
  const digits = account.digits || 6;
  const algorithm = account.algorithm || 'SHA1';

  const keyBytes = base32ToBytes(account.secret);

  if (account.type === 'hotp') {
    const counter = account.counter || 0;
    const code = await generateHmacOtp(keyBytes, counter, algorithm, digits);
    return {
      code,
      formattedCode: formatOtpCode(code),
      remainingSeconds: 30,
      progressPercent: 100,
      period,
    };
  }

  // TOTP calculation
  const epochSeconds = Math.floor(epochMs / 1000);
  const counter = Math.floor(epochSeconds / period);
  const remainingSeconds = period - (epochSeconds % period);
  const progressPercent = Math.max(0, Math.min(100, (remainingSeconds / period) * 100));

  const code = await generateHmacOtp(keyBytes, counter, algorithm, digits);
  // Also calculate next code for preview
  const nextCodeRaw = await generateHmacOtp(keyBytes, counter + 1, algorithm, digits);

  return {
    code,
    formattedCode: formatOtpCode(code),
    remainingSeconds,
    progressPercent,
    period,
    nextCode: formatOtpCode(nextCodeRaw),
  };
}

/**
 * Parses an otpauth:// URL into AccountOtp fields
 */
export function parseOtpAuthUri(uri: string): Partial<AccountOtp> | null {
  try {
    const trimmed = uri.trim();
    if (!trimmed.startsWith('otpauth://')) {
      return null;
    }

    const url = new URL(trimmed);
    const type = url.host.toLowerCase() === 'hotp' ? 'hotp' : 'totp';
    
    // Path holds [issuer:]account
    let label = decodeURIComponent(url.pathname.replace(/^\//, ''));
    let issuer = url.searchParams.get('issuer') || '';
    let accountName = label;

    if (label.includes(':')) {
      const parts = label.split(':');
      if (!issuer) {
        issuer = parts[0].trim();
      }
      accountName = parts.slice(1).join(':').trim();
    }

    const secret = url.searchParams.get('secret') || '';
    const algorithm = (url.searchParams.get('algorithm') || 'SHA1').toUpperCase() as OtpAlgorithm;
    const digits = parseInt(url.searchParams.get('digits') || '6', 10);
    const period = parseInt(url.searchParams.get('period') || '30', 10);
    const counter = parseInt(url.searchParams.get('counter') || '0', 10);

    return {
      issuer: issuer || 'Unknown Service',
      accountName: accountName || 'user',
      secret: secret.toUpperCase().replace(/\s+/g, ''),
      algorithm: ['SHA1', 'SHA256', 'SHA512'].includes(algorithm) ? algorithm : 'SHA1',
      digits: digits === 8 ? 8 : 6,
      period: period > 0 ? period : 30,
      type,
      counter,
    };
  } catch (err) {
    console.error('Failed to parse OTP URI:', err);
    return null;
  }
}

/**
 * Generates an otpauth:// URI from an account object
 */
export function generateOtpAuthUri(account: AccountOtp): string {
  const type = account.type || 'totp';
  const label = encodeURIComponent(`${account.issuer}:${account.accountName}`);
  const params = new URLSearchParams();

  params.set('secret', account.secret.replace(/\s+/g, '').toUpperCase());
  if (account.issuer) {
    params.set('issuer', account.issuer);
  }
  if (account.algorithm && account.algorithm !== 'SHA1') {
    params.set('algorithm', account.algorithm);
  }
  if (account.digits && account.digits !== 6) {
    params.set('digits', account.digits.toString());
  }
  if (type === 'totp' && account.period && account.period !== 30) {
    params.set('period', account.period.toString());
  }
  if (type === 'hotp' && account.counter !== undefined) {
    params.set('counter', account.counter.toString());
  }

  return `otpauth://${type}/${label}?${params.toString()}`;
}
