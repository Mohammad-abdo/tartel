import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

/**
 * المسار القديم لنتيجة الدفع.
 * يعيد التوجيه فوراً إلى الصفحات المستقلة الجديدة حسب الحالة.
 */
const SubscriptionCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const paymentResult = searchParams.get('paymentResult');
  const merchantRefNumber = searchParams.get('merchantRefNumber');
  const bookingId = searchParams.get('bookingId');
  const referenceNumber = searchParams.get('referenceNumber');
  const reason = searchParams.get('reason');

  useEffect(() => {
    if (paymentResult === 'SUCCESS') {
      const params = new URLSearchParams();
      if (bookingId) params.set('bookingId', bookingId);
      if (referenceNumber) params.set('referenceNumber', referenceNumber);
      if (merchantRefNumber) params.set('merchantRefNumber', merchantRefNumber);
      navigate(`/payment/success?${params.toString()}`, { replace: true });
      return;
    }
    if (paymentResult === 'FAILED') {
      const params = new URLSearchParams();
      if (reason) params.set('reason', reason);
      if (bookingId) params.set('bookingId', bookingId);
      navigate(`/payment/failed?${params.toString()}`, { replace: true });
      return;
    }
    if (paymentResult === 'PENDING' || merchantRefNumber) {
      const params = new URLSearchParams();
      if (merchantRefNumber) params.set('merchantRefNumber', merchantRefNumber);
      if (bookingId) params.set('bookingId', bookingId);
      navigate(`/payment/pending?${params.toString()}`, { replace: true });
      return;
    }
    // لا بارامترات — توجيه للحجوزات
    navigate('/bookings', { replace: true });
  }, [paymentResult, merchantRefNumber, bookingId, referenceNumber, reason, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
    </div>
  );
};

export default SubscriptionCallback;
