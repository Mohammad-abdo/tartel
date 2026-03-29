import { useEffect, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { adminAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiBook, FiLayers, FiUser } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { cn } from '../lib/utils';

const CourseEnrollmentDetail = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { formatCurrency } = useCurrency();
  const isRTL = language === 'ar';
  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await adminAPI.getCourseEnrollmentById(id);
      setRow(res.data);
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
      setRow(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const courseTitle = (c) =>
    (isRTL ? c?.titleAr || c?.title : c?.title || c?.titleAr) || '—';
  const studentName = (s) =>
    [s?.firstNameAr || s?.firstName, s?.lastNameAr || s?.lastName].filter(Boolean).join(' ').trim() ||
    s?.email ||
    '—';
  const sheikhName = (c) => {
    const u = c?.teacher?.user;
    if (!u) return '—';
    return isRTL
      ? [u.firstNameAr || u.firstName, u.lastNameAr || u.lastName].filter(Boolean).join(' ').trim()
      : [u.firstName, u.lastName].filter(Boolean).join(' ').trim();
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500 font-alexandria" style={{ fontFamily: 'Alexandria, sans-serif' }}>
        {t('common.loading')}
      </div>
    );
  }

  if (!row) {
    return (
      <div className="p-8 text-center space-y-4" style={{ fontFamily: 'Alexandria, sans-serif' }}>
        <p className="text-gray-600 dark:text-gray-400 font-alexandria">{t('courseEnrollments.notFound')}</p>
        <Link to="/course-enrollments" className="inline-flex items-center gap-2 text-emerald-600 font-alexandria">
          <FiArrowLeft className="size-4" />
          {t('courseEnrollments.backToList')}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl animate-fade-in" style={{ fontFamily: 'Alexandria, sans-serif' }}>
      <Link
        to="/course-enrollments"
        className="inline-flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400 hover:underline font-alexandria"
      >
        <FiArrowLeft className="size-4" />
        {t('courseEnrollments.backToList')}
      </Link>

      <section className="islamic-border p-6 bg-gradient-to-r from-teal-50 via-white to-amber-50 dark:from-teal-900/20 dark:via-gray-800 dark:to-amber-900/20 rounded-xl shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl">
            <FiLayers className="size-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-emerald-800 dark:text-emerald-200 font-alexandria">{t('courseEnrollments.detailTitle')}</h1>
            <p className="text-xs text-gray-500 font-mono">{row.id}</p>
          </div>
        </div>

        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-emerald-100 dark:border-emerald-900/50 p-4 bg-white/80 dark:bg-gray-900/40">
            <dt className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide font-alexandria">
              <FiUser className="size-3.5" />
              {t('courseEnrollments.student')}
            </dt>
            <dd className="mt-2 text-lg font-medium text-gray-900 dark:text-white font-alexandria">{studentName(row.student)}</dd>
            <dd className="text-sm text-gray-500">{row.student?.email}</dd>
            {row.student?.phone && <dd className="text-sm text-gray-500">{row.student.phone}</dd>}
          </div>

          <div className="rounded-lg border border-emerald-100 dark:border-emerald-900/50 p-4 bg-white/80 dark:bg-gray-900/40">
            <dt className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide font-alexandria">
              <FiBook className="size-3.5" />
              {t('courseEnrollments.course')}
            </dt>
            <dd className="mt-2 text-lg font-medium text-gray-900 dark:text-white font-alexandria">{courseTitle(row.course)}</dd>
            <dd className="text-sm text-gray-500 font-alexandria">{t('courseEnrollments.sheikh')}: {sheikhName(row.course)}</dd>
            <dd className="text-sm text-gray-500">{formatCurrency(row.course?.price ?? 0)}</dd>
          </div>

          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:col-span-2">
            <dt className="text-xs font-semibold text-gray-500 uppercase font-alexandria">{t('courseEnrollments.status')}</dt>
            <dd className="mt-1">
              <span
                className={cn(
                  'inline-flex rounded-full px-3 py-1 text-sm font-medium',
                  row.status === 'ACTIVE' && 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
                  row.status === 'COMPLETED' && 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
                  row.status === 'CANCELLED' && 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
                  row.status === 'SUSPENDED' && 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                )}
              >
                {row.status}
              </span>
            </dd>
            <div className="mt-4 grid sm:grid-cols-3 gap-3 text-sm">
              <div>
                <span className="text-gray-500 font-alexandria">{t('courseEnrollments.progress')}</span>
                <p className="font-bold tabular-nums">{Math.round(Number(row.progress) || 0)}%</p>
              </div>
              <div>
                <span className="text-gray-500 font-alexandria">{t('courseEnrollments.enrolledAt')}</span>
                <p className="font-medium">
                  {row.enrolledAt ? new Date(row.enrolledAt).toLocaleString(isRTL ? 'ar-SA' : 'en-US') : '—'}
                </p>
              </div>
              <div>
                <span className="text-gray-500 font-alexandria">{t('courseEnrollments.completedAt')}</span>
                <p className="font-medium">
                  {row.completedAt ? new Date(row.completedAt).toLocaleString(isRTL ? 'ar-SA' : 'en-US') : '—'}
                </p>
              </div>
            </div>
          </div>
        </dl>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            to={`/courses/${row.courseId}`}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700 font-alexandria"
          >
            <FiBook className="size-4" />
            {t('courseEnrollments.openCourse')}
          </Link>
          <Link
            to={`/users/${row.studentId}`}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 dark:border-emerald-700 px-4 py-2 text-sm text-emerald-800 dark:text-emerald-300 font-alexandria"
          >
            <FiUser className="size-4" />
            {t('courseEnrollments.openStudent')}
          </Link>
        </div>
      </section>
    </div>
  );
};

export default CourseEnrollmentDetail;
