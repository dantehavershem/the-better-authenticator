import React, { useState } from 'react';
import { X, Shield, Folder as FolderIcon, Plus } from 'lucide-react';
import { AccountOtp, Folder, OtpAlgorithm, OtpType } from '../types/auth';

interface EditAccountModalProps {
  account: AccountOtp;
  folders: Folder[];
  onClose: () => void;
  onSave: (updated: AccountOtp) => void;
  onCreateFolderClick: () => void;
}

export const EditAccountModal: React.FC<EditAccountModalProps> = ({
  account,
  folders,
  onClose,
  onSave,
  onCreateFolderClick,
}) => {
  const [issuer, setIssuer] = useState(account.issuer);
  const [accountName, setAccountName] = useState(account.accountName);
  const [secret, setSecret] = useState(account.secret);
  const [folderId, setFolderId] = useState(account.folderId || 'none');
  const [tagsInput, setTagsInput] = useState((account.tags || []).join(', '));
  const [notes, setNotes] = useState(account.notes || '');
  const [algorithm, setAlgorithm] = useState<OtpAlgorithm>(account.algorithm || 'SHA1');
  const [digits, setDigits] = useState<number>(account.digits || 6);
  const [period, setPeriod] = useState<number>(account.period || 30);
  const [type, setType] = useState<OtpType>(account.type || 'totp');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSecret = secret.toUpperCase().replace(/\s+/g, '');
    if (!cleanSecret) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase().replace(/^#/, ''))
      .filter(Boolean);

    onSave({
      ...account,
      issuer: issuer.trim() || 'Custom Service',
      accountName: accountName.trim() || 'user',
      secret: cleanSecret,
      folderId,
      tags,
      notes: notes.trim() || undefined,
      algorithm,
      digits,
      period,
      type,
      updatedAt: Date.now(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-6 text-slate-900 dark:text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-semibold text-base">Edit 2FA Account</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Service / Issuer
              </label>
              <input
                type="text"
                required
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Account / Username
              </label>
              <input
                type="text"
                required
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Secret Key (Base32)
            </label>
            <input
              type="text"
              required
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Folder dropdown */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FolderIcon className="w-3.5 h-3.5 text-blue-500" />
                <span>Folder / Category</span>
              </label>
              <button
                type="button"
                onClick={onCreateFolderClick}
                className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
              >
                <Plus className="w-3 h-3" />
                <span>New Folder</span>
              </button>
            </div>
            <select
              value={folderId}
              onChange={(e) => setFolderId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="none">Uncategorized (No Folder)</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  📁 {f.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Tags / Labels (comma-separated)
            </label>
            <input
              type="text"
              placeholder="e.g. work, critical, staging"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Recovery notes */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Recovery / Backup Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Parameters */}
          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div>
              <label className="text-[11px] text-slate-500 block mb-0.5">Algorithm</label>
              <select
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value as OtpAlgorithm)}
                className="w-full px-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md"
              >
                <option value="SHA1">SHA-1</option>
                <option value="SHA256">SHA-256</option>
                <option value="SHA512">SHA-512</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] text-slate-500 block mb-0.5">Digits</label>
              <select
                value={digits}
                onChange={(e) => setDigits(parseInt(e.target.value, 10))}
                className="w-full px-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md"
              >
                <option value={6}>6 Digits</option>
                <option value={8}>8 Digits</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] text-slate-500 block mb-0.5">Period</label>
              <select
                value={period}
                onChange={(e) => setPeriod(parseInt(e.target.value, 10))}
                className="w-full px-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md"
              >
                <option value={30}>30s</option>
                <option value={60}>60s</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
