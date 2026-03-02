import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../ui/button';
import { FiEdit2, FiTrash2, FiEye, FiEyeOff, FiArrowUp, FiArrowDown, FiImage } from 'react-icons/fi';

const HeroSlidesList = ({ 
  slides, 
  onEdit, 
  onDelete, 
  onToggleActive, 
  onMoveUp, 
  onMoveDown 
}) => {
  const { language, isRTL } = useLanguage();

  if (slides.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="h-14 w-14 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-4">
          <FiImage className="text-primary-600 text-2xl" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {isRTL ? 'لا توجد شرائح بعد' : 'No hero slides yet'}
        </h3>
        <p className="text-sm text-gray-500">
          {isRTL ? 'أضف أول شريحة للبدء' : 'Create your first hero slide to get started'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-sm transition-shadow"
        >
          {/* Image Preview */}
          <div className="w-full sm:w-24 h-32 sm:h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
            {slide.image ? (
              <img 
                src={slide.image} 
                alt={slide.title} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FiImage className="text-gray-400 text-2xl" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
              <h4 className="font-medium text-gray-900 dark:text-white truncate">
                {language === 'ar' ? slide.titleAr || slide.title : slide.title}
              </h4>
              {!slide.isActive && (
                <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded-full w-fit">
                  {isRTL ? 'غير نشط' : 'Inactive'}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
              {language === 'ar' ? slide.descriptionAr || slide.description : slide.description}
            </p>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span>{isRTL ? 'الترتيب:' : 'Order:'} {slide.order}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0 w-full sm:w-auto justify-end">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onMoveUp(index)}
              disabled={index === 0}
              title={isRTL ? 'تحريك لأعلى' : 'Move up'}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <FiArrowUp className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onMoveDown(index)}
              disabled={index === slides.length - 1}
              title={isRTL ? 'تحريك لأسفل' : 'Move down'}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <FiArrowDown className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggleActive(slide.id, slide.isActive)}
              title={slide.isActive 
                ? (isRTL ? 'إلغاء التنشيط' : 'Deactivate') 
                : (isRTL ? 'تنشيط' : 'Activate')}
              className={slide.isActive 
                ? 'text-emerald-600 hover:bg-emerald-50' 
                : 'text-gray-500 hover:bg-gray-50'}
            >
              {slide.isActive ? <FiEye className="size-4" /> : <FiEyeOff className="size-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(slide)}
              title={isRTL ? 'تعديل' : 'Edit'}
              className="text-blue-600 hover:bg-blue-50"
            >
              <FiEdit2 className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(slide.id)}
              title={isRTL ? 'حذف' : 'Delete'}
              className="text-red-600 hover:bg-red-50"
            >
              <FiTrash2 className="size-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HeroSlidesList;