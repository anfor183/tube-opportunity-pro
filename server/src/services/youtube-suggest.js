// Real-Time YouTube Suggest & Autocomplete Query Expansion (Section 30)
// Uses YouTube public autocomplete client (0 API Quota Cost)

const axios = require('axios');

/**
 * Fetch live YouTube search suggestions for a given query
 */
async function fetchYouTubeSuggestions(query) {
  if (!query || !query.trim()) return [];

  try {
    const url = `https://suggestqueries.google.com/complete/search?client=youtube&ds=yt&q=${encodeURIComponent(query)}`;
    const response = await axios.get(url, {
      timeout: 3500,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    // YouTube suggest returns JSONP formatted like: window.google.ac.h(["query", [["sugg1", 0], ["sugg2", 0]]])
    const rawData = response.data;
    if (typeof rawData === 'string') {
      const match = rawData.match(/window\.google\.ac\.h\((.*)\)/);
      if (match && match[1]) {
        const parsed = JSON.parse(match[1]);
        if (Array.isArray(parsed) && Array.isArray(parsed[1])) {
          return parsed[1].map(item => Array.isArray(item) ? item[0] : item).filter(Boolean);
        }
      }
    } else if (Array.isArray(rawData) && Array.isArray(rawData[1])) {
      return rawData[1].map(item => Array.isArray(item) ? item[0] : item).filter(Boolean);
    }
  } catch (err) {
    // Graceful silent fallback if offline
  }

  // Fallback programmatic query expansion if network is unavailable
  return [
    `${query} tutorial`,
    `how to use ${query}`,
    `best ${query} for beginners`,
    `${query} tips and tricks`,
    `${query} vs alternative`,
    `${query} step by step`
  ];
}

/**
 * Deep query expansion: queries questions, comparisons, and problems
 */
async function expandKeywordQuery(baseQuery) {
  const prefixes = [
    baseQuery,
    `how to ${baseQuery}`,
    `best ${baseQuery}`,
    `${baseQuery} for beginners`,
    `${baseQuery} fix`
  ];

  const results = new Set();
  for (const prefix of prefixes) {
    const items = await fetchYouTubeSuggestions(prefix);
    items.forEach(item => results.add(item));
  }

  return Array.from(results);
}

module.exports = {
  fetchYouTubeSuggestions,
  expandKeywordQuery
};
