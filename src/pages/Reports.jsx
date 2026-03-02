import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
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
} from 'react-icons/fi';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';

const reportTypes = [
  { id: 'principal', labelKey: 'reports.principal', descKey: 'reports.principalDesc', icon: FiBarChart2 },
  { id: 'teachers', labelKey: 'reports.teachers', descKey: 'reports.teachersDesc', icon: FiUserCheck },
  { id: 'students', labelKey: 'reports.students', descKey: 'reports.studentsDesc', icon: FiUsers },
  { id: 'profits', labelKey: 'reports.profits', descKey: 'reports.profitsDesc', icon: FiDollarSign },
  { id: 'trends', labelKey: 'reports.trends', descKey: 'reports.trendsDesc', icon: FiTrendingUp },
  { id: 'sessions', labelKey: 'reports.sessions', descKey: 'reports.sessionsDesc', icon: FiFileText },
];

function formatDate(str) {
  if (!str) return '—';
  const d = typeof str === 'string' ? new Date(str) : str;
  return isNaN(d.getTime()) ? str : d.toLocaleDateString();
}

function downloadCSV(filename, rows, columns) {
  const head = columns.map((c) => c.label).join(',');
  const body = rows.map((row) => columns.map((c) => (c.key ? (row[c.key] ?? '') : (c.get ? c.get(row) : ''))).join(',')).join('\n');
  const csv = '\uFEFF' + head + '\n' + body;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const Reports = () => {
  const { t } = useTranslation();
  const { formatCurrency } = useCurrency();
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [selectedReport, setSelectedReport] = useState('principal');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState(() => {
    const end = new Date();
    const start = new Date(end.getFullYear(), end.getMonth(), 1);
    return {
      startDate: start.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10),
    };
  });

  useEffect(() => {
    if (selectedReport) fetchReport();
  }, [selectedReport, dateRange.startDate, dateRange.endDate]);

  const fetchReport = async () => {
    setLoading(true);
    setReportData(null);
    try {
      const params = {
        ...(dateRange.startDate && { startDate: dateRange.startDate }),
        ...(dateRange.endDate && { endDate: dateRange.endDate }),
      };
      let response;
      switch (selectedReport) {
        case 'principal':
          response = await adminAPI.getPrincipalReport(params);
          break;
        case 'teachers':
          response = await adminAPI.getTeacherReport(params);
          break;
        case 'students':
          response = await adminAPI.getStudentReport(params);
          break;
        case 'profits':
          response = await adminAPI.getProfitReport(params);
          break;
        case 'trends':
          response = await adminAPI.getBookingTrends(params);
          break;
        case 'sessions':
          response = await adminAPI.getSessionReports({ ...params, limit: 200 });
          break;
        default:
          return;
      }
      const data = response?.data ?? response;
      setReportData(Array.isArray(data) ? { data, periodRange: {} } : data);
    } catch (error) {
      console.error('Failed to fetch report:', error);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPrincipal = () => {
    if (!reportData?.summary) return;
    const s = reportData.summary;
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
    downloadCSV(
      `report-principal-${dateRange.startDate}-${dateRange.endDate}.csv`,
      rows,
      [{ label: 'Metric', key: 'k' }, { label: 'Value', key: 'v' }]
    );
  };

  const handleExportSessions = () => {
    const list = reportData?.data ?? [];
    if (!list.length) return;
    downloadCSV(
      `report-sessions-${dateRange.startDate}-${dateRange.endDate}.csv`,
      list,
      [
        { label: 'Date', key: 'date' },
        { label: 'Teacher', key: 'teacherName' },
        { label: 'Student', key: 'studentName' },
        { label: 'Student Email', key: 'studentEmail' },
        { label: 'Session Ended', key: 'endedAt' },
      ]
    );
  };

  const handleExportTrends = () => {
    const list = Array.isArray(reportData) ? reportData : reportData?.data ?? [];
    if (!list.length) return;
    downloadCSV(
      `report-trends-${dateRange.startDate}-${dateRange.endDate}.csv`,
      list,
      [
        { label: 'Date', key: 'date' },
        { label: 'Total', key: 'total' },
        { label: 'Completed', key: 'completed' },
        { label: 'Cancelled', key: 'cancelled' },
      ]
    );
  };

  const handleExportTeachers = () => {
    const list = reportData?.teachers ?? [];
    if (!list.length) return;
    const rows = list.map((t) => ({
      name: [t.user?.firstName, t.user?.lastName].filter(Boolean).join(' ') || [t.user?.firstNameAr, t.user?.lastNameAr].filter(Boolean).join(' ') || '—',
      email: t.user?.email ?? '',
      bookings: t._count?.bookings ?? 0,
    }));
    downloadCSV(
      `report-teachers-${dateRange.startDate}-${dateRange.endDate}.csv`,
      rows,
      [{ label: 'Name', key: 'name' }, { label: 'Email', key: 'email' }, { label: 'Bookings', key: 'bookings' }]
    );
  };

  const handleExportStudents = () => {
    const list = reportData?.students ?? [];
    if (!list.length) return;
    const rows = list.map((s) => ({
      name: [s.firstName, s.lastName].filter(Boolean).join(' ') || [s.firstNameAr, s.lastNameAr].filter(Boolean).join(' ') || '—',
      email: s.email ?? '',
      bookings: s._count?.studentBookings ?? 0,
    }));
    downloadCSV(
      `report-students-${dateRange.startDate}-${dateRange.endDate}.csv`,
      rows,
      [{ label: 'Name', key: 'name' }, { label: 'Email', key: 'email' }, { label: 'Bookings', key: 'bookings' }]
    );
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
    downloadCSV(
      `report-profits-${dateRange.startDate}-${dateRange.endDate}.csv`,
      rows,
      [{ label: 'Metric', key: 'k' }, { label: 'Value', key: 'v' }]
    );
  };

  const periodRange = reportData?.periodRange ?? {};
  const periodStart = periodRange.startDate ? formatDate(periodRange.startDate) : dateRange.startDate;
  const periodEnd = periodRange.endDate ? formatDate(periodRange.endDate) : dateRange.endDate;

  return (
    <div className={cn('space-y-4 sm:space-y-5 lg:space-y-6 2xl:space-y-5', isRTL && 'text-right')} dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <p className="text-xs font-semibold tracking-wide text-primary-600 uppercase mb-1">{t('reports.title') || 'التقارير'}</p>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">{t('reports.title') || 'التقارير'}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">{t('reports.subtitle') || 'عرض وتحليل بيانات المنصة وتقارير الجلسات'}</p>
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-4 md:p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">{t('reports.dateRange') || 'الفترة'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('reports.startDate') || 'من تاريخ'}</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('reports.endDate') || 'إلى تاريخ'}</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {reportTypes.map(({ id, labelKey, descKey, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setSelectedReport(id)}
            className={cn(
              'rounded-2xl border p-4 text-left transition-all hover:shadow-md',
              selectedReport === id
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-2 ring-primary-500'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-300 dark:hover:border-primary-700'
            )}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t(labelKey) || id}</span>
              <div className="rounded-lg p-1.5 bg-primary-50 dark:bg-primary-900/30">
                <Icon className="size-4 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t(descKey) || ''}</p>
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 px-4 sm:px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              {t(reportTypes.find((r) => r.id === selectedReport)?.labelKey) || selectedReport} — {periodStart} → {periodEnd}
            </CardTitle>
            {!loading && reportData && (
              <Button variant="outline" size="sm" onClick={() => {
                if (selectedReport === 'principal') handleExportPrincipal();
                else if (selectedReport === 'sessions') handleExportSessions();
                else if (selectedReport === 'trends') handleExportTrends();
                else if (selectedReport === 'teachers') handleExportTeachers();
                else if (selectedReport === 'students') handleExportStudents();
                else if (selectedReport === 'profits') handleExportProfits();
              }}>
                <FiDownload className="size-4 mr-2 rtl:ml-2 rtl:mr-0" />
                {t('reports.export') || 'تصدير CSV'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {loading ? (
            <div className="flex flex-col gap-3 py-8">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : !reportData ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm py-6">{t('reports.selectReport') || 'اختر نوع التقرير لعرض البيانات.'}</p>
          ) : selectedReport === 'principal' && reportData.summary ? (
            <>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">{t('reports.overview') || 'نظرة عامة'}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                {[
                  { label: t('dashboard.totalUsers') || 'إجمالي المستخدمين', value: reportData.summary.totalUsers },
                  { label: t('dashboard.teachers') || 'المشايخ', value: reportData.summary.totalTeachers },
                  { label: t('reports.totalStudents') || 'الطلاب', value: reportData.summary.totalStudents },
                  { label: t('reports.activeTeachers') || 'مشايخ نشطون', value: reportData.summary.activeTeachers },
                  { label: t('reports.pendingTeachers') || 'مشايخ بانتظار الموافقة', value: reportData.summary.pendingTeachers },
                  { label: t('reports.totalBookings') || 'إجمالي الحجوزات', value: reportData.summary.totalBookings },
                  { label: t('reports.completedBookings') || 'حجوزات مكتملة', value: reportData.summary.completedBookings },
                  { label: t('reports.cancelledBookings') || 'حجوزات ملغاة', value: reportData.summary.cancelledBookings },
                  { label: t('dashboard.revenue') || 'الإيرادات', value: formatCurrency(reportData.summary.totalRevenue) },
                  { label: t('reports.platformRevenue') || 'إيراد المنصة', value: formatCurrency(reportData.summary.platformRevenue) },
                  { label: t('reports.teacherPayouts') || 'مدفوعات المشايخ', value: formatCurrency(reportData.summary.teacherPayouts) },
                  { label: t('reports.netProfit') || 'صافي الربح', value: formatCurrency(reportData.summary.netProfit) },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-xl border border-gray-200 dark:border-gray-600 p-4 bg-gray-50/50 dark:bg-gray-700/30">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
                  </div>
                ))}
              </div>
              {reportData.period && (
                <>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">{t('reports.periodNew') || 'الجديد في الفترة'}</h3>
                  <div className="flex flex-wrap gap-4">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{t('reports.newUsers') || 'مستخدمون جدد'}: <strong>{reportData.period.newUsers}</strong></span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{t('reports.newTeachers') || 'مشايخ جدد'}: <strong>{reportData.period.newTeachers}</strong></span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{t('reports.newStudents') || 'طلاب جدد'}: <strong>{reportData.period.newStudents}</strong></span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{t('reports.newBookings') || 'حجوزات جديدة'}: <strong>{reportData.period.newBookings}</strong></span>
                  </div>
                </>
              )}
            </>
          ) : selectedReport === 'teachers' && (reportData.teachers?.length || reportData.summary) ? (
            <>
              {reportData.summary && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: t('reports.totalTeachers') || 'إجمالي المشايخ', value: reportData.summary.totalTeachers },
                    { label: t('reports.activeTeachers') || 'نشطون', value: reportData.summary.activeTeachers },
                    { label: t('reports.totalBookings') || 'الحجوزات', value: reportData.summary.totalBookings },
                    { label: t('reports.completedBookings') || 'مكتملة', value: reportData.summary.completedBookings },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-xl border border-gray-200 dark:border-gray-600 p-3">
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
                        <th className="py-3 px-2 text-left font-semibold text-gray-600 dark:text-gray-400">{t('content.author') || 'الشيخ'}</th>
                        <th className="py-3 px-2 text-left font-semibold text-gray-600 dark:text-gray-400">{t('users.email') || 'البريد'}</th>
                        <th className="py-3 px-2 text-left font-semibold text-gray-600 dark:text-gray-400">{t('reports.bookings') || 'الحجوزات'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(reportData.teachers || reportData.topTeachers || []).slice(0, 30).map((teacher) => (
                        <tr key={teacher.id} className="border-b border-gray-100 dark:border-gray-700">
                          <td className="py-3 px-2">{[teacher.user?.firstName, teacher.user?.lastName].filter(Boolean).join(' ') || [teacher.user?.firstNameAr, teacher.user?.lastNameAr].filter(Boolean).join(' ') || '—'}</td>
                          <td className="py-3 px-2">{teacher.user?.email ?? '—'}</td>
                          <td className="py-3 px-2">{teacher._count?.bookings ?? 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 py-4">{t('reports.noData') || 'لا توجد بيانات.'}</p>
              )}
            </>
          ) : selectedReport === 'students' && (reportData.students?.length || reportData.summary) ? (
            <>
              {reportData.summary && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: t('reports.totalStudents') || 'إجمالي الطلاب', value: reportData.summary.totalStudents },
                    { label: t('reports.activeStudents') || 'نشطون', value: reportData.summary.activeStudents },
                    { label: t('reports.totalBookings') || 'الحجوزات', value: reportData.summary.totalBookings },
                    { label: t('reports.totalSpent') || 'إجمالي الإنفاق', value: formatCurrency(reportData.summary.totalSpent) },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-xl border border-gray-200 dark:border-gray-600 p-3">
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
                        <th className="py-3 px-2 text-left font-semibold text-gray-600 dark:text-gray-400">{t('content.author') || 'الطالب'}</th>
                        <th className="py-3 px-2 text-left font-semibold text-gray-600 dark:text-gray-400">{t('users.email') || 'البريد'}</th>
                        <th className="py-3 px-2 text-left font-semibold text-gray-600 dark:text-gray-400">{t('reports.bookings') || 'الحجوزات'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(reportData.students || reportData.topStudents || []).slice(0, 30).map((s) => (
                        <tr key={s.id} className="border-b border-gray-100 dark:border-gray-700">
                          <td className="py-3 px-2">{[s.firstName, s.lastName].filter(Boolean).join(' ') || [s.firstNameAr, s.lastNameAr].filter(Boolean).join(' ') || '—'}</td>
                          <td className="py-3 px-2">{s.email ?? '—'}</td>
                          <td className="py-3 px-2">{s._count?.studentBookings ?? 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 py-4">{t('reports.noData') || 'لا توجد بيانات.'}</p>
              )}
            </>
          ) : selectedReport === 'profits' && reportData.summary ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                {[
                  { label: t('reports.totalRevenue') || 'إجمالي الإيرادات', value: formatCurrency(reportData.summary.totalRevenue) },
                  { label: t('reports.platformRevenue') || 'إيراد المنصة', value: formatCurrency(reportData.summary.platformRevenue) },
                  { label: t('reports.teacherPayouts') || 'مدفوعات المشايخ', value: formatCurrency(reportData.summary.teacherPayouts) },
                  { label: t('reports.pendingPayouts') || 'مدفوعات معلقة', value: formatCurrency(reportData.summary.pendingPayouts) },
                  { label: t('reports.netProfit') || 'صافي الربح', value: formatCurrency(reportData.summary.netProfit) },
                  { label: t('reports.profitMargin') || 'هامش الربح %', value: reportData.summary.profitMargin != null ? `${reportData.summary.profitMargin}%` : '—' },
                  { label: t('reports.averageRevenuePerBooking') || 'متوسط الإيراد لكل حجز', value: formatCurrency(reportData.summary.averageRevenuePerBooking) },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-xl border border-gray-200 dark:border-gray-600 p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{value}</p>
                  </div>
                ))}
              </div>
              {reportData.revenueByDate?.length > 0 && (
                <div className="overflow-x-auto mt-4">
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">{t('reports.revenueByDate') || 'الإيراد حسب التاريخ'}</h3>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-600">
                        <th className="py-2 px-2 text-left font-semibold text-gray-600 dark:text-gray-400">{t('reports.date') || 'التاريخ'}</th>
                        <th className="py-2 px-2 text-left font-semibold text-gray-600 dark:text-gray-400">{t('reports.amount') || 'المبلغ'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.revenueByDate.slice(0, 20).map((r, i) => (
                        <tr key={i} className="border-b border-gray-100 dark:border-gray-700">
                          <td className="py-2 px-2">{formatDate(r.createdAt)}</td>
                          <td className="py-2 px-2">{formatCurrency(r.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : selectedReport === 'trends' && (reportData?.length || reportData?.data?.length) ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-600">
                    <th className="py-3 px-2 text-left font-semibold text-gray-600 dark:text-gray-400">{t('reports.date') || 'التاريخ'}</th>
                    <th className="py-3 px-2 text-left font-semibold text-gray-600 dark:text-gray-400">{t('reports.total') || 'الإجمالي'}</th>
                    <th className="py-3 px-2 text-left font-semibold text-gray-600 dark:text-gray-400">{t('reports.completed') || 'مكتمل'}</th>
                    <th className="py-3 px-2 text-left font-semibold text-gray-600 dark:text-gray-400">{t('reports.cancelled') || 'ملغى'}</th>
                  </tr>
                </thead>
                <tbody>
                  {(Array.isArray(reportData) ? reportData : reportData.data || []).map((row, i) => (
                    <tr key={row.date || i} className="border-b border-gray-100 dark:border-gray-700">
                      <td className="py-3 px-2">{row.date}</td>
                      <td className="py-3 px-2">{row.total ?? 0}</td>
                      <td className="py-3 px-2">{row.completed ?? 0}</td>
                      <td className="py-3 px-2">{row.cancelled ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : selectedReport === 'sessions' && (reportData?.data?.length >= 0) ? (
            <>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {t('reports.sessionsDesc') || 'تقارير الجلسات المكتملة (الشيخ والطالب وتاريخ الجلسة).'}
              </p>
              {(reportData.data?.length || 0) > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-600">
                        <th className="py-3 px-2 text-left font-semibold text-gray-600 dark:text-gray-400">{t('reports.date') || 'التاريخ'}</th>
                        <th className="py-3 px-2 text-left font-semibold text-gray-600 dark:text-gray-400">{t('reports.teacher') || 'الشيخ'}</th>
                        <th className="py-3 px-2 text-left font-semibold text-gray-600 dark:text-gray-400">{t('reports.student') || 'الطالب'}</th>
                        <th className="py-3 px-2 text-left font-semibold text-gray-600 dark:text-gray-400">{t('users.email') || 'البريد'}</th>
                        <th className="py-3 px-2 text-left font-semibold text-gray-600 dark:text-gray-400">{t('reports.sessionEnded') || 'انتهت الجلسة'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.data.map((row) => (
                        <tr key={row.id} className="border-b border-gray-100 dark:border-gray-700">
                          <td className="py-3 px-2">{row.date}</td>
                          <td className="py-3 px-2">{row.teacherName}</td>
                          <td className="py-3 px-2">{row.studentName}</td>
                          <td className="py-3 px-2">{row.studentEmail ?? '—'}</td>
                          <td className="py-3 px-2">{row.endedAt ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 py-6">{t('reports.noSessions') || 'لا توجد جلسات مكتملة في هذه الفترة.'}</p>
              )}
            </>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 py-6">{t('reports.noData') || 'لا توجد بيانات لهذا التقرير.'}</p>
          )}
        </CardContent>
      </div>
    </div>
  );
};

export default Reports;
