-- YouTube Evergreen Keyword & Virality Opportunity Intelligence Database Schema
-- Multi-Source Data Architecture & Normalized Entity Stores

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

-- 1. Keywords Table
CREATE TABLE IF NOT EXISTS keywords (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    term TEXT NOT NULL UNIQUE,
    normalized_term TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    search_intent TEXT CHECK(search_intent IN ('Informational', 'Tutorial', 'Problem-solving', 'Commercial', 'Comparison', 'Review', 'Transactional', 'Inspirational')) DEFAULT 'Tutorial',
    lifecycle TEXT CHECK(lifecycle IN ('Unknown', 'Emerging', 'Growing', 'Mainstream', 'Saturated', 'Declining', 'Evergreen')) DEFAULT 'Emerging',
    evergreen_status TEXT CHECK(evergreen_status IN ('Evergreen', 'Semi-evergreen', 'Seasonal', 'Trend-driven', 'Viral', 'Decaying')) DEFAULT 'Evergreen',
    
    -- Metrics (0-100 normalized)
    demand_score REAL DEFAULT 50.0,
    supply_score REAL DEFAULT 50.0,
    competition_score REAL DEFAULT 50.0,
    content_gap_score REAL DEFAULT 50.0,
    small_channel_score REAL DEFAULT 50.0,
    outlier_score REAL DEFAULT 50.0,
    evergreen_score REAL DEFAULT 50.0,
    trend_stability REAL DEFAULT 50.0,
    freshness_score REAL DEFAULT 50.0,
    search_intent_clarity REAL DEFAULT 50.0,
    quality_adjusted_supply REAL DEFAULT 50.0,
    opportunity_score REAL DEFAULT 50.0,
    
    -- Specific signals
    est_monthly_interest INTEGER DEFAULT 0,
    relevant_videos_count INTEGER DEFAULT 0,
    exact_match_count INTEGER DEFAULT 0,
    high_quality_count INTEGER DEFAULT 0,
    low_quality_count INTEGER DEFAULT 0,
    small_channel_winners_count INTEGER DEFAULT 0,
    
    -- Evidence & Provenance
    source_type TEXT CHECK(source_type IN ('OFFICIAL_API', 'OBSERVED_SNAPSHOT', 'CALCULATED', 'ESTIMATED', 'MODELED', 'THIRD_PARTY', 'USER_PROVIDED', 'UNAVAILABLE')) DEFAULT 'MODELED',
    confidence TEXT CHECK(confidence IN ('HIGH', 'MEDIUM', 'LOW')) DEFAULT 'MEDIUM',
    confidence_reason TEXT,
    why_analysis TEXT,
    recommended_action TEXT CHECK(recommended_action IN ('CREATE', 'CONSIDER', 'AVOID')) DEFAULT 'CONSIDER',
    recommended_angle TEXT,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_keywords_opportunity ON keywords(opportunity_score DESC);
CREATE INDEX IF NOT EXISTS idx_keywords_evergreen ON keywords(evergreen_score DESC);
CREATE INDEX IF NOT EXISTS idx_keywords_category ON keywords(category);
CREATE INDEX IF NOT EXISTS idx_keywords_normalized ON keywords(normalized_term);

-- 2. Topics Table
CREATE TABLE IF NOT EXISTS topics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    description TEXT,
    total_cluster_opportunity REAL DEFAULT 0.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Keyword Clusters
CREATE TABLE IF NOT EXISTS keyword_clusters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parent_topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    keyword_id INTEGER NOT NULL REFERENCES keywords(id) ON DELETE CASCADE,
    cluster_role TEXT CHECK(cluster_role IN ('pillar', 'subtopic', 'long_tail', 'question', 'problem', 'comparison', 'tutorial', 'review', 'troubleshooting', 'beginner', 'advanced', 'use_case', 'audience_specific')) DEFAULT 'subtopic',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(parent_topic_id, keyword_id)
);

-- 4. Channels Table (Public Competitor Channels)
CREATE TABLE IF NOT EXISTS channels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    channel_id TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    custom_url TEXT,
    description TEXT,
    published_at DATETIME,
    subscriber_count INTEGER DEFAULT 0,
    video_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    country TEXT DEFAULT 'US',
    avatar_url TEXT,
    channel_age_years REAL DEFAULT 1.0,
    authority_score REAL DEFAULT 50.0,
    median_views INTEGER DEFAULT 0,
    average_views INTEGER DEFAULT 0,
    source_type TEXT DEFAULT 'OFFICIAL_API',
    confidence TEXT DEFAULT 'HIGH',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_channels_subs ON channels(subscriber_count);

