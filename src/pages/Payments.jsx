import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { adminAPI } from '../services/api';
import { FiDollarSign, FiCheckCircle, FiClock, FiXCircle, FiEye, FiRefreshCw } from 'react-icons/fi';
import { cn } from '../lib/utils';

const Payments = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchPayments();
    fetchStats();
  }, [page, statusFilter]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20, ...(statusFilter && { status: statusFilter }) };
      const response = await adminAPI.getPayments(params);
      const paymentsData = response.data.payments || response.data.data || [];
      const totalPagesData = response.data.pagination?.totalPages || response.data.totalPages || 1;
      setPayments(Array.isArray(paymentsData) ? paymentsData : []);
      setTotalPages(totalPagesData);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getPaymentStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch payment stats:', error);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      SUCCEEDED: 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200',
      PENDING: 'bg-amber-50 text-amber-800 ring-1 ring-amber-200',
      FAILED: 'bg-red-50 text-red-800 ring-1 ring-red-200',
      REFUNDED: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className={cn('min-w-0', isRTL && 'sm:text-right')}>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">{t('payments.title')}</h1>
          <p className="mt-2 max-w-2xl text-base text-gray-600 dark:text-gray-400">{t('payments.manageSubtitle')}</p>
        </div>
        <button type="button" onClick={() => { fetchPayments(); fetchStats(); }} disabled={loading} className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700">
          <FiRefreshCw className={cn('size-4', loading && 'animate-spin', isRTL ? 'ml-2' : 'mr-2')} />
          {t('common.refresh')}
        </button>
      </section>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats ? (
          <>
            <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('payments.totalRevenue')}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">${(stats.totalRevenue || 0).toLocaleString()}</p>
                <div className="mt-3 flex size-11 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                  <FiDollarSign className="size-5" />
                </div>
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-emerald-200 dark:border-emerald-800/50 bg-white dark:bg-gray-800 shadow-sm">
              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('payments.successful')}</p>
                <p className="mt-2 text-3xl font-bold text-emerald-600 dark:text-emerald-400">{stats.successfulCount || 0}</p>
                <div className="mt-3 flex size-11 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
                  <FiCheckCircle className="size-5" />
                </div>
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-amber-200 dark:border-amber-800/50 bg-white dark:bg-gray-800 shadow-sm">
              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('dashboard.pending')}</p>
                <p className="mt-2 text-3xl font-bold text-amber-600 dark:text-amber-400">{stats.pendingCount || 0}</p>
                <div className="mt-3 flex size-11 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
                  <FiClock className="size-5" />
                </div>
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-red-200 dark:border-red-800/50 bg-white dark:bg-gray-800 shadow-sm">
              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('dashboard.failed')}</p>
                <p className="mt-2 text-3xl font-bold text-red-600 dark:text-red-400">{stats.failedCount || 0}</p>
                <div className="mt-3 flex size-11 items-center justify-center rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                  <FiXCircle className="size-5" />
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm animate-pulse">
                <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-600" />
                <div className="mt-2 h-8 w-16 rounded bg-gray-200 dark:bg-gray-600" />
                <div className="mt-3 h-11 w-11 rounded-xl bg-gray-200 dark:bg-gray-600" />
              </div>
            ))}
          </>
        )}
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 min-w-[170px] rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500">
            <option value="">{t('users.allStatus')}</option>
            <option value="SUCCEEDED">{t('payments.succeeded')}</option>
            <option value="PENDING">{t('dashboard.pending')}</option>
            <option value="FAILED">{t('dashboard.failed')}</option>
            <option value="REFUNDED">{t('dashboard.refunded')}</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="size-12 animate-spin rounded-full border-2 border-orange-600 border-t-transparent" />
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{t('common.loading')}</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
              <FiDollarSign className="size-12 text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">{t('payments.empty')}</h2>
            <p className="mt-2 max-w-md text-center text-gray-500 dark:text-gray-400">Try changing the filter.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="border-b border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-700/70">
                  <tr>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('payments.transactionId')}</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('users.user')}</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('payments.amount')}</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('common.status')}</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('common.date')}</th>
                    <th className="px-6 py-3 text-end text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4"><div className="text-sm font-mono text-gray-900 dark:text-white">{payment.stripePaymentIntentId || payment.id?.slice(0, 8)}</div></td>
                      <td className="px-6 py-4"><div className="text-sm text-gray-900 dark:text-white">{payment.user?.name || payment.userId}</div></td>
                      <td className="px-6 py-4"><div className="text-sm font-semibold text-gray-900 dark:text-white">${(payment.amount / 100 || payment.amount).toFixed(2)}</div></td>
                      <td className="px-6 py-4">
                        <span className={cn('px-2.5 py-1 rounded-full text-xs font-semibold', getStatusBadge(payment.status))}>{payment.status}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">{new Date(payment.createdAt).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{new Date(payment.createdAt).toLocaleTimeString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <button type="button" onClick={() => navigate(`/payments/${payment.id}`)} className="rounded-lg p-2 text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/20" title={t('payments.viewDetails')}>
                          <FiEye className="size-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-gray-700 sm:px-6">
                <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 hover:bg-gray-50">{t('common.previous')}</button>
                <span className="text-sm text-gray-500 dark:text-gray-400">{t('users.pageOf', { page, totalPages })}</span>
                <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 hover:bg-gray-50">{t('common.next')}</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Payments;
