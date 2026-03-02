import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { financeAPI, adminAPI } from '../services/api';
import { FiDollarSign, FiCheckCircle, FiXCircle, FiClock, FiTrendingUp, FiPieChart, FiFileText, FiDownload } from 'react-icons/fi';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { downloadExcel } from '../utils/exportExcel';
import { cn } from '../lib/utils';
import { useCurrency } from '../context/CurrencyContext';

const Finance = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { user } = useAuth();
  const { formatCurrency } = useCurrency();
  const isRTL = language === 'ar';
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  const [payouts, setPayouts] = useState([]);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [payoutsLoading, setPayoutsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ status: '', teacherId: '' });

  const [profitRange, setProfitRange] = useState(() => {
    const now = new Date();
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    return {
      startDate: first.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0],
    };
  });
  const [profitData, setProfitData] = useState(null);
  const [profitLoading, setProfitLoading] = useState(false);

  const [reportType, setReportType] = useState('daily');
  const [dailyDate, setDailyDate] = useState(new Date().toISOString().split('T')[0]);
  const [monthlyYear, setMonthlyYear] = useState(new Date().getFullYear());
  const [monthlyMonth, setMonthlyMonth] = useState(new Date().getMonth() + 1);
  const [trendsRange, setTrendsRange] = useState({
    startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [reportResult, setReportResult] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setStatsLoading(true);
      try {
        const res = await financeAPI.getStatistics();
        setStats(res.data || res);
      } catch (e) {
        console.error('Finance stats:', e);
      } finally {
        setStatsLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    const start = profitRange.startDate || undefined;
    const end = profitRange.endDate || undefined;
    let cancelled = false;
    setProfitLoading(true);
    adminAPI
      .getProfitReport({ startDate: start, endDate: end })
      .then((res) => {
        if (!cancelled) setProfitData(res.data || res);
      })
      .catch(() => {
        if (!cancelled) setProfitData(null);
      })
      .finally(() => {
        if (!cancelled) setProfitLoading(false);
      });
    return () => { cancelled = true; };
  }, [isAdmin]);

  useEffect(() => {
    fetchPayouts();
  }, [page, filters]);

  const fetchPayouts = async () => {
    setPayoutsLoading(true);
    try {
      const params = {
        page,
        limit: 20,
        ...(filters.status && { status: filters.status }),
        ...(filters.teacherId && { teacherId: filters.teacherId }),
      };
      const res = await financeAPI.getPayouts(params);
      const data = res.data || {};
      setPayouts(Array.isArray(data.payouts) ? data.payouts : data.data || []);
      setTotalPages(data.pagination?.totalPages ?? data.totalPages ?? 1);
    } catch (error) {
      console.error('Failed to fetch payouts:', error);
      setPayouts([]);
    } finally {
      setPayoutsLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await financeAPI.approvePayout(id);
      fetchPayouts();
      fetchStats();
    } catch (error) {
      console.error('Failed to approve payout:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await financeAPI.getStatistics();
      setStats(res.data || res);
    } catch (error) {
      console.error('Failed to fetch finance stats:', error);
    }
  };

  const handleReject = async (id) => {
    const reason = prompt(t('finance.rejectionReasonPrompt'));
    if (reason) {
      try {
        await financeAPI.rejectPayout(id, reason);
        fetchPayouts();
        fetchStats();
      } catch (error) {
        console.error('Failed to reject payout:', error);
      }
    }
  };

  const handleComplete = async (id) => {
    try {
      await financeAPI.completePayout(id);
      fetchPayouts();
      fetchStats();
    } catch (error) {
      console.error('Failed to complete payout:', error);
    }
  };

  const fetchProfitReport = async () => {
    if (!isAdmin) return;
    setProfitLoading(true);
    try {
      const res = await adminAPI.getProfitReport({
        startDate: profitRange.startDate || undefined,
        endDate: profitRange.endDate || undefined,
      });
      setProfitData(res.data || res);
    } catch (e) {
      console.error('Profit report failed:', e);
      setProfitData(null);
    } finally {
      setProfitLoading(false);
    }
  };

  const fetchReport = async () => {
    if (!isAdmin) return;
    setReportLoading(true);
    setReportResult(null);
    try {
      if (reportType === 'daily') {
        const res = await adminAPI.getDailyReport(dailyDate);
        setReportResult(res.data || res);
      } else if (reportType === 'monthly') {
        const res = await adminAPI.getMonthlyReport(monthlyYear, monthlyMonth);
        setReportResult(res.data || res);
      } else {
        const res = await adminAPI.getBookingTrends({
          startDate: trendsRange.startDate,
          endDate: trendsRange.endDate,
        });
        setReportResult(res.data || res);
      }
    } catch (e) {
      console.error('Report failed:', e);
      setReportResult(null);
    } finally {
      setReportLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: 'bg-amber-50 text-amber-800 ring-1 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-200',
      APPROVED: 'bg-blue-100 text-blue-800 ring-1 ring-blue-200 dark:bg-blue-900/30 dark:text-blue-200',
      COMPLETED: 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200',
      REJECTED: 'bg-red-50 text-red-800 ring-1 ring-red-200 dark:bg-red-900/30 dark:text-red-200',
    };
    return badges[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  const formatMoney = formatCurrency;

  const exportPayoutsToExcel = () => {
    const rows = payouts.map((p) => ({
      teacher: p.teacher?.user?.firstName
        ? `${p.teacher.user.firstName || ''} ${p.teacher.user.lastName || ''}`.trim() || p.teacher.user?.email
        : p.teacherId,
      amount: p.amount ?? 0,
      status: p.status ?? '',
      date: p.requestedAt || p.createdAt ? new Date(p.requestedAt || p.createdAt).toLocaleDateString() : '',
    }));
    downloadExcel(
      `payouts-${new Date().toISOString().slice(0, 10)}.csv`,
      rows,
      [
        { label: t('finance.teacher'), key: 'teacher' },
        { label: t('finance.amount'), key: 'amount' },
        { label: t('finance.status'), key: 'status' },
        { label: t('finance.requestDate'), key: 'date' },
      ]
    );
  };

  const exportProfitReportToExcel = () => {
    if (!profitData?.summary) return;
    const s = profitData.summary;
    const rows = [
      { metric: t('finance.totalRevenue'), value: s.totalRevenue },
      { metric: t('finance.platformRevenue'), value: s.platformRevenue },
      { metric: t('finance.teacherEarnings'), value: s.teacherEarnings },
      { metric: t('finance.totalPayouts'), value: s.teacherPayouts },
      { metric: t('finance.pendingPayouts'), value: s.pendingPayouts },
      { metric: t('finance.netProfit'), value: s.netProfit },
      { metric: t('finance.profitMargin'), value: `${s.profitMargin ?? 0}%` },
      { metric: t('finance.newBookings'), value: s.totalBookings ?? 0 },
      { metric: t('finance.completedBookings'), value: s.completedBookings ?? 0 },
    ];
    downloadExcel(
      `profit-report-${profitRange.startDate || ''}-${profitRange.endDate || ''}.csv`,
      rows,
      [{ label: language === 'ar' ? 'البند' : 'Metric', key: 'metric' }, { label: language === 'ar' ? 'القيمة' : 'Value', key: 'value' }]
    );
  };

  const exportReportResultToExcel = () => {
    if (!reportResult) return;
    const date = new Date().toISOString().slice(0, 10);
    if (reportType === 'daily') {
      const rows = [
        { metric: t('finance.newUsers'), value: reportResult.newUsers ?? 0 },
        { metric: t('finance.newBookings'), value: reportResult.newBookings ?? 0 },
        { metric: t('finance.revenue'), value: reportResult.revenue ?? 0 },
        { metric: t('finance.completedBookings'), value: reportResult.completedBookings ?? 0 },
        { metric: t('finance.newTeachers'), value: reportResult.newTeachers ?? 0 },
      ];
      downloadExcel(`daily-report-${dailyDate}.csv`, rows, [{ label: language === 'ar' ? 'البند' : 'Metric', key: 'metric' }, { label: language === 'ar' ? 'القيمة' : 'Value', key: 'value' }]);
    } else if (reportType === 'monthly') {
      const rows = [
        { metric: t('finance.newUsers'), value: reportResult.newUsers ?? 0 },
        { metric: t('finance.newBookings'), value: reportResult.newBookings ?? 0 },
        { metric: t('finance.revenue'), value: reportResult.revenue ?? 0 },
        { metric: t('finance.completedBookings'), value: reportResult.completedBookings ?? 0 },
        { metric: t('finance.newTeachers'), value: reportResult.newTeachers ?? 0 },
      ];
      downloadExcel(`monthly-report-${monthlyYear}-${monthlyMonth}.csv`, rows, [{ label: language === 'ar' ? 'البند' : 'Metric', key: 'metric' }, { label: language === 'ar' ? 'القيمة' : 'Value', key: 'value' }]);
    } else if (Array.isArray(reportResult)) {
      downloadExcel(
        `booking-trends-${trendsRange.startDate}-${trendsRange.endDate}.csv`,
        reportResult,
        [
          { label: t('finance.trendDate'), key: 'date' },
          { label: t('finance.trendTotal'), key: 'total' },
          { label: t('finance.trendCompleted'), key: 'completed' },
          { label: t('finance.trendCancelled'), key: 'cancelled' },
        ]
      );
    }
  };

  const netProfit = stats
    ? (Number(stats.totalRevenue) || 0) - (Number(stats.totalPayouts) || 0)
    : 0;

  const StatCard = ({ icon: Icon, title, value, variant = 'default' }) => {
    const variants = {
      default: 'border-emerald-200 dark:border-emerald-700 from-white to-emerald-50 dark:from-gray-900 dark:to-emerald-900/20',
      amber: 'border-amber-200 dark:border-amber-700 from-white to-amber-50 dark:from-gray-900 dark:to-amber-900/20',
      blue: 'border-blue-200 dark:border-blue-700 from-white to-blue-50 dark:from-gray-900 dark:to-blue-900/20',
      net: 'border-emerald-300 dark:border-emerald-600 from-emerald-50 to-white dark:from-emerald-900/40 dark:to-gray-900',
    };
    const iconVariants = {
      default: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
      amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
      blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      net: 'bg-emerald-200 dark:bg-emerald-800/50 text-emerald-700 dark:text-emerald-300',
    };
    return (
      <div
        className={cn(
          'overflow-hidden rounded-2xl border bg-gradient-to-br shadow-lg transition-all duration-200 hover:shadow-xl islamic-pattern',
          variants[variant]
        )}
      >
        <div className="p-5">
          <div className={cn('flex items-start justify-between gap-2', isRTL && 'flex-row-reverse')}>
            <div className={cn('min-w-0 flex-1', isRTL && 'text-right')}>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 arabic-text">{title}</p>
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white arabic-text tabular-nums">{value}</p>
            </div>
            <div className={cn('flex size-12 shrink-0 items-center justify-center rounded-xl', iconVariants[variant])}>
              <Icon className="size-6" aria-hidden />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page header */}
      <section className={cn('flex flex-col gap-1', isRTL && 'text-right')}>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl arabic-text">
          {t('finance.title')}
        </h1>
        <p className="max-w-2xl text-base text-gray-600 dark:text-gray-400 arabic-text">
          {t('finance.subtitle')}
        </p>
      </section>

      {/* الملخص المالي */}
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 arabic-text">
          {t('finance.summarySection')}
        </h2>
        {statsLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <StatCard
              icon={FiDollarSign}
              title={t('finance.totalRevenue')}
              value={formatMoney(stats?.totalRevenue)}
            />
            <StatCard
              icon={FiClock}
              title={t('finance.pendingPayouts')}
              value={String(stats?.pendingPayouts ?? 0)}
              variant="amber"
            />
            <StatCard
              icon={FiCheckCircle}
              title={t('finance.completedPayouts')}
              value={String(stats?.completedPayouts ?? 0)}
              variant="blue"
            />
            <StatCard
              icon={FiTrendingUp}
              title={t('finance.totalPayouts')}
              value={formatMoney(stats?.totalPayouts)}
            />
            {stats?.walletBalance != null && (
              <StatCard
                icon={FiPieChart}
                title={t('finance.walletBalance')}
                value={formatMoney(stats.walletBalance)}
              />
            )}
            <StatCard
              icon={FiTrendingUp}
              title={t('finance.netProfit')}
              value={formatMoney(netProfit)}
              variant="net"
            />
          </div>
        )}
      </section>

      {/* تقرير الأرباح (admin) */}
      {isAdmin && (
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 arabic-text">
            {t('finance.profitReportSection')}
          </h2>
          <div className="overflow-hidden rounded-2xl border border-emerald-200 dark:border-emerald-700 bg-gradient-to-br from-white to-emerald-50 dark:from-gray-900 dark:to-emerald-900/20 shadow-lg islamic-pattern">
            <CardHeader className="border-b border-emerald-200 dark:border-emerald-700 bg-white/60 dark:bg-gray-800/60 px-4 sm:px-6 py-4">
              <CardTitle className="text-lg font-semibold text-emerald-900 dark:text-emerald-100 arabic-text">
                {t('finance.profits')}
              </CardTitle>
              <p className="mt-0.5 text-sm text-emerald-600 dark:text-emerald-400 arabic-text">
                {t('reports.startDate')} / {t('reports.endDate')}
              </p>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className={cn('flex flex-wrap gap-4 items-end mb-6', isRTL && 'flex-row-reverse')}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 arabic-text">{t('reports.startDate')}</label>
                  <input
                    type="date"
                    value={profitRange.startDate}
                    onChange={(e) => setProfitRange((r) => ({ ...r, startDate: e.target.value }))}
                    className="h-10 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 arabic-text">{t('reports.endDate')}</label>
                  <input
                    type="date"
                    value={profitRange.endDate}
                    onChange={(e) => setProfitRange((r) => ({ ...r, endDate: e.target.value }))}
                    className="h-10 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <Button onClick={fetchProfitReport} disabled={profitLoading} className="rounded-xl">
                  {profitLoading ? (t('common.loading') || '...') : t('finance.generateReport')}
                </Button>
                {profitData?.summary && (
                  <Button variant="outline" onClick={exportProfitReportToExcel} className="rounded-xl inline-flex items-center gap-2">
                    <FiDownload className="size-4" />
                    {t('finance.exportToExcel')}
                  </Button>
                )}
              </div>
              {profitLoading && !profitData && (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="h-20 rounded-xl" />
                  ))}
                </div>
              )}
              {profitData?.summary && (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-xl border border-emerald-200 dark:border-emerald-700 bg-white/80 dark:bg-gray-800/80 p-4">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 arabic-text">{t('finance.totalRevenue')}</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white mt-1 arabic-text tabular-nums">{formatMoney(profitData.summary.totalRevenue)}</p>
                  </div>
                  <div className="rounded-xl border border-emerald-200 dark:border-emerald-700 bg-white/80 dark:bg-gray-800/80 p-4">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 arabic-text">{t('finance.platformRevenue')}</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white mt-1 arabic-text tabular-nums">{formatMoney(profitData.summary.platformRevenue)}</p>
                  </div>
                  <div className="rounded-xl border border-emerald-200 dark:border-emerald-700 bg-white/80 dark:bg-gray-800/80 p-4">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 arabic-text">{t('finance.teacherEarnings')}</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white mt-1 arabic-text tabular-nums">{formatMoney(profitData.summary.teacherEarnings)}</p>
                  </div>
                  <div className="rounded-xl border border-amber-200 dark:border-amber-700 bg-amber-50/80 dark:bg-amber-900/20 p-4">
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 arabic-text">{t('finance.pendingPayouts')}</p>
                    <p className="text-xl font-bold text-amber-800 dark:text-amber-300 mt-1 arabic-text tabular-nums">{formatMoney(profitData.summary.pendingPayouts)}</p>
                  </div>
                  <div className="rounded-xl border border-emerald-300 dark:border-emerald-600 bg-emerald-50/80 dark:bg-emerald-900/30 p-4">
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 arabic-text">{t('finance.netProfit')}</p>
                    <p className="text-xl font-bold text-emerald-800 dark:text-emerald-200 mt-1 arabic-text tabular-nums">{formatMoney(profitData.summary.netProfit)}</p>
                  </div>
                  <div className="rounded-xl border border-emerald-200 dark:border-emerald-700 bg-white/80 dark:bg-gray-800/80 p-4">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 arabic-text">{t('finance.profitMargin')}</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white mt-1 arabic-text tabular-nums">{profitData.summary.profitMargin ?? 0}%</p>
                  </div>
                  <div className="rounded-xl border border-emerald-200 dark:border-emerald-700 bg-white/80 dark:bg-gray-800/80 p-4">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 arabic-text">{t('finance.newBookings')}</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white mt-1 arabic-text tabular-nums">{profitData.summary.totalBookings ?? 0}</p>
                  </div>
                  <div className="rounded-xl border border-emerald-200 dark:border-emerald-700 bg-white/80 dark:bg-gray-800/80 p-4">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 arabic-text">{t('finance.completedBookings')}</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white mt-1 arabic-text tabular-nums">{profitData.summary.completedBookings ?? 0}</p>
                  </div>
                </div>
              )}
              {profitData && !profitData.summary && (
                <p className="text-sm text-gray-500 dark:text-gray-400 arabic-text py-4">{t('finance.noDataForPeriod')}</p>
              )}
            </CardContent>
          </div>
        </section>
      )}

      {/* طلبات السحب */}
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 arabic-text">
          {t('finance.payoutsSection')}
        </h2>
        <div className="overflow-hidden rounded-2xl border border-emerald-200 dark:border-emerald-700 bg-gradient-to-br from-white to-emerald-50 dark:from-gray-900 dark:to-emerald-900/20 shadow-lg islamic-pattern">
          <CardHeader className="border-b border-emerald-200 dark:border-emerald-700 bg-white/60 dark:bg-gray-800/60 px-4 sm:px-6 py-4">
            <CardTitle className="text-lg font-semibold text-emerald-900 dark:text-emerald-100 arabic-text">
              {t('finance.payoutRequests')}
            </CardTitle>
            <div className={cn('mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap', isRTL && 'sm:flex-row-reverse')}>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="h-10 min-w-[160px] rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">{t('users.allStatus')}</option>
                <option value="PENDING">{t('finance.pending')}</option>
                <option value="APPROVED">{t('finance.approved')}</option>
                <option value="COMPLETED">{t('finance.completed')}</option>
                <option value="REJECTED">{t('finance.rejected')}</option>
              </select>
              <input
                type="text"
                placeholder={t('finance.teacherIdPlaceholder')}
                value={filters.teacherId}
                onChange={(e) => setFilters({ ...filters, teacherId: e.target.value })}
                className={cn('h-10 min-w-[140px] rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500', isRTL ? 'text-right' : 'text-left')}
              />
              {payouts.length > 0 && (
                <Button variant="outline" size="sm" onClick={exportPayoutsToExcel} className="rounded-xl inline-flex items-center gap-2">
                  <FiDownload className="size-4" />
                  {t('finance.exportToExcel')}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {payoutsLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ) : payouts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                <div className="h-14 w-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                  <FiDollarSign className="text-emerald-600 dark:text-emerald-400 text-2xl" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 arabic-text">{t('finance.noPayouts')}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 arabic-text">{t('finance.tryChangingFilter')}</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="border-b border-emerald-200 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-900/20">
                      <tr>
                        <th className={cn('px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400', isRTL ? 'text-right' : 'text-left')}>{t('finance.teacher')}</th>
                        <th className={cn('px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400', isRTL ? 'text-right' : 'text-left')}>{t('finance.amount')}</th>
                        <th className={cn('px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400', isRTL ? 'text-right' : 'text-left')}>{t('finance.status')}</th>
                        <th className={cn('px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400', isRTL ? 'text-right' : 'text-left')}>{t('finance.requestDate')}</th>
                        <th className={cn('px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400', isRTL ? 'text-left' : 'text-right')}>{t('finance.actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {payouts.map((payout) => (
                        <tr key={payout.id} className="transition-colors hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10">
                          <td className={cn('px-6 py-4 text-sm font-medium text-gray-900 dark:text-white', isRTL && 'text-right')}>
                            {payout.teacher?.user?.firstName
                              ? `${payout.teacher.user.firstName || ''} ${payout.teacher.user.lastName || ''}`.trim() || payout.teacher.user.email
                              : payout.teacherId}
                          </td>
                          <td className={cn('px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white tabular-nums', isRTL && 'text-right')}>{formatMoney(payout.amount)}</td>
                          <td className="px-6 py-4">
                            <span className={cn('inline-flex px-2.5 py-1 rounded-full text-xs font-semibold', getStatusBadge(payout.status))}>{payout.status}</span>
                          </td>
                          <td className={cn('px-6 py-4 text-sm text-gray-600 dark:text-gray-300', isRTL && 'text-right')}>
                            {new Date(payout.requestedAt || payout.createdAt).toLocaleDateString()}
                          </td>
                          <td className={cn('px-6 py-4', isRTL ? 'text-left' : 'text-right')}>
                            <div className={cn('inline-flex items-center gap-2', isRTL && 'flex-row-reverse')}>
                              {payout.status === 'PENDING' && (
                                <>
                                  <Button variant="ghost" size="icon" onClick={() => handleApprove(payout.id)} title={t('finance.approve')} className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg">
                                    <FiCheckCircle className="size-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => handleReject(payout.id)} title={t('finance.reject')} className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg">
                                    <FiXCircle className="size-4" />
                                  </Button>
                                </>
                              )}
                              {payout.status === 'APPROVED' && (
                                <Button variant="outline" size="sm" onClick={() => handleComplete(payout.id)} title={t('finance.markAsCompleted')} className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:border-blue-700 dark:hover:bg-blue-900/30 rounded-lg inline-flex items-center gap-1">
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
                  <div className={cn('flex items-center justify-between border-t border-emerald-200 dark:border-emerald-700 px-4 py-3 sm:px-6', isRTL && 'flex-row-reverse')}>
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-xl">
                      {t('common.previous')}
                    </Button>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{t('users.pageOf', { page, totalPages })}</span>
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-xl">
                      {t('common.next')}
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </div>
      </section>

      {/* التقارير المالية (admin) */}
      {isAdmin && (
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 arabic-text">
            {t('finance.reportsSection')}
          </h2>
          <div className="overflow-hidden rounded-2xl border border-emerald-200 dark:border-emerald-700 bg-gradient-to-br from-white to-emerald-50 dark:from-gray-900 dark:to-emerald-900/20 shadow-lg islamic-pattern">
            <CardHeader className="border-b border-emerald-200 dark:border-emerald-700 bg-white/60 dark:bg-gray-800/60 px-4 sm:px-6 py-4">
              <CardTitle className="text-lg font-semibold text-emerald-900 dark:text-emerald-100 arabic-text flex items-center gap-2">
                <FiFileText className="size-5" />
                {t('finance.financialReports')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className={cn('flex flex-wrap gap-4 items-end mb-6', isRTL && 'flex-row-reverse')}>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="h-10 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="daily">{t('finance.dailyReport')}</option>
                  <option value="monthly">{t('finance.monthlyReport')}</option>
                  <option value="trends">{t('finance.bookingTrends')}</option>
                </select>
                {reportType === 'daily' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 arabic-text">{t('finance.selectDate')}</label>
                    <input type="date" value={dailyDate} onChange={(e) => setDailyDate(e.target.value)} className="h-10 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500" />
                  </div>
                )}
                {reportType === 'monthly' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 arabic-text">{t('finance.selectYear')}</label>
                      <input type="number" min="2020" max="2030" value={monthlyYear} onChange={(e) => setMonthlyYear(Number(e.target.value))} className="h-10 w-24 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 arabic-text">{t('finance.selectMonth')}</label>
                      <select value={monthlyMonth} onChange={(e) => setMonthlyMonth(Number(e.target.value))} className="h-10 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
                {reportType === 'trends' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 arabic-text">{t('reports.startDate')}</label>
                      <input type="date" value={trendsRange.startDate} onChange={(e) => setTrendsRange((r) => ({ ...r, startDate: e.target.value }))} className="h-10 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 arabic-text">{t('reports.endDate')}</label>
                      <input type="date" value={trendsRange.endDate} onChange={(e) => setTrendsRange((r) => ({ ...r, endDate: e.target.value }))} className="h-10 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500" />
                    </div>
                  </>
                )}
                <Button onClick={fetchReport} disabled={reportLoading} className="rounded-xl">
                  {reportLoading ? (t('common.loading') || '...') : t('finance.generateReport')}
                </Button>
                {reportResult && (
                  <Button variant="outline" onClick={exportReportResultToExcel} className="rounded-xl inline-flex items-center gap-2">
                    <FiDownload className="size-4" />
                    {t('finance.exportToExcel')}
                  </Button>
                )}
              </div>
              {reportResult && (
                <div className="mt-6">
                  {reportType === 'daily' && (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                      {[
                        [t('finance.newUsers'), reportResult.newUsers ?? 0],
                        [t('finance.newBookings'), reportResult.newBookings ?? 0],
                        [t('finance.revenue'), formatMoney(reportResult.revenue)],
                        [t('finance.completedBookings'), reportResult.completedBookings ?? 0],
                        [t('finance.newTeachers'), reportResult.newTeachers ?? 0],
                      ].map(([label, val]) => (
                        <div key={label} className="rounded-xl border border-emerald-200 dark:border-emerald-700 bg-white/80 dark:bg-gray-800/80 p-4">
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 arabic-text">{label}</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white mt-1 arabic-text tabular-nums">{val}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {reportType === 'monthly' && (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                      {[
                        [t('finance.newUsers'), reportResult.newUsers ?? 0],
                        [t('finance.newBookings'), reportResult.newBookings ?? 0],
                        [t('finance.revenue'), formatMoney(reportResult.revenue)],
                        [t('finance.completedBookings'), reportResult.completedBookings ?? 0],
                        [t('finance.newTeachers'), reportResult.newTeachers ?? 0],
                      ].map(([label, val]) => (
                        <div key={label} className="rounded-xl border border-emerald-200 dark:border-emerald-700 bg-white/80 dark:bg-gray-800/80 p-4">
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 arabic-text">{label}</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white mt-1 arabic-text tabular-nums">{val}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {reportType === 'trends' && Array.isArray(reportResult) && (
                    <div className="overflow-x-auto rounded-xl border border-emerald-200 dark:border-emerald-700">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-emerald-200 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-900/20">
                            <th className={cn('px-4 py-3 font-semibold text-gray-700 dark:text-gray-300', isRTL ? 'text-right' : 'text-left')}>{t('finance.trendDate')}</th>
                            <th className={cn('px-4 py-3 font-semibold text-gray-700 dark:text-gray-300', isRTL ? 'text-right' : 'text-left')}>{t('finance.trendTotal')}</th>
                            <th className={cn('px-4 py-3 font-semibold text-gray-700 dark:text-gray-300', isRTL ? 'text-right' : 'text-left')}>{t('finance.trendCompleted')}</th>
                            <th className={cn('px-4 py-3 font-semibold text-gray-700 dark:text-gray-300', isRTL ? 'text-right' : 'text-left')}>{t('finance.trendCancelled')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportResult.map((row) => (
                            <tr key={row.date} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10">
                              <td className={cn('px-4 py-2 text-gray-900 dark:text-white', isRTL && 'text-right')}>{row.date}</td>
                              <td className={cn('px-4 py-2 tabular-nums', isRTL && 'text-right')}>{row.total ?? 0}</td>
                              <td className={cn('px-4 py-2 tabular-nums', isRTL && 'text-right')}>{row.completed ?? 0}</td>
                              <td className={cn('px-4 py-2 tabular-nums', isRTL && 'text-right')}>{row.cancelled ?? 0}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </div>
        </section>
      )}
    </div>
  );
};

export default Finance;
