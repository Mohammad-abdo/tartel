import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Module-level confetti data (generated once at import time)
const CONFETTI_PARTICLES = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  delay: Math.random() * 2,
  duration: 2 + Math.random() * 3,
  color: ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'][Math.floor(Math.random() * 6)],
  size: 4 + Math.random() * 8,
  rotation: Math.random() * 360,
}));

const PaymentSuccess = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const courseId = searchParams.get('courseId');
  const referenceNumber = searchParams.get('referenceNumber');
  const merchantRefNumber = searchParams.get('merchantRefNumber');

  const isAr = i18n.language === 'ar';
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleViewBooking = () => {
    if (bookingId) navigate(`/bookings/${bookingId}`);
    else if (courseId) navigate(`/courses/${courseId}`);
    else navigate('/bookings');
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');

        .payment-success-page {
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

        .payment-success-page * { box-sizing: border-box; }

        /* Animated gradient orbs */
        .success-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.3;
          animation: float 8s ease-in-out infinite;
        }
        .success-orb-1 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, #10b981, transparent);
          top: -100px; right: -100px;
          animation-delay: 0s;
        }
        .success-orb-2 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, #06b6d4, transparent);
          bottom: -80px; left: -80px;
          animation-delay: 3s;
        }
        .success-orb-3 {
          width: 200px; height: 200px;
          background: radial-gradient(circle, #8b5cf6, transparent);
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          animation-delay: 5s;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-30px) scale(1.1); }
        }

        /* Confetti */
        .confetti-piece {
          position: absolute;
          top: -20px;
          opacity: 0;
          animation: confettiFall linear forwards;
        }
        @keyframes confettiFall {
          0% { opacity: 1; transform: translateY(0) rotate(0deg); }
          100% { opacity: 0; transform: translateY(100vh) rotate(720deg); }
        }

        /* Card */
        .success-card {
          position: relative;
          z-index: 10;
          background: rgba(30, 41, 59, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: 24px;
          padding: 3rem 2.5rem;
          max-width: 480px;
          width: 100%;
          text-align: center;
          opacity: 0;
          transform: translateY(40px) scale(0.95);
          transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .success-card.visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        /* Animated checkmark */
        .check-container {
          position: relative;
          width: 120px; height: 120px;
          margin: 0 auto 1.5rem;
        }
        .check-ring {
          position: absolute; inset: 0;
          border-radius: 50%;
          border: 3px solid rgba(16, 185, 129, 0.15);
        }
        .check-ring-animated {
          position: absolute; inset: 0;
          border-radius: 50%;
          border: 3px solid transparent;
          border-top-color: #10b981;
          animation: spinRing 1s ease-out forwards;
        }
        @keyframes spinRing {
          0% { transform: rotate(0deg); border-top-color: #10b981; }
          100% { transform: rotate(360deg); border-color: #10b981; }
        }
        .check-bg {
          position: absolute;
          inset: 8px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981, #059669);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transform: scale(0);
          animation: popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.6s forwards;
          box-shadow: 0 0 40px rgba(16, 185, 129, 0.4), 0 0 80px rgba(16, 185, 129, 0.2);
        }
        @keyframes popIn {
          0% { opacity: 0; transform: scale(0); }
          100% { opacity: 1; transform: scale(1); }
        }
        .check-svg {
          width: 48px; height: 48px;
        }
        .check-path {
          stroke-dasharray: 60;
          stroke-dashoffset: 60;
          animation: drawCheck 0.6s ease-out 1s forwards;
        }
        @keyframes drawCheck {
          to { stroke-dashoffset: 0; }
        }

        /* Pulse ring */
        .pulse-ring {
          position: absolute; inset: -4px;
          border-radius: 50%;
          border: 2px solid #10b981;
          animation: pulse 2s ease-out 1.2s infinite;
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.4); opacity: 0; }
        }

        .success-title {
          font-size: 1.75rem;
          font-weight: 800;
          color: #10b981;
          margin-bottom: 0.5rem;
          opacity: 0;
          animation: fadeUp 0.6s ease-out 1.1s forwards;
        }
        .success-subtitle {
          font-size: 1rem;
          color: #94a3b8;
          margin-bottom: 2rem;
          line-height: 1.7;
          opacity: 0;
          animation: fadeUp 0.6s ease-out 1.3s forwards;
        }
        @keyframes fadeUp {
          0% { opacity: 0; transform: translateY(15px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        /* Info rows */
        .info-section {
          background: rgba(15, 23, 42, 0.5);
          border-radius: 16px;
          padding: 1.25rem;
          margin-bottom: 1.5rem;
          border: 1px solid rgba(51, 65, 85, 0.5);
          opacity: 0;
          animation: fadeUp 0.6s ease-out 1.5s forwards;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
          font-size: 0.875rem;
        }
        .info-row + .info-row {
          border-top: 1px solid rgba(51, 65, 85, 0.4);
        }
        .info-label {
          color: #64748b;
        }
        .info-value {
          color: #e2e8f0;
          font-weight: 600;
          font-family: 'Courier New', monospace;
          font-size: 0.8rem;
          direction: ltr;
        }

        /* Buttons */
        .success-btn {
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
          animation: fadeUp 0.6s ease-out 1.7s forwards;
        }
        .success-btn-primary {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
        }
        .success-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(16, 185, 129, 0.4);
        }

        .shield-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          color: #10b981;
          font-size: 0.75rem;
          font-weight: 600;
          margin-top: 1rem;
          opacity: 0;
          animation: fadeUp 0.5s ease-out 1.9s forwards;
        }
        .shield-badge svg { width: 14px; height: 14px; }
      `}</style>

      <div className="payment-success-page" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="success-orb success-orb-1" />
        <div className="success-orb success-orb-2" />
        <div className="success-orb success-orb-3" />

        {CONFETTI_PARTICLES.map(p => (
          <div
            key={p.id}
            className="confetti-piece"
            style={{
              left: `${p.x}%`,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              borderRadius: p.size > 8 ? '2px' : '50%',
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          />
        ))}

        <div className={`success-card ${show ? 'visible' : ''}`}>
          <div className="check-container">
            <div className="check-ring" />
            <div className="check-ring-animated" />
            <div className="pulse-ring" />
            <div className="check-bg">
              <svg className="check-svg" viewBox="0 0 52 52" fill="none">
                <path
                  className="check-path"
                  d="M14 27l8 8 16-16"
                  stroke="white"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          <h1 className="success-title">
            {isAr ? 'تم الدفع بنجاح!' : 'Payment Successful!'}
          </h1>
          <p className="success-subtitle">
            {isAr
              ? 'تمت معالجة عملية الدفع الخاصة بك بنجاح وتم تأكيد حجزك.'
              : 'Your payment has been processed successfully and your booking is confirmed.'}
          </p>

          {(referenceNumber || merchantRefNumber || bookingId) && (
            <div className="info-section">
              {referenceNumber && (
                <div className="info-row">
                  <span className="info-label">{isAr ? 'رقم المرجع' : 'Reference'}</span>
                  <span className="info-value">{referenceNumber}</span>
                </div>
              )}
              {merchantRefNumber && (
                <div className="info-row">
                  <span className="info-label">{isAr ? 'رقم العملية' : 'Transaction'}</span>
                  <span className="info-value">{merchantRefNumber}</span>
                </div>
              )}
              {bookingId && (
                <div className="info-row">
                  <span className="info-label">{isAr ? 'معرف الحجز' : 'Booking ID'}</span>
                  <span className="info-value">{bookingId.slice(0, 8)}...</span>
                </div>
              )}
            </div>
          )}

          <button className="success-btn success-btn-primary" onClick={handleViewBooking}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            {isAr ? 'عرض الحجز' : 'View Booking'}
          </button>

          <div className="shield-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
            {isAr ? 'عملية دفع آمنة ومشفرة' : 'Secure & Encrypted Payment'}
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentSuccess;