-- 5. Videos Table (Public Competitor Videos)
CREATE TABLE IF NOT EXISTS videos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    video_id TEXT NOT NULL UNIQUE,
    channel_id TEXT NOT NULL REFERENCES channels(channel_id) ON DELETE CASCADE,
    keyword_id INTEGER REFERENCES keywords(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    published_at DATETIME NOT NULL,
    duration_seconds INTEGER DEFAULT 600,
    thumbnail_url TEXT,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    
    -- Calculated Velocities (Calculated from observed snapshots)
    views_per_day REAL DEFAULT 0.0,
    views_per_week REAL DEFAULT 0.0,
    views_per_month REAL DEFAULT 0.0,
    recent_velocity REAL DEFAULT 0.0,
    velocity_growth_rate REAL DEFAULT 0.0,
    recent_views_ratio REAL DEFAULT 0.0,
    
    -- Outlier metrics
    outlier_ratio REAL DEFAULT 1.0,
    outlier_tier TEXT CHECK(outlier_tier IN ('NONE', '10x', '25x', '50x', '100x', '250x', '500x+')) DEFAULT 'NONE',
    
    -- Competitor Quality Evaluation
    title_quality_score REAL DEFAULT 50.0,
    thumbnail_quality_score REAL DEFAULT 50.0,
    intent_match_score REAL DEFAULT 50.0,
    content_depth_score REAL DEFAULT 50.0,
    production_quality_score REAL DEFAULT 50.0,
    viewer_engagement_rate REAL DEFAULT 0.0,
    freshness_years REAL DEFAULT 1.0,
    
    -- Beatability
    beatability_score REAL DEFAULT 50.0,
    beatability_verdict TEXT,
    competitor_strengths TEXT, -- JSON array
    competitor_weaknesses TEXT, -- JSON array
    
    -- Snapshot Frequency Scheduling
    snapshot_priority TEXT CHECK(snapshot_priority IN ('HIGH', 'NORMAL', 'EVERGREEN_LOW')) DEFAULT 'NORMAL',
    snapshot_frequency_hours INTEGER DEFAULT 72,
    last_snapshot_at DATETIME,
    next_snapshot_due DATETIME,
    
    source_type TEXT CHECK(source_type IN ('OFFICIAL_API', 'OBSERVED_SNAPSHOT', 'CALCULATED', 'ESTIMATED', 'MODELED', 'THIRD_PARTY', 'USER_PROVIDED', 'UNAVAILABLE')) DEFAULT 'OFFICIAL_API',
    confidence TEXT CHECK(confidence IN ('HIGH', 'MEDIUM', 'LOW')) DEFAULT 'HIGH',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_videos_views ON videos(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_videos_velocity ON videos(views_per_day DESC);
CREATE INDEX IF NOT EXISTS idx_videos_outlier_ratio ON videos(outlier_ratio DESC);
CREATE INDEX IF NOT EXISTS idx_videos_keyword ON videos(keyword_id);
CREATE INDEX IF NOT EXISTS idx_videos_channel ON videos(channel_id);
CREATE INDEX IF NOT EXISTS idx_videos_next_snap ON videos(next_snapshot_due);

-- 6. Video Snapshots (Immutable Historical Observations)
CREATE TABLE IF NOT EXISTS video_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    video_id TEXT NOT NULL REFERENCES videos(video_id) ON DELETE CASCADE,
    recorded_at DATETIME NOT NULL,
    view_count INTEGER NOT NULL,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    channel_subscriber_count INTEGER DEFAULT 0,
    channel_video_count INTEGER DEFAULT 0,
    title TEXT,
    publication_date DATETIME,
    duration INTEGER DEFAULT 600,
    search_keyword TEXT,
    search_position INTEGER,
    discovery_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_observed INTEGER DEFAULT 1,
    source_type TEXT CHECK(source_type IN ('OFFICIAL_API', 'OBSERVED_SNAPSHOT', 'CALCULATED', 'ESTIMATED', 'MODELED', 'THIRD_PARTY', 'USER_PROVIDED', 'UNAVAILABLE')) DEFAULT 'OBSERVED_SNAPSHOT',
    confidence TEXT CHECK(confidence IN ('HIGH', 'MEDIUM', 'LOW')) DEFAULT 'HIGH'
);

CREATE INDEX IF NOT EXISTS idx_snapshots_video_time ON video_snapshots(video_id, recorded_at);

-- 7. Search Observations (Search Data - Approximate Supply Signal)
CREATE TABLE IF NOT EXISTS search_observations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    keyword TEXT NOT NULL,
    query_timestamp DATETIME NOT NULL,
    approx_result_count INTEGER DEFAULT 0,
    returned_video_ids TEXT NOT NULL, -- JSON array
    result_ordering TEXT NOT NULL, -- JSON array of { video_id, position, channel_id, published_at }
    channel_ids TEXT NOT NULL, -- JSON array
    source_type TEXT DEFAULT 'OFFICIAL_API',
    confidence TEXT DEFAULT 'HIGH',
    notes TEXT DEFAULT 'Approximate search-supply signal from YouTube search API'
);

