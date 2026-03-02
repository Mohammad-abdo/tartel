import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { adminAPI, bookingAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FiCalendar, FiCheckCircle, FiXCircle, FiUser, FiEye, FiClock, FiDollarSign, FiGrid, FiList, FiStar } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';
import { cn } from '../lib/utils';
import { useCurrency } from '../context/CurrencyContext';

const Bookings = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { formatCurrency } = useCurrency();
  const navigate = useNavigate();
  const locale = language === 'ar' ? 'ar-SA' : 'en-US';
  const isRTL = language === 'ar';
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [sortByDate, setSortByDate] = useState('newest');
  const [viewMode, setViewMode] = useState('admin');
  const [viewLayout, setViewLayout] = useState('cards'); // 'cards' | 'table'
  const [schemaError, setSchemaError] = useState(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setSchemaError(null);
    try {
      if (viewMode === 'admin') {
        const params = { page, limit: 20, ...(statusFilter && { status: statusFilter }) };
        const response = await adminAPI.getBookings(params);
        const bookingsData = response.data.bookings || response.data.data || [];
        const totalPagesData = response.data.pagination?.totalPages || response.data.totalPages || 1;
        setBookings(Array.isArray(bookingsData) ? bookingsData : []);
        setTotalPages(totalPagesData);
      } else {
        const response = await bookingAPI.getMyBookings(statusFilter);
        const bookingsData = response.data.data || response.data || [];
        setBookings(Array.isArray(bookingsData) ? bookingsData : []);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      const msg = error.response?.data?.message || error.message;
      const detail = error.response?.data?.detail;
      const code = error.response?.data?.code;
      if (error.response?.status === 503 && (code === 'MIGRATION_NEEDED' || /schema|migration|database/i.test(msg || ''))) {
        setSchemaError(detail ? `${msg} — ${detail}` : msg);
        toast.error(detail ? `${msg} — ${detail}` : msg, { autoClose: 10000 });
      } else if (msg && error.response?.status >= 400) {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, viewMode]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleForceAction = async (id, action) => {
    try {
      if (action === 'cancel') await adminAPI.forceCancelBooking(id);
      else if (action === 'confirm') await adminAPI.forceConfirmBooking(id);
      toast.success(t('bookings.updated'));
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update');
    }
  };

  const stats = useMemo(() => {
    const total = bookings.length;
    const pending = bookings.filter((b) => b.status === 'PENDING').length;
    const confirmed = bookings.filter((b) => b.status === 'CONFIRMED').length;
    const completed = bookings.filter((b) => b.status === 'COMPLETED').length;
    const cancelled = bookings.filter((b) => b.status === 'CANCELLED').length;
    const featured = bookings.filter((b) => b.isFeatured).length;
    return { total, pending, confirmed, completed, cancelled, featured };
  }, [bookings]);

  const handleToggleFeatured = async (booking) => {
    try {
      await adminAPI.toggleBookingFeatured(booking.id, !booking.isFeatured);
      toast.success(booking.isFeatured ? 'تم إزالة التمييز' : 'تم تمييز الحجز');
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'فشل في تغيير حالة التمييز');
    }
  };

  const getBookingAmount = (booking) => {
    const raw = booking?.totalPrice ?? booking?.price ?? booking?.payment?.amount;
    const amount = Number(raw);
    return Number.isFinite(amount) ? amount : 0;
  };

  const getBookingTimestamp = useCallback((booking) => {
    const fallback = 0;
    if (!booking) return fallback;

    const bookingDate = booking.date ? new Date(booking.date) : null;
    if (!bookingDate || Number.isNaN(bookingDate.getTime())) {
      const startDateOnly = booking.startTime ? new Date(booking.startTime) : null;
      return startDateOnly && !Number.isNaN(startDateOnly.getTime()) ? startDateOnly.getTime() : fallback;
    }

    const startTime = typeof booking.startTime === 'string' ? booking.startTime.trim() : '';
    const timeMatch = startTime.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    if (timeMatch) {
      const [, hour, minute, second = '0'] = timeMatch;
      bookingDate.setHours(Number(hour), Number(minute), Number(second), 0);
    }

    return bookingDate.getTime();
  }, []);

  const sortedBookings = useMemo(() => {
    const ordered = [...bookings].sort((a, b) => getBookingTimestamp(b) - getBookingTimestamp(a));
    if (sortByDate === 'oldest') {
      ordered.reverse();
    }
    return ordered;
  }, [bookings, getBookingTimestamp, sortByDate]);

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: 'bg-amber-50 text-amber-800 ring-1 ring-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:ring-amber-800',
      CONFIRMED: 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:ring-emerald-800',
      CANCELLED: 'bg-red-50 text-red-800 ring-1 ring-red-200 dark:bg-red-900/20 dark:text-red-400 dark:ring-red-800',
      COMPLETED: 'bg-blue-100 text-blue-800 ring-1 ring-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:ring-blue-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  return (
    <div className="space-y-6 animate-fade-in islamic-container" style={{ fontFamily: 'Alexandria, sans-serif' }}>
      {/* Islamic Header */}
      <div className="text-center mb-6">
        <div className="islamic-border inline-block px-8 py-4 bg-gradient-to-r from-emerald-50 to-amber-50 dark:from-emerald-900/20 dark:to-amber-900/20 rounded-xl">
          <p className="text-emerald-700 dark:text-emerald-300 text-sm font-semibold mb-1 font-alexandria">
            {isRTL ? 'بسم الله الرحمن الرحيم' : 'In the name of Allah, the Most Gracious, the Most Merciful'}
          </p>
          <p className="text-amber-600 dark:text-amber-400 text-xs font-alexandria">
            {isRTL ? 'إدارة مواعيد تعلم القرآن الكريم' : 'Managing Quran Learning Appointments'}
          </p>
        </div>
      </div>

      {/* Page header */}
      <section className="islamic-border p-6 bg-gradient-to-r from-emerald-50 via-white to-amber-50 dark:from-emerald-900/20 dark:via-gray-800 dark:to-amber-900/20 rounded-xl shadow-lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
                <FiCalendar className="size-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-emerald-800 dark:text-emerald-200 sm:text-4xl font-alexandria">{t('bookings.title') || 'الحجوزات والمواعيد'}</h1>
                <p className="text-amber-700 dark:text-amber-300 text-sm font-alexandria">{isRTL ? 'جدولة مواعيد القرآن الكريم' : 'Quran Learning Schedule'}</p>
              </div>
            </div>
            <p className="max-w-2xl text-base text-emerald-700 dark:text-emerald-300 font-alexandria">{t('bookings.manageSubtitle') || 'إدارة حجوزات ومواعيد تعلم القرآن الكريم'}</p>
            <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
              <span className="font-alexandria">{isRTL ? 'واتقوا الله ويعلمكم الله' : 'And fear Allah, and Allah will teach you'}</span>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <div className="flex gap-1 islamic-border bg-gradient-to-r from-emerald-50 to-amber-50 dark:from-emerald-900/20 dark:to-amber-900/20 p-1 rounded-lg">
              <button type="button" onClick={() => { setViewMode('admin'); setPage(1); }} className={cn('islamic-button-secondary px-3 py-2 text-sm font-alexandria', viewMode === 'admin' && 'islamic-button-primary')}>
                {t('bookings.allBookings') || 'جميع الحجوزات'}
              </button>
              <button type="button" onClick={() => { setViewMode('user'); setPage(1); }} className={cn('islamic-button-secondary px-3 py-2 text-sm font-alexandria flex items-center gap-2', viewMode === 'user' && 'islamic-button-primary')}>
                <FiUser className="size-4" />
                {t('bookings.myBookings') || 'حجوزاتي'}
              </button>
            </div>
            <div className="flex gap-1 islamic-border bg-gradient-to-r from-emerald-50 to-amber-50 dark:from-emerald-900/20 dark:to-amber-900/20 p-1 rounded-lg" title={t('bookings.viewCards')}>
              <button type="button" onClick={() => setViewLayout('cards')} className={cn('islamic-button-secondary p-2', viewLayout === 'cards' && 'islamic-button-primary')}>
                <FiGrid className="size-4" />
              </button>
              <button type="button" onClick={() => setViewLayout('table')} className={cn('islamic-button-secondary p-2', viewLayout === 'table' && 'islamic-button-primary')} title={t('bookings.viewTable')}>
                <FiList className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {schemaError && (
        <div className="rounded-xl border-2 border-amber-300 bg-amber-50 dark:border-amber-600 dark:bg-amber-900/30 p-4 font-alexandria" role="alert">
          <p className="font-semibold text-amber-800 dark:text-amber-200">{isRTL ? 'قاعدة البيانات تحتاج تحديث' : 'Database schema update required'}</p>
          <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">{schemaError}</p>
          <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
            {isRTL ? 'في مجلد الـ backend نفّذ: npx prisma migrate deploy' : 'In the backend folder run: npx prisma migrate deploy'}
          </p>
        </div>
      )}

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <div className="islamic-card group hover:shadow-xl transition-all duration-300">
          <div className="islamic-border-gradient p-5 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 font-alexandria">{t('bookings.total') || 'الإجمالي'}</p>
                <p className="mt-2 text-3xl font-bold text-emerald-800 dark:text-emerald-200">{stats.total}</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-alexandria">{isRTL ? 'جميع الحجوزات' : 'All Bookings'}</p>
              </div>
              <div className="flex size-14 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FiCalendar className="size-6 text-white" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="islamic-card group hover:shadow-xl transition-all duration-300">
          <div className="islamic-border-gradient p-5 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300 font-alexandria">{t('dashboard.pending') || 'قيد الانتظار'}</p>
                <p className="mt-2 text-3xl font-bold text-amber-800 dark:text-amber-200">{stats.pending}</p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-alexandria">{isRTL ? 'تحتاج موافقة' : 'Needs Approval'}</p>
              </div>
              <div className="flex size-14 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FiClock className="size-6 text-white" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="islamic-card group hover:shadow-xl transition-all duration-300">
          <div className="islamic-border-gradient p-5 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-green-700 dark:text-green-300 font-alexandria">{t('dashboard.confirmed') || 'مؤكدة'}</p>
                <p className="mt-2 text-3xl font-bold text-green-800 dark:text-green-200">{stats.confirmed}</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-alexandria">{isRTL ? 'حجوزات مؤكدة' : 'Confirmed Bookings'}</p>
              </div>
              <div className="flex size-14 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FiCheckCircle className="size-6 text-white" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="islamic-card group hover:shadow-xl transition-all duration-300">
          <div className="islamic-border-gradient p-5 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300 font-alexandria">{t('dashboard.completed') || 'مكتملة'}</p>
                <p className="mt-2 text-3xl font-bold text-blue-800 dark:text-blue-200">{stats.completed}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-alexandria">{isRTL ? 'دروس مكتملة' : 'Completed Lessons'}</p>
              </div>
              <div className="flex size-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FiCheckCircle className="size-6 text-white" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="islamic-card group hover:shadow-xl transition-all duration-300">
          <div className="islamic-border-gradient p-5 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-red-700 dark:text-red-300 font-alexandria">{t('dashboard.cancelled') || 'ملغية'}</p>
                <p className="mt-2 text-3xl font-bold text-red-800 dark:text-red-200">{stats.cancelled}</p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-alexandria">{isRTL ? 'حجوزات ملغية' : 'Cancelled Bookings'}</p>
              </div>
              <div className="flex size-14 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FiXCircle className="size-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="islamic-card group hover:shadow-xl transition-all duration-300">
          <div className="islamic-border-gradient p-5 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-yellow-700 dark:text-yellow-300 font-alexandria">{isRTL ? 'مميزة' : 'Featured'}</p>
                <p className="mt-2 text-3xl font-bold text-yellow-800 dark:text-yellow-200">{stats.featured}</p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1 font-alexandria">{isRTL ? 'حجوزات مميزة' : 'Featured Bookings'}</p>
              </div>
              <div className="flex size-14 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FiStar className="size-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="h-10 min-w-[170px] rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500">
            <option value="">{t('users.allStatus')}</option>
            <option value="PENDING">{t('dashboard.pending')}</option>
            <option value="CONFIRMED">{t('dashboard.confirmed')}</option>
            <option value="CANCELLED">{t('dashboard.cancelled')}</option>
            <option value="COMPLETED">{t('dashboard.completed')}</option>
          </select>
          <select value={sortByDate} onChange={(e) => setSortByDate(e.target.value)} className="h-10 min-w-[220px] rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500">
            <option value="newest">{t('bookings.sortNewestFirst')}</option>
            <option value="oldest">{t('bookings.sortOldestFirst')}</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="size-12 animate-spin rounded-full border-2 border-orange-600 border-t-transparent" />
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{t('common.loading')}</p>
          </div>
        ) : sortedBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
              <FiCalendar className="size-12 text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">{t('bookings.empty')}</h2>
            <p className="mt-2 max-w-md text-center text-gray-500 dark:text-gray-400">{t('bookings.emptySubtitle')}</p>
          </div>
        ) : viewLayout === 'table' ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-700/50">
                  <tr>
                    <th className={cn('px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400', isRTL ? 'text-right' : 'text-left')}>{t('bookings.student')}</th>
                    <th className={cn('px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400', isRTL ? 'text-right' : 'text-left')}>{t('bookings.teacher')}</th>
                    <th className={cn('px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400', isRTL ? 'text-right' : 'text-left')}>{t('bookings.dateTime')}</th>
                    <th className={cn('px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400', isRTL ? 'text-right' : 'text-left')}>{t('common.status')}</th>
                    <th className={cn('px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400', isRTL ? 'text-right' : 'text-left')}>{t('bookings.totalPrice')}</th>
                    <th className={cn('px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400', isRTL ? 'text-left' : 'text-right')}>{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {sortedBookings.map((booking) => {
                    const studentName = booking.student?.firstName && booking.student?.lastName ? `${booking.student.firstName} ${booking.student.lastName}` : booking.student?.name || t('users.notAvailable');
                    const teacherName = booking.teacher?.user?.firstName && booking.teacher?.user?.lastName ? `${booking.teacher.user.firstName} ${booking.teacher.user.lastName}` : booking.teacher?.user?.name || booking.teacherId || t('users.notAvailable');
                    const bookingDate = new Date(booking.date || booking.startTime);
                    const dateStr = bookingDate.toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
                    const timeStr = booking.startTime && typeof booking.startTime === 'string' ? booking.startTime : bookingDate.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
                    const amount = getBookingAmount(booking);
                    return (
                      <tr
                        key={booking.id}
                        className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                        onClick={() => navigate(`/bookings/${booking.id}`)}
                      >
                        <td className={cn('px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white', isRTL && 'text-right')}>{studentName}</td>
                        <td className={cn('px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300', isRTL && 'text-right')}>{teacherName}</td>
                        <td className={cn('px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300', isRTL && 'text-right')}>{dateStr} · {timeStr}</td>
                        <td className="px-6 py-4">
                          <span className={cn('px-2.5 py-1 rounded-full text-xs font-semibold', getStatusBadge(booking.status))}>
                            {booking.status === 'PENDING' && t('dashboard.pending')}
                            {booking.status === 'CONFIRMED' && t('dashboard.confirmed')}
                            {booking.status === 'COMPLETED' && t('dashboard.completed')}
                            {booking.status === 'CANCELLED' && t('dashboard.cancelled')}
                            {!['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].includes(booking.status) && booking.status}
                          </span>
                        </td>
                        <td className={cn('px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white', isRTL && 'text-right')}>{formatCurrency(amount)}</td>
                        <td className={cn('px-6 py-4', isRTL ? 'text-left' : 'text-right')}>
                          <div className={cn('flex items-center gap-1', isRTL ? 'justify-start' : 'justify-end')}>
                            {viewMode === 'admin' && (
                              <button type="button" onClick={(e) => { e.stopPropagation(); handleToggleFeatured(booking); }} className={cn('p-2 rounded-lg transition-colors', booking.isFeatured ? 'text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700')} title={booking.isFeatured ? 'إزالة التمييز' : 'تمييز'}>
                                <FiStar className={cn('size-4', booking.isFeatured && 'fill-current')} />
                              </button>
                            )}
                            <button type="button" onClick={(e) => { e.stopPropagation(); navigate(`/bookings/${booking.id}`); }} className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600" title={t('bookings.viewDetails')}>
                              <FiEye className="size-4" />
                            </button>
                            {viewMode === 'admin' && booking.status === 'PENDING' && (
                              <>
                                <button type="button" onClick={(e) => { e.stopPropagation(); handleForceAction(booking.id, 'confirm'); }} className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20" title={t('bookings.confirmBooking')}>
                                  <FiCheckCircle className="size-4" />
                                </button>
                                <button type="button" onClick={(e) => { e.stopPropagation(); handleForceAction(booking.id, 'cancel'); }} className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20" title={t('bookings.cancelBooking')}>
                                  <FiXCircle className="size-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {viewMode === 'admin' && totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-gray-700 sm:px-6">
                <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 hover:bg-gray-50">
                  {t('common.previous')}
                </button>
                <span className="text-sm text-gray-500 dark:text-gray-400">{t('users.pageOf', { page, totalPages })}</span>
                <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 hover:bg-gray-50">
                  {t('common.next')}
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="p-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5">
              {sortedBookings.map((booking) => {
                const studentName =
                  booking.student?.firstName && booking.student?.lastName
                    ? `${booking.student.firstName} ${booking.student.lastName}`
                    : booking.student?.name || t('common.notAvailable');
                const teacherName =
                  booking.teacher?.user?.firstName && booking.teacher?.user?.lastName
                    ? `${booking.teacher.user.firstName} ${booking.teacher.user.lastName}`
                    : booking.teacher?.user?.name || booking.teacherId || t('common.notAvailable');
                const bookingDate = new Date(booking.date || booking.startTime);
                const dateStr = bookingDate.toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
                const timeStr = booking.startTime && typeof booking.startTime === 'string' ? booking.startTime : bookingDate.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
                const amount = getBookingAmount(booking);

                return (
                  <div
                    key={booking.id}
                    className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:border-orange-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-orange-800 cursor-pointer flex flex-col"
                    onClick={() => navigate(`/bookings/${booking.id}`)}
                  >
                    {/* Card header */}
                    <div className="relative h-36 bg-gradient-to-br from-orange-500 to-orange-600">
                      <div className="h-full w-full flex items-center justify-center text-white/90">
                        <FiCalendar className="text-5xl" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span
                          className={cn(
                            'px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-sm',
                            getStatusBadge(booking.status)
                          )}
                        >
                          {booking.status === 'PENDING' && t('dashboard.pending')}
                          {booking.status === 'CONFIRMED' && t('dashboard.confirmed')}
                          {booking.status === 'COMPLETED' && t('dashboard.completed')}
                          {booking.status === 'CANCELLED' && t('dashboard.cancelled')}
                          {!['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].includes(booking.status) && booking.status}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3 flex gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/bookings/${booking.id}`);
                          }}
                          className="p-1.5 rounded-full bg-white/90 text-gray-700 hover:bg-white hover:text-orange-600 transition-colors shadow-sm dark:bg-gray-800/90 dark:text-gray-200"
                          title={t('bookings.viewDetails')}
                        >
                          <FiEye className="text-sm" />
                        </button>
                        {viewMode === 'admin' && booking.status === 'PENDING' && (
                          <>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleForceAction(booking.id, 'confirm');
                              }}
                              className="p-1.5 rounded-full bg-white/90 text-emerald-700 hover:bg-white hover:text-emerald-600 transition-colors shadow-sm"
                              title={t('bookings.confirmBooking')}
                            >
                              <FiCheckCircle className="text-sm" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleForceAction(booking.id, 'cancel');
                              }}
                              className="p-1.5 rounded-full bg-white/90 text-red-700 hover:bg-white hover:text-red-600 transition-colors shadow-sm"
                              title={t('bookings.cancelBooking')}
                            >
                              <FiXCircle className="text-sm" />
                            </button>
                          </>
                        )}
                      </div>
                      {viewMode === 'admin' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFeatured(booking);
                          }}
                          className={cn(
                            'absolute bottom-3 right-3 p-1.5 rounded-full transition-colors shadow-sm',
                            booking.isFeatured
                              ? 'bg-yellow-400/90 text-white hover:bg-yellow-500'
                              : 'bg-white/90 text-gray-400 hover:bg-white hover:text-yellow-500 dark:bg-gray-800/90 dark:text-gray-400'
                          )}
                          title={booking.isFeatured ? 'إزالة التمييز' : 'تمييز'}
                        >
                          <FiStar className={cn('text-sm', booking.isFeatured && 'fill-current')} />
                        </button>
                      )}
                    </div>

                    {/* Body */}
                    <div className="flex-1 flex flex-col p-4 space-y-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">{t('bookings.student')}</p>
                        <h2 className="text-base font-semibold text-gray-900 line-clamp-1">
                          {studentName}
                        </h2>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">{t('bookings.teacher')}</p>
                        <p className="text-sm text-gray-700 line-clamp-1">{teacherName}</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <FiClock className="shrink-0 text-orange-500 dark:text-orange-400" />
                        <span>{dateStr}</span>
                        {timeStr && <span>· {timeStr}</span>}
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                          <FiDollarSign className="text-emerald-600" />
                          {formatCurrency(amount)}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/bookings/${booking.id}`);
                            }}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300"
                          >
                            <FiEye className="text-sm" />
                            {t('common.view')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            </div>
            {viewMode === 'admin' && totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-gray-700 sm:px-6">
                <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 hover:bg-gray-50">
                  {t('common.previous')}
                </button>
                <span className="text-sm text-gray-500 dark:text-gray-400">{t('users.pageOf', { page, totalPages })}</span>
                <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 hover:bg-gray-50">
                  {t('common.next')}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Bookings;
