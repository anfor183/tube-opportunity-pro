// API Routes for YouTube Intelligence Platform

const express = require('express');
const router = express.Router();
const { getDb } = require('../db');
const { calculateOpportunityScore, calculateQualityAdjustedSupply, generateOpportunityExplanation } = require('../services/scoring-engine');
const { analyzeVideoOutlier, analyzeSmallChannelSuccess } = require('../services/outlier-detector');
const { detectContentGaps, evaluateContentVacuum } = require('../services/gap-detector');
const { evaluateVideoBeatability, generateRequirementsToBeat } = require('../services/beatability-engine');
const { generateVideoBlueprint } = require('../services/blueprint-engine');
const { getVideoHistoricalAnalytics, recordVideoSnapshot } = require('../services/snapshot-engine');
const { quotaManager } = require('../services/quota-manager');
const { youtubeApi } = require('../services/youtube-api');
const { fetchYouTubeSuggestions, expandKeywordQuery } = require('../services/youtube-suggest');
const { runDailyDiscoveryScan } = require('../services/automated-scanner');
const { SCORING_MODES, DEFAULT_WEIGHTS } = require('../config/scoring-weights');
const { getMetricProvenance } = require('../services/provenance-service');
const { fetchGoogleTrendsData, getGoogleTrendsHistory } = require('../services/google-trends');
const { youtubeAnalytics } = require('../services/youtube-analytics');
const { queueManager, JOB_TYPES } = require('../services/queue-manager');
const { recordPublishedOutcome, updateOutcomePerformance, getPredictiveLearningReport } = require('../services/outcome-learner');
const { ingestLiveYouTubeSearch } = require('../services/live-ingestion');

