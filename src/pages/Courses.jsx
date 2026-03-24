import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { courseAPI } from '../services/api';
import { useCurrency } from '../context/CurrencyContext';
import { toast } from 'react-toastify';
import {
  FiBook,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiSearch,
  FiEye,
  FiUsers,
  FiDollarSign,
  FiClock,
  FiTrendingUp,
  FiRefreshCw,
  FiGrid,
  FiList,
  FiStar,
} from 'react-icons/fi';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { cn } from '../lib/utils';

const Courses = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { formatCurrency } = useCurrency();
  const isRTL = language === 'ar';
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState('cards');
  const [filters, setFilters] = useState({
    status: '',
    teacherId: '',
    search: '',
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const stats = useMemo(() => {
    const total = courses.length;
    const published = courses.filter((c) => c.status === 'PUBLISHED').length;
    const draft = courses.filter((c) => c.status === 'DRAFT').length;
    const archived = courses.filter((c) => c.status === 'ARCHIVED').length;
    const featured = courses.filter((c) => c.isFeatured).length;
    const totalStudents =
      courses.reduce(
        (sum, c) =>
          sum + (c.enrolledCount || c.enrollments?.length || c._count?.enrollments || 0),
        0
      ) || 0;
    return { total, published, draft, archived, featured, totalStudents };
  }, [courses]);

  const handleToggleFeatured = async (course) => {
    try {
      await courseAPI.toggleFeatured(course.id, !course.isFeatured);
      toast.success(course.isFeatured ? t('courses.removedFeatured') || 'تم إزالة التمييز' : t('courses.markedFeatured') || 'تم تمييز الدورة');
      fetchCourses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'فشل في تغيير حالة التمييز');
    }
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 20,
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
        ...(filters.teacherId && { teacherId: filters.teacherId }),
      };
      const response = await courseAPI.getAllCourses(params);
      const coursesData = response.data.courses || response.data.data || [];
      const totalPagesData = response.data.pagination?.totalPages || response.data.totalPages || 1;
      setCourses(Array.isArray(coursesData) ? coursesData : []);
      setTotalPages(totalPagesData);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      toast.error(t('courses.deleteFailed') || 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [page, filters]);

  const openDeleteModal = (course) => {
    setCourseToDelete(course);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!courseToDelete?.id) return;
    setDeleting(true);
    try {
      await courseAPI.deleteCourse(courseToDelete.id);
      toast.success(t('courses.deleteSuccess'));
      setDeleteModalOpen(false);
      setCourseToDelete(null);
      fetchCourses();
    } catch (error) {
      toast.error(error.response?.data?.message || t('courses.deleteFailed'));
      console.error('Failed to delete course:', error);
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadgeClasses = (status) => {
    if (status === 'PUBLISHED')
      return 'rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800';
    if (status === 'DRAFT')
      return 'rounded-full bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700';
    return 'rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800';
  };

  const teacherName = (course) =>
    course.teacher?.user
      ? `${course.teacher.user.firstName || ''} ${course.teacher.user.lastName || ''}`.trim() ||
        course.teacher.user.name
      : t('common.notAvailable');

  const studentsCount = (course) =>
    course.enrolledCount || course.enrollments?.length || course._count?.enrollments || 0;

  return (
    <div
      className="flex min-h-0 flex-1 flex-col space-y-6 animate-in fade-in duration-300"
      style={{ minWidth: 0 }}
    >
      {/* Page Header */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className={cn('min-w-0', isRTL && 'sm:text-right')}>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            {t('courses.title')}
          </h1>
          <p className="mt-2 max-w-2xl text-base text-gray-600 dark:text-gray-400">
            {t('courses.manageSubtitle')}
          </p>
        </div>
        <div className={cn('flex shrink-0 flex-wrap items-center gap-2', isRTL && 'sm:flex-row-reverse')}>
          <Button
            variant="outline"
            size="default"
            onClick={() => fetchCourses()}
            disabled={loading}
            className="rounded-xl border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 shadow-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <FiRefreshCw className={cn('size-4', loading && 'animate-spin', isRTL ? 'ml-2' : 'mr-2')} />
            {t('courses.refresh')}
          </Button>
          <Button
            onClick={() => navigate('/courses/add')}
            className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-blue-800"
          >
            <FiPlus className={cn('size-4', isRTL ? 'ml-2' : 'mr-2')} />
            {t('courses.createCourse')}
          </Button>
        </div>
      </section>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-800 shadow-sm">
          <div className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {t('courses.totalCourses')}
            </p>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            <div className="mt-3 flex size-11 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400">
              <FiBook className="size-5" />
            </div>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-blue-200 dark:border-blue-800/50 bg-white dark:bg-gray-800 shadow-sm">
          <div className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {t('courses.publishedCourses')}
            </p>
            <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
              {stats.published}
            </p>
            <div className="mt-3 flex size-11 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
              <FiTrendingUp className="size-5" />
            </div>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-800 shadow-sm">
          <div className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {t('courses.totalStudents')}
            </p>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
              {stats.totalStudents}
            </p>
            <div className="mt-3 flex size-11 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400">
              <FiUsers className="size-5" />
            </div>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
          <div className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {t('courses.draftCourses')}
            </p>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
              {stats.draft + stats.archived}
            </p>
            <div className="mt-3 flex size-11 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400">
              <FiClock className="size-5" />
            </div>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-yellow-200 dark:border-yellow-800/50 bg-white dark:bg-gray-800 shadow-sm">
          <div className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {t('courses.featuredCourses') || 'دورات مميزة'}
            </p>
            <p className="mt-2 text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats.featured}
            </p>
            <div className="mt-3 flex size-11 items-center justify-center rounded-xl bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400">
              <FiStar className="size-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Search, Filter & View Toggle */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center">
            <div className={cn('relative flex-1', isRTL && 'sm:order-2')}>
              <FiSearch
                className={cn(
                  'absolute top-1/2 size-5 -translate-y-1/2 text-gray-400 dark:text-gray-500',
                  isRTL ? 'right-3' : 'left-3'
                )}
              />
              <Input
                type="text"
                placeholder={t('courses.searchPlaceholder')}
                value={filters.search}
                onChange={(e) => {
                  setPage(1);
                  setFilters({ ...filters, search: e.target.value });
                }}
                className={cn(
                  'h-10 rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500',
                  isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'
                )}
              />
            </div>
            <div className={cn('flex flex-wrap gap-3', isRTL && 'sm:order-1')}>
              <select
                value={filters.status}
                onChange={(e) => {
                  setPage(1);
                  setFilters({ ...filters, status: e.target.value });
                }}
                className="h-10 min-w-[170px] rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                <option value="">{t('users.allStatus')}</option>
                <option value="PUBLISHED">{t('courses.published')}</option>
                <option value="DRAFT">{t('courses.draft')}</option>
                <option value="ARCHIVED">{t('courses.archived')}</option>
              </select>
              <Input
                type="text"
                placeholder={t('courses.teacherIdPlaceholder')}
                value={filters.teacherId}
                onChange={(e) => {
                  setPage(1);
                  setFilters({ ...filters, teacherId: e.target.value });
                }}
                className="min-w-[140px] rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 p-1">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all',
                viewMode === 'cards'
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-600/50'
              )}
            >
              <FiGrid className="size-4" />
              {t('courses.viewCards')}
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all',
                viewMode === 'table'
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-600/50'
              )}
            >
              <FiList className="size-4" />
              {t('courses.viewTable')}
            </button>
          </div>
        </div>
      </div>

      {/* Content: Cards or Table */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="size-12 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{t('common.loading')}</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700/50">
              <FiBook className="size-12 text-gray-600 dark:text-gray-400" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
              {t('courses.emptyTitle')}
            </h2>
            <p className="mt-2 max-w-md text-center text-gray-500 dark:text-gray-400">
              {t('courses.emptySubtitle')}
            </p>
            <Button
              onClick={() => navigate('/courses/add')}
              className="mt-6 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:from-blue-700 hover:to-blue-800"
            >
              <FiPlus className={cn('size-4', isRTL ? 'ml-2' : 'mr-2')} />
              {t('courses.createCourse')}
            </Button>
          </div>
        ) : viewMode === 'table' ? (
          <CoursesTable
            courses={courses}
            isRTL={isRTL}
            t={t}
            formatCurrency={formatCurrency}
            getStatusBadgeClasses={getStatusBadgeClasses}
            teacherName={teacherName}
            studentsCount={studentsCount}
            onView={(c) => navigate(`/courses/${c.id}`)}
            onEdit={(c) => navigate(`/courses/${c.id}/edit`)}
            onDelete={openDeleteModal}
            onToggleFeatured={handleToggleFeatured}
          />
        ) : (
          <div className="p-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  isRTL={isRTL}
                  t={t}
                  formatCurrency={formatCurrency}
                  getStatusBadgeClasses={getStatusBadgeClasses}
                  teacherName={teacherName}
                  studentsCount={studentsCount}
                  onView={() => navigate(`/courses/${course.id}`)}
                  onEdit={() => navigate(`/courses/${course.id}/edit`)}
                  onDelete={() => openDeleteModal(course)}
                  onToggleFeatured={() => handleToggleFeatured(course)}
                />
              ))}
            </div>
          </div>
        )}

        {!loading && courses.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-4 py-3 sm:px-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50"
            >
              {t('common.previous')}
            </Button>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {t('users.pageOf', { page, totalPages })}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50"
            >
              {t('common.next')}
            </Button>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <AlertDialogContent className="rounded-lg border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-xl">
          <AlertDialogHeader className="border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 px-4 sm:px-6 py-3 sm:py-4">
            <AlertDialogTitle className="text-gray-900 dark:text-white">
              {t('courses.deleteConfirmTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              {t('courses.deleteConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 border-t border-gray-200 dark:border-gray-600 px-4 sm:px-6 py-4">
            <AlertDialogCancel asChild>
              <Button
                variant="outline"
                className="rounded-xl border-gray-300 dark:border-gray-600 px-5 py-2.5 font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {t('common.cancel')}
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="rounded-xl bg-red-600 px-5 py-2.5 font-medium text-white hover:bg-red-700"
              >
                {deleting ? t('common.loading') : t('common.delete')}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

function CourseCard({
  course,
  isRTL,
  t,
  getStatusBadgeClasses,
  teacherName,
  studentsCount,
  onView,
  onEdit,
  onDelete,
  formatCurrency,
  onToggleFeatured,
}) {
  const students = studentsCount(course);
  const hasDiscount =
    course.discountPrice !== null &&
    course.discountPrice !== undefined &&
    Number(course.discountPrice) >= 0;
  return (
    <div
      className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden shadow-sm transition-all duration-200 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-md cursor-pointer"
      onClick={onView}
    >
      {/* صورة الانترو / صورة الدورة */}
      <div className="relative h-40 w-full shrink-0 overflow-hidden bg-gray-100 dark:bg-gray-700">
        {course.image ? (
          <img
            src={course.image}
            alt={course.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-400 dark:text-gray-500">
            <FiBook className="size-12" />
          </div>
        )}
        <span
          className={cn(
            'absolute top-2 right-2 shrink-0 px-2.5 py-1 text-xs font-medium rounded-lg',
            getStatusBadgeClasses(course.status)
          )}
        >
          {course.status === 'PUBLISHED'
            ? t('courses.published')
            : course.status === 'DRAFT'
              ? t('courses.draft')
              : t('courses.archived')}
        </span>
        {course.isFeatured && (
          <span className="absolute top-2 left-2 flex size-8 items-center justify-center rounded-full bg-yellow-400/90 text-white shadow">
            <FiStar className="size-4 fill-current" />
          </span>
        )}
      </div>
      <div className="p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h2 className="line-clamp-2 text-base font-semibold text-gray-900 dark:text-white">
            {course.title}
          </h2>
          {course.description && (
            <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
              {course.description}
            </p>
          )}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700/50 text-xs font-semibold text-gray-600 dark:text-gray-400">
            {teacherName(course)?.[0] || 'T'}
          </div>
          <span className="font-medium text-gray-900 dark:text-white">{teacherName(course)}</span>
        </div>
        <div className={cn('text-end', isRTL && 'text-start')}>
          {hasDiscount ? (
            <>
              <p className="font-semibold text-green-600 dark:text-green-400">
                {formatCurrency(course.discountPrice ?? 0)}
              </p>
              <p className="text-xs text-gray-500 line-through">
                {formatCurrency(course.price ?? 0)}
              </p>
            </>
          ) : (
            <p className="font-semibold text-green-600 dark:text-green-400">
              {formatCurrency(course.price ?? 0)}
            </p>
          )}
          {course.duration && (
            <p className="flex items-center justify-end gap-1 text-xs">
              <FiClock className="size-3" />
              {course.duration} h
            </p>
          )}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-4">
        <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
          <FiUsers className="size-4 text-indigo-600 dark:text-indigo-400" />
          <span className="font-medium text-gray-900 dark:text-white">
            {course.sheikhCount || 0}
          </span>
          <span>{t('courses.sheikhs')}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
          <FiUsers className="size-4 text-blue-600 dark:text-blue-400" />
          <span className="font-medium text-gray-900 dark:text-white">{students}</span>
          <span>{t('courses.students')}</span>
        </div>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={onToggleFeatured}
            className={cn(
              'rounded-lg p-2 transition-colors',
              course.isFeatured
                ? 'text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
            )}
            title={course.isFeatured ? (t('courses.removeFeatured') || 'إزالة التمييز') : (t('courses.markFeatured') || 'تمييز')}
          >
            <FiStar className={cn('size-4', course.isFeatured && 'fill-current')} />
          </button>
          <button
            type="button"
            onClick={onView}
            className="rounded-lg p-2 text-blue-600 dark:text-blue-400 transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20"
            title={t('courses.viewDetails')}
          >
            <FiEye className="size-4" />
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="rounded-lg p-2 text-blue-600 dark:text-blue-400 transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20"
            title={t('courses.editCourse')}
          >
            <FiEdit className="size-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg p-2 text-red-600 dark:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
            title={t('common.delete')}
          >
            <FiTrash2 className="size-4" />
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}

function CoursesTable({
  courses,
  isRTL,
  t,
  getStatusBadgeClasses,
  teacherName,
  studentsCount,
  onView,
  onEdit,
  onDelete,
  onToggleFeatured,
  formatCurrency,
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700">
          <TableHead
            className={cn(
              'px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-start'
            )}
          >
            {t('courses.course')}
          </TableHead>
          <TableHead
            className={cn(
              'px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-start'
            )}
          >
            {t('bookings.teacher')}
          </TableHead>
          <TableHead
            className={cn(
              'px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-start'
            )}
          >
            {t('courses.price')}
          </TableHead>
          <TableHead
            className={cn(
              'px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-start'
            )}
          >
            {t('courses.students')}
          </TableHead>
          <TableHead
            className={cn(
              'px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-start'
            )}
          >
            {t('common.status')}
          </TableHead>
          <TableHead className="w-32 px-6 py-3 text-end" />
        </TableRow>
      </TableHeader>
      <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
        {courses.map((course) => (
          <TableRow
            key={course.id}
            className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 border-gray-200 dark:border-gray-700"
          >
            <TableCell className="px-6 py-4 text-sm whitespace-nowrap">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{course.title}</p>
                {course.description && (
                  <p className="mt-0.5 line-clamp-1 text-xs text-gray-600 dark:text-gray-400">
                    {course.description}
                  </p>
                )}
              </div>
            </TableCell>
            <TableCell className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
              {teacherName(course)}
            </TableCell>
            <TableCell className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
              {course.discountPrice !== null && course.discountPrice !== undefined ? (
                <div>
                  <div>{formatCurrency(course.discountPrice ?? 0)}</div>
                  <div className="text-xs text-gray-500 line-through">
                    {formatCurrency(course.price ?? 0)}
                  </div>
                </div>
              ) : (
                formatCurrency(course.price ?? 0)
              )}
            </TableCell>
            <TableCell className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
              {studentsCount(course)}
            </TableCell>
            <TableCell className="px-6 py-4 whitespace-nowrap">
              <span
                className={cn(
                  'inline-flex px-2.5 py-1 text-xs font-medium',
                  getStatusBadgeClasses(course.status)
                )}
              >
                {course.status === 'PUBLISHED'
                  ? t('courses.published')
                  : course.status === 'DRAFT'
                    ? t('courses.draft')
                    : t('courses.archived')}
              </span>
            </TableCell>
            <TableCell className="px-6 py-4 text-end">
              <div className={cn('flex items-center justify-end gap-1', isRTL && 'flex-row-reverse')}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn('h-8', course.isFeatured ? 'text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50')}
                  onClick={() => onToggleFeatured(course)}
                  title={course.isFeatured ? (t('courses.removeFeatured') || 'إزالة التمييز') : (t('courses.markFeatured') || 'تمييز')}
                >
                  <FiStar className={cn('size-4', course.isFeatured && 'fill-current')} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  onClick={() => onView(course)}
                >
                  <FiEye className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  onClick={() => onEdit(course)}
                >
                  <FiEdit className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={() => onDelete(course)}
                >
                  <FiTrash2 className="size-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default Courses;
