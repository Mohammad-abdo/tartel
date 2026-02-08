import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { financeAPI } from '../services/api';
import { FiDollarSign, FiCheckCircle, FiXCircle, FiClock, FiTrendingUp } from 'react-icons/fi';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';

const Finance = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [payouts, setPayouts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    teacherId: '',
  });

  useEffect(() => {
    fetchPayouts();
    fetchStats();
  }, [page, filters]);

  const fetchPayouts = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 20,
        ...(filters.status && { status: filters.status }),
        ...(filters.teacherId && { teacherId: filters.teacherId }),
      };
      const response = await financeAPI.getPayouts(params);
      setPayouts(response.data.data || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch payouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await financeAPI.getStatistics();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch finance stats:', error);
    }
  };

  const handleApprove = async (id) => {
    try {
      await financeAPI.approvePayout(id);
      fetchPayouts();
    } catch (error) {
      console.error('Failed to approve payout:', error);
    }
  };

  const handleReject = async (id) => {
    const reason = prompt(t('finance.rejectionReasonPrompt'));
    if (reason) {
      try {
        await financeAPI.rejectPayout(id, reason);
        fetchPayouts();
      } catch (error) {
        console.error('Failed to reject payout:', error);
      }
    }
  };

  const handleComplete = async (id) => {
    try {
      await financeAPI.completePayout(id);
      fetchPayouts();
    } catch (error) {
      console.error('Failed to complete payout:', error);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: 'bg-amber-50 text-amber-800 ring-1 ring-amber-200',
      APPROVED: 'bg-blue-100 text-blue-800 ring-1 ring-blue-200',
      COMPLETED: 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200',
      REJECTED: 'bg-red-50 text-red-800 ring-1 ring-red-200',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className={cn('min-w-0', isRTL && 'sm:text-right')}>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">{t('finance.title')}</h1>
          <p className="mt-2 max-w-2xl text-base text-gray-600 dark:text-gray-400">{t('finance.subtitle')}</p>
        </div>
      </section>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats ? (
          <>
            <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('finance.totalRevenue')}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">${(stats.totalRevenue || 0).toLocaleString()}</p>
                <div className="mt-3 flex size-11 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                  <FiDollarSign className="size-5" />
                </div>
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-amber-200 dark:border-amber-800/50 bg-white dark:bg-gray-800 shadow-sm">
              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('finance.pendingPayouts')}</p>
                <p className="mt-2 text-3xl font-bold text-amber-600 dark:text-amber-400">{stats.pendingPayouts || 0}</p>
                <div className="mt-3 flex size-11 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
                  <FiClock className="size-5" />
                </div>
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-emerald-200 dark:border-emerald-800/50 bg-white dark:bg-gray-800 shadow-sm">
              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('finance.completedPayouts')}</p>
                <p className="mt-2 text-3xl font-bold text-emerald-600 dark:text-emerald-400">{stats.completedPayouts || 0}</p>
                <div className="mt-3 flex size-11 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
                  <FiCheckCircle className="size-5" />
                </div>
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-800 shadow-sm">
              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('finance.totalPayouts')}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">${(stats.totalPayouts || 0).toLocaleString()}</p>
                <div className="mt-3 flex size-11 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400">
                  <FiTrendingUp className="size-5" />
                </div>
              </div>
            </div>
          </>
        ) : (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm animate-pulse">
              <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-600" />
              <div className="mt-2 h-8 w-16 rounded bg-gray-200 dark:bg-gray-600" />
              <div className="mt-3 h-11 w-11 rounded-xl bg-gray-200 dark:bg-gray-600" />
            </div>
          ))
        )}
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="h-10 min-w-[170px] rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500">
            <option value="">{t('users.allStatus')}</option>
            <option value="PENDING">{t('finance.pending')}</option>
            <option value="APPROVED">{t('finance.approved')}</option>
            <option value="COMPLETED">{t('finance.completed')}</option>
            <option value="REJECTED">{t('finance.rejected')}</option>
          </select>
          <input type="text" placeholder={t('finance.teacherIdPlaceholder')} value={filters.teacherId} onChange={(e) => setFilters({ ...filters, teacherId: e.target.value })} className={cn('h-10 min-w-[140px] rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500', isRTL ? 'text-right' : 'text-left')} />
        </div>
      </div>

      {/* Table - same container as Courses content area */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-14">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
              <p className="text-sm text-gray-500">{t('common.loading') || 'Loading...'}</p>
            </div>
          </div>
        ) : payouts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="h-14 w-14 rounded-full bg-primary-50 flex items-center justify-center mb-4">
              <FiDollarSign className="text-primary-600 text-2xl" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">{t('finance.noPayouts') || 'No payouts found'}</h2>
            <p className="text-sm text-gray-500 max-w-md">Try changing the filter.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('finance.teacher')}</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('finance.amount')}</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('finance.status')}</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('finance.requestDate')}</th>
                    <th className="px-6 py-3 text-end text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('finance.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {payouts.map((payout) => (
                    <tr key={payout.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{payout.teacher?.user?.name || payout.teacherId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">${payout.amount?.toFixed(2) || '0.00'}</td>
                      <td className="px-6 py-4">
                        <span className={cn('px-2.5 py-1 rounded-full text-xs font-semibold', getStatusBadge(payout.status))}>{payout.status}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{new Date(payout.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {payout.status === 'PENDING' && (
                            <>
                              <Button variant="ghost" size="icon" onClick={() => handleApprove(payout.id)} title={t('finance.approve')} className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                                <FiCheckCircle className="size-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleReject(payout.id)} title={t('finance.reject')} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                <FiXCircle className="size-4" />
                              </Button>
                            </>
                          )}
                          {payout.status === 'APPROVED' && (
                            <Button variant="outline" size="sm" onClick={() => handleComplete(payout.id)} title={t('finance.markAsCompleted')} className="text-blue-600 border-blue-200 hover:bg-blue-50">
                              <FiCheckCircle className="size-4" />
                              {t('finance.complete')}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-4 py-3 sm:px-6">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">{t('common.previous')}</button>
                <span className="text-sm text-gray-500 dark:text-gray-400">{t('users.pageOf', { page, totalPages })}</span>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">{t('common.next')}</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Finance;
