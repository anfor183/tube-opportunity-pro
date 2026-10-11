// Multi-Factor YouTube Opportunity Scoring Engine

const { DEFAULT_WEIGHTS, SCORING_MODES } = require('../config/scoring-weights');

/**
 * Logarithmic normalization for view counts or subscriber metrics
 * Maps value from [0, maxVal] to [0, 100] with log smoothing
 */
function logNormalize(val, minVal = 0, maxVal = 10000000) {
  if (val <= minVal) return 0;
  const clamped = Math.min(val, maxVal);
  const logClamped = Math.log10(clamped + 1);
  const logMax = Math.log10(maxVal + 1);
  return Math.min(100, Math.max(0, (logClamped / logMax) * 100));
}

/**
 * Calculate Opportunity Score based on weights and component metrics
 */
function calculateOpportunityScore(metrics, customWeights = null, mode = 'default') {
  const activeWeights = customWeights || (SCORING_MODES[mode] ? SCORING_MODES[mode].weights : DEFAULT_WEIGHTS);

  const demand = Math.min(100, Math.max(0, metrics.demand_score || 0));
  // For competition, lower competition is better for opportunity! (100 - comp)
  const competitionAdvantage = Math.min(100, Math.max(0, 100 - (metrics.competition_score || 50)));
  // For supply gap, lower supply is a bigger gap / better opportunity (100 - supply)
  const supplyGap = Math.min(100, Math.max(0, 100 - (metrics.quality_adjusted_supply || metrics.supply_score || 50)));
  const contentQualityGap = Math.min(100, Math.max(0, metrics.content_gap_score || 0));
  const evergreenPotential = Math.min(100, Math.max(0, metrics.evergreen_score || 0));
  const smallChannelProof = Math.min(100, Math.max(0, metrics.small_channel_score || 0));
  const outlierEvidence = Math.min(100, Math.max(0, metrics.outlier_score || 0));
  const trendStability = Math.min(100, Math.max(0, metrics.trend_stability || 50));
  const freshnessOpportunity = Math.min(100, Math.max(0, metrics.freshness_score || 50));
  const searchIntent = Math.min(100, Math.max(0, metrics.search_intent_clarity || 50));

  const totalScore = 
    (demand * (activeWeights.demand || 0.20)) +
    (competitionAdvantage * (activeWeights.competition || 0.15)) +
    (supplyGap * (activeWeights.supplyGap || 0.15)) +
    (contentQualityGap * (activeWeights.contentQualityGap || 0.15)) +
    (evergreenPotential * (activeWeights.evergreenPotential || 0.10)) +
    (smallChannelProof * (activeWeights.smallChannelProof || 0.08)) +
    (outlierEvidence * (activeWeights.outlierEvidence || 0.07)) +
    (trendStability * (activeWeights.trendStability || 0.05)) +
    (freshnessOpportunity * (activeWeights.freshnessOpportunity || 0.03)) +
    (searchIntent * (activeWeights.searchIntent || 0.02));

  const roundedScore = Math.round(Math.min(100, Math.max(0, totalScore)) * 10) / 10;
  
  let label = 'Poor opportunity';
  let tier = 'POOR';
  if (roundedScore >= 90) {
    label = 'Exceptional opportunity';
    tier = 'EXCEPTIONAL';
  } else if (roundedScore >= 80) {
    label = 'Very strong opportunity';
    tier = 'VERY_STRONG';
  } else if (roundedScore >= 70) {
    label = 'Strong opportunity';
    tier = 'STRONG';
  } else if (roundedScore >= 60) {
    label = 'Moderate opportunity';
    tier = 'MODERATE';
  } else if (roundedScore >= 50) {
    label = 'Weak opportunity';
    tier = 'WEAK';
  }

  return {
    score: roundedScore,
    label,
    tier,
    components: {
      demand,
      competitionAdvantage,
      supplyGap,
      contentQualityGap,
      evergreenPotential,
      smallChannelProof,
      outlierEvidence,
      trendStability,
      freshnessOpportunity,
      searchIntent
    },
    modeUsed: mode
  };
}

/**
 * Calculate Quality-Adjusted Supply (Section 47)
 * Takes raw video count and weights it by video quality, authority, freshness, and relevance
 */
function calculateQualityAdjustedSupply(arg1 = [], arg2 = []) {
  const videos = Array.isArray(arg1) ? arg1 : (Array.isArray(arg2) ? arg2 : []);
  if (!videos || videos.length === 0) return 20;

  let weightedSum = 0;
  videos.forEach(v => {
    const authorityWeight = (v.authority_score || 50) / 100;
    const depthWeight = (v.content_depth_score || 50) / 100;
    const engagementWeight = Math.min(1, (v.viewer_engagement_rate || 0.04) / 0.08);
    const freshnessWeight = v.freshness_years <= 1.0 ? 1.0 : (v.freshness_years <= 2.5 ? 0.7 : 0.4);

    const qualityMultiplier = (authorityWeight * 0.35) + (depthWeight * 0.35) + (freshnessWeight * 0.20) + (engagementWeight * 0.10);
    weightedSum += qualityMultiplier;
  });

  // Normalize: 0 to 100 scale
  const normalized = Math.min(100, Math.round((weightedSum / Math.max(1, videos.length * 0.75)) * 100));
  return normalized;
}

/**
 * Calculate Demand/Supply Ratio Index (0-100)
 */
function calculateDemandSupplyRatio(demandScore, supplyScore) {
  const safeSupply = Math.max(5, supplyScore);
  const ratio = (demandScore / safeSupply) * 50;
  return Math.min(100, Math.round(ratio));
}

/**
 * Generate transparent explainable AI rationale based on metrics (Section 22)
 */
function generateOpportunityExplanation(keywordData, competitorCount, smallChannelProofCount, topCompetitorAge) {
  const reasons = [];
  
  if (keywordData.demand_score >= 75) {
    reasons.push(`High sustained viewer demand (score: ${keywordData.demand_score}/100) indicates active audience interest.`);
  } else if (keywordData.demand_score >= 60) {
    reasons.push(`Moderate, steady search interest with reliable monthly volume signals.`);
  }

  if (keywordData.supply_score <= 40 || keywordData.quality_adjusted_supply <= 45) {
    reasons.push(`Supply is low with only ${keywordData.relevant_videos_count || competitorCount || 15} relevant videos; quality-adjusted supply is favorable.`);
  } else {
    reasons.push(`Competitor saturation exists, but existing videos suffer from quality or freshness gaps.`);
  }

  if (keywordData.small_channel_score >= 70 || smallChannelProofCount >= 3) {
    reasons.push(`Strong small channel proof: multiple creators with under 10K subscribers have generated high view counts.`);
  }

  if (topCompetitorAge >= 2) {
    reasons.push(`Top-ranking videos average ${topCompetitorAge.toFixed(1)} years old, presenting an immediate freshness opportunity.`);
  }

  if (keywordData.evergreen_score >= 80) {
    reasons.push(`Evergreen stability is rated ${keywordData.evergreen_score}/100, suggesting multi-year traffic longevity.`);
  }

  return reasons.join(' ');
}

module.exports = {
  logNormalize,
  calculateOpportunityScore,
  calculateQualityAdjustedSupply,
  calculateDemandSupplyRatio,
  generateOpportunityExplanation
};
