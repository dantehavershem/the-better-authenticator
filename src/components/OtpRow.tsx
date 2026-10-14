import React, { useState } from 'react';
import {
  Copy,
  Check,
  Star,
  QrCode,
  Edit2,
  Trash2,
  MoreHorizontal,
  FolderInput,
} from 'lucide-react';
import { AccountOtp, Folder, GeneratedCode } from '../types/auth';
import { getServiceTheme, getFolderColor } from '../utils/serviceIcons';

interface OtpRowProps {
  account: AccountOtp;
  codeInfo: GeneratedCode | null;
  folder: Folder | null;
  folders: Folder[];
  isSelected: boolean;
  hideCodes: boolean;
  onSelect: (id: string, selected: boolean) => void;
  onCopy: (account: AccountOtp, code: string) => void;
  onTogglePin: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (account: AccountOtp) => void;
  onViewQr: (account: AccountOtp) => void;
  onMoveFolder: (id: string, folderId: string) => void;
}

export const OtpRow: React.FC<OtpRowProps> = ({
  account,
  codeInfo,
  folder,
  folders,
  isSelected,
  hideCodes,
  onSelect,
  onCopy,
  onTogglePin,
  onDelete,
  onEdit,
  onViewQr,
  onMoveFolder,
}) => {
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const brand = getServiceTheme(account.issuer);
  const folderColor = folder ? getFolderColor(folder.color) : getFolderColor('slate');

  const currentCode = codeInfo?.formattedCode || '--- ---';
  const remainingSeconds = codeInfo?.remainingSeconds ?? 30;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!codeInfo?.code) return;
    navigator.clipboard.writeText(codeInfo.code);
    setCopied(true);
    onCopy(account, codeInfo.code);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={handleCopy}
      className={`group flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer text-xs ${
        isSelected ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
      }`}
    >
      {/* Left: Checkbox + Brand Icon + Name + Folder */}
      <div className="flex items-center gap-3 min-w-0 flex-1 mr-4">
        <input
          type="checkbox"
          checked={isSelected}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onSelect(account.id, e.target.checked)}
          className="w-4 h-4 text-blue-600 rounded-xs border-slate-300 dark:border-slate-700"
        />

        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin(account.id);
          }}
          className={`p-1 rounded-md transition-colors ${
            account.isPinned
              ? 'text-amber-500 fill-current'
              : 'text-slate-300 dark:text-slate-600 hover:text-slate-400'
          }`}
          title={account.isPinned ? 'Remove favorite' : 'Pin favorite'}
        >
          <Star className={`w-3.5 h-3.5 ${account.isPinned ? 'fill-current' : ''}`} />
        </button>

        <div
          className={`w-7 h-7 rounded-md flex items-center justify-center font-bold text-[10px] shrink-0 ${brand.bg}`}
        >
          {brand.label}
        </div>

        <div className="min-w-0 max-w-xs">
          <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
            {account.issuer}
          </div>
          <div className="text-[11px] text-slate-500 truncate">{account.accountName}</div>
        </div>

        {/* Folder tag */}
        <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] bg-slate-100 dark:bg-slate-800">
          <span className={`w-1.5 h-1.5 rounded-full ${folderColor.dotColor}`} />
          <span className="text-slate-700 dark:text-slate-300">
            {folder ? folder.name : 'Uncategorized'}
          </span>
        </div>

        {/* Tags */}
        {account.tags && account.tags.length > 0 && (
          <div className="hidden lg:flex items-center gap-1 text-[11px] text-slate-400">
            <span>·</span>
            <span>{account.tags.slice(0, 2).map((t) => `#${t}`).join(' ')}</span>
          </div>
        )}
      </div>

      {/* Right: Tabular OTP Code + Mini timer + Copy Button + Options */}
      <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
        <div className="text-right">
          <div className="font-mono text-base font-bold tracking-wider tabular-nums text-slate-900 dark:text-slate-100">
            {hideCodes ? '••••••' : currentCode}
          </div>
        </div>

        {/* Mini timer countdown */}
        <div
          className={`w-5 text-center font-mono text-[11px] tabular-nums font-semibold ${
            remainingSeconds <= 5
              ? 'text-red-500 font-bold'
              : 'text-slate-400'
          }`}
          title={`${remainingSeconds}s remaining`}
        >
          {remainingSeconds}s
        </div>

        {/* Copy action */}
        <button
          onClick={handleCopy}
          className={`px-2.5 py-1.5 rounded-md font-medium text-xs flex items-center gap-1 transition-colors ${
            copied
              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
              : 'bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40 dark:hover:text-blue-400 text-slate-700 dark:text-slate-300'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>

        {/* Context options */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl py-1 z-30 text-xs">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onViewQr(account);
                  }}
                  className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>View QR / Export</span>
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit(account);
                  }}
                  className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
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
                  className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
