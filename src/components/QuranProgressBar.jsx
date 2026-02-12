import React from 'react';
import { cn } from '../lib/utils';

const QuranProgressBar = ({ 
  memorizedParts = 0, 
  total = 30, 
  size = 'medium',
  showPercentage = true,
  showNumbers = true,
  className = '',
  isRTL = true 
}) => {
  const percentage = Math.round((memorizedParts / total) * 100);
  const isComplete = memorizedParts === total;
  const hasProgress = memorizedParts > 0;
  
  const sizeClasses = {
    small: 'h-2',
    medium: 'h-3',
    large: 'h-4'
  };
  
  const textSizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  };

  return (
    <div className={cn('w-full', className)} style={{ fontFamily: 'Alexandria, sans-serif' }}>
      {showNumbers && (
        <div className="flex items-center justify-between mb-2">
          <span className={cn(
            'font-semibold text-amber-700 dark:text-amber-300 font-alexandria',
            textSizeClasses[size]
          )}>
            📚 {memorizedParts} / {total} جزء
          </span>
          {showPercentage && (
            <span className={cn(
              'font-bold text-amber-600 dark:text-amber-400 font-alexandria',
              textSizeClasses[size]
            )}>
              {percentage}%
            </span>
          )}
        </div>
      )}
      
      {/* شريط التقدم الرئيسي */}
      <div className="relative">
        <div className={cn(
          'w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden islamic-border',
          sizeClasses[size]
        )}>
          <div 
            className={cn(
              'transition-all duration-500 ease-out rounded-full shadow-inner relative overflow-hidden',
              isComplete 
                ? 'bg-gradient-to-r from-emerald-500 via-emerald-600 to-green-500' 
                : 'bg-gradient-to-r from-amber-500 to-amber-600'
            )}
            style={{ width: `${percentage}%` }}
          >
            {/* تأثير بصري متحرك */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
          </div>
        </div>
        
        {/* علامات التقدم */}
        {size !== 'small' && (
          <div className="absolute -top-1 w-full flex justify-between px-1">
            {[10, 20, 30].map(milestone => (
              <div
                key={milestone}
                className={cn(
                  'w-1 h-4 rounded-full transition-colors duration-300',
                  memorizedParts >= milestone 
                    ? 'bg-amber-500 dark:bg-amber-400 shadow-sm' 
                    : 'bg-gray-300 dark:bg-gray-600'
                )}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* رسائل تحفيزية */}
      {isComplete && (
        <div className="mt-3 text-center animate-pulse">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg text-sm font-bold font-alexandria shadow-lg">
            🎉 مبروك! حافظ للقرآن الكريم كاملاً - بارك الله فيه
          </div>
        </div>
      )}
      
      {hasProgress && !isComplete && (
        <div className="mt-2 text-center">
          <span className={cn(
            'text-amber-600 dark:text-amber-400 font-alexandria italic',
            textSizeClasses[size]
          )}>
            💪 {isRTL ? 'في طريقه لإتمام حفظ القرآن الكريم - وفقه الله' : 'On the path to complete Quran memorization - May Allah grant success'}
          </span>
        </div>
      )}
      
      {!hasProgress && (
        <div className="mt-2 text-center">
          <span className={cn(
            'text-gray-500 dark:text-gray-400 font-alexandria',
            textSizeClasses[size]
          )}>
            🌟 {isRTL ? 'بداية رحلة حفظ القرآن الكريم' : 'Beginning the Quran memorization journey'}
          </span>
        </div>
      )}
      
      {/* مؤشرات إضافية للمراحل */}
      {size === 'large' && (
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className={cn(
            'p-2 rounded-lg transition-all duration-300',
            memorizedParts >= 10 
              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' 
              : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
          )}>
            <div className="text-lg font-bold">10</div>
            <div className="text-xs font-alexandria">الثلث الأول</div>
          </div>
          <div className={cn(
            'p-2 rounded-lg transition-all duration-300',
            memorizedParts >= 20 
              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' 
              : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
          )}>
            <div className="text-lg font-bold">20</div>
            <div className="text-xs font-alexandria">الثلثان</div>
          </div>
          <div className={cn(
            'p-2 rounded-lg transition-all duration-300',
            memorizedParts === 30 
              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' 
              : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
          )}>
            <div className="text-lg font-bold">30</div>
            <div className="text-xs font-alexandria">التمام</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuranProgressBar;