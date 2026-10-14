import React from 'react';
import { Plus, ShieldCheck, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  onAddCodeClick: () => void;
  onOpenExportModal: () => void;
  onOpenSecurityModal: () => void;
  onViewAllCodes: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onAddCodeClick,
  onOpenExportModal,
  onOpenSecurityModal,
  onViewAllCodes,
  darkMode,
  onToggleDarkMode,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs sticky top-0 z-30">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onViewAllCodes();
          }}
          className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span>VaultOTP</span>
        </a>
        <span className="hidden sm:inline-block text-xs text-slate-400 dark:text-slate-500 font-medium border-l border-slate-200 dark:border-slate-800 pl-3">
          Organized 2FA Vault
        </span>
      </div>

      {/* Zone 2: 4-5 clean single-line nav links */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600 dark:text-slate-400">
        <button
          onClick={onViewAllCodes}
          className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Tokens
        </button>
        <button
          onClick={onViewAllCodes}
          className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Folders
        </button>
        <button
          onClick={onOpenExportModal}
          className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Backups & Export
        </button>
        <button
          onClick={onOpenSecurityModal}
          className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Security PIN
        </button>
      </nav>

      {/* Zone 3: 1 primary action (+ Theme toggle) */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onToggleDarkMode}
          className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <button
          onClick={onAddCodeClick}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add 2FA Code</span>
        </button>
      </div>
    </header>
  );
};
