import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { adminAPI } from '../services/api';
import { toast } from 'react-toastify';
import {
  FiArrowRight,
  FiMail,
  FiPhone,
  FiUser,
  FiCalendar,
  FiShield,
  FiEdit,
  FiDollarSign,
  FiBook,
  FiBell,
  FiCheckCircle,
  FiXCircle,
  FiUsers,
  FiInfo,
} from 'react-icons/fi';
import { cn } from '../lib/utils';

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getUserById(id);
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBan = async () => {
    if (!window.confirm(t('users.banConfirm') || 'Are you sure you want to ban this user?')) return;
    setActionLoading(true);
    try {
      await adminAPI.banUser(id);
      toast.success(t('users.userBannedSuccess'));
      fetchUser();
    } catch (error) {
      toast.error(error.response?.data?.message || t('users.updateStatusFailed'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivate = async () => {
    setActionLoading(true);
    try {
      await adminAPI.activateUser(id);
      toast.success(t('users.userActivatedSuccess'));
      fetchUser();
    } catch (error) {
      toast.error(error.response?.data?.message || t('users.updateStatusFailed'));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-5 lg:space-y-6 2xl:space-y-5">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-4 sm:space-y-5 lg:space-y-6 2xl:space-y-5">
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 shadow-sm flex flex-col items-center justify-center py-20 text-center px-4">
          <div className="h-14 w-14 rounded-full bg-primary-50 flex items-center justify-center mb-4">
            <FiUser className="text-primary-600 text-2xl" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            {t('users.userNotFound') || 'User not found'}
          </h2>
          <p className="text-sm text-gray-500 max-w-md mb-4">
            {t('users.userNotFoundDesc') || 'The user may have been deleted or the link is invalid.'}
          </p>
          <button
            onClick={() => navigate('/users')}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700"
          >
            <FiArrowLeft />
            {t('users.backToUsers') || 'Back to Users'}
          </button>
        </div>
      </div>
    );
  }

  const displayName = user.firstName && user.lastName
    ? `${user.firstName} ${user.lastName}`
    : user.name || user.email?.split('@')[0] || t('users.user');
  const initials = (user.firstName?.[0] || user.name?.[0] || user.email?.[0] || 'U').toUpperCase();

  return (
    <div className={cn('space-y-4 sm:space-y-5 lg:space-y-6 2xl:space-y-5', isRTL && 'text-right')} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* تنبيه خيارات التعديل */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <FiInfo className="h-5 w-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-blue-900 mb-1">خيارات تعديل المستخدم</h3>
          <p className="text-sm text-blue-700">
            يمكنك تعديل بيانات المستخدم من الزر الأزرق في الأعلى أو من قسم "إجراءات سريعة" في الشريط الجانبي.
          </p>
        </div>
      </div>

      {/* Page header */}
      <div className="flex flex-col gap-4">
        {/* Header - Mobile */}
        <div className="md:hidden">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/users')}
              className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
              aria-label="العودة"
            >
              <FiArrowRight className="text-xl text-gray-600 dark:text-gray-300 rotate-180" />
            </button>
            <div className="flex-1">
              <p className="text-xs font-semibold tracking-wide text-primary-600 dark:text-primary-400 uppercase mb-1">
                المستخدمين
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                تفاصيل المستخدم
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                معلومات المستخدم الكاملة وأنشطته
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/users/${id}/edit`)}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-bold shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 border border-blue-500 hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <FiEdit className="text-lg" />
              تعديل المستخدم
            </button>
          </div>
        </div>

        {/* Header - Desktop */}
        <div className="hidden md:flex md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/users')}
              className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
              aria-label="العودة"
            >
              <FiArrowRight className="text-xl text-gray-600 dark:text-gray-300 rotate-180" />
            </button>
            <div>
              <p className="text-xs font-semibold tracking-wide text-primary-600 dark:text-primary-400 uppercase mb-1">
                المستخدمين
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                تفاصيل المستخدم
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                معلومات المستخدم الكاملة وأنشطته
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => navigate(`/users/${id}/edit`)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-bold shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 border border-blue-500 hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <FiEdit className="text-lg" />
              تعديل بيانات المستخدم
            </button>
          </div>
        </div>
      </div>

      {/* KPI cards - إحصائيات سريعة */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5 2xl:gap-3 3xl:grid-cols-6 3xl:gap-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">إجمالي الحجوزات</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{user._count?.studentBookings ?? user.studentBookings?.length ?? 0}</p>
          </div>
          <div className="h-11 w-11 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
            <FiBook className="text-primary-600 dark:text-primary-400 text-xl" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">الإشعارات</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{user._count?.notifications ?? 0}</p>
          </div>
          <div className="h-11 w-11 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
            <FiBell className="text-amber-600 dark:text-amber-400 text-xl" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">الأدوار</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{user.userRoles?.length ?? 0}</p>
          </div>
          <div className="h-11 w-11 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
            <FiShield className="text-emerald-600 dark:text-emerald-400 text-xl" />
          </div>
        </div>
        {user.teacherProfile?.wallet && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">رصيد المحفظة</p>
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                ${(user.teacherProfile.wallet.balance ?? 0).toFixed(2)}
              </p>
            </div>
            <div className="h-11 w-11 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
              <FiDollarSign className="text-emerald-600 dark:text-emerald-400 text-xl" />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FiUser className="text-primary-600 dark:text-primary-400" />
                المعلومات الأساسية
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5 block">
                    الاسم الكامل
                  </label>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {displayName}
                  </p>
                </div>
                {(user.firstNameAr || user.lastNameAr) && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5 block">
                      الاسم بالعربية
                    </label>
                    <p className="text-base font-semibold text-gray-900 dark:text-white">
                      {user.firstNameAr} {user.lastNameAr}
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                    <FiMail className="text-gray-400 dark:text-gray-500 text-sm" />
                    البريد الإلكتروني
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium">{user.email}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                    <FiPhone className="text-gray-400 dark:text-gray-500 text-sm" />
                    رقم الهاتف
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium">{user.phone || 'غير متوفر'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                    <FiShield className="text-gray-400 dark:text-gray-500 text-sm" />
                    الدور
                  </label>
                  <span className="inline-flex px-2.5 py-1 rounded-lg text-sm font-semibold bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 ring-1 ring-primary-200 dark:ring-primary-700">
                    {user.role === 'ADMIN' ? 'مدير' : user.role === 'TEACHER' ? 'شيخ' : 'طالب'}
                  </span>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5 block">
                    الحالة
                  </label>
                  <span
                    className={cn(
                      'inline-flex px-2.5 py-1 rounded-lg text-sm font-semibold ring-1',
                      user.status === 'ACTIVE' && 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 ring-emerald-200 dark:ring-emerald-700',
                      user.status === 'BANNED' && 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300 ring-red-200 dark:ring-red-700',
                      user.status === 'INACTIVE' && 'bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 ring-slate-200 dark:ring-slate-600'
                    )}
                  >
                    {user.status === 'ACTIVE' ? 'نشط' : user.status === 'BANNED' ? 'محظور' : 'غير نشط'}
                  </span>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                    <FiCalendar className="text-gray-400 dark:text-gray-500 text-sm" />
                    عضو منذ
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {new Date(user.createdAt).toLocaleDateString('ar-EG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5 block">
                    معرف المستخدم
                  </label>
                  <p className="text-gray-700 dark:text-gray-300 font-mono text-sm truncate">{user.id}</p>
                </div>
              </div>
              {user.avatar && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                    صورة المستخدم
                  </label>
                  <img
                    src={user.avatar}
                    alt={displayName}
                    className="h-20 w-20 rounded-xl object-cover ring-2 ring-gray-100"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Roles & Permissions */}
          {user.userRoles && user.userRoles.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FiShield className="text-primary-600" />
                  {t('users.rolesAndPermissions') || 'Roles & Permissions'}
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {user.userRoles.map((userRole) => (
                  <div key={userRole.id} className="rounded-xl border border-gray-100 p-4 bg-gray-50/50">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{userRole.role?.name}</h3>
                      {userRole.role?.description && (
                        <span className="text-xs text-gray-500">{userRole.role.description}</span>
                      )}
                    </div>
                    {userRole.role?.permissions?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {userRole.role.permissions.map((rp) => (
                          <span
                            key={rp.permissionId ?? rp.permission?.id}
                            className="px-2.5 py-1 text-xs font-medium bg-white border border-gray-200 text-gray-700 rounded-lg"
                          >
                            {rp.permission?.name ?? rp.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Teacher Profile */}
          {user.teacherProfile && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FiUsers className="text-primary-600" />
                  {t('users.teacherProfile') || 'Teacher Profile'}
                </h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex flex-wrap items-center gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">
                      {t('users.approvalStatus') || 'Approval Status'}
                    </label>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-semibold ring-1',
                        user.teacherProfile.isApproved
                          ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
                          : 'bg-amber-50 text-amber-800 ring-amber-200'
                      )}
                    >
                      {user.teacherProfile.isApproved ? (
                        <><FiCheckCircle /> {t('teachers.approved')}</>
                      ) : (
                        <><FiXCircle /> {t('dashboard.pending')}</>
                      )}
                    </span>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">
                      {t('users.teacherId') || 'Teacher ID'}
                    </label>
                    <p className="text-gray-900 font-mono text-sm">{user.teacherProfile.id}</p>
                  </div>
                </div>
                {user.teacherProfile.wallet?.transactions?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <FiDollarSign className="text-primary-500" />
                      {t('users.recentWalletTransactions') || 'Recent Wallet Transactions'}
                    </h3>
                    <div className="space-y-2">
                      {user.teacherProfile.wallet.transactions.slice(0, 5).map((tx) => (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {tx.type} – {tx.description || t('common.notAvailable')}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(tx.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <span className={cn('font-semibold', tx.amount >= 0 ? 'text-emerald-600' : 'text-red-600')}>
                            {tx.amount >= 0 ? '+' : ''}${(tx.amount ?? 0).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recent Bookings */}
          {user.studentBookings && user.studentBookings.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FiBook className="text-primary-600" />
                  {t('users.recentBookings') || 'Recent Bookings'}
                </h2>
              </div>
              <div className="p-6 space-y-3">
                {user.studentBookings.slice(0, 10).map((booking) => (
                  <button
                    key={booking.id}
                    type="button"
                    onClick={() => navigate(`/bookings/${booking.id}`)}
                    className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 hover:border-primary-100 transition-colors text-left"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {new Date(booking.date || booking.startTime).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {t('common.status')}: <span className="font-medium text-gray-700">{booking.status}</span>
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      ${(booking.totalPrice ?? 0).toFixed(2)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile card – ألوان واضحة للاسم والبريد */}
          <div className="bg-gradient-to-br from-orange-600 to-orange-700 dark:from-orange-700 dark:to-orange-800 rounded-2xl shadow-lg overflow-hidden border border-orange-500/20">
            <div className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="h-28 w-28 rounded-2xl bg-white/25 backdrop-blur-sm flex items-center justify-center mb-4 border-2 border-white/40 overflow-hidden shadow-inner">
                  {user.avatar ? (
                    <img src={user.avatar} alt={displayName} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-4xl font-bold text-white drop-shadow-sm">{initials}</span>
                  )}
                </div>
                <h3 className="text-xl font-bold mb-1 text-white drop-shadow-sm">{displayName}</h3>
                <p className="text-sm break-all text-white/95 font-medium">{user.email}</p>
                <div className="mt-4 pt-4 border-t border-white/30 w-full">
                  <p className="text-xs text-white/90 uppercase tracking-wide font-medium">
                    {t('users.userId') || 'User ID'}
                  </p>
                  <p className="text-sm font-mono mt-1 truncate text-white">{user.id.slice(0, 12)}...</p>
                </div>
              </div>
            </div>
          </div>

          {/* إجراءات سريعة */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                إجراءات سريعة
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {/* زر التعديل المحسن */}
              <button
                type="button"
                onClick={() => navigate(`/users/${id}/edit`)}
                className="w-full flex items-center gap-3 px-4 py-4 text-white font-bold rounded-xl transition-all duration-200 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 border border-orange-500"
              >
                <FiEdit className="text-lg shrink-0" />
                تعديل بيانات المستخدم
              </button>
              
              {user.status === 'ACTIVE' ? (
                <button
                  type="button"
                  onClick={handleBan}
                  disabled={actionLoading}
                  className="w-full flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-red-200 font-medium text-sm disabled:opacity-50 hover:border-red-300"
                >
                  <FiXCircle className="text-lg shrink-0" />
                  {actionLoading ? 'جاري الحظر...' : 'حظر المستخدم'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleActivate}
                  disabled={actionLoading}
                  className="w-full flex items-center gap-2 px-4 py-3 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors border border-emerald-200 font-medium text-sm disabled:opacity-50 hover:border-emerald-300"
                >
                  <FiCheckCircle className="text-lg shrink-0" />
                  {actionLoading ? 'جاري التفعيل...' : 'تفعيل المستخدم'}
                </button>
              )}
              
              {user.teacherProfile && (
                <button
                  type="button"
                  onClick={() => navigate(`/teachers/${user.teacherProfile.id}`)}
                  className="w-full flex items-center gap-2 px-4 py-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border border-blue-200 font-medium text-sm hover:border-blue-300"
                >
                  <FiUser className="text-lg shrink-0" />
                  عرض الملف الشخصي كشيخ
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
