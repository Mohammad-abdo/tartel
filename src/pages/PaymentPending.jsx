import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { paymentAPI } from '../services/api';
import { Button } from '../components/ui/button';

/**
 * صفحة مستقلة لحالة "الدفع قيد التحقق" — لا علاقة لها بالداشبورد.
 * تعرض رسالة انتظار ويمكنها الاستعلام عن الحالة تلقائياً.
 */
const PaymentPending = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const merchantRefNumber = searchParams.get('merchantRefNumber');
  const bookingId = searchParams.get('bookingId');

  const [checking, setChecking] = useState(!!merchantRefNumber);

  useEffect(() => {
    if (!merchantRefNumber) {
      setChecking(false);
      return;
    }

    let attempts = 0;
    const maxAttempts = 10;

    const checkStatus = async () => {
      try {
        const res = await paymentAPI.getFawryPaymentStatus(merchantRefNumber);
        const data = res.data || res;
        if (data.paymentResult === 'SUCCESS' || data.isPaid) {
          const params = new URLSearchParams();
          if (bookingId) params.set('bookingId', bookingId);
          if (data.referenceNumber) params.set('referenceNumber', data.referenceNumber);
          params.set('merchantRefNumber', merchantRefNumber);
          navigate(`/payment/success?${params.toString()}`, { replace: true });
          return true;
        }
        if (data.paymentResult === 'FAILED') {
          const reason = data.message || data.reason || 'FAILED';
          const params = new URLSearchParams({ reason });
          if (bookingId) params.set('bookingId', bookingId);
          navigate(`/payment/failed?${params.toString()}`, { replace: true });
          return true;
        }
      } catch (err) {
        console.error('Failed to check payment status:', err);
      }
      return false;
    };

    const poll = async () => {
      const done = await checkStatus();
      if (done) return;

      const interval = setInterval(async () => {
        attempts++;
        const done = await checkStatus();
        if (done || attempts >= maxAttempts) {
          clearInterval(interval);
          setChecking(false);
        }
      }, 3000);

      return () => clearInterval(interval);
    };

    poll();
  }, [merchantRefNumber, bookingId, navigate]);

  const handleBack = () => {
    navigate('/bookings');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 text-center shadow-lg dark:bg-gray-800">
        {checking ? (
          <>
            <div className="flex justify-center">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('paymentStatus.pendingTitle') || 'جاري التحقق من الدفع'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              {t('paymentStatus.pendingDesc') || 'يرجى الانتظار بينما نتحقق من حالة الدفع.'}
            </p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {t('paymentStatus.pendingTitle') || 'الدفع قيد المعالجة'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              {t('paymentStatus.pendingDescLong') || 'تم استلام طلب الدفع. قد يستغرق التأكيد بضع دقائق. يمكنك العودة لاحقاً للتحقق من حالة الحجز.'}
            </p>
            <Button onClick={handleBack} variant="outline" className="w-full">
              {t('paymentStatus.backToBookings') || 'العودة للحجوزات'}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentPending;
