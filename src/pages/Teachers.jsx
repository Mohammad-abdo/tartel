import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { adminAPI, teacherAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FiSearch, FiCheckCircle, FiXCircle, FiCalendar, FiEdit, FiEye, FiPlus, FiTrash2, FiUsers, FiClock, FiBookOpen, FiAward, FiRefreshCw, FiGrid, FiList, FiMail, FiPhone, FiStar, FiUser } from 'react-icons/fi';
import { cn } from '../lib/utils';

const Teachers = () => {
  // Teachers management page
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    isApproved: '',
    search: '',
  });
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'

  const stats = useMemo(() => {
    const total = teachers.length;
    const approved = teachers.filter((t) => t.isApproved).length;
    const pending = teachers.filter((t) => !t.isApproved).length;
    const totalCourses = teachers.reduce((sum, t) => sum + (t._count?.courses || 0), 0);
    return { total, approved, pending, totalCourses };
  }, [teachers]);

  useEffect(() => {
    fetchTeachers();
  }, [page, filters]);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 20,
        ...(filters.isApproved && { isApproved: filters.isApproved }),
      };
      const response = await adminAPI.getTeachers(params);
      // Backend returns: { teachers: [...], pagination: { page, limit, total, totalPages } }
      const teachersData = response.data.teachers || response.data.data || [];
      const totalPagesData = response.data.pagination?.totalPages || response.data.totalPages || 1;
      setTeachers(Array.isArray(teachersData) ? teachersData : []);
      console.log(teachersData);
      
      setTotalPages(totalPagesData);
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
      console.error('Error details:', error.response?.data); // Debug log
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (isApproved) => {
    return isApproved
      ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200'
      : 'bg-amber-50 text-amber-800 ring-1 ring-amber-200';
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
            {isRTL ? 'إدارة شيوخ ومعلمي القرآن الكريم' : 'Managing Quran Teachers and Sheikhs'}
          </p>
        </div>
      </div>

      {/* Page header */}
      <section className="islamic-border p-6 bg-gradient-to-r from-emerald-50 via-white to-amber-50 dark:from-emerald-900/20 dark:via-gray-800 dark:to-amber-900/20 rounded-xl shadow-lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className={cn('space-y-3', isRTL && 'sm:text-right')}>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
                <FiUsers className="size-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-emerald-800 dark:text-emerald-200 sm:text-4xl font-alexandria">{t('teachers.title') || 'الشيوخ والمعلمون'}</h1>
                <p className="text-amber-700 dark:text-amber-300 text-sm font-alexandria">{isRTL ? 'حفظة كتاب الله العزيز' : 'Guardians of Allah\'s Noble Book'}</p>
              </div>
            </div>
            <p className="max-w-2xl text-base text-emerald-700 dark:text-emerald-300 font-alexandria">{t('teachers.manageSubtitle') || 'إدارة شيوخ ومعلمي القرآن الكريم'}</p>
            <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
              <span className="font-alexandria">{isRTL ? 'وقل رب زدني علماً' : 'And say: My Lord, increase me in knowledge'}</span>
            </div>
          </div>
          <div className={cn('flex shrink-0 flex-wrap items-center gap-3', isRTL && 'sm:flex-row-reverse')}>
            {/* View Mode Toggle */}
            <div className="flex gap-1 islamic-border bg-gradient-to-r from-emerald-50 to-amber-50 dark:from-emerald-900/20 dark:to-amber-900/20 p-1 rounded-lg">
              <button 
                type="button" 
                onClick={() => setViewMode('cards')} 
                className={cn('islamic-button-secondary p-2', viewMode === 'cards' && 'islamic-button-primary')}
                title={isRTL ? 'عرض الكروت' : 'Cards View'}
              >
                <FiGrid className="size-4" />
              </button>
              <button 
                type="button" 
                onClick={() => setViewMode('table')} 
                className={cn('islamic-button-secondary p-2', viewMode === 'table' && 'islamic-button-primary')}
                title={isRTL ? 'عرض الجدول' : 'Table View'}
              >
                <FiList className="size-4" />
              </button>
            </div>
            
            <button type="button" onClick={() => fetchTeachers()} disabled={loading} className="islamic-button-secondary">
              <FiRefreshCw className={cn('size-4', loading && 'animate-spin', isRTL ? 'ml-2' : 'mr-2')} />
              {t('common.refresh')}
            </button>
            <button type="button" onClick={() => navigate('/teachers/add')} className="islamic-button-primary">
              <FiPlus className={cn('size-4', isRTL ? 'ml-2' : 'mr-2')} />
              {t('teachers.addTeacher')}
            </button>
          </div>
        </div>
      </section>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="islamic-card group hover:shadow-xl transition-all duration-300">
          <div className="islamic-border-gradient p-5 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 font-alexandria">{t('teachers.totalTeachers') || 'إجمالي المعلمين'}</p>
                <p className="mt-2 text-3xl font-bold text-emerald-800 dark:text-emerald-200">{stats.total}</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-alexandria">{isRTL ? 'جميع الشيوخ' : 'All Teachers'}</p>
              </div>
              <div className="flex size-14 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FiUsers className="size-6 text-white" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="islamic-card group hover:shadow-xl transition-all duration-300">
          <div className="islamic-border-gradient p-5 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-green-700 dark:text-green-300 font-alexandria">{t('teachers.approved') || 'معتمدون'}</p>
                <p className="mt-2 text-3xl font-bold text-green-800 dark:text-green-200">{stats.approved}</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-alexandria">{isRTL ? 'شيوخ معتمدون' : 'Approved Teachers'}</p>
              </div>
              <div className="flex size-14 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FiCheckCircle className="size-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="islamic-card group hover:shadow-xl transition-all duration-300">
          <div className="islamic-border-gradient p-5 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300 font-alexandria">{t('teachers.pending') || 'قيد المراجعة'}</p>
                <p className="mt-2 text-3xl font-bold text-amber-800 dark:text-amber-200">{stats.pending}</p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-alexandria">{isRTL ? 'ينتظرون الموافقة' : 'Awaiting Approval'}</p>
              </div>
              <div className="flex size-14 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FiClock className="size-6 text-white" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="islamic-card group hover:shadow-xl transition-all duration-300">
          <div className="islamic-border-gradient p-5 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300 font-alexandria">{t('teachers.totalCourses') || 'إجمالي الدورات'}</p>
                <p className="mt-2 text-3xl font-bold text-blue-800 dark:text-blue-200">{stats.totalCourses}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-alexandria">{isRTL ? 'دورات تعليمية' : 'Teaching Courses'}</p>
              </div>
              <div className="flex size-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FiBookOpen className="size-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="islamic-card p-5 bg-gradient-to-r from-emerald-50/50 via-white to-amber-50/50 dark:from-emerald-900/10 dark:via-gray-800 dark:to-amber-900/10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className={cn('relative flex-1', isRTL && 'md:order-2')}>
            <FiSearch className={cn('absolute top-1/2 size-5 -translate-y-1/2 text-emerald-500 dark:text-emerald-400', isRTL ? 'right-3' : 'left-3')} />
            <input 
              type="text" 
              placeholder={t('teachers.searchPlaceholder') || 'البحث في المعلمين...'}
              value={filters.search} 
              onChange={(e) => { setPage(1); setFilters({ ...filters, search: e.target.value }); }} 
              className={cn('h-10 islamic-input font-alexandria', isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4')} 
            />
          </div>
          <div className={cn('flex flex-wrap gap-3', isRTL && 'md:order-1')}>
            <select 
              value={filters.isApproved} 
              onChange={(e) => { setPage(1); setFilters({ ...filters, isApproved: e.target.value }); }} 
              className="h-10 min-w-[170px] islamic-select font-alexandria"
            >
              <option value="">{t('teachers.allTeachers') || 'جميع المعلمين'}</option>
              <option value="true">{t('teachers.approved') || 'معتمد'}</option>
              <option value="false">{t('teachers.pendingApproval') || 'قيد المراجعة'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Teachers list */}
      <div className="islamic-card bg-gradient-to-br from-emerald-50/30 via-white to-amber-50/30 dark:from-emerald-900/10 dark:via-gray-800 dark:to-amber-900/10 shadow-xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="islamic-spinner islamic-spinner-dual size-12" />
            <p className="mt-4 text-sm text-emerald-600 dark:text-emerald-400 font-alexandria">{t('common.loading') || 'جاري التحميل...'}</p>
          </div>
        ) : teachers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-amber-100 dark:from-emerald-900/30 dark:to-amber-900/30 shadow-lg">
              <FiUsers className="size-12 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-emerald-800 dark:text-emerald-200 font-alexandria">{t('teachers.emptyTitle') || 'لا يوجد شيوخ'}</h2>
            <p className="mt-2 max-w-md text-center text-emerald-600 dark:text-emerald-400 font-alexandria">{t('teachers.emptySubtitle') || 'لم يتم العثور على أي شيوخ في النظام'}</p>
            <div className="mt-4 text-center text-xs text-amber-600 dark:text-amber-400 font-alexandria">
              {isRTL ? 'ومن أحيا نفساً فكأنما أحيا الناس جميعاً' : 'And whoever saves a life, it is as if he saved all of mankind'}
            </div>
            <button type="button" onClick={() => navigate('/teachers/add')} className="mt-6 islamic-button-primary">
              <FiPlus className={cn('size-4', isRTL ? 'ml-2' : 'mr-2')} />
              {t('teachers.addTeacher') || 'إضافة شيخ جديد'}
            </button>
          </div>
        ) : (
          <div className="p-6">
            {viewMode === 'cards' ? (
              // Cards View
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {teachers.map((teacher) => {
                  const fullName = teacher.user?.firstName && teacher.user?.lastName
                    ? `${teacher.user.firstName} ${teacher.user.lastName}`
                    : teacher.user?.name || t('common.notAvailable');
                  const fullNameAr = teacher.user?.firstNameAr && teacher.user?.lastNameAr
                    ? `${teacher.user.firstNameAr} ${teacher.user.lastNameAr}`
                    : null;
                  
                  return (
                    <div
                      key={teacher.id}
                      className="group islamic-card islamic-pattern bg-gradient-to-br from-white via-emerald-50/30 to-amber-50/30 dark:from-gray-800 dark:via-emerald-900/10 dark:to-amber-900/10 cursor-pointer overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300"
                      onClick={() => navigate(`/teachers/${teacher.id}`)}
                    >
                      {/* Header with Image */}
                      <div className="relative h-32 bg-gradient-to-br from-emerald-500 via-emerald-600 to-amber-500 islamic-pattern">
                        {/* Avatar */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="relative">
                            {teacher.user?.avatar ? (
                              <img
                                src={teacher.user.image}
                                alt={fullName}
                                className="w-20 h-20 rounded-full object-cover shadow-xl ring-4 ring-white/50 backdrop-blur-sm"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div 
                              className={`w-20 h-20 rounded-full bg-white dark:bg-gray-800 shadow-xl ring-4 ring-white/50 flex items-center justify-center ${teacher.user?.avatar ? 'hidden' : 'flex'}`}
                            >
                              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-alexandria">
                                {teacher.user?.firstName?.charAt(0) || teacher.user?.name?.charAt(0) || teacher.user?.email?.charAt(0) || 'ش'}
                              </span>
                            </div>
                            {/* Online Status Indicator */}
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg">
                              <div className={`w-4 h-4 rounded-full ${teacher.isApproved ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`}></div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Status Badge */}
                        <div className="absolute top-3 left-3">
                          <span
                            className={cn(
                              'px-3 py-1.5 rounded-full text-xs font-bold font-alexandria shadow-lg backdrop-blur-sm',
                              teacher.isApproved
                                ? 'bg-green-500/90 text-white ring-2 ring-green-400/50'
                                : 'bg-amber-500/90 text-white ring-2 ring-amber-400/50'
                            )}
                          >
                            {teacher.isApproved ? (
                              <div className="flex items-center gap-1">
                                <FiCheckCircle className="size-3" />
                                {isRTL ? 'معتمد' : 'Approved'}
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <FiClock className="size-3" />
                                {isRTL ? 'قيد المراجعة' : 'Pending'}
                              </div>
                            )}
                          </span>
                        </div>
                        
                        {/* Teacher Type Badge */}
                        <div className="absolute top-3 right-3">
                          <span className="px-2 py-1 rounded-full text-xs font-bold bg-white/90 text-emerald-700 shadow-lg font-alexandria">
                            <div className="flex items-center gap-1">
                              <FiStar className="size-3" />
                              {isRTL ? 'شيخ' : 'Sheikh'}
                            </div>
                          </span>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="absolute bottom-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/teachers/${teacher.id}`);
                            }}
                            className="p-2 rounded-lg bg-white/90 dark:bg-gray-800/90 text-emerald-600 dark:text-emerald-400 hover:bg-white dark:hover:bg-gray-800 shadow-lg hover:scale-110 transition-all duration-200"
                            title={isRTL ? 'عرض التفاصيل' : 'View Details'}
                          >
                            <FiEye className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/teachers/${teacher.id}/edit`);
                            }}
                            className="p-2 rounded-lg bg-white/90 dark:bg-gray-800/90 text-amber-600 dark:text-amber-400 hover:bg-white dark:hover:bg-gray-800 shadow-lg hover:scale-110 transition-all duration-200"
                            title={isRTL ? 'تعديل البيانات' : 'Edit Teacher'}
                          >
                            <FiEdit className="size-4" />
                          </button>
                        </div>
                      </div>

                      {/* Body */}
                      <div className="p-5 space-y-4">
                        {/* Name and Basic Info */}
                        <div className="text-center space-y-2">
                          <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-200 font-alexandria line-clamp-1">
                            {fullNameAr || fullName}
                          </h3>
                          {fullNameAr && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-sans line-clamp-1">
                              {fullName}
                            </p>
                          )}
                          <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <FiMail className="size-3 text-emerald-500" />
                            <span className="line-clamp-1">{teacher.user?.email}</span>
                          </div>
                        </div>

                        {/* Specialization */}
                        {teacher.specialization && (
                          <div className="text-center">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-emerald-100 to-amber-100 dark:from-emerald-900/30 dark:to-amber-900/30 rounded-lg text-xs font-semibold text-emerald-700 dark:text-emerald-300 font-alexandria">
                              <FiAward className="size-3 text-amber-500" />
                              <span className="line-clamp-1">{teacher.specialization}</span>
                            </div>
                          </div>
                        )}


                        {/* Statistics */}
                        <div className="flex justify-center gap-3 w-full max-w-xs">
                        { teacher.teacherType === 'COURSE_SHEIKH'&& (
                          <div className="flex-1 text-center p-2 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-lg">
                            <div className=" text-lg font-bold text-emerald-700 dark:text-emerald-300">
                              {teacher._count?.courses || 0}
                            </div>
                            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-alexandria">
                              {isRTL ? 'دورة' : 'Courses'}
                            </div>
                          </div>)}
                          
                          <div className="flex-1 text-center p-2 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-lg">
                            <div className="text-lg font-bold text-amber-700 dark:text-amber-300">
                              {teacher.yearsOfExperience || 0}
                            </div>
                            <div className="text-xs text-amber-600 dark:text-amber-400 font-alexandria">
                              {isRTL ? 'سنة خبرة' : 'Years Exp.'}
                            </div>
                          </div>
                        </div>

                        {/* Phone */}
                        {teacher.user?.phone && (
                          <div className="text-center">
                            <div className="inline-flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                              <FiPhone className="size-3 text-emerald-500" />
                              <span>{teacher.user.phone}</span>
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="pt-3 border-t border-emerald-100 dark:border-emerald-800/50 flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/teachers/${teacher.id}`);
                            }}
                            className="islamic-button-primary-ghost px-3 py-1.5 text-xs font-alexandria"
                          >
                            <FiEye className="size-3 mr-1" />
                            {isRTL ? 'عرض' : 'View'}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/teachers/${teacher.id}/edit`);
                            }}
                            className="islamic-button-secondary-ghost px-3 py-1.5 text-xs font-alexandria"
                          >
                            <FiEdit className="size-3 mr-1" />
                            {isRTL ? 'تعديل' : 'Edit'}
                          </button>
                        </div>

                        {/* Islamic Blessing */}
                        <div className="text-center pt-2">
                          <span className="text-xs text-emerald-600/70 dark:text-emerald-400/70 font-alexandria italic">
                            {isRTL ? 'بارك الله فيه وفي علمه' : 'May Allah bless him and his knowledge'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Table View
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-emerald-200 dark:divide-emerald-700">
                  <thead className="bg-gradient-to-r from-emerald-50 to-amber-50 dark:from-emerald-900/20 dark:to-amber-900/20">
                    <tr>
                      <th className="px-6 py-4 text-right text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider font-alexandria">
                        {isRTL ? 'الشيخ' : 'Teacher'}
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider font-alexandria">
                        {isRTL ? 'التخصص' : 'Specialization'}
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider font-alexandria">
                        {isRTL ? 'الحالة' : 'Status'}
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider font-alexandria">
                        {isRTL ? 'الدورات' : 'Courses'}
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider font-alexandria">
                        {isRTL ? 'الخبرة' : 'Experience'}
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider font-alexandria">
                        {isRTL ? 'الإجراءات' : 'Actions'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-emerald-100 dark:divide-emerald-800/50">
                    {teachers.map((teacher, index) => {
                      const fullName = teacher.user?.firstName && teacher.user?.lastName
                        ? `${teacher.user.firstName} ${teacher.user.lastName}`
                        : teacher.user?.name || t('common.notAvailable');
                      const fullNameAr = teacher.user?.firstNameAr && teacher.user?.lastNameAr
                        ? `${teacher.user.firstNameAr} ${teacher.user.lastNameAr}`
                        : null;
                        
                      return (
                        <tr 
                          key={teacher.id} 
                          className="hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-amber-50/50 dark:hover:from-emerald-900/10 dark:hover:to-amber-900/10 cursor-pointer transition-colors duration-200"
                          onClick={() => navigate(`/teachers/${teacher.id}`)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                {teacher.user?.image ? (
                                  <img
                                    src={teacher.user.image}
                                    alt={fullName}
                                    className="w-12 h-12 rounded-full object-cover shadow-lg ring-2 ring-emerald-200 dark:ring-emerald-700"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'flex';
                                    }}
                                  />
                                ) : null}
                                <div 
                                  className={`w-12 h-12 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-800 dark:to-emerald-900 shadow-lg ring-2 ring-emerald-200 dark:ring-emerald-700 flex items-center justify-center ${teacher.user?.avatar ? 'hidden' : 'flex'}`}
                                >
                                  <span className="text-lg font-bold text-emerald-700 dark:text-emerald-300 font-alexandria">
                                    {teacher.user?.firstName?.charAt(0) || teacher.user?.name?.charAt(0) || teacher.user?.email?.charAt(0) || 'ش'}
                                  </span>
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
                                  <div className={`w-3 h-3 rounded-full ${teacher.isApproved ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                                </div>
                              </div>
                              <div>
                                <div className="text-sm font-bold text-emerald-800 dark:text-emerald-200 font-alexandria">
                                  {fullNameAr || fullName}
                                </div>
                                {fullNameAr && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400 font-sans">
                                    {fullName}
                                  </div>
                                )}
                                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                                  <FiMail className="size-3" />
                                  {teacher.user?.email}
                                </div>
                                {teacher.user?.phone && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                                    <FiPhone className="size-3" />
                                    {teacher.user?.phone}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {teacher.specialization ? (
                              <div className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-emerald-100 to-amber-100 dark:from-emerald-900/30 dark:to-amber-900/30 rounded-lg text-xs font-semibold text-emerald-700 dark:text-emerald-300 font-alexandria">
                                <FiAward className="size-3 text-amber-500" />
                                {teacher.specialization}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400 dark:text-gray-500 font-alexandria">
                                {isRTL ? 'غير محدد' : 'Not specified'}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span
                              className={cn(
                                'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold font-alexandria',
                                teacher.isApproved
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 ring-1 ring-green-300 dark:ring-green-700'
                                  : 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 ring-1 ring-amber-300 dark:ring-amber-700'
                              )}
                            >
                              {teacher.isApproved ? (
                                <>
                                  <FiCheckCircle className="size-3" />
                                  {isRTL ? 'معتمد' : 'Approved'}
                                </>
                              ) : (
                                <>
                                  <FiClock className="size-3" />
                                  {isRTL ? 'قيد المراجعة' : 'Pending'}
                                </>
                              )}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                              {teacher._count?.courses || 0}
                            </div>
                            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-alexandria">
                              {isRTL ? 'دورة' : 'courses'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="text-lg font-bold text-amber-700 dark:text-amber-300">
                              {teacher.yearsOfExperience || 0}
                            </div>
                            <div className="text-xs text-amber-600 dark:text-amber-400 font-alexandria">
                              {isRTL ? 'سنة' : 'years'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/teachers/${teacher.id}`);
                                }}
                                className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-800/50 transition-colors duration-200"
                                title={isRTL ? 'عرض التفاصيل' : 'View Details'}
                              >
                                <FiEye className="size-4" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/teachers/${teacher.id}/edit`);
                                }}
                                className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-800/50 transition-colors duration-200"
                                title={isRTL ? 'تعديل البيانات' : 'Edit Teacher'}
                              >
                                <FiEdit className="size-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="islamic-border-top mt-8 pt-6 bg-gradient-to-r from-emerald-50/50 to-amber-50/50 dark:from-emerald-900/10 dark:to-amber-900/10 rounded-lg">
                <div className="flex items-center justify-between px-4">
                  <button 
                    type="button" 
                    onClick={() => setPage((p) => Math.max(1, p - 1))} 
                    disabled={page === 1} 
                    className="islamic-button-secondary disabled:opacity-50 font-alexandria"
                  >
                    <FiCalendar className="size-4 mr-2" />
                    {t('common.previous') || 'السابق'}
                  </button>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-700 dark:text-emerald-300 font-alexandria text-sm">
                      {isRTL ? `صفحة ${page} من ${totalPages}` : `Page ${page} of ${totalPages}`}
                    </span>
                  </div>
                  
                  <button 
                    type="button" 
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))} 
                    disabled={page === totalPages} 
                    className="islamic-button-secondary disabled:opacity-50 font-alexandria"
                  >
                    {t('common.next') || 'التالي'}
                    <FiCalendar className="size-4 ml-2" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Teachers;