import React, { useState, useEffect } from 'react';
import { Sliders, CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';
import { fetchScoringModes } from '../lib/api';

export const ScoringAdminPage: React.FC = () => {
  const [modes, setModes] = useState<any>({});
  const [activeMode, setActiveMode] = useState<string>('default');
  const [weights, setWeights] = useState<Record<string, number>>({
    demand: 0.20,
    competition: 0.15,
    supplyGap: 0.15,
    contentQualityGap: 0.15,
    evergreenPotential: 0.10,
    smallChannelProof: 0.08,
    outlierEvidence: 0.07,
    trendStability: 0.05,
    freshnessOpportunity: 0.03,
    searchIntent: 0.02
  });

  useEffect(() => {
    fetchScoringModes().then(res => {
      if (res.success) {
        setModes(res.modes);
        if (res.modes[activeMode]) {
          setWeights(res.modes[activeMode].weights);
        }
      }
    }).catch(console.error);
  }, []);

  const handleSelectMode = (modeKey: string) => {
    setActiveMode(modeKey);
    if (modes[modeKey]) {
      setWeights(modes[modeKey].weights);
    }
  };

  const handleWeightChange = (key: string, val: number) => {
    setWeights((prev: any) => ({ ...prev, [key]: val / 100 }));
  };

  const totalPercentage = Object.values(weights).reduce((a: number, b: number) => a + (b * 100), 0);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900/10 via-amber-950/10 to-transparent border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Opportunity Scoring Formula & Weights
            </h2>
            <p className="text-xs text-slate-400">
              Transparent, non-hardcoded weighting model. Tune weights dynamically or select specialized scoring modes.
            </p>
          </div>
        </div>
      </div>

      {/* Preset Scoring Modes */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Select Scoring Mode Preset
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(modes).map(([key, m]: [string, any]) => (
            <div
              key={key}
              onClick={() => handleSelectMode(key)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                activeMode === key
                  ? 'border-red-500 bg-red-50/50 dark:bg-red-950/20 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {m.name}
                </span>
                {activeMode === key && (
                  <CheckCircle2 className="w-4 h-4 text-red-500" />
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {m.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Weight Sliders */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Active Factor Weights Breakdown
          </h3>
          <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${
            Math.round(totalPercentage) === 100
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
              : 'bg-amber-100 text-amber-700'
          }`}>
            Total Weight: {Math.round(totalPercentage)}%
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          {Object.entries(weights).map(([k, val]: [string, number]) => (
            <div key={k} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300 mb-1.5 capitalize">
                <span>{k.replace(/([A-Z])/g, ' $1')}</span>
                <span className="text-red-500 font-extrabold">{Math.round(val * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={Math.round(val * 100)}
                onChange={(e) => handleWeightChange(k, parseInt(e.target.value))}
                className="w-full accent-red-600 cursor-pointer"
              />
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
          <button
            onClick={() => handleSelectMode('default')}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Default Balanced Formula</span>
          </button>
          <span className="text-[11px] text-slate-400">
            Formula dynamically drives all search and discovery ranking calculations.
          </span>
        </div>
      </div>

    </div>
  );
};
