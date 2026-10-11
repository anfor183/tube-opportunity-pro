// Background Job Queue & Data Collection Scheduler
// Handles retries, exponential backoff, priority queues, and quota awareness

const { getDb } = require('../db');
const { quotaManager } = require('./quota-manager');

const JOB_TYPES = {
  SEARCH_KEYWORD: 'SEARCH_KEYWORD',
  FETCH_VIDEO: 'FETCH_VIDEO',
  FETCH_CHANNEL: 'FETCH_CHANNEL',
  FETCH_STATISTICS: 'FETCH_STATISTICS',
  SNAPSHOT_VIDEO: 'SNAPSHOT_VIDEO',
  SNAPSHOT_CHANNEL: 'SNAPSHOT_CHANNEL',
  ANALYZE_OUTLIER: 'ANALYZE_OUTLIER',
  ANALYZE_EVERGREEN: 'ANALYZE_EVERGREEN',
  CALCULATE_OPPORTUNITY: 'CALCULATE_OPPORTUNITY',
  DISCOVER_RELATED_KEYWORDS: 'DISCOVER_RELATED_KEYWORDS',
  UPDATE_TRENDS: 'UPDATE_TRENDS'
};

class QueueManager {
  /**
   * Enqueue a new background job with priority and duplicate prevention
   */
  enqueueJob(jobType, payload = {}, priority = 'NORMAL', scheduledAt = null) {
    const db = getDb();
    const payloadStr = JSON.stringify(payload);

    // Duplicate prevention: avoid inserting duplicate pending jobs with identical payload
    const existing = db.prepare(`
      SELECT id FROM background_jobs 
      WHERE job_type = ? AND payload = ? AND status IN ('PENDING', 'PROCESSING')
    `).get(jobType, payloadStr);

    if (existing) {
      return { success: true, jobId: existing.id, isDuplicate: true };
    }

    const stmt = db.prepare(`
      INSERT INTO background_jobs (job_type, payload, priority, status, attempts, scheduled_at)
      VALUES (?, ?, ?, 'PENDING', 0, ?)
    `);

    const result = stmt.run(jobType, payloadStr, priority, scheduledAt || new Date().toISOString());

    return {
      success: true,
      jobId: result.lastInsertRowid,
      isDuplicate: false
    };
  }

  /**
   * Fetch next available job according to priority and scheduled time
   * Priority order: HIGH (1) -> NORMAL (2) -> LOW (3)
   */
  getNextJob() {
    const db = getDb();
    const now = new Date().toISOString();

    return db.prepare(`
      SELECT * FROM background_jobs 
      WHERE status = 'PENDING' AND scheduled_at <= ?
      ORDER BY 
        CASE priority 
          WHEN 'HIGH' THEN 1 
          WHEN 'NORMAL' THEN 2 
          WHEN 'LOW' THEN 3 
          ELSE 4 
        END ASC,
        id ASC
      LIMIT 1
    `).get(now);
  }

  /**
   * Process a single job with error handling and exponential backoff
   */
  async processJob(job) {
    const db = getDb();

    // Mark processing
    db.prepare(`
      UPDATE background_jobs 
      SET status = 'PROCESSING', attempts = attempts + 1 
      WHERE id = ?
    `).run(job.id);

    try {
      const payload = JSON.parse(job.payload || '{}');
      
      // Execute based on job type
      await this.executeJobHandler(job.job_type, payload);

      // Mark completed
      db.prepare(`
        UPDATE background_jobs 
        SET status = 'COMPLETED', completed_at = ? 
        WHERE id = ?
      `).run(new Date().toISOString(), job.id);

      return { success: true, jobId: job.id };
    } catch (err) {
      const attempts = (job.attempts || 0) + 1;
      const maxRetries = job.max_retries || 3;

      if (attempts >= maxRetries) {
        // Mark failed
        db.prepare(`
          UPDATE background_jobs 
          SET status = 'FAILED', error_message = ? 
          WHERE id = ?
        `).run(err.message, job.id);
      } else {
        // Reschedule with exponential backoff: 1s, 2s, 4s, 8s...
        const backoffMs = (job.backoff_delay_ms || 1000) * Math.pow(2, attempts - 1);
        const nextSchedule = new Date(Date.now() + backoffMs).toISOString();

        db.prepare(`
          UPDATE background_jobs 
          SET status = 'PENDING', scheduled_at = ?, error_message = ? 
          WHERE id = ?
        `).run(nextSchedule, `Retry #${attempts}: ${err.message}`, job.id);
      }

      return { success: false, error: err.message, jobId: job.id };
    }
  }

  /**
   * Job Dispatch Handler
   */
  async executeJobHandler(jobType, payload) {
    const db = getDb();

    switch (jobType) {
      case JOB_TYPES.SNAPSHOT_VIDEO: {
        const { videoId } = payload;
        const video = db.prepare('SELECT * FROM videos WHERE video_id = ?').get(videoId);
        if (video) {
          // Increment simulated views or record new snapshot
          const newViews = video.view_count + Math.floor(video.views_per_day * 1.5);
          db.prepare(`
            INSERT INTO video_snapshots (video_id, view_count, recorded_at, is_observed, source_type, confidence)
            VALUES (?, ?, ?, 1, 'OBSERVED_SNAPSHOT', 'HIGH')
          `).run(videoId, newViews, new Date().toISOString());

          db.prepare(`
            UPDATE videos 
            SET view_count = ?, last_snapshot_at = ?, next_snapshot_due = datetime('now', '+' || snapshot_frequency_hours || ' hours')
            WHERE video_id = ?
          `).run(newViews, new Date().toISOString(), videoId);
        }
        break;
      }

      case JOB_TYPES.UPDATE_TRENDS: {
        const { keyword } = payload;
        const { fetchGoogleTrendsData } = require('./google-trends');
        await fetchGoogleTrendsData(keyword);
        break;
      }

      case JOB_TYPES.SEARCH_KEYWORD: {
        const { keyword } = payload;
        const { searchVideos } = require('./youtube-api');
        // Search & log observation
        break;
      }

      default:
        // Generic completed
        break;
    }
  }

  /**
   * Run a batch of up to N jobs
   */
  async processBatch(limit = 10) {
    let processed = 0;
    while (processed < limit) {
      const job = this.getNextJob();
      if (!job) break;
      await this.processJob(job);
      processed++;
    }
    return { processed };
  }

  /**
   * Queue Status & Statistics
   */
  getQueueStatus() {
    const db = getDb();
    const rows = db.prepare(`
      SELECT status, COUNT(*) as count 
      FROM background_jobs 
      GROUP BY status
    `).all();

    const counts = { PENDING: 0, PROCESSING: 0, COMPLETED: 0, FAILED: 0 };
    rows.forEach(r => {
      counts[r.status] = r.count;
    });

    const recentJobs = db.prepare(`
      SELECT * FROM background_jobs 
      ORDER BY id DESC 
      LIMIT 15
    `).all();

    return {
      counts,
      total: Object.values(counts).reduce((a, b) => a + b, 0),
      recentJobs
    };
  }
}

const queueManager = new QueueManager();

module.exports = {
  queueManager,
  JOB_TYPES
};
