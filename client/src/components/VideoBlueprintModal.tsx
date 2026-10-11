import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Sparkles, Clock, Layout, ListOrdered, Target, Tag, Layers, Flame } from 'lucide-react';
import { fetchBlueprint } from '../lib/api';
import { VideoBlueprint, Keyword } from '../lib/types';
import { OpportunityScoreBadge } from './OpportunityScoreBadge';

interface Props {
  keywordId: number | null;
  onClose: () => void;
}

export const VideoBlueprintModal: React.FC<Props> = ({ keywordId, onClose }) => {
  const [data, setData] = useState<{ keyword: Keyword; blueprint: VideoBlueprint } | null>(null);
  const [copiedTitle, setCopiedTitle] = useState<string | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  useEffect(() => {
    if (!keywordId) return;
    fetchBlueprint(keywordId).then(res => {
      if (res.success) {
        setData(res);
      }
    }).catch(console.error);
  }, [keywordId]);

  if (!keywordId) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    if (label.startsWith('title-')) {
      setCopiedTitle(label);
      setTimeout(() => setCopiedTitle(null), 2000);
    } else {
      setCopiedSection(label);
      setTimeout(() => setCopiedSection(null), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-red-600/10 via-transparent to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-500/20">
              <Sparkles className="w-4 h-4 fill-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Video Production Blueprint
              </h2>
              <p className="text-xs text-slate-400">
                AI & Heuristic Generated Video Attack Plan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!data ? (
            <div className="py-20 text-center">
              <div className="animate-spin text-2xl mb-2">⏳</div>
              <p className="text-xs text-slate-400">Generating video blueprint & script parameters...</p>
            </div>
          ) : (
            <>
              {/* Top Summary Bar */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Primary Target Keyword
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {data.blueprint.primaryKeyword}
                  </h3>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Intent</span>
                    <strong className="text-slate-700 dark:text-slate-200">{data.blueprint.searchIntent}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Recommended Length</span>
                    <strong className="text-slate-700 dark:text-slate-200">{data.blueprint.recommendedDuration}</strong>
                  </div>
                  <OpportunityScoreBadge score={data.keyword.opportunity_score} size="md" />
                </div>
              </div>

              {/* 1. Recommended Clickable Titles (Section 21) */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white mb-2 flex items-center justify-between">
                  <span>5–10 High-CTR Title Concepts (Click to copy)</span>
                  <span className="text-[11px] text-slate-400 font-normal">Ranked for Search & Browse</span>
                </h4>
                <div className="space-y-1.5">
                  {data.blueprint.recommendedTitles.map((title, i) => (
                    <div
                      key={i}
                      onClick={() => copyToClipboard(title, `title-${i}`)}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-red-500 transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-red-600 transition-colors">
                        {title}
                      </span>
                      <button className="text-xs text-slate-400 group-hover:text-slate-600 flex items-center gap-1">
                        {copiedTitle === `title-${i}` ? (
                          <span className="text-emerald-500 font-bold flex items-center gap-1 text-[11px]">
                            <Check className="w-3.5 h-3.5" /> Copied!
                          </span>
                        ) : (
                          <Copy className="w-3.5 h-3.5 opacity-60" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Hook Script (First 15 Seconds) */}
              <div className="p-4 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                    <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                    Recommended Hook Script (First 15 Seconds)
                  </span>
                  <button
                    onClick={() => copyToClipboard(data.blueprint.recommendedHook, 'hook')}
                    className="text-[11px] font-bold text-amber-600 hover:underline flex items-center gap-1"
                  >
                    {copiedSection === 'hook' ? 'Copied!' : 'Copy Script'}
                  </button>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed">
                  {data.blueprint.recommendedHook}
                </p>
              </div>

              {/* 3. Thumbnail Concepts & Visual Strategy */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                  <Layout className="w-3.5 h-3.5 text-slate-400" />
                  <span>Thumbnail Visual Architecture</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {data.blueprint.thumbnailConcepts.map((thumb, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                        Concept {idx + 1}: {thumb.concept}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                        <div>Visual: <strong>{thumb.leftSide || thumb.graphic}</strong></div>
                        <div>Overlay Text: <span className="px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-950 text-red-600 font-bold">{thumb.textOverlay}</span></div>
                        <div>Palette: {thumb.colorScheme}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Video Chapters & Structure */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Video Chapters & Timeline
                  </span>
                  <button
                    onClick={() => {
                      const chaptersTxt = data.blueprint.chapters.map(c => `${c.time} - ${c.title}`).join('\n');
                      copyToClipboard(chaptersTxt, 'chapters');
                    }}
                    className="text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  >
                    {copiedSection === 'chapters' ? 'Copied!' : 'Copy Chapters'}
                  </button>
                </h4>
                <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800">
                  {data.blueprint.chapters.map((ch, idx) => (
                    <div key={idx} className="px-4 py-2 flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-red-500 w-14">{ch.time}</span>
                      <span className="flex-1 font-medium text-slate-700 dark:text-slate-300">{ch.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. Section 55: Content Cluster Strategy (Pillar + Supporting Videos) */}
              <div className="p-4 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/60">
                <span className="text-xs font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5 mb-2">
                  <Layers className="w-4 h-4 text-indigo-500" />
                  Topical Authority Cluster Strategy
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                  Do not make this a standalone video. Build algorithmic authority by publishing these supporting videos:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {data.blueprint.supportingClusterVideos.map((vid, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-white/70 dark:bg-slate-900/70 border border-indigo-100 dark:border-indigo-900 text-xs font-medium text-slate-700 dark:text-slate-300">
                      • {vid}
                    </div>
                  ))}
                </div>
              </div>

              {/* 6. Description & Tags */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white mb-2 flex items-center justify-between">
                  <span>Optimized YouTube Description & Tags</span>
                  <button
                    onClick={() => copyToClipboard(data.blueprint.description, 'desc')}
                    className="text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  >
                    {copiedSection === 'desc' ? 'Copied!' : 'Copy Description'}
                  </button>
                </h4>
                <pre className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] font-mono text-slate-600 dark:text-slate-300 whitespace-pre-wrap max-h-40 overflow-y-auto">
                  {data.blueprint.description}
                </pre>
              </div>

            </>
          )}
        </div>

      </div>
    </div>
  );
};
