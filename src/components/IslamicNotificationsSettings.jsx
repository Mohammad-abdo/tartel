import { useState } from 'react';
import { 
  FiBell, 
  FiSettings, 
  FiClock, 
  FiToggleLeft, 
  FiToggleRight,
  FiBook,
  FiHeart,
  FiStar,
  FiEye,
  FiEyeOff
} from 'react-icons/fi';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

const IslamicNotificationsSettings = ({ settings, updateSettings, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const intervals = [
    { value: 180000, label: '3 دقائق' },
    { value: 300000, label: '5 دقائق' },
    { value: 600000, label: '10 دقائق' },
    { value: 900000, label: '15 دقائق' },
    { value: 1800000, label: '30 دقيقة' },
    { value: 3600000, label: 'ساعة واحدة' }
  ];

  const contentTypes = [
    { 
      key: 'showDhikr', 
      label: 'الأذكار والتسبيح',
      icon: FiStar,
      description: 'سبحان الله وبحمده، لا إله إلا الله'
    },
    { 
      key: 'showIstighfar', 
      label: 'الاستغفار والتوبة',
      icon: FiHeart,
      description: 'أستغفر الله العظيم، رب اغفر لي'
    },
    { 
      key: 'showVerses', 
      label: 'الآيات القرآنية',
      icon: FiBook,
      description: 'آيات مختارة من القرآن الكريم'
    }
  ];

  return (
    <>
      {/* Backdrop */}
      {isVisible && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-300" />
      )}

      {/* إعدادات الإشعارات */}
      <div className={cn(
        'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg mx-4 transition-all duration-300',
        isVisible 
          ? 'animate-in fade-in slide-in-from-top-4 scale-in-95 duration-300' 
          : 'animate-out fade-out slide-out-to-top-4 scale-out-95 duration-300'
      )}>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-emerald-200 dark:border-emerald-800 shadow-2xl overflow-hidden">
          
          {/* الشريط العلوي */}
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-xl">
                  <FiSettings className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white arabic-text">إعدادات الإشعارات الإسلامية</h3>
                  <p className="text-xs text-white/80 arabic-text">تخصيص الأذكار والآيات</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-colors"
              >
                <FiEyeOff className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            
            {/* تفعيل/إيقاف الإشعارات */}
            <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-3">
                <FiBell className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <p className="font-medium text-emerald-900 dark:text-emerald-100 arabic-text">
                    تفعيل الإشعارات
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 arabic-text">
                    عرض الأذكار والآيات بشكل دوري
                  </p>
                </div>
              </div>
              <button
                onClick={() => updateSettings({ enabled: !settings.enabled })}
                className={cn(
                  'flex items-center justify-center w-12 h-6 rounded-full transition-all duration-200',
                  settings.enabled 
                    ? 'bg-emerald-600 dark:bg-emerald-500' 
                    : 'bg-gray-300 dark:bg-gray-600'
                )}
              >
                <div className={cn(
                  'w-4 h-4 bg-white rounded-full transition-all duration-200 transform',
                  settings.enabled ? 'translate-x-3' : '-translate-x-3'
                )} />
              </button>
            </div>

            {settings.enabled && (
              <>
                {/* فترة العرض */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3 arabic-text">
                    <FiClock className="w-4 h-4 inline mr-2" />
                    فترة عرض الإشعارات
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {intervals.map((interval) => (
                      <button
                        key={interval.value}
                        onClick={() => updateSettings({ interval: interval.value })}
                        className={cn(
                          'p-3 text-sm font-medium rounded-xl border-2 transition-all duration-200 arabic-text',
                          settings.interval === interval.value
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-emerald-200 hover:bg-emerald-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-emerald-700 dark:hover:bg-emerald-900/20'
                        )}
                      >
                        {interval.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* أنواع المحتوى */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3 arabic-text">
                    أنواع المحتوى المعروض
                  </label>
                  <div className="space-y-3">
                    {contentTypes.map((type) => {
                      const Icon = type.icon;
                      const isEnabled = settings[type.key];
                      return (
                        <div
                          key={type.key}
                          className={cn(
                            'flex items-center justify-between p-3 rounded-xl border-2 transition-all duration-200',
                            isEnabled
                              ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-900/20'
                              : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={cn(
                              'w-5 h-5',
                              isEnabled 
                                ? 'text-emerald-600 dark:text-emerald-400' 
                                : 'text-gray-400 dark:text-gray-500'
                            )} />
                            <div>
                              <p className={cn(
                                'font-medium arabic-text',
                                isEnabled 
                                  ? 'text-emerald-900 dark:text-emerald-100' 
                                  : 'text-gray-600 dark:text-gray-300'
                              )}>
                                {type.label}
                              </p>
                              <p className={cn(
                                'text-xs arabic-text',
                                isEnabled 
                                  ? 'text-emerald-600 dark:text-emerald-400' 
                                  : 'text-gray-500 dark:text-gray-400'
                              )}>
                                {type.description}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => updateSettings({ [type.key]: !isEnabled })}
                            className={cn(
                              'flex items-center justify-center w-10 h-5 rounded-full transition-all duration-200',
                              isEnabled 
                                ? 'bg-emerald-600 dark:bg-emerald-500' 
                                : 'bg-gray-300 dark:bg-gray-600'
                            )}
                          >
                            <div className={cn(
                              'w-3 h-3 bg-white rounded-full transition-all duration-200 transform',
                              isEnabled ? 'translate-x-2.5' : '-translate-x-2.5'
                            )} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* الإخفاء التلقائي */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white arabic-text">
                      الإخفاء التلقائي
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 arabic-text">
                      إخفاء الإشعار تلقائياً بعد 10 ثوان
                    </p>
                  </div>
                  <button
                    onClick={() => updateSettings({ autoHide: !settings.autoHide })}
                    className={cn(
                      'flex items-center justify-center w-12 h-6 rounded-full transition-all duration-200',
                      settings.autoHide 
                        ? 'bg-emerald-600 dark:bg-emerald-500' 
                        : 'bg-gray-300 dark:bg-gray-600'
                    )}
                  >
                    <div className={cn(
                      'w-4 h-4 bg-white rounded-full transition-all duration-200 transform',
                      settings.autoHide ? 'translate-x-3' : '-translate-x-3'
                    )} />
                  </button>
                </div>
              </>
            )}

            {/* الأزرار */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={handleClose}
                className="arabic-text"
              >
                إغلاق
              </Button>
              <Button
                onClick={() => {
                  // يمكن إضافة حفظ إضافي هنا إذا لزم الأمر
                  handleClose();
                }}
                className="arabic-text"
              >
                حفظ الإعدادات
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default IslamicNotificationsSettings;