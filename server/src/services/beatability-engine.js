// "Can I Beat This Video?" Engine & Competitor Beatability Analyzer (Sections 19 & 20)

/**
 * Calculate Beatability Score (0-100) for a competitor video
 */
function evaluateVideoBeatability(video) {
  const ageYears = video.freshness_years || 2.0;
  const authority = video.authority_score || 50;
  const titleQuality = video.title_quality_score || 60;
  const thumbQuality = video.thumbnail_quality_score || 60;
  const contentDepth = video.content_depth_score || 60;
  const engagementRate = video.viewer_engagement_rate || 0.03; // likes+comments / views

  // Strengths
  const strengths = [];
  if (authority >= 75) strengths.push('High channel authority & established audience trust');
  if (video.view_count > 500000) strengths.push(`Accumulated ${Math.round(video.view_count / 1000)}K lifetime views giving algorithm inertia`);
  if (contentDepth >= 80) strengths.push('Extensive walkthrough with good technical coverage');
  if (thumbQuality >= 75) strengths.push('High-contrast eye-catching thumbnail');
  if (strengths.length === 0) strengths.push('Early mover advantage in the search rankings');

  // Weaknesses
  const weaknesses = [];
  if (ageYears >= 2.0) weaknesses.push(`Video is ${ageYears.toFixed(1)} years old; interface & methods are noticeably outdated`);
  if (thumbQuality < 65) weaknesses.push('Dated thumbnail design with cluttered low-contrast typography');
  if (titleQuality < 65) weaknesses.push('Generic title that fails to target specific problem-solving long-tail queries');
  if (contentDepth < 65) weaknesses.push('Superficial coverage that skips crucial nuances and troubleshooting steps');
  if (engagementRate < 0.03) weaknesses.push('Low viewer engagement ratio indicating viewer drop-off or dissatisfaction');
  if (weaknesses.length === 0) weaknesses.push('Pacing is slow in the first 60 seconds with delayed value delivery');

  // Beatability Score Calculation
  // Higher score = EASIER to beat
  let beatScore = 50;
  
  // Age bonus: Older videos are much easier to beat with fresh content
  if (ageYears >= 3.0) beatScore += 25;
  else if (ageYears >= 1.8) beatScore += 15;
  else if (ageYears <= 0.5) beatScore -= 10;

  // Weak thumbnail bonus
  if (thumbQuality <= 50) beatScore += 12;
  else if (thumbQuality >= 80) beatScore -= 10;

  // Weak depth bonus
  if (contentDepth <= 50) beatScore += 12;
  else if (contentDepth >= 80) beatScore -= 12;

  // Low authority bonus: If small channel ranked, you can beat them easily!
  if (authority <= 35) beatScore += 15;
  else if (authority >= 85) beatScore -= 15;

  beatScore = Math.min(98, Math.max(15, Math.round(beatScore)));

  // Verdict
  let verdict = '';
  if (beatScore >= 80) {
    verdict = `Highly Beatable (${beatScore}/100) — Dominant video is aging and vulnerable to a modern, higher-quality alternative.`;
  } else if (beatScore >= 65) {
    verdict = `Beatable with Differentiation (${beatScore}/100) — Strong opportunity by addressing missing details and using a sharper hook.`;
  } else if (beatScore >= 50) {
    verdict = `Competitive (${beatScore}/100) — Competitor has solid fundamentals; requires a superior unique angle.`;
  } else {
    verdict = `Tough Competitor (${beatScore}/100) — High channel authority and recent strong production; recommend targeting a narrower long-tail sub-topic.`;
  }

  return {
    score: beatScore,
    beatabilityScore: beatScore,
    verdict,
    strengths,
    weaknesses,
    ageYears: Math.round(ageYears * 10) / 10
  };
}

/**
 * Generate Requirements to Beat the Competition (Section 20)
 */
function generateRequirementsToBeat(video, keywordTerm) {
  const currentYear = new Date().getFullYear();
  const durationMinutes = Math.round((video.duration_seconds || 600) / 60);
  const idealMinDuration = Math.max(7, durationMinutes - 2);
  const idealMaxDuration = Math.max(idealMinDuration + 4, durationMinutes + 3);

  return {
    targetKeyword: keywordTerm,
    recommendedTitle: `${keywordTerm}: The Complete ${currentYear} Step-by-Step Guide (Avoid This Mistake)`,
    recommendedLength: `${idealMinDuration} – ${idealMaxDuration} minutes (competitor is ${durationMinutes} mins)`,
    thumbnailStrategy: {
      visualPromise: 'Bold 3-4 word high-contrast text overlay with clear Before/After or Result graphic',
      avoid: 'Avoid low-contrast screenshots or tiny fonts that become illegible on mobile feeds',
      recommendedText: 'DON’T DO THIS! (or) 10x EASIER'
    },
    hookStrategy: 'Address viewer problem in the first 8 seconds without long intros, theme songs, or sponsor plugs.',
    contentGapsToAddress: [
      `Updated UI & features for ${currentYear}`,
      'Mobile/cross-platform workflow demonstration',
      'Step-by-step troubleshooting when errors occur',
      'Clear downloadable checklist or template in description'
    ],
    recommendedChapters: [
      { timestamp: '0:00', title: 'Why Existing Tutorials Fail (Quick Demo)' },
      { timestamp: '0:45', title: 'The Core Setup in Under 2 Minutes' },
      { timestamp: '3:10', title: 'Step-by-Step Execution Walkthrough' },
      { timestamp: '6:30', title: 'Crucial Settings Everyone Misses' },
      { timestamp: '8:45', title: 'Troubleshooting Common Pitfalls' },
      { timestamp: '11:00', title: 'Next Level Workflow & Best Practices' }
    ]
  };
}

module.exports = {
  evaluateVideoBeatability,
  generateRequirementsToBeat
};