// 1. Primary Dashboard Summary & Feeds (Section 2, 24, 58)
router.get('/dashboard', (req, res) => {
  try {
    const db = getDb();
    
    // Top opportunities today
    const topOpportunities = db.prepare(`
      SELECT * FROM keywords 
      ORDER BY opportunity_score DESC 
      LIMIT 6
    `).all();

    // Hidden Gems (Score >= 80, Competition <= 35)
    const hiddenGems = db.prepare(`
      SELECT * FROM keywords 
      WHERE opportunity_score >= 80 AND competition_score <= 35 
      ORDER BY opportunity_score DESC 
      LIMIT 6
    `).all();

    // Evergreen Gold
    const evergreenGold = db.prepare(`
      SELECT * FROM keywords 
      WHERE evergreen_score >= 88 
      ORDER BY evergreen_score DESC 
      LIMIT 6
    `).all();

    // Small Channel Winners & Outliers
    const smallChannelWinners = db.prepare(`
      SELECT v.*, c.title as channel_title, c.subscriber_count, k.term as keyword_term
      FROM videos v
      JOIN channels c ON c.channel_id = v.channel_id
      LEFT JOIN keywords k ON k.id = v.keyword_id
      WHERE v.outlier_ratio >= 10
      ORDER BY v.outlier_ratio DESC
      LIMIT 6
    `).all();

    // Content Vacuums
    const vacuums = db.prepare(`
      SELECT * FROM keywords
      WHERE demand_score >= 75 AND quality_adjusted_supply <= 35
      ORDER BY opportunity_score DESC
      LIMIT 4
    `).all();

    // Summary counts
    const totalKeywords = db.prepare('SELECT COUNT(*) as count FROM keywords').get().count;
    const totalVideos = db.prepare('SELECT COUNT(*) as count FROM videos').get().count;
    const totalOutliers = db.prepare('SELECT COUNT(*) as count FROM outliers').get().count;
    const totalGaps = db.prepare('SELECT COUNT(*) as count FROM content_gaps').get().count;

    res.json({
      success: true,
      summary: {
        totalKeywords,
        totalVideos,
        totalOutliers,
        totalGaps
      },
      topOpportunities,
      hiddenGems,
      evergreenGold,
      smallChannelWinners,
      vacuums,
      quota: quotaManager.getStatus()
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Search & Discovery Engine (Sections 3 & 4)
router.get('/search', async (req, res) => {
  try {
    const db = getDb();
    const query = (req.query.q || '').trim();
    const mode = req.query.mode || 'default'; // 10 search modes
    const category = req.query.category;
    const scoringMode = req.query.scoringMode || 'default';
    const isLive = req.query.live === 'true' || req.query.live === '1';

    // Auto-detect if this is a new search query or explicit live query
    if (query && youtubeApi.isKeyConfigured()) {
      let shouldLiveIngest = isLive;
      if (!shouldLiveIngest) {
        const existingKw = db.prepare('SELECT id FROM keywords WHERE normalized_term LIKE ?').get(`%${query.toLowerCase()}%`);
        const existingVideos = db.prepare('SELECT count(*) as c FROM videos WHERE title LIKE ?').get(`%${query}%`);
        if (!existingKw || (existingVideos && existingVideos.c === 0)) {
          shouldLiveIngest = true;
        }
      }

      if (shouldLiveIngest) {
        try {
          await ingestLiveYouTubeSearch(query, { category });
        } catch (liveErr) {
          console.warn('[Auto Live Search Notice]', liveErr.message);
        }
      }
    }

    let sql = 'SELECT * FROM keywords WHERE 1=1';
    const params = [];

    if (query) {
      sql += ' AND (term LIKE ? OR category LIKE ? OR why_analysis LIKE ?)';
      params.push(`%${query}%`, `%${query}%`, `%${query}%`);
    }

    if (category && category !== 'All') {
      sql += ' AND category = ?';
      params.push(category);
    }

    // Filter by Search Mode
    if (mode === 'hidden_gems') {
      sql += ' AND opportunity_score >= 80 AND competition_score <= 35';
    } else if (mode === 'evergreen') {
      sql += ' AND evergreen_score >= 85';
    } else if (mode === 'content_gaps') {
      sql += ' AND content_gap_score >= 80';
    } else if (mode === 'small_channel') {
      sql += ' AND small_channel_score >= 80';
    } else if (mode === 'trending') {
      sql += ' AND trend_stability <= 75 AND demand_score >= 80';
    } else if (mode === 'long_tail') {
      sql += ' AND length(term) > 35';
    }

    sql += ' ORDER BY opportunity_score DESC LIMIT 50';

    const results = db.prepare(sql).all(...params);

    // Also fetch matching videos from SERP
    let matchingVideos = [];
    if (query) {
      matchingVideos = db.prepare(`
        SELECT v.*, c.title as channel_title, c.subscriber_count, c.avatar_url, k.term as keyword_term
        FROM videos v
        JOIN channels c ON c.channel_id = v.channel_id
        LEFT JOIN keywords k ON k.id = v.keyword_id
        WHERE v.title LIKE ? OR k.term LIKE ? OR c.title LIKE ?
        ORDER BY v.view_count DESC
        LIMIT 50
      `).all(`%${query}%`, `%${query}%`, `%${query}%`);
    } else {
      matchingVideos = db.prepare(`
        SELECT v.*, c.title as channel_title, c.subscriber_count, c.avatar_url, k.term as keyword_term
        FROM videos v
        JOIN channels c ON c.channel_id = v.channel_id
        LEFT JOIN keywords k ON k.id = v.keyword_id
        ORDER BY v.outlier_ratio DESC
        LIMIT 30
      `).all();
    }

    // If query was supplied, also fetch real-time YouTube Autocomplete suggestions
    let liveSuggestions = [];
    if (query) {
      liveSuggestions = await fetchYouTubeSuggestions(query);
    }

    res.json({
      success: true,
      query,
      mode,
      isLive,
      count: results.length,
      results,
      matchingVideos,
      liveSuggestions
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2b. Live YouTube Data Ingestion On-Demand (Official YouTube Data API v3)
router.post('/live-ingest', async (req, res) => {
  try {
    const { query, category, maxResults } = req.body;
    if (!query || !query.trim()) {
      return res.status(400).json({ success: false, error: 'Query parameter is required for live ingestion.' });
    }

    const result = await ingestLiveYouTubeSearch(query.trim(), { category, maxResults });
    res.json({
      success: result.success,
      result,
      quota: quotaManager.getStatus()
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Hidden Gems Explorer (Section 15)
router.get('/hidden-gems', (req, res) => {
  try {
    const db = getDb();
    const keywords = db.prepare(`SELECT * FROM keywords ORDER BY opportunity_score DESC`).all();

    // Categorize keywords with specific Hidden Gem Badges
    const categorized = keywords.map(kw => {
      let gemBadge = '🟢 Untapped';
      let gemDescription = 'Low competition and underserved demand with high rankability.';

      if (kw.small_channel_score >= 88 && kw.outlier_score >= 88) {
        gemBadge = '🟣 Small Channel Goldmine';
        gemDescription = 'Proved by multiple small channels with under 10K subscribers reaching huge view counts.';
      } else if (kw.outlier_score >= 92) {
        gemBadge = '🔥 Outlier Opportunity';
        gemDescription = 'Videos exist in this niche drastically outperforming their channel subscriber counts.';
      } else if (kw.evergreen_score >= 90 && kw.content_gap_score >= 80) {
        gemBadge = '🔵 Evergreen Gap';
        gemDescription = 'Long-term multi-year search traffic where existing video supply is outdated or incomplete.';
      } else if (kw.lifecycle === 'Emerging' && kw.demand_score >= 80) {
        gemBadge = '🟡 Emerging';
        gemDescription = 'Search velocity is accelerating before mainstream creator saturation sets in.';
      } else if (kw.trend_stability <= 40 && kw.demand_score >= 85) {
        gemBadge = '⚠️ False Opportunity';
        gemDescription = 'Temporary news/viral spike; demand may decay sharply within 60 days.';
      }

      return {
        ...kw,
        gemBadge,
        gemDescription
      };
    });

    res.json({
      success: true,
      gems: categorized
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Outlier Explorer (Section 33)
router.get('/outliers', (req, res) => {
  try {
    const db = getDb();
    const minRatio = parseFloat(req.query.minRatio) || 10.0;
    const maxSubs = parseInt(req.query.maxSubs) || 500000;
    const minViews = parseInt(req.query.minViews) || 50000;

    const outliers = db.prepare(`
      SELECT 
        v.*,
        c.title as channel_title,
        c.subscriber_count,
        c.avatar_url,
        k.term as keyword_term,
        k.category as keyword_category
      FROM videos v
      JOIN channels c ON c.channel_id = v.channel_id
      LEFT JOIN keywords k ON k.id = v.keyword_id
      WHERE v.outlier_ratio >= ? AND c.subscriber_count <= ? AND v.view_count >= ?
      ORDER BY v.outlier_ratio DESC
    `).all(minRatio, maxSubs, minViews);

    res.json({
      success: true,
      count: outliers.length,
      outliers
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Content Gaps & Content Vacuum (Sections 13 & 31)
router.get('/content-gaps', (req, res) => {
  try {
    const db = getDb();
    const gaps = db.prepare(`
      SELECT 
        g.*,
        k.term as keyword_term,
        k.opportunity_score,
        k.demand_score,
        k.category
      FROM content_gaps g
      JOIN keywords k ON k.id = g.keyword_id
      ORDER BY g.opportunity_lift DESC
    `).all();

    // Content Vacuums
    const vacuumKeywords = db.prepare(`
      SELECT * FROM keywords
      WHERE demand_score >= 70 AND quality_adjusted_supply <= 35
      ORDER BY opportunity_score DESC
    `).all();

    const vacuums = vacuumKeywords.map(k => {
      const videos = db.prepare('SELECT * FROM videos WHERE keyword_id = ?').all(k.id);
      return {
        keyword: k,
        vacuumAnalysis: evaluateContentVacuum(k, videos)
      };
    });

    res.json({
      success: true,
      gaps,
      vacuums
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Helper function to build structured recommendation object
function formatRecommendationItem(k, db, index, isNearMatch = false, nearMatchReason = '') {
  const competingVideos = db.prepare(`
    SELECT v.*, c.title as channel_title, c.subscriber_count
    FROM videos v
    JOIN channels c ON c.channel_id = v.channel_id
    WHERE v.keyword_id = ?
    ORDER BY v.view_count DESC
  `).all(k.id);

  const topCompetitor = competingVideos[0] || null;
  const smallChannelProof = analyzeSmallChannelSuccess(competingVideos);
  const gaps = db.prepare('SELECT * FROM content_gaps WHERE keyword_id = ?').all(k.id);

  // Section 76: "Before You Make It" Checklist
  const checklist = [
    { item: 'Evidence of viewer search demand', passed: k.demand_score >= 60, note: `Demand Score: ${k.demand_score}/100` },
    { item: 'Demand is persistent & sustainable', passed: k.trend_stability >= 70, note: `Trend Stability: ${k.trend_stability}/100` },
    { item: 'Topic is structurally evergreen', passed: k.evergreen_score >= 75, note: `Evergreen Score: ${k.evergreen_score}/100` },
    { item: 'Manageable competitive supply', passed: k.competition_score <= 65, note: `Competition: ${k.competition_score}/100` },
    { item: 'Outdated or beatable top competitor', passed: !topCompetitor || (topCompetitor.freshness_years >= 1.0 || topCompetitor.beatability_score >= 65), note: topCompetitor ? `Beatability: ${topCompetitor.beatability_score}/100` : 'No dominant incumbent' },
    { item: 'Small channel proof validated', passed: k.small_channel_score >= 70, note: `${k.small_channel_winners_count} small creators succeeded` },
    { item: 'Clear content gap identified', passed: gaps.length > 0, note: `${gaps.length} specific unmet viewer needs found` }
  ];

  return {
    rank: index + 1,
    keyword: k.term,
    keywordId: k.id,
    category: k.category,
    searchIntent: k.search_intent,
    opportunityScore: k.opportunity_score,
    demandScore: k.demand_score,
    competitionScore: k.competition_score,
    evergreenScore: k.evergreen_score,
    smallChannelScore: k.small_channel_score,
    outlierScore: k.outlier_score,
    relevantVideosCount: k.relevant_videos_count,
    topCompetitor: topCompetitor ? {
      title: topCompetitor.title,
      views: topCompetitor.view_count,
      channel: topCompetitor.channel_title,
      subscribers: topCompetitor.subscriber_count,
      outlierRatio: topCompetitor.outlier_ratio,
      ageYears: topCompetitor.freshness_years,
      beatabilityScore: topCompetitor.beatability_score
    } : null,
    whyNow: k.why_analysis,
    recommendedAngle: k.recommended_angle,
    estimatedDifficulty: k.competition_score <= 35 ? 'Low' : (k.competition_score <= 65 ? 'Medium' : 'High'),
    confidence: k.confidence,
    confidenceReason: k.confidence_reason,
    checklist,
    allChecklistPassed: checklist.every(c => c.passed),
    isNearMatch,
    nearMatchReason
  };
}

// 6. Section 75: "🔥 FIND ME A VIDEO TO MAKE" Wizard
router.post('/find-video', (req, res) => {
  try {
    const db = getDb();
    const {
      niche,
      channelSize = 'Any', // New, Small, Medium, Any
      goal = 'Both', // Evergreen, Viral, Both
      minOpportunityScore = 65,
      maxCompetition = 65,
      preferredVideoType = 'Any' // Tutorial, Problem, Review, List, Any
    } = req.body;

    let sql = 'SELECT * FROM keywords WHERE opportunity_score >= ? AND competition_score <= ?';
    const params = [minOpportunityScore, maxCompetition];

    if (niche && niche !== 'Any' && niche.trim() !== '') {
      sql += ' AND (category LIKE ? OR term LIKE ?)';
      params.push(`%${niche}%`, `%${niche}%`);
    }

    if (goal === 'Evergreen') {
      sql += ' AND evergreen_score >= 80';
    } else if (goal === 'Viral') {
      sql += ' AND outlier_score >= 80';
    }

    if (channelSize === 'New' || channelSize === 'Small') {
      sql += ' AND small_channel_score >= 80';
    }

    sql += ' ORDER BY opportunity_score DESC LIMIT 20';

    const candidates = db.prepare(sql).all(...params);
    const recommendations = candidates.map((k, index) => formatRecommendationItem(k, db, index, false, ''));

    // Compute Niche Statistics across all indexed keywords
    let nicheQuery = 'SELECT * FROM keywords';
    let nicheParams = [];
    if (niche && niche !== 'Any' && niche.trim() !== '') {
      nicheQuery += ' WHERE category LIKE ? OR term LIKE ?';
      nicheParams.push(`%${niche}%`, `%${niche}%`);
    }
    const allNicheKeywords = db.prepare(nicheQuery).all(...nicheParams);
    const totalInDb = allNicheKeywords.length;
    const avgComp = totalInDb > 0 ? Math.round(allNicheKeywords.reduce((acc, k) => acc + k.competition_score, 0) / totalInDb) : 0;
    const avgOpp = totalInDb > 0 ? Math.round(allNicheKeywords.reduce((acc, k) => acc + k.opportunity_score, 0) / totalInDb) : 0;

    // Fetch Near Matches if strict candidates are fewer than 8
    let nearMatches = [];
    const matchedIds = new Set(candidates.map(c => c.id));

    if (candidates.length < 8) {
      const nearCandidates = allNicheKeywords
        .filter(k => !matchedIds.has(k.id))
        .filter(k => k.opportunity_score >= Math.max(50, minOpportunityScore - 25))
        .sort((a, b) => b.opportunity_score - a.opportunity_score)
        .slice(0, 10);

      nearMatches = nearCandidates.map((k, idx) => {
        let reason = '';
        if (k.opportunity_score < minOpportunityScore && k.competition_score <= maxCompetition) {
          reason = `Score (${k.opportunity_score}) is just below ${minOpportunityScore}, but competition is low (${k.competition_score}/100).`;
        } else if (k.competition_score > maxCompetition) {
          reason = `Competition (${k.competition_score}/100) reflects authority channels in ${k.category}, but has heavy search demand (${k.demand_score}/100).`;
        } else if (goal === 'Evergreen' && k.evergreen_score < 80) {
          reason = `Evergreen score is ${k.evergreen_score}/100, but boasts a strong overall opportunity score (${k.opportunity_score}/100).`;
        } else if ((channelSize === 'New' || channelSize === 'Small') && k.small_channel_score < 80) {
          reason = `Moderate small channel proof (${k.small_channel_score}/100), but significant view demand and content gaps.`;
        } else {
          reason = `High-potential alternative angle with opportunity score of ${k.opportunity_score}/100.`;
        }

        return formatRecommendationItem(k, db, candidates.length + idx, true, reason);
      });
    }

    res.json({
      success: true,
      filters: { niche, channelSize, goal, minOpportunityScore, maxCompetition, preferredVideoType },
      totalRecommendations: recommendations.length,
      recommendations,
      nearMatches,
      nicheStats: {
        niche: niche || 'All Topics',
        totalInDatabase: totalInDb,
        averageCompetition: avgComp,
        averageOpportunityScore: avgOpp,
        strictMatchesCount: recommendations.length,
        nearMatchesCount: nearMatches.length
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6b. Mine Live YouTube Topics on Demand for Wizard
router.post('/find-video/mine', async (req, res) => {
  try {
    const db = getDb();
    const { niche = 'Finance', count = 3 } = req.body;

    if (!niche || !niche.trim()) {
      return res.status(400).json({ success: false, error: 'Niche is required for live mining.' });
    }

    if (!youtubeApi.isKeyConfigured()) {
      return res.status(400).json({
        success: false,
        error: 'YouTube API Key is not configured. Please paste your key in Settings.'
      });
    }

    // 1. Fetch zero-quota real YouTube search long tails
    const expandedTerms = await expandKeywordQuery(niche.trim());

    // 2. Filter out keywords that already exist in DB
    const existingTerms = new Set(
      db.prepare('SELECT LOWER(term) as term FROM keywords').all().map(r => r.term)
    );

    const candidateTerms = expandedTerms.filter(t => !existingTerms.has(t.toLowerCase()));

    // 3. Ingest top candidate terms live (up to count)
    const termsToIngest = candidateTerms.slice(0, Math.min(count, 3));
    const ingestedResults = [];

    for (const term of termsToIngest) {
      if (!quotaManager.canConsume(105)) break;
      try {
        const result = await ingestLiveYouTubeSearch(term, { category: niche.trim(), maxResults: 25 });
        if (result.success) {
          ingestedResults.push({
            term,
            score: result.keyword?.opportunity_score,
            competition: result.keyword?.competition_score,
            videosCount: result.videosCount
          });
        }
      } catch (err) {
        console.warn(`[Mine Error] Failed mining "${term}":`, err.message);
      }
    }

    res.json({
      success: true,
      niche: niche.trim(),
      minedCount: ingestedResults.length,
      mined: ingestedResults,
      quota: quotaManager.getStatus()
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Keyword Detail & Cluster Intelligence (Sections 6, 14, 25)
router.get('/keywords/:id', (req, res) => {
  try {
    const db = getDb();
    const kwId = req.params.id;

    const keyword = db.prepare('SELECT * FROM keywords WHERE id = ?').get(kwId);
    if (!keyword) {
      return res.status(404).json({ success: false, error: 'Keyword not found' });
    }

    // Historical trend snapshots (12 months / multi-year)
    const snapshots = db.prepare(`
      SELECT * FROM keyword_snapshots 
      WHERE keyword_id = ? 
      ORDER BY recorded_date ASC
    `).all(kwId);

    // Competing videos
    const competitors = db.prepare(`
      SELECT v.*, c.title as channel_title, c.subscriber_count, c.avatar_url
      FROM videos v
      JOIN channels c ON c.channel_id = v.channel_id
      WHERE v.keyword_id = ?
      ORDER BY v.view_count DESC
    `).all(kwId);

    // Content gaps
    const gaps = db.prepare('SELECT * FROM content_gaps WHERE keyword_id = ?').all(kwId);

    // Small channel proof
    const smallChannelAnalysis = analyzeSmallChannelSuccess(competitors);

    // Cluster info
    const clusters = db.prepare(`
      SELECT kc.cluster_role, t.name as parent_topic, t.category
      FROM keyword_clusters kc
      JOIN topics t ON t.id = kc.parent_topic_id
      WHERE kc.keyword_id = ?
    `).all(kwId);

    // Content Vacuum Check
    const vacuumCheck = evaluateContentVacuum(keyword, competitors);

    res.json({
      success: true,
      keyword,
      snapshots,
      competitors,
      gaps,
      smallChannelAnalysis,
      clusters,
      vacuumCheck
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. Competitor Video Detail & "Can I Beat This Video?" (Sections 19, 20, 34)
router.get('/videos/:id', (req, res) => {
  try {
    const db = getDb();
    const videoId = req.params.id;

    const video = db.prepare(`
      SELECT v.*, c.title as channel_title, c.subscriber_count, c.avatar_url, c.channel_age_years, k.term as keyword_term
      FROM videos v
      JOIN channels c ON c.channel_id = v.channel_id
      LEFT JOIN keywords k ON k.id = v.keyword_id
      WHERE v.video_id = ?
    `).get(videoId);

    if (!video) {
      return res.status(404).json({ success: false, error: 'Video not found' });
    }

    // Historical snapshot data & velocities
    const historicalAnalytics = getVideoHistoricalAnalytics(video.video_id, video.published_at, video.view_count);

    // Beatability Analysis
    const beatability = evaluateVideoBeatability(video);

    // Requirements to Beat
    const requirementsToBeat = generateRequirementsToBeat(video, video.keyword_term || video.title);

    res.json({
      success: true,
      video,
      historicalAnalytics,
      beatability,
      requirementsToBeat
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. Video Blueprint Generator (Section 21)
router.get('/blueprint/:id', (req, res) => {
  try {
    const db = getDb();
    const kwId = req.params.id;

    const keyword = db.prepare('SELECT * FROM keywords WHERE id = ?').get(kwId);
    if (!keyword) {
      return res.status(404).json({ success: false, error: 'Keyword not found' });
    }

    const gaps = db.prepare('SELECT * FROM content_gaps WHERE keyword_id = ?').all(kwId);
    const competitors = db.prepare('SELECT * FROM videos WHERE keyword_id = ?').all(kwId);

    const blueprint = generateVideoBlueprint(keyword, gaps, competitors);

    res.json({
      success: true,
      keyword,
      blueprint
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 10. Channel Opportunity Analysis & Channel vs Channel (Sections 35 & 36)
router.get('/channels/:id', (req, res) => {
  try {
    const db = getDb();
    const channelId = req.params.id;

    const channel = db.prepare('SELECT * FROM channels WHERE channel_id = ?').get(channelId);
    if (!channel) {
      return res.status(404).json({ success: false, error: 'Channel not found' });
    }

    const videos = db.prepare(`
      SELECT * FROM videos 
      WHERE channel_id = ? 
      ORDER BY view_count DESC
    `).all(channelId);

    const outliers = videos.filter(v => v.outlier_ratio >= 10);
    const viewsSum = videos.reduce((acc, v) => acc + v.view_count, 0);
    const averageViews = videos.length > 0 ? Math.round(viewsSum / videos.length) : 0;

    res.json({
      success: true,
      channel,
      stats: {
        totalAnalyzedVideos: videos.length,
        averageViews,
        outlierCount: outliers.length,
        highestOutlierRatio: outliers.length > 0 ? outliers[0].outlier_ratio : 1.0
      },
      topVideos: videos.slice(0, 10),
      outliers
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/channels/compare', (req, res) => {
  try {
    const db = getDb();
    const { channelAId, channelBId } = req.body;

    const channelA = db.prepare('SELECT * FROM channels WHERE channel_id = ?').get(channelAId);
    const channelB = db.prepare('SELECT * FROM channels WHERE channel_id = ?').get(channelBId);

    if (!channelA || !channelB) {
      return res.status(404).json({ success: false, error: 'One or both channels not found' });
    }

    const videosA = db.prepare('SELECT * FROM videos WHERE channel_id = ?').all(channelAId);
    const videosB = db.prepare('SELECT * FROM videos WHERE channel_id = ?').all(channelBId);

    res.json({
      success: true,
      comparison: {
        channelA: { ...channelA, analyzedVideos: videosA.length },
        channelB: { ...channelB, analyzedVideos: videosB.length }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 11. Watchlist & Alerts (Sections 37 & 64)
router.get('/watchlist', (req, res) => {
  try {
    const db = getDb();
    const items = db.prepare('SELECT * FROM watchlists ORDER BY created_at DESC').all();
    const alerts = db.prepare('SELECT * FROM alerts ORDER BY created_at DESC LIMIT 20').all();

    res.json({
      success: true,
      watchlist: items,
      alerts
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/watchlist', (req, res) => {
  try {
    const db = getDb();
    const { itemType = 'keyword', targetId, targetName, alertThreshold = 80.0 } = req.body;

    const kw = db.prepare('SELECT * FROM keywords WHERE id = ?').get(targetId);
    const lastScore = kw ? kw.opportunity_score : 75.0;

    const result = db.prepare(`
      INSERT INTO watchlists (item_type, target_id, target_name, alert_threshold_score, last_known_score)
      VALUES (?, ?, ?, ?, ?)
    `).run(itemType, targetId.toString(), targetName, alertThreshold, lastScore);

    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/watchlist/:id', (req, res) => {
  try {
    const db = getDb();
    db.prepare('DELETE FROM watchlists WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 12. Scoring Weights Configuration & Admin (Section 5)
router.get('/scoring-modes', (req, res) => {
  res.json({
    success: true,
    modes: SCORING_MODES,
    defaultWeights: DEFAULT_WEIGHTS
  });
});

// 13. API Quota Manager & Status (Sections 40 & 41)
router.get('/quota', (req, res) => {
  try {
    const status = quotaManager.getStatus();
    const recentLogs = quotaManager.getRecentLogs(20);
    res.json({
      success: true,
      status,
      recentLogs
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/settings/api-key', (req, res) => {
  try {
    const { apiKey } = req.body;
    youtubeApi.setApiKey(apiKey);
    res.json({
      success: true,
      message: 'YouTube API key updated successfully.',
      isConfigured: youtubeApi.isKeyConfigured()
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/settings/test-key', async (req, res) => {
  try {
    const result = await youtubeApi.testConnection();
    res.json({
      success: result.success,
      result,
      status: quotaManager.getStatus(),
      recentLogs: quotaManager.getRecentLogs(20)
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 14. Automated Daily Scan Simulation (Section 38)
router.post('/daily-scan', (req, res) => {
  try {
    const result = runDailyDiscoveryScan(20);
    res.json({
      success: true,
      scan: result
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 15. Export Dataset (CSV / JSON) (Section 61)
router.get('/export', (req, res) => {
  try {
    const db = getDb();
    const format = req.query.format || 'json';
    const keywords = db.prepare('SELECT * FROM keywords ORDER BY opportunity_score DESC').all();

    if (format === 'csv') {
      const headers = ['ID', 'Term', 'Category', 'Intent', 'Opportunity Score', 'Demand', 'Competition', 'Evergreen', 'Small Channel Proof', 'Outliers', 'Confidence'];
      const rows = keywords.map(k => [
        k.id,
        `"${k.term.replace(/"/g, '""')}"`,
        `"${k.category}"`,
        k.search_intent,
        k.opportunity_score,
        k.demand_score,
        k.competition_score,
        k.evergreen_score,
        k.small_channel_score,
        k.outlier_score,
        k.confidence
      ].join(','));

      const csvContent = [headers.join(','), ...rows].join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="youtube_opportunities.csv"');
      return res.send(csvContent);
    }

    res.json({
      success: true,
      exportedAt: new Date().toISOString(),
      count: keywords.length,
      data: keywords
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 16. Data Provenance Inspection ("Where did this number come from?")
router.get('/provenance', (req, res) => {
  try {
    const { metric, value, sourceType, snapshotCount, hasObserved } = req.query;
    const explanation = getMetricProvenance(metric, value, {
      source_type: sourceType,
      snapshot_count: parseInt(snapshotCount) || 1,
      has_observed: hasObserved === 'true'
    });
    res.json({ success: true, explanation });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 17. Google Trends Secondary Demand Signal
router.get('/trends/:keyword', async (req, res) => {
  try {
    const { keyword } = req.params;
    const region = req.query.region || 'US';
    const trendsData = await fetchGoogleTrendsData(keyword, region);
    const history = getGoogleTrendsHistory(keyword, region);
    res.json({ success: true, trends: trendsData, history });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 18. First-Party Private Channel Analytics (YouTube Analytics API)
router.get('/analytics/own-channel', (req, res) => {
  try {
    const channelId = req.query.channelId || 'UC_CREATOR_PRO_DEMO';
    const report = youtubeAnalytics.getOwnChannelAnalytics(channelId);
    res.json({ success: true, report });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/analytics/connect-channel', (req, res) => {
  try {
    const { channelId, title } = req.body;
    const result = youtubeAnalytics.connectUserChannel(channelId || 'UC_CONNECTED_USER', title || 'Connected YouTube Studio');
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 19. Background Job Queue Manager
router.get('/queue/status', (req, res) => {
  try {
    const status = queueManager.getQueueStatus();
    res.json({ success: true, queue: status });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/queue/batch', async (req, res) => {
  try {
    const limit = parseInt(req.body.limit) || 5;
    const result = await queueManager.processBatch(limit);
    const status = queueManager.getQueueStatus();
    res.json({ success: true, processed: result.processed, queue: status });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/queue/enqueue', (req, res) => {
  try {
    const { jobType, payload, priority } = req.body;
    const result = queueManager.enqueueJob(jobType, payload, priority || 'NORMAL');
    res.json({ success: true, job: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 20. Predictive Learning & Published Video Outcomes
router.get('/outcomes', (req, res) => {
  try {
    const report = getPredictiveLearningReport();
    res.json({ success: true, report });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/outcomes/record', (req, res) => {
  try {
    const { keywordId, videoId, title, publishedDate, targetMilestone } = req.body;
    const result = recordPublishedOutcome(keywordId, videoId, title, publishedDate, targetMilestone);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 21. Search Observations Supply Signal
router.get('/search-observations/:keyword', (req, res) => {
  try {
    const db = getDb();
    const rows = db.prepare(`
      SELECT * FROM search_observations 
      WHERE keyword LIKE ? 
      ORDER BY query_timestamp DESC 
      LIMIT 5
    `).all(`%${req.params.keyword}%`);
    res.json({ success: true, observations: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 22. Zero-Quota Public Autocomplete Stream (0 YouTube Quota Cost)
router.get('/suggest', async (req, res) => {
  try {
    const q = req.query.q || '';
    if (!q) {
      return res.json({ success: true, suggestions: [] });
    }
    const suggestions = await fetchYouTubeSuggestions(q);
    res.json({ success: true, suggestions, zero_quota: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
