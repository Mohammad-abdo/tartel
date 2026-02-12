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
import QuranProgressBar from '../components/QuranProgressBar';

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
    <div className={cn('space-y-4 sm:space-y-5 lg:space-y-6 2xl:space-y-5', isRTL && 'text-right')} dir={isRTL ? 'rtl' : 'ltr'} style={{ fontFamily: 'Alexandria, sans-serif' }}>
      {/* Islamic Header */}
      <div className="text-center mb-6">
        <div className="islamic-border inline-block px-8 py-4 bg-gradient-to-r from-emerald-50 to-amber-50 dark:from-emerald-900/20 dark:to-amber-900/20 rounded-xl">
          <p className="text-emerald-700 dark:text-emerald-300 text-sm font-semibold mb-1 font-alexandria">
            {isRTL ? 'بسم الله الرحمن الرحيم' : 'In the name of Allah, the Most Gracious, the Most Merciful'}
          </p>
          <p className="text-amber-600 dark:text-amber-400 text-xs font-alexandria">
            {isRTL ? 'تفاصيل طالب القرآن الكريم' : 'Details of Quran Student'}
          </p>
        </div>
      </div>

      {/* تنبيه خيارات التعديل */}
      <div className="islamic-card bg-gradient-to-r from-emerald-50 to-amber-50 dark:from-emerald-900/20 dark:to-amber-900/20 p-4 flex items-start gap-3">
        <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-lg">
          <FiInfo className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-emerald-800 dark:text-emerald-200 mb-1 font-alexandria">خيارات تعديل المستخدم</h3>
          <p className="text-sm text-amber-700 dark:text-amber-300 font-alexandria">
            يمكنك تعديل بيانات المستخدم من الزر الأزرق في الأعلى أو من قسم "إجراءات سريعة" في الشريط الجانبي.
          </p>
          <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 mt-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="font-alexandria italic">{isRTL ? 'وقل رب أدخلني مدخل صدق' : 'And say: My Lord, admit me an entrance of truth'}</span>
          </div>
        </div>
      </div>

      {/* Page header */}
      <div className="islamic-card p-6 bg-gradient-to-r from-emerald-50 via-white to-amber-50 dark:from-emerald-900/20 dark:via-gray-800 dark:to-amber-900/20 shadow-lg">
        {/* Header - Mobile */}
        <div className="md:hidden">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/users')}
              className="islamic-button-secondary p-3"
              aria-label="العودة"
            >
              <FiArrowRight className="text-xl rotate-180" />
            </button>
            <div className="flex items-center gap-3 flex-1">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
                <FiUser className="size-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold tracking-wide text-emerald-600 dark:text-emerald-400 uppercase mb-1 font-alexandria">
                  المستخدمين
                </p>
                <h1 className="text-2xl font-bold tracking-tight text-emerald-800 dark:text-emerald-200 font-alexandria">
                  تفاصيل المستخدم
                </h1>
                <p className="text-amber-700 dark:text-amber-300 mt-1 text-sm font-alexandria">
                  معلومات المستخدم الكاملة وأنشطته
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/users/${id}/edit`)}
              className="flex-1 islamic-button-primary text-sm font-bold py-3"
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
              className="islamic-button-secondary p-3"
              aria-label="العودة"
            >
              <FiArrowRight className="text-xl rotate-180" />
            </button>
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
                <FiUser className="size-8 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold tracking-wide text-emerald-600 dark:text-emerald-400 uppercase mb-1 font-alexandria">
                  المستخدمين
                </p>
                <h1 className="text-2xl font-bold tracking-tight text-emerald-800 dark:text-emerald-200 sm:text-3xl font-alexandria">
                  تفاصيل المستخدم
                </h1>
                <p className="text-amber-700 dark:text-amber-300 mt-1 text-sm font-alexandria">
                  معلومات المستخدم الكاملة وأنشطته
                </p>
                <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 mt-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span className="font-alexandria italic">{isRTL ? 'رب اشرح لي صدري' : 'My Lord, expand for me my chest'}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => navigate(`/users/${id}/edit`)}
              className="islamic-button-primary px-6 py-3 text-sm font-bold"
            >
              <FiEdit className="text-lg" />
              تعديل بيانات المستخدم
            </button>
          </div>
        </div>
      </div>

      {/* KPI cards - إحصائيات سريعة */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5 2xl:gap-3 3xl:grid-cols-6 3xl:gap-4 gap-4">
        <div className="islamic-card group hover:shadow-xl transition-all duration-300 p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 mb-1 font-alexandria">إجمالي الحجوزات</p>
              <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">{user._count?.studentBookings ?? user.studentBookings?.length ?? 0}</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-alexandria">جلسات تعلم القرآن</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <FiBook className="text-white text-xl" />
            </div>
          </div>
        </div>
        
        <div className="islamic-card group hover:shadow-xl transition-all duration-300 p-4 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-amber-700 dark:text-amber-300 mb-1 font-alexandria">الإشعارات</p>
              <p className="text-2xl font-bold text-amber-800 dark:text-amber-200">{user._count?.notifications ?? 0}</p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-alexandria">رسائل وتذكيرات</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <FiBell className="text-white text-xl" />
            </div>
          </div>
        </div>
        
        <div className="islamic-card group hover:shadow-xl transition-all duration-300 p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-700 dark:text-blue-300 mb-1 font-alexandria">الأدوار</p>
              <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">{user.userRoles?.length ?? 0}</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-alexandria">صلاحيات النظام</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <FiShield className="text-white text-xl" />
            </div>
          </div>
        </div>
        
        {user.teacherProfile?.wallet && (
          <div className="islamic-card group hover:shadow-xl transition-all duration-300 p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-700 dark:text-green-300 mb-1 font-alexandria">رصيد المحفظة</p>
                <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                  ${(user.teacherProfile.wallet.balance ?? 0).toFixed(2)}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-alexandria">الأرباح المتاحة</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FiDollarSign className="text-white text-xl" />
              </div>
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

                {/* حقول خاصة بالطلاب */}
                {user.role === 'STUDENT' && (
                  <>
                    {/* جنس الطالب */}
                    {user.gender && (
                      <div>
                        <label className="text-xs font-medium text-emerald-700 dark:text-emerald-300 uppercase tracking-wide mb-1.5 flex items-center gap-1.5 font-alexandria">
                          <FiUser className="text-emerald-500 dark:text-emerald-400 text-sm" />
                          جنس الطالب
                        </label>
                        <span className="inline-flex px-3 py-1.5 rounded-lg text-sm font-semibold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-200 dark:ring-emerald-700 font-alexandria">
                          {user.gender === 'MALE' ? '👨 ذكر' : '👩 أنثى'}
                        </span>
                      </div>
                    )}

                    {/* عدد أجزاء الحفظ */}
                    <div className="col-span-2">
                      <label className="text-xs font-medium text-amber-700 dark:text-amber-300 uppercase tracking-wide mb-3 flex items-center gap-1.5 font-alexandria">
                        <span className="text-amber-500 dark:text-amber-400 text-sm">📖</span>
                        عدد أجزاء الحفظ من القرآن الكريم
                      </label>
                      <QuranProgressBar 
                        memorizedParts={user.memorizedParts || 0}
                        size="large"
                        isRTL={isRTL}
                        className="mt-2"
                      />
                    </div>
                  </>
                )}

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
