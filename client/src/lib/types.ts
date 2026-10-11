// TypeScript Interfaces for YouTube Intelligence Platform

export interface Keyword {
  id: number;
  term: string;
  normalized_term: string;
  category: string;
  search_intent: 'Informational' | 'Tutorial' | 'Problem-solving' | 'Commercial' | 'Comparison' | 'Review' | 'Transactional' | 'Inspirational';
  lifecycle: 'Unknown' | 'Emerging' | 'Growing' | 'Mainstream' | 'Saturated' | 'Declining' | 'Evergreen';
  evergreen_status: 'Evergreen' | 'Semi-evergreen' | 'Seasonal' | 'Trend-driven' | 'Viral' | 'Decaying';
  demand_score: number;
  supply_score: number;
  competition_score: number;
  content_gap_score: number;
  small_channel_score: number;
  outlier_score: number;
  evergreen_score: number;
  trend_stability: number;
  freshness_score: number;
  search_intent_clarity: number;
  quality_adjusted_supply: number;
  opportunity_score: number;
  est_monthly_interest: number;
  relevant_videos_count: number;
  small_channel_winners_count: number;
  source_type: 'OFFICIAL_API' | 'OBSERVED_SNAPSHOT' | 'CALCULATED' | 'ESTIMATED' | 'MODELED' | 'THIRD_PARTY' | 'USER_PROVIDED' | 'UNAVAILABLE';
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  confidence_reason: string;
  why_analysis: string;
  recommended_action: 'CREATE' | 'CONSIDER' | 'AVOID';
  recommended_angle?: string;
  created_at: string;
  updated_at: string;
  gemBadge?: string;
  gemDescription?: string;
}

export interface Video {
  id: number;
  video_id: string;
  channel_id: string;
  keyword_id?: number;
  title: string;
  description: string;
  published_at: string;
  duration_seconds: number;
  thumbnail_url?: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  views_per_day: number;
  views_per_week: number;
  views_per_month: number;
  recent_velocity: number;
  outlier_ratio: number;
  outlier_tier: 'NONE' | '10x' | '25x' | '50x' | '100x' | '250x' | '500x+';
  title_quality_score: number;
  thumbnail_quality_score: number;
  content_depth_score: number;
  production_quality_score: number;
  viewer_engagement_rate: number;
  freshness_years: number;
  beatability_score: number;
  beatability_verdict?: string;
  keyword_term?: string;
  channel_title?: string;
  subscriber_count?: number;
  avatar_url?: string;
  source_type: string;
  confidence?: 'HIGH' | 'MEDIUM' | 'LOW';
  snapshot_priority?: string;
  data_source?: string;
}

export interface Channel {
  id: number;
  channel_id: string;
  title: string;
  custom_url?: string;
  description?: string;
  published_at?: string;
  subscriber_count: number;
  video_count: number;
  view_count: number;
  country?: string;
  avatar_url?: string;
  channel_age_years?: number;
  authority_score?: number;
  median_views?: number;
  average_views?: number;
  source_type?: string;
  confidence?: 'HIGH' | 'MEDIUM' | 'LOW';
  created_at?: string;
  updated_at?: string;
}

export interface MetricProvenance {
  metric: string;
  value: any;
  source_type: string;
  provider: string;
  retrieved_at: string;
  methodology: string;
  snapshot_count: number;
  inputs: string[];
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  confidence_reason: string;
  is_derived: boolean;
  label?: string;
}

export interface GoogleTrendsResult {
  keyword: string;
  region: string;
  relativeInterest: number;
  relatedQueries: string[];
  risingQueries: Array<{ query: string; breakout_percentage: string }>;
  sourceType: string;
  isCached: boolean;
  disclaimer: string;
}

export interface OwnChannelAnalyticsReport {
  channel: {
    channel_id: string;
    title: string;
    avatar_url?: string;
    subscriber_count: number;
    video_count: number;
    is_authenticated: boolean;
  };
  summary: {
    totalViews30d: number;
    totalWatchTimeHours: number;
    avgViewDurationSeconds: number;
    avgViewDurationFormatted: string;
    trafficSourcesBreakdown: {
      searchPercent: number;
      suggestedPercent: number;
      browsePercent: number;
      searchViews: number;
      suggestedViews: number;
      browseViews: number;
    };
  };
  timeSeries: Array<{
    recorded_date: string;
    views: number;
    watch_time_minutes: number;
    search_views: number;
    suggested_views: number;
    browse_views: number;
  }>;
  privacyNotice: string;
}

