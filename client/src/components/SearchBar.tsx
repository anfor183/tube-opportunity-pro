import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, Filter, X, ArrowRight, CornerDownLeft, Zap } from 'lucide-react';
import { SearchMode } from '../lib/types';

interface Props {
  onSearch: (query: string, mode: SearchMode, category?: string, live?: boolean) => void;
  initialQuery?: string;
  initialMode?: SearchMode;
}

export const SearchBar: React.FC<Props> = ({
  onSearch,
  initialQuery = '',
  initialMode = 'default'
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [activeMode, setActiveMode] = useState<SearchMode>(initialMode);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const searchModes: Array<{ id: SearchMode; label: string; icon: string }> = [
    { id: 'default', label: 'All Opportunities', icon: '✨' },
    { id: 'keyword', label: 'Keyword Research', icon: '🔍' },
    { id: 'topic', label: 'Topic Discovery', icon: '🧭' },
    { id: 'hidden_gems', label: 'Hidden Gems', icon: '💎' },
    { id: 'content_gaps', label: 'Content Gaps', icon: '🧩' },
    { id: 'competitor', label: 'Competitor Analysis', icon: '⚔️' },
    { id: 'outliers', label: 'Outlier Videos', icon: '🔥' },
    { id: 'evergreen', label: 'Evergreen Opportunities', icon: '🌲' },
    { id: 'small_channel', label: 'Small Channel Winners', icon: '🚀' },
    { id: 'trending', label: 'Trending Opportunities', icon: '📈' },
    { id: 'long_tail', label: 'Long-Tail Discovery', icon: '🎯' }
  ];

  const quickExamples = [
    'Christian prayer',
    'AI automation',
    'Forex trading',
    'Samsung Galaxy',
    'How to use ChatGPT',
    'Bible prayers for breakthrough'
  ];

  const categories = ['All', 'Tech & AI', 'Finance', 'Lifestyle & Faith', 'Consumer Tech', 'Software Development', 'Health & Fitness'];

  // Fetch live autocomplete suggestions as user types
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.liveSuggestions && data.liveSuggestions.length > 0) {
          setSuggestions(data.liveSuggestions.slice(0, 7));
          setShowDropdown(true);
        }
      } catch (err) {}
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close suggestions
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDropdown(false);
    onSearch(query, activeMode, selectedCategory);
  };

  const handleSelectSuggestion = (s: string) => {
    setQuery(s);
    setShowDropdown(false);
    onSearch(s, activeMode, selectedCategory);
  };

  return (
    <div className="w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <span>Find your next YouTube opportunity</span>
          <span className="text-red-500 text-sm font-semibold px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900">
            Algorithmic Engine
          </span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Uncover high-demand, low-supply, evergreen video topics before your competition notices.
        </p>
      </div>

      {/* Main Search Input Form */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
            placeholder="Enter a keyword, topic, niche, or YouTube channel (or leave blank to auto-discover)..."
            className="w-full pl-12 pr-48 py-3.5 bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl text-sm sm:text-base font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500 transition-all text-slate-900 dark:text-slate-100"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); setSuggestions([]); }}
              className="absolute right-44 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <div className="absolute right-2 flex items-center gap-1.5">
            <button
              type="submit"
              className="px-3.5 py-2 rounded-lg bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1"
            >
              <span>Analyze</span>
              <CornerDownLeft className="w-3 h-3 opacity-70" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setShowDropdown(false);
                onSearch(query, activeMode, selectedCategory, true);
              }}
              className="px-3 py-2 rounded-lg bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1"
              title="Query YouTube Data API v3 directly and index fresh videos"
            >
              <Zap className="w-3 h-3 fill-white" />
              <span>Live YT</span>
            </button>
          </div>
        </div>

        {/* Live Autocomplete Suggestions Dropdown */}
        {showDropdown && suggestions.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden py-2"
          >
            <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              YouTube Real-Time Search Predictions
            </div>
            {suggestions.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSuggestion(item)}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between group transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-500" />
                  <span>{item}</span>
                </div>
                <ArrowRight className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        )}
      </form>

      {/* 10 Search Modes Horizontal Pills (Section 3) */}
      <div className="mt-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {searchModes.map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => {
                setActiveMode(mode.id);
                onSearch(query, mode.id, selectedCategory);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeMode === mode.id
                  ? 'bg-red-600 text-white shadow-sm shadow-red-600/30 font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>{mode.icon}</span>
              <span>{mode.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Example Queries & Category Filter */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-slate-400 font-medium">Examples:</span>
          {quickExamples.map((ex, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setQuery(ex);
                onSearch(ex, activeMode, selectedCategory);
              }}
              className="text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 underline decoration-slate-300 dark:decoration-slate-700"
            >
              “{ex}”
            </button>
          ))}
        </div>

        {/* Niche Category Selector */}
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400 font-medium">Niche:</span>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              onSearch(query, activeMode, e.target.value);
            }}
            className="bg-transparent font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
          >
            {categories.map((c) => (
              <option key={c} value={c} className="bg-white dark:bg-slate-900">
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
