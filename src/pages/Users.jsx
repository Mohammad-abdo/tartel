import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { adminAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FiSearch, FiEdit, FiTrash2, FiUserX, FiUserCheck, FiEye, FiPlus, FiUsers, FiRefreshCw, FiCheckCircle, FiClock } from 'react-icons/fi';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Input } from '../components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { Badge } from '../components/ui/badge';
import { cn } from '../lib/utils';

const Users = () => {
  // Users management page
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteId, setDeleteId] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
  });

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status === 'ACTIVE').length;
    const banned = users.filter((u) => u.status === 'BANNED').length;
    const inactive = users.filter((u) => u.status === 'INACTIVE').length;
    return { total, active, banned, inactive };
  }, [users]);

  useEffect(() => {
    fetchUsers();
  }, [page, filters]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 20,
        role: 'STUDENT', // هذه الصفحة تعرض الطلاب فقط
        ...filters,
      };
      const response = await adminAPI.getUsers(params);
      // Backend returns: { users: [...], pagination: { page, limit, total, totalPages } }
      const usersData = response.data.users || response.data.data || [];
      const totalPagesData = response.data.pagination?.totalPages || response.data.totalPages || 1;
      setUsers(Array.isArray(usersData) ? usersData : []);
      setTotalPages(totalPagesData);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      console.error('Error details:', error.response?.data); // Debug log
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, action) => {
    try {
      if (action === 'ban') {
        await adminAPI.banUser(id);
        toast.success(t('users.userBannedSuccess'));
      } else if (action === 'activate') {
        await adminAPI.activateUser(id);
        toast.success(t('users.userActivatedSuccess'));
      }
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || t('users.updateStatusFailed'));
      console.error('Failed to update user status:', error);
    }
  };

  const handleDeleteClick = (id) => setDeleteId(id);
  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await adminAPI.deleteUser(deleteId);
      toast.success(t('users.userDeletedSuccess'));
      setDeleteId(null);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || t('users.deleteFailed'));
      console.error('Failed to delete user:', error);
    }
  };

  const getStatusBadgeVariant = (status) => {
    const map = { ACTIVE: 'success', BANNED: 'destructive', INACTIVE: 'secondary' };
    return map[status] || 'outline';
  };

  const getRoleBadgeVariant = (role) => {
    const map = { ADMIN: 'default', TEACHER: 'secondary', STUDENT: 'outline' };
    return map[role] || 'outline';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="rounded-lg border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-xl">
          <AlertDialogHeader className="border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 sm:px-6 py-3 sm:py-4">
            <AlertDialogTitle className="text-gray-900 dark:text-white">{t('users.deleteConfirmTitle') || 'Delete user?'}</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">{t('users.deleteConfirm')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 border-t border-gray-200 dark:border-gray-600 px-4 sm:px-6 py-4">
            <AlertDialogCancel className="rounded-xl border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">{t('common.cancel') || 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="rounded-xl bg-red-600 text-white hover:bg-red-700">{t('common.delete') || 'Delete'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Page header */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className={isRTL ? 'sm:text-right' : ''}>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">{t('users.studentsTitle')}</h1>
          <p className="mt-2 max-w-2xl text-base text-gray-600 dark:text-gray-400">{t('users.studentsSubtitle')}</p>
        </div>
        <div className={cn('flex shrink-0 flex-wrap items-center gap-2', isRTL && 'sm:flex-row-reverse')}>
          <Button variant="outline" size="default" onClick={() => fetchUsers()} disabled={loading} className="rounded-xl border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700">
            <FiRefreshCw className={cn('size-4', loading && 'animate-spin', isRTL ? 'ml-2' : 'mr-2')} />
            {t('common.refresh')}
          </Button>
          <Button onClick={() => navigate('/users/add')} className="rounded-xl bg-gradient-to-r from-orange-600 to-orange-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:from-orange-700 hover:to-orange-800">
            <FiPlus className={cn('size-4', isRTL ? 'ml-2' : 'mr-2')} />
            {t('users.addStudent')}
          </Button>
        </div>
      </section>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
          <div className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('users.totalStudents')}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            <div className="mt-3 flex size-11 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
              <FiUsers className="size-5" />
            </div>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-emerald-200 dark:border-emerald-800/50 bg-white dark:bg-gray-800 shadow-sm">
          <div className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('users.activeUsers')}</p>
            <p className="mt-2 text-3xl font-bold text-emerald-600 dark:text-emerald-400">{stats.active}</p>
            <div className="mt-3 flex size-11 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
              <FiCheckCircle className="size-5" />
            </div>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-red-200 dark:border-red-800/50 bg-white dark:bg-gray-800 shadow-sm">
          <div className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('users.bannedUsers')}</p>
            <p className="mt-2 text-3xl font-bold text-red-600 dark:text-red-400">{stats.banned}</p>
            <div className="mt-3 flex size-11 items-center justify-center rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
              <FiUserX className="size-5" />
            </div>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-800 shadow-sm">
          <div className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('users.inactiveUsers')}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats.inactive}</p>
            <div className="mt-3 flex size-11 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400">
              <FiClock className="size-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Search & filters */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className={cn('relative flex-1', isRTL && 'md:order-2')}>
            <FiSearch className={cn('absolute top-1/2 size-5 -translate-y-1/2 text-gray-400 dark:text-gray-500', isRTL ? 'right-3' : 'left-3')} />
            <Input
              type="text"
              placeholder={t('users.studentsSearchPlaceholder')}
              value={filters.search}
              onChange={(e) => { setPage(1); setFilters({ ...filters, search: e.target.value }); }}
              className={cn('h-10 rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500', isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4')}
            />
          </div>
          <div className={cn('flex flex-wrap gap-3', isRTL && 'md:order-1')}>
            <select
              value={filters.status}
              onChange={(e) => { setPage(1); setFilters({ ...filters, status: e.target.value }); }}
              className="h-10 min-w-[170px] rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
            >
              <option value="">{t('users.allStatus')}</option>
              <option value="ACTIVE">{t('users.active')}</option>
              <option value="INACTIVE">{t('users.inactive')}</option>
              <option value="BANNED">{t('users.banned')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users list */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="size-12 animate-spin rounded-full border-2 border-orange-600 border-t-transparent" />
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{t('users.studentsLoading')}</p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
              <FiUsers className="size-12 text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">{t('users.studentsEmptyTitle')}</h2>
            <p className="mt-2 max-w-md text-center text-gray-500 dark:text-gray-400">{t('users.studentsEmptySubtitle')}</p>
            <Button onClick={() => navigate('/users/add')} className="mt-6 rounded-xl bg-gradient-to-r from-orange-600 to-orange-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:from-orange-700 hover:to-orange-800">
              <FiPlus className={cn('size-4', isRTL ? 'ml-2' : 'mr-2')} />
              {t('users.addStudent')}
            </Button>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm transition-all duration-200 hover:border-orange-200 dark:hover:border-orange-800 hover:shadow-md cursor-pointer"
                  onClick={() => navigate(`/users/${user.id}`)}
                >
                  {/* Card Header */}
                  <div className="relative h-28 bg-gradient-to-br from-orange-500 to-orange-600">
                      <div className="flex h-full w-full items-center justify-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg dark:bg-gray-800">
                          <span className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                            {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                          </span>
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/5 to-transparent" />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <Badge variant={getStatusBadgeVariant(user.status)} className="backdrop-blur-sm">
                          {user.status === 'ACTIVE'
                            ? t('users.active')
                            : user.status === 'BANNED'
                            ? t('users.banned')
                            : t('users.inactive')}
                        </Badge>
                      </div>
                      <div className="absolute top-3 right-3 flex gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/users/${user.id}`);
                          }}
                          className="p-1.5 rounded-full bg-white/90 text-gray-900 hover:bg-white hover:text-orange-600 transition-colors shadow-sm"
                          title={t('users.viewDetails')}
                        >
                          <FiEye className="text-sm" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/users/${user.id}/edit`);
                          }}
                          className="p-1.5 rounded-full bg-white/90 text-gray-900 hover:bg-white hover:text-orange-600 transition-colors shadow-sm"
                          title={t('users.editUser')}
                        >
                          <FiEdit className="text-sm" />
                        </button>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="flex flex-1 flex-col space-y-3 p-5">
                      <div>
                        <h2 className="mb-1 line-clamp-1 text-base font-semibold text-gray-900 dark:text-white">
                          {user.name || t('users.notAvailable')}
                        </h2>
                        <p className="mb-2 line-clamp-1 text-xs text-gray-600 dark:text-gray-400">
                          {user.email}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {user.role}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                          {user.status === 'ACTIVE' ? (
                            <Button variant="ghost" size="sm" type="button" onClick={(e) => { e.stopPropagation(); handleStatusChange(user.id, 'ban'); }} className="text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                              <FiUserX className="text-sm" />
                              {t('users.ban') || 'Ban'}
                            </Button>
                          ) : (
                            <Button variant="ghost" size="sm" type="button" onClick={(e) => { e.stopPropagation(); handleStatusChange(user.id, 'activate'); }} className="text-xs text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20">
                              <FiUserCheck className="text-sm" />
                              {t('users.activate') || 'Activate'}
                            </Button>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/users/${user.id}`); }} className="text-xs text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20">
                            <FiEye className="text-sm" />
                            {t('common.view')}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/users/${user.id}/edit`); }} className="text-xs text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20">
                            <FiEdit className="text-sm" />
                            {t('common.edit')}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDeleteClick(user.id); }} className="text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                            <FiTrash2 className="text-sm" />
                            {t('common.delete')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-gray-700 sm:px-6">
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-xl border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                  {t('common.previous')}
                </Button>
                <span className="text-sm text-gray-500 dark:text-gray-400">{t('users.pageOf', { page, totalPages })}</span>
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-xl border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                  {t('common.next')}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;

