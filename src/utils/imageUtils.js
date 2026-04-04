/**
 * Utility functions for handling image and video URLs.
 * Ensures all media URLs use HTTPS and point to the correct API host.
 */

const URL_FIELDS = [
  'image', 'avatar', 'photo', 'thumbnail',
  'introVideoThumbnail', 'introVideoUrl',
  'videoUrl', 'thumbnailUrl', 'logoUrl', 'url',
  'video_url', 'thumbnail_url', 'intro_video_url', 'intro_video_thumbnail',
];

const NESTED_ARRAY_FIELDS = ['videos', 'lessons', 'sheikhs', 'courses', 'data'];

const getApiBaseUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8002/api';
  let base = apiUrl.replace(/\/api\/?$/, '');
  if (base.startsWith('http://')) {
    base = base.replace('http://', 'https://');
  }
  return base;
};

/**
 * Fix a single URL: ensure HTTPS, replace localhost, prepend base for relative paths.
 */
export const fixImageUrl = (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== 'string') {
    return imageUrl;
  }

  const apiBaseUrl = getApiBaseUrl();

  if (imageUrl.startsWith(apiBaseUrl)) {
    return imageUrl;
  }

  if (imageUrl.includes('localhost:8002') || imageUrl.includes('localhost:8000') || imageUrl.includes('localhost:5000')) {
    const fixed = imageUrl.replace(/https?:\/\/localhost:\d+/, apiBaseUrl);
    return fixed;
  }

  if (imageUrl.startsWith('/uploads')) {
    return `${apiBaseUrl}${imageUrl}`;
  }

  if (imageUrl.startsWith('http://') && !imageUrl.includes('youtube') && !imageUrl.includes('youtu.be')) {
    return imageUrl.replace('http://', 'https://');
  }

  return imageUrl;
};

/**
 * Fix media URLs in an object, including nested arrays.
 */
export const fixImageUrls = (obj, imageFields = URL_FIELDS) => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const fixed = { ...obj };

  imageFields.forEach(field => {
    if (fixed[field] && typeof fixed[field] === 'string') {
      fixed[field] = fixImageUrl(fixed[field]);
    }
  });

  NESTED_ARRAY_FIELDS.forEach(field => {
    if (fixed[field] && Array.isArray(fixed[field])) {
      fixed[field] = fixImageUrlsInArray(fixed[field], imageFields);
    }
  });

  return fixed;
};

/**
 * Fix media URLs in an array of objects.
 */
export const fixImageUrlsInArray = (array, imageFields = URL_FIELDS) => {
  if (!Array.isArray(array)) {
    return array;
  }

  return array.map(item => fixImageUrls(item, imageFields));
};
};
