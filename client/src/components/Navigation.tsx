import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Compass, 
  Gem, 
  Flame, 
  Layers, 
  CalendarClock, 
  Swords, 
  Tv, 
  BookmarkCheck, 
  Sliders, 
  Settings as SettingsIcon, 
  Sun, 
  Moon, 
  Activity,
  Zap,
  BarChart2,
  Target,
  Server
} from 'lucide-react';
import { fetchQuotaStatus } from '../lib/api';
import { QuotaStatus } from '../lib/types';

interface Props {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenWizard: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Navigation: React.FC<Props> = ({
  currentTab,
  onSelectTab,
  onOpenWizard,
  isDark,
  onToggleTheme
}) => {
  const [quota, setQuota] = useState<QuotaStatus | null>(null);

  useEffect(() => {
    fetchQuotaStatus().then(res => {
      if (res.success && res.status) {
        setQuota(res.status);
      }
    }).catch(() => {});
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'discover', label: 'Discover & Search', icon: Compass },
    { id: 'hidden-gems', label: 'Hidden Gems', icon: Gem },
    { id: 'outliers', label: 'Outlier Explorer', icon: Flame },
    { id: 'content-gaps', label: 'Content Gaps', icon: Layers },
    { id: 'evergreen', label: 'Evergreen Engine', icon: CalendarClock },
    { id: 'competitors', label: 'Beat Competitors', icon: Swords },
    { id: 'channels', label: 'Channel Intel', icon: Tv },
    { id: 'own-channel', label: 'Own Studio', icon: BarChart2 },
    { id: 'outcomes', label: 'Outcome Tracker', icon: Target },
    { id: 'data-feeds', label: 'Feeds & Queue', icon: Server },
    { id: 'watchlist', label: 'Watchlist & Alerts', icon: BookmarkCheck },
    { id: 'scoring-admin', label: 'Scoring Weights', icon: Sliders },
    { id: 'settings', label: 'Settings', icon: SettingsIcon }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-[#090D16]/90 backdrop-blur-md">
      {/* Top Banner & Primary Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 flex items-center justify-center shadow-md shadow-red-500/20 text-white font-black text-xl tracking-wider">
              YT
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                TubeOpportunity
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900">
                  PRO
                </span>
              </span>
              <p className="text-[11px] text-slate-400 font-medium">Evergreen & Virality Intelligence</p>
            </div>
          </div>

          {/* Center / Right controls */}
          <div className="flex items-center gap-3">
            
            {/* Quota Status Indicator (Section 40) */}
            {quota && (
              <div 
                className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs cursor-pointer hover:border-slate-300 transition-colors"
                onClick={() => onSelectTab('settings')}
                title={`Daily YouTube Quota: ${quota.unitsRemaining.toLocaleString()} units remaining`}
              >
                <div className={`w-2 h-2 rounded-full ${quota.isExhausted ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                <span className="font-medium text-slate-600 dark:text-slate-300">
                  API Quota: <strong>{quota.unitsRemaining.toLocaleString()}</strong> left
                </span>
              </div>
            )}

            {/* Section 75: Most Important Feature Button */}
            <button
              onClick={onOpenWizard}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-red-600 via-rose-600 to-orange-500 hover:opacity-95 shadow-md shadow-red-600/25 transition-all transform active:scale-95"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>Find Me a Video to Make</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>
          </div>

        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex space-x-1 overflow-x-auto py-1.5 scrollbar-none border-t border-slate-100 dark:border-slate-800/50">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-red-400 dark:text-red-600' : 'opacity-70'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
