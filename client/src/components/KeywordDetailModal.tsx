import React, { useState, useEffect } from 'react';
import { X, Sparkles, Swords, Layers, Bookmark, TrendingUp, CheckCircle2, ArrowUpRight, Flame, Play, ExternalLink } from 'lucide-react';
import { fetchKeywordDetail, addToWatchlist } from '../lib/api';
import { Keyword, Video, ContentGap, KeywordSnapshot } from '../lib/types';
import { OpportunityScoreBadge } from './OpportunityScoreBadge';
import { DataSourceBadge } from './DataSourceBadge';
import { TrendChart } from './TrendChart';

interface Props {
  keyword: Keyword | null;
  onClose: () => void;
  onOpenBlueprint: (kwId: number) => void;
  onSelectVideo: (videoId: string) => void;
}

export const KeywordDetailModal: React.FC<Props> = ({
  keyword,
  onClose,
  onOpenBlueprint,
  onSelectVideo
}) => {
  const [detail, setDetail] = useState<{
    keyword: Keyword;
    snapshots: KeywordSnapshot[];
    competitors: Video[];
    gaps: ContentGap[];
    smallChannelAnalysis: any;
    vacuumCheck: any;
  } | null>(null);

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!keyword) return;
    fetchKeywordDetail(keyword.id).then(res => {
      if (res.success) {
        setDetail(res);
      }
    }).catch(console.error);
  }, [keyword]);

  if (!keyword) return null;

  const handleSave = async () => {
    await addToWatchlist('keyword', keyword.id, keyword.term);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-red-600/10 via-transparent to-transparent">
          <div className="flex items-center gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Keyword Opportunity Intelligence
              </span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                “{keyword.term}”
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <Bookmark className={`w-3.5 h-3.5 ${saved ? 'text-red-500 fill-red-500' : ''}`} />
              <span>{saved ? 'Saved!' : 'Save Watchlist'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!detail ? (
            <div className="py-20 text-center">
              <div className="animate-spin text-2xl mb-2">⏳</div>
              <p className="text-xs text-slate-400">Loading multi-factor metrics and SERP signals...</p>
            </div>
          ) : (
            <>
              {/* Top Score & Action Bar */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <OpportunityScoreBadge score={detail.keyword.opportunity_score} size="lg" showLabel />
                  <div className="text-xs">
                    <span className="text-slate-400 block text-[10px]">Decision Recommendation</span>
                    <strong className="text-emerald-600 font-extrabold text-sm uppercase">
                      Action: {detail.keyword.recommended_action}
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <DataSourceBadge source={detail.keyword.source_type} confidence={detail.keyword.confidence} />
                  <button
                    onClick={() => {
                      onClose();
                      onOpenBlueprint(detail.keyword.id);
                    }}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/30 flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 fill-white" />
                    <span>Generate Video Blueprint</span>
                  </button>
                </div>
              </div>

              {/* Section 22: "WHY THIS OPPORTUNITY?" Explanation */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-red-500" />
                  <span>Why This Opportunity? (Section 22 Explainable Analysis)</span>
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {detail.keyword.why_analysis}
                </p>
                {detail.keyword.recommended_angle && (
                  <div className="mt-3 p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-xs">
                    <strong>Recommended Production Angle:</strong> {detail.keyword.recommended_angle}
                  </div>
                )}
              </div>

              {/* Trend Chart (Section 25) */}
              <TrendChart 
                data={detail.snapshots} 
                title="12-Month Search Interest Trend" 
              />

              {/* Small Channel Proof Analysis (Section 10) */}
              {detail.smallChannelAnalysis && (
                <div className="p-4 rounded-2xl bg-purple-50/30 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 text-xs space-y-3">
                  <span className="font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                    <Flame className="w-4 h-4 fill-purple-500 text-purple-500" />
                    Small Channel Proof & Algorithm Accessibility
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900">
                      <span className="text-[10px] text-slate-400 block">&lt; 5K Subs Channels</span>
                      <strong className="text-sm text-purple-600">{detail.smallChannelAnalysis.channelsUnder5K} Channels</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900">
                      <span className="text-[10px] text-slate-400 block">&gt; 100K Views</span>
                      <strong className="text-sm text-purple-600">{detail.smallChannelAnalysis.videosOver100K} Videos</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900">
                      <span className="text-[10px] text-slate-400 block">Outlier Multiples</span>
                      <strong className="text-sm text-red-500">{detail.smallChannelAnalysis.outliersFound} Found</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900">
                      <span className="text-[10px] text-slate-400 block">Accessibility Score</span>
                      <strong className="text-sm text-emerald-600">{detail.smallChannelAnalysis.smallChannelScore}/100</strong>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Verdict: <strong>{detail.smallChannelAnalysis.verdict}</strong>
                  </p>
                </div>
              )}

              {/* Competing Videos in SERP (Section 11) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Swords className="w-3.5 h-3.5 text-red-500" />
                    <span>Existing Competitors & SERP Incumbents ({detail.competitors.length} Videos)</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Click any video to inspect Beatability & Displace It
                  </span>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 shadow-sm">
                  {detail.competitors.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                      No competing videos indexed for this keyword.
                    </div>
                  ) : (
                    detail.competitors.map((vid) => (
                      <div
                        key={vid.id}
                        className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs group"
                      >
                        {/* Left: Thumbnail & Info */}
                        <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                          {/* Thumbnail with duration */}
                          <div 
                            className="relative w-28 sm:w-36 aspect-video rounded-xl overflow-hidden bg-slate-800 shrink-0 cursor-pointer shadow-sm group-hover:ring-2 ring-red-500 transition-all"
                            onClick={() => {
                              onClose();
                              onSelectVideo(vid.video_id);
                            }}
                          >
                            <img
                              src={vid.thumbnail_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80'}
                              alt={vid.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {vid.duration_seconds > 0 && (
                              <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-bold text-white tracking-wide">
                                {Math.floor(vid.duration_seconds / 60)}:{(vid.duration_seconds % 60).toString().padStart(2, '0')}
                              </span>
                            )}
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Play className="w-5 h-5 text-white fill-white drop-shadow" />
                            </div>
                          </div>

                          {/* Metadata */}
                          <div className="min-w-0 space-y-1">
                            <h5 
                              onClick={() => {
                                onClose();
                                onSelectVideo(vid.video_id);
                              }}
                              className="font-bold text-slate-900 dark:text-white group-hover:text-red-500 line-clamp-2 cursor-pointer leading-snug"
                            >
                              {vid.title}
                            </h5>
                            
                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                              <span className="font-semibold text-slate-700 dark:text-slate-300">
                                {vid.channel_title}
                              </span>
                              {vid.subscriber_count !== undefined && (
                                <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-500">
                                  {vid.subscriber_count >= 1000000 
                                    ? `${(vid.subscriber_count / 1000000).toFixed(1)}M subs`
                                    : vid.subscriber_count >= 1000
                                    ? `${(vid.subscriber_count / 1000).toFixed(1)}K subs`
                                    : `${vid.subscriber_count} subs`}
                                </span>
                              )}
                              <span>•</span>
                              <span className="font-medium text-slate-600 dark:text-slate-300">
                                {vid.view_count.toLocaleString()} views
                              </span>
                              <span>•</span>
                              <span>{vid.freshness_years} yrs ago</span>
                            </div>

                            {/* Badges: Outlier Ratio & Quality */}
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                              {vid.outlier_ratio >= 10 && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                  🔥 {vid.outlier_ratio}x Outlier
                                </span>
                              )}
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 border border-emerald-200 dark:border-emerald-800">
                                Beatability: {vid.beatability_score}/100
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 self-end sm:self-center">
                          <button
                            onClick={() => {
                              onClose();
                              onSelectVideo(vid.video_id);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 shadow-sm transition-all"
                          >
                            Inspect Beatability
                          </button>
                          <a
                            href={`https://www.youtube.com/watch?v=${vid.video_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 text-[11px] text-slate-400 hover:text-red-500 font-semibold flex items-center gap-1 transition-colors"
                          >
                            <span>Watch on YouTube</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </>
          )}
        </div>

      </div>
    </div>
  );
};
