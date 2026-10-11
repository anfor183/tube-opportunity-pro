import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, TrendingUp, Target, Plus, Video as VideoIcon, ArrowUpRight, ShieldCheck, HelpCircle } from 'lucide-react';
import { fetchPredictiveReport, recordPublishedOutcome } from '../lib/api';
import { PredictiveReport, PredictiveOutcome } from '../lib/types';
import { OpportunityScoreBadge } from '../components/OpportunityScoreBadge';

export const OutcomeTrackerPage: React.FC = () => {
  const [report, setReport] = useState<PredictiveReport | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [keywordId, setKeywordId] = useState(1);
  const [title, setTitle] = useState('');
  const [videoId, setVideoId] = useState('');
  const [publishedDate, setPublishedDate] = useState(new Date().toISOString().slice(0, 10));
  const [milestone, setMilestone] = useState(10000);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const loadData = () => {
    fetchPredictiveReport().then(res => {
      if (res.success) {
        setReport(res.report);
      }
    }).catch(console.error);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !videoId.trim()) return;

    try {
      const res = await recordPublishedOutcome({
        keywordId,
        videoId: videoId.trim(),
        title: title.trim(),
        publishedDate,
        targetMilestone: milestone
      });
      if (res.success) {
        setStatusMessage('Video successfully recorded for predictive feedback tracking!');
        setTitle('');
        setVideoId('');
        setIsModalOpen(false);
        loadData();
        setTimeout(() => setStatusMessage(null), 3500);
      }
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    }
  };

  if (!report) {
    return (
      <div className="py-20 text-center">
        <div className="animate-spin text-2xl mb-2">⏳</div>
        <span className="text-xs text-slate-400">Loading predictive learning calibrations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/20 via-teal-950/10 to-transparent border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Predictive Learning & Outcome Tracking (Proprietary Dataset)
            </h2>
            <p className="text-xs text-slate-400">
              Track actual performance against predicted opportunity scores to train our empirical YouTube algorithmic models.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Log a Published Video</span>
        </button>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
          {statusMessage}
        </div>
      )}

      {/* Model Calibration Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        
        <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Tracked Outcomes</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
            {report.totalTracked} Published Videos
          </span>
          <span className="text-[10px] text-emerald-500 font-bold">Under Immutable Snapshots</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Model Calibration Accuracy</span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">
            {report.modelCalibrationAccuracy}
          </span>
          <span className="text-[10px] text-slate-400">Predicted vs Actual 90-Day Range</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Empirical Validation Status</span>
          <span className="text-base font-black text-slate-800 dark:text-slate-200 mt-2 block">
            {report.validationStatus}
          </span>
          <span className="text-[10px] text-slate-400">Automated queue learning active</span>
        </div>

      </div>

      {/* Learned Factor Importance (What Actually Drives YouTube Views?) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-500" />
          <span>Learned Algorithmic Weights (Empirical Outcome Correlations)</span>
        </h3>
        <p className="text-xs text-slate-400">
          The system analyzes observed video outcomes to discover which opportunity attributes are most predictive of long-term YouTube traffic:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
          {report.featureWeightsLearned.map((f, i) => (
            <div key={i} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900 dark:text-white">{f.factor}</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold text-[11px]">
                  {f.predictivePower}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {f.recommendation}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Tracked Outcomes Ledger */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 font-bold text-xs uppercase tracking-wider text-slate-400">
          Tracked Creator Video Outcomes (Predicted vs Actual)
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold">
                <th className="py-3 px-4">Published Video</th>
                <th className="py-3 px-3 text-center">Predicted Score</th>
                <th className="py-3 px-3 text-right">Target Milestone</th>
                <th className="py-3 px-3 text-right">Actual Views (30d)</th>
                <th className="py-3 px-3 text-center">Accuracy Score</th>
                <th className="py-3 px-4">Learned Model Feedback</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {report.outcomes.map((out) => (
                <tr key={out.id} className="table-row-hover">
                  <td className="py-3.5 px-4 max-w-xs">
                    <span className="font-bold text-slate-900 dark:text-white block line-clamp-1">
                      {out.title}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ID: {out.video_id} • Pub: {out.published_date}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-center">
                    <OpportunityScoreBadge score={out.opportunity_score_predicted} size="sm" />
                  </td>

                  <td className="py-3 px-3 text-right text-slate-500 font-bold">
                    {out.target_views_milestone.toLocaleString()}
                  </td>

                  <td className="py-3 px-3 text-right text-emerald-600 font-extrabold">
                    {out.current_views.toLocaleString()}
                  </td>

                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 font-bold">
                      {out.accuracy_score}%
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-[11px] text-slate-600 dark:text-slate-300 italic">
                    {out.learning_insights}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Log a Published Video */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Log a Published Video
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Register a video you published based on TubeOpportunity recommendations. The system will schedule recurring snapshots to compare predicted vs actual performance.
            </p>

            <form onSubmit={handleRecord} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-500 mb-1">Target Keyword Opportunity</label>
                <select
                  value={keywordId}
                  onChange={(e) => setKeywordId(parseInt(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-medium"
                >
                  <option value={1}>Best AI tools for real estate agents (Score: 84.4)</option>
                  <option value={2}>Bible prayers for breakthrough in finances (Score: 84.5)</option>
                  <option value={3}>How to use ChatGPT for automated bookkeeping (Score: 83.6)</option>
                  <option value={4}>Forex order block strategy for beginners (Score: 81.2)</option>
                  <option value={5}>Samsung Galaxy hidden battery settings (Score: 82.8)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1">Video Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 5 Best Free AI Tools For Realtors in 2026..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1">YouTube Video ID (or URL)</label>
                <input
                  type="text"
                  value={videoId}
                  onChange={(e) => setVideoId(e.target.value)}
                  placeholder="e.g. dQw4w9WgXcQ"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Published Date</label>
                  <input
                    type="date"
                    value={publishedDate}
                    onChange={(e) => setPublishedDate(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Target Views Milestone</label>
                  <input
                    type="number"
                    value={milestone}
                    onChange={(e) => setMilestone(parseInt(e.target.value))}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Start Tracking & Learn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
