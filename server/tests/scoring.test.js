// Unit tests for Opportunity Scoring Engine

const test = require('node:test');
const assert = require('node:assert');
const { calculateOpportunityScore, logNormalize, calculateDemandSupplyRatio } = require('../src/services/scoring-engine');

test('Opportunity Score correctly identifies very strong opportunity', () => {
  const highMetrics = {
    demand_score: 95,
    competition_score: 20, // Low comp -> 80 advantage
    quality_adjusted_supply: 25, // Low supply -> 75 gap
    content_gap_score: 90,
    evergreen_score: 95,
    small_channel_score: 92,
    outlier_score: 90,
    trend_stability: 90,
    freshness_score: 85,
    search_intent_clarity: 95
  };

  const result = calculateOpportunityScore(highMetrics);
  assert.ok(result.score >= 80 && result.score < 90, `Score should be 80-89, got ${result.score}`);
  assert.strictEqual(result.tier, 'VERY_STRONG');
});

test('Opportunity Score correctly identifies exceptional opportunity', () => {
  const exceptionalMetrics = {
    demand_score: 98,
    competition_score: 10, // 90 advantage
    quality_adjusted_supply: 15, // 85 gap
    content_gap_score: 95,
    evergreen_score: 96,
    small_channel_score: 96,
    outlier_score: 95,
    trend_stability: 95,
    freshness_score: 95,
    search_intent_clarity: 98
  };

  const result = calculateOpportunityScore(exceptionalMetrics);
  assert.ok(result.score >= 90, `Score should be >= 90, got ${result.score}`);
  assert.strictEqual(result.tier, 'EXCEPTIONAL');
});

test('Opportunity Score correctly scores weak saturated opportunity', () => {
  const weakMetrics = {
    demand_score: 40,
    competition_score: 85, // High comp -> 15 advantage
    quality_adjusted_supply: 90, // High supply -> 10 gap
    content_gap_score: 30,
    evergreen_score: 40,
    small_channel_score: 25,
    outlier_score: 20,
    trend_stability: 30,
    freshness_score: 20,
    search_intent_clarity: 40
  };

  const result = calculateOpportunityScore(weakMetrics);
  assert.ok(result.score < 50, `Score should be < 50, got ${result.score}`);
  assert.strictEqual(result.tier, 'POOR');
});

test('Logarithmic normalization functions within 0-100 bounds', () => {
  assert.strictEqual(logNormalize(0), 0);
  const mid = logNormalize(100000);
  assert.ok(mid > 60 && mid < 85, `Mid value should be reasonably scaled: ${mid}`);
  const max = logNormalize(10000000);
  assert.ok(max >= 99);
});

test('Demand/Supply ratio scales correctly', () => {
  const ratio = calculateDemandSupplyRatio(90, 30);
  assert.ok(ratio >= 90);
});
