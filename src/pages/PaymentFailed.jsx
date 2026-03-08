import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiXCircle } from 'react-icons/fi';
import { Button } from '../components/ui/button';

/**
 * صفحة مستقلة لنتيجة فشل الدفع — لا علاقة لها بالداشبورد.
 * تُعرض عند فشل الدفع مع إظهار السبب إن وُجد.
 */
const PaymentFailed = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const reason = searchParams.get('reason') || searchParams.get('message');
  const bookingId = searchParams.get('bookingId');
  const code = searchParams.get('code');

  const handleRetry = () => {
    if (bookingId) {
      navigate(`/bookings/${bookingId}`);
    } else {
      navigate('/bookings');
    }
  };

  const handleBack = () => {
    navigate('/bookings');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 text-center shadow-lg dark:bg-gray-800">
        <div className="flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30">
            <FiXCircle className="h-10 w-10" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">
          {t('paymentStatus.failedTitle') || 'فشل الدفع'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {t('paymentStatus.failedDesc') || 'لم يتم إتمام عملية الدفع.'}
        </p>
        {(reason || code) && (
          <div className="rounded-xl bg-gray-100 p-4 text-right dark:bg-gray-700/50">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('paymentStatus.reason') || 'السبب'}
            </p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {reason || code}
            </p>
          </div>
        )}
        <div className="flex flex-col gap-3">
          {bookingId && (
            <Button onClick={handleRetry} className="w-full">
              {t('paymentStatus.tryAgain') || 'المحاولة مرة أخرى'}
            </Button>
          )}
          <Button onClick={handleBack} variant="outline" className="w-full">
            {t('paymentStatus.backToBookings') || 'العودة للحجوزات'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;
