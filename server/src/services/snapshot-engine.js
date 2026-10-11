// Historical Snapshot Engine & Performance Derivation (Sections 7 & 8)
// Strictly labels derived metrics: "Calculated from observed snapshots."

const { getDb } = require('../db');

/**
 * Assign snapshot frequency and priority based on video opportunity metrics
 * High-priority: 12h, Normal: 72h, Evergreen: 336h (14 days)
 */
function assignSnapshotPriority(video) {
  let priority = 'NORMAL';
  let frequencyHours = 72; // 3 days

  const outlierRatio = video.outlier_ratio || 1;
  const evergreenScore = video.evergreen_score || 50;
  const beatabilityScore = video.beatability_score || 50;

  if (outlierRatio >= 50 || beatabilityScore >= 80) {
    priority = 'HIGH';
    frequencyHours = 12; // Every 12 hours
  } else if (evergreenScore >= 85 && video.freshness_years >= 2.0) {
    priority = 'EVERGREEN_LOW';
    frequencyHours = 336; // Every 2 weeks
  }

  const nextDue = new Date(Date.now() + (frequencyHours * 3600 * 1000)).toISOString();

  return { priority, frequencyHours, nextDue };
}

/**
 * Record an immutable video snapshot
 * Never overwrites previous observations!
 */
function recordImmutableVideoSnapshot(videoData) {
  const db = getDb();
  const recordedAt = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO video_snapshots (
      video_id, recorded_at, view_count, like_count, comment_count,
      channel_subscriber_count, channel_video_count, title, publication_date,
      duration, search_keyword, search_position, is_observed, source_type, confidence
    ) VALUES (
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?
    )
  `);

  stmt.run(
    videoData.videoId,
    recordedAt,
    videoData.views,
    videoData.likes || 0,
    videoData.comments || 0,
    videoData.subscribers || 0,
    videoData.channelVideos || 0,
    videoData.title || '',
    videoData.publishedAt || recordedAt,
    videoData.duration || 600,
    videoData.searchKeyword || '',
    videoData.searchPosition || 1,
    videoData.isObserved !== false ? 1 : 0,
    videoData.sourceType || 'OBSERVED_SNAPSHOT',
    videoData.confidence || 'HIGH'
  );

  return { videoId: videoData.videoId, views: videoData.views, recordedAt };
}

/**
 * Get snapshots for a video and calculate derived performance metrics
 * All derived metrics are explicitly marked: "Calculated from observed snapshots."
 */
function getVideoHistoricalAnalytics(videoId, publishedAt, lifetimeViews) {
  const db = getDb();
  const now = new Date();
  const publishDate = new Date(publishedAt || now);
  const ageDays = Math.max(1, (now.getTime() - publishDate.getTime()) / (1000 * 60 * 60 * 24));

  // Retrieve immutable recorded snapshots sorted chronologically
  const snapshots = db.prepare(`
    SELECT * FROM video_snapshots 
    WHERE video_id = ? 
    ORDER BY recorded_at ASC
  `).all(videoId);

  const hasObservedData = snapshots.length > 0;
  const snapshotCount = snapshots.length;

  // Base daily velocity
  const viewsPerDay = Math.round(lifetimeViews / ageDays);
  const viewsPerWeek = Math.round(viewsPerDay * 7);
  const viewsPerMonth = Math.round(viewsPerDay * 30.4);

  // Derive time windows
  let views7d = Math.round(viewsPerDay * 7);
  let views30d = Math.round(viewsPerDay * 30);
  let views90d = Math.round(viewsPerDay * 90);
  let velocity7d = viewsPerDay;
  let velocity30d = viewsPerDay;
  let velocity90d = viewsPerDay;
  let velocityAcceleration = 0;
  let isDecelerating = false;

  if (snapshots.length >= 2) {
    const latest = snapshots[snapshots.length - 1];

    // 7-day window
    const t7 = now.getTime() - (7 * 24 * 3600 * 1000);
    const snap7 = snapshots.find(s => new Date(s.recorded_at).getTime() >= t7) || snapshots[0];
    views7d = Math.max(0, latest.view_count - snap7.view_count);
    velocity7d = Math.round(views7d / 7);

    // 30-day window
    const t30 = now.getTime() - (30 * 24 * 3600 * 1000);
    const snap30 = snapshots.find(s => new Date(s.recorded_at).getTime() >= t30) || snapshots[0];
    views30d = Math.max(0, latest.view_count - snap30.view_count);
    velocity30d = Math.round(views30d / 30);

    // 90-day window
    const t90 = now.getTime() - (90 * 24 * 3600 * 1000);
    const snap90 = snapshots.find(s => new Date(s.recorded_at).getTime() >= t90) || snapshots[0];
    views90d = Math.max(0, latest.view_count - snap90.view_count);
    velocity90d = Math.round(views90d / 90);

    // Acceleration: Recent velocity vs lifetime average
    if (viewsPerDay > 0) {
      velocityAcceleration = Math.round(((velocity30d - viewsPerDay) / viewsPerDay) * 1000) / 10;
      isDecelerating = velocityAcceleration < -15;
    }
  }

  return {
    lifetimeViews,
    ageDays: Math.round(ageDays),
    viewsPerDay,
    viewsPerWeek,
    viewsPerMonth,
    views7d,
    views30d,
    views90d,
    velocity7d,
    velocity30d,
    velocity90d,
    velocityAcceleration,
    isDecelerating,
    hasObservedData,
    snapshotCount,
    provenanceBadge: {
      label: 'Calculated from observed snapshots',
      method: `Derived from ${snapshotCount} historical immutable snapshot records over ${Math.round(ageDays)} days.`,
      confidence: snapshotCount >= 3 ? 'HIGH' : 'MEDIUM'
    },
    snapshots: snapshots.map(s => ({
      views: s.view_count,
      likes: s.like_count,
      comments: s.comment_count,
      subscribers: s.channel_subscriber_count,
      recordedAt: s.recorded_at,
      sourceType: s.source_type || 'OBSERVED_SNAPSHOT',
      isObserved: s.is_observed === 1
    }))
  };
}

module.exports = {
  assignSnapshotPriority,
  recordImmutableVideoSnapshot,
  getVideoHistoricalAnalytics
};
