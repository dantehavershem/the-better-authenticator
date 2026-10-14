import React from 'react';
import {
  Folder as FolderIcon,
  Plus,
  Star,
  Layers,
  Inbox,
  Shield,
  Lock,
  Unlock,
  Settings,
  Download,
  Tag,
  Edit2,
  ChevronRight,
} from 'lucide-react';
import { Folder, AccountOtp } from '../types/auth';
import { FOLDER_ICONS, getFolderColor } from '../utils/serviceIcons';

interface SidebarProps {
  folders: Folder[];
  accounts: AccountOtp[];
  activeFolderId: string;
  selectedTag: string | null;
  onSelectFolder: (folderId: string) => void;
  onSelectTag: (tag: string | null) => void;
  onCreateFolder: () => void;
  onEditFolder: (folder: Folder) => void;
  onOpenExportModal: () => void;
  onToggleLock: () => void;
  isLocked: boolean;
  hasPin: boolean;
  onSetupPin: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  folders,
  accounts,
  activeFolderId,
  selectedTag,
  onSelectFolder,
  onSelectTag,
  onCreateFolder,
  onEditFolder,
  onOpenExportModal,
  onToggleLock,
  isLocked,
  hasPin,
  onSetupPin,
}) => {
  // Counts
  const totalCount = accounts.length;
  const pinnedCount = accounts.filter((a) => a.isPinned).length;
  const uncategorizedCount = accounts.filter((a) => !a.folderId || a.folderId === 'none').length;

  // Folder counts
  const folderCounts: Record<string, number> = {};
  accounts.forEach((acc) => {
    if (acc.folderId && acc.folderId !== 'none') {
      folderCounts[acc.folderId] = (folderCounts[acc.folderId] || 0) + 1;
    }
  });

  // Extract all unique tags
  const tagCounts: Record<string, number> = {};
  accounts.forEach((acc) => {
    (acc.tags || []).forEach((t) => {
      tagCounts[t] = (tagCounts[t] || 0) + 1;
    });
  });
  const tagsList = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex flex-col justify-between h-[calc(100vh-65px)] overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* Navigation Quick Filters */}
        <div className="space-y-1">
          <div className="px-2 pb-1.5 text-[11px] font-semibold text-slate-400 tracking-wider">
            VIEWS
          </div>

          <button
            onClick={() => {
              onSelectFolder('all');
              onSelectTag(null);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeFolderId === 'all' && selectedTag === null
                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-blue-500" />
              <span>All 2FA Codes</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 tabular-nums">{totalCount}</span>
          </button>

          <button
            onClick={() => {
              onSelectFolder('pinned');
              onSelectTag(null);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeFolderId === 'pinned' && selectedTag === null
                ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 font-semibold'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500/20" />
              <span>Favorites</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 tabular-nums">{pinnedCount}</span>
          </button>

          <button
            onClick={() => {
              onSelectFolder('uncategorized');
              onSelectTag(null);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeFolderId === 'uncategorized' && selectedTag === null
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Inbox className="w-4 h-4 text-slate-400" />
              <span>Uncategorized</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 tabular-nums">
              {uncategorizedCount}
            </span>
          </button>
        </div>

        {/* Folders Section - Core Value Proposition */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-2 pb-1.5">
            <span className="text-[11px] font-semibold text-slate-400 tracking-wider">
              FOLDERS & CATEGORIES
            </span>
            <button
              onClick={onCreateFolder}
              className="text-[11px] text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium flex items-center gap-1 cursor-pointer"
              title="Create new folder"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
          </div>

          {folders.length === 0 ? (
            <div className="px-3 py-4 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
              <p className="text-xs text-slate-400 mb-2">No folders yet</p>
              <button
                onClick={onCreateFolder}
                className="text-xs text-blue-600 font-medium hover:underline"
              >
                + Create first folder
              </button>
            </div>
          ) : (
            folders.map((folder) => {
              const IconComp = FOLDER_ICONS[folder.icon] || FolderIcon;
              const colorOpt = getFolderColor(folder.color);
              const count = folderCounts[folder.id] || 0;
              const isActive = activeFolderId === folder.id && selectedTag === null;

              return (
                <div
                  key={folder.id}
                  className={`group flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                    isActive
                      ? `${colorOpt.badgeBg} ${colorOpt.textColor} font-semibold`
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                  onClick={() => {
                    onSelectFolder(folder.id);
                    onSelectTag(null);
                  }}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${colorOpt.dotColor}`} />
                    <IconComp className="w-3.5 h-3.5 shrink-0 opacity-80" />
                    <span className="truncate">{folder.name}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditFolder(folder);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-opacity"
                      title="Edit folder"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                      {count}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Tags / Multi-dimensional Categories */}
        {tagsList.length > 0 && (
          <div className="space-y-2">
            <div className="px-2 text-[11px] font-semibold text-slate-400 tracking-wider">
              TAGS
            </div>
            <div className="flex flex-wrap gap-1 px-2">
              {tagsList.map(([tag, count]) => {
                const isSelected = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => {
                      if (isSelected) {
                        onSelectTag(null);
                      } else {
                        onSelectTag(tag);
                      }
                    }}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white font-medium'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>#{tag}</span>
                    <span className="text-[10px] opacity-70">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Sidebar Footer: Vault Security & Backup */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
        <button
          onClick={onOpenExportModal}
          className="w-full flex items-center justify-between px-3 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            <span>Backup & Export</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {hasPin ? (
          <button
            onClick={onToggleLock}
            className="w-full flex items-center justify-between px-3 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-500" />
              <span>Lock Vault Now</span>
            </div>
            <span className="text-[10px] bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
              Protected
            </span>
          </button>
        ) : (
          <button
            onClick={onSetupPin}
            className="w-full flex items-center justify-between px-3 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-500" />
              <span>Set Master PIN</span>
            </div>
            <span className="text-[10px] text-blue-500 font-medium">Setup</span>
          </button>
        )}
      </div>
    </aside>
  );
};
