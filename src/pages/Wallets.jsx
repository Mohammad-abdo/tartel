import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { adminAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FiRefreshCw, FiSearch } from 'react-icons/fi';
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
  const [teacherWallets, setTeacherWallets] = useState([]);
  const [studentWallets, setStudentWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [ensuring, setEnsuring] = useState(false);
  const [syncing, setSyncing] = useState(false);

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
    <div className="flex min-h-0 flex-1 flex-col space-y-6 animate-fade-in" style={{ minWidth: 0 }}>
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className={cn('min-w-0', isRTL && 'sm:text-right')}>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">{t('wallets.title')}</h1>
          <p className="mt-2 max-w-2xl text-base text-gray-600 dark:text-gray-400">{t('wallets.subtitle') || 'Manage teacher and student wallets.'}</p>
        </div>
      </section>

      <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <div className="flex flex-row flex-wrap items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 px-4 py-4 sm:px-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('wallets.title')}</h2>
          <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
            <Button
              variant="outline"
              size="sm"
              onClick={handleEnsureAllWallets}
              disabled={ensuring}
              className="rounded-xl border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {ensuring ? '…' : t('wallets.ensureAllWallets')}
            </Button>
            {activeTab === 'teacher' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSyncPayments}
                disabled={syncing}
                className="rounded-xl border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {syncing ? '…' : t('wallets.syncPayments')}
              </Button>
            )}
          </div>
        </div>
        <div className="p-4 sm:p-6">
          <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setPage(1); }} className="w-full">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <TabsList className="w-full sm:w-auto">
                <TabsTrigger value="teacher" className="flex-1 sm:flex-none">{t('wallets.teacherWallets')}</TabsTrigger>
                <TabsTrigger value="student" className="flex-1 sm:flex-none">{t('wallets.studentWallets')}</TabsTrigger>
              </TabsList>
              <div className={cn('relative w-full sm:max-w-xs', isRTL && 'sm:order-first')}>
                <FiSearch
                  className={cn('absolute top-1/2 size-5 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none', isRTL ? 'right-3' : 'left-3')}
                />
                <Input
                  type="text"
                  placeholder={t('wallets.searchPlaceholder', { type: activeTab === 'teacher' ? t('bookings.teacher') : t('bookings.student') })}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={cn('h-10 rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500', isRTL ? 'pr-9 pl-4' : 'pl-9 pr-4')}
                />
              </div>
            </div>

            <TabsContent value="teacher" className="mt-4">
              <WalletsTable
                wallets={teacherWallets}
                loading={loading}
                totalPages={totalPages}
                page={page}
                setPage={setPage}
                t={t}
                activeTab="teacher"
                goToDetail={goToDetail}
                ownerName={ownerName}
                ownerEmail={ownerEmail}
              />
            </TabsContent>
            <TabsContent value="student" className="mt-4">
              <WalletsTable
                wallets={studentWallets}
                loading={loading}
                totalPages={totalPages}
                page={page}
                setPage={setPage}
                t={t}
                activeTab="student"
                goToDetail={goToDetail}
                ownerName={ownerName}
                ownerEmail={ownerEmail}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

function WalletsTable({
  wallets,
  loading,
  totalPages,
  page,
  setPage,
  t,
  activeTab,
  goToDetail,
  ownerName,
  ownerEmail,
}) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="size-12 animate-spin rounded-full border-2 border-orange-600 border-t-transparent" />
        <span className="mt-4 text-sm text-gray-500 dark:text-gray-400">{t('common.loading')}</span>
      </div>
    );
  }
  if (wallets.length === 0) {
    return (
      <div className="py-16 text-center text-sm text-gray-500 dark:text-gray-400">{t('wallets.noWallets')}</div>
    );
  }
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700">
            <TableHead className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {activeTab === 'teacher' ? t('bookings.teacher') : t('bookings.student')}
            </TableHead>
            <TableHead className="px-6 py-3 text-end text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('wallets.balance')}</TableHead>
            {activeTab === 'teacher' && (
              <TableHead className="px-6 py-3 text-end text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('wallets.pendingBalance')}</TableHead>
            )}
            <TableHead className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('common.status')}</TableHead>
            <TableHead className="w-24 px-6 py-3 text-end text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400" />
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
          {wallets.map((wallet) => (
            <TableRow key={wallet.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{ownerName(wallet)}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">{ownerEmail(wallet)}</div>
                </div>
              </TableCell>
              <TableCell className="px-6 py-4 text-end tabular-nums text-sm font-medium text-gray-900 dark:text-white">
                ${(wallet.balance ?? 0).toFixed(2)}
              </TableCell>
              {activeTab === 'teacher' && (
                <TableCell className="px-6 py-4 text-end tabular-nums text-sm text-gray-600 dark:text-gray-300">
                  ${(wallet.pendingBalance ?? 0).toFixed(2)}
                </TableCell>
              )}
              <TableCell className="px-6 py-4 whitespace-nowrap">
                <Badge variant={wallet.isActive ? 'success' : 'destructive'}>
                  {wallet.isActive ? t('wallets.active') : t('wallets.disabled')}
                </Badge>
              </TableCell>
              <TableCell className="px-6 py-4 text-end">
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 font-medium text-orange-600 hover:underline dark:text-orange-400"
                  onClick={() => goToDetail(wallet)}
                >
                  {t('wallets.viewDetails')}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-4 py-3 sm:px-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {t('common.previous')}
          </Button>
          <span className="text-sm text-gray-500 dark:text-gray-400">{t('users.pageOf', { page, totalPages })}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {t('common.next')}
          </Button>
        </div>
      )}
    </>
  );
}

export default Wallets;
