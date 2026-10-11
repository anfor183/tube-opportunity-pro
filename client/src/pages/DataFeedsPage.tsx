import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Activity, 
  RefreshCw, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Layers, 
  TrendingUp, 
  ShieldCheck, 
  Search,
  Zap,
  HelpCircle
} from 'lucide-react';
import { fetchQueueStatus, processQueueBatch, enqueueJob, fetchGoogleTrends } from '../lib/api';
import { BackgroundJob, GoogleTrendsResult } from '../lib/types';

export const DataFeedsPage: React.FC = () => {
  const [queueData, setQueueData] = useState<{
    counts: { PENDING: number; PROCESSING: number; COMPLETED: number; FAILED: number };
    total: number;
    recentJobs: BackgroundJob[];
  } | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [testKeyword, setTestKeyword] = useState('Best AI tools for real estate agents');
  const [trendsResult, setTrendsResult] = useState<GoogleTrendsResult | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadQueue = () => {
    fetchQueueStatus().then(res => {
      if (res.success) {
        setQueueData(res.queue);
      }
    }).catch(console.error);
  };

  useEffect(() => {
    loadQueue();
    // Fetch initial trends
    fetchGoogleTrends('Best AI tools for real estate agents').then(res => {
      if (res.success) {
        setTrendsResult(res.trends);
      }
    }).catch(() => {});
  }, []);

  const handleRunBatch = async () => {
    setIsProcessing(true);
    try {
      const res = await processQueueBatch(5);
      if (res.success) {
        setActionMessage(`Processed ${res.processed} background jobs successfully.`);
        loadQueue();
        setTimeout(() => setActionMessage(null), 3000);
      }
    } catch (err: any) {
      setActionMessage(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEnqueueSnapshot = async () => {
    await enqueueJob('SNAPSHOT_VIDEO', { videoId: 'vid_ai_001' }, 'HIGH');
    setActionMessage('High-Priority Video Snapshot Job enqueued.');
    loadQueue();
    setTimeout(() => setActionMessage(null), 2500);
  };

  const handleSyncTrends = async () => {
    if (!testKeyword.trim()) return;
    const res = await fetchGoogleTrends(testKeyword.trim());
    if (res.success) {
      setTrendsResult(res.trends);
      setActionMessage(`Google Trends data synced for "${testKeyword}".`);
      setTimeout(() => setActionMessage(null), 2500);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-950/20 via-cyan-950/10 to-transparent border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Multi-Source Feeds & Background Queue Engine
            </h2>
            <p className="text-xs text-slate-400">
              Multi-source data architecture with primary YouTube telemetry, secondary Google Trends signals, and automated priority queue workers.
            </p>
          </div>
        </div>
      </div>

      {/* 4 Multi-Source Providers Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
        
        {/* Provider 1: YouTube Data API v3 */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Primary: YouTube API
            </span>
            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-600">
              Official
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Video search, public view counts, like counts, channel stats, and publication timestamps.
          </p>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500">
            Status: <strong className="text-emerald-600">Connected (Quota Managed)</strong>
          </div>
        </div>

        {/* Provider 2: Google Trends */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-500" />
              Secondary: Google Trends
            </span>
            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-cyan-50 dark:bg-cyan-950 text-cyan-600">
              Demand
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Measures 12-month relative query interest (0–100) and breakout rising search queries.
          </p>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500">
            Status: <strong className="text-emerald-600">Active (Relative Index Only)</strong>
          </div>
        </div>

        {/* Provider 3: YouTube Analytics API */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              First-Party: Studio Analytics
            </span>
            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950 text-rose-600">
              OAuth2
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Private watch time, average view duration, search vs browse vs suggested splits for own channel.
          </p>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500">
            Status: <strong className="text-emerald-600">Authenticated (Strictly Isolated)</strong>
          </div>
        </div>

        {/* Provider 4: Live Public Autocomplete */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Zero-Quota: Autocomplete
            </span>
            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950 text-amber-600">
              0 Cost
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Live real-time YouTube search suggestions directly from edge servers without burning API quota.
          </p>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500">
            Status: <strong className="text-emerald-600">Real-Time Streaming</strong>
          </div>
        </div>

      </div>

      {/* Background Job Queue Section (Section 10 of new prompt) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              <span>Background Job Queue & Priority Workers</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated scheduler processing snapshots, trend syncing, and opportunity scoring with exponential backoff.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleEnqueueSnapshot}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-xs font-semibold"
            >
              + Queue Video Snapshot
            </button>
            <button
              onClick={handleRunBatch}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 text-xs font-bold shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isProcessing ? 'Processing...' : 'Run Worker Batch (5 Jobs)'}</span>
            </button>
          </div>
        </div>

        {actionMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
            {actionMessage}
          </div>
        )}

        {/* Status Counts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
          <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
            <span className="text-[10px] font-bold text-amber-600 block uppercase">Pending Jobs</span>
            <strong className="text-base text-amber-700 dark:text-amber-400">{queueData?.counts?.PENDING || 0}</strong>
          </div>
          <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
            <span className="text-[10px] font-bold text-blue-600 block uppercase">Processing</span>
            <strong className="text-base text-blue-700 dark:text-blue-400">{queueData?.counts?.PROCESSING || 0}</strong>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900">
            <span className="text-[10px] font-bold text-emerald-600 block uppercase">Completed</span>
            <strong className="text-base text-emerald-700 dark:text-emerald-400">{queueData?.counts?.COMPLETED || 0}</strong>
          </div>
          <div className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900">
            <span className="text-[10px] font-bold text-rose-600 block uppercase">Failed (Logged)</span>
            <strong className="text-base text-rose-700 dark:text-rose-400">{queueData?.counts?.FAILED || 0}</strong>
          </div>
        </div>

        {/* Recent Jobs Ledger Table */}
        <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex justify-between">
            <span>Recent Queue Operations</span>
            <span>Priority Queue: HIGH &gt; NORMAL &gt; LOW</span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-56 overflow-y-auto">
            {queueData?.recentJobs.map((job) => (
              <div key={job.id} className="px-4 py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                    job.priority === 'HIGH' ? 'bg-red-100 text-red-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                  }`}>
                    {job.priority}
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{job.job_type}</span>
                  <span className="text-[11px] text-slate-400 font-mono truncate max-w-xs">{job.payload}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    job.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                    job.status === 'PENDING' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                    'bg-rose-100 text-rose-700'
                  }`}>
                    {job.status}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(job.created_at).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Google Trends Secondary Signal Tester */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-500" />
              <span>Google Trends Secondary Demand Stream</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Measures relative query interest on a 0–100 index and identifies breakout rising subtopics.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={testKeyword}
            onChange={(e) => setTestKeyword(e.target.value)}
            className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
            placeholder="Enter keyword to query trends..."
          />
          <button
            onClick={handleSyncTrends}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs"
          >
            Query Trends
          </button>
        </div>

        {trendsResult && (
          <div className="p-4 rounded-2xl bg-cyan-50/30 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800 text-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-cyan-600 uppercase">Relative Search Interest Index</span>
                <div className="text-xl font-black text-slate-900 dark:text-white">{trendsResult.relativeInterest} / 100</div>
              </div>
              <span className="text-[11px] text-slate-400">Region: {trendsResult.region}</span>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px]">Breakout Rising Queries Detected:</span>
              <div className="flex flex-wrap gap-2">
                {trendsResult.risingQueries.map((rq, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-cyan-200 dark:border-cyan-800 text-[11px] font-medium">
                    {rq.query} <strong className="text-emerald-500 font-extrabold">{rq.breakout_percentage}</strong>
                  </span>
                ))}
              </div>
            </div>

            <p className="text-[10px] text-slate-400 italic pt-1 border-t border-cyan-100 dark:border-cyan-900">
              Disclaimer: {trendsResult.disclaimer}
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
