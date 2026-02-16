import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { adminAPI } from '../services/api';
import ImageModal from '../components/ImageModal';
import VideoModal from '../components/VideoModal';
import {
  FiArrowLeft,
  FiMail,
  FiPhone,
  FiUser,
  FiCalendar,
  FiDollarSign,
  FiEdit,
  FiCheckCircle,
  FiXCircle,
  FiStar,
  FiBook,
  FiClock,
  FiVideo,
  FiAward,
  FiTrendingUp,
  FiZoomIn,
  FiPlay,
} from 'react-icons/fi';
import { cn } from '../lib/utils';

const TeacherDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    fetchTeacher();
  }, [id]);

  const fetchTeacher = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getTeacherById(id);
      setTeacher(response.data);
    } catch (error) {
      console.error('Failed to fetch teacher:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      await adminAPI.updateTeacher(id, { isApproved: true });
      fetchTeacher();
    } catch (error) {
      console.error('Failed to approve teacher:', error);
    }
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 >= 0.5;
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <FiStar
            key={i}
            className={`${
              i < fullStars
                ? 'text-yellow-400 fill-current'
                : i === fullStars && hasHalfStar
                ? 'text-yellow-400 fill-current opacity-50'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className={cn('text-sm text-gray-600 dark:text-gray-400', isRTL ? 'mr-2' : 'ml-2')}>({(rating || 0).toFixed(1)})</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" aria-hidden />
        <span className="sr-only">جاري التحميل...</span>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">لم يتم العثور على الشيخ</p>
        <button
          onClick={() => navigate('/teachers')}
          className="mt-4 text-primary-600 hover:text-primary-700 dark:text-primary-400"
        >
          العودة إلى المشايخ
        </button>
      </div>
    );
  }

  const specialties = Array.isArray(teacher.specialties)
    ? teacher.specialties
    : teacher.specialization
    ? [teacher.specialization]
    : [];
  const isCourseSheikh = teacher.teacherType === 'COURSE_SHEIKH';

  return (
    <div className="text-right" dir="rtl">
      {/* Alert Notice */}
      <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <div className="flex items-center gap-2">
          <FiEdit className="text-green-600 dark:text-green-400 flex-shrink-0" />
          <p className="text-green-800 dark:text-green-200 text-sm font-medium">
            يمكنك تعديل بيانات هذا الشيخ باستخدام أزرار "تعديل الشيخ" الموجودة في الأعلى أو في الشريط الجانبي
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="mb-6">
        {/* Mobile Header */}
        <div className="flex flex-col gap-4 sm:hidden">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/teachers')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <FiArrowLeft className="text-xl text-gray-600 dark:text-gray-300 rotate-180" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">تفاصيل الشيخ</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">عرض وإدارة معلومات الشيخ</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className={cn(
              'inline-block px-3 py-1 rounded-full text-xs font-medium',
              isCourseSheikh ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200' : 'bg-primary-100 text-primary-800 dark:bg-primary-900/40 dark:text-primary-200'
            )}>
              {isCourseSheikh ? 'شيخ دورات' : 'شيخ كامل'}
            </span>
            <button
              onClick={() => navigate(`/teachers/${id}/edit`)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl border-2 border-blue-500 hover:border-blue-600"
            >
              <FiEdit className="w-4 h-4" />
              <span className="text-sm font-semibold">تعديل</span>
            </button>
          </div>
        </div>
        
        {/* Desktop Header */}
        <div className="hidden sm:flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/teachers')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <FiArrowLeft className="text-xl text-gray-600 dark:text-gray-300 rotate-180" />
            </button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">تفاصيل الشيخ</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">عرض وإدارة معلومات الشيخ</p>
              <span className={cn(
                'inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium',
                isCourseSheikh ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200' : 'bg-primary-100 text-primary-800 dark:bg-primary-900/40 dark:text-primary-200'
              )}>
                {isCourseSheikh ? 'شيخ دورات' : 'شيخ كامل'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/teachers/${id}/edit`)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 border-2 border-blue-500 hover:border-blue-600"
            >
              <FiEdit className="w-5 h-5" />
              تعديل الشيخ
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={cn('grid gap-4 mb-6', isCourseSheikh ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-4')}>
        {!isCourseSheikh && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">إجمالي الحجوزات</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{teacher._count?.bookings || 0}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <FiBook className="text-xl" />
            </div>
          </div>
        </div>
        )}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">إجمالي التقييمات</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{teacher._count?.reviews || 0}</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
              <FiStar className="text-xl" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">متوسط التقييم</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {(teacher.rating || 0).toFixed(1)} / 5.0
              </p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400">
              <FiStar className="text-xl" />
            </div>
          </div>
        </div>
        {teacher.wallet && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">رصيد المحفظة</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  ${(teacher.wallet.balance || 0).toFixed(2)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                <FiDollarSign className="text-xl" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <FiUser className="text-primary-600 dark:text-primary-400" />
              المعلومات الأساسية
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
                  الاسم الكامل (بالإنجليزية)
                </label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {teacher.user?.firstName} {teacher.user?.lastName}
                </p>
              </div>
              {(teacher.user?.firstNameAr || teacher.user?.lastNameAr) && (
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
                    الاسم الكامل (بالعربية)
                  </label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {teacher.user?.firstNameAr} {teacher.user?.lastNameAr}
                  </p>
                </div>
              )}
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block flex items-center gap-2">
                  <FiMail />
                  البريد الإلكتروني
                </label>
                <p className="text-gray-900 dark:text-white font-medium">{teacher.user?.email}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block flex items-center gap-2">
                  <FiPhone />
                  رقم الهاتف
                </label>
                <p className="text-gray-900 dark:text-white font-medium">{teacher.user?.phone || 'غير متوفر'}</p>
              </div>
              {teacher.specialization && (
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
                    التخصص
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium">{teacher.specialization}</p>
                </div>
              )}
              {specialties.length > 0 && (
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
                    المهارات
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {specialties.map((spec, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 text-sm bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {teacher.readingType && (
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
                    {t('teachers.readingType')}
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium">{teacher.readingType}</p>
                  {teacher.readingTypeAr && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1" dir="rtl">{teacher.readingTypeAr}</p>
                  )}
                </div>
              )}
              {teacher.experience && (
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block flex items-center gap-2">
                    <FiClock />
                    {t('teachers.experienceYears')}
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium">{teacher.experience} {t('teachers.years')}</p>
                </div>
              )}
              {teacher.hourlyRate && (
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block flex items-center gap-2">
                    <FiDollarSign />
                    {t('teachers.hourlyRate')}
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium">${teacher.hourlyRate.toFixed(2)}/hour</p>
                </div>
              )}
              {teacher.bio && (
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
                    {t('teachers.biography')}
                  </label>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{teacher.bio}</p>
                </div>
              )}
              {teacher.bioAr && (
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
                    {t('teachers.biographyAr')}
                  </label>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-right" dir="rtl">
                    {teacher.bioAr}
                  </p>
                </div>
              )}

              {/* صورة الشيخ + الفيديو التعريفي جنباً إلى جنب */}
              <div className="md:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block flex items-center gap-2">
                    <FiUser />
                    {t('teachers.profileImage')}
                  </label>
                  {teacher.image ? (
                    <div className="relative group cursor-pointer rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600" onClick={() => setSelectedImage(teacher.image)}>
                      <img
                        src={teacher.image}
                        alt={`${teacher.user?.firstName} ${teacher.user?.lastName}`}
                        className="w-full aspect-video object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 rounded-xl transition-all flex items-center justify-center">
                        <FiZoomIn className="text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 aspect-video flex items-center justify-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{t('teachers.noProfileImage')}</span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block flex items-center gap-2">
                    <FiVideo />
                    {t('teachers.introductionVideo')}
                  </label>
                  {teacher.introVideoUrl ? (
                    <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600 bg-black">
                      {teacher.introVideoUrl.includes('youtube.com') || teacher.introVideoUrl.includes('youtu.be') ? (
                        <iframe
                          className="w-full aspect-video"
                          src={
                            teacher.introVideoUrl.includes('youtube.com/watch')
                              ? teacher.introVideoUrl.replace('watch?v=', 'embed/')
                              : teacher.introVideoUrl.replace('youtu.be/', 'youtube.com/embed/')
                          }
                          title={t('teachers.introductionVideo')}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <video
                          className="w-full aspect-video"
                          controls
                          src={teacher.introVideoUrl}
                          poster={teacher.image}
                        >
                          <source src={teacher.introVideoUrl} type="video/mp4" />
                        </video>
                      )}
                      <div className="p-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setSelectedVideo(teacher.introVideoUrl)}
                          className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                        >
                          <FiPlay className="size-4" />
                          {t('teachers.watchVideo')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 aspect-video flex items-center justify-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{t('teachers.noIntroVideo')}</span>
                    </div>
                  )}
                </div>
              </div>

              {teacher.certificates && teacher.certificates.length > 0 && (
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block flex items-center gap-2">
                    <FiAward />
                    {t('teachers.certificates')}
                  </label>
                  <div className="space-y-2">
                    {teacher.certificates.map((cert, idx) => (
                      <a
                        key={idx}
                        href={cert}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        {t('teachers.certificateN', { n: idx + 1 })}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Wallet Information */}
          {teacher.wallet && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FiDollarSign className="text-primary-600 dark:text-primary-400" />
                {t('teachers.walletInformation')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
                    {t('teachers.balance')}
                  </label>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    ${(teacher.wallet.balance || 0).toFixed(2)}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
                    {t('teachers.walletStatus')}
                  </label>
                  <span
                    className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${
                      teacher.wallet.isActive
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                    }`}
                  >
                    {teacher.wallet.isActive ? t('teachers.active') : t('teachers.disabled')}
                  </span>
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
                    {t('teachers.walletId')}
                  </label>
                  <p className="text-gray-900 dark:text-white font-mono text-sm">{teacher.wallet.id.slice(0, 8)}...</p>
                </div>
              </div>

              {/* Recent Transactions */}
              {teacher.wallet.transactions && teacher.wallet.transactions.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('teachers.recentTransactions')}</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {teacher.wallet.transactions.slice(0, 10).map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{transaction.type}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {transaction.description || t('teachers.noDescription')}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {new Date(transaction.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <span
                          className={`font-bold text-lg ${
                            transaction.amount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          {transaction.amount >= 0 ? '+' : ''}${transaction.amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payout Requests */}
              {teacher.wallet.payoutRequests && teacher.wallet.payoutRequests.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('teachers.payoutRequests')}</h3>
                  <div className="space-y-2">
                    {teacher.wallet.payoutRequests.slice(0, 5).map((request) => (
                      <div
                        key={request.id}
                        className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            ${request.amount.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(request.createdAt).toLocaleDateString()} -{' '}
                            <span className="font-medium">{request.status}</span>
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded ${
                            request.status === 'COMPLETED'
                              ? 'bg-green-100 text-green-800'
                              : request.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {request.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Recent Bookings - only for full teachers */}
          {!isCourseSheikh && teacher.bookings && teacher.bookings.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FiBook className="text-primary-600 dark:text-primary-400" />
                {t('teachers.recentBookings')}
              </h2>
              <div className="space-y-3">
                {teacher.bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/bookings/${booking.id}`)}
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {booking.student?.firstName} {booking.student?.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(booking.date || booking.startTime).toLocaleDateString()} at{' '}
                        {booking.startTime
                          ? new Date(booking.startTime).toLocaleTimeString()
                          : booking.startTime}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          booking.status === 'CONFIRMED'
                            ? 'bg-green-100 text-green-800'
                            : booking.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {booking.status}
                      </span>
                      {booking.payment && (
                        <p className="text-sm font-semibold text-gray-900 mt-1">
                          ${(booking.payment.amount / 100).toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Reviews */}
          {teacher.reviews && teacher.reviews.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FiStar className="text-primary-600 dark:text-primary-400" />
                {t('teachers.recentReviews')}
              </h2>
              <div className="space-y-4">
                {teacher.reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-4 last:border-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {review.student?.avatar ? (
                          <img
                            src={review.student.avatar}
                            alt={review.student.firstName}
                            className="h-10 w-10 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedImage(review.student.avatar);
                            }}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-primary-600 font-medium">
                              {review.student?.firstName?.charAt(0) || 'S'}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">
                            {review.student?.firstName} {review.student?.lastName}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            {renderStars(review.rating)}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-gray-700 mt-2 ml-13">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Schedules - only for full teachers */}
          {!isCourseSheikh && teacher.schedules && teacher.schedules.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FiCalendar className="text-primary-600 dark:text-primary-400" />
                {t('teachers.activeSchedules')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(() => {
                  const dayOrder = {
                    SATURDAY: 0, SUNDAY: 1, MONDAY: 2, TUESDAY: 3, WEDNESDAY: 4, THURSDAY: 5, FRIDAY: 6
                  };
                  
                  const intToDay = {
                    0: 'SATURDAY', 1: 'SUNDAY', 2: 'MONDAY', 3: 'TUESDAY', 4: 'WEDNESDAY', 5: 'THURSDAY', 6: 'FRIDAY'
                  };

                  const getDayString = (val) => {
                    if (typeof val === 'string') return val;
                    return intToDay[val];
                  };

                  const uniqueDays = [...new Set(teacher.schedules
                    .map(s => getDayString(s.dayOfWeek))
                    .filter(d => d)
                  )].sort((a, b) => (dayOrder[a] || 99) - (dayOrder[b] || 99));

                  return uniqueDays.map(day => (
                    <div key={day} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-200">
                      <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-700/50 dark:to-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-center gap-2">
                        <FiCalendar className="text-primary-500 size-4" />
                        <h3 className="font-bold text-gray-900 dark:text-white text-center capitalize">
                          {t(`days.${String(day).toLowerCase()}`, day)}
                        </h3>
                      </div>
                      <div className="p-3 space-y-2 bg-white dark:bg-gray-800">
                        {teacher.schedules
                          .filter(s => getDayString(s.dayOfWeek) === day)
                          .sort((a, b) => a.startTime.localeCompare(b.startTime))
                          .map(slot => (
                            <div 
                              key={slot.id}
                              className="group flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-primary-50 dark:bg-gray-700/30 dark:hover:bg-primary-900/20 rounded-lg transition-colors border border-transparent hover:border-primary-100 dark:hover:border-primary-800"
                            >
                              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 group-hover:text-primary-700 dark:group-hover:text-primary-300">
                                <FiClock className="size-4" />
                                <span className="text-sm font-medium" style={{ direction: 'ltr' }}>
                                  {new Date(`2000-01-01T${slot.startTime}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                                  {' - '}
                                  {new Date(`2000-01-01T${slot.endTime}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                        ))}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-xl shadow-lg p-6 text-white">
            <div className="text-center">
              {teacher.image ? (
                <img
                  src={teacher.image}
                  alt={`${teacher.user?.firstName} ${teacher.user?.lastName}`}
                  className="h-32 w-32 rounded-full object-cover mx-auto mb-4 border-4 border-white/30 cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setSelectedImage(teacher.image)}
                />
              ) : (
                <div className="h-32 w-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 border-4 border-white/30">
                  <span className="text-4xl font-bold">
                    {teacher.user?.firstName?.charAt(0) || teacher.user?.email?.charAt(0) || 'T'}
                  </span>
                </div>
              )}
              <h3 className="text-2xl font-bold mb-2">
                {teacher.user?.firstName} {teacher.user?.lastName}
              </h3>
              <p className="text-green-100 text-sm mb-4">{teacher.user?.email}</p>
              {teacher.rating && (
                <div className="flex items-center justify-center gap-1 mb-4">
                  {renderStars(teacher.rating)}
                </div>
              )}
              <div className="mt-4 pt-4 border-t border-white/20">
                <p className="text-xs text-green-100 uppercase tracking-wide">{t('teachers.teacherId')}</p>
                <p className="text-sm font-mono mt-1">{teacher.id.slice(0, 8)}...</p>
              </div>
            </div>
          </div>

          {/* Approval Status */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">حالة الموافقة</h3>
            <div className="mb-4">
              <span
                className={cn(
                  'px-4 py-2 inline-flex text-sm font-semibold rounded-lg w-full justify-center',
                  teacher.isApproved
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                    : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                )}
              >
                {teacher.isApproved ? (
                  <>
                    <FiCheckCircle className={cn('size-4 shrink-0', isRTL ? 'ml-2' : 'mr-2')} />
                    تم الاعتماد
                  </>
                ) : (
                  <>
                    <FiXCircle className={cn('size-4 shrink-0', isRTL ? 'ml-2' : 'mr-2')} />
                    في انتظار الموافقة
                  </>
                )}
              </span>
            </div>
            {!teacher.isApproved && (
              <button
                onClick={handleApprove}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <FiCheckCircle className="size-4" />
                اعتماد الشيخ
              </button>
            )}
            {teacher.isSuspended && (
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-300 font-medium">{t('teachers.teacherSuspended')}</p>
              </div>
            )}
          </div>

          {/* Edit Actions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl shadow-sm p-6 border border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2">
              <FiEdit className="text-blue-600" />
              إجراءات التحكم
            </h3>
            <button
              onClick={() => navigate(`/teachers/${id}/edit`)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 border-2 border-orange-400 hover:border-orange-500"
            >
              <FiEdit className="w-5 h-5" />
              تعديل بيانات الشيخ
            </button>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-2 text-center">يمكنك تعديل جميع بيانات الشيخ من هنا</p>
          </div>

          {/* Quick Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">إحصائيات سريعة</h3>
            <div className="space-y-3">
              {!isCourseSheikh && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">{t('teachers.totalBookings')}</span>
                <span className="font-bold text-gray-900 dark:text-white">{teacher._count?.bookings || 0}</span>
              </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">{t('teachers.totalReviews')}</span>
                <span className="font-bold text-gray-900 dark:text-white">{teacher._count?.reviews || 0}</span>
              </div>
              {teacher.rating && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('teachers.averageRating')}</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {teacher.rating.toFixed(1)} / 5.0
                  </span>
                </div>
              )}
              {teacher.wallet && (
                <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-600">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('teachers.walletBalance')}</span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    ${(teacher.wallet.balance || 0).toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage}
          alt={`${teacher.user?.firstName} ${teacher.user?.lastName}`}
          onClose={() => setSelectedImage(null)}
        />
      )}

      {/* Video Modal */}
      {selectedVideo && (
        <VideoModal
          videoUrl={selectedVideo}
          title={`${teacher.user?.firstName} ${teacher.user?.lastName} - ${t('teachers.introductionVideo')}`}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </div>
  );
};

export default TeacherDetail;
