import React, { useState } from 'react';
import { X, Zap, CheckCircle2, Sliders, ShieldCheck, Sparkles, AlertCircle, ArrowUpRight, Compass, RefreshCw, Info } from 'lucide-react';
import { findVideoOpportunity, mineNicheOpportunities } from '../lib/api';
import { Recommendation, NicheStats } from '../lib/types';
import { OpportunityScoreBadge } from './OpportunityScoreBadge';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectBlueprint: (kwId: number) => void;
}

export const FindVideoWizardModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSelectBlueprint
}) => {
  const [niche, setNiche] = useState('');
  const [channelSize, setChannelSize] = useState('New');
  const [goal, setGoal] = useState('Evergreen');
  const [minScore, setMinScore] = useState(65);
  const [maxComp, setMaxComp] = useState(65);
  const [videoType, setVideoType] = useState('Tutorial');

  const [isLoading, setIsLoading] = useState(false);
  const [isMining, setIsMining] = useState(false);
  const [mineStatus, setMineStatus] = useState<string | null>(null);

  const [recommendations, setRecommendations] = useState<Recommendation[] | null>(null);
  const [nearMatches, setNearMatches] = useState<Recommendation[]>([]);
  const [nicheStats, setNicheStats] = useState<NicheStats | null>(null);
  const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null);

  if (!isOpen) return null;

  const handleRunDiscovery = async () => {
    setIsLoading(true);
    try {
      const res = await findVideoOpportunity({
        niche: niche.trim() || undefined,
        channelSize,
        goal,
        minOpportunityScore: minScore,
        maxCompetition: maxComp,
        preferredVideoType: videoType
      });
      if (res.success) {
        const recs = res.recommendations || [];
        const nears = res.nearMatches || [];
        setRecommendations(recs);
        setNearMatches(nears);
        setNicheStats(res.nicheStats || null);
        if (recs.length > 0) {
          setSelectedRec(recs[0]);
        } else if (nears.length > 0) {
          setSelectedRec(nears[0]);
        } else {
          setSelectedRec(null);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMineTopics = async () => {
    const targetNiche = niche.trim() || 'Finance';
    setIsMining(true);
    setMineStatus(`Mining YouTube Data API v3 for high-potential ${targetNiche} long-tails...`);
    try {
      const res = await mineNicheOpportunities(targetNiche, 3);
      if (res.success) {
        setMineStatus(`Mined ${res.minedCount} new topics! Refreshing recommendations...`);
        await handleRunDiscovery();
      } else {
        setMineStatus(res.error || 'Could not mine topics.');
      }
    } catch (err: any) {
      setMineStatus(err.message || 'Mining failed.');
    } finally {
      setIsMining(false);
      setTimeout(() => setMineStatus(null), 5000);
    }
  };

  const hasAnyResults = (recommendations && recommendations.length > 0) || nearMatches.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-red-600/10 via-amber-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-500/30">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Find Me a Video to Make</span>
                <span className="text-xs uppercase font-extrabold px-2 py-0.5 rounded-full bg-red-500 text-white">
                  Section 75 Engine
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Filter by your channel profile to reveal the highest ROI evergreen video opportunities.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters Form Controls */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800 grid grid-cols-2 md:grid-cols-6 gap-3 text-xs">
          
          {/* Niche */}
          <div>
            <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Niche / Topic</label>
            <input
              type="text"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="e.g. Finance, AI, Tech"
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          {/* Channel Size */}
          <div>
            <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Your Channel Size</label>
            <select
              value={channelSize}
              onChange={(e) => setChannelSize(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:outline-none"
            >
              <option value="New">New Channel (&lt;1K subs)</option>
              <option value="Small">Small Channel (&lt;10K subs)</option>
              <option value="Medium">Medium Channel (10K-100K)</option>
              <option value="Any">Any Channel Size</option>
            </select>
          </div>

          {/* Traffic Goal */}
          <div>
            <label className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Traffic Strategy</label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:outline-none"
            >
              <option value="Evergreen">🌲 Evergreen (Multi-Year)</option>
              <option value="Viral">🔥 Viral (High Outlier)</option>
              <option value="Both">⚡ Balanced Blend</option>
            </select>
          </div>

          {/* Minimum Score */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-600 dark:text-slate-300">Min Score</label>
              <span className="text-red-500 font-extrabold">{minScore}</span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              value={minScore}
              onChange={(e) => setMinScore(parseInt(e.target.value))}
              className="w-full accent-red-600 cursor-pointer mt-1"
            />
          </div>

          {/* Max Competition */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-600 dark:text-slate-300">Max Comp</label>
              <span className="text-emerald-500 font-extrabold">{maxComp}</span>
            </div>
            <input
              type="range"
              min="20"
              max="85"
              value={maxComp}
              onChange={(e) => setMaxComp(parseInt(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer mt-1"
            />
          </div>

          {/* Run Action */}
          <div className="flex items-end gap-1.5">
            <button
              onClick={handleRunDiscovery}
              disabled={isLoading || isMining}
              className="flex-1 py-2 px-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-sm shadow-red-500/30 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <span className="animate-spin text-xs">⏳</span>
              ) : (
                <Sparkles className="w-3.5 h-3.5 fill-white" />
              )}
              <span>{isLoading ? 'Scanning...' : 'Find Videos'}</span>
            </button>
          </div>

        </div>

        {/* Live Mining Status Toast */}
        {mineStatus && (
          <div className="px-6 py-2 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 flex items-center gap-2">
            <RefreshCw className={`w-3.5 h-3.5 ${isMining ? 'animate-spin' : ''}`} />
            <span>{mineStatus}</span>
          </div>
        )}

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {!recommendations ? (
            <div className="py-16 text-center max-w-md mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-red-50 dark:bg-red-950/40 text-red-600 mx-auto flex items-center justify-center mb-4">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Ready to find your next winning video?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 mb-6 leading-relaxed">
                Click <strong>"Find Videos"</strong> to run our multi-signal engine against search demand, competition weakness, small-channel outliers, and evergreen persistence.
              </p>
              <button
                onClick={handleRunDiscovery}
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-md shadow-red-600/30 transition-all inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 fill-white" />
                <span>Run Discovery Scan Now</span>
              </button>
            </div>
          ) : !hasAnyResults ? (
            <div className="py-16 text-center max-w-md mx-auto space-y-4">
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-2" />
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                No matching opportunities found for these strict filters.
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                In competitive niches like Finance or Tech, average competition is often 65–75. Try relaxing Min Score (e.g. 60) or Max Competition (e.g. 70).
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setMinScore(60);
                    setMaxComp(75);
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Adjust Sliders to 60 / 75
                </button>
                <button
                  onClick={handleMineTopics}
                  disabled={isMining}
                  className="px-4 py-2 rounded-lg bg-red-600 text-xs font-bold text-white hover:bg-red-700 transition-colors inline-flex items-center gap-1.5 shadow-sm shadow-red-500/30"
                >
                  <Sparkles className="w-3.5 h-3.5 fill-white" />
                  <span>{isMining ? 'Mining YouTube...' : 'Mine 10 Live Topics'}</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Market Dynamics Alert Banner */}
              {nicheStats && (
                <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-blue-950 dark:text-blue-100 flex items-center gap-2">
                        <span>Market Reality: {nicheStats.niche} on YouTube</span>
                        <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                          Avg Niche Comp: {nicheStats.averageCompetition}/100
                        </span>
                      </div>
                      <p className="text-blue-800/80 dark:text-blue-300/80 text-[11px] mt-0.5">
                        {recommendations.length > 0 ? (
                          <>Found <strong>{recommendations.length} exact match(es)</strong> meeting strict constraints (Score &ge; {minScore}, Comp &le; {maxComp}) + <strong>{nearMatches.length} high-potential alternative angles</strong> below.</>
                        ) : (
                          <>No exact matches met strict constraints (Score &ge; {minScore}, Comp &le; {maxComp}), but <strong>{nearMatches.length} high-potential near matches</strong> are ready to explore below.</>
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleMineTopics}
                    disabled={isMining}
                    className="self-start sm:self-center px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-500/30 transition-all inline-flex items-center gap-1.5 shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5 fill-white" />
                    <span>{isMining ? 'Mining Live...' : '⚡ Mine 10 More Live Topics'}</span>
                  </button>
                </div>
              )}

              {/* Main 2-Column Discovery Interface */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Recommendations List (Left 5 cols) */}
                <div className="lg:col-span-5 space-y-3 overflow-y-auto max-h-[550px] pr-1">
                  
                  {/* Strict Matches */}
                  {recommendations && recommendations.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
                        <span>EXACT FILTER MATCHES ({recommendations.length})</span>
                        <span className="text-emerald-500 font-semibold text-[10px]">Passed All Sliders</span>
                      </div>

                      {recommendations.map((rec) => {
                        const isSelected = selectedRec?.keywordId === rec.keywordId;
                        return (
                          <div
                            key={rec.keywordId}
                            onClick={() => setSelectedRec(rec)}
                            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                              isSelected
                                ? 'border-red-500 bg-red-50/50 dark:bg-red-950/20 shadow-sm'
                                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="w-5 h-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black flex items-center justify-center shrink-0">
                                {rec.rank}
                              </span>
                              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate flex-1">
                                {rec.keyword}
                              </h4>
                              <OpportunityScoreBadge score={rec.opportunityScore} size="sm" />
                            </div>

                            <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
                              <span>Demand: <strong className="text-slate-700 dark:text-slate-300">{rec.demandScore}</strong></span>
                              <span>•</span>
                              <span>Comp: <strong className="text-emerald-600">{rec.competitionScore}</strong></span>
                              <span>•</span>
                              <span>Evergreen: <strong className="text-sky-600">{rec.evergreenScore}</strong></span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Near Matches / High Potential Alternatives */}
                  {nearMatches.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center justify-between">
                        <span>HIGH-POTENTIAL NEAR MATCHES ({nearMatches.length})</span>
                        <span className="text-[10px] font-medium text-slate-400">Alternative Angles</span>
                      </div>

                      {nearMatches.map((rec) => {
                        const isSelected = selectedRec?.keywordId === rec.keywordId;
                        return (
                          <div
                            key={rec.keywordId}
                            onClick={() => setSelectedRec(rec)}
                            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                              isSelected
                                ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 shadow-sm'
                                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                                {rec.rank}
                              </span>
                              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate flex-1">
                                {rec.keyword}
                              </h4>
                              <OpportunityScoreBadge score={rec.opportunityScore} size="sm" />
                            </div>

                            <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
                              <span>Demand: <strong className="text-slate-700 dark:text-slate-300">{rec.demandScore}</strong></span>
                              <span>•</span>
                              <span>Comp: <strong className={rec.competitionScore <= 50 ? 'text-emerald-600' : 'text-amber-600'}>{rec.competitionScore}</strong></span>
                              <span>•</span>
                              <span>Evergreen: <strong className="text-sky-600">{rec.evergreenScore}</strong></span>
                            </div>

                            {rec.nearMatchReason && (
                              <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1.5 line-clamp-1 italic">
                                ⚡ {rec.nearMatchReason}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>

                {/* Detailed Recommendation Breakdown (Right 7 cols) */}
                <div className="lg:col-span-7">
                  {selectedRec && (
                    <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
                      
                      {/* Title & Top Badges */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                              selectedRec.isNearMatch
                                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                                : 'bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400'
                            }`}>
                              {selectedRec.isNearMatch ? 'High-Potential Angle' : `Rank #${selectedRec.rank} Video Concept`}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Intent: {selectedRec.searchIntent}
                            </span>
                          </div>
                          <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                            “{selectedRec.keyword}”
                          </h3>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Category: {selectedRec.category} • {selectedRec.relevantVideosCount} live competitor videos analyzed
                          </p>
                        </div>
                        <OpportunityScoreBadge score={selectedRec.opportunityScore} size="lg" showLabel />
                      </div>

                      {/* Near Match Insight Note if applicable */}
                      {selectedRec.isNearMatch && selectedRec.nearMatchReason && (
                        <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-200 flex items-center gap-2">
                          <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                          <span><strong>Why this angle works:</strong> {selectedRec.nearMatchReason}</span>
                        </div>
                      )}

                      {/* Section 76: "BEFORE YOU MAKE IT" Checklist */}
                      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-3.5">
                        <div className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-wider mb-2 flex items-center justify-between">
                          <span>✓ "BEFORE YOU MAKE IT" CHECKLIST</span>
                          <span className="text-emerald-500 font-bold">
                            {selectedRec.checklist.filter(c => c.passed).length}/{selectedRec.checklist.length} Passed
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          {selectedRec.checklist.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className={`w-3.5 h-3.5 ${item.passed ? 'text-emerald-500' : 'text-slate-300'}`} />
                                <span className={item.passed ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'}>
                                  {item.item}
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-400 font-medium">
                                {item.note}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Top Competitor Intel */}
                      {selectedRec.topCompetitor && (
                        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-3.5">
                          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                            Leading Incumbent Competitor
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-xs">
                              {selectedRec.topCompetitor.title}
                            </span>
                            <span className="text-emerald-600 font-bold">
                              {(selectedRec.topCompetitor.views / 1000).toFixed(0)}K Views
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                            <span>Channel: {selectedRec.topCompetitor.channel} ({selectedRec.topCompetitor.subscribers.toLocaleString()} subs)</span>
                            <span>•</span>
                            <span className="text-red-500 font-bold">{selectedRec.topCompetitor.outlierRatio}x Outlier</span>
                            <span>•</span>
                            <span>Age: {selectedRec.topCompetitor.ageYears} yrs</span>
                          </div>
                        </div>
                      )}

                      {/* Why Now & Strategy Attack (Section 54) */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">
                          Why You Should Make This Now
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-white/60 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
                          {selectedRec.whyNow}
                        </p>
                      </div>

                      {/* Recommended Attack Angle */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">
                          🎯 Recommended Attack Strategy
                        </h4>
                        <p className="text-xs text-slate-700 dark:text-slate-200 font-medium bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 p-3 rounded-xl">
                          {selectedRec.recommendedAngle}
                        </p>
                      </div>

                      {/* Action Button: Generate Full Production Blueprint */}
                      <div className="pt-2">
                        <button
                          onClick={() => {
                            onClose();
                            onSelectBlueprint(selectedRec.keywordId);
                          }}
                          className="w-full py-3 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-black text-sm shadow-md transition-all flex items-center justify-center gap-2"
                        >
                          <span>Generate Complete Video Production Blueprint</span>
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
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
