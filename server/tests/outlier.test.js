// Unit tests for Outlier Detector

const test = require('node:test');
const assert = require('node:assert');
const { analyzeVideoOutlier, getOutlierTier, analyzeSmallChannelSuccess } = require('../src/services/outlier-detector');

test('Outlier Ratio correctly identifies 100x+ massive outlier', () => {
  const result = analyzeVideoOutlier(850000, 4800);
  assert.ok(result.ratio >= 170, `Ratio should be ~177x, got ${result.ratio}`);
  assert.strictEqual(result.tier, '100x');
  assert.strictEqual(result.isMassiveOutlier, true);
  assert.strictEqual(result.label, '🔥 MASSIVE OUTLIER');
});

test('Outlier tier mapping matches designated thresholds', () => {
  assert.strictEqual(getOutlierTier(550), '500x+');
  assert.strictEqual(getOutlierTier(300), '250x');
  assert.strictEqual(getOutlierTier(120), '100x');
  assert.strictEqual(getOutlierTier(60), '50x');
  assert.strictEqual(getOutlierTier(30), '25x');
  assert.strictEqual(getOutlierTier(15), '10x');
  assert.strictEqual(getOutlierTier(4), 'NONE');
});

test('Small channel success analysis calculates evidence correctly', () => {
  const sampleVideos = [
    { subscriber_count: 3200, view_count: 450000 },
    { subscriber_count: 4800, view_count: 850000 },
    { subscriber_count: 8900, view_count: 210000 },
    { subscriber_count: 1500000, view_count: 1200000 }
  ];

  const analysis = analyzeSmallChannelSuccess(sampleVideos);
  assert.strictEqual(analysis.channelsUnder5K, 2);
  assert.strictEqual(analysis.channelsUnder10K, 3);
  assert.strictEqual(analysis.videosOver500K, 2);
  assert.ok(analysis.smallChannelScore >= 65, `Score should be promising, got ${analysis.smallChannelScore}`);
});
