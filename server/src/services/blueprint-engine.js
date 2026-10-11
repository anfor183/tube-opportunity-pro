// AI / Heuristic Video Blueprint Generator (Section 21)

/**
 * Generate a complete, ready-to-produce production blueprint for a keyword opportunity
 */
function generateVideoBlueprint(keyword, gaps = [], competitors = []) {
  const term = keyword.term;
  const currentYear = new Date().getFullYear();
  const intent = keyword.search_intent || 'Tutorial';

  // 1. Generate 5-10 highly clickable, search-optimized titles
  const titles = [
    `${term} (The Complete ${currentYear} Step-by-Step Guide)`,
    `How to Master ${term} in 10 Minutes (Beginner to Pro)`,
    `The Only ${term} Tutorial You’ll Ever Need in ${currentYear}`,
    `Stop Doing ${term} Wrong! (Fix This One Mistake)`,
    `${term} Explained Simply: What YouTube Won't Tell You`,
    `How I Use ${term} to Get Massive Results (Full Walkthrough)`,
    `${term} for Beginners: Everything You Need to Know`,
    `5 Secrets for ${term} Most People Miss`
  ];

  // 2. Secondary Keywords
  const secondaryKeywords = [
    `${term} tutorial`,
    `${term} for beginners`,
    `best ${term} tips`,
    `${term} ${currentYear}`,
    `how to setup ${term}`,
    `${term} step by step`,
    `${term} common mistakes`
  ];

  // 3. Hook Script
  const hookScript = `“If you're trying to figure out ${term}, almost every tutorial out there makes it 10 times more complicated than it needs to be—or shows outdated settings from three years ago. In this video, I'm going to show you the exact, modern step-by-step workflow that works right now, plus the one fatal mistake that ruins 90% of setups.”`;

  // 4. Thumbnail Concept
  const thumbnailConcepts = [
    {
      concept: 'Split Screen Contrast',
      leftSide: 'Red "X" on messy/outdated screen',
      rightSide: 'Green checkmark on clean finished result',
      textOverlay: 'DON’T DO THIS!',
      colorScheme: 'High-contrast Yellow & White on Dark background'
    },
    {
      concept: 'Curiosity Shock',
      graphic: 'Large arrow pointing to a critical hidden toggle or result',
      textOverlay: 'FIX THIS FIRST',
      colorScheme: 'Vibrant Red & Neon Blue'
    }
  ];

  // 5. Structure & Chapters
  const chapters = [
    { time: '0:00', title: 'The Fast Fix: What Most Tutorials Miss' },
    { time: '1:15', title: 'Prerequisites & Setup (Under 2 Mins)' },
    { time: '3:45', title: 'Core Step-by-Step Execution' },
    { time: '7:20', title: 'Pro Settings to Enable Immediately' },
    { time: '9:50', title: 'Troubleshooting: What to Do When It Fails' },
    { time: '12:15', title: 'Final Checklist & Next Steps' }
  ];

  // 6. Talking Points & Questions to Answer
  const talkingPoints = [
    `Clarify what ${term} actually does without academic fluff.`,
    `Highlight why older tutorials (${currentYear - 2} or earlier) no longer work due to platform updates.`,
    `Show the mobile/cross-device application if applicable.`,
    `Address the #1 friction point where beginners usually give up.`,
    `Provide a clean reference or template for viewers to save.`
  ];

  const questionsToAnswer = [
    `How long does it take to set up?`,
    `Is this completely free or does it require paid software?`,
    `Can I do this on my phone as well as desktop?`,
    `What if the interface doesn't match what is on screen?`,
    `How do I troubleshoot connection or error codes?`
  ];

  // 7. Video Strategy & Cluster
  const supportingVideos = [
    `${term} on Mobile: Complete Walkthrough`,
    `Top 5 Biggest Mistakes When Doing ${term}`,
    `${term} vs The Alternative: Which is Actually Better?`,
    `Advanced ${term} Workflows for Fast Results`,
    `How to Fix ${term} Not Working (Troubleshooting Guide)`
  ];

  // 8. Description & Tags
  const description = `Learn how to get started with ${term} in ${currentYear} with this updated step-by-step walkthrough. We break down the exact settings you need, common beginner mistakes to avoid, and the fastest workflow to get up and running.

⏰ CHAPTERS:
0:00 - Intro & The Big Mistake
1:15 - Fast Setup
3:45 - Step-by-Step Walkthrough
7:20 - Pro Settings
9:50 - Troubleshooting
12:15 - Summary

📌 RESOURCES & LINKS:
All mentioned resources and templates are linked below.

#${term.replace(/\s+/g, '')} #Tutorial #YouTubeGrowth`;

  const tags = [
    term,
    `${term} tutorial`,
    `${term} ${currentYear}`,
    `${term} guide`,
    `how to ${term}`,
    `${term} for beginners`,
    `${term} walkthrough`
  ];

  return {
    primaryKeyword: term,
    searchIntent: intent,
    recommendedTitles: titles,
    secondaryKeywords,
    recommendedHook: hookScript,
    thumbnailConcepts,
    recommendedDuration: '10–14 minutes',
    structureOverview: 'Hook (0-15s) → Problem Statement → Step-by-Step Walkthrough → Crucial Pro Settings → Troubleshooting Section → Clear Call to Action',
    chapters,
    importantTalkingPoints: talkingPoints,
    questionsToAnswer,
    competitorGapsTargeted: gaps.map(g => g.gap_title),
    uniqueAngle: keyword.recommended_angle || `Focus on speed, zero-fluff modern UI walkthrough, and solving the specific error cases where competitors leave viewers stranded.`,
    callToAction: 'Ask viewers to comment which step gave them the biggest breakthrough and tease the next video in your supporting cluster.',
    description,
    tags,
    supportingClusterVideos: supportingVideos
  };
}

module.exports = {
  generateVideoBlueprint
};
