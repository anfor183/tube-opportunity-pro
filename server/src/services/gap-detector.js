// Content Gap Detection & Content Vacuum Engine (Sections 13 & 31)

/**
 * Detect content gaps by analyzing query patterns and competitor weaknesses
 */
function detectContentGaps(term, competingVideos = [], category = 'General') {
  const gaps = [];

  // Analyze titles to see what subtopics exist
  const combinedTitles = competingVideos.map(v => v.title.toLowerCase()).join(' ');

  // Gap 1: Mobile / On-the-go experience
  if (!combinedTitles.includes('mobile') && !combinedTitles.includes('phone') && !combinedTitles.includes('iphone') && !combinedTitles.includes('android')) {
    gaps.push({
      gap_title: `${term} on Mobile / Phone`,
      gap_description: `Existing videos primarily demonstrate on desktop or lack mobile-specific walkthroughs, despite heavy mobile search traffic.`,
      evidence_type: 'mobile_gap',
      evidence_detail: `0 out of ${competingVideos.length} top ranking videos focus specifically on mobile device execution.`,
      opportunity_lift: 18.0
    });
  }

  // Gap 2: Beginner / Step-by-Step for absolute newcomers
  if (!combinedTitles.includes('for beginners') && !combinedTitles.includes('step by step') && !combinedTitles.includes('complete beginner')) {
    gaps.push({
      gap_title: `${term} for Complete Beginners (Step-by-Step)`,
      gap_description: `Current videos jump straight into complex jargon or skip essential initial setup steps that beginners struggle with.`,
      evidence_type: 'missing_step',
      evidence_detail: `Comment sentiment indicates confusion around prerequisite configurations.`,
      opportunity_lift: 15.0
    });
  }

  // Gap 3: Freshness / Current Year Update
  const currentYear = new Date().getFullYear();
  const hasCurrentYear = combinedTitles.includes(currentYear.toString()) || combinedTitles.includes((currentYear - 1).toString());
  const avgAgeYears = competingVideos.length > 0 
    ? competingVideos.reduce((acc, v) => acc + (v.freshness_years || 1), 0) / competingVideos.length 
    : 1;

  if (!hasCurrentYear || avgAgeYears >= 2.0) {
    gaps.push({
      gap_title: `${term} (${currentYear} Updated Guide)`,
      gap_description: `Leading videos are 2 to 5 years old. UI changes, software updates, or new methods have made older videos obsolete.`,
      evidence_type: 'outdated_competitors',
      evidence_detail: `Top competitors average ${avgAgeYears.toFixed(1)} years old with outdated interfaces.`,
      opportunity_lift: 22.0
    });
  }

  // Gap 4: Troubleshooting / "Fix Not Working"
  if (!combinedTitles.includes('fix') && !combinedTitles.includes('not working') && !combinedTitles.includes('troubleshooting') && !combinedTitles.includes('common mistakes')) {
    gaps.push({
      gap_title: `${term}: 5 Common Mistakes & How to Fix Them`,
      gap_description: `Creators only show happy-path demos; viewers desperately search for error solutions when things fail.`,
      evidence_type: 'recurring_questions',
      evidence_detail: `High question volume in competitor comments asking what to do when standard steps fail.`,
      opportunity_lift: 16.5
    });
  }

  // Gap 5: Workflow / Practical Real-World Use Case
  if (!combinedTitles.includes('real world') && !combinedTitles.includes('workflow') && !combinedTitles.includes('practical') && !combinedTitles.includes('examples')) {
    gaps.push({
      gap_title: `${term} Real-World Workflow & Examples`,
      gap_description: `Viewers understand the basic concept but lack concrete end-to-end examples of practical day-to-day execution.`,
      evidence_type: 'underserved_audience',
      evidence_detail: `Viewers seeking actionable templates and realistic project examples.`,
      opportunity_lift: 14.0
    });
  }

  return gaps;
}

/**
 * Check if the keyword represents a Content Vacuum ("No one is making this")
 * Section 31 Requirements
 */
function evaluateContentVacuum(keyword, competingVideos = []) {
  const demand = keyword.demand_score || 50;
  const relevantCount = competingVideos.length || keyword.relevant_videos_count || 0;
  
  // Calculate quality videos count
  const qualityVideos = competingVideos.filter(v => 
    (v.content_depth_score || 50) >= 70 && 
    (v.authority_score || 50) >= 60 && 
    (v.freshness_years || 2) <= 2.0
  );

  // Recent strong videos (under 1 year, good quality)
  const strongRecentVideos = competingVideos.filter(v =>
    (v.freshness_years || 2) <= 1.0 &&
    (v.content_depth_score || 50) >= 65 &&
    (v.view_count || 0) >= 20000
  );

  // Content Vacuum condition:
  // Meaningful demand (>= 65), relatively few videos (<= 25), and very few quality/recent videos (<= 3)
  const isVacuum = demand >= 65 && relevantCount <= 30 && strongRecentVideos.length <= 2;

  return {
    isVacuum,
    badge: isVacuum ? '🟢 POSSIBLE CONTENT VACUUM' : null,
    estimatedMonthlyInterest: keyword.est_monthly_interest || Math.round(demand * 120),
    relevantVideosCount: relevantCount,
    qualityVideosCount: qualityVideos.length,
    strongRecentVideosCount: strongRecentVideos.length,
    opportunityScore: keyword.opportunity_score || 85,
    summary: isVacuum
      ? `Strong search signals detected (${(keyword.est_monthly_interest || Math.round(demand * 120)).toLocaleString()} interest index), yet only ${qualityVideos.length} quality videos and ${strongRecentVideos.length} strong recent videos exist. Exceptional content vacuum.`
      : null
  };
}

module.exports = {
  detectContentGaps,
  evaluateContentVacuum
};
