import React, { useState } from 'react';
import {
  Copy,
  Check,
  Star,
  MoreVertical,
  QrCode,
  Folder as FolderIcon,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  RefreshCw,
  FolderInput,
} from 'lucide-react';
import { AccountOtp, Folder, GeneratedCode } from '../types/auth';
import { getServiceTheme, getFolderColor } from '../utils/serviceIcons';

interface OtpCardProps {
  account: AccountOtp;
  codeInfo: GeneratedCode | null;
  folder: Folder | null;
  folders: Folder[];
  hideCodes: boolean;
  onCopy: (account: AccountOtp, code: string) => void;
  onTogglePin: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (account: AccountOtp) => void;
  onViewQr: (account: AccountOtp) => void;
  onMoveFolder: (id: string, folderId: string) => void;
  onIncrementHotp?: (id: string) => void;
}

export const OtpCard: React.FC<OtpCardProps> = ({
  account,
  codeInfo,
  folder,
  folders,
  hideCodes,
  onCopy,
  onTogglePin,
  onDelete,
  onEdit,
  onViewQr,
  onMoveFolder,
  onIncrementHotp,
}) => {
  const [copied, setCopied] = useState(false);
  const [showCodeOverride, setShowCodeOverride] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [folderMenuOpen, setFolderMenuOpen] = useState(false);

  const brand = getServiceTheme(account.issuer);
  const folderColor = folder ? getFolderColor(folder.color) : getFolderColor('slate');

  const isVisible = showCodeOverride || !hideCodes;
  const currentCode = codeInfo?.formattedCode || '--- ---';
  const remainingSeconds = codeInfo?.remainingSeconds ?? 30;
  const progressPercent = codeInfo?.progressPercent ?? 100;

  // Timer ring color dynamics
  let timerStroke = '#3b82f6'; // blue
  if (remainingSeconds <= 5) {
    timerStroke = '#ef4444'; // red
  } else if (remainingSeconds <= 10) {
    timerStroke = '#f59e0b'; // amber
  }

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!codeInfo?.code) return;
    navigator.clipboard.writeText(codeInfo.code);
    setCopied(true);
    onCopy(account, codeInfo.code);
    setTimeout(() => setCopied(false), 2000);
  };

  // SVG circular math (radius 14, circumference 2 * PI * 14 = ~88)
  const radius = 13;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div
      onClick={handleCopy}
      className="group relative bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer flex flex-col justify-between"
    >
      {/* Top row: Brand Icon, Issuer, Account, Pin, and Context Menu */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ${brand.bg}`}
            >
              {brand.label}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                  {account.issuer}
                </h4>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {account.accountName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onTogglePin(account.id)}
              className={`p-1.5 rounded-md transition-colors ${
                account.isPinned
                  ? 'text-amber-500 hover:text-amber-600 bg-amber-50 dark:bg-amber-950/30'
                  : 'text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400'
              }`}
              title={account.isPinned ? 'Remove from favorites' : 'Pin to favorites'}
            >
              <Star className="w-4 h-4 fill-current" />
            </button>

            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md transition-colors"
                title="Options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => {
                      setMenuOpen(false);
                      setFolderMenuOpen(false);
                    }}
                  />
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl py-1 z-30 text-xs">
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onViewQr(account);
                      }}
                      className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Show QR / Export</span>
                    </button>

                    <button
                      onClick={() => {
                        setFolderMenuOpen(!folderMenuOpen);
                      }}
                      className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      <span className="flex items-center gap-2">
                        <FolderInput className="w-3.5 h-3.5" />
                        <span>Move to Folder</span>
                      </span>
                      <span className="text-[10px] text-slate-400">▸</span>
                    </button>

                    {folderMenuOpen && (
                      <div className="bg-slate-50 dark:bg-slate-800/80 py-1 border-y border-slate-200 dark:border-slate-700">
                        <button
                          onClick={() => {
                            onMoveFolder(account.id, 'none');
                            setMenuOpen(false);
                            setFolderMenuOpen(false);
                          }}
                          className={`w-full px-4 py-1.5 text-left text-xs ${
                            account.folderId === 'none'
                              ? 'text-blue-600 font-semibold'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                          }`}
                        >
                          No Folder (Uncategorized)
                        </button>
                        {folders.map((f) => (
                          <button
                            key={f.id}
                            onClick={() => {
                              onMoveFolder(account.id, f.id);
                              setMenuOpen(false);
                              setFolderMenuOpen(false);
                            }}
                            className={`w-full px-4 py-1.5 text-left text-xs truncate ${
                              account.folderId === f.id
                                ? 'text-blue-600 font-semibold'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                            }`}
                          >
                            📁 {f.name}
                          </button>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onEdit(account);
                      }}
                      className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Details</span>
                    </button>

                    <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onDelete(account.id);
                      }}
                      className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Account</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Folder badge & metadata clean text */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${folderColor.dotColor}`} />
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {folder ? folder.name : 'Uncategorized'}
            </span>
          </div>

          {account.tags && account.tags.length > 0 && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-[11px] text-slate-400">
                {account.tags.map((t) => `#${t}`).join(' ')}
              </span>
            </>
          )}

          {account.period !== 30 && (
            <>
              <span aria-hidden="true">·</span>
              <span>{account.period}s</span>
            </>
          )}

          {account.algorithm !== 'SHA1' && (
            <>
              <span aria-hidden="true">·</span>
              <span>{account.algorithm}</span>
            </>
          )}
        </div>
      </div>

      {/* Code Display & Countdown Ring */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span
              className={`font-mono text-2xl font-bold tracking-wider tabular-nums ${
                copied
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-900 dark:text-slate-100'
              }`}
            >
              {isVisible ? currentCode : '••••••'}
            </span>

            {/* Shoulder surfing peek button */}
            {hideCodes && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCodeOverride(!showCodeOverride);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                title={isVisible ? 'Hide code' : 'Reveal code'}
              >
                {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>

          {/* Right side: Countdown Timer or HOTP counter */}
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {account.type === 'hotp' ? (
              <button
                onClick={() => onIncrementHotp && onIncrementHotp(account.id)}
                className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors"
                title="Next HOTP code"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            ) : (
              <div className="relative w-8 h-8 flex items-center justify-center">
                <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
                  <circle
                    cx="16"
                    cy="16"
                    r={radius}
                    className="stroke-slate-100 dark:stroke-slate-800 fill-none"
                    strokeWidth="2.5"
                  />
                  <circle
                    cx="16"
                    cy="16"
                    r={radius}
                    fill="none"
                    stroke={timerStroke}
                    strokeWidth="2.5"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>
                <span
                  className={`absolute font-mono text-[10px] font-semibold tabular-nums ${
                    remainingSeconds <= 5
                      ? 'text-red-500 font-bold'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {remainingSeconds}
                </span>
              </div>
            )}

            {/* Copy button */}
            <button
              onClick={handleCopy}
              className={`p-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                copied
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40 dark:hover:text-blue-400'
              }`}
              title="Click card or button to copy code"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-[11px] font-semibold">Copied!</span>
                </>
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Footer next code preview */}
        {codeInfo?.nextCode && !hideCodes && remainingSeconds <= 12 && (
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Next code in {remainingSeconds}s:</span>
            <span className="font-mono text-slate-500">{codeInfo.nextCode}</span>
          </div>
        )}
      </div>
    </div>
  );
};
