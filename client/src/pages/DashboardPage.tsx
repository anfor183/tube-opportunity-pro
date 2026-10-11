import React, { useEffect, useState } from 'react';
import { 
  Sparkles, 
  Flame, 
  Layers, 
  ArrowUpRight, 
  Compass, 
  Activity, 
  CalendarClock, 
  TrendingUp, 
  ShieldCheck, 
  Zap,
  Bookmark
} from 'lucide-react';
import { fetchDashboardData, addToWatchlist } from '../lib/api';
import { Keyword, Video, SearchMode } from '../lib/types';
import { OpportunityScoreBadge } from '../components/OpportunityScoreBadge';
import { DataSourceBadge } from '../components/DataSourceBadge';
import { OpportunityMap } from '../components/OpportunityMap';
import { SearchBar } from '../components/SearchBar';

interface Props {
  onSearch: (q: string, mode: SearchMode, cat?: string, live?: boolean) => void;
  onSelectKeyword: (kw: Keyword) => void;
  onSelectVideo: (videoId: string) => void;
  onOpenWizard: () => void;
}

export const DashboardPage: React.FC<Props> = ({
  onSearch,
  onSelectKeyword,
  onSelectVideo,
  onOpenWizard
}) => {
  const [data, setData] = useState<{
    summary: { totalKeywords: number; totalVideos: number; totalOutliers: number; totalGaps: number };
    topOpportunities: Keyword[];
    hiddenGems: Keyword[];
    evergreenGold: Keyword[];
    smallChannelWinners: Video[];
    vacuums: Keyword[];
  } | null>(null);

  const [savedStatus, setSavedStatus] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetchDashboardData().then(res => {
      if (res.success) {
        setData(res);
      }
    }).catch(console.error);
  }, []);

  const handleSave = async (kw: Keyword) => {
    try {
      await addToWatchlist('keyword', kw.id, kw.term);
      setSavedStatus(prev => ({ ...prev, [kw.id]: true }));
      setTimeout(() => {
        setSavedStatus(prev => ({ ...prev, [kw.id]: false }));
      }, 2500);
    } catch (err) {
      console.error(err);
    }
  };

  if (!data) {
    return (
      <div className="py-24 text-center">
        <div className="animate-spin text-3xl mb-3">⏳</div>
        <p className="text-sm text-slate-400">Loading YouTube Opportunity Intelligence Corpus...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      
      {/* Search Header Experience (Section 3) */}
      <SearchBar onSearch={onSearch} />

      {/* Summary Stat Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Analyzed Topics</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {data.summary.totalKeywords.toLocaleString()}
            </span>
            <span className="text-xs text-blue-500 font-semibold">Live Indexed</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Multi-signal search clusters</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Small Channel Outliers</span>
            <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {data.summary.totalOutliers.toLocaleString()}
            </span>
            <span className="text-xs text-red-500 font-semibold">10x–500x+</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Views drastically &gt; Subs</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Content Vacuums</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {data.vacuums.length}
            </span>
            <span className="text-xs text-emerald-500 font-semibold">🟢 Untapped</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">High demand, near zero videos</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Evergreen Gold</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center">
              <CalendarClock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {data.evergreenGold.length}
            </span>
            <span className="text-xs text-purple-500 font-semibold">90+ Longevity</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Multi-year search persistence</p>
        </div>

      </div>

      {/* Hero Call to Action Banner (Section 75 Shortcut) */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white shadow-xl shadow-red-600/15 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/20 text-white backdrop-blur-sm">
            Instant Production Recommendation
          </span>
          <h2 className="text-2xl font-black tracking-tight mt-2">
            What video should you produce next?
          </h2>
          <p className="text-xs text-white/80 max-w-xl mt-1">
            Answer 3 quick questions about your channel size and niche to get our top 20 ranked opportunities with pre-validated checklists and attack angles.
          </p>
        </div>
        <button
          onClick={onOpenWizard}
          className="shrink-0 px-6 py-3 rounded-2xl bg-white text-slate-900 font-black text-sm hover:bg-slate-100 shadow-md transform active:scale-95 transition-all flex items-center gap-2"
        >
          <Zap className="w-4 h-4 fill-red-600 text-red-600" />
          <span>Launch Recommendation Wizard</span>
        </button>
      </div>

      {/* Sections 48 & 49: Opportunity Map Quadrants */}
      <OpportunityMap keywords={data.topOpportunities} onSelectKeyword={onSelectKeyword} />

      {/* Section 24: Opportunities Discovered Today Feed */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-red-500" />
              <span>Opportunities Discovered Today</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ranked by multi-factor opportunity score, content gaps, and small channel evidence.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.topOpportunities.map((kw) => (
            <div
              key={kw.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {kw.category}
                  </span>
                  <OpportunityScoreBadge score={kw.opportunity_score} size="md" showLabel />
                </div>

                <h4
                  onClick={() => onSelectKeyword(kw)}
                  className="text-base font-bold text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors cursor-pointer"
                >
                  “{kw.term}”
                </h4>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {kw.why_analysis}
                </p>

                {/* Score Breakdown Pills */}
                <div className="grid grid-cols-3 gap-2 my-4 text-center">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Demand</span>
                    <strong className="text-xs text-slate-800 dark:text-slate-200">{kw.demand_score}</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Competition</span>
                    <strong className={`text-xs ${kw.competition_score <= 40 ? 'text-emerald-500' : kw.competition_score <= 65 ? 'text-amber-500' : 'text-rose-500'}`}>{kw.competition_score}</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Evergreen</span>
                    <strong className="text-xs text-sky-600">{kw.evergreen_score}</strong>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <DataSourceBadge source={kw.source_type} confidence={kw.confidence} />
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSave(kw)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Save to watchlist"
                  >
                    <Bookmark className={`w-4 h-4 ${savedStatus[kw.id] ? 'fill-red-600 text-red-600' : ''}`} />
                  </button>
                  <button
                    onClick={() => onSelectKeyword(kw)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:opacity-90 transition-opacity flex items-center gap-1"
                  >
                    <span>Inspect</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Section 32: Small Channels Are Winning Highlights */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-red-500 fill-red-500" />
              <span>Small Channels Are Winning</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Proof that channel subscriber size is not an impassable barrier on these specific topics.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.smallChannelWinners.slice(0, 3).map((video) => (
            <div
              key={video.id}
              onClick={() => onSelectVideo(video.video_id)}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 hover:border-red-500/50 cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                  {video.channel_title}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 font-extrabold text-[11px]">
                  {video.outlier_ratio}x Outlier
                </span>
              </div>
              <h4 className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-2">
                {video.title}
              </h4>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                <span>Subs: <strong>{video.subscriber_count?.toLocaleString()}</strong></span>
                <span>Views: <strong className="text-emerald-600">{video.view_count.toLocaleString()}</strong></span>
                <span className="text-red-500 font-bold">Beat Score: {video.beatability_score}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
