import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { adminAPI } from '../services/api';
import { toast } from 'react-toastify';
import {
  FiRefreshCw,
  FiSearch,
  FiDollarSign,
  FiCreditCard,
  FiUsers,
  FiTrendingUp,
  FiGrid,
  FiList,
  FiEye,
  FiUser,
  FiMail,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiBookOpen,
} from 'react-icons/fi';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { cn } from '../lib/utils';

const Wallets = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('teacher');
  const [viewMode, setViewMode] = useState('cards');
  const [teacherWallets, setTeacherWallets] = useState([]);
  const [studentWallets, setStudentWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [ensuring, setEnsuring] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // إحصائيات المحافظ
  const stats = useMemo(() => {
    const currentWallets = activeTab === 'teacher' ? teacherWallets : studentWallets;
    const totalWallets = currentWallets.length;
    const activeWallets = currentWallets.filter(w => w.isActive).length;
    const totalBalance = currentWallets.reduce((sum, w) => sum + (w.balance || 0), 0);
    const pendingBalance = activeTab === 'teacher' 
      ? currentWallets.reduce((sum, w) => sum + (w.pendingBalance || 0), 0)
      : 0;
    
    return {
      totalWallets,
      activeWallets,
      totalBalance,
      pendingBalance,
    };
  }, [teacherWallets, studentWallets, activeTab]);

  const fetchWallets = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'teacher') {
        const response = await adminAPI.getTeacherWallets({ page, limit: 50, search });
        const body = response.data || {};
        setTeacherWallets(body.wallets || body.data || []);
        setTotalPages(body.pagination?.totalPages ?? body.totalPages ?? 1);
      } else {
        const response = await adminAPI.getStudentWallets({ page, limit: 50, search });
        const body = response.data || {};
        setStudentWallets(body.wallets || body.data || []);
        setTotalPages(body.pagination?.totalPages ?? body.totalPages ?? 1);
      }
    } catch (error) {
      console.error('Failed to fetch wallets:', error);
      toast.error(t('wallets.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, search, t]);

  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);

  const handleEnsureAllWallets = async () => {
    setEnsuring(true);
    try {
      const response = await adminAPI.ensureAllWallets();
      const data = response.data || response;
      const teachers = data.teachersCreated ?? 0;
      const students = data.studentsCreated ?? 0;
      if (teachers > 0 || students > 0) {
        toast.success(t('wallets.ensureAllSuccess', { teachers, students }));
      } else {
        toast.info(t('wallets.ensureAllNone'));
      }
      fetchWallets();
    } catch {
      toast.error(t('wallets.ensureAllFailed'));
    } finally {
      setEnsuring(false);
    }
  };

  const handleSyncPayments = async () => {
    setSyncing(true);
    try {
      await adminAPI.syncPaymentsToWallets();
      toast.success(t('wallets.syncSuccess'));
      fetchWallets();
    } catch {
      toast.error(t('wallets.syncFailed'));
    } finally {
      setSyncing(false);
    }
  };

  const goToDetail = (wallet) => {
    if (activeTab === 'teacher' && wallet.teacherId) {
      navigate(`/wallets/teacher/${wallet.teacherId}`);
    } else if (activeTab === 'student' && wallet.studentId) {
      navigate(`/wallets/student/${wallet.studentId}`);
    }
  };

  const ownerName = (w) =>
    activeTab === 'teacher'
      ? (w.teacher?.user && [w.teacher.user.firstName, w.teacher.user.lastName].filter(Boolean).join(' ')) || '—'
      : (w.student && [w.student.firstName, w.student.lastName].filter(Boolean).join(' ')) || '—';
  const ownerEmail = (w) => w.teacher?.user?.email || w.student?.email || '—';

  return (
    <div className="flex min-h-0 flex-1 flex-col space-y-6 animate-in fade-in duration-300" style={{ minWidth: 0 }} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Page Header */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className={cn('min-w-0', isRTL && 'sm:text-right')}>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            إدارة المحافظ
          </h1>
          <p className="mt-2 max-w-2xl text-base text-gray-600 dark:text-gray-400">
            إدارة محافظ المشايخ والطلاب ومتابعة الأرصدة والمعاملات المالية
          </p>
        </div>
        <div className={cn('flex shrink-0 flex-wrap items-center gap-2', isRTL && 'sm:flex-row-reverse')}>
          <Button
            variant="outline"
            size="default"
            onClick={() => fetchWallets()}
            disabled={loading}
            className="rounded-xl border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 shadow-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <FiRefreshCw className={cn('size-4', loading && 'animate-spin', isRTL ? 'ml-2' : 'mr-2')} />
            تحديث البيانات
          </Button>
          <Button
            variant="outline"
            size="default"
            onClick={handleEnsureAllWallets}
            disabled={ensuring}
            className="rounded-xl border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <FiCreditCard className={cn('size-4', isRTL ? 'ml-2' : 'mr-2')} />
            {ensuring ? 'جاري التأكد...' : 'التأكد من المحافظ'}
          </Button>
          {activeTab === 'teacher' && (
            <Button
              variant="outline"
              size="default"
              onClick={handleSyncPayments}
              disabled={syncing}
              className="rounded-xl border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <FiTrendingUp className={cn('size-4', isRTL ? 'ml-2' : 'mr-2')} />
              {syncing ? 'جاري المزامنة...' : 'مزامنة المدفوعات'}
            </Button>
          )}
        </div>
      </section>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-800 shadow-sm">
          <div className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              إجمالي المحافظ
            </p>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats.totalWallets}</p>
            <div className="mt-3 flex size-11 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
              <FiCreditCard className="size-5" />
            </div>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-emerald-200 dark:border-emerald-800/50 bg-white dark:bg-gray-800 shadow-sm">
          <div className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              المحافظ النشطة
            </p>
            <p className="mt-2 text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {stats.activeWallets}
            </p>
            <div className="mt-3 flex size-11 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
              <FiCheckCircle className="size-5" />
            </div>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-blue-200 dark:border-blue-800/50 bg-white dark:bg-gray-800 shadow-sm">
          <div className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              إجمالي الأرصدة
            </p>
            <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
              ${stats.totalBalance.toFixed(2)}
            </p>
            <div className="mt-3 flex size-11 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
              <FiDollarSign className="size-5" />
            </div>
          </div>
        </div>
        {activeTab === 'teacher' && (
          <div className="overflow-hidden rounded-2xl border border-orange-200 dark:border-orange-800/50 bg-white dark:bg-gray-800 shadow-sm">
            <div className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                الأرصدة المعلقة
              </p>
              <p className="mt-2 text-3xl font-bold text-orange-600 dark:text-orange-400">
                ${stats.pendingBalance.toFixed(2)}
              </p>
              <div className="mt-3 flex size-11 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400">
                <FiClock className="size-5" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search, Filter & View Toggle */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center">
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setPage(1); }} className="w-full sm:w-auto">
              <TabsList className="w-full sm:w-auto">
                <TabsTrigger value="teacher" className="flex-1 sm:flex-none">محافظ المشايخ</TabsTrigger>
                <TabsTrigger value="student" className="flex-1 sm:flex-none">محافظ الطلاب</TabsTrigger>
              </TabsList>
            </Tabs>
            
            {/* Search */}
            <div className={cn('relative flex-1', isRTL && 'sm:order-2')}>
              <FiSearch
                className={cn(
                  'absolute top-1/2 size-5 -translate-y-1/2 text-gray-400 dark:text-gray-500',
                  isRTL ? 'right-3' : 'left-3'
                )}
              />
              <Input
                type="text"
                placeholder={`البحث في محافظ ${activeTab === 'teacher' ? 'المشايخ' : 'الطلاب'}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={cn(
                  'h-10 rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500',
                  isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'
                )}
              />
            </div>
          </div>
          
          {/* View Toggle */}
          <div className="flex items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 p-1">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all',
                viewMode === 'cards'
                  ? 'bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-600/50'
              )}
            >
              <FiGrid className="size-4" />
              كروت
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all',
                viewMode === 'table'
                  ? 'bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-600/50'
              )}
            >
              <FiList className="size-4" />
              قائمة
            </button>
          </div>
        </div>
      </div>

      {/* Content: Cards or Table */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg overflow-hidden">
        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setPage(1); }} className="w-full">
          <TabsContent value="teacher" className="m-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="size-12 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" />
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">جاري تحميل محافظ المشايخ...</p>
              </div>
              ) : teacherWallets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                  <FiCreditCard className="size-12 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
                  لا توجد محافظ للمشايخ
                </h2>
                <p className="mt-2 max-w-md text-center text-gray-500 dark:text-gray-400">
                  لم يتم العثور على أي محافظ للمشايخ في النظام حالياً
                </p>
              </div>
            ) : viewMode === 'table' ? (
              <WalletsTable
                wallets={teacherWallets}
                loading={loading}
                totalPages={totalPages}
                page={page}
                setPage={setPage}
                isRTL={isRTL}
                activeTab="teacher"
                goToDetail={goToDetail}
                ownerName={ownerName}
                ownerEmail={ownerEmail}
              />
            ) : (
              <div className="p-6">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {teacherWallets.map((wallet) => (
                    <WalletCard
                      key={wallet.id}
                      wallet={wallet}
                      activeTab="teacher"
                      isRTL={isRTL}
                      ownerName={ownerName}
                      ownerEmail={ownerEmail}
                      onClick={() => goToDetail(wallet)}
                    />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="student" className="m-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="size-12 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" />
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">جاري تحميل محافظ الطلاب...</p>
              </div>
            ) : studentWallets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                  <FiCreditCard className="size-12 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
                  لا توجد محافظ للطلاب
                </h2>
                <p className="mt-2 max-w-md text-center text-gray-500 dark:text-gray-400">
                  لم يتم العثور على أي محافظ للطلاب في النظام حالياً
                </p>
              </div>
            ) : viewMode === 'table' ? (
              <WalletsTable
                wallets={studentWallets}
                loading={loading}
                totalPages={totalPages}
                page={page}
                setPage={setPage}
                isRTL={isRTL}
                activeTab="student"
                goToDetail={goToDetail}
                ownerName={ownerName}
                ownerEmail={ownerEmail}
              />
            ) : (
              <div className="p-6">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {studentWallets.map((wallet) => (
                    <WalletCard
                      key={wallet.id}
                      wallet={wallet}
                      activeTab="student"
                      isRTL={isRTL}
                      ownerName={ownerName}
                      ownerEmail={ownerEmail}
                      onClick={() => goToDetail(wallet)}
                    />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {!loading && ((activeTab === 'teacher' ? teacherWallets : studentWallets).length > 0) && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-4 py-3 sm:px-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50"
            >
              السابق
            </Button>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              صفحة {page} من {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50"
            >
              التالي
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

// مكون كارت المحفظة
function WalletCard({ wallet, activeTab, isRTL, ownerName, ownerEmail, onClick }) {
  return (
    <div
      className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden shadow-sm transition-all duration-200 hover:border-purple-200 dark:hover:border-purple-800 hover:shadow-md cursor-pointer"
      onClick={onClick}
    >
      {/* Header with status and user info */}
      <div className="relative p-5 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Avatar */}
            <div className="flex size-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-bold text-lg shrink-0">
              <FiUser className="size-6" />
            </div>
            
            {/* User info */}
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {ownerName(wallet)}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate flex items-center gap-1">
                <FiMail className="size-3" />
                {ownerEmail(wallet)}
              </p>
            </div>
          </div>
          
          {/* Status badge */}
          <span
            className={cn(
              'shrink-0 px-2.5 py-1 text-xs font-medium rounded-full',
              wallet.isActive
                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
            )}
          >
            {wallet.isActive ? (
              <div className="flex items-center gap-1">
                <FiCheckCircle className="size-3" />
                نشط
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <FiXCircle className="size-3" />
                معطل
              </div>
            )}
          </span>
        </div>
      </div>
      
      {/* Balance info */}
      <div className="p-5">
        <div className="grid grid-cols-1 gap-4">
          {/* Main balance */}
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">الرصيد المتاح</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              ${(wallet.balance ?? 0).toFixed(2)}
            </p>
          </div>

          {/* Teacher: totalHours + totalEarned */}
          {activeTab === 'teacher' && (
            <div className="border-t border-gray-100 dark:border-gray-700 pt-4 grid grid-cols-2 gap-3">
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center justify-center gap-1">
                  <FiBookOpen className="size-3" />
                  ساعات التدريس
                </p>
                <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                  {Number(wallet.totalHours ?? 0).toFixed(2)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center justify-center gap-1">
                  <FiTrendingUp className="size-3" />
                  إجمالي الأرباح
                </p>
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  ${(wallet.totalEarned ?? 0).toFixed(2)}
                </p>
              </div>
            </div>
          )}

          {/* Pending balance (for teachers only) */}
          {activeTab === 'teacher' && (
            <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">الرصيد المعلق:</span>
                <span className="font-semibold text-orange-600 dark:text-orange-400">
                  ${(wallet.pendingBalance ?? 0).toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
        
        {/* Action buttons */}
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
          >
            <FiEye className="size-4" />
            عرض التفاصيل
          </button>
        </div>
      </div>
    </div>
  );
}

// مكون جدول المحافظ المحسن
function WalletsTable({
  wallets,
  loading,
  totalPages,
  page,
  setPage,
  isRTL,
  activeTab,
  goToDetail,
  ownerName,
  ownerEmail,
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
            {activeTab === 'teacher' ? 'الشيخ' : 'الطالب'}
          </TableHead>
          <TableHead
            className={cn(
              'px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-start'
            )}
          >
            الرصيد الحالي
          </TableHead>
          {activeTab === 'teacher' && (
            <>
              <TableHead className={cn('px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-start')}>
                ساعات التدريس
              </TableHead>
              <TableHead className={cn('px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-start')}>
                إجمالي الأرباح
              </TableHead>
              <TableHead className={cn('px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-start')}>
                الرصيد المعلق
              </TableHead>
            </>
          )}
          <TableHead
            className={cn(
              'px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-start'
            )}
          >
            الحالة
          </TableHead>
          <TableHead className="w-32 px-6 py-3 text-end" />
        </TableRow>
      </TableHeader>
      <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
        {wallets.map((wallet) => (
          <TableRow
            key={wallet.id}
            className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 border-gray-200 dark:border-gray-700 cursor-pointer"
            onClick={() => goToDetail(wallet)}
          >
            <TableCell className="px-6 py-4 text-sm whitespace-nowrap">
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-semibold text-sm shrink-0">
                  <FiUser className="size-4" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{ownerName(wallet)}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{ownerEmail(wallet)}</p>
                </div>
              </div>
            </TableCell>
            <TableCell className="px-6 py-4 text-sm font-semibold text-purple-600 dark:text-purple-400 whitespace-nowrap">
              ${(wallet.balance ?? 0).toFixed(2)}
            </TableCell>
            {activeTab === 'teacher' && (
              <>
                <TableCell className="px-6 py-4 text-sm font-semibold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                  <span className="flex items-center gap-1">
                    <FiBookOpen className="size-3" />
                    {Number(wallet.totalHours ?? 0).toFixed(2)}h
                  </span>
                </TableCell>
                <TableCell className="px-6 py-4 text-sm font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                  ${(wallet.totalEarned ?? 0).toFixed(2)}
                </TableCell>
                <TableCell className="px-6 py-4 text-sm font-medium text-orange-600 dark:text-orange-400 whitespace-nowrap">
                  ${(wallet.pendingBalance ?? 0).toFixed(2)}
                </TableCell>
              </>
            )}
            <TableCell className="px-6 py-4 whitespace-nowrap">
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full',
                  wallet.isActive
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                )}
              >
                {wallet.isActive ? (
                  <>
                    <FiCheckCircle className="size-3" />
                    نشط
                  </>
                ) : (
                  <>
                    <FiXCircle className="size-3" />
                    معطل
                  </>
                )}
              </span>
            </TableCell>
            <TableCell className="px-6 py-4 text-end">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                onClick={(e) => {
                  e.stopPropagation();
                  goToDetail(wallet);
                }}
              >
                <FiEye className="size-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default Wallets;
