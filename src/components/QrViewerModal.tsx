import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, Copy, Check, QrCode as QrIcon, ShieldCheck } from 'lucide-react';
import { AccountOtp } from '../types/auth';
import { generateOtpAuthUri } from '../utils/totp';

interface QrViewerModalProps {
  account: AccountOtp | null;
  onClose: () => void;
}

export const QrViewerModal: React.FC<QrViewerModalProps> = ({ account, onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedUri, setCopiedUri] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);

  useEffect(() => {
    if (!account) return;
    const uri = generateOtpAuthUri(account);
    QRCode.toDataURL(uri, {
      width: 280,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate QR code', err));
  }, [account]);

  if (!account) return null;

  const uri = generateOtpAuthUri(account);

  const handleCopyUri = () => {
    navigator.clipboard.writeText(uri);
    setCopiedUri(true);
    setTimeout(() => setCopiedUri(false), 2000);
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(account.secret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-6 text-slate-900 dark:text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <QrIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-semibold text-base">Export 2FA QR Code</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 flex flex-col items-center">
          <div className="text-center mb-3">
            <p className="font-medium text-sm text-slate-900 dark:text-slate-100">{account.issuer}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{account.accountName}</p>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs mb-3">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="2FA QR Code" className="w-56 h-56 object-contain" />
            ) : (
              <div className="w-56 h-56 flex items-center justify-center text-slate-400 text-xs">
                Generating QR code...
              </div>
            )}
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 text-center max-w-xs mb-4">
            Scan with any authenticator app (Google Authenticator, Apple, Authy) to transfer this code to your mobile device.
          </p>

          <div className="w-full space-y-2">
            <div className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/60 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 font-mono text-[11px] truncate mr-2">Secret: {account.secret}</span>
              <button
                onClick={handleCopySecret}
                className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline shrink-0"
              >
                {copiedSecret ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSecret ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/60 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 font-mono text-[11px] truncate mr-2">{uri}</span>
              <button
                onClick={handleCopyUri}
                className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline shrink-0"
              >
                {copiedUri ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUri ? 'Copied URI' : 'Copy URI'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
