import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  LayoutGrid,
  List,
  Eye,
  EyeOff,
  Folder as FolderIcon,
  Plus,
  ArrowUpDown,
  X,
  Edit2,
  Trash2,
  Sparkles,
  Shield,
  Layers,
  Inbox,
  Star,
  CheckCircle2,
} from 'lucide-react';
import { Folder, AccountOtp, VaultSettings, GeneratedCode, ViewMode, SortOption } from './types/auth';
import {
  loadFolders,
  saveFolders,
  loadAccounts,
  saveAccounts,
  loadSettings,
  saveSettings,
  INITIAL_FOLDERS,
  INITIAL_ACCOUNTS,
} from './utils/storage';
import { getTotpCode } from './utils/totp';
import { FOLDER_ICONS, getFolderColor } from './utils/serviceIcons';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { OtpCard } from './components/OtpCard';
import { OtpRow } from './components/OtpRow';
import { AddAccountModal } from './components/AddAccountModal';
import { EditAccountModal } from './components/EditAccountModal';
import { FolderModal } from './components/FolderModal';
import { QrViewerModal } from './components/QrViewerModal';
import { ExportImportModal } from './components/ExportImportModal';
import { BatchBar } from './components/BatchBar';
import { PinLockModal } from './components/PinLockModal';

