import React, { useState, useEffect } from 'react';
import { Layers, AlertCircle, ArrowUpRight, Sparkles, CheckCircle, Search, HelpCircle } from 'lucide-react';
import { fetchContentGaps } from '../lib/api';
import { ContentGap, Keyword } from '../lib/types';
import { OpportunityScoreBadge } from '../components/OpportunityScoreBadge';

interface Props {
  onOpenBlueprint: (kwId: number) => void;
}

export const ContentGapsPage: React.FC<Props> = ({ onOpenBlueprint }) => {
  const [data, setData] = useState<{
    gaps: ContentGap[];
    vacuums: Array<{ keyword: Keyword; vacuumAnalysis: any }>;
  } | null>(null);

  useEffect(() => {
    fetchContentGaps().then(res => {
      if (res.success) {
        setData(res);
      }
    }).catch(console.error);
  }, []);

  if (!data) {
    return (
      <div className="py-20 text-center">
        <div className="animate-spin text-2xl mb-2">⏳</div>
        <span className="text-xs text-slate-400">Scanning content vacuums and comment questions...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      
      {/* Page Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/20 via-teal-950/10 to-transparent border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Content Gaps & Content Vacuums (Sections 13 & 31)
            </h2>
            <p className="text-xs text-slate-400">
              People are searching for this, but existing YouTube content is weak, incomplete, or missing entirely.
            </p>
          </div>
        </div>
      </div>

      {/* Section 31: "NO ONE IS MAKING THIS" CONTENT VACUUM DETECTOR */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span className="text-emerald-500 text-lg">🟢</span>
              <span>“No One Is Making This” Content Vacuums</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              High search demand signals paired with almost zero quality or recent video supply.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.vacuums.map(({ keyword, vacuumAnalysis }) => (
            <div
              key={keyword.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#111827] border-2 border-emerald-500/40 shadow-sm relative overflow-hidden"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-500 text-white shadow-sm shadow-emerald-500/20">
                  🟢 POSSIBLE CONTENT VACUUM
                </span>
                <OpportunityScoreBadge score={keyword.opportunity_score} size="md" />
              </div>

              <h4 className="text-base font-black text-slate-900 dark:text-white">
                “{keyword.term}”
              </h4>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                {vacuumAnalysis.summary || keyword.why_analysis}
              </p>

              {/* Vacuum Evidence Metrics (Section 31) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-4 text-center">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Monthly Interest</span>
                  <strong className="text-xs text-slate-900 dark:text-white">
                    {vacuumAnalysis.estimatedMonthlyInterest.toLocaleString()}
                  </strong>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Relevant Videos</span>
                  <strong className="text-xs text-amber-600">
                    {vacuumAnalysis.relevantVideosCount}
                  </strong>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Quality Videos</span>
                  <strong className="text-xs text-red-500">
                    {vacuumAnalysis.qualityVideosCount}
                  </strong>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Strong Recent</span>
                  <strong className="text-xs text-emerald-500">
                    {vacuumAnalysis.strongRecentVideosCount}
                  </strong>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => onOpenBlueprint(keyword.id)}
                  className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 flex items-center gap-1.5 shadow-sm"
                >
                  <span>Produce This Vacuum Video</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 13: Granular Content Gaps List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-sky-500" />
              <span>Specific Missing Information Gaps</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Recurring viewer questions and unmet sub-audiences (Mobile, Beginners, Errors).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.gaps.map((gap) => (
            <div
              key={gap.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-300">
                    {gap.evidence_type.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-bold text-emerald-600">
                    +{gap.opportunity_lift}% Lift
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {gap.gap_title}
                </h4>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  {gap.gap_description}
                </p>

                <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                  Evidence: <strong>{gap.evidence_detail}</strong>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">Topic: {gap.keyword_term}</span>
                <button
                  onClick={() => onOpenBlueprint(gap.keyword_id)}
                  className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
                >
                  Plan Video
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
