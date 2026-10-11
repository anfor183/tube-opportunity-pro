// Official YouTube Data API v3 Client with Quota Tracking & Caching (Sections 40 & 41)

const axios = require('axios');
const { quotaManager } = require('./quota-manager');
const { getDb } = require('../db');

class YouTubeApiService {
  constructor() {
    let key = process.env.YOUTUBE_API_KEY || '';
    if (!key) {
      try {
        const fs = require('fs');
        const path = require('path');
        const envPath = path.join(__dirname, '../../../.env');
        if (fs.existsSync(envPath)) {
          const content = fs.readFileSync(envPath, 'utf8');
          const match = content.match(/YOUTUBE_API_KEY=([^\r\n]+)/);
          if (match && match[1]) {
            key = match[1].trim();
            process.env.YOUTUBE_API_KEY = key;
          }
        }
      } catch (e) {}
    }
    this.apiKey = key;
  }

  setApiKey(key) {
    this.apiKey = (key || '').trim();
    process.env.YOUTUBE_API_KEY = this.apiKey;
    try {
      const fs = require('fs');
      const path = require('path');
      const envPath = path.join(__dirname, '../../../.env');
      let envContent = '';
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
      }
      if (envContent.includes('YOUTUBE_API_KEY=')) {
        envContent = envContent.replace(/YOUTUBE_API_KEY=.*/g, `YOUTUBE_API_KEY=${this.apiKey}`);
      } else {
        envContent += `\nYOUTUBE_API_KEY=${this.apiKey}\n`;
      }
      fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf8');
      console.log('YouTube API key successfully persisted to .env file.');
    } catch (e) {
      console.error('Failed to write .env file:', e.message);
    }
  }

  isKeyConfigured() {
    return !!(this.apiKey && this.apiKey.trim().length > 10);
  }

  /**
   * Search YouTube for videos matching a query
   * Quota cost: 100 units
   */
  async searchVideos(query, maxResults = 15) {
    // Check if API key exists and quota is available
    if (!this.isKeyConfigured()) {
      return {
        success: false,
        source: 'DEVELOPMENT_FALLBACK',
        reason: 'YouTube API Key not configured. Using database & model fallback.',
        items: []
      };
    }

    if (!quotaManager.canConsume(100)) {
      return {
        success: false,
        source: 'DEVELOPMENT_FALLBACK',
        reason: 'Daily YouTube API quota limit reached. Using database & model fallback.',
        items: []
      };
    }

    try {
      const url = 'https://www.googleapis.com/youtube/v3/search';
      const response = await axios.get(url, {
        params: {
          key: this.apiKey,
          part: 'snippet',
          q: query,
          type: 'video',
          maxResults: maxResults,
          order: 'relevance'
        },
        timeout: 8000
      });

      // Record quota usage
      quotaManager.recordConsumption('search.list', 100, 'OK');

      const videoIds = response.data.items.map(item => item.id.videoId).join(',');
      
      // Fetch detailed stats for these videos (1 unit)
      const details = await this.getVideoDetails(videoIds);

      return {
        success: true,
        source: 'OFFICIAL_API',
        items: details
      };
    } catch (err) {
      quotaManager.recordConsumption('search.list', 100, `ERROR: ${err.message}`);
      return {
        success: false,
        source: 'DEVELOPMENT_FALLBACK',
        error: err.response?.data?.error?.message || err.message,
        items: []
      };
    }
  }

  /**
   * Fetch video details (views, likes, comments, duration)
   * Quota cost: 1 unit
   */
  async getVideoDetails(videoIdsString) {
    if (!this.isKeyConfigured() || !videoIdsString) return [];

    try {
      const url = 'https://www.googleapis.com/youtube/v3/videos';
      const response = await axios.get(url, {
        params: {
          key: this.apiKey,
          part: 'snippet,contentDetails,statistics',
          id: videoIdsString
        },
        timeout: 6000
      });

      quotaManager.recordConsumption('videos.list', 1, 'OK');

      return response.data.items.map(item => {
        const stats = item.statistics || {};
        const snippet = item.snippet || {};
        const contentDetails = item.contentDetails || {};

        // Parse ISO 8601 duration (PT1H2M30S) to seconds
        let durationSeconds = 0;
        const durationStr = contentDetails.duration || '';
        const dMatch = durationStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        if (dMatch) {
          durationSeconds = (parseInt(dMatch[1] || '0', 10) * 3600)
            + (parseInt(dMatch[2] || '0', 10) * 60)
            + parseInt(dMatch[3] || '0', 10);
        }

        return {
          videoId: item.id,
          title: snippet.title,
          description: snippet.description,
          publishedAt: snippet.publishedAt,
          channelId: snippet.channelId,
          channelTitle: snippet.channelTitle,
          thumbnailUrl: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url,
          viewCount: parseInt(stats.viewCount || '0', 10),
          likeCount: parseInt(stats.likeCount || '0', 10),
          commentCount: parseInt(stats.commentCount || '0', 10),
          durationSeconds,
          source: 'OFFICIAL_API'
        };
      });
    } catch (err) {
      quotaManager.recordConsumption('videos.list', 1, `ERROR: ${err.message}`);
      return [];
    }
  }

  /**
   * Fetch Channel details (subscribers, video count)
   * Quota cost: 1 unit
   */
  async getChannelDetails(channelId) {
    if (!this.isKeyConfigured() || !channelId) return null;

    try {
      const url = 'https://www.googleapis.com/youtube/v3/channels';
      const response = await axios.get(url, {
        params: {
          key: this.apiKey,
          part: 'snippet,statistics',
          id: channelId
        },
        timeout: 6000
      });

      quotaManager.recordConsumption('channels.list', 1, 'OK');

      const item = response.data.items?.[0];
      if (!item) return null;

      const stats = item.statistics || {};
      const snippet = item.snippet || {};

      return {
        channelId: item.id,
        title: snippet.title,
        description: snippet.description,
        avatarUrl: snippet.thumbnails?.default?.url,
        subscriberCount: parseInt(stats.subscriberCount || '0', 10),
        videoCount: parseInt(stats.videoCount || '0', 10),
        viewCount: parseInt(stats.viewCount || '0', 10),
        source: 'OFFICIAL_API'
      };
    } catch (err) {
      quotaManager.recordConsumption('channels.list', 1, `ERROR: ${err.message}`);
      return null;
    }
  }

  /**
   * Fetch Multiple Channels in a single API call (up to 50 channels)
   * Quota cost: 1 unit total
   */
  async getChannelsBatch(channelIds = []) {
    if (!this.isKeyConfigured() || !channelIds || channelIds.length === 0) return {};

    const uniqueIds = [...new Set(channelIds.filter(Boolean))].slice(0, 50);
    if (uniqueIds.length === 0) return {};

    try {
      const url = 'https://www.googleapis.com/youtube/v3/channels';
      const response = await axios.get(url, {
        params: {
          key: this.apiKey,
          part: 'snippet,statistics',
          id: uniqueIds.join(',')
        },
        timeout: 8000
      });

      quotaManager.recordConsumption('channels.list', 1, 'OK');

      const map = {};
      (response.data.items || []).forEach(item => {
        const stats = item.statistics || {};
        const snippet = item.snippet || {};
        map[item.id] = {
          channelId: item.id,
          title: snippet.title,
          description: snippet.description,
          avatarUrl: snippet.thumbnails?.default?.url,
          subscriberCount: parseInt(stats.subscriberCount || '0', 10),
          videoCount: parseInt(stats.videoCount || '0', 10),
          viewCount: parseInt(stats.viewCount || '0', 10),
          source: 'OFFICIAL_API'
        };
      });
      return map;
    } catch (err) {
      quotaManager.recordConsumption('channels.list', 1, `ERROR: ${err.message}`);
      return {};
    }
  }

  /**
   * Test API key connection with a minimal request (videos.list for a known video)
   * Quota cost: 1 unit
   */
  async testConnection() {
    if (!this.isKeyConfigured()) {
      return {
        success: false,
        error: 'API Key is not configured. Please enter your YouTube API key first.'
      };
    }

    try {
      const url = 'https://www.googleapis.com/youtube/v3/videos';
      const response = await axios.get(url, {
        params: {
          key: this.apiKey,
          part: 'snippet',
          id: 'Ks-_Mh1QhMc'
        },
        timeout: 6000
      });

      quotaManager.recordConsumption('videos.list (connection test)', 1, 'OK');

      return {
        success: true,
        message: 'YouTube API Key is valid and active!',
        itemsFound: response.data.items?.length || 0,
        quotaUsed: 1,
        quotaRemaining: quotaManager.getStatus().unitsRemaining
      };
    } catch (err) {
      const errMsg = err.response?.data?.error?.message || err.message;
      quotaManager.recordConsumption('videos.list (test failed)', 1, `ERROR: ${errMsg}`);
      return {
        success: false,
        error: `Verification failed: ${errMsg}`
      };
    }
  }
}

const youtubeApi = new YouTubeApiService();

module.exports = {
  youtubeApi,
  YouTubeApiService
};
