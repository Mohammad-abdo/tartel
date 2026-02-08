import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  FiMail, 
  FiLock, 
  FiLogIn, 
  FiSun, 
  FiMoon, 
  FiBook, 
  FiStar,
  FiShield,
  FiHeart
} from 'react-icons/fi';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { cn } from '../lib/utils';

const Login = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const isRTL = language === 'ar';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);

      if (result.success) {
        navigate('/dashboard', { replace: true });
      } else {
        setError(result.error || t('login.loginFailed'));
        setLoading(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(t('login.unexpectedError'));
      setLoading(false);
    }
  };

  return (
    <div className={cn('min-h-screen relative overflow-hidden', isRTL ? 'rtl' : 'ltr')} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* خلفية إسلامية مع أنماط هندسية */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-900">
        {/* نمط هندسي إسلامي */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-32 h-32 border-2 border-emerald-200/30 rounded-full"></div>
          <div className="absolute top-32 right-20 w-24 h-24 border-2 border-amber-200/30 rounded-full"></div>
          <div className="absolute bottom-20 left-32 w-40 h-40 border-2 border-emerald-200/30 rounded-full"></div>
          <div className="absolute bottom-32 right-10 w-28 h-28 border-2 border-amber-200/30 rounded-full"></div>
          
          {/* خطوط هندسية */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="islamic-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="currentColor" className="text-emerald-200/20"/>
                <circle cx="12" cy="12" r="1" fill="currentColor" className="text-amber-200/20"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#islamic-pattern)"/>
          </svg>
        </div>
      </div>

      {/* زر تبديل الوضع الليلي */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn(
          'absolute top-6 z-20 size-12 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-emerald-200/50 dark:border-gray-700/50 text-emerald-600 dark:text-emerald-400 hover:bg-white dark:hover:bg-gray-800 hover:scale-105 transition-all duration-200 shadow-lg',
          isRTL ? 'left-6' : 'right-6'
        )}
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? 'التبديل للوضع النهاري' : 'التبديل للوضع الليلي'}
      >
        {theme === 'dark' ? <FiSun className="size-5" /> : <FiMoon className="size-5" />}
      </Button>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          {/* بطاقة تسجيل الدخول الرئيسية */}
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-2xl p-8 relative overflow-hidden">
            
            {/* نمط إسلامي في الخلفية */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-100/30 to-transparent dark:from-emerald-900/30 rounded-bl-full"></div>
            <div className="absolute bottom-0 left-0 w-28 h-28 bg-gradient-to-tr from-amber-100/30 to-transparent dark:from-amber-900/30 rounded-tr-full"></div>
            
            <div className="relative z-10">
              {/* الهيدر مع الشعار */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl mb-6 shadow-xl">
                  <FiBook className="w-10 h-10 text-white" />
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2" dir="rtl">
                  <span className="text-emerald-600 dark:text-emerald-400 arabic-text">ترتيل</span>
                </h1>
                <h2 className="text-lg font-medium text-emerald-700 dark:text-emerald-300 mb-3 arabic-text quran-verse" dir="rtl">
                  منصة حفظ القرآن الكريم
                </h2>
                
                {/* آية قرآنية */}
                <div className="bg-gradient-to-r from-emerald-50 to-amber-50 dark:from-emerald-900/30 dark:to-amber-900/30 rounded-xl p-4 mb-6 border border-emerald-200/30 dark:border-emerald-700/30">
                  <p className="text-sm text-emerald-800 dark:text-emerald-200 arabic-text quran-verse leading-relaxed" dir="rtl">
                    ﴿ وَرَتِّلِ الْقُرْآنَ تَرْتِيلاً ﴾
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 arabic-text" dir="rtl">
                    سورة المزمل - آية 4
                  </p>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 arabic-text" dir="rtl">
                  لوحة التحكم الإدارية
                </p>
              </div>

              {/* رسالة الخطأ */}
              {error && (
                <div
                  className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm arabic-text"
                  role="alert"
                  dir="rtl"
                >
                  <div className="flex items-center gap-2">
                    <FiShield className="size-4 text-red-500" />
                    {error}
                  </div>
                </div>
              )}

              {/* نموذج تسجيل الدخول */}
              <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
                <div>
                  <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 arabic-text">
                    البريد الإلكتروني
                  </label>
                  <div className="relative">
                    <FiMail className="absolute top-1/2 -translate-y-1/2 right-4 size-5 text-emerald-500" />
                    <Input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 pr-12 pl-4 rounded-xl border-2 border-emerald-200 dark:border-emerald-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-emerald-500 dark:focus:ring-emerald-400 transition-all duration-200 arabic-text"
                      placeholder="admin@tarteel.com"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 arabic-text">
                    كلمة المرور
                  </label>
                  <div className="relative">
                    <FiLock className="absolute top-1/2 -translate-y-1/2 right-4 size-5 text-emerald-500" />
                    <Input
                      id="login-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 pr-12 pl-4 rounded-xl border-2 border-emerald-200 dark:border-emerald-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-emerald-500 dark:focus:ring-emerald-400 transition-all duration-200"
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 arabic-text text-lg"
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <div className="animate-spin rounded-full size-5 border-2 border-white border-t-transparent" />
                      جاري تسجيل الدخول...
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <FiLogIn className="size-5" />
                      تسجيل الدخول
                    </div>
                  )}
                </Button>
              </form>

              {/* معلومات إضافية */}
              <div className="mt-8 text-center">
                <div className="flex items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <FiShield className="size-4 text-emerald-500" />
                    <span className="arabic-text">محمي</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiHeart className="size-4 text-red-500" />
                    <span className="arabic-text">بحب القرآن</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiStar className="size-4 text-amber-500" />
                    <span className="arabic-text">متميز</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* معلومات حقوق الطبع */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 arabic-text" dir="rtl">
              © 2024 منصة ترتيل لحفظ القرآن الكريم - جميع الحقوق محفوظة
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
