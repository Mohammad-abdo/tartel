import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiLock } from 'react-icons/fi';
import { Button } from '../components/ui/button';

const Unauthorized = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/dashboard';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
      <FiLock className="mb-4 size-16 text-amber-500" />
      <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
        {t('unauthorized.title') || 'غير مصرح'}
      </h1>
      <p className="mb-6 max-w-md text-center text-gray-600 dark:text-gray-400">
        {t('unauthorized.message') || 'ليس لديك صلاحية للوصول إلى هذه الصفحة.'}
      </p>
      <Button onClick={() => navigate(from === '/unauthorized' ? '/dashboard' : from)}>
        {from !== '/dashboard' ? (t('unauthorized.back') || 'رجوع') : (t('unauthorized.dashboard') || 'لوحة التحكم')}
      </Button>
    </div>
  );
};

export default Unauthorized;
