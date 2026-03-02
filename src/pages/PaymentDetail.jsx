import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { paymentAPI, adminAPI } from '../services/api';
import {
  FiArrowLeft,
  FiDollarSign,
  FiUser,
  FiCalendar,
  FiCreditCard,
  FiRefreshCw,
  FiBook,
  FiPackage,
  FiClipboard,
} from 'react-icons/fi';
import { useCurrency } from '../context/CurrencyContext';
import { cn } from '../lib/utils';

const PaymentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const { formatCurrency } = useCurrency();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayment();
  }, [id]);

  const fetchPayment = async () => {
    setLoading(true);
    try {
      const response = await paymentAPI.getPaymentByBooking(id);
      setPayment(response.data);
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error('Failed to fetch payment:', error);
      }
      try {
        const adminResponse = await adminAPI.getPaymentById(id);
        setPayment(adminResponse.data);
      } catch (e) {
        if (e.response?.status !== 404) {
          console.error('Failed to fetch payment by id:', e);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: 'bg-amber-50 text-amber-800 ring-1 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-200',
      COMPLETED: 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200',
      FAILED: 'bg-red-50 text-red-800 ring-1 ring-red-200 dark:bg-red-900/30 dark:text-red-200',
      REFUNDED: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200 dark:bg-slate-700 dark:text-slate-200',
    };
    return badges[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  const getStatusLabel = (status) => {
    const key = status ? `payments.status${status.charAt(0) + status.slice(1).toLowerCase()}` : '';
    return key && t(key) !== key ? t(key) : status || '—';
  };

  const getPaymentMethodLabel = (method) => {
    if (!method) return '—';
    const upper = (method || '').toUpperCase();
    if (upper === 'FAWRY') return t('payments.methodFawry');
    if (upper === 'PAYATFAWRY' || upper === 'PAY_AT_FAWRY') return t('payments.methodPayAtFawry');
    if (upper === 'CARD' || upper === 'STRIPE') return upper === 'STRIPE' ? t('payments.methodStripe') : t('payments.methodCard');
    return method;
  };

  const getPaymentTypeLabel = (type) => {
    if (!type) return '—';
    const key = `payments.type${type.charAt(0) + type.slice(1).toLowerCase()}`;
    return t(key) !== key ? t(key) : type;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="py-12 text-center" dir={isRTL ? 'rtl' : 'ltr'}>
        <p className="text-gray-500 dark:text-gray-400">{t('payments.paymentNotFound')}</p>
        <button
          onClick={() => navigate('/payments')}
          className="mt-4 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
        >
          {t('payments.backToPayments')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in" dir={isRTL ? 'rtl' : 'ltr'} style={{ minWidth: 0 }}>
      {/* Header */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className={cn('flex min-w-0 items-center gap-4', isRTL && 'sm:flex-row-reverse')}>
          <button
            onClick={() => navigate('/payments')}
            className="p-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            aria-label={t('payments.backToPayments')}
          >
            <FiArrowLeft className="text-xl" />
          </button>
          <div className={cn('min-w-0', isRTL && 'text-right')}>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              {t('payments.detailTitle')}
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">{t('payments.detailSubtitle')}</p>
          </div>
        </div>
        <span className={cn('inline-flex shrink-0 px-4 py-2 text-sm font-semibold rounded-xl', getStatusBadge(payment.status))}>
          {getStatusLabel(payment.status)}
        </span>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main */}
        <div className="space-y-6 lg:col-span-2">
          {/* Payment Information */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
            <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FiDollarSign className={cn('size-5', isRTL ? 'ml-2' : 'mr-2')} />
                {t('payments.paymentInfo')}
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                    {t('payments.amount')}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(payment.amount ?? 0)} {payment.currency ? ` ${payment.currency}` : ''}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                    {t('common.status')}
                  </p>
                  <span className={cn('inline-flex px-3 py-1.5 text-sm font-semibold rounded-lg', getStatusBadge(payment.status))}>
                    {getStatusLabel(payment.status)}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
                    <FiCreditCard className="size-4" />
                    {t('payments.paymentMethod')}
                  </p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {getPaymentMethodLabel(payment.paymentMethod)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
                    <FiCalendar className="size-4" />
                    {t('payments.paymentDate')}
                  </p>
                  <p className="text-gray-900 dark:text-white font-medium">{formatDate(payment.createdAt)}</p>
                </div>
                {(payment.fawryRefNumber || payment.merchantRefNum) && (
                  <>
                    {payment.fawryRefNumber && (
                      <div className="sm:col-span-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                          {t('payments.fawryRef')}
                        </p>
                        <p className="text-sm font-mono text-gray-900 dark:text-gray-100 break-all">
                          {payment.fawryRefNumber}
                        </p>
                      </div>
                    )}
                    {payment.merchantRefNum && (
                      <div className="sm:col-span-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                          {t('payments.merchantRef')}
                        </p>
                        <p className="text-sm font-mono text-gray-900 dark:text-gray-100 break-all">
                          {payment.merchantRefNum}
                        </p>
                      </div>
                    )}
                  </>
                )}
                {payment.updatedAt && payment.updatedAt !== payment.createdAt && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                      {t('payments.lastUpdated')}
                    </p>
                    <p className="text-gray-900 dark:text-white font-medium">{formatDate(payment.updatedAt)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Related: Booking / Subscription / Course */}
          {(payment.booking || payment.subscription || payment.course) && (
            <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
              <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {payment.booking && t('payments.relatedBooking')}
                  {payment.subscription && t('payments.relatedSubscription')}
                  {payment.course && t('payments.relatedCourse')}
                </h2>
              </div>
              <div className="p-6">
                {payment.booking && (
                  <button
                    type="button"
                    onClick={() => navigate(`/bookings/${payment.booking.id}`)}
                    className="w-full text-start p-4 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center gap-4"
                  >
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                      <FiClipboard className="size-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {getPaymentTypeLabel('BOOKING')} #{payment.booking.id?.slice(0, 8)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {formatDate(payment.booking.date || payment.booking.startTime)}
                      </p>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">
                        {formatCurrency(payment.booking.totalPrice ?? payment.booking.price ?? 0)}
                      </p>
                    </div>
                    <span className={cn('shrink-0 text-sm font-medium text-primary-600 dark:text-primary-400', isRTL ? 'ml-2' : 'mr-2')}>
                      {t('payments.viewBooking')} →
                    </span>
                  </button>
                )}
                {payment.subscription && (
                  <button
                    type="button"
                    onClick={() => navigate('/subscriptions')}
                    className="w-full text-start p-4 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center gap-4"
                  >
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                      <FiPackage className="size-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {payment.subscription.package?.name || getPaymentTypeLabel('SUBSCRIPTION')}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        ID: {payment.subscription.id?.slice(0, 8)}…
                      </p>
                    </div>
                    <span className={cn('shrink-0 text-sm font-medium text-primary-600 dark:text-primary-400', isRTL ? 'ml-2' : 'mr-2')}>
                      {t('payments.viewSubscription')} →
                    </span>
                  </button>
                )}
                {payment.course && (
                  <button
                    type="button"
                    onClick={() => navigate(`/courses/${payment.course.id}`)}
                    className="w-full text-start p-4 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center gap-4"
                  >
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                      <FiBook className="size-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {payment.course.title}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {getPaymentTypeLabel('COURSE')}
                      </p>
                    </div>
                    <span className={cn('shrink-0 text-sm font-medium text-primary-600 dark:text-primary-400', isRTL ? 'ml-2' : 'mr-2')}>
                      {t('payments.viewCourse')} →
                    </span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* User */}
          {payment.user && (
            <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
              <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <FiUser className={cn('size-5', isRTL ? 'ml-2' : 'mr-2')} />
                  {t('payments.userInfo')}
                </h2>
              </div>
              <div className="p-6">
                <button
                  type="button"
                  onClick={() => payment.user?.id && navigate(`/users/${payment.user.id}`)}
                  className="w-full text-start p-4 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center gap-4"
                >
                  {payment.user.avatar ? (
                    <img
                      src={payment.user.avatar}
                      alt=""
                      className="size-14 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                    />
                  ) : (
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30 border-2 border-gray-200 dark:border-gray-600">
                      <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                        {(payment.user.firstName || payment.user.name || payment.user.email || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {[payment.user.firstName, payment.user.lastName].filter(Boolean).join(' ') || payment.user.name || payment.user.email}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{payment.user.email}</p>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="overflow-hidden rounded-2xl border border-primary-200 dark:border-primary-800 bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg p-6 text-white">
            <h3 className="text-lg font-semibold mb-4">{t('payments.paymentSummary')}</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-white/20 pb-3">
                <span className="text-primary-100">{t('payments.amount')}</span>
                <span className="text-2xl font-bold">{formatCurrency(payment.amount ?? 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-primary-100">{t('payments.paymentMethod')}</span>
                <span className="font-semibold">{getPaymentMethodLabel(payment.paymentMethod)}</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-white/20">
                <span className="text-primary-100">{t('payments.transactionId')}</span>
                <span className="text-xs font-mono truncate max-w-[120px]" title={payment.id}>
                  {payment.id?.slice(0, 8)}…
                </span>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('payments.quickActions')}</h3>
            <div className="space-y-2">
              {payment.status === 'COMPLETED' && (
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-blue-200 dark:border-blue-800 px-4 py-3 font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  <FiRefreshCw className="size-4" />
                  {t('payments.processRefund')}
                </button>
              )}
              {payment.booking && (
                <button
                  type="button"
                  onClick={() => navigate(`/bookings/${payment.booking.id}`)}
                  className={cn('w-full flex items-center justify-center gap-2 rounded-xl border border-primary-200 dark:border-primary-700 px-4 py-3 font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors', isRTL && 'flex-row-reverse')}
                >
                  <FiClipboard className="size-4" />
                  {t('payments.viewBooking')}
                </button>
              )}
              {payment.course && (
                <button
                  type="button"
                  onClick={() => navigate(`/courses/${payment.course.id}`)}
                  className={cn('w-full flex items-center justify-center gap-2 rounded-xl border border-primary-200 dark:border-primary-700 px-4 py-3 font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors', isRTL && 'flex-row-reverse')}
                >
                  <FiBook className="size-4" />
                  {t('payments.viewCourse')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetail;
