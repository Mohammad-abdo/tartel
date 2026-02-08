import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { adminAPI } from '../services/api';
import {
  FiUsers,
  FiUserCheck,
  FiCalendar,
  FiDollarSign,
  FiTrendingUp,
  FiActivity,
  FiBook,
  FiCreditCard,
  FiArrowUpRight,
  FiArrowDownRight,
} from 'react-icons/fi';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { cn } from '../lib/utils';

/* Tarteel primary/accent only – no mixed colors */
const CHART_PRIMARY = 'hsl(var(--primary))';
const CHART_ACCENT = 'hsl(var(--accent))';
const CHART_MUTED = 'hsl(var(--muted-foreground))';

const StatCard = ({ icon: Icon, title, value, change, href }) => {
  const { t } = useTranslation();
  const isPositive = change != null && change >= 0;
  const content = (
    <>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 arabic-text">{title}</p>
          <p className="mt-2 text-3xl font-bold text-emerald-900 dark:text-emerald-100 arabic-text">{value}</p>
          {change != null && (
            <p className={cn(
              'mt-1 flex items-center gap-1 text-xs font-medium arabic-text',
              isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
            )}>
              {isPositive ? <FiArrowUpRight className="size-3.5" aria-hidden /> : <FiArrowDownRight className="size-3.5" aria-hidden />}
              {Math.abs(change)}% {t('dashboard.fromLastMonth')}
            </p>
          )}
        </div>
        <div className="flex size-11 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
          <Icon className="size-5" aria-hidden />
        </div>
      </div>
    </>
  );
  const wrapperClass = 'overflow-hidden rounded-2xl border border-emerald-200 dark:border-emerald-700 bg-gradient-to-br from-white to-emerald-50 dark:from-gray-900 dark:to-emerald-900/20 shadow-lg transition-all duration-200 hover:shadow-xl hover:border-emerald-300 dark:hover:border-emerald-600 hover:scale-[1.02] islamic-pattern';
  if (href) {
    return (
      <Link to={href} className="block h-full">
        <div className={cn('h-full p-5', wrapperClass)}>
          {content}
        </div>
      </Link>
    );
  }
  return (
    <div className={cn('h-full p-5', wrapperClass)}>
      {content}
    </div>
  );
};

const Dashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await adminAPI.getDashboard();
        const d = res.data ?? {};
        setStats({
          ...(d.stats ?? {}),
          recentBookings: d.recentBookings,
          recentCourses: d.recentCourses,
          recentSubscriptions: d.recentSubscriptions,
        });
      } catch {
        setStats(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const bookingsChartData = [
    { name: 'Jan', bookings: stats?.totalBookings ? Math.min(stats.totalBookings, 40) : 12 },
    { name: 'Feb', bookings: stats?.totalBookings ? Math.min(stats.totalBookings + 5, 45) : 18 },
    { name: 'Mar', bookings: stats?.totalBookings ? Math.min(stats.totalBookings + 10, 50) : 22 },
    { name: 'Apr', bookings: stats?.totalBookings ? Math.min(stats.totalBookings + 15, 55) : 28 },
    { name: 'May', bookings: stats?.totalBookings ? Math.min(stats.totalBookings + 20, 60) : 32 },
    { name: 'Jun', bookings: stats?.totalBookings ?? 35 },
  ];

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-9 w-56 mb-2" />
          <Skeleton className="h-5 w-80" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-4 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[280px] w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-36" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <section>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">{t('dashboard.title')}</h1>
        <p className="mt-2 max-w-2xl text-base text-gray-600 dark:text-gray-400">{t('dashboard.welcome')}</p>
      </section>

      {/* Stats cards — rounded-2xl, border, uppercase label */}
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('dashboard.overview') || 'نظرة عامة'}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={FiUsers}
            title={t('dashboard.totalUsers')}
            value={stats?.totalUsers ?? 0}
            change={12}
            href="/users"
          />
          <StatCard
            icon={FiUserCheck}
            title={t('dashboard.teachers')}
            value={stats?.totalTeachers ?? 0}
            change={8}
            href="/teachers"
          />
          <StatCard
            icon={FiCalendar}
            title={t('dashboard.bookings')}
            value={stats?.totalBookings ?? 0}
            change={-2}
            href="/bookings"
          />
          <StatCard
            icon={FiDollarSign}
            title={t('dashboard.revenue')}
            value={`$${(stats?.totalRevenue || 0).toLocaleString()}`}
            change={23}
          />
        </div>
      </section>

      {/* Main content: chart + activity */}
      <section className="grid gap-6 lg:grid-cols-3">
        {/* Bookings trend */}
        <div className="overflow-hidden rounded-2xl border border-emerald-200 dark:border-emerald-700 bg-gradient-to-br from-white to-emerald-50 dark:from-gray-900 dark:to-emerald-900/20 shadow-lg lg:col-span-2 islamic-pattern">
          <CardHeader className="border-b border-emerald-200 dark:border-emerald-700 bg-gradient-to-r from-emerald-50 to-amber-50 dark:from-emerald-900/30 dark:to-amber-900/30 px-4 sm:px-6 py-3 sm:py-4">
            <CardTitle className="text-lg font-semibold text-emerald-900 dark:text-emerald-100 arabic-text">📈 إحصائيات الحجوزات الشهرية</CardTitle>
            <p className="mt-0.5 text-sm text-emerald-600 dark:text-emerald-400 arabic-text">تتبع نشاط الطلاب والمشايخ - آخر 6 أشهر</p>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bookingsChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: 'hsl(var(--islamic-green-600))', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'hsl(var(--islamic-green-600))', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '2px solid hsl(var(--islamic-green-200))', 
                      borderRadius: '12px',
                      fontSize: '14px'
                    }}
                    labelStyle={{ color: 'hsl(var(--islamic-green-900))' }}
                  />
                  <Bar dataKey="bookings" fill="hsl(var(--islamic-green-600))" radius={[4, 4, 0, 0]} name="الحجوزات" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </div>

        {/* Recent activity */}
        <div className="overflow-hidden rounded-2xl border border-emerald-200 dark:border-emerald-700 bg-gradient-to-br from-white to-emerald-50 dark:from-gray-900 dark:to-emerald-900/20 shadow-lg islamic-pattern">
          <CardHeader className="border-b border-emerald-200 dark:border-emerald-700 bg-gradient-to-r from-emerald-50 to-amber-50 dark:from-emerald-900/30 dark:to-amber-900/30 px-4 sm:px-6 py-3 sm:py-4">
            <CardTitle className="text-lg font-semibold text-emerald-900 dark:text-emerald-100 arabic-text">📊 النشاط الحديث</CardTitle>
            <p className="text-sm text-emerald-600 dark:text-emerald-400 arabic-text">آخر العمليات في المنصة</p>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <ul className="space-y-2" role="list">
              {stats?.recentBookings && stats.recentBookings.length > 0 ? (
                stats.recentBookings.slice(0, 6).map((booking, idx) => (
                  <li key={idx}>
                    <div className="flex items-center gap-3 rounded-xl border border-emerald-200 dark:border-emerald-700 bg-white/70 dark:bg-gray-800/70 px-3 py-2.5 transition-all duration-200 hover:shadow-md hover:bg-emerald-50/70 dark:hover:bg-emerald-900/30">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/30 text-emerald-700 dark:text-emerald-300">
                        <FiCalendar className="size-4" aria-hidden />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-emerald-900 dark:text-emerald-100 arabic-text">
                          حجز جديد من {booking.student?.firstName || booking.student?.email || 'طالب'}
                        </p>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400">{new Date(booking.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <>
                  {[
                    { text: t('dashboard.newUserRegistered'), time: `2 ${t('dashboard.minutesAgo')}` },
                    { text: t('dashboard.bookingConfirmed'), time: `15 ${t('dashboard.minutesAgo')}` },
                    { text: t('dashboard.paymentReceived'), time: `1 ${t('dashboard.hourAgo')}` },
                  ].map((item, i) => (
                    <li key={i}>
                      <div className="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 px-3 py-2.5">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                          <FiActivity className="size-4" aria-hidden />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground">{item.text}</p>
                          <p className="text-xs text-muted-foreground">{item.time}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </>
              )}
            </ul>
          </CardContent>
        </div>
      </section>

      {/* Quick stats */}
      <section>
        <div className="overflow-hidden rounded-2xl border border-emerald-200 dark:border-emerald-700 bg-gradient-to-br from-white to-emerald-50 dark:from-gray-900 dark:to-emerald-900/20 shadow-lg islamic-pattern">
          <div className="border-b border-emerald-200 dark:border-emerald-700 bg-gradient-to-r from-emerald-50 to-amber-50 dark:from-emerald-900/30 dark:to-amber-900/30 px-4 sm:px-6 py-3 sm:py-4">
            <h2 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100 arabic-text">⚡ إحصائيات سريعة</h2>
            <p className="text-sm text-emerald-600 dark:text-emerald-400 arabic-text">نظرة سريعة على المؤشرات الرئيسية</p>
          </div>
          <div className="p-4 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              <div className="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-slate-50 dark:bg-slate-900/30 px-4 py-3">
                <FiBook className="size-5 text-orange-600 dark:text-orange-400" aria-hidden />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalCourses ?? 0}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('dashboard.totalCourses')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-slate-50 dark:bg-slate-900/30 px-4 py-3">
                <FiCreditCard className="size-5 text-orange-600 dark:text-orange-400" aria-hidden />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalStudentWallets ?? 0}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('dashboard.studentWallets')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-slate-50 dark:bg-slate-900/30 px-4 py-3">
                <FiTrendingUp className="size-5 text-orange-600 dark:text-orange-400" aria-hidden />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {(stats?.activeTeacherSubscriptions || 0) + (stats?.activeStudentSubscriptions || 0)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('dashboard.activeSubscriptions')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-slate-50 dark:bg-slate-900/30 px-4 py-3">
                <FiUserCheck className="size-5 text-orange-600 dark:text-orange-400" aria-hidden />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.pendingTeachers ?? 0}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('dashboard.pendingTeachers')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
