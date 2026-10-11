import React from 'react';
import { Keyword } from '../lib/types';
import { Compass, Flame, ShieldAlert, Sparkles } from 'lucide-react';

interface Props {
  keywords: Keyword[];
  onSelectKeyword: (kw: Keyword) => void;
}

export const OpportunityMap: React.FC<Props> = ({ keywords, onSelectKeyword }) => {
  // Categorize keywords into 4 Quadrants
  const goldmine = keywords.filter(k => k.demand_score >= 70 && k.competition_score <= 40);
  const competitive = keywords.filter(k => k.demand_score >= 70 && k.competition_score > 40);
  const niche = keywords.filter(k => k.demand_score < 70 && k.competition_score <= 40);
  const saturated = keywords.filter(k => k.demand_score < 70 && k.competition_score > 40);

  return (
    <div className="w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Compass className="w-4 h-4 text-red-500" />
            <span>Topic Opportunity Map & Matrix</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Dynamic Demand vs Competition Quadrants. Focus on the Goldmine quadrant for immediate breakout potential.
          </p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-200 dark:border-emerald-800">
          {goldmine.length} Goldmines Detected
        </span>
      </div>

      {/* 2x2 Quadrant Grid (Sections 48 & 49) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* QUADRANT 1: 🔥 GOLDMINE (High Demand, Low Supply/Competition) */}
        <div className="p-4 rounded-xl border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <Flame className="w-4 h-4 fill-emerald-500 text-emerald-500" />
              🔥 QUADRANT: GOLDMINE (HIGH DEMAND • LOW SUPPLY)
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500 text-white">
              {goldmine.length} Topics
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
            Prime opportunities. High persistent viewer volume with weak, outdated competing video supply.
          </p>
          <div className="space-y-2">
            {goldmine.slice(0, 4).map(k => (
              <div
                key={k.id}
                onClick={() => onSelectKeyword(k)}
                className="p-2.5 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-emerald-200 dark:border-emerald-900 hover:border-emerald-400 transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="truncate mr-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600">
                    {k.term}
                  </span>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                    <span>Demand: {k.demand_score}</span>
                    <span>•</span>
                    <span>Comp: {k.competition_score}</span>
                    <span>•</span>
                    <span className="text-emerald-500 font-semibold">Evergreen: {k.evergreen_score}</span>
                  </div>
                </div>
                <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  {k.opportunity_score.toFixed(0)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* QUADRANT 2: ⚠️ COMPETITIVE (High Demand, High Supply) */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              ⚠️ COMPETITIVE (HIGH DEMAND • HIGH SUPPLY)
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-600">
              {competitive.length} Topics
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
            Heavy authority moats. Requires specific long-tail positioning or massive thumbnail CTR to rank.
          </p>
          <div className="space-y-2">
            {competitive.slice(0, 3).map(k => (
              <div
                key={k.id}
                onClick={() => onSelectKeyword(k)}
                className="p-2.5 rounded-lg bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-slate-300 transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="truncate mr-2">
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    {k.term}
                  </span>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                    <span>Demand: {k.demand_score}</span>
                    <span>•</span>
                    <span>Comp: {k.competition_score}</span>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600">
                  {k.opportunity_score.toFixed(0)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* QUADRANT 3: 🟡 NICHE (Low Demand, Low Supply) */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-sky-500" />
              🟡 NICHE / TARGETED (LOW DEMAND • LOW SUPPLY)
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-600">
              {niche.length} Topics
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
            Focused hyper-targeted audiences. Excellent for high-conversion affiliate offers or courses.
          </p>
          <div className="space-y-2">
            {niche.slice(0, 3).map(k => (
              <div
                key={k.id}
                onClick={() => onSelectKeyword(k)}
                className="p-2.5 rounded-lg bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-slate-300 transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="truncate mr-2">
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    {k.term}
                  </span>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                    <span>Demand: {k.demand_score}</span>
                    <span>•</span>
                    <span>Comp: {k.competition_score}</span>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600">
                  {k.opportunity_score.toFixed(0)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* QUADRANT 4: 🔴 SATURATED (Low Demand, High Supply) */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-rose-50/30 dark:bg-rose-950/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
              🔴 SATURATED / AVOID (LOW DEMAND • HIGH SUPPLY)
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-600">
              {saturated.length} Topics
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
            Unfavorable economics. Avoid publishing unless targeting a radically unique angle.
          </p>
          {saturated.length === 0 ? (
            <div className="text-xs text-slate-400 italic py-2">
              No saturated topics flagged in current query set.
            </div>
          ) : (
            <div className="space-y-2">
              {saturated.slice(0, 2).map(k => (
                <div key={k.id} className="p-2 text-xs text-slate-500 truncate">
                  {k.term} (Opportunity: {k.opportunity_score.toFixed(0)})
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
