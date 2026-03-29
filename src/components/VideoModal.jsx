import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FiX, FiPlay, FiPause, FiVolume2, FiVolumeX, FiMaximize, FiMinimize } from 'react-icons/fi';
import { fixImageUrl } from '../utils/imageUtils';

const VideoModal = ({ videoUrl: rawVideoUrl, title, onClose }) => {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);

  const videoUrl = fixImageUrl(rawVideoUrl);

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (video) {
      if (!document.fullscreenElement) {
        video.requestFullscreen().catch((err) => {
          console.error('Error attempting to enable fullscreen:', err);
        });
      } else {
        document.exitFullscreen();
      }
    }
  };

  if (!videoUrl) return null;

  // Check if it's a YouTube URL
  const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
  
  // Extract YouTube video ID
  const getYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  if (isYouTube) {
    const youtubeId = getYouTubeId(videoUrl);
    const embedUrl = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`;

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
        onClick={onClose}
      >
        <div className="relative max-w-7xl w-full h-full flex items-center justify-center">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white transition-all backdrop-blur-sm"
            title={t('common.close')}
          >
            <FiX className="text-2xl" />
          </button>

          {/* YouTube Embed */}
          <div className="w-full h-full max-w-6xl" onClick={(e) => e.stopPropagation()}>
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src={embedUrl}
                className="absolute top-0 left-0 w-full h-full rounded-lg"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={title || t('videoModal.video')}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Regular video player
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
      onClick={onClose}
    >
      <div className="relative max-w-7xl w-full h-full flex items-center justify-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white transition-all backdrop-blur-sm"
          title={t('common.close')}
        >
          <FiX className="text-2xl" />
        </button>

        {/* Video Container */}
        <div className="relative w-full max-w-6xl" onClick={(e) => e.stopPropagation()}>
          {videoError ? (
            <div className="flex flex-col items-center justify-center p-8 bg-gray-900 rounded-lg text-white min-h-[200px]">
              <p className="text-lg mb-2">{t('videoModal.error', 'حدث خطأ في تحميل الفيديو')}</p>
              <button
                onClick={() => {
                  setVideoError(false);
                  if (videoRef.current) {
                    videoRef.current.load();
                  }
                }}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                {t('videoModal.retry', 'إعادة المحاولة')}
              </button>
            </div>
          ) : (
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            playsInline
            webkit-playsinline="true"
            preload="metadata"
            className="w-full h-auto rounded-lg shadow-2xl"
            autoPlay
            onError={() => setVideoError(true)}
          >
            {t('videoModal.browserNotSupported')}
          </video>
          )}

          {/* Video Controls Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent p-4 rounded-b-lg">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-4">
                <button
                  onClick={togglePlay}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  title={isPlaying ? t('videoModal.pause') : t('videoModal.play')}
                >
                  {isPlaying ? <FiPause className="text-xl" /> : <FiPlay className="text-xl" />}
                </button>
                <button
                  onClick={toggleMute}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  title={isMuted ? t('videoModal.unmute') : t('videoModal.mute')}
                >
                  {isMuted ? <FiVolumeX className="text-xl" /> : <FiVolume2 className="text-xl" />}
                </button>
              </div>
              <div className="flex items-center gap-4">
                {title && <p className="text-sm font-medium">{title}</p>}
                <button
                  onClick={toggleFullscreen}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  title={isFullscreen ? t('videoModal.exitFullscreen') : t('videoModal.fullscreen')}
                >
                  {isFullscreen ? <FiMinimize className="text-xl" /> : <FiMaximize className="text-xl" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;
