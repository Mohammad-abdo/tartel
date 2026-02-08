import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { adminAPI, teacherAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FiSearch, FiCheckCircle, FiXCircle, FiCalendar, FiEdit, FiEye, FiPlus, FiTrash2, FiUsers, FiClock, FiBookOpen, FiAward, FiRefreshCw } from 'react-icons/fi';
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
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className={cn('min-w-0', isRTL && 'sm:text-right')}>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">{t('teachers.title')}</h1>
          <p className="mt-2 max-w-2xl text-base text-gray-600 dark:text-gray-400">{t('teachers.manageSubtitle')}</p>
        </div>
        <div className={cn('flex shrink-0 flex-wrap items-center gap-2', isRTL && 'sm:flex-row-reverse')}>
          <button type="button" onClick={() => fetchTeachers()} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700">
            <FiRefreshCw className={cn('size-4', loading && 'animate-spin', isRTL ? 'ml-2' : 'mr-2')} />
            {t('common.refresh')}
          </button>
          <button type="button" onClick={() => navigate('/teachers/add')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-orange-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:from-orange-700 hover:to-orange-800">
            <FiPlus className={cn('size-4', isRTL ? 'ml-2' : 'mr-2')} />
            {t('teachers.addTeacher')}
          </button>
        </div>
      </section>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
          <div className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('teachers.totalTeachers')}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            <div className="mt-3 flex size-11 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
              <FiUsers className="size-5" />
            </div>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-emerald-200 dark:border-emerald-800/50 bg-white dark:bg-gray-800 shadow-sm">
          <div className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('teachers.approved')}</p>
            <p className="mt-2 text-3xl font-bold text-emerald-600 dark:text-emerald-400">{stats.approved}</p>
            <div className="mt-3 flex size-11 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
              <FiCheckCircle className="size-5" />
            </div>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-amber-200 dark:border-amber-800/50 bg-white dark:bg-gray-800 shadow-sm">
          <div className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('teachers.pending')}</p>
            <p className="mt-2 text-3xl font-bold text-amber-600 dark:text-amber-400">{stats.pending}</p>
            <div className="mt-3 flex size-11 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
              <FiClock className="size-5" />
            </div>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-800 shadow-sm">
          <div className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('teachers.totalCourses')}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats.totalCourses}</p>
            <div className="mt-3 flex size-11 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400">
              <FiBookOpen className="size-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className={cn('relative flex-1', isRTL && 'md:order-2')}>
            <FiSearch className={cn('absolute top-1/2 size-5 -translate-y-1/2 text-gray-400 dark:text-gray-500', isRTL ? 'right-3' : 'left-3')} />
            <input type="text" placeholder={t('teachers.searchPlaceholder')} value={filters.search} onChange={(e) => { setPage(1); setFilters({ ...filters, search: e.target.value }); }} className={cn('h-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 focus:ring-2 focus:ring-orange-500', isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4')} />
          </div>
          <div className={cn('flex flex-wrap gap-3', isRTL && 'md:order-1')}>
            <select value={filters.isApproved} onChange={(e) => { setPage(1); setFilters({ ...filters, isApproved: e.target.value }); }} className="h-10 min-w-[170px] rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500">
              <option value="">{t('teachers.allTeachers')}</option>
              <option value="true">{t('teachers.approved')}</option>
              <option value="false">{t('teachers.pendingApproval')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Teachers list */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="size-12 animate-spin rounded-full border-2 border-orange-600 border-t-transparent" />
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{t('common.loading')}</p>
          </div>
        ) : teachers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
              <FiUsers className="size-12 text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">{t('teachers.emptyTitle')}</h2>
            <p className="mt-2 max-w-md text-center text-gray-500 dark:text-gray-400">{t('teachers.emptySubtitle')}</p>
            <button type="button" onClick={() => navigate('/teachers/add')} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-orange-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:from-orange-700 hover:to-orange-800">
              <FiPlus className={cn('size-4', isRTL ? 'ml-2' : 'mr-2')} />
              {t('teachers.addTeacher')}
            </button>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {teachers.map((teacher) => {
                const fullName = teacher.user?.firstName && teacher.user?.lastName
                  ? `${teacher.user.firstName} ${teacher.user.lastName}`
                  : teacher.user?.name || t('common.notAvailable');
                
                return (
                  <div
                    key={teacher.id}
                    className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:border-orange-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-orange-800 cursor-pointer flex flex-col"
                    onClick={() => navigate(`/teachers/${teacher.id}`)}
                  >
                    {/* Card Header */}
                    <div className="relative h-28 bg-gradient-to-br from-orange-500 to-orange-600">
                      <div className="flex h-full w-full items-center justify-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg dark:bg-gray-800">
                          <span className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                            {teacher.user?.firstName?.charAt(0) || teacher.user?.name?.charAt(0) || teacher.user?.email?.charAt(0) || 'T'}
                          </span>
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/5 to-transparent" />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-sm ${getStatusBadge(
                            teacher.isApproved
                          )}`}
                        >
                          {teacher.isApproved
                            ? t('teachers.approved')
                            : t('dashboard.pending')}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3 flex gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/teachers/${teacher.id}`);
                          }}
                          className="p-1.5 rounded-full bg-white/90 text-gray-700 hover:bg-white hover:text-orange-600 transition-colors shadow-sm dark:bg-gray-800/90 dark:text-gray-200"
                          title={t('teachers.viewDetails')}
                        >
                          <FiEye className="text-sm" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/teachers/${teacher.id}/edit`);
                          }}
                          className="p-1.5 rounded-full bg-white/90 text-gray-700 hover:bg-white hover:text-orange-600 transition-colors shadow-sm dark:bg-gray-800/90 dark:text-gray-200"
                          title={t('teachers.editTeacher')}
                        >
                          <FiEdit className="text-sm" />
                        </button>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="flex-1 flex flex-col p-4 space-y-3">
                      <div>
                        <h2 className="text-base font-semibold text-gray-900 line-clamp-1 mb-1">
                          {fullName}
                        </h2>
                        <p className="text-xs text-gray-500 line-clamp-1 mb-2">
                          {teacher.user?.email}
                        </p>
                        {teacher.specialization && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-2">
                            <FiAward className="text-orange-500 dark:text-orange-400" />
                            <span className="line-clamp-1">{teacher.specialization}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <FiBookOpen className="text-sm text-orange-500 dark:text-orange-400" />
                          <span className="font-medium text-gray-900">{teacher._count?.courses || 0}</span>
                          <span>{t('courses.courses')}</span>
                        </div>
                        {teacher.yearsOfExperience && (
                          <div className="flex items-center gap-1.5">
                            <FiClock className="text-sm text-gray-400" />
                            <span>{teacher.yearsOfExperience} {t('teachers.years')}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/teachers/${teacher.id}`);
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300"
                        >
                          <FiEye className="text-sm" />
                          {t('common.view')}
                        </button>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/teachers/${teacher.id}/edit`);
                            }}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-400"
                          >
                            <FiEdit className="text-sm" />
                            {t('common.edit')}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              // View schedule action
                            }}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700"
                          >
                            <FiCalendar className="text-sm" />
                            {t('teachers.schedule')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
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
          </div>
        )}
      </div>
    </div>
  );
};

export default Teachers;

