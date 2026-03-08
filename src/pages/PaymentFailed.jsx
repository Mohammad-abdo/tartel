import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const FAILURE_REASONS = {
  PAYMENT_FAILED: { ar: 'فشلت عملية الدفع', en: 'Payment transaction failed' },
  EXPIRED: { ar: 'انتهت صلاحية عملية الدفع', en: 'Payment session expired' },
  CANCELLED: { ar: 'تم إلغاء عملية الدفع', en: 'Payment was cancelled' },
  CANCELED: { ar: 'تم إلغاء عملية الدفع', en: 'Payment was cancelled' },
  FAILED: { ar: 'رفض الدفع من مزود الخدمة', en: 'Payment declined by provider' },
  VOIDED: { ar: 'تم إلغاء المعاملة', en: 'Transaction was voided' },
};

const PaymentFailed = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reason = searchParams.get('reason') || 'PAYMENT_FAILED';
  const bookingId = searchParams.get('bookingId');

  const isAr = i18n.language === 'ar';
  const [show, setShow] = useState(false);

  useEffect(() => {
    setTimeout(() => setShow(true), 100);
  }, []);

  const reasonText = FAILURE_REASONS[reason.toUpperCase()]
    ? FAILURE_REASONS[reason.toUpperCase()][isAr ? 'ar' : 'en']
    : reason;

  const handleRetry = () => {
    if (bookingId) navigate(`/bookings/${bookingId}`);
    else navigate('/bookings');
  };

  const handleHome = () => navigate('/dashboard');

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');

        .payment-failed-page {
          font-family: 'Cairo', sans-serif;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
          position: relative;
          overflow: hidden;
          padding: 1rem;
        }
        .payment-failed-page * { box-sizing: border-box; }

        /* Animated warning orbs */
        .fail-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.25;
          animation: floatFail 8s ease-in-out infinite;
        }
        .fail-orb-1 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, #ef4444, transparent);
          top: -120px; left: -120px;
        }
        .fail-orb-2 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, #f97316, transparent);
          bottom: -100px; right: -100px;
          animation-delay: 3s;
        }

        @keyframes floatFail {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-25px) scale(1.08); }
        }

        .fail-card {
          position: relative;
          z-index: 10;
          background: rgba(30, 41, 59, 0.85);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 24px;
          padding: 3rem 2.5rem;
          max-width: 480px;
          width: 100%;
          text-align: center;
          opacity: 0;
          transform: translateY(40px) scale(0.95);
          transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .fail-card.visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        /* Animated X mark */
        .x-container {
          position: relative;
          width: 120px; height: 120px;
          margin: 0 auto 1.5rem;
        }
        .x-ring {
          position: absolute; inset: 0;
          border-radius: 50%;
          border: 3px solid rgba(239, 68, 68, 0.15);
        }
        .x-ring-animated {
          position: absolute; inset: 0;
          border-radius: 50%;
          border: 3px solid transparent;
          border-top-color: #ef4444;
          animation: spinX 1s ease-out forwards;
        }
        @keyframes spinX {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); border-color: #ef4444; }
        }
        .x-bg {
          position: absolute;
          inset: 8px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transform: scale(0);
          animation: popInX 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.6s forwards;
          box-shadow: 0 0 40px rgba(239, 68, 68, 0.4), 0 0 80px rgba(239, 68, 68, 0.15);
        }
        @keyframes popInX {
          0% { opacity: 0; transform: scale(0); }
          100% { opacity: 1; transform: scale(1); }
        }
        .x-svg { width: 44px; height: 44px; }
        .x-line {
          stroke-dasharray: 40;
          stroke-dashoffset: 40;
        }
        .x-line-1 { animation: drawLine 0.4s ease-out 1s forwards; }
        .x-line-2 { animation: drawLine 0.4s ease-out 1.2s forwards; }
        @keyframes drawLine { to { stroke-dashoffset: 0; } }

        /* Shake animation */
        .shake-ring {
          position: absolute; inset: -4px;
          border-radius: 50%;
          border: 2px solid #ef4444;
          animation: shakePulse 2s ease-out 1.4s infinite;
        }
        @keyframes shakePulse {
          0% { transform: scale(1); opacity: 0.5; }
          10% { transform: scale(1) translateX(-3px); }
          20% { transform: scale(1) translateX(3px); }
          30% { transform: scale(1) translateX(-2px); }
          40% { transform: scale(1) translateX(0); }
          100% { transform: scale(1.35); opacity: 0; }
        }

        .fail-title {
          font-size: 1.75rem;
          font-weight: 800;
          color: #ef4444;
          margin-bottom: 0.5rem;
          opacity: 0;
          animation: fadeUpF 0.6s ease-out 1.1s forwards;
        }
        .fail-subtitle {
          font-size: 1rem;
          color: #94a3b8;
          margin-bottom: 1rem;
          line-height: 1.7;
          opacity: 0;
          animation: fadeUpF 0.6s ease-out 1.3s forwards;
        }
        @keyframes fadeUpF {
          0% { opacity: 0; transform: translateY(15px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        /* Reason box */
        .reason-box {
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 14px;
          padding: 1rem 1.25rem;
          margin-bottom: 2rem;
          opacity: 0;
          animation: fadeUpF 0.6s ease-out 1.5s forwards;
        }
        .reason-label {
          font-size: 0.75rem;
          color: #f87171;
          font-weight: 600;
          margin-bottom: 0.25rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .reason-text {
          font-size: 0.95rem;
          color: #fca5a5;
          font-weight: 600;
        }

        /* Buttons */
        .fail-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.875rem 2rem;
          border-radius: 14px;
          font-size: 1rem;
          font-weight: 700;
          font-family: 'Cairo', sans-serif;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
          opacity: 0;
          animation: fadeUpF 0.6s ease-out 1.7s forwards;
          margin-bottom: 0.75rem;
        }
        .fail-btn-retry {
          background: linear-gradient(135deg, #f97316, #ea580c);
          color: white;
          box-shadow: 0 4px 20px rgba(249, 115, 22, 0.3);
        }
        .fail-btn-retry:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(249, 115, 22, 0.4);
        }
        .fail-btn-home {
          background: rgba(51, 65, 85, 0.5);
          color: #94a3b8;
          border: 1px solid rgba(71, 85, 105, 0.5);
          animation-delay: 1.85s;
        }
        .fail-btn-home:hover {
          background: rgba(51, 65, 85, 0.8);
          color: #e2e8f0;
        }

        .shield-badge-fail {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          color: #64748b;
          font-size: 0.75rem;
          font-weight: 600;
          margin-top: 0.75rem;
          opacity: 0;
          animation: fadeUpF 0.5s ease-out 2s forwards;
        }
        .shield-badge-fail svg { width: 14px; height: 14px; }
      `}</style>

      <div className="payment-failed-page" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="fail-orb fail-orb-1" />
        <div className="fail-orb fail-orb-2" />

        <div className={`fail-card ${show ? 'visible' : ''}`}>
          <div className="x-container">
            <div className="x-ring" />
            <div className="x-ring-animated" />
            <div className="shake-ring" />
            <div className="x-bg">
              <svg className="x-svg" viewBox="0 0 52 52" fill="none">
                <line className="x-line x-line-1" x1="16" y1="16" x2="36" y2="36" stroke="white" strokeWidth="4" strokeLinecap="round" />
                <line className="x-line x-line-2" x1="36" y1="16" x2="16" y2="36" stroke="white" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          <h1 className="fail-title">
            {isAr ? 'لم يتم الدفع' : 'Payment Failed'}
          </h1>
          <p className="fail-subtitle">
            {isAr
              ? 'عذراً، لم نتمكن من إتمام عملية الدفع. يرجى المحاولة مرة أخرى.'
              : 'Sorry, we couldn\'t process your payment. Please try again.'}
          </p>

          <div className="reason-box">
            <div className="reason-label">{isAr ? 'سبب الفشل' : 'Failure Reason'}</div>
            <div className="reason-text">{reasonText}</div>
          </div>

          <button className="fail-btn fail-btn-retry" onClick={handleRetry}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            {isAr ? 'إعادة المحاولة' : 'Try Again'}
          </button>

          <button className="fail-btn fail-btn-home" onClick={handleHome}>
            {isAr ? 'العودة للرئيسية' : 'Go to Dashboard'}
          </button>

          <div className="shield-badge-fail">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            {isAr ? 'لم يتم خصم أي مبلغ من حسابك' : 'No amount was charged to your account'}
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentFailed;
