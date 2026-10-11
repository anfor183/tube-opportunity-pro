// Realistic Seed Data Generator spanning diverse niches with multi-source feeds, Google Trends, and Queue jobs

const { getDb } = require('../index');
const { calculateOpportunityScore } = require('../../services/scoring-engine');

function seedDatabase() {
  const db = getDb();

  const count = db.prepare('SELECT COUNT(*) as count FROM keywords').get().count;
  if (count > 0) {
    console.log(`Database already seeded (${count} keywords).`);
    return;
  }

  console.log('Seeding multi-source YouTube Intelligence database...');

  // 1. Seed Topics
  const topics = [
    { name: 'Artificial Intelligence & Automation', category: 'Tech & AI', description: 'Generative AI, LLM tools, workflow automation, and agentic systems.' },
    { name: 'Personal Finance & Trading', category: 'Finance', description: 'Forex, algorithmic trading, dividend investing, and personal wealth.' },
    { name: 'Faith & Spiritual Wellness', category: 'Lifestyle & Faith', description: 'Christian prayer, scripture meditation, morning devotionals.' },
    { name: 'Consumer Hardware & Tech', category: 'Consumer Tech', description: 'Samsung Galaxy, smartphone customization, hardware setups.' },
    { name: 'Programming & Web Engineering', category: 'Software Development', description: 'Next.js, Python automation, API integrations, and developer tools.' },
    { name: 'Health & Biohacking', category: 'Health & Fitness', description: 'Intermittent fasting, sleep optimization, longevity protocols.' }
  ];

  const insertTopic = db.prepare('INSERT INTO topics (name, category, description, total_cluster_opportunity) VALUES (?, ?, ?, ?)');
  const topicIds = {};
  topics.forEach(t => {
    const res = insertTopic.run(t.name, t.category, t.description, 86.5);
    topicIds[t.name] = res.lastInsertRowid;
  });

  // 2. Seed Public Competitor Channels
  const channels = [
    { channel_id: 'UC_ai_guru_99', title: 'AI Automation Labs', subscriber_count: 4800, video_count: 32, view_count: 1450000, channel_age_years: 1.2, authority_score: 38 },
    { channel_id: 'UC_tech_titan', title: 'TechTitan Mega', subscriber_count: 2450000, video_count: 1200, view_count: 450000000, channel_age_years: 8.5, authority_score: 94 },
    { channel_id: 'UC_faith_daily', title: 'Morning Grace Daily', subscriber_count: 7200, video_count: 55, view_count: 3200000, channel_age_years: 2.1, authority_score: 42 },
    { channel_id: 'UC_mega_ministry', title: 'Global Faith Network', subscriber_count: 1800000, video_count: 2100, view_count: 290000000, channel_age_years: 9.0, authority_score: 91 },
    { channel_id: 'UC_fx_trader_sam', title: 'PipMaster Sam FX', subscriber_count: 9400, video_count: 48, view_count: 2100000, channel_age_years: 1.8, authority_score: 45 },
    { channel_id: 'UC_wallstreet_pro', title: 'Trading Edge Official', subscriber_count: 850000, video_count: 840, view_count: 98000000, channel_age_years: 6.2, authority_score: 82 },
    { channel_id: 'UC_galaxy_geek', title: 'Galaxy Hacks & Tips', subscriber_count: 3400, video_count: 24, view_count: 890000, channel_age_years: 0.9, authority_score: 32 },
    { channel_id: 'UC_mkbhd_style', title: 'Mobile Tech Reviews', subscriber_count: 1400000, video_count: 650, view_count: 210000000, channel_age_years: 7.0, authority_score: 89 },
    { channel_id: 'UC_dev_notes', title: 'Solo Dev Notes', subscriber_count: 6100, video_count: 38, view_count: 1250000, channel_age_years: 1.4, authority_score: 41 },
    { channel_id: 'UC_fasting_doc', title: 'The Fasting Method', subscriber_count: 8900, video_count: 42, view_count: 2400000, channel_age_years: 1.6, authority_score: 44 }
  ];

  const insertChannel = db.prepare(`
    INSERT INTO channels (channel_id, title, subscriber_count, video_count, view_count, channel_age_years, authority_score)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  channels.forEach(c => {
    insertChannel.run(c.channel_id, c.title, c.subscriber_count, c.video_count, c.view_count, c.channel_age_years, c.authority_score);
  });

  // 3. Seed Keywords & Opportunities
  const keywordsList = [
    {
      term: 'Best AI tools for real estate agents',
      normalized_term: 'best ai tools for real estate agents',
      category: 'Tech & AI',
      topic: 'Artificial Intelligence & Automation',
      search_intent: 'Commercial',
      lifecycle: 'Emerging',
      evergreen_status: 'Evergreen',
      demand_score: 84,
      supply_score: 28,
      competition_score: 25,
      content_gap_score: 88,
      small_channel_score: 92,
      outlier_score: 89,
      evergreen_score: 91,
      trend_stability: 85,
      freshness_score: 90,
      search_intent_clarity: 92,
      quality_adjusted_supply: 22,
      est_monthly_interest: 48000,
      relevant_videos_count: 19,
      small_channel_winners_count: 7,
      source_type: 'OBSERVED_SNAPSHOT',
      confidence: 'HIGH',
      confidence_reason: 'Validated via 14 months of tracking; 7 small channels with <10k subs dominating search SERP.',
      why_analysis: 'High search demand from realtors seeking listing automation. Top competitor videos are 3 years old, feature discontinued tools, and completely ignore local MLS integrations. Small channels under 5K subs are achieving 150k+ views.',
      recommended_action: 'CREATE',
      recommended_angle: 'Show a live 10-minute workflow generating listing descriptions, client emails, and virtual staging using currently free tools.'
    },
    {
      term: 'Bible prayers for breakthrough in finances',
      normalized_term: 'bible prayers for breakthrough in finances',
      category: 'Lifestyle & Faith',
      topic: 'Faith & Spiritual Wellness',
      search_intent: 'Inspirational',
      lifecycle: 'Evergreen',
      evergreen_status: 'Evergreen',
      demand_score: 92,
      supply_score: 35,
      competition_score: 32,
      content_gap_score: 82,
      small_channel_score: 94,
      outlier_score: 95,
      evergreen_score: 98,
      trend_stability: 95,
      freshness_score: 75,
      search_intent_clarity: 90,
      quality_adjusted_supply: 28,
      est_monthly_interest: 110000,
      relevant_videos_count: 34,
      small_channel_winners_count: 9,
      source_type: 'OBSERVED_SNAPSHOT',
      confidence: 'HIGH',
      confidence_reason: 'Consistent search patterns across 5-year multi-year data; extreme audience retention on audio prayers.',
      why_analysis: 'Tremendous search persistence. Viewers play these repeatedly for morning devotionals. Existing videos feature poor audio mixing and distracting ads during prayer pauses. Massive outlier ratios (120x+).',
      recommended_action: 'CREATE',
      recommended_angle: 'Create an uninterrupted 30-minute peaceful scripture prayer with on-screen Bible verses and high-fidelity ambient sound.'
    },
    {
      term: 'How to use ChatGPT for automated bookkeeping',
      normalized_term: 'how to use chatgpt for automated bookkeeping',
      category: 'Tech & AI',
      topic: 'Artificial Intelligence & Automation',
      search_intent: 'Tutorial',
      lifecycle: 'Growing',
      evergreen_status: 'Semi-evergreen',
      demand_score: 88,
      supply_score: 30,
      competition_score: 28,
      content_gap_score: 91,
      small_channel_score: 86,
      outlier_score: 84,
      evergreen_score: 86,
      trend_stability: 82,
      freshness_score: 94,
      search_intent_clarity: 95,
      quality_adjusted_supply: 24,
      est_monthly_interest: 62000,
      relevant_videos_count: 22,
      small_channel_winners_count: 6,
      source_type: 'OBSERVED_SNAPSHOT',
      confidence: 'HIGH',
      confidence_reason: 'Rapid rise in recurring questions across Reddit & YouTube comments regarding bank statement reconciliation.',
      why_analysis: 'Small business owners want tangible cost savings. Most tutorials are theoretical prompts; zero competitors show how to format bank CSV exports safely without privacy leaks.',
      recommended_action: 'CREATE',
      recommended_angle: 'Step-by-step tutorial reconciling a messy mock bank statement CSV using ChatGPT Advanced Data Analysis with privacy safeguards.'
    },
    {
      term: 'Forex order block strategy for beginners',
      normalized_term: 'forex order block strategy for beginners',
      category: 'Finance',
      topic: 'Personal Finance & Trading',
      search_intent: 'Problem-solving',
      lifecycle: 'Evergreen',
      evergreen_status: 'Evergreen',
      demand_score: 86,
      supply_score: 42,
      competition_score: 38,
      content_gap_score: 85,
      small_channel_score: 80,
      outlier_score: 88,
      evergreen_score: 92,
      trend_stability: 90,
      freshness_score: 80,
      search_intent_clarity: 88,
      quality_adjusted_supply: 36,
      est_monthly_interest: 75000,
      relevant_videos_count: 45,
      small_channel_winners_count: 8,
      source_type: 'OBSERVED_SNAPSHOT',
      confidence: 'HIGH',
      confidence_reason: 'Consistent trading terminology search queries with high advertiser CPM value ($18-$35 CPM).',
      why_analysis: 'Existing trading videos are 45-minute meandering streams full of discord course upsells. A crisp 12-minute breakdown with clear visual candlestick indicators can instantly win rankings.',
      recommended_action: 'CREATE',
      recommended_angle: 'No-nonsense 12-minute visual breakdown of order block identification with 3 live backtesting examples and zero paid course pitches.'
    },
    {
      term: 'Samsung Galaxy hidden battery settings',
      normalized_term: 'samsung galaxy hidden battery settings',
      category: 'Consumer Tech',
      topic: 'Consumer Hardware & Tech',
      search_intent: 'Problem-solving',
      lifecycle: 'Growing',
      evergreen_status: 'Evergreen',
      demand_score: 91,
      supply_score: 36,
      competition_score: 34,
      content_gap_score: 84,
      small_channel_score: 88,
      outlier_score: 93,
      evergreen_score: 89,
      trend_stability: 88,
      freshness_score: 92,
      search_intent_clarity: 96,
      quality_adjusted_supply: 30,
      est_monthly_interest: 98000,
      relevant_videos_count: 28,
      small_channel_winners_count: 8,
      source_type: 'OBSERVED_SNAPSHOT',
      confidence: 'HIGH',
      confidence_reason: 'Every new One UI update triggers an explosion of search volume from millions of Samsung users.',
      why_analysis: 'Current top videos focus on outdated One UI versions. Viewers complain that menu locations have changed. High mobile search volume and huge small channel outlier multiples.',
      recommended_action: 'CREATE',
      recommended_angle: 'Updated for current One UI release: 7 battery settings to toggle off immediately for 2-day battery life.'
    }
  ];

  const insertKeyword = db.prepare(`
    INSERT INTO keywords (
      term, normalized_term, category, search_intent, lifecycle, evergreen_status,
      demand_score, supply_score, competition_score, content_gap_score, small_channel_score,
      outlier_score, evergreen_score, trend_stability, freshness_score, search_intent_clarity,
      quality_adjusted_supply, opportunity_score, est_monthly_interest, relevant_videos_count,
      small_channel_winners_count, source_type, confidence, confidence_reason,
      why_analysis, recommended_action, recommended_angle
    ) VALUES (
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?
    )
  `);

  const insertCluster = db.prepare(`
    INSERT INTO keyword_clusters (parent_topic_id, keyword_id, cluster_role)
    VALUES (?, ?, ?)
  `);

  const insertContentGap = db.prepare(`
    INSERT INTO content_gaps (keyword_id, gap_title, gap_description, evidence_type, evidence_detail, opportunity_lift)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertKwSnapshot = db.prepare(`
    INSERT INTO keyword_snapshots (keyword_id, recorded_date, interest_index, demand_score, supply_score, competition_score, opportunity_score, is_observed)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const keywordMap = {};

  keywordsList.forEach(k => {
    const scoreResult = calculateOpportunityScore(k, null, 'default');
    const finalScore = scoreResult.score;

    const res = insertKeyword.run(
      k.term, k.normalized_term, k.category, k.search_intent, k.lifecycle, k.evergreen_status,
      k.demand_score, k.supply_score, k.competition_score, k.content_gap_score, k.small_channel_score,
      k.outlier_score, k.evergreen_score, k.trend_stability, k.freshness_score, k.search_intent_clarity,
      k.quality_adjusted_supply, finalScore, k.est_monthly_interest, k.relevant_videos_count,
      k.small_channel_winners_count, k.source_type, k.confidence, k.confidence_reason,
      k.why_analysis, k.recommended_action, k.recommended_angle
    );

    const kwId = res.lastInsertRowid;
    keywordMap[k.term] = kwId;

    const topicId = topicIds[k.topic];
    if (topicId) {
      insertCluster.run(topicId, kwId, 'pillar');
    }

    insertContentGap.run(
      kwId,
      `${k.term} on Mobile Devices`,
      `Existing tutorials exclusively demonstrate on desktop with 0 mobile walkthroughs.`,
      'mobile_gap',
      `Mobile search volume accounts for 68% of traffic, but top 5 videos omit phone walkthrough.`,
      18.5
    );

    const months = ['2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09'];
    months.forEach((m, idx) => {
      const baseInterest = k.demand_score - 10 + (idx * 1.5) + (Math.sin(idx) * 4);
      const interestIndex = Math.round(Math.min(100, Math.max(20, baseInterest)));
      insertKwSnapshot.run(kwId, `${m}-01`, interestIndex, k.demand_score, k.supply_score, k.competition_score, finalScore, 1);
    });
  });

  // 4. Seed Competing Videos & Immutable Snapshots (Section 7)
  const videosList = [
    {
      video_id: 'vid_ai_001',
      channel_id: 'UC_ai_guru_99',
      keyword_term: 'Best AI tools for real estate agents',
      title: 'I Automated My Entire Real Estate Business With These 5 AI Tools (Crazy Results)',
      published_at: '2025-04-12T10:00:00Z',
      duration_seconds: 742,
      view_count: 850000,
      like_count: 34000,
      comment_count: 1420,
      thumbnail_url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&auto=format&fit=crop&q=80',
      authority_score: 38,
      title_quality_score: 88,
      thumbnail_quality_score: 75,
      content_depth_score: 72,
      production_quality_score: 68,
      freshness_years: 1.4,
      beatability_score: 78,
      snapshot_priority: 'HIGH',
      snapshot_frequency_hours: 12
    },
    {
      video_id: 'vid_ai_002',
      channel_id: 'UC_tech_titan',
      keyword_term: 'Best AI tools for real estate agents',
      title: 'Top 10 AI Tools for Real Estate Agents (2023 Edition)',
      published_at: '2023-08-15T14:30:00Z',
      duration_seconds: 1120,
      view_count: 1400000,
      like_count: 48000,
      comment_count: 1980,
      thumbnail_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&auto=format&fit=crop&q=80',
      authority_score: 94,
      title_quality_score: 60,
      thumbnail_quality_score: 55,
      content_depth_score: 60,
      production_quality_score: 85,
      freshness_years: 3.1,
      beatability_score: 88,
      snapshot_priority: 'NORMAL',
      snapshot_frequency_hours: 72
    },
    {
      video_id: 'vid_faith_001',
      channel_id: 'UC_faith_daily',
      keyword_term: 'Bible prayers for breakthrough in finances',
      title: 'Pray This Powerful Scripture Prayer For Financial Breakthrough Before You Sleep',
      published_at: '2025-01-20T08:00:00Z',
      duration_seconds: 1840,
      view_count: 920000,
      like_count: 72000,
      comment_count: 4300,
      thumbnail_url: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=600&auto=format&fit=crop&q=80',
      authority_score: 42,
      title_quality_score: 92,
      thumbnail_quality_score: 80,
      content_depth_score: 78,
      production_quality_score: 65,
      freshness_years: 1.6,
      beatability_score: 74,
      snapshot_priority: 'HIGH',
      snapshot_frequency_hours: 12
    }
  ];

  const insertVideo = db.prepare(`
    INSERT INTO videos (
      video_id, channel_id, keyword_id, title, published_at, duration_seconds,
      view_count, like_count, comment_count, thumbnail_url,
      views_per_day, views_per_week, views_per_month, recent_velocity,
      outlier_ratio, outlier_tier, title_quality_score, thumbnail_quality_score,
      content_depth_score, production_quality_score, viewer_engagement_rate,
      freshness_years, beatability_score, snapshot_priority, snapshot_frequency_hours,
      source_type
    ) VALUES (
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?, ?,
      ?
    )
  `);

  const insertImmutableSnapshot = db.prepare(`
    INSERT INTO video_snapshots (
      video_id, recorded_at, view_count, like_count, comment_count,
      channel_subscriber_count, title, publication_date, duration,
      search_keyword, search_position, is_observed, source_type, confidence
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  videosList.forEach(v => {
    const kwId = keywordMap[v.keyword_term];
    const channel = channels.find(c => c.channel_id === v.channel_id) || { subscriber_count: 10000 };
    const outlierRatio = Math.round((v.view_count / Math.max(10, channel.subscriber_count)) * 10) / 10;
    
    let outlierTier = 'NONE';
    if (outlierRatio >= 100) outlierTier = '100x';
    else if (outlierRatio >= 50) outlierTier = '50x';
    else if (outlierRatio >= 25) outlierTier = '25x';
    else if (outlierRatio >= 10) outlierTier = '10x';

    const ageDays = Math.max(1, Math.round(v.freshness_years * 365));
    const viewsPerDay = Math.round(v.view_count / ageDays);
    const viewsPerWeek = viewsPerDay * 7;
    const viewsPerMonth = Math.round(viewsPerDay * 30.4);

    insertVideo.run(
      v.video_id, v.channel_id, kwId, v.title, v.published_at, v.duration_seconds,
      v.view_count, v.like_count, v.comment_count, v.thumbnail_url,
      viewsPerDay, viewsPerWeek, viewsPerMonth, Math.round(viewsPerDay * 1.1),
      outlierRatio, outlierTier, v.title_quality_score, v.thumbnail_quality_score,
      v.content_depth_score, v.production_quality_score, 0.042,
      v.freshness_years, v.beatability_score, v.snapshot_priority, v.snapshot_frequency_hours,
      'OFFICIAL_API'
    );

    // Record Immutable Historical Snapshots
    const dates = ['2025-06-01', '2025-09-01', '2025-12-01', '2026-03-01', '2026-09-01'];
    dates.forEach((d, i) => {
      insertImmutableSnapshot.run(
        v.video_id,
        `${d}T12:00:00Z`,
        Math.round(v.view_count * (0.2 + (i * 0.2))),
        Math.round(v.like_count * (0.2 + (i * 0.2))),
        Math.round(v.comment_count * (0.2 + (i * 0.2))),
        channel.subscriber_count,
        v.title,
        v.published_at,
        v.duration_seconds,
        v.keyword_term,
        i + 1,
        1,
        'OBSERVED_SNAPSHOT',
        'HIGH'
      );
    });
  });

  // 5. Seed Search Observations (Approximate Search Supply Signal)
  const insertSearchObs = db.prepare(`
    INSERT INTO search_observations (keyword, query_timestamp, approx_result_count, returned_video_ids, result_ordering, channel_ids, source_type, confidence)
    VALUES (?, ?, ?, ?, ?, ?, 'OFFICIAL_API', 'HIGH')
  `);
  insertSearchObs.run(
    'Best AI tools for real estate agents',
    new Date().toISOString(),
    19,
    JSON.stringify(['vid_ai_001', 'vid_ai_002']),
    JSON.stringify([
      { video_id: 'vid_ai_001', position: 1, channel_id: 'UC_ai_guru_99' },
      { video_id: 'vid_ai_002', position: 2, channel_id: 'UC_tech_titan' }
    ]),
    JSON.stringify(['UC_ai_guru_99', 'UC_tech_titan'])
  );

  // 6. Seed Google Trends (Secondary Demand Signal)
  const insertGTrends = db.prepare(`
    INSERT OR REPLACE INTO google_trends_data (keyword, region, recorded_date, relative_interest, related_queries, rising_queries, category, source_type, confidence)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'THIRD_PARTY', 'HIGH')
  `);
  insertGTrends.run(
    'Best AI tools for real estate agents',
    'US',
    '2026-10-01',
    82,
    JSON.stringify(['realtor ai tools', 'ai for real estate marketing', 'chatgpt for real estate']),
    JSON.stringify([
      { query: 'virtual staging ai free', breakout_percentage: '+450%' },
      { query: 'listing description generator ai', breakout_percentage: '+220%' }
    ]),
    'Tech & AI'
  );

  // 7. Seed OWN CHANNEL DATA (First-Party Private Analytics via OAuth)
  const { youtubeAnalytics } = require('../../services/youtube-analytics');
  youtubeAnalytics.connectUserChannel('UC_CREATOR_PRO_DEMO', 'My Studio Creator Channel');

  // 8. Seed Background Job Queue
  const { queueManager, JOB_TYPES } = require('../../services/queue-manager');
  queueManager.enqueueJob(JOB_TYPES.SNAPSHOT_VIDEO, { videoId: 'vid_ai_001' }, 'HIGH');
  queueManager.enqueueJob(JOB_TYPES.UPDATE_TRENDS, { keyword: 'Samsung Galaxy hidden battery settings' }, 'NORMAL');
  queueManager.enqueueJob(JOB_TYPES.DISCOVER_RELATED_KEYWORDS, { seed: 'ChatGPT automation' }, 'LOW');

  // 9. Seed Published Video Outcome (Predictive Learning Model)
  const { recordPublishedOutcome } = require('../../services/outcome-learner');
  recordPublishedOutcome(1, 'vid_user_published_01', 'Best Free AI Tools For Real Estate (2026 Guide)', '2026-08-10', 25000);

  // 10. Populate Comprehensive Competing Videos for all keywords
  const { populateAllVideos } = require('./populate-all-videos');
  populateAllVideos();

  console.log('Multi-source YouTube Intelligence database seeded successfully.');
}

module.exports = {
  seedDatabase
};
