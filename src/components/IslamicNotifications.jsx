import { useState, useEffect } from 'react';
import { FiX, FiBook, FiHeart, FiStar } from 'react-icons/fi';
import { cn } from '../lib/utils';

// مجموعة الأذكار والآيات القرآنية
const islamicContent = {
  adhkar: [
    {
      id: 1,
      type: 'dhikr',
      text: 'سُبْحَانَ اللهِ وَبِحَمْدِهِ',
      translation: 'سبحان الله وبحمده',
      reward: 'مائة حسنة',
      icon: FiStar,
      color: 'emerald'
    },
    {
      id: 2,
      type: 'dhikr', 
      text: 'لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ',
      translation: 'لا إله إلا الله وحده لا شريك له',
      reward: 'خير من الدنيا وما فيها',
      icon: FiStar,
      color: 'emerald'
    },
    {
      id: 3,
      type: 'dhikr',
      text: 'اللهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ',
      translation: 'اللهم صل وسلم على نبينا محمد',
      reward: 'عشر صلوات من الله',
      icon: FiHeart,
      color: 'rose'
    },
    {
      id: 4,
      type: 'istighfar',
      text: 'أَسْتَغْفِرُ اللهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ',
      translation: 'أستغفر الله العظيم الذي لا إله إلا هو الحي القيوم وأتوب إليه',
      reward: 'غفران الذنوب',
      icon: FiHeart,
      color: 'blue'
    },
    {
      id: 5,
      type: 'istighfar',
      text: 'رَبِّ اغْفِرْ لِي ذَنْبِي وَخَطَئِي وَجَهْلِي',
      translation: 'رب اغفر لي ذنبي وخطئي وجهلي',
      reward: 'مغفرة الذنوب',
      icon: FiHeart,
      color: 'blue'
    }
  ],
  verses: [
    {
      id: 6,
      type: 'verse',
      text: '﴿ وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا ﴾',
      translation: 'ومن يتق الله يجعل له مخرجاً',
      source: 'سورة الطلاق - آية 2',
      icon: FiBook,
      color: 'amber'
    },
    {
      id: 7,
      type: 'verse',
      text: '﴿ وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ ﴾',
      translation: 'ومن يتوكل على الله فهو حسبه',
      source: 'سورة الطلاق - آية 3',
      icon: FiBook,
      color: 'amber'
    },
    {
      id: 8,
      type: 'verse',
      text: '﴿ فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ ﴾',
      translation: 'فاذكروني أذكركم واشكروا لي ولا تكفرون',
      source: 'سورة البقرة - آية 152',
      icon: FiBook,
      color: 'amber'
    },
    {
      id: 9,
      type: 'verse',
      text: '﴿ وَبَشِّرِ الصَّابِرِينَ ﴾',
      translation: 'وبشر الصابرين',
      source: 'سورة البقرة - آية 155',
      icon: FiBook,
      color: 'amber'
    },
    {
      id: 10,
      type: 'verse',
      text: '﴿ وَاللَّهُ مَعَ الصَّابِرِينَ ﴾',
      translation: 'والله مع الصابرين',
      source: 'سورة البقرة - آية 249',
      icon: FiBook,
      color: 'amber'
    },
    {
      id: 11,
      type: 'verse',
      text: '﴿ إِنَّ مَعَ الْعُسْرِ يُسْرًا ﴾',
      translation: 'إن مع العسر يسراً',
      source: 'سورة الشرح - آية 6',
      icon: FiBook,
      color: 'amber'
    }
  ]
};

