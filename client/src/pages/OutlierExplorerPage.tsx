import React, { useState, useEffect } from 'react';
import { Flame, Filter, Eye, Users, ArrowUpRight, Swords, Sparkles } from 'lucide-react';
import { fetchOutliers } from '../lib/api';
import { Video } from '../lib/types';
import { DataSourceBadge } from '../components/DataSourceBadge';

interface Props {
  onSelectVideo: (videoId: string) => void;
}

export const OutlierExplorerPage: React.FC<Props> = ({ onSelectVideo }) => {
  const [minRatio, setMinRatio] = useState<number>(10);
  const [maxSubs, setMaxSubs] = useState<number>(50000);
  const [minViews, setMinViews] = useState<number>(50000);

  const [outliers, setOutliers] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetchOutliers(minRatio, maxSubs, minViews);
      if (res.success) {
        setOutliers(res.outliers);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [minRatio, maxSubs, minViews]);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-red-950/20 via-orange-950/10 to-transparent border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-orange-500 text-white flex items-center justify-center shadow-md shadow-red-500/20">
            <Flame className="w-5 h-5 fill-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              🔥 Small Channel Outlier Explorer (Section 9 & 33)
            </h2>
            <p className="text-xs text-slate-400">
              Find videos that dramatically outperform their channel subscriber count (10x to 500x+).
            </p>
          </div>
        </div>

        {/* Filter Toolbar (Section 33) */}
        <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          
          <div>
            <label className="block font-bold text-slate-500 mb-1">
              Minimum Outlier Ratio: <span className="text-red-500 font-extrabold">{minRatio}x</span>
            </label>
            <select
              value={minRatio}
              onChange={(e) => setMinRatio(parseFloat(e.target.value))}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 font-semibold text-slate-800 dark:text-slate-200"
            >
              <option value="10">10x Views / Subscriber Ratio</option>
              <option value="25">25x Outlier Ratio</option>
              <option value="50">50x Outlier Ratio</option>
              <option value="100">100x 🔥 MASSIVE OUTLIER</option>
              <option value="250">250x Extreme Anomaly</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-500 mb-1">
              Max Channel Subscribers: <span className="text-slate-800 dark:text-slate-200 font-extrabold">{maxSubs.toLocaleString()}</span>
            </label>
            <select
              value={maxSubs}
              onChange={(e) => setMaxSubs(parseInt(e.target.value))}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 font-semibold text-slate-800 dark:text-slate-200"
            >
              <option value="10000">&lt; 10,000 Subscribers (Small Channels)</option>
              <option value="25000">&lt; 25,000 Subscribers</option>
              <option value="50000">&lt; 50,000 Subscribers</option>
              <option value="200000">&lt; 200,000 Subscribers</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-500 mb-1">
              Minimum Views: <span className="text-emerald-500 font-extrabold">{(minViews / 1000).toFixed(0)}K</span>
            </label>
            <select
              value={minViews}
              onChange={(e) => setMinViews(parseInt(e.target.value))}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 font-semibold text-slate-800 dark:text-slate-200"
            >
              <option value="25000">25,000+ Views</option>
              <option value="50000">50,000+ Views</option>
              <option value="100000">100,000+ Views</option>
              <option value="500000">500,000+ Views</option>
            </select>
          </div>

        </div>
      </div>

      {/* Outliers Table */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Outlier Multiple</th>
                <th className="py-3 px-4">Video Details</th>
                <th className="py-3 px-3">Channel Info</th>
                <th className="py-3 px-3 text-right">Views</th>
                <th className="py-3 px-3 text-right">Views/Day</th>
                <th className="py-3 px-3 text-center">Beatability</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="animate-spin text-2xl mb-2">⏳</div>
                    <span>Calculating outlier multiples...</span>
                  </td>
                </tr>
              ) : outliers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No videos found matching these outlier filters. Try lowering the minimum ratio.
                  </td>
                </tr>
              ) : (
                outliers.map((vid) => (
                  <tr
                    key={vid.id}
                    onClick={() => onSelectVideo(vid.video_id)}
                    className="table-row-hover cursor-pointer group"
                  >
                    {/* Outlier Ratio Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 font-black px-2.5 py-1 rounded-xl text-xs ${
                        vid.outlier_ratio >= 100
                          ? 'bg-red-500 text-white shadow-sm shadow-red-500/30'
                          : 'bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800'
                      }`}>
                        <Flame className="w-3.5 h-3.5 fill-current" />
                        {vid.outlier_ratio}x
                      </span>
                    </td>

                    {/* Video Title */}
                    <td className="py-3.5 px-4 max-w-md">
                      <span className="font-bold text-slate-900 dark:text-white group-hover:text-red-600 transition-colors line-clamp-1">
                        {vid.title}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                        <span>Age: {vid.freshness_years} yrs</span>
                        <span>•</span>
                        <span>Target: {vid.keyword_term || 'Generic'}</span>
                      </div>
                    </td>

                    {/* Channel */}
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {vid.channel_title}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {vid.subscriber_count?.toLocaleString()} subscribers
                      </div>
                    </td>

                    {/* Views */}
                    <td className="py-3.5 px-3 text-right font-extrabold text-slate-900 dark:text-white">
                      {vid.view_count.toLocaleString()}
                    </td>

                    {/* Views per Day */}
                    <td className="py-3.5 px-3 text-right font-semibold text-emerald-600">
                      +{vid.views_per_day.toLocaleString()}
                    </td>

                    {/* Beatability */}
                    <td className="py-3.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 font-bold">
                        {vid.beatability_score}/100
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectVideo(vid.video_id);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:opacity-90 inline-flex items-center gap-1 shadow-sm"
                      >
                        <Swords className="w-3.5 h-3.5" />
                        <span>Beat It</span>
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
