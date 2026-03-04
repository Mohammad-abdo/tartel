import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { bookingAPI, adminAPI, videoAPI } from '../services/api';
import { toast } from 'react-toastify';
import {
  FiArrowLeft,
  FiCalendar,
  FiUser,
  FiDollarSign,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiMail,
  FiPhone,
  FiVideo,
  FiMessageSquare,
  FiPackage,
  FiList,
  FiEdit,
  FiFileText,
  FiBook,
} from 'react-icons/fi';
import { cn } from '../lib/utils';
import { useCurrency } from '../context/CurrencyContext';

function formatDate(d, locale = 'en-US') {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return '—';
  }
}

const TABS = [
  { id: 'overview', labelKey: 'bookings.tabOverview', labelAr: 'نظرة عامة', icon: FiList },
  { id: 'session', labelKey: 'bookings.tabSession', labelAr: 'تفاصيل الجلسة', icon: FiVideo },
  { id: 'history', labelKey: 'bookings.tabHistory', labelAr: 'السجل', icon: FiCalendar },
];

const BookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { formatCurrency } = useCurrency();
  const isRTL = language === 'ar';
  const locale = language === 'ar' ? 'ar-SA' : 'en-US';
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const [editSlot, setEditSlot] = useState(null);
  const [editForm, setEditForm] = useState({ scheduledDate: '', startTime: '', endTime: '', status: '' });
  const [submittingEdit, setSubmittingEdit] = useState(false);

  const fetchBooking = async () => {
    setLoading(true);
    try {
      const response = await bookingAPI.getBookingDetails(id);
      const data = response?.data ?? response;
      setBooking(data);
    } catch (error) {
      console.error('Failed to fetch booking:', error);
      try {
        const fallback = await bookingAPI.getBookingById(id);
        setBooking(fallback?.data ?? fallback);
      } catch {
        setBooking(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchBooking();
  }, [id]);

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

  const primarySlot = booking?.bookingSessions?.find((bs) => bs.session);
  const primarySession = primarySlot?.session;

  if (loading && !booking) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" aria-hidden />
        <span className="sr-only">{t('common.loading')}</span>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className={cn('py-12 text-center', isRTL && 'text-right')} dir={isRTL ? 'rtl' : 'ltr'}>
        <p className="text-gray-500 dark:text-gray-400">{t('bookings.notFound')}</p>
        <button onClick={() => navigate('/bookings')} className="mt-4 text-primary-600 hover:text-primary-700 dark:text-primary-400">
          {t('bookings.backToBookings')}
        </button>
      </div>
    );
  }

  const studentName = [booking.student?.firstName, booking.student?.lastName].filter(Boolean).join(' ') || (isRTL ? [booking.student?.firstNameAr, booking.student?.lastNameAr].filter(Boolean).join(' ') : '') || '—';
  const teacherName = [booking.teacher?.user?.firstName, booking.teacher?.user?.lastName].filter(Boolean).join(' ') || (isRTL ? [booking.teacher?.user?.firstNameAr, booking.teacher?.user?.lastNameAr].filter(Boolean).join(' ') : '') || '—';

  return (
    <div className={cn(isRTL && 'text-right')} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/bookings')} className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700">
            <FiArrowLeft className="text-xl text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">{t('bookings.bookingDetails')}</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">{t('bookings.detailsSubtitle')}</p>
          </div>
        </div>
        <span className={cn('rounded-lg px-4 py-2 text-sm font-semibold', getStatusBadge(booking.status))}>{getStatusLabel(booking.status)}</span>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-800">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              activeTab === tab.id ? 'bg-white text-primary-600 shadow dark:bg-gray-700 dark:text-primary-400' : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            )}
          >
            <tab.icon className="h-4 w-4" />
            {isRTL ? tab.labelAr : t(tab.labelKey) || tab.labelAr}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Tab: Overview */}
          {activeTab === 'overview' && (
            <>
              {booking.subscription ? (
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white">
                    <FiPackage className="text-primary-600" />
                    {isRTL ? 'الباقة المشترك بها الطالب وتفاصيلها' : 'Package (student subscription) & details'}
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{isRTL ? 'اسم الباقة' : 'Package name'}</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{isRTL ? booking.subscription.packageNameAr || booking.subscription.packageName : booking.subscription.packageName || booking.subscription.packageNameAr}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{isRTL ? 'إجمالي الحصص' : 'Total sessions'}</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{booking.subscription.totalSessions ?? 0}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{isRTL ? 'المستخدم' : 'Used'}</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{booking.subscription.usedSessions ?? 0}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{isRTL ? 'المتبقي' : 'Remaining'}</p>
                      <p className="font-semibold text-emerald-600 dark:text-emerald-400">{booking.subscription.remainingSessions ?? 0}</p>
                    </div>
                  </div>
                  {(booking.subscription.availableSlots?.length > 0 || booking.subscription.bookedSlotsCount != null) && (
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{isRTL ? 'المواعيد المتاحة (جدول الشيخ)' : 'Available slots (teacher schedule)'}</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{booking.subscription.availableSlots?.length ?? 0} {isRTL ? 'فترة' : 'slots'}</p>
                        {booking.subscription.availableSlots?.length > 0 && (
                          <ul className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                            {booking.subscription.availableSlots.slice(0, 5).map((slot, idx) => (
                              <li key={idx}>{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][slot.dayOfWeek]} {slot.startTime}–{slot.endTime}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{isRTL ? 'المواعيد المحجوزة فعليًا' : 'Booked slots'}</p>
                        <p className="font-semibold text-emerald-600 dark:text-emerald-400">{booking.subscription.bookedSlotsCount ?? booking.scheduleReservations?.length ?? 0}</p>
                      </div>
                    </div>
                  )}
                  <div className="mt-4">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className="h-full rounded-full bg-primary-600 transition-all"
                        style={{
                          width: `${booking.subscription.totalSessions ? Math.min(100, (100 * (booking.subscription.usedSessions ?? 0)) / booking.subscription.totalSessions) : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <h2 className="mb-2 flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white">
                    <FiPackage className="text-primary-600" />
                    {isRTL ? 'الباقة المشترك بها الطالب' : 'Package'}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{isRTL ? 'لا يوجد اشتراك باقة نشط لهذا الطالب مع هذا الشيخ.' : 'No active package subscription for this student with this teacher.'}</p>
                </div>
              )}

              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white">
                  <FiUser className="text-primary-600" />
                  {isRTL ? 'الطالب' : 'Student'}
                </h2>
                <p className="font-semibold text-gray-900 dark:text-white">{studentName}</p>
                <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <FiMail className="h-4 w-4" />
                    {booking.student?.email || '—'}
                  </span>
                  {booking.student?.phone && (
                    <span className="flex items-center gap-1">
                      <FiPhone className="h-4 w-4" />
                      {booking.student.phone}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {isRTL ? 'عدد الحصص المكتملة مع هذا الشيخ' : 'Completed sessions with this teacher'}: <strong>{booking.totalSessionsWithTeacher ?? 0}</strong>
                </p>
                {booking.upcomingBookings?.length > 0 && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {isRTL ? 'مواعيد قادمة' : 'Upcoming'}: {booking.upcomingBookings.length}
                  </p>
                )}
              </div>

              {/* الأيام التي حجزها الطالب مع الشيخ */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white">
                  <FiCalendar className="text-primary-600" />
                  {isRTL ? 'الأيام التي حجزها الطالب مع الشيخ' : 'Days booked with teacher'}
                </h2>
                {booking.scheduleReservations?.length > 0 && (
                  <div className="mb-4">
                    <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{isRTL ? 'مواعيد محجوزة قادمة (من الباقة)' : 'Upcoming reserved slots'}</p>
                    <ul className="space-y-1.5">
                      {booking.scheduleReservations.slice(0, 15).map((r) => (
                        <li key={r.id} className="flex justify-between rounded bg-gray-50 px-3 py-2 text-sm dark:bg-gray-700">
                          <span>{new Date(r.reservationDate).toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          <span>{r.startTime} – {r.endTime}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {booking.upcomingBookings?.length > 0 && (
                  <div className="mb-4">
                    <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{isRTL ? 'حجوزات قادمة' : 'Upcoming bookings'}</p>
                    <ul className="space-y-1.5">
                      {booking.upcomingBookings.slice(0, 10).map((b) => (
                        <li key={b.id} className="flex justify-between rounded bg-gray-50 px-3 py-2 text-sm dark:bg-gray-700">
                          <span>{new Date(b.date).toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                          <span>{b.startTime || '—'}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {(() => {
                  const pastSlots = booking.pastSessions?.flatMap((b) => (b.bookingSessions || []).filter((bs) => bs.session?.endedAt).map((bs) => ({ ...bs, _b: b }))) || [];
                  return pastSlots.length > 0 && (
                    <div>
                      <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{isRTL ? 'جلسات منتهية' : 'Completed sessions'}</p>
                      <ul className="space-y-1.5">
                        {pastSlots.slice(0, 15).map((bs) => (
                          <li key={bs.id} className="flex justify-between rounded bg-emerald-50 px-3 py-2 text-sm dark:bg-emerald-900/20">
                            <span>{new Date(bs.scheduledDate).toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric' })} {bs.startTime}</span>
                            <span>{bs.session?.duration != null ? `${bs.session.duration} min` : ''}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })()}
                {(!booking.scheduleReservations?.length && !booking.upcomingBookings?.length && !booking.pastSessions?.length) && (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{isRTL ? 'لا توجد مواعيد أو جلسات مسجلة بعد.' : 'No booked days or sessions yet.'}</p>
                )}
              </div>

              {/* تقارير الجلسات */}
              {(primarySession?.report || booking.pastSessions?.some((b) => (b.bookingSessions || []).some((bs) => bs.session?.report))) && (
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white">
                    <FiFileText className="text-primary-600" />
                    {isRTL ? 'تقارير الجلسات' : 'Session reports'}
                  </h2>
                  <div className="space-y-4">
                    {primarySession?.report && (
                      <div className="rounded-lg border border-primary-200 bg-primary-50/50 p-4 dark:border-primary-700 dark:bg-primary-900/10">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{isRTL ? 'جلسة هذا الحجز' : 'This booking session'}</p>
                        <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{primarySession.report.content}</p>
                        {primarySession.report.rating != null && <p className="mt-2 text-sm font-medium">{isRTL ? 'التقييم' : 'Rating'}: {primarySession.report.rating}/5</p>}
                      </div>
                    )}
                    {booking.pastSessions?.flatMap((b) => (b.bookingSessions || []).filter((bs) => bs.session?.report).map((bs) => ({ bs, b }))).map(({ bs, b }) => (
                      <div key={bs.id} className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{new Date(bs.scheduledDate).toLocaleDateString(locale)} {bs.startTime}</p>
                        <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{bs.session.report.content}</p>
                        {bs.session.report.rating != null && <p className="mt-2 text-sm font-medium">{isRTL ? 'التقييم' : 'Rating'}: {bs.session.report.rating}/5</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* سجل الحفظ والمراجعة */}
              {(primarySession?.memorizations?.length > 0 || primarySession?.revisions?.length > 0 || booking.pastSessions?.some((b) => (b.bookingSessions || []).some((bs) => (bs.session?.memorizations?.length || bs.session?.revisions?.length)))) && (
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white">
                    <FiBook className="text-primary-600" />
                    {isRTL ? 'سجل الحفظ والمراجعة' : 'Memorization & revision log'}
                  </h2>
                  <div className="space-y-4">
                    {primarySession?.memorizations?.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{isRTL ? 'حفظ هذه الجلسة' : 'This session – memorization'}</p>
                        <ul className="space-y-1.5">
                          {primarySession.memorizations.map((m) => (
                            <li key={m.id} className="rounded bg-gray-50 px-3 py-2 text-sm dark:bg-gray-700">
                              {m.surahName}{m.surahNameAr ? ` (${m.surahNameAr})` : ''}
                              {m.isFullSurah ? ` — ${isRTL ? 'سورة كاملة' : 'Full surah'}` : m.fromAyah != null && m.toAyah != null ? ` — ${m.fromAyah}-${m.toAyah}` : ''}
                              {m.notes ? ` — ${m.notes}` : ''}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {primarySession?.revisions?.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{isRTL ? 'مراجعة هذه الجلسة' : 'This session – revision'}</p>
                        <ul className="space-y-1.5">
                          {primarySession.revisions.map((r) => (
                            <li key={r.id} className="rounded bg-gray-50 px-3 py-2 text-sm dark:bg-gray-700">
                              {r.revisionType} / {r.rangeType}
                              {r.fromSurah && r.toSurah && ` — ${r.fromSurah} → ${r.toSurah}`}
                              {r.fromJuz != null && r.toJuz != null && ` — Juz ${r.fromJuz}-${r.toJuz}`}
                              {r.notes ? ` — ${r.notes}` : ''}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {booking.pastSessions?.flatMap((b) => (b.bookingSessions || []).filter((bs) => bs.session?.memorizations?.length || bs.session?.revisions?.length).map((bs) => ({ bs, b }))).map(({ bs }) => (
                      <div key={bs.id} className="rounded-lg border border-gray-200 dark:border-gray-600 p-3">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">{new Date(bs.scheduledDate).toLocaleDateString(locale)} {bs.startTime}</p>
                        {bs.session?.memorizations?.length > 0 && (
                          <ul className="mb-2 space-y-1 text-sm">
                            {bs.session.memorizations.map((m) => (
                              <li key={m.id}>
                                {m.surahName}{m.surahNameAr ? ` (${m.surahNameAr})` : ''}
                                {m.isFullSurah ? ` — ${isRTL ? 'كاملة' : 'full'}` : m.fromAyah != null && m.toAyah != null ? ` ${m.fromAyah}-${m.toAyah}` : ''}
                              </li>
                            ))}
                          </ul>
                        )}
                        {bs.session?.revisions?.length > 0 && (
                          <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                            {bs.session.revisions.map((r) => (
                              <li key={r.id}>{r.revisionType} / {r.rangeType}{r.fromSurah && r.toSurah ? ` ${r.fromSurah}→${r.toSurah}` : ''}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white">
                  <FiCalendar />
                  {t('bookings.bookingInfo')}
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{t('bookings.bookingDate')}</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{new Date(booking.date || booking.startTime).toLocaleDateString(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{t('bookings.startTime')}</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{booking.startTime || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{t('bookings.duration')}</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{booking.duration ? `${booking.duration} min` : '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{t('bookings.totalAmount')}</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(booking.totalPrice || booking.price || 0)}</p>
                  </div>
                </div>
                {booking.notes && (
                  <div className="mt-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 flex items-center gap-1"><FiMessageSquare /> {t('bookings.notes')}</p>
                    <p className="mt-1 rounded-lg bg-gray-50 p-3 text-gray-700 dark:bg-gray-700 dark:text-gray-300">{booking.notes}</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Tab: Session */}
          {activeTab === 'session' && (
            <>
              {/* List of slots with Join per slot */}
              {booking.bookingSessions?.length > 0 && (
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 mb-6">
                  <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white">
                    <FiVideo />
                    {isRTL ? 'جلسات / حصص الحجز' : 'Sessions / lessons'}
                  </h2>
                  <ul className="space-y-3">
                    {booking.bookingSessions.map((bs) => (
                      <li key={bs.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-200 py-3 px-4 dark:border-gray-600">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {new Date(bs.scheduledDate).toLocaleDateString(locale)} {bs.startTime}
                          {bs.session?.roomId && <span className="ml-2 text-sm text-green-600 dark:text-green-400">({isRTL ? 'جلسة حية' : 'Live'})</span>}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={cn('rounded px-2 py-0.5 text-xs font-semibold', getStatusBadge(bs.status))}>{bs.status}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const d = new Date(bs.scheduledDate);
                              setEditForm({
                                scheduledDate: d.toISOString().slice(0, 10),
                                startTime: bs.startTime || '09:00',
                                endTime: bs.endTime || '11:00',
                                status: bs.status || 'PENDING',
                              });
                              setEditSlot(bs);
                            }}
                            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                            title={isRTL ? 'تعديل' : 'Edit'}
                          >
                            <FiEdit className="inline-block h-4 w-4" />
                          </button>
                          {bs.session?.id && (
                            <button
                              type="button"
                              onClick={() => navigate(`/sessions/${bs.session.id}/edit`)}
                              className="rounded-lg border border-primary-300 bg-primary-50 px-3 py-1.5 text-sm font-medium text-primary-700 hover:bg-primary-100 dark:border-primary-700 dark:bg-primary-900/30 dark:text-primary-200 dark:hover:bg-primary-900/50"
                            >
                              {isRTL ? 'بيانات الجلسة' : 'Session data'}
                            </button>
                          )}
                          {booking.status === 'CONFIRMED' && bs.status !== 'CANCELLED' && bs.status !== 'COMPLETED' && (
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  const res = await videoAPI.createSession(bs.id);
                                  const data = res?.data ?? res;
                                  if (data?.token && data?.appId) window.open(`https://meet.example.com/room?token=${encodeURIComponent(data.token)}&appId=${data.appId}&channel=${data.roomId}`, '_blank');
                                  else toast.info(isRTL ? 'تم إنشاء الجلسة' : 'Session created');
                                } catch (e) {
                                  toast.error(e.response?.data?.message || (isRTL ? 'فشل الانضمام' : 'Join failed'));
                                }
                              }}
                              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
                            >
                              {isRTL ? 'انضم' : 'Join'}
                            </button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                  {/* Edit session slot modal */}
                  {editSlot && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setEditSlot(null)}>
                      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800" onClick={(e) => e.stopPropagation()}>
                        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">{isRTL ? 'تعديل الحصة' : 'Edit session'}</h3>
                        <form
                          onSubmit={async (e) => {
                            e.preventDefault();
                            setSubmittingEdit(true);
                            try {
                              await bookingAPI.updateBookingSession(id, editSlot.id, {
                                scheduledDate: editForm.scheduledDate,
                                startTime: editForm.startTime,
                                endTime: editForm.endTime,
                                status: editForm.status,
                              });
                              toast.success(isRTL ? 'تم تحديث الحصة' : 'Session updated');
                              setEditSlot(null);
                              fetchBooking();
                            } catch (err) {
                              toast.error(err.response?.data?.message || (isRTL ? 'فشل التحديث' : 'Update failed'));
                            } finally {
                              setSubmittingEdit(false);
                            }
                          }}
                          className="space-y-4"
                        >
                          <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{isRTL ? 'التاريخ' : 'Date'}</label>
                            <input
                              type="date"
                              value={editForm.scheduledDate}
                              onChange={(e) => setEditForm((f) => ({ ...f, scheduledDate: e.target.value }))}
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                              required
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{isRTL ? 'وقت البداية' : 'Start time'}</label>
                              <input
                                type="time"
                                value={editForm.startTime}
                                onChange={(e) => setEditForm((f) => ({ ...f, startTime: e.target.value }))}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{isRTL ? 'وقت النهاية' : 'End time'}</label>
                              <input
                                type="time"
                                value={editForm.endTime}
                                onChange={(e) => setEditForm((f) => ({ ...f, endTime: e.target.value }))}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{isRTL ? 'الحالة' : 'Status'}</label>
                            <select
                              value={editForm.status}
                              onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            >
                              <option value="PENDING">PENDING</option>
                              <option value="CONFIRMED">CONFIRMED</option>
                              <option value="COMPLETED">COMPLETED</option>
                              <option value="CANCELLED">CANCELLED</option>
                            </select>
                          </div>
                          <div className="flex justify-end gap-2 pt-2">
                            <button type="button" onClick={() => setEditSlot(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 dark:border-gray-600 dark:text-gray-200">
                              {isRTL ? 'إلغاء' : 'Cancel'}
                            </button>
                            <button type="submit" disabled={submittingEdit} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50">
                              {submittingEdit ? (isRTL ? 'جاري الحفظ…' : 'Saving…') : (isRTL ? 'حفظ' : 'Save')}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {!primarySession && (!booking.bookingSessions?.length || booking.bookingSessions.every((bs) => !bs.session)) ? (
                <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">
                  <p className="text-gray-500 dark:text-gray-400">
                    {booking.status === 'CANCELLED' || booking.status === 'REJECTED'
                      ? (isRTL ? 'تم إلغاء هذا الحجز. لم تُعقد أي جلسات حية.' : 'This booking was cancelled. No live sessions took place.')
                      : (isRTL ? 'لا توجد جلسة حية مرتبطة بهذا الحجز بعد. استخدم "انضم" عند بدء الحصة.' : 'No live session linked yet. Use Join when the lesson starts.')}
                  </p>
                </div>
              ) : null}
            </>
          )}

          {/* Tab: History */}
          {activeTab === 'history' && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white">
                <FiCalendar />
                {isRTL ? 'الجلسات السابقة مع هذا الطالب' : 'Past sessions with this student'}
              </h2>
              {(() => {
                const pastSlots = booking.pastSessions?.flatMap((b) => (b.bookingSessions || []).filter((bs) => bs.session?.endedAt).map((bs) => ({ ...bs }))) || [];
                return !pastSlots.length ? (
                  <p className="text-gray-500 dark:text-gray-400">{isRTL ? 'لا توجد جلسات سابقة.' : 'No past sessions.'}</p>
                ) : (
                  <ul className="space-y-3">
                    {pastSlots.map((bs) => (
                      <li key={bs.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-200 py-3 px-4 dark:border-gray-600">
                        <span className="font-medium text-gray-900 dark:text-white">{new Date(bs.scheduledDate).toLocaleDateString(locale)} {bs.startTime}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{bs.session?.duration != null ? `${bs.session.duration} min` : ''}</span>
                      </li>
                    ))}
                  </ul>
                );
              })()}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">{t('bookings.quickActions')}</h3>
            <div className="space-y-2">
              {booking.status === 'PENDING' && (
                <>
                  <button
                    onClick={() => adminAPI.forceConfirmBooking(id).then(() => { toast.success(t('bookings.updated')); fetchBooking(); })}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 font-medium text-white transition-colors hover:bg-green-700"
                  >
                    <FiCheckCircle />
                    {t('bookings.confirmBooking')}
                  </button>
                  <button
                    onClick={() => adminAPI.forceCancelBooking(id).then(() => { toast.success(t('bookings.updated')); fetchBooking(); })}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 font-medium text-white transition-colors hover:bg-red-700"
                  >
                    <FiXCircle />
                    {t('bookings.cancelBooking')}
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-primary-200 bg-primary-50 p-6 dark:border-primary-800 dark:bg-primary-900/20">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">{t('bookings.bookingSummary')}</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">{t('bookings.bookingId')}</span>
                <span className="font-mono text-gray-900 dark:text-white">{booking.id.slice(0, 8)}…</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">{t('bookings.created')}</span>
                <span className="text-gray-900 dark:text-white">{new Date(booking.createdAt).toLocaleDateString(locale)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">{t('bookings.teacher')}</span>
                <span className="text-gray-900 dark:text-white">{teacherName}</span>
              </div>
              <div className="border-t border-primary-200 pt-3 dark:border-primary-700">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900 dark:text-white">{t('bookings.totalAmount')}</span>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(booking.totalPrice || booking.price || 0)}</span>
                </div>
              </div>
            </div>
          </div>

          {booking.payment && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">{t('bookings.paymentInfo')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('bookings.amountPaid')}: <strong className="text-gray-900 dark:text-white">{formatCurrency(Number(booking.payment.amount))}</strong></p>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{t('bookings.paymentStatus')}: <span className={cn('rounded px-2 py-0.5 text-xs font-semibold', getStatusBadge(booking.payment.status))}>{booking.payment.status}</span></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingDetail;
