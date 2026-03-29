import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { adminAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FiBook, FiEye, FiLayers, FiUser } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { cn } from '../lib/utils';

const CourseEnrollments = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { formatCurrency } = useCurrency();
  const isRTL = language === 'ar';
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20, ...(statusFilter && { status: statusFilter }) };
      const res = await adminAPI.getCourseEnrollments(params);
      const data = res.data?.enrollments ?? res.data?.data ?? [];
      const tp = res.data?.pagination?.totalPages ?? 1;
      setRows(Array.isArray(data) ? data : []);
      setTotalPages(tp);
    } catch (e) {
      toast.error(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

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

  return (
    <div className="space-y-6 animate-fade-in islamic-container" style={{ fontFamily: 'Alexandria, sans-serif' }}>
      <section className="islamic-border p-6 bg-gradient-to-r from-emerald-50 via-white to-amber-50 dark:from-emerald-900/20 dark:via-gray-800 dark:to-amber-900/20 rounded-xl shadow-lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl shadow-lg">
              <FiLayers className="size-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-emerald-800 dark:text-emerald-200 font-alexandria">
                {t('courseEnrollments.title')}
              </h1>
              <p className="text-sm text-amber-700 dark:text-amber-300 font-alexandria">{t('courseEnrollments.subtitle')}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setPage(1);
                setStatusFilter(e.target.value);
              }}
              className="rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm dark:border-emerald-800 dark:bg-gray-900 font-alexandria"
            >
              <option value="">{t('courseEnrollments.allStatuses')}</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="SUSPENDED">SUSPENDED</option>
            </select>
          </div>
        </div>
      </section>

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-gray-500 font-alexandria">{t('common.loading')}</p>
        ) : rows.length === 0 ? (
          <p className="p-8 text-center text-gray-500 font-alexandria">{t('courseEnrollments.empty')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-100 font-alexandria">
                <tr>
                  <th className="text-start p-3">{t('courseEnrollments.student')}</th>
                  <th className="text-start p-3">{t('courseEnrollments.course')}</th>
                  <th className="text-start p-3">{t('courseEnrollments.sheikh')}</th>
                  <th className="text-start p-3">{t('courseEnrollments.status')}</th>
                  <th className="text-start p-3">{t('courseEnrollments.progress')}</th>
                  <th className="text-start p-3">{t('courseEnrollments.price')}</th>
                  <th className="text-start p-3">{t('courseEnrollments.enrolledAt')}</th>
                  <th className="text-end p-3">{t('courseEnrollments.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-t border-gray-100 dark:border-gray-700 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <FiUser className="size-4 text-gray-400 shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white font-alexandria">{studentName(row.student)}</p>
                          <p className="text-xs text-gray-500">{row.student?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <FiBook className="size-4 text-teal-500 shrink-0" />
                        <span className="font-alexandria text-gray-800 dark:text-gray-200">{courseTitle(row.course)}</span>
                      </div>
                    </td>
                    <td className="p-3 font-alexandria text-gray-700 dark:text-gray-300">{sheikhName(row.course)}</td>
                    <td className="p-3">
                      <span
                        className={cn(
                          'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                          row.status === 'ACTIVE' && 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
                          row.status === 'COMPLETED' && 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
                          row.status === 'CANCELLED' && 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
                          row.status === 'SUSPENDED' && 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        )}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="p-3 tabular-nums">{Math.round(Number(row.progress) || 0)}%</td>
                    <td className="p-3 tabular-nums">{formatCurrency(row.course?.price ?? 0)}</td>
                    <td className="p-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {row.enrolledAt ? new Date(row.enrolledAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US') : '—'}
                    </td>
                    <td className="p-3 text-end">
                      <div className="flex justify-end gap-2 flex-wrap">
                        <Link
                          to={`/course-enrollments/${row.id}`}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2 py-1 text-xs text-white hover:bg-emerald-700 font-alexandria"
                        >
                          <FiEye className="size-3.5" />
                          {t('courseEnrollments.details')}
                        </Link>
                        <Link
                          to={`/courses/${row.courseId}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 px-2 py-1 text-xs text-emerald-800 dark:border-emerald-700 dark:text-emerald-300 font-alexandria"
                        >
                          <FiBook className="size-3.5" />
                          {t('courseEnrollments.openCourse')}
                        </Link>
                        <Link
                          to={`/users/${row.studentId}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-700 dark:border-gray-600 dark:text-gray-300 font-alexandria"
                        >
                          <FiUser className="size-3.5" />
                          {t('courseEnrollments.openStudent')}
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border px-3 py-1 text-sm disabled:opacity-50 font-alexandria"
            >
              {t('common.previous')}
            </button>
            <span className="py-1 text-sm text-gray-600 font-alexandria">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border px-3 py-1 text-sm disabled:opacity-50 font-alexandria"
            >
              {t('common.next')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseEnrollments;
