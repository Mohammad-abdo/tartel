import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { bookingAPI, adminAPI } from '../services/api';
import {
  FiArrowLeft,
  FiCalendar,
  FiUser,
  FiDollarSign,
  FiClock,
  FiEdit,
  FiCheckCircle,
  FiXCircle,
  FiMail,
  FiPhone,
  FiVideo,
  FiMessageSquare,
} from 'react-icons/fi';
import { cn } from '../lib/utils';

const BookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const locale = language === 'ar' ? 'ar-SA' : 'en-US';
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    setLoading(true);
    try {
      const response = await bookingAPI.getBookingById(id);
      setBooking(response.data);
    } catch (error) {
      console.error('Failed to fetch booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200',
      CONFIRMED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
      CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200',
      COMPLETED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
      REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200',
    };
    return badges[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  const getStatusLabel = (status) => {
    const labels = {
      PENDING: t('bookings.statusPending'),
      CONFIRMED: t('bookings.statusConfirmed'),
      CANCELLED: t('bookings.statusCancelled'),
      COMPLETED: t('bookings.statusCompleted'),
      REJECTED: t('bookings.statusRejected'),
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" aria-hidden />
        <span className="sr-only">{t('common.loading')}</span>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className={cn('text-center py-12', isRTL && 'text-right')} dir={isRTL ? 'rtl' : 'ltr'}>
        <p className="text-gray-500 dark:text-gray-400">{t('bookings.notFound')}</p>
        <button
          onClick={() => navigate('/bookings')}
          className="mt-4 text-primary-600 hover:text-primary-700 dark:text-primary-400"
        >
          {t('bookings.backToBookings')}
        </button>
      </div>
    );
  }

  return (
    <div className={cn(isRTL && 'text-right')} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/bookings')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <FiArrowLeft className="text-xl text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">{t('bookings.bookingDetails')}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{t('bookings.detailsSubtitle')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-4 py-2 text-sm font-semibold rounded-lg ${getStatusBadge(booking.status)}`}
          >
            {getStatusLabel(booking.status)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Booking Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <FiCalendar />
              {t('bookings.bookingInfo')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block flex items-center gap-2">
                  <FiCalendar />
                  {t('bookings.bookingDate')}
                </label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {new Date(booking.date || booking.startTime).toLocaleDateString(locale, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block flex items-center gap-2">
                  <FiClock />
                  {t('bookings.startTime')}
                </label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {booking.startTime
                    ? new Date(booking.startTime).toLocaleTimeString(locale, {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : booking.startTime || t('bookings.notSpecified')}
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block flex items-center gap-2">
                  <FiClock />
                  {t('bookings.duration')}
                </label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {booking.duration ? `${booking.duration} ${t('bookings.hours')}` : t('bookings.notSpecified')}
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
                  {t('bookings.bookingId')}
                </label>
                <p className="text-sm font-mono text-gray-600 dark:text-gray-400">{booking.id}</p>
              </div>
              {booking.notes && (
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block flex items-center gap-2">
                    <FiMessageSquare />
                    {t('bookings.notes')}
                  </label>
                  <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">{booking.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Pricing Information */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl shadow-sm p-6 border border-green-200 dark:border-green-800">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FiDollarSign />
              {t('bookings.pricingDetails')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {booking.price && (
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">{t('bookings.basePrice')}</label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    ${booking.price.toFixed(2)}
                  </p>
                </div>
              )}
              {booking.discount > 0 && (
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">{t('bookings.discount')}</label>
                  <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                    -${booking.discount.toFixed(2)}
                  </p>
                </div>
              )}
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">{t('bookings.totalPrice')}</label>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${(booking.totalPrice || booking.price || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Participants */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">{t('bookings.participants')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Student Card */}
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:border-primary-300 dark:hover:border-primary-500 transition-colors cursor-pointer"
                onClick={() => booking.student?.id && navigate(`/users/${booking.student.id}`)}>
                <div className="flex items-center gap-4 mb-4">
                  {booking.student?.avatar ? (
                    <img
                      src={booking.student.avatar}
                      alt={booking.student.firstName}
                      className="h-16 w-16 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center border-2 border-gray-200 dark:border-gray-600">
                      <span className="text-blue-600 dark:text-blue-400 text-xl font-bold">
                        {booking.student?.firstName?.charAt(0) || 'S'}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {booking.student?.firstName} {booking.student?.lastName}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('bookings.student')}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <FiMail className="text-gray-400" />
                    {booking.student?.email}
                  </div>
                  {booking.student?.id && (
                    <p className="text-xs text-gray-400 font-mono">ID: {booking.student.id.slice(0, 8)}...</p>
                  )}
                </div>
              </div>

              {/* Teacher Card */}
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:border-green-300 dark:hover:border-green-500 transition-colors cursor-pointer"
                onClick={() => booking.teacher?.id && navigate(`/teachers/${booking.teacher.id}`)}>
                <div className="flex items-center gap-4 mb-4">
                  {booking.teacher?.user?.avatar ? (
                    <img
                      src={booking.teacher.user.avatar}
                      alt={booking.teacher.user.firstName}
                      className="h-16 w-16 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center border-2 border-gray-200 dark:border-gray-600">
                      <span className="text-green-600 dark:text-green-400 text-xl font-bold">
                        {booking.teacher?.user?.firstName?.charAt(0) || 'T'}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {booking.teacher?.user?.firstName} {booking.teacher?.user?.lastName}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('bookings.teacher')}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <FiMail className="text-gray-400" />
                    {booking.teacher?.user?.email}
                  </div>
                  {booking.teacher?.specialization && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {booking.teacher.specialization}
                    </p>
                  )}
                  {booking.teacher?.id && (
                    <p className="text-xs text-gray-400 font-mono">ID: {booking.teacher.id.slice(0, 8)}...</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          {booking.payment && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FiDollarSign />
                {t('bookings.paymentInfo')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
                    {t('bookings.amountPaid')}
                  </label>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    ${(booking.payment.amount / 100).toFixed(2)}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
                    {t('bookings.paymentStatus')}
                  </label>
                  <span
                    className={`px-3 py-2 inline-flex text-sm font-semibold rounded-lg ${getStatusBadge(booking.payment.status)}`}
                  >
                    {booking.payment.status === 'COMPLETED' ? t('bookings.statusCompleted') : booking.payment.status === 'PENDING' ? t('bookings.statusPending') : booking.payment.status}
                  </span>
                </div>
                {booking.payment.stripePaymentIntentId && (
                  <div className="md:col-span-2">
                    <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
                      {t('bookings.stripePaymentIntentId')}
                    </label>
                    <p className="text-sm font-mono text-gray-600 dark:text-gray-400">
                      {booking.payment.stripePaymentIntentId}
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
                    {t('bookings.paymentDate')}
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {new Date(booking.payment.createdAt).toLocaleString(locale)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Session Information */}
          {booking.session && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FiVideo />
                {t('bookings.sessionInfo')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
                    {t('bookings.sessionStatus')}
                  </label>
                  <span
                    className={`px-3 py-2 inline-flex text-sm font-semibold rounded-lg ${getStatusBadge(booking.session.status)}`}
                  >
                    {booking.session.status === 'COMPLETED' ? t('bookings.statusCompleted') : booking.session.status === 'PENDING' ? t('bookings.statusPending') : booking.session.status}
                  </span>
                </div>
                {booking.session.startTime && (
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
                      {t('bookings.startedAt')}
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {new Date(booking.session.startTime).toLocaleString(locale)}
                    </p>
                  </div>
                )}
                {booking.session.endTime && (
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide mb-2 block">
                      {t('bookings.endedAt')}
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {new Date(booking.session.endTime).toLocaleString(locale)}
                    </p>
                  </div>
                )}
                {booking.session.durationMinutes && (
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
                      {t('bookings.durationMinutes')}
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {booking.session.durationMinutes} {t('bookings.minutes')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('bookings.quickActions')}</h3>
            <div className="space-y-2">
              {booking.status === 'PENDING' && (
                <>
                  <button
                    onClick={() => {
                      adminAPI.forceConfirmBooking(id).then(() => fetchBooking());
                    }}
                    className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    <FiCheckCircle />
                    {t('bookings.confirmBooking')}
                  </button>
                  <button
                    onClick={() => {
                      adminAPI.forceCancelBooking(id).then(() => fetchBooking());
                    }}
                    className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    <FiXCircle />
                    {t('bookings.cancelBooking')}
                  </button>
                </>
              )}
              <button className="w-full px-4 py-3 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors flex items-center justify-center gap-2 border border-primary-200 dark:border-primary-700 font-medium">
                <FiEdit />
                {t('bookings.editBooking')}
              </button>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-xl shadow-sm p-6 border border-primary-200 dark:border-primary-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('bookings.bookingSummary')}</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{t('bookings.bookingId')}</span>
                <span className="text-sm font-mono text-gray-900 dark:text-white">{booking.id.slice(0, 8)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{t('bookings.created')}</span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {new Date(booking.createdAt).toLocaleDateString(locale)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{t('common.status')}</span>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded ${getStatusBadge(booking.status)}`}
                >
                  {getStatusLabel(booking.status)}
                </span>
              </div>
              <div className="pt-3 border-t border-primary-200 dark:border-primary-700">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{t('bookings.totalAmount')}</span>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    ${(booking.totalPrice || booking.price || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetail;
