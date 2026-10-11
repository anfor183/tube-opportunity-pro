import React, { useState, useEffect } from 'react';
import { X, Swords, ShieldCheck, AlertTriangle, CheckCircle2, Clock, Video as VideoIcon, User } from 'lucide-react';
import { fetchVideoDetail } from '../lib/api';
import { Video } from '../lib/types';
import { DataSourceBadge } from './DataSourceBadge';

interface Props {
  videoId: string | null;
  onClose: () => void;
}

export const CompetitorBeatabilityModal: React.FC<Props> = ({ videoId, onClose }) => {
  const [data, setData] = useState<{
    video: Video;
    beatability: {
      beatabilityScore: number;
      verdict: string;
      strengths: string[];
      weaknesses: string[];
      ageYears: number;
    };
    requirementsToBeat: any;
    historicalAnalytics: any;
  } | null>(null);

  useEffect(() => {
    if (!videoId) return;
    fetchVideoDetail(videoId).then(res => {
      if (res.success) {
        setData(res);
      }
    }).catch(console.error);
  }, [videoId]);

  if (!videoId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-red-600/10 via-transparent to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-500/20">
              <Swords className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Can I Beat This Video?
              </h2>
              <p className="text-xs text-slate-400">
                Competitive Vulnerability & Beatability Engine (Section 19 & 20)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {!data ? (
            <div className="py-20 text-center">
              <div className="animate-spin text-2xl mb-2">⏳</div>
              <p className="text-xs text-slate-400">Analyzing competitor weaknesses and video signals...</p>
            </div>
          ) : (
            <>
              {/* Competitor Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Competing Video</span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {data.video.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>Channel: <strong className="text-slate-700 dark:text-slate-300">{data.video.channel_title}</strong> ({data.video.subscriber_count?.toLocaleString()} subs)</span>
                      <span>•</span>
                      <span>Lifetime Views: <strong className="text-slate-700 dark:text-slate-300">{data.video.view_count.toLocaleString()}</strong></span>
                      <span>•</span>
                      <span>Age: <strong>{data.beatability.ageYears} yrs</strong></span>
                    </div>
                  </div>
                  
                  {/* Beatability Score Badge */}
                  <div className="text-right shrink-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Beatability</span>
                    <span className="inline-block px-3 py-1 rounded-xl text-base font-black bg-emerald-500 text-white shadow-sm shadow-emerald-500/30">
                      {data.beatability.beatabilityScore}/100
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
                  <DataSourceBadge source={data.video.source_type} />
                  <span className="text-slate-500">
                    Views/Day: <strong>{data.historicalAnalytics?.viewsPerDay.toLocaleString()}</strong>
                  </span>
                </div>
              </div>

              {/* Verdict Banner */}
              <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                🎯 <strong>Verdict:</strong> {data.beatability.verdict}
              </div>

              {/* Strengths & Weaknesses Split */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Competitor Strengths */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-2">
                    <ShieldCheck className="w-4 h-4 text-sky-500" />
                    Their Strengths
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    {data.beatability.strengths.map((str, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-sky-500">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Competitor Weaknesses */}
                <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 flex items-center gap-1.5 mb-2">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    Their Vulnerabilities (Exploit These)
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    {data.beatability.weaknesses.map((wk, i) => (
                      <li key={i} className="flex items-start gap-1.5 font-medium">
                        <span className="text-rose-500">•</span>
                        <span>{wk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Section 20: Requirements to Beat the Competition */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Actionable Requirements to Beat This Video
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Optimal Duration</span>
                    <strong className="text-slate-800 dark:text-slate-200">{data.requirementsToBeat?.recommendedLength}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Thumbnail Visual Promise</span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{data.requirementsToBeat?.thumbnailStrategy?.visualPromise}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Critical Missing Info to Include</span>
                  <ul className="space-y-1">
                    {data.requirementsToBeat?.contentGapsToAddress?.map((gap: string, i: number) => (
                      <li key={i} className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <span className="text-emerald-500 font-bold">✓</span>
                        <span>{gap}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Recommended Hook Strategy</span>
                  <p className="text-slate-700 dark:text-slate-300 italic">
                    "{data.requirementsToBeat?.hookStrategy}"
                  </p>
                </div>
              </div>

            </>
          )}
        </div>

      </div>
    </div>
  );
};
