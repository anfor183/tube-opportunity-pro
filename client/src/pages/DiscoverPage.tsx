import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Download, 
  Bookmark, 
  Sparkles, 
  FileText, 
  ChevronRight,
  TrendingUp,
  Layers,
  Play,
  ExternalLink,
  Video as VideoIcon,
  Tv,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { searchKeywords, addToWatchlist, ingestLiveKeyword } from '../lib/api';
import { Keyword, Video, SearchMode } from '../lib/types';
import { OpportunityScoreBadge } from '../components/OpportunityScoreBadge';
import { DataSourceBadge } from '../components/DataSourceBadge';
import { SearchBar } from '../components/SearchBar';

interface Props {
  initialQuery?: string;
  initialMode?: SearchMode;
  onSelectKeyword: (kw: Keyword) => void;
  onOpenBlueprint: (kwId: number) => void;
  onSelectVideo?: (videoId: string) => void;
}

export const DiscoverPage: React.FC<Props> = ({
  initialQuery = '',
  initialMode = 'default',
  onSelectKeyword,
  onOpenBlueprint,
  onSelectVideo
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [mode, setMode] = useState<SearchMode>(initialMode);
  const [category, setCategory] = useState<string>('All');
  const [minScore, setMinScore] = useState<number>(50);
  const [sortBy, setSortBy] = useState<string>('opportunity_score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [viewMode, setViewMode] = useState<'keywords' | 'videos'>('keywords');
  const [isLoading, setIsLoading] = useState(true);
  const [savedStatus, setSavedStatus] = useState<Record<number, boolean>>({});
  const [isLiveIngesting, setIsLiveIngesting] = useState(false);
  const [liveToast, setLiveToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleLiveIngest = async () => {
    const targetQuery = query.trim() || 'AI tools';
    setIsLiveIngesting(true);
    setLiveToast(null);
    try {
      const res = await ingestLiveKeyword(targetQuery, category !== 'All' ? category : undefined);
      if (res.success) {
        setLiveToast({
          type: 'success',
          message: `✓ Ingested ${res.result?.videosCount || 25} live YouTube videos from official API for "${targetQuery}"!`
        });
        await loadData(targetQuery, mode, category);
        setTimeout(() => setLiveToast(null), 5000);
      } else {
        setLiveToast({
          type: 'error',
          message: res.error || res.result?.message || 'Could not fetch live YouTube data.'
        });
        setTimeout(() => setLiveToast(null), 6000);
      }
    } catch (err: any) {
      setLiveToast({
        type: 'error',
        message: `Error: ${err.message}`
      });
      setTimeout(() => setLiveToast(null), 6000);
    } finally {
      setIsLiveIngesting(false);
    }
  };

  const loadData = async (q = query, m = mode, cat = category) => {
    setIsLoading(true);
    try {
      const res = await searchKeywords(q, m, cat);
      if (res.success) {
        setKeywords(res.results || []);
        setVideos(res.matchingVideos || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(initialQuery, initialMode);
  }, [initialQuery, initialMode]);

  const handleSearchTrigger = async (q: string, m: SearchMode, cat?: string, live?: boolean) => {
    setQuery(q);
    setMode(m);
    if (cat) setCategory(cat);
    if (live && q.trim()) {
      setIsLiveIngesting(true);
      setLiveToast(null);
      try {
        const res = await ingestLiveKeyword(q.trim(), cat !== 'All' ? cat : undefined);
        if (res.success) {
          setLiveToast({
            type: 'success',
            message: `✓ Ingested ${res.result?.videosCount || 25} live YouTube videos from official API for "${q.trim()}"!`
          });
          setTimeout(() => setLiveToast(null), 5000);
        } else {
          setLiveToast({
            type: 'error',
            message: res.error || res.result?.message || 'Could not fetch live YouTube data.'
          });
          setTimeout(() => setLiveToast(null), 6000);
        }
      } catch (err: any) {
        setLiveToast({ type: 'error', message: `Error: ${err.message}` });
        setTimeout(() => setLiveToast(null), 6000);
      } finally {
        setIsLiveIngesting(false);
      }
    }
    loadData(q, m, cat);
  };

  const handleSave = async (kw: Keyword, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await addToWatchlist('keyword', kw.id, kw.term);
      setSavedStatus(prev => ({ ...prev, [kw.id]: true }));
      setTimeout(() => {
        setSavedStatus(prev => ({ ...prev, [kw.id]: false }));
      }, 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExport = (format: 'csv' | 'json') => {
    window.open(`/api/export?format=${format}`, '_blank');
  };

  // Filter & Sort
  const filteredKeywords = keywords
    .filter(k => (query ? true : k.opportunity_score >= minScore))
    .sort((a, b) => {
      const valA = (a as any)[sortBy] || 0;
      const valB = (b as any)[sortBy] || 0;
      return sortOrder === 'desc' ? valB - valA : valA - valB;
    });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Search Bar */}
      <SearchBar 
        onSearch={handleSearchTrigger} 
        initialQuery={query}
        initialMode={mode}
      />

      {/* View Switcher: Keywords vs SERP Videos */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('keywords')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              viewMode === 'keywords'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Keyword Opportunities ({filteredKeywords.length})</span>
          </button>
          <button
            onClick={() => setViewMode('videos')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              viewMode === 'videos'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <VideoIcon className="w-4 h-4 text-red-500" />
            <span>Competing SERP Videos ({videos.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLiveIngest}
            disabled={isLiveIngesting}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50"
            title="Fetch real live YouTube videos, channels, and metrics using YouTube Data API v3"
          >
            <Zap className={`w-3.5 h-3.5 ${isLiveIngesting ? 'animate-spin text-white' : 'fill-white text-white'}`} />
            <span>{isLiveIngesting ? 'Streaming from YouTube...' : '⚡ Live YouTube Ingest'}</span>
          </button>

          <span className="text-xs text-slate-400 hidden sm:inline">
            {viewMode === 'keywords' 
              ? 'Showing discovered search demand, small-channel proof, and opportunity scores' 
              : `Showing ${videos.length} ranking competitor videos indexed on YouTube`}
          </span>
        </div>
      </div>

      {/* Live Ingestion Toast Feedback */}
      {liveToast && (
        <div className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2.5 shadow-sm transition-all ${
          liveToast.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
            : 'bg-rose-50 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
        }`}>
          {liveToast.type === 'success' 
            ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            : <Zap className="w-4 h-4 text-rose-500 shrink-0" />
          }
          <span>{liveToast.message}</span>
        </div>
      )}

      {viewMode === 'keywords' && (
        <>
          {/* Filter and Export Toolbar (Section 60 & 61) */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
            
            <div className="flex flex-wrap items-center gap-4">
              {/* Min Opportunity Slider */}
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-500">Min Score:</span>
                <input
                  type="range"
                  min="40"
                  max="90"
                  value={minScore}
                  onChange={(e) => setMinScore(parseInt(e.target.value))}
                  className="accent-red-600 w-24 cursor-pointer"
                />
                <span className="font-extrabold text-red-600">{minScore}</span>
              </div>

              {/* Sort By Selector */}
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-bold text-slate-500">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 font-semibold px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none"
                >
                  <option value="opportunity_score">Opportunity Score</option>
                  <option value="demand_score">Demand Score</option>
                  <option value="competition_score">Competition (Lowest)</option>
                  <option value="evergreen_score">Evergreen Score</option>
                  <option value="small_channel_score">Small Channel Proof</option>
                  <option value="outlier_score">Outlier Score</option>
                </select>
                <button
                  onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                  className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold"
                >
                  {sortOrder === 'desc' ? '↓ High to Low' : '↑ Low to High'}
                </button>
              </div>
            </div>

            {/* Export Buttons (Section 61) */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExport('csv')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 font-semibold transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={() => handleExport('json')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 font-semibold transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>
            </div>

          </div>

          {/* Main Opportunity Table (Section 23) */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Opportunity & Keyword</th>
                    <th className="py-3 px-3 text-center">Score</th>
                    <th className="py-3 px-3 text-center">Demand</th>
                    <th className="py-3 px-3 text-center">Comp.</th>
                    <th className="py-3 px-3 text-center">Evergreen</th>
                    <th className="py-3 px-3 text-center">Small Channel</th>
                    <th className="py-3 px-3 text-center">Outliers</th>
                    <th className="py-3 px-3 text-center">Action</th>
                    <th className="py-3 px-4 text-right">Blueprint</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {isLoading ? (
                    <tr>
                      <td colSpan={9} className="py-14 text-center text-slate-400">
                        <div className="w-8 h-8 mx-auto mb-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">
                          {query ? `Querying YouTube Data API for “${query}”...` : 'Filtering YouTube opportunity corpus...'}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">Analyzing competitor search supply, outlier ratios, and beatability</p>
                      </td>
                    </tr>
                  ) : filteredKeywords.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        <p className="font-semibold text-slate-600 dark:text-slate-300 mb-2">
                          {query ? `No analyzed opportunities match “${query}” with Min Score >= ${minScore}.` : 'No keywords found matching the selected filters.'}
                        </p>
                        {query && (
                          <button
                            onClick={handleLiveIngest}
                            disabled={isLiveIngesting}
                            className="mt-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm"
                          >
                            <Zap className={`w-3.5 h-3.5 ${isLiveIngesting ? 'animate-spin' : ''}`} />
                            <span>{isLiveIngesting ? 'Streaming from YouTube...' : `⚡ Ingest YouTube Data for “${query}”`}</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredKeywords.map((kw) => (
                      <tr
                        key={kw.id}
                        onClick={() => onSelectKeyword(kw)}
                        className="hover:bg-slate-50 dark:hover:bg-slate-900/40 cursor-pointer group transition-colors"
                      >
                        {/* Keyword Title & Intent */}
                        <td className="py-3.5 px-4 max-w-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white group-hover:text-red-600 transition-colors">
                              {kw.term}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                              {kw.search_intent}
                            </span>
                            <span>•</span>
                            <span>{kw.category}</span>
                            <span>•</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectKeyword(kw);
                              }}
                              className="px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 font-bold hover:bg-red-100 dark:hover:bg-red-900/60 transition-colors inline-flex items-center gap-1 cursor-pointer"
                              title="Click to view all competing videos"
                            >
                              <VideoIcon className="w-3 h-3 text-red-500" />
                              <span>{kw.relevant_videos_count} videos</span>
                            </button>
                          </div>
                        </td>

                        {/* Overall Score */}
                        <td className="py-3 px-3 text-center">
                          <OpportunityScoreBadge score={kw.opportunity_score} size="md" />
                        </td>

                        {/* Demand */}
                        <td className="py-3 px-3 text-center">
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {kw.demand_score}
                          </span>
                        </td>

                        {/* Competition */}
                        <td className="py-3 px-3 text-center">
                          <span className={`font-bold ${
                            kw.competition_score <= 40 
                              ? 'text-emerald-500' 
                              : kw.competition_score <= 65 
                                ? 'text-amber-500' 
                                : 'text-rose-500'
                          }`}>
                            {kw.competition_score}
                          </span>
                        </td>

                        {/* Evergreen */}
                        <td className="py-3 px-3 text-center">
                          <span className="font-bold text-sky-600">
                            {kw.evergreen_score}
                          </span>
                        </td>

                        {/* Small Channel Proof */}
                        <td className="py-3 px-3 text-center">
                          <span className="font-bold text-indigo-600">
                            {kw.small_channel_score}
                          </span>
                        </td>

                        {/* Outlier Evidence */}
                        <td className="py-3 px-3 text-center">
                          <span className="font-bold text-red-500">
                            {kw.outlier_score}
                          </span>
                        </td>

                        {/* Action: Save or Watch */}
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={(e) => handleSave(kw, e)}
                            className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Add to Watchlist"
                          >
                            <Bookmark className={`w-4 h-4 ${savedStatus[kw.id] ? 'fill-red-600 text-red-600' : ''}`} />
                          </button>
                        </td>

                        {/* Action: Plan */}
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenBlueprint(kw.id);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm transition-all inline-flex items-center gap-1"
                          >
                            <span>Plan</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* SERP Videos View (or Preview when in Videos Mode) */}
      {viewMode === 'videos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <VideoIcon className="w-4 h-4 text-red-500" />
              <span>Competing Videos for “{query || 'Current View'}” ({videos.length} Videos)</span>
            </h3>
            <span className="text-xs text-slate-400">
              Click any video to inspect Beatability and Weaknesses
            </span>
          </div>

          {videos.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
              <p className="font-semibold text-slate-600 dark:text-slate-300">
                {query ? `No indexed competitor videos found for “${query}”.` : 'No matching videos found. Select a keyword to view its indexed competitor videos.'}
              </p>
              {query && (
                <button
                  onClick={handleLiveIngest}
                  disabled={isLiveIngesting}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm"
                >
                  <Zap className={`w-3.5 h-3.5 ${isLiveIngesting ? 'animate-spin' : ''}`} />
                  <span>{isLiveIngesting ? 'Streaming from YouTube...' : `⚡ Search YouTube Live for “${query}”`}</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map((vid) => (
                <div
                  key={vid.id}
                  className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div>
                    {/* Thumbnail */}
                    <div 
                      className="relative aspect-video w-full overflow-hidden bg-slate-900 cursor-pointer"
                      onClick={() => onSelectVideo && onSelectVideo(vid.video_id)}
                    >
                      <img
                        src={vid.thumbnail_url || `https://i.ytimg.com/vi/${vid.video_id}/hqdefault.jpg`}
                        alt={vid.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {vid.duration_seconds > 0 && (
                        <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-bold text-white tracking-wide">
                          {Math.floor(vid.duration_seconds / 60)}:{(vid.duration_seconds % 60).toString().padStart(2, '0')}
                        </span>
                      )}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Play className="w-8 h-8 text-white fill-white drop-shadow" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-2">
                      <h4
                        onClick={() => onSelectVideo && onSelectVideo(vid.video_id)}
                        className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-red-500 line-clamp-2 cursor-pointer leading-snug"
                      >
                        {vid.title}
                      </h4>

                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[140px]">
                          {vid.channel_title}
                        </span>
                        {vid.subscriber_count !== undefined && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px]">
                            {vid.subscriber_count >= 1000000 
                              ? `${(vid.subscriber_count / 1000000).toFixed(1)}M subs`
                              : vid.subscriber_count >= 1000
                              ? `${(vid.subscriber_count / 1000).toFixed(1)}K subs`
                              : `${vid.subscriber_count} subs`}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span className="font-bold text-slate-700 dark:text-slate-200">
                          {vid.view_count.toLocaleString()} views
                        </span>
                        <span>•</span>
                        <span>{vid.freshness_years < 1 ? `${Math.round(vid.freshness_years * 12)}mo ago` : `${Math.round(vid.freshness_years)}yr${Math.round(vid.freshness_years) !== 1 ? 's' : ''} ago`}</span>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
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

                  {/* Card Bottom Actions */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <button
                      onClick={() => onSelectVideo && onSelectVideo(vid.video_id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:opacity-90 transition-all text-xs"
                    >
                      Inspect Beatability
                    </button>
                    <a
                      href={`https://www.youtube.com/watch?v=${vid.video_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
                      title="Watch on YouTube"
                    >
                      <span className="text-[11px] font-semibold">YouTube</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Top Competing Videos Section Preview (Always visible if videos exist) */}
      {viewMode === 'keywords' && videos.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <VideoIcon className="w-4 h-4 text-red-500" />
                <span>Top Competing SERP Videos for this Query ({videos.length} Videos)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Incumbent competitor videos indexed on YouTube. Click to inspect Beatability and flaws.
              </p>
            </div>
            <button
              onClick={() => setViewMode('videos')}
              className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
            >
              <span>View All {videos.length} Videos</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {videos.slice(0, 4).map((vid) => (
              <div
                key={vid.id}
                className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <div 
                    className="relative aspect-video w-full overflow-hidden bg-slate-900 cursor-pointer"
                    onClick={() => onSelectVideo && onSelectVideo(vid.video_id)}
                  >
                    <img
                      src={vid.thumbnail_url || `https://i.ytimg.com/vi/${vid.video_id}/hqdefault.jpg`}
                      alt={vid.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {vid.duration_seconds > 0 && (
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-bold text-white tracking-wide">
                        {Math.floor(vid.duration_seconds / 60)}:{(vid.duration_seconds % 60).toString().padStart(2, '0')}
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Play className="w-6 h-6 text-white fill-white drop-shadow" />
                    </div>
                  </div>

                  <div className="p-3 space-y-1.5">
                    <h4
                      onClick={() => onSelectVideo && onSelectVideo(vid.video_id)}
                      className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-red-500 line-clamp-2 cursor-pointer leading-snug"
                    >
                      {vid.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {vid.channel_title} • {vid.view_count.toLocaleString()} views
                    </span>
                    <div className="flex items-center gap-1.5 pt-0.5">
                      {vid.outlier_ratio >= 10 && (
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                          {vid.outlier_ratio}x
                        </span>
                      )}
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
                        Beat: {vid.beatability_score}/100
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-2 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                  <button
                    onClick={() => onSelectVideo && onSelectVideo(vid.video_id)}
                    className="font-bold text-slate-900 dark:text-white hover:text-red-500 transition-colors"
                  >
                    Inspect
                  </button>
                  <a
                    href={`https://www.youtube.com/watch?v=${vid.video_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-red-500 flex items-center gap-1"
                  >
                    <span>Watch</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
