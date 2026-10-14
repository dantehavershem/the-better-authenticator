import React, { useState } from 'react';
import { FolderInput, Trash2, X, Tag } from 'lucide-react';
import { Folder } from '../types/auth';

interface BatchBarProps {
  selectedCount: number;
  folders: Folder[];
  onMoveToFolder: (folderId: string) => void;
  onAddTag: (tag: string) => void;
  onDeleteSelected: () => void;
  onClearSelection: () => void;
}

export const BatchBar: React.FC<BatchBarProps> = ({
  selectedCount,
  folders,
  onMoveToFolder,
  onAddTag,
  onDeleteSelected,
  onClearSelection,
}) => {
  const [folderDropdownOpen, setFolderDropdownOpen] = useState(false);
  const [tagInputOpen, setTagInputOpen] = useState(false);
  const [tagValue, setTagValue] = useState('');

  if (selectedCount === 0) return null;

  const handleTagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagValue.trim()) return;
    onAddTag(tagValue.trim());
    setTagValue('');
    setTagInputOpen(false);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 dark:bg-slate-800 text-white px-5 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-4 text-xs">
      <span className="font-semibold text-slate-200 whitespace-nowrap">
        {selectedCount} {selectedCount === 1 ? 'account' : 'accounts'} selected
      </span>

      <div className="h-4 w-px bg-slate-700" />

      {/* Move to folder */}
      <div className="relative">
        <button
          onClick={() => {
            setFolderDropdownOpen(!folderDropdownOpen);
            setTagInputOpen(false);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors text-slate-200"
        >
          <FolderInput className="w-3.5 h-3.5 text-blue-400" />
          <span>Move to Folder</span>
        </button>

        {folderDropdownOpen && (
          <div className="absolute bottom-full mb-2 left-0 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl py-1 z-50 text-slate-900 dark:text-slate-100">
            <button
              onClick={() => {
                onMoveToFolder('none');
                setFolderDropdownOpen(false);
              }}
              className="w-full px-3 py-1.5 text-left hover:bg-slate-100 dark:hover:bg-slate-800 text-xs"
            >
              Uncategorized (No Folder)
            </button>
            {folders.map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  onMoveToFolder(f.id);
                  setFolderDropdownOpen(false);
                }}
                className="w-full px-3 py-1.5 text-left hover:bg-slate-100 dark:hover:bg-slate-800 text-xs truncate"
              >
                📁 {f.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Add tag */}
      <div className="relative">
        <button
          onClick={() => {
            setTagInputOpen(!tagInputOpen);
            setFolderDropdownOpen(false);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors text-slate-200"
        >
          <Tag className="w-3.5 h-3.5 text-emerald-400" />
          <span>Add Tag</span>
        </button>

        {tagInputOpen && (
          <form
            onSubmit={handleTagSubmit}
            className="absolute bottom-full mb-2 left-0 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl p-2 z-50 text-slate-900 dark:text-slate-100 flex gap-1"
          >
            <input
              type="text"
              autoFocus
              placeholder="Tag name (e.g. prod)"
              value={tagValue}
              onChange={(e) => setTagValue(e.target.value)}
              className="flex-1 px-2 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-2 py-1 bg-blue-600 text-white text-xs rounded-md font-medium"
            >
              Add
            </button>
          </form>
        )}
      </div>

      {/* Delete selected */}
      <button
        onClick={onDeleteSelected}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-200 transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5" />
        <span>Delete</span>
      </button>

      <div className="h-4 w-px bg-slate-700" />

      {/* Close/clear */}
      <button
        onClick={onClearSelection}
        className="p-1 text-slate-400 hover:text-slate-200 rounded-md transition-colors"
        title="Clear selection"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
