import { AccountOtp, Folder, VaultSettings } from '../types/auth';

const STORAGE_KEYS = {
  FOLDERS: 'vaultotp_folders_v1',
  ACCOUNTS: 'vaultotp_accounts_v1',
  SETTINGS: 'vaultotp_settings_v1',
};

export const INITIAL_FOLDERS: Folder[] = [
  {
    id: 'f-work',
    name: 'Work & Engineering',
    color: 'blue',
    icon: 'Briefcase',
    description: 'Corporate SSO, developer logins & client portals',
    order: 0,
    createdAt: Date.now() - 30 * 86400000,
  },
  {
    id: 'f-cloud',
    name: 'Cloud Infrastructure',
    color: 'cyan',
    icon: 'Server',
    description: 'Cloud providers, Kubernetes clusters & edge DNS',
    order: 1,
    createdAt: Date.now() - 25 * 86400000,
  },
  {
    id: 'f-finance',
    name: 'Personal & Finance',
    color: 'emerald',
    icon: 'Wallet',
    description: 'Primary email, bank logins, exchanges & password managers',
    order: 2,
    createdAt: Date.now() - 20 * 86400000,
  },
  {
    id: 'f-gaming',
    name: 'Gaming & Social',
    color: 'violet',
    icon: 'Gamepad2',
    description: 'Gaming stores, community chats and creative platforms',
    order: 3,
    createdAt: Date.now() - 15 * 86400000,
  },
];

// Seeded realistic accounts with standard Base32 secrets
export const INITIAL_ACCOUNTS: AccountOtp[] = [
  {
    id: 'acc-1',
    issuer: 'GitHub',
    accountName: 'alex-engineer@company.com',
    secret: 'JBSWY3DPEHPK3PXP', // standard test secret
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    type: 'totp',
    folderId: 'f-work',
    tags: ['work', 'code', 'critical'],
    notes: 'Recovery codes stored in corporate 1Password vault',
    isPinned: true,
    usageCount: 42,
    lastUsedAt: Date.now() - 3600000,
    createdAt: Date.now() - 20 * 86400000,
    updatedAt: Date.now() - 20 * 86400000,
  },
  {
    id: 'acc-2',
    issuer: 'AWS',
    accountName: 'production-root-admin',
    secret: 'HXDMVJECJJWSRB3HWIZR4IFUGFTMXBOZ',
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    type: 'totp',
    folderId: 'f-cloud',
    tags: ['production', 'infra', 'root'],
    notes: 'Hardware MFA token backup kept in physical office safe',
    isPinned: true,
    usageCount: 28,
    lastUsedAt: Date.now() - 7200000,
    createdAt: Date.now() - 18 * 86400000,
    updatedAt: Date.now() - 18 * 86400000,
  },
  {
    id: 'acc-3',
    issuer: 'Cloudflare',
    accountName: 'dns-ops@techcorp.io',
    secret: 'MZXW633PN5XW6MZX',
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    type: 'totp',
    folderId: 'f-cloud',
    tags: ['infra', 'dns'],
    notes: 'Primary DNS & DDoS shield zone manager',
    isPinned: false,
    usageCount: 14,
    lastUsedAt: Date.now() - 86400000,
    createdAt: Date.now() - 15 * 86400000,
    updatedAt: Date.now() - 15 * 86400000,
  },
  {
    id: 'acc-4',
    issuer: 'Google',
    accountName: 'alex.personal@gmail.com',
    secret: 'KRUGS4ZANFZSAYJA',
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    type: 'totp',
    folderId: 'f-finance',
    tags: ['personal', 'email', 'primary'],
    notes: 'Master recovery prompt verified',
    isPinned: true,
    usageCount: 35,
    lastUsedAt: Date.now() - 1800000,
    createdAt: Date.now() - 14 * 86400000,
    updatedAt: Date.now() - 14 * 86400000,
  },
  {
    id: 'acc-5',
    issuer: 'Coinbase',
    accountName: 'alex.crypto.vault',
    secret: 'NBSWY3DPEHPK3PXP',
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    type: 'totp',
    folderId: 'f-finance',
    tags: ['finance', 'crypto'],
    notes: 'Cold storage withdrawal verification',
    isPinned: false,
    usageCount: 9,
    lastUsedAt: Date.now() - 43200000,
    createdAt: Date.now() - 12 * 86400000,
    updatedAt: Date.now() - 12 * 86400000,
  },
  {
    id: 'acc-6',
    issuer: 'Slack',
    accountName: 'alex@startup-workspace.slack.com',
    secret: 'GEZDGNBVGY3TQOJQ',
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    type: 'totp',
    folderId: 'f-work',
    tags: ['work', 'chat'],
    isPinned: false,
    usageCount: 19,
    lastUsedAt: Date.now() - 5400000,
    createdAt: Date.now() - 10 * 86400000,
    updatedAt: Date.now() - 10 * 86400000,
  },
  {
    id: 'acc-7',
    issuer: 'Discord',
    accountName: 'CyberAlex#1337',
    secret: 'OBWG64TPOJSSA43V',
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    type: 'totp',
    folderId: 'f-gaming',
    tags: ['gaming', 'community'],
    isPinned: false,
    usageCount: 8,
    lastUsedAt: Date.now() - 172800000,
    createdAt: Date.now() - 8 * 86400000,
    updatedAt: Date.now() - 8 * 86400000,
  },
  {
    id: 'acc-8',
    issuer: 'Steam',
    accountName: 'AlexSteamVault',
    secret: 'ONSWG4TFORZGS3TH',
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    type: 'totp',
    folderId: 'f-gaming',
    tags: ['gaming'],
    isPinned: false,
    usageCount: 5,
    lastUsedAt: Date.now() - 259200000,
    createdAt: Date.now() - 7 * 86400000,
    updatedAt: Date.now() - 7 * 86400000,
  },
];

export const INITIAL_SETTINGS: VaultSettings = {
  isLocked: false,
  hasPin: false,
  hideCodesByDefault: false,
  viewMode: 'grid',
  sortBy: 'order',
  autoLockMinutes: 0,
};

export function loadFolders(): Folder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FOLDERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(INITIAL_FOLDERS));
      return INITIAL_FOLDERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_FOLDERS;
  } catch {
    return INITIAL_FOLDERS;
  }
}

export function saveFolders(folders: Folder[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(folders));
  } catch (err) {
    console.error('Failed to save folders to localStorage:', err);
  }
}

export function loadAccounts(): AccountOtp[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(INITIAL_ACCOUNTS));
      return INITIAL_ACCOUNTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_ACCOUNTS;
  } catch {
    return INITIAL_ACCOUNTS;
  }
}

export function saveAccounts(accounts: AccountOtp[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  } catch (err) {
    console.error('Failed to save accounts to localStorage:', err);
  }
}

export function loadSettings(): VaultSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      return INITIAL_SETTINGS;
    }
    return { ...INITIAL_SETTINGS, ...JSON.parse(raw), isLocked: false };
  } catch {
    return INITIAL_SETTINGS;
  }
}

export function saveSettings(settings: VaultSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

/**
 * Computes SHA-256 hash of a string
 */
export async function hashPin(pin: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(pin.trim());
  const hashBuf = await window.crypto.subtle.digest('SHA-256', data);
  const hashArr = Array.from(new Uint8Array(hashBuf));
  return hashArr.map((b) => b.toString(16).padStart(2, '0')).join('');
}
