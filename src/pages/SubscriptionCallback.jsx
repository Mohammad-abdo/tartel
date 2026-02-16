import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { studentSubscriptionAPI } from '../services/api';
import { FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';
import { Button } from '../components/ui/button';

const SubscriptionCallback = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const subscriptionId = searchParams.get('subscriptionId');
  const [status, setStatus] = useState('VERIFYING'); // VERIFYING, SUCCESS, FAILED, PENDING
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!subscriptionId) {
      setStatus('FAILED');
      setLoading(false);
      return;
    }

    const checkStatus = async () => {
      try {
        // Fetch user's subscriptions to find the one we just paid for
        const res = await studentSubscriptionAPI.getMySubscriptions();
        const subscriptions = res.data || [];
        const sub = subscriptions.find(s => s.id === subscriptionId);

        if (sub) {
          if (sub.status === 'ACTIVE') {
            setStatus('SUCCESS');
          } else if (sub.status === 'CANCELLED' || sub.status === 'EXPIRED') {
            setStatus('FAILED');
          } else {
            // Still PENDING
            setStatus('PENDING');
          }
        } else {
          setStatus('FAILED');
        }
      } catch (error) {
        console.error('Failed to verify subscription:', error);
        setStatus('FAILED');
      } finally {
        setLoading(false);
      }
    };

    // Initial check
    checkStatus();

    // Poll every 3 seconds for 30 seconds if pending
    const interval = setInterval(() => {
        if (status === 'PENDING' || status === 'VERIFYING') {
            checkStatus();
        }
    }, 3000);

    // Stop polling after 30 seconds
    const timeout = setTimeout(() => {
        clearInterval(interval);
        if (status === 'VERIFYING') setStatus('PENDING'); // Just show pending if timed out
    }, 30000);

    return () => {
        clearInterval(interval);
        clearTimeout(timeout);
    };
  }, [subscriptionId, status]);

  const handleContinue = () => {
    navigate('/student-subscriptions');
  };

  return (
    <div className="flex bg-gray-50 dark:bg-gray-900 min-h-screen items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg max-w-md w-full p-8 text-center space-y-6">
        
        {loading || status === 'VERIFYING' || status === 'PENDING' ? (
          <>
            <div className="flex justify-center">
              <div className="animate-spin h-16 w-16 border-4 border-orange-500 rounded-full border-t-transparent"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('subscriptions.processingPayment') || 'Processing Payment...'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              {t('subscriptions.pleaseWait') || 'Please wait while we verify your payment.'}
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
              {t('subscriptions.paymentSuccess') || 'Subscription Activated!'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              {t('subscriptions.successDesc') || 'You can now start booking your sessions.'}
            </p>
            <Button onClick={handleContinue} className="w-full">
              {t('common.continue') || 'Continue'}
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
              {t('subscriptions.paymentFailed') || 'Payment Failed or Pending'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              {t('subscriptions.failedDesc') || 'We could not verify your payment yet. Please checking your subscriptions status later.'}
            </p>
            <Button onClick={handleContinue} variant="outline" className="w-full">
              {t('common.back') || 'Back to Subscriptions'}
            </Button>
          </>
        )}

      </div>
    </div>
  );
};

export default SubscriptionCallback;
