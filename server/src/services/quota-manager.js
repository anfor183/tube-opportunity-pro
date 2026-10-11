// YouTube Data API Quota Manager (Section 40)

const { getDb } = require('../db');

class QuotaManager {
  constructor(dailyLimit = 10000) {
    this.dailyLimit = dailyLimit;
  }

  getTodayStartTimestamp() {
    const now = new Date();
    // YouTube quota resets at midnight Pacific Time (PT), UTC-7 or UTC-8. We approximate with UTC midnight.
    const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 7, 0, 0));
    if (now < startOfDay) {
      startOfDay.setUTCDate(startOfDay.getUTCDate() - 1);
    }
    return startOfDay.toISOString();
  }

  getResetTime() {
    const now = new Date();
    const nextReset = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 7, 0, 0));
    if (now >= nextReset) {
      nextReset.setUTCDate(nextReset.getUTCDate() + 1);
    }
    return nextReset.toISOString();
  }

  getStatus() {
    const db = getDb();
    const resetTime = this.getResetTime();
    const todayStart = this.getTodayStartTimestamp();

    const row = db.prepare(`
      SELECT SUM(units_consumed) as total_used 
      FROM api_quota_logs 
      WHERE datetime(created_at) >= datetime('now', 'start of day')
    `).get();

    const unitsUsed = row && row.total_used ? row.total_used : 0;
    const unitsRemaining = Math.max(0, this.dailyLimit - unitsUsed);
    const percentUsed = Math.round((unitsUsed / this.dailyLimit) * 100);

    return {
      dailyLimit: this.dailyLimit,
      unitsUsed,
      unitsRemaining,
      percentUsed,
      resetTimestamp: resetTime,
      isExhausted: unitsRemaining <= 0,
      apiKeyConfigured: !!(process.env.YOUTUBE_API_KEY && process.env.YOUTUBE_API_KEY.trim().length > 5)
    };
  }

  canConsume(units = 1) {
    const status = this.getStatus();
    return status.unitsRemaining >= units;
  }

  recordConsumption(endpoint, units, status = 'OK') {
    const db = getDb();
    const currentStatus = this.getStatus();
    const newRemaining = Math.max(0, currentStatus.unitsRemaining - units);

    db.prepare(`
      INSERT INTO api_quota_logs (endpoint, units_consumed, units_remaining, total_daily_limit, reset_timestamp, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(endpoint, units, newRemaining, this.dailyLimit, this.getResetTime(), status);

    return {
      unitsConsumed: units,
      unitsRemaining: newRemaining
    };
  }

  getRecentLogs(limit = 25) {
    const db = getDb();
    return db.prepare(`
      SELECT * FROM api_quota_logs 
      ORDER BY id DESC 
      LIMIT ?
    `).all(limit);
  }
}

const quotaManager = new QuotaManager();

module.exports = {
  quotaManager,
  QuotaManager
};
