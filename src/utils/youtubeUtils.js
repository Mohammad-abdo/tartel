/**
 * YouTube utilities for handling video URLs and thumbnails
 */

/**
 * Extract YouTube video ID from various YouTube URL formats
 * @param {string} url - YouTube video URL
 * @returns {string|null} - Video ID or null if not found
 */
export const extractYouTubeVideoId = (url) => {
  if (!url || typeof url !== 'string') {
    return null;
  }

  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
};

/**
 * Get YouTube thumbnail URL with fallback options
 * @param {string} videoUrl - YouTube video URL
 * @param {string} quality - Thumbnail quality ('maxresdefault', 'hqdefault', 'mqdefault', 'sddefault', 'default')
 * @returns {string|null} - Thumbnail URL or null
 */
export const getYouTubeThumbnail = (videoUrl, quality = 'mqdefault') => {
  const videoId = extractYouTubeVideoId(videoUrl);
  
  if (!videoId) {
    return null;
  }

  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
};

/**
 * Get multiple YouTube thumbnail URLs with different qualities for fallback
 * @param {string} videoUrl - YouTube video URL
 * @returns {string[]} - Array of thumbnail URLs ordered by quality (high to low)
 */
export const getYouTubeThumbnailFallbacks = (videoUrl) => {
  const videoId = extractYouTubeVideoId(videoUrl);
  
  if (!videoId) {
    return [];
  }

  const qualities = ['maxresdefault', 'hqdefault', 'mqdefault', 'sddefault', 'default'];
  return qualities.map(quality => `https://img.youtube.com/vi/${videoId}/${quality}.jpg`);
};

/**
 * Convert YouTube watch URL to embed URL
 * @param {string} url - YouTube watch URL
 * @returns {string} - YouTube embed URL
 */
export const convertToEmbedUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return url;
  }

  const videoId = extractYouTubeVideoId(url);
  
  if (!videoId) {
    return url;
  }

  return `https://www.youtube.com/embed/${videoId}`;
};

/**
 * Check if a URL is a YouTube video URL
 * @param {string} url - URL to check
 * @returns {boolean} - True if YouTube URL
 */
export const isYouTubeUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return false;
  }

  return /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)/.test(url);
};