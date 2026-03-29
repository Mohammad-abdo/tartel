import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { toast } from 'react-toastify';
import { adminAPI } from '../services/api';
import {
  FiBarChart2,
  FiTrendingUp,
  FiCalendar,
  FiDollarSign,
  FiUsers,
  FiUserCheck,
  FiDownload,
  FiFileText,
  FiLayers,
  FiActivity,
  FiBook,
  FiVideo,
} from 'react-icons/fi';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { Button } from '../components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { cn } from '../lib/utils';
import { exportReportPdf } from '../utils/reportPdfExport';

const reportTypes = [
  { id: 'principal', labelKey: 'reports.principal', descKey: 'reports.principalDesc', icon: FiBarChart2 },
  { id: 'teachers', labelKey: 'reports.teachers', descKey: 'reports.teachersDesc', icon: FiUserCheck },
  { id: 'students', labelKey: 'reports.students', descKey: 'reports.studentsDesc', icon: FiUsers },
  { id: 'profits', labelKey: 'reports.profits', descKey: 'reports.profitsDesc', icon: FiDollarSign },
  { id: 'trends', labelKey: 'reports.trends', descKey: 'reports.trendsDesc', icon: FiTrendingUp },
  { id: 'sessions', labelKey: 'reports.sessions', descKey: 'reports.sessionsDesc', icon: FiFileText },
];

const LINE_COLORS = { total: '#059669', completed: '#34d399', cancelled: '#fb923c' };
const PIE_COLORS = ['#10b981', '#fb923c', '#6366f1'];

function toYMD(d) {
  return d.toISOString().slice(0, 10);
}

function computePreset(preset) {
  const today = new Date();
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (preset === 'lastMonth') {
    const y = end.getFullYear();
    const m = end.getMonth();
    const start = new Date(y, m - 1, 1);
    const last = new Date(y, m, 0);
    return { startDate: toYMD(start), endDate: toYMD(last) };
  }
  const start = new Date(end);
  if (preset === 'last7') start.setDate(start.getDate() - 6);
  else if (preset === 'last30') start.setDate(start.getDate() - 29);
  else if (preset === 'thisMonth') {
    start.setTime(new Date(end.getFullYear(), end.getMonth(), 1).getTime());
  }
  return { startDate: toYMD(start), endDate: toYMD(end) };
}

function formatDate(str) {
  if (!str) return '—';
  const d = typeof str === 'string' ? new Date(str) : str;
  return Number.isNaN(d.getTime()) ? str : d.toLocaleDateString();
}

