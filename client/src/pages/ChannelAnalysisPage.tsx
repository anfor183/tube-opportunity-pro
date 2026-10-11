import React, { useState, useEffect } from 'react';
import { Tv, Flame, ArrowUpRight, CheckCircle2, AlertTriangle, Users, TrendingUp } from 'lucide-react';
import { Channel, Video } from '../lib/types';

export const ChannelAnalysisPage: React.FC<{ onSelectVideo: (vid: string) => void }> = ({ onSelectVideo }) => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<string>('UC_ai_guru_99');
  const [channelData, setChannelData] = useState<{
    channel: Channel;
    stats: any;
    topVideos: Video[];
    outliers: Video[];
  } | null>(null);

  // Compare mode
  const [compareChannelId, setCompareChannelId] = useState<string>('UC_tech_titan');
  const [compareData, setCompareData] = useState<any>(null);

  useEffect(() => {
    // Fetch channels list from seed
    fetch('/api/channels/UC_ai_guru_99')
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          setChannelData(res);
        }
      })
      .catch(console.error);
  }, []);

  const handleSelectChannel = (id: string) => {
    setSelectedChannelId(id);
    fetch(`/api/channels/${id}`)
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          setChannelData(res);
        }
      })
      .catch(console.error);
  };

  const handleCompare = () => {
    fetch('/api/channels/compare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channelAId: selectedChannelId, channelBId: compareChannelId })
    })
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          setCompareData(res.comparison);
        }
      })
      .catch(console.error);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-red-950/20 via-pink-950/10 to-transparent border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-red-500 text-white flex items-center justify-center shadow-md shadow-red-500/20">
            <Tv className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Channel Opportunity & Competitor Head-to-Head (Sections 35 & 36)
            </h2>
            <p className="text-xs text-slate-400">
              Audit creator content portfolios, detect hidden outliers, and identify content gaps they are neglecting.
            </p>
          </div>
        </div>
      </div>

      {/* Select Channel Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-400">Select Channel:</span>
          <select
            value={selectedChannelId}
            onChange={(e) => handleSelectChannel(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl font-bold"
          >
            <option value="UC_ai_guru_99">AI Automation Labs (4.8K subs - High Outlier)</option>
            <option value="UC_tech_titan">TechTitan Mega (2.45M subs - Legacy Incumbent)</option>
            <option value="UC_faith_daily">Morning Grace Daily (7.2K subs - Evergreen)</option>
            <option value="UC_fx_trader_sam">PipMaster Sam FX (9.4K subs)</option>
            <option value="UC_galaxy_geek">Galaxy Hacks & Tips (3.4K subs)</option>
          </select>
        </div>

        {/* Channel vs Channel Comparison Launcher */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Compare vs:</span>
          <select
            value={compareChannelId}
            onChange={(e) => setCompareChannelId(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 rounded-xl font-medium"
          >
            <option value="UC_tech_titan">TechTitan Mega</option>
            <option value="UC_ai_guru_99">AI Automation Labs</option>
            <option value="UC_mega_ministry">Global Faith Network</option>
          </select>
          <button
            onClick={handleCompare}
            className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:opacity-90"
          >
            Head-to-Head
          </button>
        </div>
      </div>

      {/* Head to Head Comparison View (Section 36) */}
      {compareData && (
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
            Channel Head-to-Head Comparison
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="font-extrabold text-sm text-slate-900 dark:text-white block mb-1">
                {compareData.channelA.title}
              </span>
              <div className="space-y-1 text-slate-600 dark:text-slate-400">
                <div>Subscribers: <strong>{compareData.channelA.subscriber_count.toLocaleString()}</strong></div>
                <div>Authority Score: <strong>{compareData.channelA.authority_score}/100</strong></div>
                <div>Lifetime Views: <strong>{compareData.channelA.view_count.toLocaleString()}</strong></div>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="font-extrabold text-sm text-slate-900 dark:text-white block mb-1">
                {compareData.channelB.title}
              </span>
              <div className="space-y-1 text-slate-600 dark:text-slate-400">
                <div>Subscribers: <strong>{compareData.channelB.subscriber_count.toLocaleString()}</strong></div>
                <div>Authority Score: <strong>{compareData.channelB.authority_score}/100</strong></div>
                <div>Lifetime Views: <strong>{compareData.channelB.view_count.toLocaleString()}</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Channel Deep Dive Analysis (Section 35) */}
      {channelData && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Channel Portfolio Stats (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Channel Portfolio Overview</span>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {channelData.channel.title}
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">Subscribers</span>
                  <strong className="text-slate-900 dark:text-white">{channelData.channel.subscriber_count.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">Average Views / Video</span>
                  <strong className="text-slate-900 dark:text-white">{channelData.stats?.averageViews?.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">Outlier Count</span>
                  <strong className="text-red-500 font-extrabold">{channelData.stats?.outlierCount} Outliers</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Highest Outlier Multiplier</span>
                  <strong className="text-emerald-600 font-extrabold">{channelData.stats?.highestOutlierRatio}x</strong>
                </div>
              </div>
            </div>

            {/* Strategic Insights */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-3">
              <div>
                <h4 className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>What This Channel Does That Works</span>
                </h4>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  Focuses heavily on specific problem-solving tutorial hooks and immediate value delivery in the first 15 seconds.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Opportunities They Are Missing</span>
                </h4>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  Completely fails to create supporting video clusters for mobile or beginner setup, leaving easy rankings on the table for you.
                </p>
              </div>
            </div>
          </div>

          {/* Top Video Outliers (8 cols) */}
          <div className="lg:col-span-8">
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-5 space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Top Performing Videos & Outlier Signals
              </h3>

              <div className="space-y-2">
                {channelData.topVideos.map((vid) => (
                  <div
                    key={vid.id}
                    onClick={() => onSelectVideo(vid.video_id)}
                    className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-slate-300 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="max-w-md">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-red-600 truncate">
                        {vid.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Views/Day: +{vid.views_per_day.toLocaleString()} • Age: {vid.freshness_years} yrs
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                        {vid.view_count.toLocaleString()} views
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-600 font-extrabold text-xs">
                        {vid.outlier_ratio}x
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
