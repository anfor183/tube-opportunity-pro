import React from 'react';
import { ShieldCheck, Database, Cpu, AlertTriangle, HelpCircle } from 'lucide-react';

interface Props {
  source: string;
  confidence?: 'HIGH' | 'MEDIUM' | 'LOW';
  showConfidence?: boolean;
  onInspect?: () => void;
}

export const DataSourceBadge: React.FC<Props> = ({ 
  source, 
  confidence, 
  showConfidence = true,
  onInspect 
}) => {
  let badgeConfig = {
    label: 'Observed Snapshot',
    icon: Database,
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
  };

  if (source === 'OFFICIAL_API') {
    badgeConfig = {
      label: 'Official YouTube API',
      icon: ShieldCheck,
      className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
    };
  } else if (source === 'ESTIMATED' || source === 'ESTIMATED_MODEL') {
    badgeConfig = {
      label: 'Model Estimate',
      icon: Cpu,
      className: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800'
    };
  } else if (source === 'CALCULATED') {
    badgeConfig = {
      label: 'Calculated from Snapshots',
      icon: Database,
      className: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800'
    };
  } else if (source === 'THIRD_PARTY') {
    badgeConfig = {
      label: 'Google Trends Signal',
      icon: HelpCircle,
      className: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800'
    };
  } else if (source === 'USER_PROVIDED') {
    badgeConfig = {
      label: 'Own Channel Analytics',
      icon: ShieldCheck,
      className: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
    };
  }

  const Icon = badgeConfig.icon;

  const confidenceColor = {
    HIGH: 'text-emerald-600 dark:text-emerald-400',
    MEDIUM: 'text-amber-600 dark:text-amber-400',
    LOW: 'text-rose-600 dark:text-rose-400'
  };

  return (
    <div 
      className={`inline-flex items-center gap-2 text-xs ${onInspect ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
      onClick={onInspect}
      title="Click to view full data provenance & source verification"
    >
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-medium ${badgeConfig.className}`}>
        <Icon className="w-3 h-3" />
        {badgeConfig.label}
      </span>
      {showConfidence && confidence && (
        <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
          Confidence: <strong className={confidenceColor[confidence]}>{confidence}</strong>
        </span>
      )}
    </div>
  );
};