export default function App() {
  // Primary state
  const [folders, setFolders] = useState<Folder[]>(() => loadFolders());
  const [accounts, setAccounts] = useState<AccountOtp[]>(() => loadAccounts());
  const [settings, setSettings] = useState<VaultSettings>(() => loadSettings());
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Active view filters
  const [activeFolderId, setActiveFolderId] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Codes computation map
  const [codesMap, setCodesMap] = useState<Record<string, GeneratedCode>>({});

  // Batch selection
  const [selectedAccountIds, setSelectedAccountIds] = useState<Set<string>>(new Set());

  // Modals state
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountOtp | null>(null);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [qrViewerAccount, setQrViewerAccount] = useState<AccountOtp | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [pinModalMode, setPinModalMode] = useState<'unlock' | 'setup' | 'disable' | null>(null);

  // Toast notice
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // Sync settings & storage
  useEffect(() => {
    saveFolders(folders);
  }, [folders]);

  useEffect(() => {
    saveAccounts(accounts);
  }, [accounts]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Handle dark mode class on document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Periodic TOTP generation (updates every second)
  const refreshAllCodes = useCallback(async () => {
    const now = Date.now();
    const newMap: Record<string, GeneratedCode> = {};

    await Promise.all(
      accounts.map(async (acc) => {
        try {
          const res = await getTotpCode(acc, now);
          newMap[acc.id] = res;
        } catch (e) {
          console.error(`Error calculating OTP for ${acc.issuer}:`, e);
        }
      })
    );

    setCodesMap(newMap);
  }, [accounts]);

  useEffect(() => {
    refreshAllCodes();
    const interval = setInterval(refreshAllCodes, 1000);
    return () => clearInterval(interval);
  }, [refreshAllCodes]);

  // Global keyboard shortcuts (Cmd+K / '/' for search, Esc to clear)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('search-input');
        searchInput?.focus();
      }
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        const searchInput = document.getElementById('search-input');
        searchInput?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter accounts
  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      // Folder filter
      if (activeFolderId === 'pinned') {
        if (!acc.isPinned) return false;
      } else if (activeFolderId === 'uncategorized') {
        if (acc.folderId && acc.folderId !== 'none') return false;
      } else if (activeFolderId !== 'all') {
        if (acc.folderId !== activeFolderId) return false;
      }

      // Tag filter
      if (selectedTag) {
        if (!acc.tags || !acc.tags.includes(selectedTag)) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const folderName = folders.find((f) => f.id === acc.folderId)?.name.toLowerCase() || '';
        const matchIssuer = acc.issuer.toLowerCase().includes(query);
        const matchAccount = acc.accountName.toLowerCase().includes(query);
        const matchFolder = folderName.includes(query);
        const matchTags = (acc.tags || []).some((t) => t.toLowerCase().includes(query));
        const matchNotes = (acc.notes || '').toLowerCase().includes(query);

        if (!matchIssuer && !matchAccount && !matchFolder && !matchTags && !matchNotes) {
          return false;
        }
      }

      return true;
    });
  }, [accounts, activeFolderId, selectedTag, searchQuery, folders]);

  // Sort accounts
  const sortedAccounts = useMemo(() => {
    return [...filteredAccounts].sort((a, b) => {
      // Pinned items always appear first if not in pinned view
      if (activeFolderId !== 'pinned' && a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1;
      }

      switch (settings.sortBy) {
        case 'issuer':
          return a.issuer.localeCompare(b.issuer);
        case 'account':
          return a.accountName.localeCompare(b.accountName);
        case 'mostUsed':
          return (b.usageCount || 0) - (a.usageCount || 0);
        case 'recentlyAdded':
          return b.createdAt - a.createdAt;
        case 'order':
        default:
          return 0;
      }
    });
  }, [filteredAccounts, settings.sortBy, activeFolderId]);

  // Actions
  const handleCopyCode = (account: AccountOtp, code: string) => {
    // Record usage
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === account.id
          ? {
              ...acc,
              usageCount: (acc.usageCount || 0) + 1,
              lastUsedAt: Date.now(),
            }
          : acc
      )
    );
    showToast(`Copied ${account.issuer} 2FA code`);
  };

  const handleTogglePin = (id: string) => {
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === id ? { ...acc, isPinned: !acc.isPinned } : acc))
    );
  };

  const handleDeleteAccount = (id: string) => {
    setAccounts((prev) => prev.filter((acc) => acc.id !== id));
    setSelectedAccountIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    showToast('2FA account removed');
  };

  const handleMoveAccountFolder = (id: string, folderId: string) => {
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === id ? { ...acc, folderId } : acc))
    );
    const targetFolder = folders.find((f) => f.id === folderId);
    showToast(targetFolder ? `Moved to ${targetFolder.name}` : 'Moved to Uncategorized');
  };

  const handleIncrementHotp = (id: string) => {
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === id ? { ...acc, counter: (acc.counter || 0) + 1 } : acc
      )
    );
  };

  const handleSaveNewAccount = (
    accountData: Omit<AccountOtp, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>
  ) => {
    const newAccount: AccountOtp = {
      ...accountData,
      id: `acc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      usageCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setAccounts((prev) => [newAccount, ...prev]);
    showToast(`Added ${newAccount.issuer} to ${folders.find(f => f.id === newAccount.folderId)?.name || 'vault'}`);
  };

  const handleUpdateAccount = (updated: AccountOtp) => {
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === updated.id ? updated : acc))
    );
    showToast(`Updated ${updated.issuer}`);
  };

  // Folder actions
  const handleSaveFolder = (data: {
    name: string;
    color: string;
    icon: string;
    description?: string;
  }) => {
    if (editingFolder) {
      // Update existing
      setFolders((prev) =>
        prev.map((f) => (f.id === editingFolder.id ? { ...f, ...data } : f))
      );
      showToast(`Updated folder "${data.name}"`);
    } else {
      // Create new
      const newFolder: Folder = {
        id: `f-${Date.now()}`,
        name: data.name,
        color: data.color,
        icon: data.icon,
        description: data.description,
        order: folders.length,
        createdAt: Date.now(),
      };
      setFolders((prev) => [...prev, newFolder]);
      setActiveFolderId(newFolder.id);
      showToast(`Created folder "${newFolder.name}"`);
    }
    setEditingFolder(null);
  };

  const handleDeleteFolder = (folderId: string) => {
    setFolders((prev) => prev.filter((f) => f.id !== folderId));
    // Move accounts in this folder to 'none'
    setAccounts((prev) =>
      prev.map((acc) => (acc.folderId === folderId ? { ...acc, folderId: 'none' } : acc))
    );
    if (activeFolderId === folderId) {
      setActiveFolderId('all');
    }
    showToast('Folder deleted (accounts preserved in Uncategorized)');
  };

  // Batch actions
  const handleSelectAccount = (id: string, selected: boolean) => {
    setSelectedAccountIds((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const handleBatchMoveToFolder = (folderId: string) => {
    setAccounts((prev) =>
      prev.map((acc) =>
        selectedAccountIds.has(acc.id) ? { ...acc, folderId } : acc
      )
    );
    const target = folders.find((f) => f.id === folderId);
    showToast(`Moved ${selectedAccountIds.size} accounts to ${target ? target.name : 'Uncategorized'}`);
    setSelectedAccountIds(new Set());
  };

  const handleBatchAddTag = (tag: string) => {
    const cleanTag = tag.toLowerCase().trim().replace(/^#/, '');
    setAccounts((prev) =>
      prev.map((acc) => {
        if (selectedAccountIds.has(acc.id)) {
          const currentTags = acc.tags || [];
          if (!currentTags.includes(cleanTag)) {
            return { ...acc, tags: [...currentTags, cleanTag] };
          }
        }
        return acc;
      })
    );
    showToast(`Added tag #${cleanTag} to ${selectedAccountIds.size} accounts`);
    setSelectedAccountIds(new Set());
  };

  const handleBatchDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedAccountIds.size} accounts?`)) {
      setAccounts((prev) => prev.filter((acc) => !selectedAccountIds.has(acc.id)));
      showToast(`Deleted ${selectedAccountIds.size} accounts`);
      setSelectedAccountIds(new Set());
    }
  };

  // Backup & Import
  const handleImportBackup = (
    importedFolders: Folder[],
    importedAccounts: AccountOtp[],
    mode: 'merge' | 'replace'
  ) => {
    if (mode === 'replace') {
      setFolders(importedFolders);
      setAccounts(importedAccounts);
    } else {
      // Merge folders
      const existingFolderIds = new Set(folders.map((f) => f.id));
      const newFolders = [...folders];
      importedFolders.forEach((f) => {
        if (!existingFolderIds.has(f.id)) {
          newFolders.push(f);
        }
      });
      setFolders(newFolders);

      // Merge accounts
      const existingAccountSecrets = new Set(accounts.map((a) => a.secret));
      const newAccounts = [...accounts];
      importedAccounts.forEach((acc) => {
        if (!existingAccountSecrets.has(acc.secret)) {
          newAccounts.push(acc);
        }
      });
      setAccounts(newAccounts);
    }
    showToast('Backup restored successfully!');
  };

  const handleResetDemoData = () => {
    setFolders(INITIAL_FOLDERS);
    setAccounts(INITIAL_ACCOUNTS);
    setActiveFolderId('all');
    setSelectedTag(null);
    showToast('Vault restored to organized demo categories!');
  };

  // Active folder details for Hero area
  const currentActiveFolder = useMemo(() => {
    if (activeFolderId === 'all') {
      return {
        title: 'All Two-Factor Codes',
        description: 'Complete unified view of all authentication tokens across all folders and services.',
        icon: 'Layers',
        color: 'blue',
      };
    }
    if (activeFolderId === 'pinned') {
      return {
        title: 'Favorite & Pinned Codes',
        description: 'Frequently accessed authenticators kept pinned for instant one-click access.',
        icon: 'Star',
        color: 'amber',
      };
    }
    if (activeFolderId === 'uncategorized') {
      return {
        title: 'Uncategorized Accounts',
        description: 'Tokens not yet assigned to any category. Click "Move to Folder" to organize them.',
        icon: 'Inbox',
        color: 'slate',
      };
    }
    const match = folders.find((f) => f.id === activeFolderId);
    return {
      title: match?.name || 'Folder',
      description: match?.description || 'Organized category collection of two-factor tokens.',
      icon: match?.icon || 'Folder',
      color: match?.color || 'blue',
      raw: match,
    };
  }, [activeFolderId, folders]);

  const activeColor = getFolderColor(currentActiveFolder.color);
  const ActiveIconComp = FOLDER_ICONS[currentActiveFolder.icon] || FolderIcon;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 flex items-center gap-2 bg-slate-900 dark:bg-slate-800 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs border border-slate-700 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar adhering to Top Bar Contract */}
      <Header
        onAddCodeClick={() => setIsAddAccountOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenSecurityModal={() => {
          if (settings.hasPin) {
            setPinModalMode('disable');
          } else {
            setPinModalMode('setup');
          }
        }}
        onViewAllCodes={() => {
          setActiveFolderId('all');
          setSelectedTag(null);
        }}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />

      {/* Main Workspace: Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          folders={folders}
          accounts={accounts}
          activeFolderId={activeFolderId}
          selectedTag={selectedTag}
          onSelectFolder={(id) => setActiveFolderId(id)}
          onSelectTag={(tag) => setSelectedTag(tag)}
          onCreateFolder={() => {
            setEditingFolder(null);
            setIsFolderModalOpen(true);
          }}
          onEditFolder={(folder) => {
            setEditingFolder(folder);
            setIsFolderModalOpen(true);
          }}
          onOpenExportModal={() => setIsExportModalOpen(true)}
          onToggleLock={() => {
            setSettings((prev) => ({ ...prev, isLocked: true }));
          }}
          isLocked={settings.isLocked}
          hasPin={settings.hasPin}
          onSetupPin={() => setPinModalMode('setup')}
        />

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto px-6 py-6 max-w-7xl">
          {/* Active Folder Banner / Context Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-start gap-3.5">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${activeColor.badgeBg}`}
              >
                <ActiveIconComp className={`w-6 h-6 ${activeColor.textColor}`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    {currentActiveFolder.title}
                  </h1>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                    {sortedAccounts.length}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                  {currentActiveFolder.description}
                </p>
              </div>
            </div>

            {/* Folder contextual actions */}
            <div className="flex items-center gap-2 self-start md:self-auto">
              {currentActiveFolder.raw && (
                <>
                  <button
                    onClick={() => {
                      setEditingFolder(currentActiveFolder.raw!);
                      setIsFolderModalOpen(true);
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Folder</span>
                  </button>

                  <button
                    onClick={() => handleDeleteFolder(currentActiveFolder.raw!.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors"
                    title="Delete folder"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}

              <button
                onClick={() => setIsAddAccountOpen(true)}
                className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Code</span>
              </button>
            </div>
          </div>

          {/* Active Tag filter indicator */}
          {selectedTag && (
            <div className="mb-4 flex items-center gap-2 text-xs">
              <span className="text-slate-500">Filtered by tag:</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-medium rounded-md">
                #{selectedTag}
                <button onClick={() => setSelectedTag(null)} className="hover:text-blue-800">
                  <X className="w-3 h-3" />
                </button>
              </span>
            </div>
          )}

          {/* Controls bar: Search, View Mode, Shoulder-Surfing, and Sort */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="search-input"
                type="text"
                placeholder="Search service, account, folder, or tag... (Press / to focus)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100 shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* View Mode & Preferences Controls */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              {/* Sort selector */}
              <div className="flex items-center gap-1 text-xs text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 shadow-xs">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={settings.sortBy}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, sortBy: e.target.value as SortOption }))
                  }
                  className="bg-transparent border-none text-xs text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value="order">Custom Order</option>
                  <option value="issuer">Service (A–Z)</option>
                  <option value="account">Account Name</option>
                  <option value="mostUsed">Most Used</option>
                  <option value="recentlyAdded">Recently Added</option>
                </select>
              </div>

              {/* Shoulder surfing toggle */}
              <button
                onClick={() =>
                  setSettings((prev) => ({
                    ...prev,
                    hideCodesByDefault: !prev.hideCodesByDefault,
                  }))
                }
                className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition-colors shadow-xs ${
                  settings.hideCodesByDefault
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
                title={
                  settings.hideCodesByDefault
                    ? 'Codes masked (shoulder-surfing protection active)'
                    : 'Mask codes to prevent shoulder-surfing'
                }
              >
                {settings.hideCodesByDefault ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>

              {/* Grid vs List toggle */}
              <div className="flex items-center p-0.5 bg-slate-200/60 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setSettings((prev) => ({ ...prev, viewMode: 'grid' }))}
                  className={`p-1.5 rounded-md transition-colors ${
                    settings.viewMode === 'grid'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                  title="Grid view"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSettings((prev) => ({ ...prev, viewMode: 'compact' }))}
                  className={`p-1.5 rounded-md transition-colors ${
                    settings.viewMode === 'compact'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                  title="Compact list view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Accounts Content: Grid or List */}
          {sortedAccounts.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white/40 dark:bg-slate-900/40">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 mb-1">
                {searchQuery ? 'No matching accounts found' : 'No accounts in this view'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
                {searchQuery
                  ? `No 2FA tokens matched "${searchQuery}". Check spelling or clear filters.`
                  : activeFolderId === 'pinned'
                  ? 'Click the star icon on any card to pin your most-used 2FA codes here.'
                  : 'Add your two-factor tokens to keep them safe and organized into custom categories.'}
              </p>
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Clear Search
                </button>
              ) : (
                <button
                  onClick={() => setIsAddAccountOpen(true)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
                >
                  + Add Two-Factor Code
                </button>
              )}
            </div>
          ) : settings.viewMode === 'grid' ? (
            /* Cards Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedAccounts.map((account) => {
                const folder = folders.find((f) => f.id === account.folderId) || null;
                const codeInfo = codesMap[account.id] || null;
                return (
                  <OtpCard
                    key={account.id}
                    account={account}
                    codeInfo={codeInfo}
                    folder={folder}
                    folders={folders}
                    hideCodes={settings.hideCodesByDefault}
                    onCopy={handleCopyCode}
                    onTogglePin={handleTogglePin}
                    onDelete={handleDeleteAccount}
                    onEdit={(acc) => setEditingAccount(acc)}
                    onViewQr={(acc) => setQrViewerAccount(acc)}
                    onMoveFolder={handleMoveAccountFolder}
                    onIncrementHotp={handleIncrementHotp}
                  />
                );
              })}
            </div>
          ) : (
            /* Compact List View */
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs divide-y divide-slate-100 dark:divide-slate-800">
              {sortedAccounts.map((account) => {
                const folder = folders.find((f) => f.id === account.folderId) || null;
                const codeInfo = codesMap[account.id] || null;
                return (
                  <OtpRow
                    key={account.id}
                    account={account}
                    codeInfo={codeInfo}
                    folder={folder}
                    folders={folders}
                    isSelected={selectedAccountIds.has(account.id)}
                    hideCodes={settings.hideCodesByDefault}
                    onSelect={handleSelectAccount}
                    onCopy={handleCopyCode}
                    onTogglePin={handleTogglePin}
                    onDelete={handleDeleteAccount}
                    onEdit={(acc) => setEditingAccount(acc)}
                    onViewQr={(acc) => setQrViewerAccount(acc)}
                    onMoveFolder={handleMoveAccountFolder}
                  />
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Floating Batch Bar for Multi-select */}
      <BatchBar
        selectedCount={selectedAccountIds.size}
        folders={folders}
        onMoveToFolder={handleBatchMoveToFolder}
        onAddTag={handleBatchAddTag}
        onDeleteSelected={handleBatchDelete}
        onClearSelection={() => setSelectedAccountIds(new Set())}
      />

      {/* Modals */}
      {isAddAccountOpen && (
        <AddAccountModal
          folders={folders}
          currentFolderId={activeFolderId}
          onClose={() => setIsAddAccountOpen(false)}
          onSave={handleSaveNewAccount}
          onCreateFolderClick={() => {
            setIsAddAccountOpen(false);
            setEditingFolder(null);
            setIsFolderModalOpen(true);
          }}
        />
      )}

      {editingAccount && (
        <EditAccountModal
          account={editingAccount}
          folders={folders}
          onClose={() => setEditingAccount(null)}
          onSave={handleUpdateAccount}
          onCreateFolderClick={() => {
            setEditingFolder(null);
            setIsFolderModalOpen(true);
          }}
        />
      )}

      {isFolderModalOpen && (
        <FolderModal
          initialFolder={editingFolder}
          onClose={() => {
            setIsFolderModalOpen(false);
            setEditingFolder(null);
          }}
          onSave={handleSaveFolder}
          onDelete={editingFolder ? handleDeleteFolder : undefined}
        />
      )}

      {qrViewerAccount && (
        <QrViewerModal
          account={qrViewerAccount}
          onClose={() => setQrViewerAccount(null)}
        />
      )}

      {isExportModalOpen && (
        <ExportImportModal
          folders={folders}
          accounts={accounts}
          onClose={() => setIsExportModalOpen(false)}
          onImportBackup={handleImportBackup}
          onResetDemoData={handleResetDemoData}
        />
      )}

      {/* Master PIN Unlock Screen (when locked) */}
      {settings.isLocked && settings.hasPin && (
        <PinLockModal
          mode="unlock"
          currentPinHash={settings.pinHash}
          onSuccess={() => {
            setSettings((prev) => ({ ...prev, isLocked: false }));
            showToast('Vault unlocked');
          }}
        />
      )}

      {/* Master PIN Setup / Disable Modal */}
      {pinModalMode && (
        <PinLockModal
          mode={pinModalMode}
          currentPinHash={settings.pinHash}
          onSuccess={(newHash) => {
            if (pinModalMode === 'setup' && newHash) {
              setSettings((prev) => ({ ...prev, hasPin: true, pinHash: newHash }));
              showToast('Security PIN enabled');
            } else if (pinModalMode === 'disable') {
              setSettings((prev) => ({ ...prev, hasPin: false, pinHash: undefined }));
              showToast('Security PIN disabled');
            }
            setPinModalMode(null);
          }}
          onClose={() => setPinModalMode(null)}
        />
      )}
    </div>
  );
}
