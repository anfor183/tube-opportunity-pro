import React, { useState, useEffect } from 'react';
import { Gem, Flame, ArrowUpRight, Sparkles, Filter, ShieldAlert } from 'lucide-react';
import { fetchHiddenGems } from '../lib/api';
import { Keyword } from '../lib/types';
import { OpportunityScoreBadge } from '../components/OpportunityScoreBadge';
import { DataSourceBadge } from '../components/DataSourceBadge';

interface Props {
  onSelectKeyword: (kw: Keyword) => void;
  onOpenBlueprint: (kwId: number) => void;
}

export const HiddenGemsPage: React.FC<Props> = ({ onSelectKeyword, onOpenBlueprint }) => {
  const [gems, setGems] = useState<Keyword[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHiddenGems().then(res => {
      if (res.success) {
        setGems(res.gems);
      }
    }).catch(console.error).finally(() => setIsLoading(false));
  }, []);

  const badgeFilters = [
    'All',
    '🟢 Untapped',
    '🟡 Emerging',
    '🔵 Evergreen Gap',
    '🟣 Small Channel Goldmine',
    '🔥 Outlier Opportunity',
    '⚠️ False Opportunity'
  ];

  const filtered = activeFilter === 'All'
    ? gems
    : gems.filter(g => g.gemBadge?.includes(activeFilter.replace(/[^a-zA-Z]/g, '')) || g.gemBadge === activeFilter);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Page Title & Intro */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-900/10 via-red-900/10 to-transparent border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
            <Gem className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              🔎 Hidden Gem Discovery
            </h2>
            <p className="text-xs text-slate-400">
              High-demand, low-competition keywords classified by algorithmic proof and market anomalies.
            </p>
          </div>
        </div>

        {/* Badge Filter Toolbar */}
        <div className="flex items-center gap-2 overflow-x-auto pt-3 scrollbar-none">
          {badgeFilters.map((b) => (
            <button
              key={b}
              onClick={() => setActiveFilter(b)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeFilter === b
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                  : 'bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Gems Cards Grid */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="animate-spin text-2xl mb-2">⏳</div>
          <span className="text-xs text-slate-400">Detecting algorithmic hidden gems...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-slate-400 text-xs">
          No hidden gems found for this filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((kw) => (
            <div
              key={kw.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Gem Badge Banner */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700">
                    {kw.gemBadge || '🟢 Untapped'}
                  </span>
                  <OpportunityScoreBadge score={kw.opportunity_score} size="md" />
                </div>

                <h3
                  onClick={() => onSelectKeyword(kw)}
                  className="text-base font-extrabold text-slate-900 dark:text-white hover:text-red-600 dark:hover:text-red-400 cursor-pointer transition-colors"
                >
                  “{kw.term}”
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  {kw.gemDescription || kw.why_analysis}
                </p>

                {/* Proof Metrics */}
                <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Demand Score:</span>
                    <strong className="text-slate-900 dark:text-white">{kw.demand_score}/100</strong>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Competition Level:</span>
                    <strong className={kw.competition_score <= 40 ? 'text-emerald-600' : kw.competition_score <= 65 ? 'text-amber-600' : 'text-rose-600'}>{kw.competition_score}/100 ({kw.competition_score <= 40 ? 'Low' : kw.competition_score <= 65 ? 'Medium' : 'High'})</strong>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Evergreen Stability:</span>
                    <strong className="text-sky-600">{kw.evergreen_score}/100</strong>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Small Channel Proof:</span>
                    <strong className="text-purple-600">{kw.small_channel_winners_count} Creators</strong>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <DataSourceBadge source={kw.source_type} confidence={kw.confidence} />
                <button
                  onClick={() => onOpenBlueprint(kw.id)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 flex items-center gap-1.5 shadow-sm"
                >
                  <span>Build Blueprint</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
