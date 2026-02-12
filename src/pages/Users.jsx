import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { adminAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FiSearch, FiEdit, FiTrash2, FiUserX, FiUserCheck, FiEye, FiPlus, FiUsers, FiRefreshCw, FiCheckCircle, FiClock, FiGrid, FiList, FiMail, FiPhone, FiStar, FiUser, FiBook } from 'react-icons/fi';
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
import QuranProgressBar from '../components/QuranProgressBar';

const Users = () => {
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
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status === 'ACTIVE').length;
    const banned = users.filter((u) => u.status === 'BANNED').length;
    const inactive = users.filter((u) => u.status === 'INACTIVE').length;
    const totalMemorized = users.reduce((sum, u) => sum + (u.memorizedParts || 0), 0);
    return { total, active, banned, inactive, totalMemorized };
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
        role: 'STUDENT', // جلب الطلاب فقط
        ...(filters.status && { status: filters.status }),
      };
      const response = await adminAPI.getUsers(params);
      const usersData = response.data.users || response.data.data || [];
      const totalPagesData = response.data.pagination?.totalPages || response.data.totalPages || 1;
      setUsers(Array.isArray(usersData) ? usersData : []);
      setTotalPages(totalPagesData);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (userId) => {
    setDeleteId(userId);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await adminAPI.deleteUser(deleteId);
      toast.success(t('users.deleteSuccess'));
      setDeleteId(null);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || t('users.deleteError'));
    }
  };

  const handleStatusChange = async (userId, action) => {
    try {
      if (action === 'ban') {
        await adminAPI.banUser(userId);
        toast.success(t('users.banSuccess'));
      } else if (action === 'activate') {
        await adminAPI.activateUser(userId);
        toast.success(t('users.activateSuccess'));
      }
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'BANNED':
        return 'destructive';
      case 'INACTIVE':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'default';
      case 'TEACHER':
        return 'outline';
      case 'STUDENT':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in islamic-container" style={{ fontFamily: 'Alexandria, sans-serif' }}>
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="islamic-card">
          <AlertDialogHeader className="islamic-border-bottom bg-gradient-to-r from-emerald-50 to-amber-50 dark:from-emerald-900/20 dark:to-amber-900/20 px-4 sm:px-6 py-3 sm:py-4">
            <AlertDialogTitle className="text-emerald-800 dark:text-emerald-200 font-alexandria">{t('users.deleteConfirmTitle') || 'Delete user?'}</AlertDialogTitle>
            <AlertDialogDescription className="text-amber-700 dark:text-amber-300 font-alexandria">{t('users.deleteConfirm')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 islamic-border-top px-4 sm:px-6 py-4">
            <AlertDialogCancel className="islamic-button-secondary">{t('common.cancel') || 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="islamic-button-danger">{t('common.delete') || 'Delete'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Islamic Header */}
      <div className="text-center mb-6">
        <div className="islamic-border inline-block px-8 py-4 bg-gradient-to-r from-emerald-50 to-amber-50 dark:from-emerald-900/20 dark:to-amber-900/20 rounded-xl">
          <p className="text-emerald-700 dark:text-emerald-300 text-sm font-semibold mb-1 font-alexandria">
            {isRTL ? 'بسم الله الرحمن الرحيم' : 'In the name of Allah, the Most Gracious, the Most Merciful'}
          </p>
          <p className="text-amber-600 dark:text-amber-400 text-xs font-alexandria">
            {isRTL ? 'إدارة المتعلمين - رعاية طلاب القرآن الكريم' : 'Managing Learners - Caring for Quran Students'}
          </p>
        </div>
      </div>

      {/* Page header */}
      <section className="islamic-border p-6 bg-gradient-to-r from-emerald-50 via-white to-amber-50 dark:from-emerald-900/20 dark:via-gray-800 dark:to-amber-900/20 rounded-xl shadow-lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
                <FiUsers className="size-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-emerald-800 dark:text-emerald-200 sm:text-4xl font-alexandria">{t('users.studentsTitle') || 'الطلاب والمتعلمون'}</h1>
                <p className="text-amber-700 dark:text-amber-300 text-sm font-alexandria">{isRTL ? 'طلاب تعلم القرآن الكريم' : 'Quran Learning Students'}</p>
              </div>
            </div>
            <p className="max-w-2xl text-base text-emerald-700 dark:text-emerald-300 font-alexandria">{t('users.manageSubtitle') || 'إدارة ومتابعة رحلة تعلم طلاب القرآن الكريم'}</p>
            <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
              <span className="font-alexandria">{isRTL ? 'وقل رب زدني علماً' : 'And say: My Lord, increase me in knowledge'}</span>
            </div>
          </div>
          <div className={cn('flex shrink-0 flex-wrap items-center gap-3', isRTL && 'sm:flex-row-reverse')}>
            {/* View Mode Toggle */}
            <div className="flex gap-1 islamic-border bg-gradient-to-r from-emerald-50 to-amber-50 dark:from-emerald-900/20 dark:to-amber-900/20 p-1 rounded-lg">
              <button 
                type="button" 
                onClick={() => setViewMode('cards')} 
                className={cn('islamic-button-secondary p-2', viewMode === 'cards' && 'islamic-button-primary')}
                title={isRTL ? 'عرض الكروت' : 'Cards View'}
              >
                <FiGrid className="size-4" />
              </button>
              <button 
                type="button" 
                onClick={() => setViewMode('table')} 
                className={cn('islamic-button-secondary p-2', viewMode === 'table' && 'islamic-button-primary')}
                title={isRTL ? 'عرض الجدول' : 'Table View'}
              >
                <FiList className="size-4" />
              </button>
            </div>
            
            <Button variant="outline" size="default" onClick={() => fetchUsers()} disabled={loading} className="islamic-button-secondary">
              <FiRefreshCw className={cn('size-4', loading && 'animate-spin', isRTL ? 'ml-2' : 'mr-2')} />
              {t('common.refresh')}
            </Button>
            <Button onClick={() => navigate('/users/add')} className="islamic-button-primary">
              <FiPlus className={cn('size-4', isRTL ? 'ml-2' : 'mr-2')} />
              {t('users.addStudent')}
            </Button>
          </div>
        </div>
      </section>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="islamic-card group hover:shadow-xl transition-all duration-300">
          <div className="islamic-border-gradient p-5 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 font-alexandria">{t('users.totalStudents') || 'إجمالي الطلاب'}</p>
                <p className="mt-2 text-3xl font-bold text-emerald-800 dark:text-emerald-200">{stats.total}</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-alexandria">{t('users.allStudents') || (isRTL ? 'جميع الطلاب' : 'All Students')}</p>
              </div>
              <div className="flex size-14 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FiUsers className="size-6 text-white" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="islamic-card group hover:shadow-xl transition-all duration-300">
          <div className="islamic-border-gradient p-5 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-green-700 dark:text-green-300 font-alexandria">{t('users.active') || 'نشطون'}</p>
                <p className="mt-2 text-3xl font-bold text-green-800 dark:text-green-200">{stats.active}</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-alexandria">{t('users.activeStudents') || (isRTL ? 'طلاب نشطون' : 'Active Students')}</p>
              </div>
              <div className="flex size-14 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FiCheckCircle className="size-6 text-white" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="islamic-card group hover:shadow-xl transition-all duration-300">
          <div className="islamic-border-gradient p-5 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-red-700 dark:text-red-300 font-alexandria">{t('users.banned') || 'محظورون'}</p>
                <p className="mt-2 text-3xl font-bold text-red-800 dark:text-red-200">{stats.banned}</p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-alexandria">{t('users.bannedStudents') || (isRTL ? 'طلاب محظورون' : 'Banned Students')}</p>
              </div>
              <div className="flex size-14 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FiUserX className="size-6 text-white" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="islamic-card group hover:shadow-xl transition-all duration-300">
          <div className="islamic-border-gradient p-5 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300 font-alexandria">{isRTL ? 'أجزاء محفوظة' : 'Total Memorized'}</p>
                <p className="mt-2 text-3xl font-bold text-amber-800 dark:text-amber-200">{stats.totalMemorized}</p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-alexandria">{isRTL ? 'جزء من القرآن' : 'Quran Parts'}</p>
              </div>
              <div className="flex size-14 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FiBook className="size-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="islamic-card p-5 bg-gradient-to-r from-emerald-50/50 via-white to-amber-50/50 dark:from-emerald-900/10 dark:via-gray-800 dark:to-amber-900/10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <FiSearch className={cn('absolute top-1/2 size-5 -translate-y-1/2 text-emerald-500 dark:text-emerald-400', isRTL ? 'right-3' : 'left-3')} />
            <input 
              type="text" 
              placeholder={t('users.studentsSearchPlaceholder') || 'البحث في الطلاب...'}
              value={filters.search} 
              onChange={(e) => { setPage(1); setFilters({ ...filters, search: e.target.value }); }} 
              className={cn('h-10 islamic-input font-alexandria', isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4')} 
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <select 
              value={filters.status} 
              onChange={(e) => { setPage(1); setFilters({ ...filters, status: e.target.value }); }} 
              className="h-10 min-w-[150px] islamic-select font-alexandria"
            >
              <option value="">{t('users.allStatuses') || 'جميع الحالات'}</option>
              <option value="ACTIVE">{t('users.active') || 'نشط'}</option>
              <option value="BANNED">{t('users.banned') || 'محظور'}</option>
              <option value="INACTIVE">{t('users.inactive') || 'غير نشط'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users list */}
      <div className="islamic-card bg-gradient-to-br from-emerald-50/30 via-white to-amber-50/30 dark:from-emerald-900/10 dark:via-gray-800 dark:to-amber-900/10 shadow-xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="islamic-spinner islamic-spinner-dual size-12" />
            <p className="mt-4 text-sm text-emerald-600 dark:text-emerald-400 font-alexandria">{t('users.studentsLoading') || 'جاري تحميل الطلاب...'}</p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-amber-100 dark:from-emerald-900/30 dark:to-amber-900/30 shadow-lg">
              <FiUsers className="size-12 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-emerald-800 dark:text-emerald-200 font-alexandria">{t('users.studentsEmptyTitle') || 'لا يوجد طلاب'}</h2>
            <p className="mt-2 max-w-md text-center text-emerald-600 dark:text-emerald-400 font-alexandria">{t('users.studentsEmptySubtitle') || 'لم يتم العثور على أي طلاب في النظام'}</p>
            <div className="mt-4 text-center text-xs text-amber-600 dark:text-amber-400 font-alexandria">
              {isRTL ? '"ومن أحيا نفساً فكأنما أحيا الناس جميعاً"' : '"And whoever saves a life, it is as if he has saved all of mankind"'}
            </div>
            <Button onClick={() => navigate('/users/add')} className="mt-6 islamic-button-primary">
              <FiPlus className={cn('size-4', isRTL ? 'ml-2' : 'mr-2')} />
              {t('users.addStudent') || 'إضافة طالب جديد'}
            </Button>
          </div>
        ) : (
          <div className="p-6">
            {viewMode === 'cards' ? (
              // Cards View
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {users.map((user) => {
                  const fullName = user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user.name || t('users.notAvailable');
                  const fullNameAr = user.firstNameAr && user.lastNameAr
                    ? `${user.firstNameAr} ${user.lastNameAr}`
                    : null;
                    
                  return (
                    <div
                      key={user.id}
                      className="islamic-card group cursor-pointer overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105 islamic-pattern bg-gradient-to-br from-white via-emerald-50/30 to-amber-50/30 dark:from-gray-800 dark:via-emerald-900/10 dark:to-amber-900/10"
                      onClick={() => navigate(`/users/${user.id}`)}
                    >
                      {/* Card Header with Image */}
                      <div className="relative h-32 bg-gradient-to-br from-emerald-500 via-emerald-600 to-amber-500 islamic-pattern">
                        {/* Avatar */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="relative">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={fullName}
                                className="w-20 h-20 rounded-full object-cover shadow-xl ring-4 ring-white/50 backdrop-blur-sm"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div 
                              className={`w-20 h-20 rounded-full bg-white dark:bg-gray-800 shadow-xl ring-4 ring-white/50 flex items-center justify-center ${user.avatar ? 'hidden' : 'flex'}`}
                            >
                              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-alexandria">
                                {user.firstName?.charAt(0) || user.name?.charAt(0) || user.email?.charAt(0) || 'ط'}
                              </span>
                            </div>
                            {/* Status Indicator */}
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg">
                              <div className={`w-4 h-4 rounded-full ${
                                user.status === 'ACTIVE' ? 'bg-green-500 animate-pulse' : 
                                user.status === 'BANNED' ? 'bg-red-500' : 'bg-gray-400'
                              }`}></div>
                            </div>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="absolute top-3 left-3">
                          <span
                            className={cn(
                              'px-3 py-1.5 rounded-full text-xs font-bold font-alexandria shadow-lg backdrop-blur-sm',
                              user.status === 'ACTIVE' ? 'bg-green-500/90 text-white ring-2 ring-green-400/50' :
                              user.status === 'BANNED' ? 'bg-red-500/90 text-white ring-2 ring-red-400/50' :
                              'bg-gray-500/90 text-white ring-2 ring-gray-400/50'
                            )}
                          >
                            <div className="flex items-center gap-1">
                              {user.status === 'ACTIVE' ? (
                                <>
                                  <FiCheckCircle className="size-3" />
                                  {isRTL ? 'نشط' : 'Active'}
                                </>
                              ) : user.status === 'BANNED' ? (
                                <>
                                  <FiUserX className="size-3" />
                                  {isRTL ? 'محظور' : 'Banned'}
                                </>
                              ) : (
                                <>
                                  <FiClock className="size-3" />
                                  {isRTL ? 'غير نشط' : 'Inactive'}
                                </>
                              )}
                            </div>
                          </span>
                        </div>

                        {/* Student Type Badge */}
                        <div className="absolute top-3 right-3">
                          <span className="px-2 py-1 rounded-full text-xs font-bold bg-white/90 text-emerald-700 shadow-lg font-alexandria">
                            <div className="flex items-center gap-1">
                              <FiUser className="size-3" />
                              {isRTL ? 'طالب' : 'Student'}
                            </div>
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="absolute bottom-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/users/${user.id}`);
                            }}
                            className="p-2 rounded-lg bg-white/90 dark:bg-gray-800/90 text-emerald-600 dark:text-emerald-400 hover:bg-white dark:hover:bg-gray-800 shadow-lg hover:scale-110 transition-all duration-200"
                            title={isRTL ? 'عرض التفاصيل' : 'View Details'}
                          >
                            <FiEye className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/users/${user.id}/edit`);
                            }}
                            className="p-2 rounded-lg bg-white/90 dark:bg-gray-800/90 text-amber-600 dark:text-amber-400 hover:bg-white dark:hover:bg-gray-800 shadow-lg hover:scale-110 transition-all duration-200"
                            title={isRTL ? 'تعديل البيانات' : 'Edit Student'}
                          >
                            <FiEdit className="size-4" />
                          </button>
                        </div>
                      </div>

                      {/* Body */}
                      <div className="p-5 space-y-4">
                        {/* Name and Basic Info */}
                        <div className="text-center space-y-2">
                          <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-200 font-alexandria line-clamp-1">
                            {fullNameAr || fullName}
                          </h3>
                          {fullNameAr && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-sans line-clamp-1">
                              {fullName}
                            </p>
                          )}
                          <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <FiMail className="size-3 text-emerald-500" />
                            <span className="line-clamp-1">{user.email}</span>
                          </div>
                        </div>

                        {/* Student Info */}
                        <div className="space-y-3">
                          {/* Gender */}
                          {user.gender && (
                            <div className="text-center">
                              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-emerald-100 to-amber-100 dark:from-emerald-900/30 dark:to-amber-900/30 rounded-lg text-xs font-semibold text-emerald-700 dark:text-emerald-300 font-alexandria">
                                {user.gender === 'MALE' ? (
                                  <>
                                    <span>👨</span>
                                    <span>{isRTL ? 'ذكر' : 'Male'}</span>
                                  </>
                                ) : (
                                  <>
                                    <span>👩</span>
                                    <span>{isRTL ? 'أنثى' : 'Female'}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Quran Progress */}
                          {(user.memorizedParts || user.memorizedParts === 0) && (
                            <div>
                              <QuranProgressBar 
                                memorizedParts={user.memorizedParts}
                                size="small"
                                showNumbers={false}
                                isRTL={isRTL}
                              />
                            </div>
                          )}
                        </div>

                        {/* Phone */}
                        {user.phone && (
                          <div className="text-center">
                            <div className="inline-flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                              <FiPhone className="size-3 text-emerald-500" />
                              <span>{user.phone}</span>
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="pt-3 border-t border-emerald-100 dark:border-emerald-800/50 flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/users/${user.id}`);
                            }}
                            className="islamic-button-primary-ghost px-3 py-1.5 text-xs font-alexandria"
                          >
                            <FiEye className="size-3 mr-1" />
                            {isRTL ? 'عرض' : 'View'}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/users/${user.id}/edit`);
                            }}
                            className="islamic-button-secondary-ghost px-3 py-1.5 text-xs font-alexandria"
                          >
                            <FiEdit className="size-3 mr-1" />
                            {isRTL ? 'تعديل' : 'Edit'}
                          </button>
                        </div>

                        {/* Islamic Blessing */}
                        <div className="text-center pt-2">
                          <span className="text-xs text-emerald-600/70 dark:text-emerald-400/70 font-alexandria italic">
                            {isRTL ? 'بارك الله فيه' : 'May Allah bless them'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Table View
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-emerald-200 dark:divide-emerald-700">
                  <thead className="bg-gradient-to-r from-emerald-50 to-amber-50 dark:from-emerald-900/20 dark:to-amber-900/20">
                    <tr>
                      <th className="px-6 py-4 text-right text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider font-alexandria">
                        {t('users.student') || (isRTL ? 'الطالب' : 'Student')}
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider font-alexandria">
                        {isRTL ? 'الجنس' : 'Gender'}
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider font-alexandria">
                        {isRTL ? 'أجزاء الحفظ' : 'Memorization'}
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider font-alexandria">
                        {isRTL ? 'الحالة' : 'Status'}
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider font-alexandria">
                        {isRTL ? 'الإجراءات' : 'Actions'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-emerald-100 dark:divide-emerald-800/50">
                    {users.map((user, index) => {
                      const fullName = user.firstName && user.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user.name || t('users.notAvailable');
                      const fullNameAr = user.firstNameAr && user.lastNameAr
                        ? `${user.firstNameAr} ${user.lastNameAr}`
                        : null;
                        
                      return (
                        <tr 
                          key={user.id} 
                          className="hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-amber-50/50 dark:hover:from-emerald-900/10 dark:hover:to-amber-900/10 cursor-pointer transition-colors duration-200"
                          onClick={() => navigate(`/users/${user.id}`)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                {user.avatar ? (
                                  <img
                                    src={user.avatar}
                                    alt={fullName}
                                    className="w-12 h-12 rounded-full object-cover shadow-lg ring-2 ring-emerald-200 dark:ring-emerald-700"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'flex';
                                    }}
                                  />
                                ) : null}
                                <div 
                                  className={`w-12 h-12 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-800 dark:to-emerald-900 shadow-lg ring-2 ring-emerald-200 dark:ring-emerald-700 flex items-center justify-center ${user.avatar ? 'hidden' : 'flex'}`}
                                >
                                  <span className="text-lg font-bold text-emerald-700 dark:text-emerald-300 font-alexandria">
                                    {user.firstName?.charAt(0) || user.name?.charAt(0) || user.email?.charAt(0) || 'ط'}
                                  </span>
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
                                  <div className={`w-3 h-3 rounded-full ${
                                    user.status === 'ACTIVE' ? 'bg-green-500' : 
                                    user.status === 'BANNED' ? 'bg-red-500' : 'bg-gray-400'
                                  }`}></div>
                                </div>
                              </div>
                              <div>
                                <div className="text-sm font-bold text-emerald-800 dark:text-emerald-200 font-alexandria">
                                  {fullNameAr || fullName}
                                </div>
                                {fullNameAr && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400 font-sans">
                                    {fullName}
                                  </div>
                                )}
                                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                                  <FiMail className="size-3" />
                                  {user.email}
                                </div>
                                {user.phone && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                                    <FiPhone className="size-3" />
                                    {user.phone}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {user.gender ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold font-alexandria bg-gradient-to-r from-emerald-100 to-amber-100 dark:from-emerald-900/30 dark:to-amber-900/30 text-emerald-700 dark:text-emerald-300">
                                {user.gender === 'MALE' ? (
                                  <>
                                    <span>👨</span>
                                    {isRTL ? 'ذكر' : 'Male'}
                                  </>
                                ) : (
                                  <>
                                    <span>👩</span>
                                    {isRTL ? 'أنثى' : 'Female'}
                                  </>
                                )}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400 dark:text-gray-500 font-alexandria">
                                {isRTL ? 'غير محدد' : 'Not specified'}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-lg font-bold text-amber-700 dark:text-amber-300">
                                {user.memorizedParts || 0} / 30
                              </span>
                              <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-amber-500 to-amber-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${((user.memorizedParts || 0) / 30) * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-amber-600 dark:text-amber-400 font-alexandria">
                                {Math.round(((user.memorizedParts || 0) / 30) * 100)}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span
                              className={cn(
                                'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold font-alexandria',
                                user.status === 'ACTIVE' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 ring-1 ring-green-300 dark:ring-green-700' :
                                user.status === 'BANNED' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 ring-1 ring-red-300 dark:ring-red-700' :
                                'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300 ring-1 ring-gray-300 dark:ring-gray-700'
                              )}
                            >
                              {user.status === 'ACTIVE' ? (
                                <>
                                  <FiCheckCircle className="size-3" />
                                  {isRTL ? 'نشط' : 'Active'}
                                </>
                              ) : user.status === 'BANNED' ? (
                                <>
                                  <FiUserX className="size-3" />
                                  {isRTL ? 'محظور' : 'Banned'}
                                </>
                              ) : (
                                <>
                                  <FiClock className="size-3" />
                                  {isRTL ? 'غير نشط' : 'Inactive'}
                                </>
                              )}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/users/${user.id}`);
                                }}
                                className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-800/50 transition-colors duration-200"
                                title={isRTL ? 'عرض التفاصيل' : 'View Details'}
                              >
                                <FiEye className="size-4" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/users/${user.id}/edit`);
                                }}
                                className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-800/50 transition-colors duration-200"
                                title={isRTL ? 'تعديل البيانات' : 'Edit Student'}
                              >
                                <FiEdit className="size-4" />
                              </button>
                              {user.status === 'ACTIVE' ? (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(user.id, 'ban');
                                  }}
                                  className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors duration-200"
                                  title={isRTL ? 'حظر الطالب' : 'Ban Student'}
                                >
                                  <FiUserX className="size-4" />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(user.id, 'activate');
                                  }}
                                  className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-800/50 transition-colors duration-200"
                                  title={isRTL ? 'تفعيل الطالب' : 'Activate Student'}
                                >
                                  <FiUserCheck className="size-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="islamic-border-top mt-8 pt-6 bg-gradient-to-r from-emerald-50/50 to-amber-50/50 dark:from-emerald-900/10 dark:to-amber-900/10 rounded-lg">
                <div className="flex items-center justify-between px-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setPage((p) => Math.max(1, p - 1))} 
                    disabled={page === 1} 
                    className="islamic-button-secondary font-alexandria"
                  >
                    {t('common.previous') || 'السابق'}
                  </Button>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-emerald-700 dark:text-emerald-300 font-alexandria">
                      {isRTL ? `صفحة ${page} من ${totalPages}` : `Page ${page} of ${totalPages}`}
                    </span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))} 
                    disabled={page === totalPages} 
                    className="islamic-button-secondary font-alexandria"
                  >
                    {t('common.next') || 'التالي'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;