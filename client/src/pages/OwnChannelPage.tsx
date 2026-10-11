import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Activity, Eye, Clock, Users, ArrowUpRight, Compass, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { fetchOwnChannelAnalytics, connectOwnChannel } from '../lib/api';
import { OwnChannelAnalyticsReport } from '../lib/types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const OwnChannelPage: React.FC = () => {
  const [report, setReport] = useState<OwnChannelAnalyticsReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connectName, setConnectName] = useState('');

  const loadData = () => {
    setIsLoading(true);
    fetchOwnChannelAnalytics().then(res => {
      if (res.success) {
        setReport(res.report);
      }
    }).catch(console.error).finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectName.trim()) return;
    await connectOwnChannel('UC_CONNECTED_USER', connectName.trim());
    setConnectName('');
    loadData();
  };

  if (!report) {
    return (
      <div className="py-20 text-center">
        <div className="animate-spin text-2xl mb-2">⏳</div>
        <span className="text-xs text-slate-400">Loading authenticated channel telemetry...</span>
      </div>
    );
  }

  const chartData = report.timeSeries.map(item => ({
    date: item.recorded_date.slice(5),
    views: item.views,
    searchViews: item.search_views,
    suggestedViews: item.suggested_views,
    browseViews: item.browse_views
  }));

  return (
    <div className="space-y-6 pb-12">
      
      {/* Strict Privacy & Architectural Separation Banner */}
      <div className="p-5 rounded-3xl bg-amber-500/10 border-2 border-amber-500/40 text-xs text-amber-900 dark:text-amber-200 space-y-2">
        <div className="flex items-center gap-2 font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
          <Lock className="w-4 h-4" />
          <span>Strict Architectural Separation: Own Channel Data vs Public Competitor Data</span>
        </div>
        <p className="leading-relaxed text-[11px]">
          {report.privacyNotice}
        </p>
      </div>

      {/* Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-950/20 via-red-950/10 to-transparent border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-red-500 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                {report.channel.title}
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-black uppercase">
                OAuth Authenticated
              </span>
            </div>
            <p className="text-xs text-slate-400">
              First-Party Private Telemetry • YouTube Analytics API Integration
            </p>
          </div>
        </div>

        {/* Reconnect / Channel switcher */}
        <form onSubmit={handleConnect} className="flex items-center gap-2 text-xs">
          <input
            type="text"
            value={connectName}
            onChange={(e) => setConnectName(e.target.value)}
            placeholder="Connect Channel Name..."
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold"
          >
            Switch
          </button>
        </form>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        
        <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">30-Day Views</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
            {report.summary.totalViews30d.toLocaleString()}
          </span>
          <span className="text-[10px] text-emerald-500 font-bold">First-Party Verified</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Private Watch Time</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
            {report.summary.totalWatchTimeHours.toLocaleString()} hrs
          </span>
          <span className="text-[10px] text-slate-400">Owner-only metric</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Avg View Duration</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
            {report.summary.avgViewDurationFormatted}
          </span>
          <span className="text-[10px] text-slate-400">Audience retention metric</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Search Traffic Ratio</span>
          <span className="text-2xl font-black text-sky-600 mt-1 block">
            {report.summary.trafficSourcesBreakdown.searchPercent}%
          </span>
          <span className="text-[10px] text-sky-500 font-bold">High Evergreen Share</span>
        </div>

      </div>

      {/* Traffic Source Breakdown (Strictly Private to Channel Owner!) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-sky-500" />
              <span>Traffic Sources Breakdown (Owner Private Telemetry)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Only accessible for your own channel via Google OAuth. Competitor algorithms cannot access this split.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          
          <div className="p-4 rounded-2xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-sky-700 dark:text-sky-300">YouTube Search</span>
              <strong className="text-base text-sky-600 font-black">{report.summary.trafficSourcesBreakdown.searchPercent}%</strong>
            </div>
            <p className="text-[11px] text-slate-500">
              Viewers actively searching keywords. High evergreen, passive multi-year longevity.
            </p>
            <div className="mt-2 text-[10px] text-slate-400">
              Views: <strong>{report.summary.trafficSourcesBreakdown.searchViews.toLocaleString()}</strong>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-purple-700 dark:text-purple-300">Suggested Videos</span>
              <strong className="text-base text-purple-600 font-black">{report.summary.trafficSourcesBreakdown.suggestedPercent}%</strong>
            </div>
            <p className="text-[11px] text-slate-500">
              Viewers clicking your video from competitor watch pages and recommendations.
            </p>
            <div className="mt-2 text-[10px] text-slate-400">
              Views: <strong>{report.summary.trafficSourcesBreakdown.suggestedViews.toLocaleString()}</strong>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-emerald-700 dark:text-emerald-300">Browse Features</span>
              <strong className="text-base text-emerald-600 font-black">{report.summary.trafficSourcesBreakdown.browsePercent}%</strong>
            </div>
            <p className="text-[11px] text-slate-500">
              Traffic from YouTube home feed, subscription feed, and viewer history recommendations.
            </p>
            <div className="mt-2 text-[10px] text-slate-400">
              Views: <strong>{report.summary.trafficSourcesBreakdown.browseViews.toLocaleString()}</strong>
            </div>
          </div>

        </div>

        {/* 30-Day Daily Views Curve by Traffic Source */}
        <div className="h-52 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.4} />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '11px'
                }}
              />
              <Area type="monotone" dataKey="searchViews" stackId="1" stroke="#0284c7" fill="#0284c7" name="Search Views" />
              <Area type="monotone" dataKey="suggestedViews" stackId="1" stroke="#a855f7" fill="#a855f7" name="Suggested Views" />
              <Area type="monotone" dataKey="browseViews" stackId="1" stroke="#10b981" fill="#10b981" name="Browse Views" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
