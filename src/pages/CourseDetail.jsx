import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { courseAPI } from '../services/api';
import ImageModal from '../components/ImageModal';
import YouTubeThumbnail from '../components/YouTubeThumbnail';
import {
  FiArrowLeft,
  FiBook,
  FiUser,
  FiCalendar,
  FiUsers,
  FiEdit,
  FiDollarSign,
  FiClock,
  FiTrendingUp,
  FiZoomIn,
  FiVideo,
  FiMail,
  FiStar,
} from 'react-icons/fi';

const CourseDetail = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    setLoading(true);
    try {
      const response = await courseAPI.getCourseById(id);
      setCourse(response.data);
    } catch (error) {
      console.error('Failed to fetch course:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      DRAFT: 'bg-amber-50 text-amber-800 ring-1 ring-amber-200',
      PUBLISHED: 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200',
      ARCHIVED: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const enrolledStudentsCount = course?.enrollments?.length || course?._count?.enrollments || 0;
  const generatedRevenue = enrolledStudentsCount * (course?.price || 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="text-gray-500">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
          <FiBook className="text-2xl text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('courses.courseNotFound')}</h3>
        <button
          onClick={() => navigate('/courses')}
          className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
        >
          {t('courses.backToCourses')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - Islamic Design */}
      <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 rounded-xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/courses')}
              className="p-3 hover:bg-white/10 rounded-xl transition-colors backdrop-blur-sm"
            >
              <FiArrowLeft className="text-xl" />
            </button>
            <div className="islamic-pattern">
              <div className="flex items-center gap-4 mb-2">
                <FiBook className="text-3xl text-white/90" />
                <div>
                  <h1 className="text-3xl font-bold arabic-text tracking-tight">{course.title}</h1>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full bg-white/20 text-white border border-white/30`}>
                      {t(`courses.${course.status.toLowerCase()}`)}
                    </span>
                  </div>
                </div>
              </div>
              {course.titleAr && (
                <p className="text-lg text-emerald-100 arabic-text" dir="rtl">
                  {course.titleAr}
                </p>
              )}
              <div className="mt-3 text-emerald-100 text-sm arabic-text">
                "وَقُلْ رَبِّ زِدْنِي عِلْمًا" - سورة طه
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate(`/courses/${id}/edit`)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-all duration-300 font-medium border border-white/20 shadow-lg"
            >
              <FiEdit />
              {t('courses.editCourse')}
            </button>
            
            <button
              onClick={() => navigate(`/courses/${id}/lessons`)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-all duration-300 font-medium shadow-lg"
            >
              <FiVideo />
              إدارة الدروس
            </button>
            
            <button
              onClick={() => navigate('/courses')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-all duration-300 font-medium border border-white/20"
            >
              <FiArrowLeft />
              العودة للدورات
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards - Islamic Theme */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-5 border border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300 islamic-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-700/80 mb-1 arabic-text font-semibold">{t('courses.enrolledStudents')}</p>
              <p className="text-2xl font-bold text-blue-900 arabic-text">{enrolledStudentsCount}</p>
              <div className="text-xs text-blue-600 mt-1">الطلاب المسجلين</div>
            </div>
            <div className="h-12 w-12 rounded-lg bg-blue-200 flex items-center justify-center shadow-md">
              <FiUsers className="text-blue-700 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl p-5 border border-emerald-200/50 shadow-lg hover:shadow-xl transition-all duration-300 islamic-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-emerald-700/80 mb-1 arabic-text font-semibold">{t('courses.price')}</p>
              <p className="text-2xl font-bold text-emerald-900 arabic-text">${(course.price || 0).toFixed(2)}</p>
              <div className="text-xs text-emerald-600 mt-1">سعر الدورة</div>
            </div>
            <div className="h-12 w-12 rounded-lg bg-emerald-200 flex items-center justify-center shadow-md">
              <FiDollarSign className="text-emerald-700 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-xl p-5 border border-amber-200/50 shadow-lg hover:shadow-xl transition-all duration-300 islamic-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-amber-700/80 mb-1 arabic-text font-semibold">{t('courses.revenue')}</p>
              <p className="text-2xl font-bold text-amber-900 arabic-text">${generatedRevenue.toFixed(2)}</p>
              <div className="text-xs text-amber-600 mt-1">الإيرادات المحققة</div>
            </div>
            <div className="h-12 w-12 rounded-lg bg-amber-200 flex items-center justify-center shadow-md">
              <FiTrendingUp className="text-amber-700 text-xl" />
            </div>
          </div>
        </div>

        {course.duration && (
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-5 border border-purple-200/50 shadow-lg hover:shadow-xl transition-all duration-300 islamic-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-purple-700/80 mb-1 arabic-text font-semibold">{t('courses.duration')}</p>
                <p className="text-2xl font-bold text-purple-900 arabic-text">{course.duration} {t('courses.hours')}</p>
                <div className="text-xs text-purple-600 mt-1">مدة الدورة</div>
              </div>
              <div className="h-12 w-12 rounded-lg bg-purple-200 flex items-center justify-center shadow-md">
                <FiClock className="text-purple-700 text-xl" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs - Islamic Theme */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-emerald-100 shadow-lg overflow-hidden islamic-border">
        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-b border-emerald-200">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-all duration-300 border-b-2 arabic-text ${
                activeTab === 'overview'
                  ? 'border-emerald-600 text-emerald-700 bg-white/50 shadow-sm'
                  : 'border-transparent text-emerald-600 hover:text-emerald-700 hover:bg-white/30'
              }`}
            >
              <span className="flex items-center gap-2">
                <FiBook />
                نظرة عامة
              </span>
            </button>
            <button
              onClick={() => setActiveTab('teacher')}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-all duration-300 border-b-2 arabic-text ${
                activeTab === 'teacher'
                  ? 'border-emerald-600 text-emerald-700 bg-white/50 shadow-sm'
                  : 'border-transparent text-emerald-600 hover:text-emerald-700 hover:bg-white/30'
              }`}
            >
              <span className="flex items-center gap-2">
                <FiUser />
                المعلمين
              </span>
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-all duration-300 border-b-2 arabic-text ${
                activeTab === 'students'
                  ? 'border-emerald-600 text-emerald-700 bg-white/50 shadow-sm'
                  : 'border-transparent text-emerald-600 hover:text-emerald-700 hover:bg-white/30'
              }`}
            >
              <span className="flex items-center gap-2">
                <FiUsers />
                الطلاب ({enrolledStudentsCount})
              </span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Action Buttons Section */}
              <div className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-xl p-4 border border-emerald-200/50 islamic-border">
                <h3 className="text-sm font-semibold text-emerald-800 dark:text-emerald-200 mb-3 arabic-text">إجراءات الدورة</h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => navigate(`/courses/${id}/edit`)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all duration-300 font-medium shadow-md arabic-text"
                  >
                    <FiEdit />
                    تعديل الدورة
                  </button>
                  
                  <button
                    onClick={() => navigate(`/courses/add`)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300 font-medium shadow-md arabic-text"
                  >
                    <FiVideo />
                    إضافة دورة جديدة
                  </button>
                  
                  <button
                    onClick={() => navigate('/users')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-300 font-medium shadow-md arabic-text"
                  >
                    <FiUsers />
                    إدارة المستخدمين
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('students')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-all duration-300 font-medium shadow-md arabic-text"
                  >
                    <FiStar />
                    عرض المشتركين
                  </button>
                </div>
              </div>
              
              {/* صورة الدورة + الفيديو التعريفي (جنباً إلى جنب) */}
              {(course.image || course.introVideoUrl) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* قسم صورة الدورة */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      {t('courses.courseImageLabel')}
                    </h3>
                    {course.image ? (
                      <div
                        className="relative group cursor-pointer rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600 shadow-sm"
                        onClick={() => setSelectedImage(course.image)}
                      >
                        <img
                          src={course.image}
                          alt={course.title}
                          className="w-full aspect-video object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                          <FiZoomIn className="text-white text-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 aspect-video flex items-center justify-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">{t('courses.noCourseImage') || 'لا توجد صورة للدورة'}</span>
                      </div>
                    )}
                  </div>

                  {/* قسم الفيديو التعريفي */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      <FiVideo />
                      {t('courses.introVideo')}
                    </h3>
                    {course.introVideoUrl ? (
                      <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600 bg-black shadow-sm">
                        {course.introVideoUrl.includes('youtube.com') || course.introVideoUrl.includes('youtu.be') ? (
                          <iframe
                            className="w-full aspect-video"
                            src={
                              course.introVideoUrl.includes('youtube.com/watch')
                                ? course.introVideoUrl.replace('watch?v=', 'embed/')
                                : course.introVideoUrl.replace('youtu.be/', 'youtube.com/embed/')
                            }
                            title="Course Intro Video"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : (
                          <video className="w-full" controls poster={course.introVideoThumbnail || course.image}>
                            <source src={course.introVideoUrl} type="video/mp4" />
                            {t('videoModal.browserNotSupported')}
                          </video>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 aspect-video flex items-center justify-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">{t('courses.noIntroVideo') || 'لا يوجد فيديو تعريفي'}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* فيديوهات الدورة (الدروس + فيديوهات إضافية) */}
              {course.lessons && course.lessons.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <FiVideo />
                    {t('courses.courseVideos') || 'فيديوهات الدورة'}
                  </h3>
                  <div className="space-y-6">
                    {course.lessons.map((lesson, lessonIndex) => (
                      <div
                        key={lesson.id}
                        className="rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            {t('courses.lessonNumber', { n: lessonIndex + 1 }) || `درس ${lessonIndex + 1}`}
                          </span>
                          <h4 className="font-semibold text-gray-900 dark:text-white mt-0.5">
                            {language === 'ar' && lesson.titleAr ? lesson.titleAr : lesson.title || `Lesson ${lessonIndex + 1}`}
                          </h4>
                          {lesson.durationMinutes > 0 && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                              <FiClock className="size-3.5" />
                              {lesson.durationMinutes} {t('courses.minutes') || 'دقيقة'}
                            </p>
                          )}
                        </div>
                        <div className="p-4">
                          {lesson.videos && lesson.videos.length > 0 ? (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                              {lesson.videos.map((video, videoIndex) => {
                                const durationMin = video.durationSeconds ? Math.floor(video.durationSeconds / 60) : 0;
                                const durationSec = video.durationSeconds ? video.durationSeconds % 60 : 0;
                                const durationStr = `${durationMin}:${String(durationSec).padStart(2, '0')}`;
                                const isYoutube = video.videoUrl && (video.videoUrl.includes('youtube.com') || video.videoUrl.includes('youtu.be'));
                                const embedUrl = isYoutube
                                  ? video.videoUrl.includes('youtube.com/watch')
                                    ? video.videoUrl.replace('watch?v=', 'embed/')
                                    : video.videoUrl.replace('youtu.be/', 'youtube.com/embed/')
                                  : null;
                                return (
                                  <div
                                    key={video.id}
                                    className="rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 overflow-hidden"
                                  >
                                    {/* مشغل الفيديو داخل الصفحة مثل الانترو */}
                                    <div className="relative aspect-video bg-black rounded-t-lg overflow-hidden">
                                      {video.videoUrl ? (
                                        isYoutube ? (
                                          <YouTubeThumbnail
                                            videoUrl={video.videoUrl}
                                            alt={video.title || `Video ${videoIndex + 1}`}
                                            className="w-full h-full rounded-t-lg"
                                            showPlayIcon={true}
                                          />
                                        ) : (
                                          <video
                                            className="w-full h-full"
                                            controls
                                            poster={video.thumbnailUrl || undefined}
                                            src={video.videoUrl}
                                          >
                                            <source src={video.videoUrl} type="video/mp4" />
                                            {t('videoModal.browserNotSupported')}
                                          </video>
                                        )
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                          <FiVideo className="size-12 text-gray-500" />
                                        </div>
                                      )}
                                      {video.durationSeconds > 0 && !video.videoUrl && (
                                        <span className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-0.5 text-xs font-medium text-white">
                                          {durationStr}
                                        </span>
                                      )}
                                    </div>
                                    <div className="p-3">
                                      <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                                        {language === 'ar' && video.titleAr ? video.titleAr : video.title || `Video ${videoIndex + 1}`}
                                      </p>
                                      {durationStr !== '0:00' && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{durationStr}</p>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400 py-2">{t('courses.noVideosInLesson') || 'لا توجد فيديوهات في هذا الدرس'}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Description</h3>
                {course.description && (
                  <div className="prose max-w-none mb-4">
                    <p className="text-gray-700 leading-relaxed">{course.description}</p>
                  </div>
                )}
                {course.descriptionAr && (
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed text-right" dir="rtl">
                      {course.descriptionAr}
                    </p>
                  </div>
                )}
              </div>

              {/* Course Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 flex">
                    {t('common.status')}
                  </label>
                  <span className={`px-3 py-1.5 inline-flex text-sm font-semibold rounded-lg ${getStatusBadge(course.status)}`}>
                    {t(`courses.${course.status.toLowerCase()}`)}
                  </span>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                    <FiDollarSign className="text-xs" />
                    {t('courses.price')}
                  </label>
                  <p className="text-lg font-bold text-emerald-700">${(course.price || 0).toFixed(2)}</p>
                </div>
                {course.duration && (
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                      <FiClock className="text-xs" />
                      {t('courses.duration')}
                    </label>
                    <p className="text-lg font-bold text-gray-900">{course.duration} {t('courses.hours')}</p>
                  </div>
                )}
              </div>

              {/* Additional Info */}
              <div className="bg-primary-50 rounded-lg p-4 border border-primary-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-600 uppercase tracking-wide mb-1 block">
                      {t('courses.courseId')}
                    </label>
                    <p className="text-sm font-mono text-gray-900">{course.id}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                      <FiCalendar className="text-xs" />
                      {t('courses.created')}
                    </label>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(course.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Teacher Tab */}
          {activeTab === 'teacher' && (
            <div className="space-y-6">
              
              {/* Teacher Management Actions */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-blue-200/50 islamic-border">
                <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-3 arabic-text">إدارة المعلمين</h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => navigate('/teachers/add')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300 font-medium shadow-md arabic-text"
                  >
                    <FiUser />
                    إضافة معلم جديد
                  </button>
                  
                  <button
                    onClick={() => navigate('/teachers')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-300 font-medium shadow-md arabic-text"
                  >
                    <FiUsers />
                    عرض جميع المعلمين
                  </button>
                  
                  <button
                    onClick={() => navigate('/teachers/add')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all duration-300 font-medium shadow-md arabic-text"
                  >
                    <FiUser />
                    إضافة معلم جديد
                  </button>
                </div>
              </div>
              {course.courseTeachers && course.courseTeachers.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {course.courseTeachers.map((ct) => (
                    <div
                      key={ct.id}
                      className="flex items-start gap-6 p-6 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => navigate(`/teachers/${ct.teacher.id}`)}
                    >
                      {ct.teacher.user?.avatar ? (
                        <img
                          src={ct.teacher.user.avatar}
                          alt={ct.teacher.user.firstName}
                          className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-md hover:opacity-90 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImage(ct.teacher.user.avatar);
                          }}
                        />
                      ) : (
                        <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center border-4 border-white shadow-md">
                          <span className="text-green-600 text-3xl font-bold">
                            {ct.teacher.user?.firstName?.charAt(0) || 'T'}
                          </span>
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          {ct.teacher.user?.firstName} {ct.teacher.user?.lastName}
                        </h3>
                        {ct.teacher.specialty && (
                          <p className="text-primary-600 font-medium mb-3 flex items-center gap-2">
                            <FiBook className="text-sm" />
                            {ct.teacher.specialty}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                          <div className="flex items-center gap-2">
                            <FiMail className="text-gray-400" />
                            {ct.teacher.user?.email}
                          </div>
                          {ct.teacher.rating && (
                            <div className="flex items-center gap-1.5">
                              <FiStar className="text-yellow-500 fill-yellow-500" />
                              <span className="font-semibold text-gray-900">{ct.teacher.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                        {ct.teacher.bio && (
                          <p className="text-gray-600 leading-relaxed">{ct.teacher.bio}</p>
                        )}
                        <button className="mt-4 px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors border border-primary-200 font-medium">
                          {t('courses.viewTeacherProfile')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : course.teacher ? (
                <div
                  className="flex items-start gap-6 p-6 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => navigate(`/teachers/${course.teacher.id}`)}
                >
                  {course.teacher.user?.avatar ? (
                    <img
                      src={course.teacher.user.avatar}
                      alt={course.teacher.user.firstName}
                      className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-md hover:opacity-90 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImage(course.teacher.user.avatar);
                      }}
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center border-4 border-white shadow-md">
                      <span className="text-green-600 text-3xl font-bold">
                        {course.teacher.user?.firstName?.charAt(0) || 'T'}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {course.teacher.user?.firstName} {course.teacher.user?.lastName}
                    </h3>
                    {course.teacher.specialty && (
                      <p className="text-primary-600 font-medium mb-3 flex items-center gap-2">
                        <FiBook className="text-sm" />
                        {course.teacher.specialty}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <FiMail className="text-gray-400" />
                        {course.teacher.user?.email}
                      </div>
                      {course.teacher.rating && (
                        <div className="flex items-center gap-1.5">
                          <FiStar className="text-yellow-500 fill-yellow-500" />
                          <span className="font-semibold text-gray-900">{course.teacher.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    {course.teacher.bio && (
                      <p className="text-gray-600 leading-relaxed">{course.teacher.bio}</p>
                    )}
                    <button className="mt-4 px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors border border-primary-200 font-medium">
                      {t('courses.viewTeacherProfile')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FiUser className="mx-auto text-4xl mb-3 text-gray-300" />
                  <p>{t('common.notAvailable')}</p>
                </div>
              )}
            </div>
          )}

          {/* Students Tab */}
          {activeTab === 'students' && (
            <div className="space-y-6">
              
              {/* Student Management Actions */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-4 border border-amber-200/50 islamic-border">
                <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-3 arabic-text">إدارة الطلاب</h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => navigate('/users/add')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-all duration-300 font-medium shadow-md arabic-text"
                  >
                    <FiUsers />
                    إضافة مستخدم جديد
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('students')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-300 font-medium shadow-md arabic-text"
                  >
                    <FiUsers />
                    عرض طلاب الدورة
                  </button>
                  
                  <button
                    onClick={() => navigate('/users')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-300 font-medium shadow-md arabic-text"
                  >
                    <FiUsers />
                    عرض جميع المستخدمين
                  </button>
                  
                  <button
                    onClick={() => navigate('/users/add')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all duration-300 font-medium shadow-md arabic-text"
                  >
                    <FiUser />
                    إضافة مستخدم جديد
                  </button>
                </div>
              </div>
              {course.enrollments && course.enrollments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {course.enrollments.map((enrollment) => (
                    <div
                      key={enrollment.id}
                      className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors group"
                      onClick={() => navigate(`/users/${enrollment.student.id}`)}
                    >
                      {enrollment.student.avatar ? (
                        <img
                          src={enrollment.student.avatar}
                          alt={enrollment.student.firstName}
                          className="h-14 w-14 rounded-full object-cover border-2 border-gray-200 group-hover:border-primary-300 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImage(enrollment.student.avatar);
                          }}
                        />
                      ) : (
                        <div className="h-14 w-14 rounded-full bg-primary-100 flex items-center justify-center border-2 border-gray-200 group-hover:border-primary-300 transition-colors">
                          <span className="text-primary-600 font-bold text-lg">
                            {enrollment.student.firstName?.charAt(0) || 'S'}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                          {enrollment.student.firstName} {enrollment.student.lastName}
                        </p>
                        <p className="text-sm text-gray-500 truncate">{enrollment.student.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <FiCalendar className="text-xs text-gray-400" />
                          <p className="text-xs text-gray-500">
                            {t('courses.enrolledAt')}: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <FiUsers className="text-2xl text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{t('courses.notEnrolledFiltered')}</h3>
                  <p className="text-sm text-gray-500">{t('courses.noLessons')}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal imageUrl={selectedImage} alt={course.title} onClose={() => setSelectedImage(null)} />
      )}
    </div>
  );
};

export default CourseDetail;
