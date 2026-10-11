import React from 'react';

interface Props {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const OpportunityScoreBadge: React.FC<Props> = ({ score, size = 'md', showLabel = false }) => {
  let color = 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400';
  let tierLabel = 'Poor';
  
  if (score >= 90) {
    color = 'bg-emerald-500 text-white font-bold shadow-sm shadow-emerald-500/30';
    tierLabel = 'Exceptional';
  } else if (score >= 80) {
    color = 'bg-sky-500 text-white font-bold shadow-sm shadow-sky-500/30';
    tierLabel = 'Very Strong';
  } else if (score >= 70) {
    color = 'bg-indigo-500 text-white font-medium';
    tierLabel = 'Strong';
  } else if (score >= 60) {
    color = 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30';
    tierLabel = 'Moderate';
  } else if (score >= 50) {
    color = 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30';
    tierLabel = 'Weak';
  } else {
    color = 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30';
    tierLabel = 'Poor';
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 rounded-md',
    md: 'text-sm px-2.5 py-1 rounded-lg',
    lg: 'text-lg px-4 py-1.5 rounded-xl font-bold'
  };

  return (
    <div className="inline-flex items-center gap-1.5">
      <span className={`inline-flex items-center justify-center tracking-tight transition-all ${sizeClasses[size]} ${color}`}>
        {score.toFixed(0)}
        <span className="text-[10px] opacity-70 ml-0.5">/100</span>
      </span>
      {showLabel && (
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {tierLabel}
        </span>
      )}
    </div>
  );
};
