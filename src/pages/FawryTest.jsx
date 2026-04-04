import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { adminAPI, paymentAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FiExternalLink, FiCreditCard, FiRefreshCw, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { cn } from '../lib/utils';

const FawryTest = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [returnUrl, setReturnUrl] = useState(() => typeof window !== 'undefined' ? `${window.location.origin}/fawry-test` : '');
  const [checkoutLanguage, setCheckoutLanguage] = useState('ar-eg');
  const [creating, setCreating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const [statusRef, setStatusRef] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusResult, setStatusResult] = useState(null);

  const [fawryAvailable, setFawryAvailable] = useState(null);
  const [fawryConfigured, setFawryConfigured] = useState(false);

  useEffect(() => {
    fetchBookings();
    checkFawry();
  }, []);

  const checkFawry = async () => {
    try {
      const res = await paymentAPI.getFawryInfo();
      const data = res.data ?? res;
      setFawryAvailable(true);
      setFawryConfigured(!!data?.configured);
    } catch {
      setFawryAvailable(false);
    }
  };

  const fetchBookings = async () => {
    setLoadingBookings(true);
    try {
      const res = await adminAPI.getBookings({ status: 'CONFIRMED', limit: 50 });
      const list = res.data?.bookings || res.data?.data || [];
      setBookings(Array.isArray(list) ? list : []);
      if (list?.length && !selectedBookingId) setSelectedBookingId(list[0]?.id || '');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoadingBookings(false);
    }
  };

  const [activeTab, setActiveTab] = useState('card'); // 'card' or 'reference'
  const [expiryHours, setExpiryHours] = useState('24');

  const handleCreateLink = async () => {
    if (!selectedBookingId) {
      toast.error(isRTL ? 'اختر حجزاً' : 'Select a booking');
      return;
    }
    
    setCreating(true);
    setError(null);
    setResult(null);

    try {
      let res;
      
      if (activeTab === 'card') {
        if (!returnUrl.trim()) {
          toast.error(isRTL ? 'أدخل رابط الإرجاع' : 'Enter return URL');
          setCreating(false);
          return;
        }
        res = await paymentAPI.createFawryCheckoutLink({
          bookingId: selectedBookingId,
          returnUrl: returnUrl.trim(),
          language: checkoutLanguage,
          paymentMethod: 'CARD'
        });
      } else {
        // PayAtFawry (Reference Number)
        res = await paymentAPI.createFawryReferenceNumber({
          bookingId: selectedBookingId,
          expiryHours: parseInt(expiryHours),
          language: checkoutLanguage
        });
      }

      const data = res.data ?? res;
      setResult({ ...data, type: activeTab });
      if (data?.merchantRefNum) setStatusRef(data.merchantRefNum);
      
      const successMsg = activeTab === 'card' 
        ? (isRTL ? 'تم إنشاء رابط الدفع' : 'Checkout link created')
        : (isRTL ? 'تم إنشاء رقم المرجع' : 'Reference number created');
      
      toast.success(successMsg);
    } catch (err) {
      const status = err.response?.status;
      const data = err.response?.data || {};
      const msg = data.message || data.data?.message || err.message;
      const fawryResp = data.data?.fawryResponse;
      if (status === 404) {
        const deployMsg = isRTL
          ? 'مسارات فوري غير موجودة على السيرفر (404). أعد نشر الـ Backend (shik-api) ثم حدّث الصفحة.'
          : 'Fawry routes not found (404). Redeploy the Backend (shik-api) then refresh.';
        setError(deployMsg);
        toast.error(deployMsg);
      } else {
        setError(fawryResp ? `${msg}\n${JSON.stringify(fawryResp)}` : msg);
        toast.error(msg);
      }
    } finally {
      setCreating(false);
    }
  };

  const handleCheckStatus = async () => {
    if (!statusRef.trim()) {
      toast.error(isRTL ? 'أدخل رقم المرجع' : 'Enter merchant reference');
      return;
    }
    setStatusLoading(true);
    setStatusResult(null);
    try {
      const res = await paymentAPI.getFawryPaymentStatus(statusRef.trim());
      setStatusResult(res.data ?? res);
      toast.success(isRTL ? 'تم جلب الحالة' : 'Status loaded');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.data?.message || err.message;
      toast.error(msg);
    } finally {
      setStatusLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <section className={cn('min-w-0', isRTL && 'text-right')}>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          {isRTL ? 'تجربة بوابة فوري للدفع' : 'Fawry payment gateway test'}
        </h1>
        <p className="mt-2 max-w-2xl text-base text-gray-600 dark:text-gray-400">
          {isRTL
            ? 'صفحة مؤقتة لتجربة خيارات الدفع والتحقق من الحالة. يمكن حذفها لاحقاً.'
            : 'Temporary page to test payment options and status. You can remove it later.'}
        </p>
        {fawryAvailable === false && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/30 p-4">
            <FiAlertCircle className="size-5 shrink-0 text-amber-600 dark:text-amber-400 mt0.5" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-200">
                {isRTL ? 'بوابة فوري غير متاحة على السيرفر (404)' : 'Fawry gateway not available on server (404)'}
              </p>
              <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                {isRTL
                  ? 'الـ API المنشور لا يتضمن مسارات فوري. أعد نشر مشروع الـ Backend (shik-api) على السيرفر الذي يشغّل back.rattelapp.com ثم حدّث هذه الصفحة.'
                  : 'The deployed API does not include Fawry routes. Redeploy the Backend (shik-api) on the server that hosts back.rattelapp.com, then refresh this page.'}
              </p>
            </div>
          </div>
        )}
        {fawryAvailable === true && !fawryConfigured && (
          <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
            {isRTL ? 'فوري مضبوطة على السيرفر لكن FAWRY_MERCHANT_CODE أو FAWRY_SECURE_KEY غير معرّفة. أضفها في .env على السيرفر.' : 'Fawry routes are live but FAWRY_MERCHANT_CODE / FAWRY_SECURE_KEY are not set. Add them in .env on the server.'}
          </p>
        )}
      </section>

      {/* Tabs */}
      <div className="flex gap-2 rounded-xl bg-gray-100 dark:bg-gray-800 p-1">
        <button
          onClick={() => { setActiveTab('card'); setResult(null); setError(null); }}
          className={cn(
            "flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
            activeTab === 'card' 
              ? "bg-white text-emerald-600 shadow-sm dark:bg-gray-700 dark:text-emerald-400" 
              : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
          )}
        >
          {isRTL ? 'دفع بالبطاقة' : 'Card Payment'} 💳
        </button>
        <button
          onClick={() => { setActiveTab('reference'); setResult(null); setError(null); }}
          className={cn(
            "flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
            activeTab === 'reference' 
              ? "bg-white text-emerald-600 shadow-sm dark:bg-gray-700 dark:text-emerald-400" 
              : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
          )}
        >
          {isRTL ? 'دفع فوري (رقم مرجعي)' : 'PayAtFawry (Reference)'} 💵
        </button>
      </div>

      {/* Create Payment Section */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FiCreditCard className="size-5 text-emerald-600" />
            {activeTab === 'card' 
              ? (isRTL ? 'إنشاء رابط دفع بالبطاقة' : 'Create Card Payment Link')
              : (isRTL ? 'إنشاء رقم مرجعي لفوري' : 'Generate Fawry Reference Number')}
          </h2>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {isRTL ? 'الحجز (بحالة مؤكد)' : 'Booking (CONFIRMED)'}
            </label>
            <select
              value={selectedBookingId}
              onChange={(e) => setSelectedBookingId(e.target.value)}
              disabled={loadingBookings}
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5"
            >
              <option value="">{loadingBookings ? (isRTL ? 'جاري التحميل...' : 'Loading...') : (isRTL ? 'اختر حجزاً' : 'Select booking')}</option>
              {bookings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.id.slice(0, 8)}… {b.totalPrice} {b.currency || 'EGP'} {b.student?.firstName ? `- ${b.student.firstName}` : ''}
                </option>
              ))}
            </select>
          </div>

          {activeTab === 'card' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {isRTL ? 'رابط الإرجاع بعد الدفع' : 'Return URL after payment'}
              </label>
              <input
                type="url"
                value={returnUrl}
                onChange={(e) => setReturnUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5"
              />
            </div>
          )}

          {activeTab === 'reference' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {isRTL ? 'مدة الصلاحية (بالساعات)' : 'Expiry Hours'}
              </label>
              <input
                type="number"
                value={expiryHours}
                onChange={(e) => setExpiryHours(e.target.value)}
                placeholder="24"
                className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {isRTL ? 'اللغة' : 'Language'}
            </label>
            <select
              value={checkoutLanguage}
              onChange={(e) => setCheckoutLanguage(e.target.value)}
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5"
            >
              <option value="ar-eg">العربية</option>
              <option value="en-gb">English</option>
            </select>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-4 py-3">
              <FiAlertCircle className="size-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {result && !error && (
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-4 space-y-3">
              {result.type === 'card' && result.paymentUrl && (
                <>
                  <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                    {isRTL ? 'تم إنشاء الرابط. افتحه للتجربة:' : 'Link created. Open to test:'}
                  </p>
                  <a
                    href={result.paymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 font-medium"
                  >
                    <FiExternalLink className="size-4" />
                    {isRTL ? 'افتح صفحة الدفع' : 'Open payment page'}
                  </a>
                </>
              )}

              {result.type === 'reference' && result.referenceNumber && (
                <>
                  <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                    {isRTL ? 'تم إنشاء الرقم المرجعي بنجاح:' : 'Reference number created successfully:'}
                  </p>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-emerald-100 dark:border-emerald-900/50">
                    <p className="text-xs text-gray-500 mb-1">{isRTL ? 'رقم مرجعي فوري' : 'Fawry Pay Reference'}</p>
                    <p className="text-3xl font-bold text-emerald-600 font-mono tracking-wider">{result.referenceNumber}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/50">
                      <p className="text-xs text-gray-500">{isRTL ? 'المبلغ' : 'Amount'}</p>
                      <p className="font-semibold">{result.amount} {result.currency}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/50">
                      <p className="text-xs text-gray-500">{isRTL ? 'ينتهي في' : 'Expires At'}</p>
                      <p className="font-semibold text-sm">{new Date(result.expiresAt).toLocaleString(isRTL ? 'ar-EG' : 'en-US')}</p>
                    </div>
                  </div>
                  {result.instructions && (
                    <div className="bg-amber-50 dark:bg-amber-900/10 p-3 rounded-lg border border-amber-100 dark:border-amber-900/30 text-sm text-amber-800 dark:text-amber-200">
                      <p>{isRTL ? result.instructions.ar : result.instructions.en}</p>
                    </div>
                  )}
                </>
              )}

              <p className="text-xs text-gray-600 dark:text-gray-400 break-all pt-2 border-t border-emerald-200 dark:border-emerald-800/50">
                merchantRefNum: {result.merchantRefNum}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={handleCreateLink}
            disabled={creating || !selectedBookingId}
            className={cn(
              'inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:pointer-events-none text-white px-5 py-2.5 font-medium transition-all w-full justify-center',
              isRTL && 'flex-row-reverse'
            )}
          >
            <FiRefreshCw className={cn('size-4', creating && 'animate-spin')} />
            {creating 
              ? (isRTL ? 'جاري التنفيذ...' : 'Processing...') 
              : activeTab === 'card' 
                ? (isRTL ? 'إنشاء رابط الدفع' : 'Create Payment Link')
                : (isRTL ? 'إنشاء رقم مرجعي' : 'Generate Reference Number')
            }
          </button>
        </div>
      </div>

      {/* Check payment status */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FiCheckCircle className="size-5 text-blue-600" />
            {isRTL ? 'التحقق من حالة الدفع' : 'Check payment status'}
          </h2>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {isRTL ? 'رقم المرجع (merchantRefNum)' : 'Merchant reference (merchantRefNum)'}
            </label>
            <input
              type="text"
              value={statusRef}
              onChange={(e) => setStatusRef(e.target.value)}
              placeholder="UUID or ref from checkout"
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5"
            />
          </div>
          <button
            type="button"
            onClick={handleCheckStatus}
            disabled={statusLoading || !statusRef.trim()}
            className={cn(
              'inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none text-white px-5 py-2.5 font-medium',
              isRTL && 'flex-row-reverse'
            )}
          >
            <FiRefreshCw className={cn('size-4', statusLoading && 'animate-spin')} />
            {statusLoading ? (isRTL ? 'جاري التحقق...' : 'Checking...') : (isRTL ? 'تحقق من الحالة' : 'Check status')}
          </button>
          {statusResult && (
            <pre className="rounded-xl bg-gray-100 dark:bg-gray-900 p-4 text-sm overflow-auto">
              {JSON.stringify(statusResult, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};

export default FawryTest;
