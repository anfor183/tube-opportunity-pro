// Unit tests for Historical Snapshots & Video Velocity Engine

const test = require('node:test');
const assert = require('node:assert');
const { getVideoHistoricalAnalytics } = require('../src/services/snapshot-engine');

test('Video velocity calculation handles lifetime and daily velocities', () => {
  const publishedAt = new Date(Date.now() - (100 * 24 * 60 * 60 * 1000)).toISOString(); // 100 days old
  const lifetimeViews = 100000;

  const result = getVideoHistoricalAnalytics('test_vid_non_existent', publishedAt, lifetimeViews);
  assert.strictEqual(result.lifetimeViews, 100000);
  assert.ok(result.viewsPerDay >= 950 && result.viewsPerDay <= 1050, `Views/day should be ~1000, got ${result.viewsPerDay}`);
  assert.ok(result.viewsPerMonth > 25000);
});
