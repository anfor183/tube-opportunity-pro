import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { DashboardPage } from './pages/DashboardPage';
import { DiscoverPage } from './pages/DiscoverPage';
import { HiddenGemsPage } from './pages/HiddenGemsPage';
import { OutlierExplorerPage } from './pages/OutlierExplorerPage';
import { ContentGapsPage } from './pages/ContentGapsPage';
import { EvergreenPage } from './pages/EvergreenPage';
import { CompetitorsPage } from './pages/CompetitorsPage';
import { ChannelAnalysisPage } from './pages/ChannelAnalysisPage';
import { WatchlistAlertsPage } from './pages/WatchlistAlertsPage';
import { ScoringAdminPage } from './pages/ScoringAdminPage';
import { SettingsPage } from './pages/SettingsPage';
import { DataFeedsPage } from './pages/DataFeedsPage';
import { OwnChannelPage } from './pages/OwnChannelPage';
import { OutcomeTrackerPage } from './pages/OutcomeTrackerPage';

import { FindVideoWizardModal } from './components/FindVideoWizardModal';
import { VideoBlueprintModal } from './components/VideoBlueprintModal';
import { CompetitorBeatabilityModal } from './components/CompetitorBeatabilityModal';
import { KeywordDetailModal } from './components/KeywordDetailModal';
import { ProvenanceModal } from './components/ProvenanceModal';

import { Keyword, SearchMode, MetricProvenance } from './lib/types';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isDark, setIsDark] = useState<boolean>(true);

  // Search routing state
  const [activeSearchQuery, setActiveSearchQuery] = useState<string>('');
  const [activeSearchMode, setActiveSearchMode] = useState<SearchMode>('default');

  // Modal states
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);
  const [blueprintKwId, setBlueprintKwId] = useState<number | null>(null);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [selectedKeyword, setSelectedKeyword] = useState<Keyword | null>(null);
  const [activeProvenance, setActiveProvenance] = useState<MetricProvenance | null>(null);

  // Dark mode class sync
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleGlobalSearch = (query: string, mode: SearchMode, category?: string, live?: boolean) => {
    setActiveSearchQuery(query);
    setActiveSearchMode(mode);
    setCurrentTab('discover');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#090D16] text-slate-800 dark:text-slate-100 transition-colors">
      
      {/* Navigation Header */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenWizard={() => setIsWizardOpen(true)}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'dashboard' && (
          <DashboardPage
            onSearch={handleGlobalSearch}
            onSelectKeyword={(kw) => setSelectedKeyword(kw)}
            onSelectVideo={(vid) => setSelectedVideoId(vid)}
            onOpenWizard={() => setIsWizardOpen(true)}
          />
        )}

        {currentTab === 'discover' && (
          <DiscoverPage
            initialQuery={activeSearchQuery}
            initialMode={activeSearchMode}
            onSelectKeyword={(kw) => setSelectedKeyword(kw)}
            onOpenBlueprint={(kwId) => setBlueprintKwId(kwId)}
            onSelectVideo={(vid) => setSelectedVideoId(vid)}
          />
        )}

        {currentTab === 'hidden-gems' && (
          <HiddenGemsPage
            onSelectKeyword={(kw) => setSelectedKeyword(kw)}
            onOpenBlueprint={(kwId) => setBlueprintKwId(kwId)}
          />
        )}

        {currentTab === 'outliers' && (
          <OutlierExplorerPage
            onSelectVideo={(vid) => setSelectedVideoId(vid)}
          />
        )}

        {currentTab === 'content-gaps' && (
          <ContentGapsPage
            onOpenBlueprint={(kwId) => setBlueprintKwId(kwId)}
          />
        )}

        {currentTab === 'evergreen' && (
          <EvergreenPage
            onSelectKeyword={(kw) => setSelectedKeyword(kw)}
            onOpenBlueprint={(kwId) => setBlueprintKwId(kwId)}
          />
        )}

        {currentTab === 'competitors' && (
          <CompetitorsPage
            onSelectVideo={(vid) => setSelectedVideoId(vid)}
          />
        )}

        {currentTab === 'channels' && (
          <ChannelAnalysisPage
            onSelectVideo={(vid) => setSelectedVideoId(vid)}
          />
        )}

        {currentTab === 'own-channel' && (
          <OwnChannelPage />
        )}

        {currentTab === 'outcomes' && (
          <OutcomeTrackerPage />
        )}

        {currentTab === 'data-feeds' && (
          <DataFeedsPage />
        )}

        {currentTab === 'watchlist' && (
          <WatchlistAlertsPage />
        )}

        {currentTab === 'scoring-admin' && (
          <ScoringAdminPage />
        )}

        {currentTab === 'settings' && (
          <SettingsPage />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <strong>TubeOpportunity PRO</strong> — YouTube Evergreen Keyword & Virality Opportunity Intelligence Platform
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>SQLite WAL Engine</span>
            <span>•</span>
            <span>YouTube Data API v3 Ready</span>
            <span>•</span>
            <span>Real YouTube Data Verified</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <FindVideoWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onSelectBlueprint={(kwId) => setBlueprintKwId(kwId)}
      />

      <VideoBlueprintModal
        keywordId={blueprintKwId}
        onClose={() => setBlueprintKwId(null)}
      />

      <CompetitorBeatabilityModal
        videoId={selectedVideoId}
        onClose={() => setSelectedVideoId(null)}
      />

      <KeywordDetailModal
        keyword={selectedKeyword}
        onClose={() => setSelectedKeyword(null)}
        onOpenBlueprint={(kwId) => setBlueprintKwId(kwId)}
        onSelectVideo={(vid) => setSelectedVideoId(vid)}
      />

      <ProvenanceModal
        provenance={activeProvenance}
        onClose={() => setActiveProvenance(null)}
      />

    </div>
  );
};

export default App;
