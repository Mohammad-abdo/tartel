/**
 * Utility functions for handling image URLs
 */

// Get API base URL from environment
const getApiBaseUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  // Remove '/api' suffix to get base URL
  return apiUrl.replace('/api', '');
};

/**
 * Fix image URL by replacing localhost URLs with production URLs
 * @param {string} imageUrl - Original image URL from backend
 * @returns {string} - Fixed image URL
 */
export const fixImageUrl = (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== 'string') {
    return imageUrl;
  }

  const apiBaseUrl = getApiBaseUrl();
  
  // If URL already contains the correct API URL, return as is
  if (imageUrl.startsWith(apiBaseUrl)) {
    return imageUrl;
  }
  
  // If URL contains localhost:8002, replace with production URL
  if (imageUrl.includes('localhost:8002')) {
    return imageUrl.replace('http://localhost:8002', apiBaseUrl);
  }
  
  // If URL contains localhost:3001, replace with production URL  
  if (imageUrl.includes('localhost:3001')) {
    return imageUrl.replace('http://localhost:3001', apiBaseUrl);
  }
  
  // If URL starts with /uploads, prepend the API base URL
  if (imageUrl.startsWith('/uploads')) {
    return `${apiBaseUrl}${imageUrl}`;
  }
  
  // Return original URL if no modifications needed
  return imageUrl;
};

/**
 * Fix multiple image URLs in an object
 * @param {Object} obj - Object containing image URLs
 * @param {string[]} imageFields - Array of field names that contain image URLs
 * @returns {Object} - Object with fixed image URLs
 */
export const fixImageUrls = (obj, imageFields = ['image', 'avatar', 'photo', 'thumbnail', 'introVideoThumbnail', 'introVideoUrl', 'videoUrl', 'thumbnailUrl']) => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  
  const fixed = { ...obj };
  
  imageFields.forEach(field => {
    if (fixed[field]) {
      fixed[field] = fixImageUrl(fixed[field]);
    }
  });

  // Handle nested objects like videos array in lessons
  if (fixed.videos && Array.isArray(fixed.videos)) {
    fixed.videos = fixImageUrlsInArray(fixed.videos, imageFields);
  }

  // Handle nested lessons array
  if (fixed.lessons && Array.isArray(fixed.lessons)) {
    fixed.lessons = fixImageUrlsInArray(fixed.lessons, imageFields);
  }
  
  return fixed;
};

/**
 * Fix image URLs in an array of objects
 * @param {Array} array - Array of objects containing image URLs
 * @param {string[]} imageFields - Array of field names that contain image URLs
 * @returns {Array} - Array with fixed image URLs
 */
export const fixImageUrlsInArray = (array, imageFields = ['image', 'avatar', 'photo', 'thumbnail', 'introVideoThumbnail', 'introVideoUrl']) => {
  if (!Array.isArray(array)) {
    return array;
  }
  
  return array.map(item => fixImageUrls(item, imageFields));
};