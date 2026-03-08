import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiCheckCircle } from 'react-icons/fi';
import { Button } from '../components/ui/button';

/**
 * صفحة مستقلة لنتيجة الدفع الناجح — لا علاقة لها بالداشبورد.
 * تُعرض بعد إتمام الدفع بنجاح (توجيه من فوري أو غيره).
 */
const PaymentSuccess = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const bookingId = searchParams.get('bookingId');
  const referenceNumber = searchParams.get('referenceNumber');
  const merchantRefNumber = searchParams.get('merchantRefNumber');

  const handleViewBooking = () => {
    if (bookingId) {
      navigate(`/bookings/${bookingId}`);
    } else {
      navigate('/bookings');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 text-center shadow-lg dark:bg-gray-800">
        <div className="flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30">
            <FiCheckCircle className="h-10 w-10" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
          {t('paymentStatus.successTitle') || 'تم الدفع بنجاح'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {t('paymentStatus.successDesc') || 'تم تأكيد الدفع والحجز الخاص بك بنجاح.'}
        </p>
        {(referenceNumber || merchantRefNumber) && (
          <p className="text-sm font-mono text-gray-400 dark:text-gray-500">
            {t('paymentStatus.referenceNumber') || 'رقم المرجع'}: {referenceNumber || merchantRefNumber}
          </p>
        )}
        <Button onClick={handleViewBooking} className="w-full">
          {bookingId
            ? (t('paymentStatus.viewBooking') || 'عرض الحجز')
            : (t('paymentStatus.goToBookings') || 'العودة للحجوزات')}
        </Button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
