export interface Folder {
  id: string;
  name: string;
  color: string;
  icon: string;
  description?: string;
  order: number;
  createdAt: number;
}

export type OtpAlgorithm = 'SHA1' | 'SHA256' | 'SHA512';
export type OtpType = 'totp' | 'hotp';

export interface AccountOtp {
  id: string;
  issuer: string;
  accountName: string;
  secret: string;
  algorithm: OtpAlgorithm;
  digits: number;
  period: number;
  type: OtpType;
  counter?: number;
  folderId: string; // 'none' or folder id
  tags: string[];
  notes?: string;
  isPinned: boolean;
  usageCount: number;
  lastUsedAt?: number;
  createdAt: number;
  updatedAt: number;
}

export type ViewMode = 'grid' | 'compact';
export type SortOption = 'order' | 'issuer' | 'account' | 'mostUsed' | 'recentlyAdded';

export interface VaultSettings {
  isLocked: boolean;
  hasPin: boolean;
  pinHash?: string;
  hideCodesByDefault: boolean;
  viewMode: ViewMode;
  sortBy: SortOption;
  autoLockMinutes: number;
}

export interface GeneratedCode {
  code: string;
  formattedCode: string;
  remainingSeconds: number;
  progressPercent: number; // 0 to 100
  period: number;
  nextCode?: string;
}
