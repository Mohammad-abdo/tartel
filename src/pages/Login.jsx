import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FiMail, FiLock, FiLogIn, FiSun, FiMoon } from 'react-icons/fi';
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
    <div
      className={cn(
        'min-h-screen flex items-center justify-center bg-muted/50 px-4 relative',
        isRTL ? 'rtl' : 'ltr'
      )}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn('absolute top-4 size-9 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground dark:text-gray-300 dark:hover:bg-gray-700', isRTL ? 'left-4' : 'right-4')}
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? (t('theme.switchToLight') || 'Switch to light mode') : (t('theme.switchToDark') || 'Switch to dark mode')}
      >
        {theme === 'dark' ? <FiSun className="size-4" /> : <FiMoon className="size-4" />}
      </Button>
      <div className="max-w-md w-full rounded-lg border border-border bg-card p-8 shadow-tarteel-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-1">
            Tarteel <span className="text-primary" dir="rtl">ترتيل</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-2">{t('login.subtitle')}</p>
        </div>

        {error && (
          <div
            className="mb-4 p-3 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-sm"
            role="alert"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-foreground mb-2">
              {t('login.email')}
            </label>
            <div className="relative">
              <FiMail
                className={cn(
                  'absolute top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none',
                  isRTL ? 'right-3' : 'left-3'
                )}
              />
              <Input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={cn('h-10', isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4')}
                placeholder={t('login.emailPlaceholder')}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-foreground mb-2">
              {t('login.password')}
            </label>
            <div className="relative">
              <FiLock
                className={cn(
                  'absolute top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none',
                  isRTL ? 'right-3' : 'left-3'
                )}
              />
              <Input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={cn('h-10', isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4')}
                placeholder={t('login.passwordPlaceholder')}
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-10 rounded-lg font-medium transition-all duration-200"
          >
            {loading ? (
              <>
                <span className="animate-spin rounded-full size-4 border-2 border-primary-foreground border-t-transparent" aria-hidden />
                {t('login.signingIn')}
              </>
            ) : (
              <>
                <FiLogIn className="size-4" aria-hidden />
                {t('login.signIn')}
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
