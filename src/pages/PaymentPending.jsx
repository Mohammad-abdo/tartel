import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { paymentAPI } from '../services/api';

const PaymentPending = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const merchantRefNumber = searchParams.get('merchantRefNumber');
  const bookingId = searchParams.get('bookingId');

  const isAr = i18n.language === 'ar';
  const [show, setShow] = useState(false);
  const [dotCount, setDotCount] = useState(1);
  const [pollStatus, setPollStatus] = useState('POLLING'); // POLLING | RESOLVED_SUCCESS | RESOLVED_FAILED | TIMEOUT

  useEffect(() => {
    setTimeout(() => setShow(true), 100);

    // Animate dots
    const dotInterval = setInterval(() => {
      setDotCount(prev => prev >= 3 ? 1 : prev + 1);
    }, 600);

    return () => clearInterval(dotInterval);
  }, []);

  // Poll for payment status
  useEffect(() => {
    if (!merchantRefNumber) {
      setPollStatus('TIMEOUT');
      return;
    }

    let attempts = 0;
    const maxAttempts = 15;
    let cancelled = false;

    const check = async () => {
      try {
        const res = await paymentAPI.getFawryPaymentStatus(merchantRefNumber);
        const data = res.data || res;
        if (data.paymentResult === 'SUCCESS' || data.isPaid) {
          if (!cancelled) {
            setPollStatus('RESOLVED_SUCCESS');
            setTimeout(() => {
              const params = new URLSearchParams();
              if (bookingId) params.set('bookingId', bookingId);
              if (merchantRefNumber) params.set('merchantRefNumber', merchantRefNumber);
              navigate(`/payment/success?${params.toString()}`, { replace: true });
            }, 1500);
          }
          return true;
        }
        if (data.paymentResult === 'FAILED') {
          if (!cancelled) {
            setPollStatus('RESOLVED_FAILED');
            setTimeout(() => {
              const params = new URLSearchParams();
              if (bookingId) params.set('bookingId', bookingId);
              navigate(`/payment/failed?${params.toString()}`, { replace: true });
            }, 1500);
          }
          return true;
        }
      } catch (err) {
        console.error('Poll error:', err);
      }
      return false;
    };

    const poll = async () => {
      const done = await check();
      if (done || cancelled) return;

      const interval = setInterval(async () => {
        if (cancelled) { clearInterval(interval); return; }
        attempts++;
        const done = await check();
        if (done || attempts >= maxAttempts) {
          clearInterval(interval);
          if (!done && !cancelled) setPollStatus('TIMEOUT');
        }
      }, 3000);
    };

    poll();
    return () => { cancelled = true; };
  }, [merchantRefNumber, bookingId, navigate]);

  const handleViewBookings = () => navigate('/bookings');

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');

        .payment-pending-page {
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
        .payment-pending-page * { box-sizing: border-box; }

        .pend-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.25;
          animation: floatPend 8s ease-in-out infinite;
        }
        .pend-orb-1 {
          width: 350px; height: 350px;
          background: radial-gradient(circle, #f59e0b, transparent);
          top: -100px; right: -80px;
        }
        .pend-orb-2 {
          width: 280px; height: 280px;
          background: radial-gradient(circle, #3b82f6, transparent);
          bottom: -80px; left: -60px;
          animation-delay: 4s;
        }
        @keyframes floatPend {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.06); }
        }

        .pend-card {
          position: relative;
          z-index: 10;
          background: rgba(30, 41, 59, 0.85);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(245, 158, 11, 0.2);
          border-radius: 24px;
          padding: 3rem 2.5rem;
          max-width: 480px;
          width: 100%;
          text-align: center;
          opacity: 0;
          transform: translateY(40px) scale(0.95);
          transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .pend-card.visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        /* Animated clock / spinner */
        .clock-container {
          position: relative;
          width: 120px; height: 120px;
          margin: 0 auto 1.5rem;
        }
        .clock-ring-outer {
          position: absolute; inset: 0;
          border-radius: 50%;
          border: 3px solid rgba(245, 158, 11, 0.1);
        }
        .clock-spinner {
          position: absolute; inset: 0;
          border-radius: 50%;
          border: 3px solid transparent;
          border-top-color: #f59e0b;
          border-right-color: #f59e0b;
          animation: spinClock 1.5s linear infinite;
        }
        @keyframes spinClock {
          to { transform: rotate(360deg); }
        }
        .clock-bg {
          position: absolute;
          inset: 8px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 40px rgba(245, 158, 11, 0.3), 0 0 80px rgba(245, 158, 11, 0.1);
          animation: breathe 2s ease-in-out infinite;
        }
        @keyframes breathe {
          0%, 100% { box-shadow: 0 0 40px rgba(245, 158, 11, 0.3), 0 0 80px rgba(245, 158, 11, 0.1); }
          50% { box-shadow: 0 0 50px rgba(245, 158, 11, 0.5), 0 0 100px rgba(245, 158, 11, 0.2); }
        }
        .clock-icon { width: 44px; height: 44px; color: white; }

        .pend-title {
          font-size: 1.75rem;
          font-weight: 800;
          color: #f59e0b;
          margin-bottom: 0.5rem;
        }
        .pend-subtitle {
          font-size: 1rem;
          color: #94a3b8;
          margin-bottom: 2rem;
          line-height: 1.7;
        }

        /* Progress bar */
        .progress-section {
          margin-bottom: 2rem;
          opacity: 0;
          animation: fadeUpP 0.6s ease-out 0.8s forwards;
        }
        @keyframes fadeUpP {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .progress-bar-bg {
          height: 6px;
          background: rgba(51, 65, 85, 0.6);
          border-radius: 999px;
          overflow: hidden;
        }
        .progress-bar-fill {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, #f59e0b, #eab308, #f59e0b);
          background-size: 200% 100%;
          animation: shimmer 2s linear infinite;
          width: 60%;
          transition: width 0.5s;
        }
        .progress-resolved { width: 100% !important; }
        .progress-bar-fill.success-fill {
          background: linear-gradient(90deg, #10b981, #059669, #10b981);
          background-size: 200% 100%;
          animation: shimmer 2s linear infinite;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .progress-label {
          font-size: 0.8rem;
          color: #64748b;
          margin-top: 0.5rem;
        }

        /* Status steps */
        .status-steps {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 2rem;
          opacity: 0;
          animation: fadeUpP 0.6s ease-out 1s forwards;
        }
        .step-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.4rem;
        }
        .step-dot {
          width: 12px; height: 12px;
          border-radius: 50%;
          background: #334155;
          transition: all 0.5s;
        }
        .step-dot.active {
          background: #f59e0b;
          box-shadow: 0 0 12px rgba(245, 158, 11, 0.5);
        }
        .step-dot.done {
          background: #10b981;
          box-shadow: 0 0 12px rgba(16, 185, 129, 0.5);
        }
        .step-label {
          font-size: 0.7rem;
          color: #64748b;
        }

        .pend-btn {
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
          background: rgba(51, 65, 85, 0.5);
          color: #94a3b8;
          border: 1px solid rgba(71, 85, 105, 0.5);
          opacity: 0;
          animation: fadeUpP 0.6s ease-out 1.2s forwards;
        }
        .pend-btn:hover {
          background: rgba(51, 65, 85, 0.8);
          color: #e2e8f0;
        }

        .security-note {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          color: #64748b;
          font-size: 0.75rem;
          font-weight: 600;
          margin-top: 1rem;
          opacity: 0;
          animation: fadeUpP 0.5s ease-out 1.4s forwards;
        }
        .security-note svg { width: 14px; height: 14px; }
      `}</style>

      <div className="payment-pending-page" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="pend-orb pend-orb-1" />
        <div className="pend-orb pend-orb-2" />

        <div className={`pend-card ${show ? 'visible' : ''}`}>
          <div className="clock-container">
            <div className="clock-ring-outer" />
            <div className="clock-spinner" />
            <div className="clock-bg">
              <svg className="clock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
          </div>

          <h1 className="pend-title">
            {isAr ? 'جاري معالجة الدفع' : 'Processing Payment'}
            {'.'.repeat(dotCount)}
          </h1>
          <p className="pend-subtitle">
            {pollStatus === 'RESOLVED_SUCCESS'
              ? (isAr ? 'تم تأكيد الدفع بنجاح! جاري التحويل...' : 'Payment confirmed! Redirecting...')
              : pollStatus === 'RESOLVED_FAILED'
                ? (isAr ? 'فشل الدفع. جاري التحويل...' : 'Payment failed. Redirecting...')
                : pollStatus === 'TIMEOUT'
                  ? (isAr ? 'لا يزال الدفع قيد المعالجة. يمكنك التحقق لاحقاً.' : 'Payment is still processing. You can check back later.')
                  : (isAr ? 'يرجى الانتظار بينما نتحقق من حالة الدفع الخاصة بك.' : 'Please wait while we verify your payment status.')}
          </p>

          <div className="progress-section">
            <div className="progress-bar-bg">
              <div className={`progress-bar-fill ${pollStatus.startsWith('RESOLVED') ? 'progress-resolved' : ''} ${pollStatus === 'RESOLVED_SUCCESS' ? 'success-fill' : ''}`} />
            </div>
            <div className="progress-label">
              {pollStatus === 'POLLING'
                ? (isAr ? 'جاري التحقق...' : 'Verifying...')
                : pollStatus === 'RESOLVED_SUCCESS'
                  ? (isAr ? '✓ تم التأكيد' : '✓ Confirmed')
                  : pollStatus === 'TIMEOUT'
                    ? (isAr ? 'انتهت المهلة' : 'Timeout')
                    : (isAr ? '✗ فشل' : '✗ Failed')}
            </div>
          </div>

          <div className="status-steps">
            <div className="step-item">
              <div className="step-dot done" />
              <span className="step-label">{isAr ? 'الدفع' : 'Payment'}</span>
            </div>
            <div className="step-item">
              <div className={`step-dot ${pollStatus === 'POLLING' ? 'active' : pollStatus === 'RESOLVED_SUCCESS' ? 'done' : ''}`} />
              <span className="step-label">{isAr ? 'التحقق' : 'Verification'}</span>
            </div>
            <div className="step-item">
              <div className={`step-dot ${pollStatus === 'RESOLVED_SUCCESS' ? 'done' : ''}`} />
              <span className="step-label">{isAr ? 'التأكيد' : 'Confirmation'}</span>
            </div>
          </div>

          <button className="pend-btn" onClick={handleViewBookings}>
            {isAr ? 'العودة للحجوزات' : 'Back to Bookings'}
          </button>

          <div className="security-note">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            {isAr ? 'اتصال مشفر وآمن' : 'Encrypted & Secure Connection'}
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentPending;
