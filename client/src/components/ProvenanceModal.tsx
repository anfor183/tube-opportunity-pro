import React from 'react';
import { X, ShieldCheck, Database, Cpu, Info, CheckCircle2, AlertTriangle, Layers, Calendar } from 'lucide-react';
import { MetricProvenance } from '../lib/types';

interface Props {
  provenance: MetricProvenance | null;
  onClose: () => void;
}

export const ProvenanceModal: React.FC<Props> = ({ provenance, onClose }) => {
  if (!provenance) return null;

  const sourceTypeBadge = {
    OFFICIAL_API: {
      label: 'Official YouTube API',
      color: 'bg-blue-500 text-white',
      desc: 'Direct public telemetry confirmed by YouTube platform servers.'
    },
    OBSERVED_SNAPSHOT: {
      label: 'Observed Historical Snapshot',
      color: 'bg-emerald-500 text-white',
      desc: 'Actual immutable time-series observations recorded directly into SQLite.'
    },
    CALCULATED: {
      label: 'Calculated from Snapshots',
      color: 'bg-indigo-500 text-white',
      desc: 'Deterministic mathematical calculation derived from observed snapshot points.'
    },
    ESTIMATED: {
      label: 'Statistical Estimate',
      color: 'bg-purple-500 text-white',
      desc: 'Statistical model-derived estimate with explicit decay parameters.'
    },
    MODELED: {
      label: 'Multi-Signal Heuristic Model',
      color: 'bg-amber-500 text-white',
      desc: 'Composite score synthesizing multiple external indicators.'
    },
    THIRD_PARTY: {
      label: 'Third-Party Source (Google Trends)',
      color: 'bg-cyan-600 text-white',
      desc: 'External public index measuring relative interest (not absolute search volume).'
    },
    USER_PROVIDED: {
      label: 'User Authenticated (Own Channel)',
      color: 'bg-rose-500 text-white',
      desc: 'Private first-party channel analytics authorized via Google OAuth2.'
    },
    UNAVAILABLE: {
      label: 'Data Unavailable',
      color: 'bg-slate-500 text-white',
      desc: 'Metric cannot be determined without private channel owner access.'
    }
  }[provenance.source_type] || {
    label: provenance.source_type,
    color: 'bg-slate-700 text-white',
    desc: 'Standard system classification.'
  };

  const confidenceBadge = {
    HIGH: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200',
    MEDIUM: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200',
    LOW: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200'
  }[provenance.confidence] || 'bg-slate-100 text-slate-700';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-600/10 via-emerald-600/10 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Data Provenance & Verification
              </h3>
              <p className="text-[11px] text-slate-400">
                Where did this number come from? (Anti-Hallucination Standard)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-xs">
          
          {/* Metric Highlight Box */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Inspected Metric
              </span>
              <span className="text-base font-black text-slate-900 dark:text-white">
                {provenance.metric}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Value
              </span>
              <span className="text-base font-black text-red-600 dark:text-red-400">
                {provenance.value}
              </span>
            </div>
          </div>

          {/* Classification & Confidence Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${sourceTypeBadge.color}`}>
              {sourceTypeBadge.label}
            </span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${confidenceBadge}`}>
              Confidence: {provenance.confidence}
            </span>
            {provenance.label && (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {provenance.label}
              </span>
            )}
          </div>

          <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed italic bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 p-3 rounded-xl">
            {sourceTypeBadge.desc}
          </p>

          {/* Methodology & Calculation Details */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 uppercase text-[10px] tracking-wider text-slate-400">
              <Info className="w-3.5 h-3.5" />
              Methodology & Calculation
            </h4>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50/50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
              {provenance.methodology}
            </p>
          </div>

          {/* Model Inputs */}
          {provenance.inputs && provenance.inputs.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-900 dark:text-white uppercase text-[10px] tracking-wider text-slate-400">
                Underlying Inputs Used
              </h4>
              <div className="space-y-1">
                {provenance.inputs.map((inp, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{inp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Meta Details */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3 text-[11px] text-slate-400">
            <div>
              <span>Provider:</span> <strong className="text-slate-700 dark:text-slate-300 block">{provenance.provider}</strong>
            </div>
            <div>
              <span>Observations Used:</span> <strong className="text-slate-700 dark:text-slate-300 block">{provenance.snapshot_count} snapshot records</strong>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
