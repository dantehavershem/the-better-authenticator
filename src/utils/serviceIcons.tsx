import React from 'react';
import {
  Folder,
  Briefcase,
  Shield,
  Server,
  Wallet,
  Gamepad2,
  User,
  Globe,
  Key,
  Layers,
  Code2,
  Database,
  Cloud,
  Mail,
  Smartphone,
  Cpu,
  Lock,
  Terminal,
  Zap,
} from 'lucide-react';

export const FOLDER_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Briefcase,
  Shield,
  Server,
  Wallet,
  Gamepad2,
  User,
  Globe,
  Key,
  Layers,
  Code2,
  Database,
  Cloud,
  Mail,
  Smartphone,
  Cpu,
  Lock,
  Terminal,
  Zap,
  Folder,
};

export interface FolderColorOption {
  id: string;
  name: string;
  badgeBg: string;
  textColor: string;
  dotColor: string;
  borderColor: string;
  hoverBg: string;
}

export const FOLDER_COLORS: FolderColorOption[] = [
  {
    id: 'blue',
    name: 'Cobalt',
    badgeBg: 'bg-blue-500/10 dark:bg-blue-500/20',
    textColor: 'text-blue-600 dark:text-blue-400',
    dotColor: 'bg-blue-500',
    borderColor: 'border-blue-500/30',
    hoverBg: 'hover:bg-blue-50 dark:hover:bg-blue-950/30',
  },
  {
    id: 'emerald',
    name: 'Emerald',
    badgeBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    dotColor: 'bg-emerald-500',
    borderColor: 'border-emerald-500/30',
    hoverBg: 'hover:bg-emerald-50 dark:hover:bg-emerald-950/30',
  },
  {
    id: 'amber',
    name: 'Amber',
    badgeBg: 'bg-amber-500/10 dark:bg-amber-500/20',
    textColor: 'text-amber-600 dark:text-amber-400',
    dotColor: 'bg-amber-500',
    borderColor: 'border-amber-500/30',
    hoverBg: 'hover:bg-amber-50 dark:hover:bg-amber-950/30',
  },
  {
    id: 'violet',
    name: 'Violet',
    badgeBg: 'bg-violet-500/10 dark:bg-violet-500/20',
    textColor: 'text-violet-600 dark:text-violet-400',
    dotColor: 'bg-violet-500',
    borderColor: 'border-violet-500/30',
    hoverBg: 'hover:bg-violet-50 dark:hover:bg-violet-950/30',
  },
  {
    id: 'rose',
    name: 'Rose',
    badgeBg: 'bg-rose-500/10 dark:bg-rose-500/20',
    textColor: 'text-rose-600 dark:text-rose-400',
    dotColor: 'bg-rose-500',
    borderColor: 'border-rose-500/30',
    hoverBg: 'hover:bg-rose-50 dark:hover:bg-rose-950/30',
  },
  {
    id: 'cyan',
    name: 'Cyan',
    badgeBg: 'bg-cyan-500/10 dark:bg-cyan-500/20',
    textColor: 'text-cyan-600 dark:text-cyan-400',
    dotColor: 'bg-cyan-500',
    borderColor: 'border-cyan-500/30',
    hoverBg: 'hover:bg-cyan-50 dark:hover:bg-cyan-950/30',
  },
  {
    id: 'slate',
    name: 'Slate',
    badgeBg: 'bg-slate-500/10 dark:bg-slate-500/20',
    textColor: 'text-slate-600 dark:text-slate-400',
    dotColor: 'bg-slate-500',
    borderColor: 'border-slate-500/30',
    hoverBg: 'hover:bg-slate-50 dark:hover:bg-slate-800/40',
  },
];

export function getFolderColor(colorId: string): FolderColorOption {
  return FOLDER_COLORS.find((c) => c.id === colorId) || FOLDER_COLORS[0];
}

/**
 * Returns a styled monogram or brand hint for services
 */
export function getServiceTheme(issuer: string) {
  const norm = issuer.toLowerCase();

  if (norm.includes('google')) {
    return { bg: 'bg-blue-600 text-white', label: 'G', domain: 'Google' };
  }
  if (norm.includes('github')) {
    return { bg: 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900', label: 'GH', domain: 'GitHub' };
  }
  if (norm.includes('aws') || norm.includes('amazon')) {
    return { bg: 'bg-amber-600 text-white', label: 'AWS', domain: 'Amazon Web Services' };
  }
  if (norm.includes('microsoft') || norm.includes('azure') || norm.includes('office')) {
    return { bg: 'bg-sky-600 text-white', label: 'MS', domain: 'Microsoft' };
  }
  if (norm.includes('cloudflare')) {
    return { bg: 'bg-orange-500 text-white', label: 'CF', domain: 'Cloudflare' };
  }
  if (norm.includes('slack')) {
    return { bg: 'bg-purple-700 text-white', label: 'SL', domain: 'Slack' };
  }
  if (norm.includes('discord')) {
    return { bg: 'bg-indigo-600 text-white', label: 'DC', domain: 'Discord' };
  }
  if (norm.includes('stripe')) {
    return { bg: 'bg-indigo-700 text-white', label: 'ST', domain: 'Stripe' };
  }
  if (norm.includes('coinbase')) {
    return { bg: 'bg-blue-700 text-white', label: 'CB', domain: 'Coinbase' };
  }
  if (norm.includes('proton')) {
    return { bg: 'bg-violet-600 text-white', label: 'PM', domain: 'Proton' };
  }
  if (norm.includes('apple')) {
    return { bg: 'bg-neutral-800 text-white', label: 'AP', domain: 'Apple' };
  }
  if (norm.includes('gitlab')) {
    return { bg: 'bg-orange-600 text-white', label: 'GL', domain: 'GitLab' };
  }
  if (norm.includes('docker')) {
    return { bg: 'bg-blue-500 text-white', label: 'DK', domain: 'Docker' };
  }
  if (norm.includes('steam')) {
    return { bg: 'bg-slate-800 text-white', label: 'ST', domain: 'Steam' };
  }
  if (norm.includes('binance')) {
    return { bg: 'bg-yellow-500 text-slate-950 font-bold', label: 'BN', domain: 'Binance' };
  }
  if (norm.includes('kraken')) {
    return { bg: 'bg-purple-600 text-white', label: 'KR', domain: 'Kraken' };
  }

  // Fallback monogram
  const clean = issuer.trim();
  const label = clean.length > 2 ? clean.slice(0, 2).toUpperCase() : clean.toUpperCase() || '2F';
  return { bg: 'bg-slate-700 text-white dark:bg-slate-800', label, domain: issuer || 'Service' };
}
