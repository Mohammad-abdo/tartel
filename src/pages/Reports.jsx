import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { adminAPI } from '../services/api';
import { FiBarChart2, FiTrendingUp, FiCalendar, FiDollarSign, FiUsers } from 'react-icons/fi';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { cn } from '../lib/utils';

const reportTypes = [
  { id: 'principal', labelKey: 'reports.principal', descKey: 'reports.principalDesc', icon: FiBarChart2, color: 'primary' },
  { id: 'teachers', labelKey: 'reports.teachers', descKey: 'reports.teachersDesc', icon: FiTrendingUp, color: 'emerald' },
  { id: 'students', labelKey: 'reports.students', descKey: 'reports.studentsDesc', icon: FiUsers, color: 'blue' },
  { id: 'profits', labelKey: 'reports.profits', descKey: 'reports.profitsDesc', icon: FiDollarSign, color: 'purple' },
  { id: 'trends', labelKey: 'reports.trends', descKey: 'reports.trendsDesc', icon: FiCalendar, color: 'amber' },
];

const Reports = () => {
  const { t } = useTranslation();
  const [selectedReport, setSelectedReport] = useState('principal');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  useEffect(() => {
    if (selectedReport) fetchReport();
  }, [selectedReport, dateRange]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = { ...(dateRange.startDate && { startDate: dateRange.startDate }), ...(dateRange.endDate && { endDate: dateRange.endDate }) };
      let response;
      switch (selectedReport) {
        case 'principal': response = await adminAPI.getPrincipalReport(params); break;
        case 'teachers': response = await adminAPI.getTeacherReport(params); break;
        case 'students': response = await adminAPI.getStudentReport(params); break;
        case 'profits': response = await adminAPI.getProfitReport(params); break;
        case 'trends': response = await adminAPI.getBookingTrends(params); break;
        default: return;
      }
      setReportData(response.data);
    } catch (error) {
      console.error('Failed to fetch report:', error);
    } finally {
      setLoading(false);
    }
  };

  const colorMap = { primary: 'primary', emerald: 'emerald', blue: 'blue', purple: 'purple', amber: 'amber' };

  return (
    <div className="space-y-4 sm:space-y-5 lg:space-y-6 2xl:space-y-5">
      <div>
        <p className="text-xs font-semibold tracking-wide text-primary-600 uppercase mb-1">Reports</p>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">{t('reports.title') || 'Reports'}</h1>
        <p className="text-gray-500 mt-1 text-sm">{t('reports.subtitle') || 'View and analyze platform data'}</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('reports.startDate') || 'Start Date'}</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('reports.endDate') || 'End Date'}</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-4">
        {reportTypes.map(({ id, labelKey, descKey, icon: Icon, color }) => (
          <Card
            key={id}
            className={cn(
              'cursor-pointer transition-all hover:shadow-md',
              selectedReport === id ? 'ring-2 ring-primary-500 bg-primary-50/30' : ''
            )}
            onClick={() => setSelectedReport(id)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">{t(labelKey) || id}</CardTitle>
              <div className={cn('rounded-lg p-2', color === 'primary' && 'bg-primary-50', color === 'emerald' && 'bg-emerald-50', color === 'blue' && 'bg-blue-50', color === 'purple' && 'bg-purple-50', color === 'amber' && 'bg-amber-50')}>
                <Icon className={cn('size-5', color === 'primary' && 'text-primary-600', color === 'emerald' && 'text-emerald-600', color === 'blue' && 'text-blue-600', color === 'purple' && 'text-purple-600', color === 'amber' && 'text-amber-600')} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-500">{t(descKey) || 'View report'}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{selectedReport.charAt(0).toUpperCase() + selectedReport.slice(1)} {t('reports.report') || 'Report'}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col gap-3 py-8">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : reportData ? (
            <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm border border-gray-100">{JSON.stringify(reportData, null, 2)}</pre>
          ) : (
            <p className="text-gray-500 text-sm">{t('reports.selectReport') || 'Select a report type to view data.'}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