CREATE INDEX IF NOT EXISTS idx_search_obs_kw ON search_observations(keyword, query_timestamp);

-- 8. Google Trends Data (Secondary Demand Signal)
CREATE TABLE IF NOT EXISTS google_trends_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    keyword TEXT NOT NULL,
    region TEXT DEFAULT 'US',
    recorded_date DATE NOT NULL,
    relative_interest INTEGER NOT NULL, -- 0-100 Relative Index (NOT absolute search volume!)
    related_queries TEXT, -- JSON array
    rising_queries TEXT, -- JSON array
    category TEXT DEFAULT 'All',
    source_type TEXT DEFAULT 'THIRD_PARTY',
    confidence TEXT DEFAULT 'HIGH',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(keyword, region, recorded_date)
);

CREATE INDEX IF NOT EXISTS idx_gtrends_kw ON google_trends_data(keyword, recorded_date);

-- 9. Keyword Snapshots (12m, 2y, 5y, 10y Historical Curves)
CREATE TABLE IF NOT EXISTS keyword_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    keyword_id INTEGER NOT NULL REFERENCES keywords(id) ON DELETE CASCADE,
    recorded_date DATE NOT NULL,
    interest_index REAL NOT NULL,
    demand_score REAL NOT NULL,
    supply_score REAL NOT NULL,
    competition_score REAL NOT NULL,
    opportunity_score REAL NOT NULL,
    is_observed INTEGER DEFAULT 1,
    source_type TEXT DEFAULT 'CALCULATED',
    confidence TEXT DEFAULT 'HIGH'
);

CREATE INDEX IF NOT EXISTS idx_kw_snapshots ON keyword_snapshots(keyword_id, recorded_date);

-- 10. Content Gaps Table
CREATE TABLE IF NOT EXISTS content_gaps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    keyword_id INTEGER NOT NULL REFERENCES keywords(id) ON DELETE CASCADE,
    gap_title TEXT NOT NULL,
    gap_description TEXT NOT NULL,
    evidence_type TEXT CHECK(evidence_type IN ('recurring_questions', 'underserved_audience', 'mobile_gap', 'outdated_competitors', 'missing_step', 'content_vacuum')) DEFAULT 'recurring_questions',
    evidence_detail TEXT,
    opportunity_lift REAL DEFAULT 15.0,
    source_type TEXT DEFAULT 'MODELED',
    confidence TEXT DEFAULT 'HIGH',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_content_gaps_kw ON content_gaps(keyword_id);

-- 11. Outliers Table
CREATE TABLE IF NOT EXISTS outliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    video_id TEXT NOT NULL REFERENCES videos(video_id) ON DELETE CASCADE,
    channel_id TEXT NOT NULL REFERENCES channels(channel_id) ON DELETE CASCADE,
    keyword_id INTEGER REFERENCES keywords(id) ON DELETE SET NULL,
    outlier_ratio REAL NOT NULL,
    outlier_tier TEXT NOT NULL,
    subscribers_at_time INTEGER NOT NULL,
    views_at_time INTEGER NOT NULL,
    significance_note TEXT,
    source_type TEXT DEFAULT 'CALCULATED',
    confidence TEXT DEFAULT 'HIGH',
    detected_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_outliers_ratio ON outliers(outlier_ratio DESC);

