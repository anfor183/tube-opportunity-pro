import React, { useState, useEffect } from 'react';
import { Swords, ArrowUpDown, Flame, ExternalLink, ShieldCheck } from 'lucide-react';
import { fetchOutliers } from '../lib/api';
import { Video } from '../lib/types';
import { DataSourceBadge } from '../components/DataSourceBadge';

interface Props {
  onSelectVideo: (videoId: string) => void;
}

export const CompetitorsPage: React.FC<Props> = ({ onSelectVideo }) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [sortBy, setSortBy] = useState<string>('view_count');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOutliers(1, 10000000, 1000).then(res => {
      if (res.success) {
        setVideos(res.outliers);
      }
    }).catch(console.error).finally(() => setIsLoading(false));
  }, []);

  const sorted = [...videos].sort((a, b) => {
    const valA = (a as any)[sortBy] || 0;
    const valB = (b as any)[sortBy] || 0;
    return sortOrder === 'desc' ? valB - valA : valA - valB;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900/10 via-red-950/10 to-transparent border border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-md">
            <Swords className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Competitor Intelligence & Beatability (Sections 11 & 12)
            </h2>
            <p className="text-xs text-slate-400">
              Analyze incumbent competitors, detect age vulnerabilities, and calculate exact beatability scores.
            </p>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-slate-400">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl font-bold"
          >
            <option value="view_count">Lifetime Views</option>
            <option value="views_per_day">Views / Day (Velocity)</option>
            <option value="beatability_score">Beatability (Easiest First)</option>
            <option value="outlier_ratio">Outlier Multiplier</option>
            <option value="freshness_years">Video Age</option>
          </select>
        </div>
      </div>

      {/* Competitor Table (Section 11) */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Competing Video</th>
                <th className="py-3 px-3">Channel</th>
                <th className="py-3 px-3 text-right">Subs</th>
                <th className="py-3 px-3 text-right">Views</th>
                <th className="py-3 px-3 text-center">Age</th>
                <th className="py-3 px-3 text-right">Views/Day</th>
                <th className="py-3 px-3 text-center">Outlier</th>
                <th className="py-3 px-3 text-center">Beatability</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="animate-spin text-2xl mb-2">⏳</div>
                    <span>Evaluating competitor quality and SERP depth...</span>
                  </td>
                </tr>
              ) : (
                sorted.map((v) => (
                  <tr
                    key={v.id}
                    onClick={() => onSelectVideo(v.video_id)}
                    className="table-row-hover cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 max-w-sm">
                      <span className="font-bold text-slate-900 dark:text-white group-hover:text-red-600 transition-colors line-clamp-1">
                        {v.title}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Target: {v.keyword_term || 'General'}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">
                      {v.channel_title}
                    </td>

                    <td className="py-3 px-3 text-right text-slate-500">
                      {v.subscriber_count?.toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-right font-extrabold text-slate-900 dark:text-white">
                      {v.view_count.toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-center text-slate-500 font-medium">
                      {v.freshness_years} yrs
                    </td>

                    <td className="py-3 px-3 text-right text-emerald-600 font-bold">
                      +{v.views_per_day.toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-600 font-bold">
                        {v.outlier_ratio}x
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-lg font-black ${
                        v.beatability_score >= 80
                          ? 'bg-emerald-500 text-white'
                          : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600'
                      }`}>
                        {v.beatability_score}/100
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectVideo(v.video_id);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
                      >
                        Can I Beat It?
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
