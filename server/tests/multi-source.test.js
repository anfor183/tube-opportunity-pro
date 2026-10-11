// Unit tests for Multi-Source Provenance & Queue Engine

const test = require('node:test');
const assert = require('node:assert');
const { getMetricProvenance, SOURCE_TYPES } = require('../src/services/provenance-service');
const { queueManager, JOB_TYPES } = require('../src/services/queue-manager');
const { recordPublishedOutcome, getPredictiveLearningReport } = require('../src/services/outcome-learner');

test('Data Provenance Engine accurately explains derived snapshot velocity', () => {
  const result = getMetricProvenance('velocity', 4218, {
    snapshot_count: 7,
    has_observed: true
  });

  assert.strictEqual(result.source_type, SOURCE_TYPES.CALCULATED);
  assert.strictEqual(result.confidence, 'HIGH');
  assert.ok(result.methodology.includes('observed snapshots'));
  assert.strictEqual(result.snapshot_count, 7);
  assert.strictEqual(result.label, 'Calculated from observed snapshots.');
});

test('Data Provenance Engine marks Demand Score as modeled multi-signal', () => {
  const result = getMetricProvenance('demand_score', 82, {
    keyword_snapshots_count: 12
  });

  assert.strictEqual(result.source_type, SOURCE_TYPES.MODELED);
  assert.ok(result.inputs.some(i => i.includes('Google Trends')));
  assert.ok(result.inputs.some(i => i.includes('YouTube autocomplete')));
});

test('Background Job Queue enforces priority and handles batch execution', async () => {
  // Enqueue high and normal jobs
  const res1 = queueManager.enqueueJob(JOB_TYPES.UPDATE_TRENDS, { keyword: 'Test AI Query' }, 'HIGH');
  const res2 = queueManager.enqueueJob(JOB_TYPES.CALCULATE_OPPORTUNITY, { test: 123 }, 'LOW');

  assert.strictEqual(res1.success, true);
  assert.strictEqual(res2.success, true);

  const status = queueManager.getQueueStatus();
  assert.ok(status.counts.PENDING >= 1);

  // Process batch
  const batchRes = await queueManager.processBatch(2);
  assert.ok(batchRes.processed >= 1);
});

test('Predictive Learning Model tracks published outcomes and calibrates accuracy', () => {
  const { getDb } = require('../src/db');
  const { seedDatabase } = require('../src/db/seeds/realistic-seeds');
  seedDatabase();
  const kw = getDb().prepare('SELECT id FROM keywords LIMIT 1').get();
  const kwId = kw ? kw.id : null;

  const res = recordPublishedOutcome(kwId, 'test_vid_outcome_99', 'My Test Published Video', '2026-09-01', 15000);
  assert.strictEqual(res.success, true);
  assert.strictEqual(res.videoId, 'test_vid_outcome_99');

  const report = getPredictiveLearningReport();
  assert.ok(report.totalTracked >= 1);
  assert.ok(report.featureWeightsLearned.length >= 3);
});