-- 12. OWN CHANNEL DATA (First-Party Private Analytics via OAuth)
CREATE TABLE IF NOT EXISTS user_channels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    channel_id TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    custom_url TEXT,
    avatar_url TEXT,
    subscriber_count INTEGER DEFAULT 0,
    video_count INTEGER DEFAULT 0,
    is_authenticated INTEGER DEFAULT 1,
    auth_provider TEXT DEFAULT 'OAUTH_YOUTUBE_ANALYTICS',
    source_type TEXT DEFAULT 'USER_PROVIDED',
    connected_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_channel_analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    channel_id TEXT NOT NULL REFERENCES user_channels(channel_id) ON DELETE CASCADE,
    recorded_date DATE NOT NULL,
    views INTEGER NOT NULL,
    watch_time_minutes REAL NOT NULL,
    avg_view_duration_seconds INTEGER NOT NULL,
    search_views INTEGER DEFAULT 0,
    browse_views INTEGER DEFAULT 0,
    suggested_views INTEGER DEFAULT 0,
    subscribers_gained INTEGER DEFAULT 0,
    subscribers_lost INTEGER DEFAULT 0,
    source_type TEXT DEFAULT 'USER_PROVIDED',
    confidence TEXT DEFAULT 'HIGH',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(channel_id, recorded_date)
);

CREATE INDEX IF NOT EXISTS idx_own_analytics_date ON user_channel_analytics(channel_id, recorded_date);

-- 13. Background Job Queue
CREATE TABLE IF NOT EXISTS background_jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_type TEXT CHECK(job_type IN (
        'SEARCH_KEYWORD', 'FETCH_VIDEO', 'FETCH_CHANNEL', 'FETCH_STATISTICS',
        'SNAPSHOT_VIDEO', 'SNAPSHOT_CHANNEL', 'ANALYZE_OUTLIER', 'ANALYZE_EVERGREEN',
        'CALCULATE_OPPORTUNITY', 'DISCOVER_RELATED_KEYWORDS', 'UPDATE_TRENDS'
    )) NOT NULL,
    payload TEXT NOT NULL, -- JSON
    priority TEXT CHECK(priority IN ('HIGH', 'NORMAL', 'LOW')) DEFAULT 'NORMAL',
    status TEXT CHECK(status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')) DEFAULT 'PENDING',
    attempts INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    backoff_delay_ms INTEGER DEFAULT 1000,
    error_message TEXT,
    scheduled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME
);

CREATE INDEX IF NOT EXISTS idx_jobs_status_prio ON background_jobs(status, priority, scheduled_at);

-- 14. Predictive Learning: Published Video Outcome Tracking
CREATE TABLE IF NOT EXISTS published_video_outcomes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    keyword_id INTEGER REFERENCES keywords(id) ON DELETE SET NULL,
    opportunity_score_predicted REAL NOT NULL,
    video_id TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    published_date DATE NOT NULL,
    target_views_milestone INTEGER DEFAULT 10000,
    actual_views_30d INTEGER DEFAULT 0,
    actual_views_90d INTEGER DEFAULT 0,
    actual_views_365d INTEGER DEFAULT 0,
    current_views INTEGER DEFAULT 0,
    accuracy_score REAL DEFAULT 0.0,
    learning_insights TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 15. Saved Research & Watchlists
CREATE TABLE IF NOT EXISTS saved_opportunities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    keyword_id INTEGER NOT NULL REFERENCES keywords(id) ON DELETE CASCADE,
    user_notes TEXT,
    target_niche TEXT,
    initial_score REAL,
    current_score REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS watchlists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_type TEXT CHECK(item_type IN ('keyword', 'channel', 'video')) NOT NULL,
    target_id TEXT NOT NULL,
    target_name TEXT NOT NULL,
    alert_threshold_score REAL DEFAULT 80.0,
    last_known_score REAL DEFAULT 0.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    watchlist_id INTEGER REFERENCES watchlists(id) ON DELETE CASCADE,
    alert_type TEXT CHECK(alert_type IN ('SCORE_INCREASE', 'NEW_OUTLIER', 'DEMAND_ACCELERATION', 'COMPETITION_DECREASE', 'NEW_GAP', 'EVERGREEN_SPIKE')) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    previous_value REAL,
    current_value REAL,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 16. Multi-Provider API Quota Logs
CREATE TABLE IF NOT EXISTS api_quota_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    provider TEXT DEFAULT 'YOUTUBE_DATA_API',
    endpoint TEXT NOT NULL,
    units_consumed INTEGER NOT NULL,
    units_remaining INTEGER NOT NULL,
    total_daily_limit INTEGER DEFAULT 10000,
    reset_timestamp DATETIME NOT NULL,
    status TEXT DEFAULT 'OK',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 17. Scoring Weights Configuration
CREATE TABLE IF NOT EXISTS scoring_weights_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mode_name TEXT NOT NULL UNIQUE,
    weights_json TEXT NOT NULL,
    description TEXT,
    is_active INTEGER DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
