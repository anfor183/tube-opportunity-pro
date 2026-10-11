// Frontend API Client with Multi-Source Endpoints

import { 
  Keyword, 
  Video, 
  Channel, 
  ContentGap, 
  VideoBlueprint, 
  Recommendation, 
  QuotaStatus, 
  SearchMode,
  MetricProvenance,
  GoogleTrendsResult,
  OwnChannelAnalyticsReport,
  BackgroundJob,
  PredictiveReport
} from './types';

const API_BASE = '/api';

export async function fetchDashboardData() {
  const res = await fetch(`${API_BASE}/dashboard`);
  return res.json();
}

export async function searchKeywords(query = '', mode: SearchMode = 'default', category?: string, live = false) {
  const params = new URLSearchParams();
  if (query) params.append('q', query);
  if (mode && mode !== 'default') params.append('mode', mode);
  if (category && category !== 'All') params.append('category', category);
  if (live) params.append('live', 'true');

  const res = await fetch(`${API_BASE}/search?${params.toString()}`);
  return res.json();
}

export async function ingestLiveKeyword(query: string, category?: string, maxResults = 25): Promise<{ success: boolean; result?: any; quota?: QuotaStatus; error?: string }> {
  const res = await fetch(`${API_BASE}/live-ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, category, maxResults })
  });
  return res.json();
}

export async function fetchHiddenGems() {
  const res = await fetch(`${API_BASE}/hidden-gems`);
  return res.json();
}

export async function fetchOutliers(minRatio = 10, maxSubs = 500000, minViews = 50000) {
  const res = await fetch(`${API_BASE}/outliers?minRatio=${minRatio}&maxSubs=${maxSubs}&minViews=${minViews}`);
  return res.json();
}

export async function fetchContentGaps() {
  const res = await fetch(`${API_BASE}/content-gaps`);
  return res.json();
}

export async function fetchKeywordDetail(id: number | string) {
  const res = await fetch(`${API_BASE}/keywords/${id}`);
  return res.json();
}

export async function fetchVideoDetail(id: string) {
  const res = await fetch(`${API_BASE}/videos/${id}`);
  return res.json();
}

export async function fetchBlueprint(kwId: number | string) {
  const res = await fetch(`${API_BASE}/blueprint/${kwId}`);
  return res.json();
}

export async function findVideoOpportunity(filters: {
  niche?: string;
  channelSize?: string;
  goal?: string;
  minOpportunityScore?: number;
  maxCompetition?: number;
  preferredVideoType?: string;
}) {
  const res = await fetch(`${API_BASE}/find-video`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(filters)
  });
  return res.json();
}

export async function mineNicheOpportunities(niche: string, count = 3) {
  const res = await fetch(`${API_BASE}/find-video/mine`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ niche, count })
  });
  return res.json();
}

export async function fetchWatchlist() {
  const res = await fetch(`${API_BASE}/watchlist`);
  return res.json();
}

export async function addToWatchlist(itemType: string, targetId: string | number, targetName: string) {
  const res = await fetch(`${API_BASE}/watchlist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ itemType, targetId, targetName })
  });
  return res.json();
}

export async function removeFromWatchlist(id: number) {
  const res = await fetch(`${API_BASE}/watchlist/${id}`, {
    method: 'DELETE'
  });
  return res.json();
}

export async function fetchQuotaStatus(): Promise<{ success: boolean; status: QuotaStatus; recentLogs?: any[] }> {
  const res = await fetch(`${API_BASE}/quota`);
  return res.json();
}

export async function updateApiKey(apiKey: string) {
  const res = await fetch(`${API_BASE}/settings/api-key`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey })
  });
  return res.json();
}

export async function testApiKey(): Promise<{ success: boolean; result: any; status?: QuotaStatus; recentLogs?: any[] }> {
  const res = await fetch(`${API_BASE}/settings/test-key`, {
    method: 'POST'
  });
  return res.json();
}

export async function fetchScoringModes() {
  const res = await fetch(`${API_BASE}/scoring-modes`);
  return res.json();
}

export async function triggerDailyScan() {
  const res = await fetch(`${API_BASE}/daily-scan`, {
    method: 'POST'
  });
  return res.json();
}

// Multi-Source API Helpers
export async function fetchMetricProvenance(
  metric: string, 
  value: any, 
  sourceType = 'OFFICIAL_API', 
  snapshotCount = 1,
  hasObserved = true
): Promise<{ success: boolean; explanation: MetricProvenance }> {
  const params = new URLSearchParams({
    metric,
    value: String(value),
    sourceType,
    snapshotCount: String(snapshotCount),
    hasObserved: String(hasObserved)
  });
  const res = await fetch(`${API_BASE}/provenance?${params.toString()}`);
  return res.json();
}

export async function fetchGoogleTrends(keyword: string, region = 'US'): Promise<{ success: boolean; trends: GoogleTrendsResult; history: any[] }> {
  const res = await fetch(`${API_BASE}/trends/${encodeURIComponent(keyword)}?region=${region}`);
  return res.json();
}

export async function fetchOwnChannelAnalytics(channelId = 'UC_CREATOR_PRO_DEMO'): Promise<{ success: boolean; report: OwnChannelAnalyticsReport }> {
  const res = await fetch(`${API_BASE}/analytics/own-channel?channelId=${channelId}`);
  return res.json();
}

export async function connectOwnChannel(channelId: string, title: string) {
  const res = await fetch(`${API_BASE}/analytics/connect-channel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ channelId, title })
  });
  return res.json();
}

export async function fetchQueueStatus(): Promise<{ success: boolean; queue: { counts: any; total: number; recentJobs: BackgroundJob[] } }> {
  const res = await fetch(`${API_BASE}/queue/status`);
  return res.json();
}

export async function processQueueBatch(limit = 5) {
  const res = await fetch(`${API_BASE}/queue/batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ limit })
  });
  return res.json();
}

export async function enqueueJob(jobType: string, payload: any, priority = 'NORMAL') {
  const res = await fetch(`${API_BASE}/queue/enqueue`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jobType, payload, priority })
  });
  return res.json();
}

export async function fetchPredictiveReport(): Promise<{ success: boolean; report: PredictiveReport }> {
  const res = await fetch(`${API_BASE}/outcomes`);
  return res.json();
}

export async function recordPublishedOutcome(data: {
  keywordId?: number;
  videoId: string;
  title: string;
  publishedDate: string;
  targetMilestone?: number;
}) {
  const res = await fetch(`${API_BASE}/outcomes/record`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}