function downloadCSV(filename, rows, columns) {
  const head = columns.map((c) => c.label).join(',');
  const body = rows
    .map((row) => columns.map((c) => (c.key ? row[c.key] ?? '' : c.get ? c.get(row) : '')).join(','))
    .join('\n');
  const csv = `\uFEFF${head}\n${body}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function KpiTile({ label, value, sub, href }) {
  const inner = (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-white to-emerald-50/90 p-4 shadow-sm transition-all duration-200 dark:border-emerald-800/60 dark:from-gray-900 dark:to-emerald-950/40 hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-600">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700/90 dark:text-emerald-400/90 arabic-text">{label}</p>
      <p className="mt-2 text-2xl font-bold tabular-nums text-emerald-950 dark:text-emerald-50">{value}</p>
      {sub != null && sub !== '' && <p className="mt-1 text-xs text-emerald-600/80 dark:text-emerald-400/80 arabic-text">{sub}</p>}
    </div>
  );
  if (href) {
    return (
      <Link to={href} className="block h-full min-h-[112px]">
        {inner}
      </Link>
    );
  }
  return <div className="min-h-[112px]">{inner}</div>;
}

const Reports = () => {
  const { t } = useTranslation();
  const { formatCurrency, sidebar } = useCurrency();
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const [pdfLoading, setPdfLoading] = useState(false);

  const pdfLabels = useMemo(
    () => ({
      metric: t('reports.pdfMetric'),
      value: t('reports.pdfValue'),
      period: t('reports.pdfPeriod'),
      totalUsers: t('dashboard.totalUsers'),
      totalTeachers: t('reports.totalTeachers'),
      totalStudents: t('reports.totalStudents'),
      activeTeachers: t('reports.activeTeachers'),
      pendingTeachers: t('reports.pendingTeachers'),
      totalBookings: t('reports.totalBookings'),
      completedBookings: t('reports.completedBookings'),
      cancelledBookings: t('reports.cancelledBookings'),
      totalRevenue: t('reports.totalRevenue'),
      platformRevenue: t('reports.platformRevenue'),
      teacherPayouts: t('reports.teacherPayouts'),
      netProfit: t('reports.netProfit'),
      pendingPayouts: t('reports.pendingPayouts'),
      profitMargin: t('reports.profitMargin'),
      avgRevenueBooking: t('reports.averageRevenuePerBooking'),
      periodNew: t('reports.periodNew'),
      newUsers: t('reports.newUsers'),
      newTeachers: t('reports.newTeachers'),
      newStudents: t('reports.newStudents'),
      newBookings: t('reports.newBookings'),
      colTeacher: t('reports.teacher'),
      colStudent: t('reports.student'),
      colEmail: t('users.email'),
      colBookings: t('reports.bookings'),
      colDate: t('reports.date'),
      colTotal: t('reports.total'),
      colCompleted: t('reports.completed'),
      colCancelled: t('reports.cancelled'),
      colAmount: t('reports.amount'),
      revenueByDate: t('reports.revenueByDate'),
      sessionEnded: t('reports.sessionEnded'),
      truncated: t('reports.pdfTruncatedNotice'),
    }),
    [t]
  );

  const [dateRange, setDateRange] = useState(() => computePreset('thisMonth'));
  const [preset, setPreset] = useState('thisMonth');
  const [principalData, setPrincipalData] = useState(null);
  const [trendsData, setTrendsData] = useState([]);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState('principal');
  const [reportData, setReportData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const applyPreset = (p) => {
    setPreset(p);
    if (p !== 'custom') setDateRange(computePreset(p));
  };

  const loadOverview = useCallback(async () => {
    setOverviewLoading(true);
    try {
      const params = {
        ...(dateRange.startDate && { startDate: dateRange.startDate }),
        ...(dateRange.endDate && { endDate: dateRange.endDate }),
      };
      const [pRes, tRes] = await Promise.all([
        adminAPI.getPrincipalReport(params),
        adminAPI.getBookingTrends(params),
      ]);
      const pRaw = pRes?.data ?? pRes;
      setPrincipalData(Array.isArray(pRaw) ? null : pRaw);
      const tRaw = tRes?.data ?? tRes;
      setTrendsData(Array.isArray(tRaw) ? tRaw : tRaw?.data ?? []);
    } catch (e) {
      console.error('Reports overview failed:', e);
      setPrincipalData(null);
      setTrendsData([]);
    } finally {
      setOverviewLoading(false);
    }
  }, [dateRange.startDate, dateRange.endDate]);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  useEffect(() => {
    if (selectedReport === 'principal' || selectedReport === 'trends') {
      setReportData(null);
      setDetailLoading(false);
      return;
    }
    let cancelled = false;
    const params = {
      ...(dateRange.startDate && { startDate: dateRange.startDate }),
      ...(dateRange.endDate && { endDate: dateRange.endDate }),
    };
    async function run() {
      setDetailLoading(true);
      setReportData(null);
      try {
        let response;
        switch (selectedReport) {
          case 'teachers':
            response = await adminAPI.getTeacherReport(params);
            break;
          case 'students':
            response = await adminAPI.getStudentReport(params);
            break;
          case 'profits':
            response = await adminAPI.getProfitReport(params);
            break;
          case 'sessions':
            response = await adminAPI.getSessionReports({ ...params, limit: 200 });
            break;
          default:
            return;
        }
        if (cancelled) return;
        const data = response?.data ?? response;
        setReportData(Array.isArray(data) ? { data, periodRange: {} } : data);
      } catch (error) {
        console.error('Report fetch failed:', error);
        if (!cancelled) setReportData(null);
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [selectedReport, dateRange.startDate, dateRange.endDate]);

  const periodRange = principalData?.periodRange ?? {};
  const periodStart = periodRange.startDate ? formatDate(periodRange.startDate) : dateRange.startDate;
  const periodEnd = periodRange.endDate ? formatDate(periodRange.endDate) : dateRange.endDate;

  const chartRows = useMemo(
    () =>
      (trendsData || []).map((row) => ({
        ...row,
        label: typeof row.date === 'string' && row.date.length >= 10 ? row.date.slice(5, 10) : row.date,
      })),
    [trendsData]
  );

  const pieMix = useMemo(() => {
    const s = principalData?.summary;
    if (!s) return [];
    const total = Number(s.totalBookings) || 0;
    const comp = Number(s.completedBookings) || 0;
    const canc = Number(s.cancelledBookings) || 0;
    const other = Math.max(0, total - comp - canc);
    return [
      { name: t('reports.completed'), value: comp },
      { name: t('reports.cancelled'), value: canc },
      { name: t('reports.otherStatus'), value: other },
    ].filter((x) => x.value > 0);
  }, [principalData, t]);

  const quickLinks = useMemo(
    () => [
      { to: '/finance', label: t('sidebar.finance'), icon: FiTrendingUp },
      { to: '/payments', label: t('sidebar.payments'), icon: FiDollarSign },
      { to: '/bookings', label: t('sidebar.bookings'), icon: FiCalendar },
      { to: '/courses', label: t('sidebar.courses'), icon: FiBook },
      { to: '/sessions', label: t('sidebar.sessions'), icon: FiVideo },
      { to: '/course-enrollments', label: t('sidebar.courseEnrollments'), icon: FiLayers },
      { to: '/activity', label: t('sidebar.activity'), icon: FiActivity },
      { to: '/users', label: t('sidebar.students'), icon: FiUsers },
    ],
    [t]
  );

  const handleExportPrincipal = () => {
    if (!principalData?.summary) return;
    const s = principalData.summary;
    const rows = [
      { k: 'totalUsers', v: s.totalUsers },
      { k: 'totalTeachers', v: s.totalTeachers },
      { k: 'totalStudents', v: s.totalStudents },
      { k: 'activeTeachers', v: s.activeTeachers },
      { k: 'pendingTeachers', v: s.pendingTeachers },
      { k: 'totalBookings', v: s.totalBookings },
      { k: 'completedBookings', v: s.completedBookings },
      { k: 'cancelledBookings', v: s.cancelledBookings },
      { k: 'totalRevenue', v: s.totalRevenue },
      { k: 'platformRevenue', v: s.platformRevenue },
      { k: 'teacherPayouts', v: s.teacherPayouts },
      { k: 'netProfit', v: s.netProfit },
    ];
    downloadCSV(`report-principal-${dateRange.startDate}-${dateRange.endDate}.csv`, rows, [
      { label: 'Metric', key: 'k' },
      { label: 'Value', key: 'v' },
    ]);
  };

  const handleExportSessions = () => {
    const list = reportData?.data ?? [];
    if (!list.length) return;
    downloadCSV(`report-sessions-${dateRange.startDate}-${dateRange.endDate}.csv`, list, [
      { label: 'Date', key: 'date' },
      { label: 'Teacher', key: 'teacherName' },
      { label: 'Student', key: 'studentName' },
      { label: 'Student Email', key: 'studentEmail' },
      { label: 'Session Ended', key: 'endedAt' },
    ]);
  };

  const handleExportTrends = () => {
    const list = trendsData;
    if (!list.length) return;
    downloadCSV(`report-trends-${dateRange.startDate}-${dateRange.endDate}.csv`, list, [
      { label: 'Date', key: 'date' },
      { label: 'Total', key: 'total' },
      { label: 'Completed', key: 'completed' },
      { label: 'Cancelled', key: 'cancelled' },
    ]);
  };

  const handleExportTeachers = () => {
    const list = reportData?.teachers ?? [];
    if (!list.length) return;
    const rows = list.map((row) => ({
      name:
        [row.user?.firstName, row.user?.lastName].filter(Boolean).join(' ') ||
        [row.user?.firstNameAr, row.user?.lastNameAr].filter(Boolean).join(' ') ||
        '—',
      email: row.user?.email ?? '',
      bookings: row._count?.bookings ?? 0,
    }));
    downloadCSV(`report-teachers-${dateRange.startDate}-${dateRange.endDate}.csv`, rows, [
      { label: 'Name', key: 'name' },
      { label: 'Email', key: 'email' },
      { label: 'Bookings', key: 'bookings' },
    ]);
  };

  const handleExportStudents = () => {
    const list = reportData?.students ?? [];
    if (!list.length) return;
    const rows = list.map((s) => ({
      name:
        [s.firstName, s.lastName].filter(Boolean).join(' ') ||
        [s.firstNameAr, s.lastNameAr].filter(Boolean).join(' ') ||
        '—',
      email: s.email ?? '',
      bookings: s._count?.studentBookings ?? 0,
    }));
    downloadCSV(`report-students-${dateRange.startDate}-${dateRange.endDate}.csv`, rows, [
      { label: 'Name', key: 'name' },
      { label: 'Email', key: 'email' },
      { label: 'Bookings', key: 'bookings' },
    ]);
  };

  const handleExportProfits = () => {
    if (!reportData?.summary) return;
    const s = reportData.summary;
    const rows = [
      { k: 'totalRevenue', v: s.totalRevenue },
      { k: 'platformRevenue', v: s.platformRevenue },
      { k: 'teacherEarnings', v: s.teacherEarnings },
      { k: 'teacherPayouts', v: s.teacherPayouts },
      { k: 'pendingPayouts', v: s.pendingPayouts },
      { k: 'netProfit', v: s.netProfit },
      { k: 'profitMargin%', v: s.profitMargin },
      { k: 'totalBookings', v: s.totalBookings },
      { k: 'completedBookings', v: s.completedBookings },
      { k: 'averageRevenuePerBooking', v: s.averageRevenuePerBooking },
    ];
    downloadCSV(`report-profits-${dateRange.startDate}-${dateRange.endDate}.csv`, rows, [
      { label: 'Metric', key: 'k' },
      { label: 'Value', key: 'v' },
    ]);
  };

  const runExport = () => {
    if (selectedReport === 'principal') handleExportPrincipal();
    else if (selectedReport === 'sessions') handleExportSessions();
    else if (selectedReport === 'trends') handleExportTrends();
    else if (selectedReport === 'teachers') handleExportTeachers();
    else if (selectedReport === 'students') handleExportStudents();
    else if (selectedReport === 'profits') handleExportProfits();
  };

  const runExportPdf = async () => {
    const rt = reportTypes.find((r) => r.id === selectedReport);
    const typeLabel = rt ? t(rt.labelKey) : selectedReport;
    setPdfLoading(true);
    try {
      await exportReportPdf({
        type: selectedReport,
        dateRange,
        labels: {
          ...pdfLabels,
          reportTitle: `${t('reports.title')} — ${typeLabel}`,
        },
        formatCurrency,
        principalData,
        trendsData,
        reportData,
        sidebar,
        isRTL,
        language,
      });
      toast.success(t('reports.pdfSuccess'));
    } catch (e) {
      console.error(e);
      toast.error(t('reports.pdfError'));
    } finally {
      setPdfLoading(false);
    }
  };

  const canExport =
    (selectedReport === 'principal' && principalData?.summary) ||
    (selectedReport === 'trends' && trendsData.length > 0) ||
    (selectedReport === 'sessions' && (reportData?.data?.length ?? 0) > 0) ||
    (selectedReport === 'teachers' &&
      ((reportData?.teachers?.length ?? 0) > 0 || (reportData?.topTeachers?.length ?? 0) > 0)) ||
    (selectedReport === 'students' &&
      ((reportData?.students?.length ?? 0) > 0 || (reportData?.topStudents?.length ?? 0) > 0)) ||
    (selectedReport === 'profits' && reportData?.summary);

  const summary = principalData?.summary;

  return (
    <div
      className={cn('space-y-6 pb-8 animate-in fade-in duration-300', isRTL && 'text-right')}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Hero */}
      <section className="overflow-hidden rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-6 text-white shadow-xl dark:border-emerald-900/50 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-100/90">{t('reports.title')}</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl arabic-text">{t('reports.title')}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-emerald-50/95 arabic-text">
              {t('reports.heroSubtitle')}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-black/15 px-3 py-2 text-sm backdrop-blur-sm">
            <FiCalendar className="size-4 shrink-0 opacity-90" aria-hidden />
            <span className="tabular-nums font-medium">
              {periodStart} — {periodEnd}
            </span>
          </div>
        </div>
      </section>

      {/* Period toolbar */}
      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800/80 sm:p-5">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {t('reports.dateRange')}
        </h2>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'last7', label: t('reports.last7Days') },
            { id: 'last30', label: t('reports.last30Days') },
            { id: 'thisMonth', label: t('reports.thisMonth') },
            { id: 'lastMonth', label: t('reports.lastMonth') },
          ].map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => applyPreset(id)}
              className={cn(
                'rounded-xl px-3 py-2 text-sm font-medium transition-all arabic-text',
                preset === id
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
              )}
            >
              {label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPreset('custom')}
            className={cn(
              'rounded-xl px-3 py-2 text-sm font-medium transition-all arabic-text',
              preset === 'custom'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
            )}
          >
            {t('reports.customRange')}
          </button>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('reports.startDate')}</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => {
                setPreset('custom');
                setDateRange((d) => ({ ...d, startDate: e.target.value }));
              }}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('reports.endDate')}</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => {
                setPreset('custom');
                setDateRange((d) => ({ ...d, endDate: e.target.value }));
              }}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </section>

      {/* Executive KPIs */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          <FiBarChart2 className="size-4 text-emerald-600" aria-hidden />
          {t('reports.executiveSummary')}
        </h2>
        {overviewLoading ? (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
        ) : summary ? (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
            <KpiTile
              label={t('reports.totalRevenue')}
              value={formatCurrency(summary.totalRevenue)}
              href="/payments"
            />
            <KpiTile label={t('reports.netProfit')} value={formatCurrency(summary.netProfit)} href="/finance" />
            <KpiTile label={t('reports.totalBookings')} value={summary.totalBookings ?? 0} href="/bookings" />
            <KpiTile label={t('reports.completedBookings')} value={summary.completedBookings ?? 0} href="/bookings" />
            <KpiTile label={t('reports.totalUsers')} value={summary.totalUsers ?? 0} href="/users" />
            <KpiTile label={t('reports.totalTeachers')} value={summary.totalTeachers ?? 0} href="/teachers" />
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('reports.loadingOverview')}</p>
        )}

        {principalData?.period && !overviewLoading && (
          <div className="mt-4 flex flex-wrap gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/60 px-4 py-3 text-sm dark:border-amber-900/40 dark:bg-amber-950/30">
            <span className="font-medium text-amber-900 dark:text-amber-100">{t('reports.periodNew')}:</span>
            <span className="text-amber-800 dark:text-amber-200">
              {t('reports.newUsers')}: <strong className="tabular-nums">{principalData.period.newUsers ?? 0}</strong>
            </span>
            <span className="text-amber-800 dark:text-amber-200">
              {t('reports.newTeachers')}: <strong className="tabular-nums">{principalData.period.newTeachers ?? 0}</strong>
            </span>
            <span className="text-amber-800 dark:text-amber-200">
              {t('reports.newStudents')}: <strong className="tabular-nums">{principalData.period.newStudents ?? 0}</strong>
            </span>
            <span className="text-amber-800 dark:text-amber-200">
              {t('reports.newBookings')}: <strong className="tabular-nums">{principalData.period.newBookings ?? 0}</strong>
            </span>
          </div>
        )}
      </section>

      {/* Charts + pie */}
      <section className="grid gap-6 lg:grid-cols-5">
        <Card className="overflow-hidden border-emerald-200/80 shadow-md dark:border-emerald-900/40 lg:col-span-3">
          <CardHeader className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50/90 to-teal-50/50 dark:border-emerald-900/30 dark:from-emerald-950/40 dark:to-teal-950/20">
            <CardTitle className="text-lg text-emerald-900 dark:text-emerald-100 arabic-text">{t('reports.bookingTrendsChart')}</CardTitle>
            <p className="text-xs text-emerald-700/80 dark:text-emerald-400/90 arabic-text">{t('reports.chartHint')}</p>
          </CardHeader>
          <CardContent className="p-4 pt-6">
            {overviewLoading ? (
              <Skeleton className="h-[300px] w-full rounded-xl" />
            ) : chartRows.length > 0 ? (
              <div className="h-[300px] w-full min-w-0" dir="ltr">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <LineChart data={chartRows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: '1px solid rgb(16 185 129 / 0.3)',
                        fontSize: 13,
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="total" name={t('reports.total')} stroke={LINE_COLORS.total} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="completed" name={t('reports.completed')} stroke={LINE_COLORS.completed} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="cancelled" name={t('reports.cancelled')} stroke={LINE_COLORS.cancelled} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-[220px] items-center justify-center text-sm text-gray-500 dark:text-gray-400 arabic-text">
                {t('reports.noData')}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-emerald-200/80 shadow-md dark:border-emerald-900/40 lg:col-span-2">
          <CardHeader className="border-b border-emerald-100 dark:border-emerald-900/30">
            <CardTitle className="text-lg text-emerald-900 dark:text-emerald-100 arabic-text">{t('reports.bookingMix')}</CardTitle>
          </CardHeader>
          <CardContent className="flex min-h-[300px] flex-col items-center justify-center p-4">
            {overviewLoading ? (
              <Skeleton className="h-52 w-52 rounded-full" />
            ) : pieMix.length > 0 ? (
              <div className="h-[260px] w-full" dir="ltr">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <PieChart>
                    <Pie data={pieMix} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={58} outerRadius={88} paddingAngle={2}>
                      {pieMix.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('reports.noData')}</p>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Quick links */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 arabic-text">
          {t('reports.quickNavigation')}
        </h2>
        <div className="flex flex-wrap gap-2">
          {quickLinks.map((link) => {
            const LinkIcon = link.icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm transition-all hover:border-emerald-300 hover:bg-emerald-50/80 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/40"
              >
                <LinkIcon className="size-4 text-emerald-600 dark:text-emerald-400" aria-hidden />
                <span className="arabic-text">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Tabbed detail */}
      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <Tabs value={selectedReport} onValueChange={setSelectedReport} className="w-full">
          <div className="border-b border-gray-200 bg-gray-50/80 px-3 py-3 dark:border-gray-700 dark:bg-gray-900/40 sm:px-4">
            <TabsList className="flex h-auto min-h-10 w-full flex-wrap justify-start gap-1 bg-transparent p-0">
              {reportTypes.map((rt) => {
                const TabIcon = rt.icon;
                return (
                  <TabsTrigger
                    key={rt.id}
                    value={rt.id}
                    className="gap-1.5 rounded-xl border border-transparent px-3 py-2 data-[state=active]:border-emerald-500 data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-900 dark:data-[state=active]:bg-emerald-950/50 dark:data-[state=active]:text-emerald-100"
                  >
                    <TabIcon className="size-3.5 shrink-0 opacity-80" aria-hidden />
                    <span className="text-xs sm:text-sm arabic-text">{t(rt.labelKey)}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white arabic-text">
                {t('reports.detailReport')}: {t(reportTypes.find((r) => r.id === selectedReport)?.labelKey)} — {periodStart} → {periodEnd}
              </h3>
              {!detailLoading && canExport && (
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" size="sm" onClick={runExport} className="shrink-0" type="button">
                    <FiDownload className={cn('size-4', isRTL ? 'ml-2' : 'mr-2')} />
                    {t('reports.export')}
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={runExportPdf}
                    disabled={pdfLoading}
                    className="shrink-0 bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md hover:from-emerald-700 hover:to-teal-800"
                    type="button"
                  >
                    <FiFileText className={cn('size-4', isRTL ? 'ml-2' : 'mr-2')} />
                    {pdfLoading ? t('reports.pdfGenerating') : t('reports.exportPdf')}
                  </Button>
                </div>
              )}
            </div>
          </div>

          <TabsContent value="principal" className="m-0 px-4 pb-6 pt-4 sm:px-6">
            {overviewLoading ? (
              <div className="space-y-3 py-6">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-40 w-full" />
              </div>
            ) : principalData?.summary ? (
              <>
                <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {t('reports.overview')}
                </h4>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {[
                    { label: t('dashboard.totalUsers'), value: principalData.summary.totalUsers },
                    { label: t('dashboard.teachers'), value: principalData.summary.totalTeachers },
                    { label: t('reports.totalStudents'), value: principalData.summary.totalStudents },
                    { label: t('reports.activeTeachers'), value: principalData.summary.activeTeachers },
                    { label: t('reports.pendingTeachers'), value: principalData.summary.pendingTeachers },
                    { label: t('reports.cancelledBookings'), value: principalData.summary.cancelledBookings },
                    { label: t('reports.platformRevenue'), value: formatCurrency(principalData.summary.platformRevenue) },
                    { label: t('reports.teacherPayouts'), value: formatCurrency(principalData.summary.teacherPayouts) },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="rounded-xl border border-gray-200 bg-gray-50/50 p-3 dark:border-gray-600 dark:bg-gray-700/30"
                    >
                      <p className="text-xs text-gray-500 dark:text-gray-400 arabic-text">{label}</p>
                      <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white tabular-nums">{value}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="py-8 text-sm text-gray-500 dark:text-gray-400">{t('reports.noData')}</p>
            )}
          </TabsContent>

          <TabsContent value="trends" className="m-0 px-4 pb-6 pt-4 sm:px-6">
            {overviewLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : trendsData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-600">
                      <th className="py-3 px-2 text-start font-semibold text-gray-600 dark:text-gray-400">{t('reports.date')}</th>
                      <th className="py-3 px-2 text-start font-semibold text-gray-600 dark:text-gray-400">{t('reports.total')}</th>
                      <th className="py-3 px-2 text-start font-semibold text-gray-600 dark:text-gray-400">{t('reports.completed')}</th>
                      <th className="py-3 px-2 text-start font-semibold text-gray-600 dark:text-gray-400">{t('reports.cancelled')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trendsData.map((row, i) => (
                      <tr key={row.date || i} className="border-b border-gray-100 dark:border-gray-700">
                        <td className="py-3 px-2 tabular-nums">{row.date}</td>
                        <td className="py-3 px-2 tabular-nums">{row.total ?? 0}</td>
                        <td className="py-3 px-2 tabular-nums">{row.completed ?? 0}</td>
                        <td className="py-3 px-2 tabular-nums">{row.cancelled ?? 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="py-8 text-sm text-gray-500 dark:text-gray-400">{t('reports.noData')}</p>
            )}
          </TabsContent>

          <TabsContent value="teachers" className="m-0 px-4 pb-6 pt-4 sm:px-6">
            {detailLoading ? (
              <div className="space-y-3 py-6">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            ) : reportData?.teachers?.length || reportData?.summary ? (
              <>
                {reportData.summary && (
                  <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      { label: t('reports.totalTeachers'), value: reportData.summary.totalTeachers },
                      { label: t('reports.activeTeachers'), value: reportData.summary.activeTeachers },
                      { label: t('reports.totalBookings'), value: reportData.summary.totalBookings },
                      { label: t('reports.completedBookings'), value: reportData.summary.completedBookings },
                    ].map(({ label, value }) => (
                      <div key={label} className="rounded-xl border border-gray-200 p-3 dark:border-gray-600">
                        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{value}</p>
                      </div>
                    ))}
                  </div>
                )}
                {(reportData.teachers?.length || reportData.topTeachers?.length) ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-600">
                          <th className="py-3 px-2 text-start font-semibold text-gray-600 dark:text-gray-400">{t('reports.teacher')}</th>
                          <th className="py-3 px-2 text-start font-semibold text-gray-600 dark:text-gray-400">{t('users.email')}</th>
                          <th className="py-3 px-2 text-start font-semibold text-gray-600 dark:text-gray-400">{t('reports.bookings')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(reportData.teachers || reportData.topTeachers || []).slice(0, 40).map((teacher) => (
                          <tr key={teacher.id} className="border-b border-gray-100 dark:border-gray-700">
                            <td className="py-3 px-2 arabic-text">
                              {[teacher.user?.firstName, teacher.user?.lastName].filter(Boolean).join(' ') ||
                                [teacher.user?.firstNameAr, teacher.user?.lastNameAr].filter(Boolean).join(' ') ||
                                '—'}
                            </td>
                            <td className="py-3 px-2">{teacher.user?.email ?? '—'}</td>
                            <td className="py-3 px-2 tabular-nums">{teacher._count?.bookings ?? 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="py-6 text-gray-500 dark:text-gray-400">{t('reports.noData')}</p>
                )}
              </>
            ) : (
              <p className="py-8 text-sm text-gray-500 dark:text-gray-400">{t('reports.noData')}</p>
            )}
          </TabsContent>

          <TabsContent value="students" className="m-0 px-4 pb-6 pt-4 sm:px-6">
            {detailLoading ? (
              <div className="space-y-3 py-6">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            ) : reportData?.students?.length || reportData?.summary ? (
              <>
                {reportData.summary && (
                  <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      { label: t('reports.totalStudents'), value: reportData.summary.totalStudents },
                      { label: t('reports.activeStudents'), value: reportData.summary.activeStudents },
                      { label: t('reports.totalBookings'), value: reportData.summary.totalBookings },
                      { label: t('reports.totalSpent'), value: formatCurrency(reportData.summary.totalSpent) },
                    ].map(({ label, value }) => (
                      <div key={label} className="rounded-xl border border-gray-200 p-3 dark:border-gray-600">
                        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{value}</p>
                      </div>
                    ))}
                  </div>
                )}
                {(reportData.students?.length || reportData.topStudents?.length) ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-600">
                          <th className="py-3 px-2 text-start font-semibold text-gray-600 dark:text-gray-400">{t('reports.student')}</th>
                          <th className="py-3 px-2 text-start font-semibold text-gray-600 dark:text-gray-400">{t('users.email')}</th>
                          <th className="py-3 px-2 text-start font-semibold text-gray-600 dark:text-gray-400">{t('reports.bookings')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(reportData.students || reportData.topStudents || []).slice(0, 40).map((s) => (
                          <tr key={s.id} className="border-b border-gray-100 dark:border-gray-700">
                            <td className="py-3 px-2 arabic-text">
                              {[s.firstName, s.lastName].filter(Boolean).join(' ') ||
                                [s.firstNameAr, s.lastNameAr].filter(Boolean).join(' ') ||
                                '—'}
                            </td>
                            <td className="py-3 px-2">{s.email ?? '—'}</td>
                            <td className="py-3 px-2 tabular-nums">{s._count?.studentBookings ?? 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="py-6 text-gray-500 dark:text-gray-400">{t('reports.noData')}</p>
                )}
              </>
            ) : (
              <p className="py-8 text-sm text-gray-500 dark:text-gray-400">{t('reports.noData')}</p>
            )}
          </TabsContent>

          <TabsContent value="profits" className="m-0 px-4 pb-6 pt-4 sm:px-6">
            {detailLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : reportData?.summary ? (
              <>
                <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {[
                    { label: t('reports.totalRevenue'), value: formatCurrency(reportData.summary.totalRevenue) },
                    { label: t('reports.platformRevenue'), value: formatCurrency(reportData.summary.platformRevenue) },
                    { label: t('reports.teacherPayouts'), value: formatCurrency(reportData.summary.teacherPayouts) },
                    { label: t('reports.pendingPayouts'), value: formatCurrency(reportData.summary.pendingPayouts) },
                    { label: t('reports.netProfit'), value: formatCurrency(reportData.summary.netProfit) },
                    {
                      label: t('reports.profitMargin'),
                      value: reportData.summary.profitMargin != null ? `${reportData.summary.profitMargin}%` : '—',
                    },
                    { label: t('reports.averageRevenuePerBooking'), value: formatCurrency(reportData.summary.averageRevenuePerBooking) },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-xl border border-gray-200 p-3 dark:border-gray-600">
                      <p className="text-xs text-gray-500 dark:text-gray-400 arabic-text">{label}</p>
                      <p className="mt-1 font-semibold text-gray-900 dark:text-white">{value}</p>
                    </div>
                  ))}
                </div>
                {reportData.revenueByDate?.length > 0 && (
                  <div className="overflow-x-auto">
                    <h4 className="mb-2 text-sm font-semibold text-gray-600 dark:text-gray-400">{t('reports.revenueByDate')}</h4>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-600">
                          <th className="py-2 px-2 text-start font-semibold text-gray-600 dark:text-gray-400">{t('reports.date')}</th>
                          <th className="py-2 px-2 text-start font-semibold text-gray-600 dark:text-gray-400">{t('reports.amount')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.revenueByDate.slice(0, 25).map((r, i) => (
                          <tr key={i} className="border-b border-gray-100 dark:border-gray-700">
                            <td className="py-2 px-2">{formatDate(r.createdAt)}</td>
                            <td className="py-2 px-2 tabular-nums">{formatCurrency(r.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            ) : (
              <p className="py-8 text-sm text-gray-500 dark:text-gray-400">{t('reports.noData')}</p>
            )}
          </TabsContent>

          <TabsContent value="sessions" className="m-0 px-4 pb-6 pt-4 sm:px-6">
            {detailLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <>
                <p className="mb-4 text-sm text-gray-500 dark:text-gray-400 arabic-text">{t('reports.sessionsDesc')}</p>
                {(reportData?.data?.length ?? 0) > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-600">
                          <th className="py-3 px-2 text-start font-semibold text-gray-600 dark:text-gray-400">{t('reports.date')}</th>
                          <th className="py-3 px-2 text-start font-semibold text-gray-600 dark:text-gray-400">{t('reports.teacher')}</th>
                          <th className="py-3 px-2 text-start font-semibold text-gray-600 dark:text-gray-400">{t('reports.student')}</th>
                          <th className="py-3 px-2 text-start font-semibold text-gray-600 dark:text-gray-400">{t('users.email')}</th>
                          <th className="py-3 px-2 text-start font-semibold text-gray-600 dark:text-gray-400">{t('reports.sessionEnded')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.data.map((row) => (
                          <tr key={row.id} className="border-b border-gray-100 dark:border-gray-700">
                            <td className="py-3 px-2">{row.date}</td>
                            <td className="py-3 px-2 arabic-text">{row.teacherName}</td>
                            <td className="py-3 px-2 arabic-text">{row.studentName}</td>
                            <td className="py-3 px-2">{row.studentEmail ?? '—'}</td>
                            <td className="py-3 px-2">{row.endedAt ?? '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="py-8 text-sm text-gray-500 dark:text-gray-400">{t('reports.noSessions')}</p>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
};

export default Reports;
