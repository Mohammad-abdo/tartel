import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { paymentAPI } from '../services/api';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { Button } from '../components/ui/button';

const SubscriptionCallback = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Params set by our backend GET /fawry/callback redirect
  const paymentResult = searchParams.get('paymentResult'); // SUCCESS | FAILED | PENDING
  const merchantRefNumber = searchParams.get('merchantRefNumber');
  const bookingId = searchParams.get('bookingId');
  const referenceNumber = searchParams.get('referenceNumber');

  // Legacy: subscription flow
  const subscriptionId = searchParams.get('subscriptionId');

  const [status, setStatus] = useState(() => {
    if (paymentResult === 'SUCCESS') return 'SUCCESS';
    if (paymentResult === 'FAILED') return 'FAILED';
    return 'VERIFYING';
  });
  const [loading, setLoading] = useState(paymentResult !== 'SUCCESS' && paymentResult !== 'FAILED');

  useEffect(() => {
    // If the backend already told us the result, no need to poll
    if (paymentResult === 'SUCCESS' || paymentResult === 'FAILED') {
      setLoading(false);
      return;
    }

    // If we have a merchantRefNumber, poll the backend for status
    if (merchantRefNumber) {
      let attempts = 0;
      const maxAttempts = 10;

      const checkStatus = async () => {
        try {
          const res = await paymentAPI.getFawryPaymentStatus(merchantRefNumber);
          const data = res.data || res;
          if (data.paymentResult === 'SUCCESS' || data.isPaid) {
            setStatus('SUCCESS');
            setLoading(false);
            return true;
          } else if (data.paymentResult === 'FAILED') {
            setStatus('FAILED');
            setLoading(false);
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
            if (!done) {
              setStatus('PENDING');
              setLoading(false);
            }
          }
        }, 3000);

        return () => clearInterval(interval);
      };

      poll();
      return;
    }

    // No params at all – show error
    if (!subscriptionId && !merchantRefNumber && !paymentResult) {
      setStatus('FAILED');
      setLoading(false);
    }
  }, [paymentResult, merchantRefNumber, subscriptionId]);

  const handleContinue = () => {
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
    <div className="flex bg-gray-50 dark:bg-gray-900 min-h-screen items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg max-w-md w-full p-8 text-center space-y-6">
        
        {loading || status === 'VERIFYING' ? (
          <>
            <div className="flex justify-center">
              <div className="animate-spin h-16 w-16 border-4 border-orange-500 rounded-full border-t-transparent"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('subscriptions.processingPayment') || 'جاري التحقق من الدفع...'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              {t('subscriptions.pleaseWait') || 'يرجى الانتظار بينما نتحقق من حالة الدفع.'}
            </p>
          </>
        ) : status === 'SUCCESS' ? (
          <>
            <div className="flex justify-center">
              <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                <FiCheckCircle className="h-10 w-10" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-emerald-600">
              {t('subscriptions.paymentSuccess') || 'تم الدفع بنجاح!'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              {t('subscriptions.successDesc') || 'تم تأكيد الحجز الخاص بك.'}
            </p>
            {referenceNumber && (
              <p className="text-sm text-gray-400 dark:text-gray-500 font-mono">
                {t('payments.fawryRef') || 'رقم المرجع'}: {referenceNumber}
              </p>
            )}
            <Button onClick={handleContinue} className="w-full">
              {t('common.continue') || 'متابعة'}
            </Button>
          </>
        ) : status === 'PENDING' ? (
          <>
            <div className="flex justify-center">
              <div className="h-20 w-20 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                <FiCheckCircle className="h-10 w-10" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-yellow-600">
              {t('subscriptions.paymentPending') || 'الدفع قيد المعالجة'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              {t('subscriptions.pendingDesc') || 'تم استلام طلب الدفع. قد يستغرق التأكيد بضع دقائق.'}
            </p>
            <Button onClick={handleBack} variant="outline" className="w-full">
              {t('common.back') || 'العودة للحجوزات'}
            </Button>
          </>
        ) : (
          <>
            <div className="flex justify-center">
              <div className="h-20 w-20 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                <FiXCircle className="h-10 w-10" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-red-600">
              {t('subscriptions.paymentFailed') || 'فشل الدفع'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              {t('subscriptions.failedDesc') || 'لم نتمكن من التحقق من الدفع. يرجى المحاولة مرة أخرى.'}
            </p>
            <Button onClick={handleBack} variant="outline" className="w-full">
              {t('common.back') || 'العودة للحجوزات'}
            </Button>
          </>
        )}

      </div>
    </div>
  );
};

export default SubscriptionCallback;