const IslamicNotifications = ({ enabled = true, interval = 300000 }) => { // 5 دقائق افتراضياً
  const [currentNotification, setCurrentNotification] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // دمج جميع المحتوى الإسلامي
  const allContent = [...islamicContent.adhkar, ...islamicContent.verses];

  useEffect(() => {
    if (!enabled || isDismissed) return;

    const showRandomNotification = () => {
      const randomIndex = Math.floor(Math.random() * allContent.length);
      const notification = allContent[randomIndex];
      
      setCurrentNotification(notification);
      setIsVisible(true);

      // إخفاء الإشعار بعد 10 ثوان تلقائياً
      setTimeout(() => {
        handleClose();
      }, 10000);
    };

    // عرض أول إشعار بعد 10 ثوان من التحميل
    const initialTimeout = setTimeout(showRandomNotification, 10000);

    // ثم عرض إشعار كل فترة محددة
    const intervalId = setInterval(showRandomNotification, interval);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(intervalId);
    };
  }, [enabled, interval, isDismissed]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      setCurrentNotification(null);
    }, 300);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    handleClose();
  };

  if (!enabled || !currentNotification) return null;

  const Icon = currentNotification.icon;
  const colorClasses = {
    emerald: {
      bg: 'from-emerald-500 to-emerald-600',
      text: 'text-emerald-900',
      border: 'border-emerald-200',
      bgLight: 'bg-emerald-50',
      icon: 'text-emerald-600'
    },
    rose: {
      bg: 'from-rose-500 to-rose-600',
      text: 'text-rose-900', 
      border: 'border-rose-200',
      bgLight: 'bg-rose-50',
      icon: 'text-rose-600'
    },
    blue: {
      bg: 'from-blue-500 to-blue-600',
      text: 'text-blue-900',
      border: 'border-blue-200', 
      bgLight: 'bg-blue-50',
      icon: 'text-blue-600'
    },
    amber: {
      bg: 'from-amber-500 to-amber-600',
      text: 'text-amber-900',
      border: 'border-amber-200',
      bgLight: 'bg-amber-50', 
      icon: 'text-amber-600'
    }
  };

  const colors = colorClasses[currentNotification.color] || colorClasses.emerald;

  return (
    <>
      {/* Backdrop */}
      {isVisible && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 animate-in fade-in duration-300" />
      )}
      
      {/* الإشعار الرئيسي */}
      <div 
        className={cn(
          'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4 transition-all duration-300',
          isVisible 
            ? 'animate-in fade-in slide-in-from-top-4 scale-in-95 duration-300' 
            : 'animate-out fade-out slide-out-to-top-4 scale-out-95 duration-300'
        )}
        style={{ display: currentNotification ? 'block' : 'none' }}
      >
        <div className={cn(
          'relative overflow-hidden rounded-2xl border-2 shadow-2xl backdrop-blur-xl',
          colors.border,
          colors.bgLight,
          'dark:bg-gray-900/95 dark:border-gray-700'
        )}>
          
          {/* الشريط العلوي المتدرج */}
          <div className={cn('h-2 bg-gradient-to-r', colors.bg)} />
          
          {/* المحتوى الرئيسي */}
          <div className="p-6 relative">
            
            {/* زر الإغلاق */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/80 dark:bg-gray-800/80 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200 hover:bg-white dark:hover:bg-gray-800"
            >
              <FiX className="w-4 h-4" />
            </button>

            {/* الأيقونة والعنوان */}
            <div className="flex items-center gap-3 mb-4">
              <div className={cn(
                'flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r shadow-lg',
                colors.bg
              )}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white arabic-text">
                  {currentNotification.type === 'dhikr' && '💫 ذكر مبارك'}
                  {currentNotification.type === 'istighfar' && '🤲 استغفار'}
                  {currentNotification.type === 'verse' && '📖 آية كريمة'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 arabic-text">
                  {currentNotification.type === 'verse' ? currentNotification.source : 'من السنة النبوية'}
                </p>
              </div>
            </div>

            {/* النص الرئيسي */}
            <div className="space-y-4">
              <div className={cn(
                'p-4 rounded-xl border-2 border-dashed text-center',
                colors.border,
                colors.bgLight,
                'dark:bg-gray-800/50 dark:border-gray-600'
              )}>
                <p className="text-lg font-medium leading-relaxed arabic-text quran-verse text-gray-900 dark:text-white" dir="rtl">
                  {currentNotification.text}
                </p>
              </div>

              {/* الترجمة/التوضيح */}
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-300 arabic-text" dir="rtl">
                  {currentNotification.translation}
                </p>
                {currentNotification.reward && (
                  <p className={cn('text-xs font-medium mt-1 arabic-text', colors.text)}>
                    الثواب: {currentNotification.reward}
                  </p>
                )}
              </div>

              {/* أزرار الإجراءات */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleDismiss}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors arabic-text"
                >
                  إيقاف الإشعارات
                </button>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors arabic-text"
                  >
                    إغلاق
                  </button>
                  <button
                    onClick={() => {
                      // يمكن إضافة وظيفة لحفظ الذكر أو مشاركته
                      handleClose();
                    }}
                    className={cn(
                      'px-4 py-2 text-xs font-medium text-white bg-gradient-to-r rounded-lg transition-all duration-200 hover:shadow-lg transform hover:scale-[1.02] arabic-text',
                      colors.bg
                    )}
                  >
                    بارك الله فيك
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* تأثير الإضاءة */}
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/5 pointer-events-none" />
        </div>
      </div>
    </>
  );
};

export default IslamicNotifications;