export interface BackgroundJob {
  id: number;
  job_type: string;
  payload: string;
  priority: 'HIGH' | 'NORMAL' | 'LOW';
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  attempts: number;
  max_retries: number;
  scheduled_at: string;
  created_at: string;
  completed_at?: string;
  error_message?: string;
}

export interface PredictiveOutcome {
  id: number;
  keyword_id?: number;
  keyword_term?: string;
  opportunity_score_predicted: number;
  video_id: string;
  title: string;
  published_date: string;
  target_views_milestone: number;
  actual_views_30d: number;
  actual_views_90d: number;
  actual_views_365d: number;
  current_views: number;
  accuracy_score: number;
  learning_insights: string;
  created_at: string;
}

export interface PredictiveReport {
  totalTracked: number;
  modelCalibrationAccuracy: string;
  validationStatus: string;
  outcomes: PredictiveOutcome[];
  featureWeightsLearned: Array<{
    factor: string;
    predictivePower: string;
    recommendation: string;
  }>;
}

export interface ContentGap {
  id: number;
  keyword_id: number;
  gap_title: string;
  gap_description: string;
  evidence_type: string;
  evidence_detail: string;
  opportunity_lift: number;
  keyword_term?: string;
  opportunity_score?: number;
  demand_score?: number;
  category?: string;
}

export interface KeywordSnapshot {
  id: number;
  keyword_id: number;
  recorded_date: string;
  interest_index: number;
  demand_score: number;
  supply_score: number;
  competition_score: number;
  opportunity_score: number;
  is_observed: number;
}

export interface VideoBlueprint {
  primaryKeyword: string;
  searchIntent: string;
  recommendedTitles: string[];
  secondaryKeywords: string[];
  recommendedHook: string;
  thumbnailConcepts: Array<{
    concept: string;
    leftSide?: string;
    rightSide?: string;
    graphic?: string;
    textOverlay: string;
    colorScheme: string;
  }>;
  recommendedDuration: string;
  structureOverview: string;
  chapters: Array<{ time: string; title: string }>;
  importantTalkingPoints: string[];
  questionsToAnswer: string[];
  competitorGapsTargeted: string[];
  uniqueAngle: string;
  callToAction: string;
  description: string;
  tags: string[];
  supportingClusterVideos: string[];
}

export interface Recommendation {
  rank: number;
  keyword: string;
  keywordId: number;
  category: string;
  searchIntent: string;
  opportunityScore: number;
  demandScore: number;
  competitionScore: number;
  evergreenScore: number;
  smallChannelScore: number;
  outlierScore: number;
  relevantVideosCount: number;
  topCompetitor?: {
    title: string;
    views: number;
    channel: string;
    subscribers: number;
    outlierRatio: number;
    ageYears: number;
    beatabilityScore: number;
  };
  whyNow: string;
  recommendedAngle: string;
  estimatedDifficulty: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  confidenceReason: string;
  checklist: Array<{ item: string; passed: boolean; note: string }>;
  allChecklistPassed: boolean;
  isNearMatch?: boolean;
  nearMatchReason?: string;
}

export interface NicheStats {
  niche: string;
  totalInDatabase: number;
  averageCompetition: number;
  averageOpportunityScore: number;
  strictMatchesCount: number;
  nearMatchesCount: number;
  insightMessage?: string;
}

export interface QuotaStatus {
  dailyLimit: number;
  unitsUsed: number;
  unitsRemaining: number;
  percentUsed: number;
  resetTimestamp: string;
  isExhausted: boolean;
  apiKeyConfigured: boolean;
}

export type SearchMode = 
  | 'default'
  | 'keyword'
  | 'topic'
  | 'hidden_gems'
  | 'content_gaps'
  | 'competitor'
  | 'outliers'
  | 'evergreen'
  | 'small_channel'
  | 'trending'
  | 'long_tail';
