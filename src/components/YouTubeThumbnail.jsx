import { useState } from 'react';
import { FiVideo } from 'react-icons/fi';
import { getYouTubeThumbnailFallbacks, isYouTubeUrl } from '../utils/youtubeUtils';

/**
 * YouTube thumbnail component with fallback handling
 */
const YouTubeThumbnail = ({ 
  videoUrl, 
  alt = '', 
  className = '',
  fallbackClassName = '',
  showPlayIcon = true 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  
  if (!videoUrl || !isYouTubeUrl(videoUrl)) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 ${fallbackClassName || className}`}>
        <FiVideo className="text-gray-400 text-2xl" />
      </div>
    );
  }

  const thumbnailUrls = getYouTubeThumbnailFallbacks(videoUrl);
  
  if (hasError || currentIndex >= thumbnailUrls.length) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 relative ${fallbackClassName || className}`}>
        <FiVideo className="text-gray-400 text-2xl" />
        {showPlayIcon && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black/60 rounded-full p-3">
              <div className="w-0 h-0 border-l-[12px] border-l-white border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ml-1"></div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const handleImageError = () => {
    if (currentIndex < thumbnailUrls.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setHasError(true);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <img
        src={thumbnailUrls[currentIndex]}
        alt={alt}
        className="w-full h-full object-cover"
        onError={handleImageError}
        loading="lazy"
      />
      {showPlayIcon && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black/60 rounded-full p-3 hover:bg-black/80 transition-colors">
            <div className="w-0 h-0 border-l-[12px] border-l-white border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ml-1"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default YouTubeThumbnail;