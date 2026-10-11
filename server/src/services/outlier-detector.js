// Small Channel Outlier Detection & Success Analysis (Sections 9 & 10)

/**
 * Classify outlier ratio into designated tiers
 */
function getOutlierTier(ratio) {
  if (ratio >= 500) return '500x+';
  if (ratio >= 250) return '250x';
  if (ratio >= 100) return '100x';
  if (ratio >= 50) return '50x';
  if (ratio >= 25) return '25x';
  if (ratio >= 10) return '10x';
  return 'NONE';
}

/**
 * Calculate Outlier Ratio and Score for a single video
 */
function analyzeVideoOutlier(videoViews, channelSubscribers) {
  const safeSubs = Math.max(10, channelSubscribers || 0);
  const ratio = Math.round((videoViews / safeSubs) * 10) / 10;
  const tier = getOutlierTier(ratio);

  // Outlier Score (0 to 100)
  // 1x = 10, 10x = 50, 50x = 75, 100x = 90, 250x+ = 98-100
  let score = 0;
  if (ratio >= 500) score = 100;
  else if (ratio >= 250) score = 95;
  else if (ratio >= 100) score = 90;
  else if (ratio >= 50) score = 80;
  else if (ratio >= 25) score = 65;
  else if (ratio >= 10) score = 50;
  else if (ratio >= 5) score = 35;
  else score = Math.min(25, Math.round(ratio * 5));

  const isMassiveOutlier = ratio >= 100;

  return {
    ratio,
    tier,
    score,
    isMassiveOutlier,
    label: isMassiveOutlier ? '🔥 MASSIVE OUTLIER' : (ratio >= 10 ? '⚡ OUTLIER' : 'Standard')
  };
}

/**
 * Analyze small channel success proof across a corpus of competing videos (Section 10)
 */
function analyzeSmallChannelSuccess(videos = []) {
  if (!videos || videos.length === 0) {
    return {
      totalAnalyzed: 0,
      channelsUnder1K: 0,
      channelsUnder5K: 0,
      channelsUnder10K: 0,
      videosOver100K: 0,
      videosOver500K: 0,
      videosOver1M: 0,
      smallChannelScore: 30,
      outlierCount: 0,
      verdict: 'Insufficient data'
    };
  }

  let channelsUnder1K = 0;
  let channelsUnder5K = 0;
  let channelsUnder10K = 0;
  let videosOver100K = 0;
  let videosOver500K = 0;
  let videosOver1M = 0;
  let smallChannelHighViewWins = 0;
  let outliersFound = 0;

  videos.forEach(v => {
    const subs = v.subscriber_count || 100000;
    const views = v.view_count || 0;
    const ratio = subs > 0 ? views / subs : 0;

    if (subs < 1000) channelsUnder1K++;
    if (subs < 5000) channelsUnder5K++;
    if (subs < 10000) channelsUnder10K++;

    if (views >= 100000) videosOver100K++;
    if (views >= 500000) videosOver500K++;
    if (views >= 1000000) videosOver1M++;

    // Small channel win: <15K subs and >50K views
    if (subs <= 15000 && views >= 50000) {
      smallChannelHighViewWins++;
    }

    if (ratio >= 10) {
      outliersFound++;
    }
  });

  // Calculate Small Channel Opportunity Score (0-100)
  // Evaluates whether channel authority is an impassable wall or if algorithm gives small creators a chance
  let score = 25; // baseline
  score += Math.min(30, channelsUnder10K * 4);
  score += Math.min(30, smallChannelHighViewWins * 7);
  score += Math.min(15, outliersFound * 3);
  score = Math.min(100, Math.max(10, score));

  let verdict = 'Difficult for new channels — High authority dominance';
  if (score >= 80) {
    verdict = 'Excellent — Small creators frequently outperform mega-channels';
  } else if (score >= 60) {
    verdict = 'Promising — Proven small channel breakouts in top results';
  } else if (score >= 40) {
    verdict = 'Moderate — Possible with strong packaging and long-tail focus';
  }

  return {
    totalAnalyzed: videos.length,
    channelsUnder1K,
    channelsUnder5K,
    channelsUnder10K,
    videosOver100K,
    videosOver500K,
    videosOver1M,
    smallChannelHighViewWins,
    outliersFound,
    smallChannelScore: score,
    verdict
  };
}

module.exports = {
  getOutlierTier,
  analyzeVideoOutlier,
  analyzeSmallChannelSuccess
};
