import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiX, FiZoomIn, FiDownload } from 'react-icons/fi';

const ImageModal = ({ imageUrl, alt, onClose }) => {
  const { t } = useTranslation();

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

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = alt || 'image';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
      onClick={onClose}
    >
      <div className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white transition-all backdrop-blur-sm"
          title={t('common.close')}
        >
          <FiX className="text-2xl" />
        </button>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          className="absolute top-4 right-20 z-10 p-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white transition-all backdrop-blur-sm"
          title={t('imageModal.download')}
        >
          <FiDownload className="text-2xl" />
        </button>

        {/* Image */}
        <img
          src={imageUrl}
          alt={alt || 'Image'}
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />

        {/* Image Info */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
          <p className="text-sm">{alt || t('imageModal.image')}</p>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
