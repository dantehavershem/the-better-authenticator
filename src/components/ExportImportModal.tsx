import React, { useState, useRef } from 'react';
import {
  X,
  Download,
  Upload,
  FileText,
  AlertTriangle,
  Check,
  RotateCcw,
} from 'lucide-react';
import { AccountOtp, Folder } from '../types/auth';
import { generateOtpAuthUri } from '../utils/totp';
import { INITIAL_ACCOUNTS, INITIAL_FOLDERS } from '../utils/storage';

interface ExportImportModalProps {
  folders: Folder[];
  accounts: AccountOtp[];
  onClose: () => void;
  onImportBackup: (folders: Folder[], accounts: AccountOtp[], mode: 'merge' | 'replace') => void;
  onResetDemoData: () => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  folders,
  accounts,
  onClose,
  onImportBackup,
  onResetDemoData,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'reset'>('export');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export JSON backup file
  const handleExportJson = () => {
    const backupData = {
      app: 'VaultOTP',
      version: 1,
      exportedAt: new Date().toISOString(),
      folders,
      accounts,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `VaultOTP_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export URI list text file
  const handleExportUriList = () => {
    const lines = accounts.map((acc) => generateOtpAuthUri(acc)).join('\n');
    const blob = new Blob([lines], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `VaultOTP_URIs_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle Import JSON file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportStatus(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const data = JSON.parse(text);

        if (!data || !Array.isArray(data.accounts)) {
          throw new Error('Invalid backup file. Missing accounts array.');
        }

        const importedFolders: Folder[] = Array.isArray(data.folders) ? data.folders : [];
        const importedAccounts: AccountOtp[] = data.accounts;

        onImportBackup(importedFolders, importedAccounts, importMode);
        setImportStatus(
          `Successfully imported ${importedAccounts.length} accounts and ${importedFolders.length} folders!`
        );
      } catch (err: any) {
        setImportError(err.message || 'Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-6 text-slate-900 dark:text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-semibold text-base">Vault Backup & Data Transfer</h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg my-4 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`py-1.5 rounded-md transition-colors ${
              activeTab === 'export'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Export Backup
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('import')}
            className={`py-1.5 rounded-md transition-colors ${
              activeTab === 'import'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Import Backup
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reset')}
            className={`py-1.5 rounded-md transition-colors ${
              activeTab === 'reset'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Reset Data
          </button>
        </div>

        {activeTab === 'export' && (
          <div className="space-y-3 py-2 text-xs">
            <p className="text-slate-600 dark:text-slate-400">
              Download your 2FA credentials with folder groupings and categories. You can transfer this backup to another browser or device.
            </p>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">
                    Full JSON Vault Archive
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Includes {folders.length} folders, {accounts.length} accounts, tags & notes
                  </div>
                </div>
                <button
                  onClick={handleExportJson}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">
                    Standard OTP Auth URIs (.txt)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Universal text list of otpauth:// links
                  </div>
                </div>
                <button
                  onClick={handleExportUriList}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-lg font-medium flex items-center gap-1.5 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'import' && (
          <div className="space-y-4 py-2 text-xs">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="importMode"
                  checked={importMode === 'merge'}
                  onChange={() => setImportMode('merge')}
                  className="text-blue-600"
                />
                <span className="text-slate-700 dark:text-slate-300">Merge with existing</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="importMode"
                  checked={importMode === 'replace'}
                  onChange={() => setImportMode('replace')}
                  className="text-blue-600"
                />
                <span className="text-slate-700 dark:text-slate-300">Replace entire vault</span>
              </label>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-8 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl hover:border-blue-500 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 text-center cursor-pointer transition-all"
            >
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <div className="font-semibold text-slate-800 dark:text-slate-200">
                Click to upload JSON backup
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Accepts VaultOTP backup files (.json)
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".json"
                className="hidden"
              />
            </div>

            {importStatus && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-lg text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{importStatus}</span>
              </div>
            )}

            {importError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{importError}</span>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reset' && (
          <div className="space-y-4 py-2 text-xs">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg text-amber-700 dark:text-amber-400 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Reset to Organized Demo Data?</p>
                <p className="text-[11px] mt-0.5">
                  This will reload the initial folders (Work, Cloud Infra, Personal & Finance, Gaming) with realistic 2FA tokens so you can test and explore folder categorization.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                onResetDemoData();
                onClose();
              }}
              className="w-full py-2 px-4 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset to Sample Folders & Accounts</span>
            </button>
          </div>
        )}

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
