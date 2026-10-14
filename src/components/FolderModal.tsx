import React, { useState } from 'react';
import { X, Folder as FolderIcon, Trash2 } from 'lucide-react';
import { Folder } from '../types/auth';
import { FOLDER_COLORS, FOLDER_ICONS, getFolderColor } from '../utils/serviceIcons';

interface FolderModalProps {
  initialFolder?: Folder | null;
  onClose: () => void;
  onSave: (folderData: { name: string; color: string; icon: string; description?: string }) => void;
  onDelete?: (folderId: string) => void;
}

export const FolderModal: React.FC<FolderModalProps> = ({
  initialFolder,
  onClose,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState(initialFolder?.name || '');
  const [color, setColor] = useState(initialFolder?.color || 'blue');
  const [icon, setIcon] = useState(initialFolder?.icon || 'Folder');
  const [description, setDescription] = useState(initialFolder?.description || '');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      color,
      icon,
      description: description.trim() || undefined,
    });
    onClose();
  };

  const selectedColorOption = getFolderColor(color);
  const CurrentIconComp = FOLDER_ICONS[icon] || FolderIcon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-6 text-slate-900 dark:text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${selectedColorOption.badgeBg}`}>
              <CurrentIconComp className={`w-5 h-5 ${selectedColorOption.textColor}`} />
            </div>
            <div>
              <h3 className="font-semibold text-base">
                {initialFolder ? 'Edit Folder' : 'Create New Folder'}
              </h3>
              <p className="text-xs text-slate-500">Organize your 2FA accounts into categories</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Folder Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Work, Crypto & Finance, Personal"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Description (optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Production servers, client accounts"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Color selector */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
              Color Tag
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {FOLDER_COLORS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColor(c.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border transition-all ${
                    color === c.id
                      ? `${c.badgeBg} ${c.borderColor} ${c.textColor} font-semibold ring-2 ring-blue-500/30`
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${c.dotColor}`} />
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Icon selector */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
              Folder Icon
            </label>
            <div className="grid grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1 border border-slate-200 dark:border-slate-800 rounded-lg">
              {Object.keys(FOLDER_ICONS).map((iconKey) => {
                const IconComponent = FOLDER_ICONS[iconKey];
                const isSelected = icon === iconKey;
                return (
                  <button
                    key={iconKey}
                    type="button"
                    onClick={() => setIcon(iconKey)}
                    className={`p-2 flex flex-col items-center justify-center rounded-lg border transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                    title={iconKey}
                  >
                    <IconComponent className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            {initialFolder && onDelete ? (
              confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-red-500">Delete this folder?</span>
                  <button
                    type="button"
                    onClick={() => {
                      onDelete(initialFolder.id);
                      onClose();
                    }}
                    className="px-2 py-1 text-xs text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                  >
                    Yes, Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="px-2 py-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 hover:underline"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Folder</span>
                </button>
              )
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
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
                {initialFolder ? 'Update Folder' : 'Create Folder'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
