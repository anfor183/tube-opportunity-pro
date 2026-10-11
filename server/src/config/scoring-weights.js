// Scoring Weights Configuration and Modes

const DEFAULT_WEIGHTS = {
  demand: 0.20,
  competition: 0.15,
  supplyGap: 0.15,
  contentQualityGap: 0.15,
  evergreenPotential: 0.10,
  smallChannelProof: 0.08,
  outlierEvidence: 0.07,
  trendStability: 0.05,
  freshnessOpportunity: 0.03,
  searchIntent: 0.02
};

const SCORING_MODES = {
  default: {
    name: 'Balanced Opportunity Mode',
    description: 'Multi-factor balanced weighting across demand, supply, competition, and content quality.',
    weights: { ...DEFAULT_WEIGHTS }
  },
  evergreen: {
    name: 'Evergreen Mode',
    description: 'Prioritizes long-term demand stability, search intent, low decay, and older videos still generating traffic.',
    weights: {
      demand: 0.15,
      competition: 0.10,
      supplyGap: 0.15,
      contentQualityGap: 0.15,
      evergreenPotential: 0.25,
      smallChannelProof: 0.05,
      outlierEvidence: 0.03,
      trendStability: 0.10,
      freshnessOpportunity: 0.05,
      searchIntent: 0.02
    }
  },
  viral: {
    name: 'Viral & Outlier Mode',
    description: 'Prioritizes high recent velocity, massive outlier multiples, trend acceleration, and rapid viewer growth.',
    weights: {
      demand: 0.20,
      competition: 0.10,
      supplyGap: 0.10,
      contentQualityGap: 0.10,
      evergreenPotential: 0.03,
      smallChannelProof: 0.12,
      outlierEvidence: 0.25,
      trendStability: 0.05,
      freshnessOpportunity: 0.03,
      searchIntent: 0.02
    }
  },
  low_competition: {
    name: 'Low Competition Mode',
    description: 'Prioritizes weak existing SERPs, low content quality, low authority barriers, and high beatability.',
    weights: {
      demand: 0.12,
      competition: 0.25,
      supplyGap: 0.20,
      contentQualityGap: 0.20,
      evergreenPotential: 0.08,
      smallChannelProof: 0.06,
      outlierEvidence: 0.04,
      trendStability: 0.03,
      freshnessOpportunity: 0.01,
      searchIntent: 0.01
    }
  },
  new_channel: {
    name: 'New / Small Channel Mode',
    description: 'Prioritizes small creator success proof, low subscriber barrier, high outlier ratios, and long-tail topics.',
    weights: {
      demand: 0.12,
      competition: 0.15,
      supplyGap: 0.15,
      contentQualityGap: 0.15,
      evergreenPotential: 0.08,
      smallChannelProof: 0.20,
      outlierEvidence: 0.10,
      trendStability: 0.03,
      freshnessOpportunity: 0.01,
      searchIntent: 0.01
    }
  },
  monetization: {
    name: 'High Monetization Mode',
    description: 'Prioritizes commercial intent, buyer urgency, comparison queries, and high advertiser value.',
    weights: {
      demand: 0.18,
      competition: 0.12,
      supplyGap: 0.15,
      contentQualityGap: 0.15,
      evergreenPotential: 0.15,
      smallChannelProof: 0.05,
      outlierEvidence: 0.05,
      trendStability: 0.05,
      freshnessOpportunity: 0.03,
      searchIntent: 0.07
    }
  }
};

module.exports = {
  DEFAULT_WEIGHTS,
  SCORING_MODES
};
