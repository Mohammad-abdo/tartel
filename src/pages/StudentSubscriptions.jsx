import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { studentSubscriptionAPI } from '../services/api';
import { FiPackage, FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';
import PackageModal from '../components/PackageModal';
import SubscribeModal from '../components/SubscribeModal';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const StudentSubscriptions = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const isRTL = language === 'ar';
  const locale = language === 'ar' ? 'ar-SA' : 'en-US';
  const [activeTab, setActiveTab] = useState('packages');
  const [packages, setPackages] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'packages') {
        const response = await studentSubscriptionAPI.getAllPackages(!isAdmin); // Students see active only
        setPackages(response.data || []);
      } else {
        if (isAdmin) {
           const response = await studentSubscriptionAPI.getAllSubscriptions({ page, limit: 20, status: statusFilter });
           const payload = response.data || {};
           const list = payload.subscriptions?.data || payload.subscriptions || [];
           const pages = payload.subscriptions?.pagination?.totalPages || payload.pagination?.totalPages || payload.totalPages || 1;
           setSubscriptions(Array.isArray(list) ? list : []);
           setTotalPages(pages);
        } else {
           const response = await studentSubscriptionAPI.getMySubscriptions();
           setSubscriptions(response.data || []);
           setTotalPages(1); // No pagination for student yet?
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, statusFilter, isAdmin]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreatePackage = () => {
    setSelectedPackage(null);
    setIsModalOpen(true);
  };

  const handleEditPackage = (pkg) => {
    setSelectedPackage(pkg);
    setIsModalOpen(true);
  };

  const handleDeletePackage = async (id) => {
    if (!window.confirm(t('packages.deleteConfirm'))) return;
    try {
      await studentSubscriptionAPI.deletePackage(id);
      toast.success(t('packages.deleteSuccess'));
      fetchData();
    } catch (error) {
      console.error('Failed to delete package:', error);
      toast.error(error.response?.data?.message || 'Failed to delete package');
    }
  };

  const handleSubmitPackage = async (data) => {
    try {
      if (selectedPackage) {
        await studentSubscriptionAPI.updatePackage(selectedPackage.id, data);
        toast.success(t('packages.updateSuccess'));
      } else {
        await studentSubscriptionAPI.createPackage(data);
        toast.success(t('packages.createSuccess'));
      }
      fetchData();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to submit package:', error);
      toast.error(error.response?.data?.message || 'Failed to save package');
      throw error;
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      ACTIVE: 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:ring-emerald-800',
      INACTIVE: 'bg-gray-100 text-gray-800 ring-1 ring-gray-200 dark:bg-gray-700 dark:text-gray-300',
      CANCELLED: 'bg-red-50 text-red-800 ring-1 ring-red-200 dark:bg-red-900/20 dark:text-red-400 dark:ring-red-800',
      EXPIRED: 'bg-amber-50 text-amber-800 ring-1 ring-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:ring-amber-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const getStatusLabel = (status) => {
    if (status === 'ACTIVE') return t('users.active');
    if (status === 'INACTIVE') return t('users.inactive');
    if (status === 'CANCELLED') return t('subscriptions.cancelled');
    if (status === 'EXPIRED') return t('subscriptions.expired');
    return status;
  };

  return (
    <div className={cn('space-y-6 animate-fade-in', isRTL && 'text-right')} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Page header - مثل باقي الصفحات */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className={cn('min-w-0', isRTL && 'sm:text-right')}>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">{t('packages.title')}</h1>
          <p className="mt-2 max-w-2xl text-base text-gray-600 dark:text-gray-400">{t('packages.subtitle')}</p>
        </div>

        {activeTab === 'packages' && isAdmin && (
          <Button onClick={handleCreatePackage} className="shrink-0 rounded-xl bg-gradient-to-r from-orange-600 to-orange-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:from-orange-700 hover:to-orange-800">
            <FiPlus className={cn('size-4', isRTL ? 'ml-2' : 'mr-2')} />
            {t('packages.createPackage')}
          </Button>
        )}
      </section>

      {/* Tabs - الاحتفاظ بمنطق التاب */}
      <div className="flex w-fit gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-600 dark:bg-gray-700/50">
        <button
          type="button"
          onClick={() => { setActiveTab('packages'); setPage(1); }}
          className={cn(
            'rounded-md px-4 py-2 text-sm font-medium transition-all',
            activeTab === 'packages' ? 'bg-white text-orange-600 shadow dark:bg-gray-600 dark:text-orange-400' : 'text-gray-600 hover:bg-white/50 dark:text-gray-400 dark:hover:bg-gray-600/50'
          )}
        >
          {t('packages.tabPackages')}
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('subscriptions'); setPage(1); }}
          className={cn(
            'rounded-md px-4 py-2 text-sm font-medium transition-all',
            activeTab === 'subscriptions' ? 'bg-white text-orange-600 shadow dark:bg-gray-600 dark:text-orange-400' : 'text-gray-600 hover:bg-white/50 dark:text-gray-400 dark:hover:bg-gray-600/50'
          )}
        >
          {t('packages.tabAllSubscriptions')}
        </button>
      </div>

      {/* Filters - مثل صفحة الاشتراكات */}
      {activeTab === 'subscriptions' && (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={cn(
                'h-10 min-w-[170px] rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none',
                isRTL && 'text-right'
              )}
            >
              <option value="">{t('users.allStatus')}</option>
              <option value="ACTIVE">{t('users.active')}</option>
              <option value="INACTIVE">{t('users.inactive')}</option>
              <option value="CANCELLED">{t('subscriptions.cancelled')}</option>
              <option value="EXPIRED">{t('subscriptions.expired')}</option>
            </select>
          </div>
        </div>
      )}

      {/* Content - كارد واحد مثل باقي الصفحات */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="size-12 animate-spin rounded-full border-2 border-orange-600 border-t-transparent" aria-hidden />
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{t('common.loading')}</p>
          </div>
        ) : (activeTab === 'packages' ? packages : subscriptions).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
              <FiPackage className="size-12 text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
              {activeTab === 'packages' ? t('packages.noPackages') : t('packages.noSubscriptions')}
            </h2>
            <p className="mt-2 max-w-md text-center text-gray-500 dark:text-gray-400">
              {activeTab === 'subscriptions' && t('packages.changeFilter')}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-700/50">
                  <tr>
                    {activeTab === 'packages' ? (
                      <>
                        <th className={cn('px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400', isRTL ? 'text-right' : 'text-left')}>{t('subscriptions.packageName')}</th>
                        <th className={cn('px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400', isRTL ? 'text-right' : 'text-left')}>{t('packages.durationMonths')}</th>
                        <th className={cn('px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400', isRTL ? 'text-right' : 'text-left')}>{t('packages.sessionsPerMonth')}</th>
                        <th className={cn('px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400', isRTL ? 'text-right' : 'text-left')}>{t('packages.maxTeachers')}</th>
                        <th className={cn('px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400', isRTL ? 'text-right' : 'text-left')}>{t('packages.monthlyPrice')}</th>
                        <th className={cn('px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400', isRTL ? 'text-right' : 'text-left')}>{t('packages.yearlyPrice')}</th>
                        <th className={cn('px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400', isRTL ? 'text-right' : 'text-left')}>{t('common.status')}</th>
                        <th className={cn('px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400', isRTL ? 'text-left' : 'text-right')}>{t('common.actions')}</th>
                      </>
                    ) : (
                      <>
                        <th className={cn('px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400', isRTL ? 'text-right' : 'text-left')}>{t('bookings.student')}</th>
                        <th className={cn('px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400', isRTL ? 'text-right' : 'text-left')}>{t('subscriptions.packages')}</th>
                        <th className={cn('px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400', isRTL ? 'text-right' : 'text-left')}>{t('common.status')}</th>
                        <th className={cn('px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400', isRTL ? 'text-right' : 'text-left')}>{t('subscriptions.startDate')}</th>
                        <th className={cn('px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400', isRTL ? 'text-right' : 'text-left')}>{t('subscriptions.endDate')}</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {activeTab === 'packages'
                    ? packages.map((pkg) => (
                        <tr key={pkg.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className={cn('px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white', isRTL && 'text-right')}>
                            {isRTL ? (pkg.nameAr || pkg.name) : pkg.name}
                            {pkg.isPopular && <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400">⭐</span>}
                          </td>
                          <td className={cn('px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300', isRTL && 'text-right')}>
                            {pkg.durationMonths ? `${pkg.durationMonths} ${t('packages.months')}` : '-'}
                          </td>
                          <td className={cn('px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300', isRTL && 'text-right')}>
                            {pkg.sessionsPerMonth ?? pkg.totalSessions ?? pkg.maxBookings ?? '-'}
                          </td>
                          <td className={cn('px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300', isRTL && 'text-right')}>
                            {pkg.maxTeachers ? `${pkg.maxTeachers} ${t('packages.teachers')}` : t('subscriptions.unlimited')}
                          </td>
                          <td className={cn('px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white', isRTL && 'text-right')}>
                            {pkg.monthlyPrice ? `$${pkg.monthlyPrice.toFixed(2)}` : '-'}
                          </td>
                          <td className={cn('px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white', isRTL && 'text-right')}>
                            {pkg.yearlyPrice ? `$${pkg.yearlyPrice.toFixed(2)}` : '-'}
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn('px-2.5 py-1 rounded-full text-xs font-semibold', pkg.isActive ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300')}>
                              {pkg.isActive ? t('users.active') : t('users.inactive')}
                            </span>
                          </td>
                          {isAdmin ? (
                            <td className={cn('px-6 py-4', isRTL ? 'text-left' : 'text-right')}>
                              <div className={cn('flex items-center gap-2', isRTL ? 'justify-start' : 'justify-end')}>
                                <Button onClick={() => handleEditPackage(pkg)} variant="ghost" size="icon" className="text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/20">
                                  <FiEdit className="size-4" />
                                </Button>
                                <Button onClick={() => handleDeletePackage(pkg.id)} variant="ghost" size="icon" className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20">
                                  <FiTrash2 className="size-4" />
                                </Button>
                              </div>
                            </td>
                          ) : (
                            <td className={cn('px-6 py-4', isRTL ? 'text-left' : 'text-right')}>
                              <Button 
                                size="sm" 
                                onClick={() => { setSelectedPackage(pkg); setIsSubscribeModalOpen(true); }}
                                className="bg-orange-600 hover:bg-orange-700 text-white"
                              >
                                {t('common.subscribe') || 'Subscribe'}
                              </Button>
                            </td>
                          )}
                        </tr>
                      ))
                    : subscriptions.map((sub) => (
                        <tr key={sub.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className={cn('px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white', isRTL && 'text-right')}>{sub.student?.user?.name || sub.studentId || t('users.notAvailable')}</td>
                          <td className={cn('px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300', isRTL && 'text-right')}>{sub.package?.name || t('users.notAvailable')}</td>
                          <td className="px-6 py-4">
                            <span className={cn('px-2.5 py-1 rounded-full text-xs font-semibold', getStatusBadge(sub.status))}>
                              {getStatusLabel(sub.status)}
                            </span>
                          </td>
                          <td className={cn('px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300', isRTL && 'text-right')}>{new Date(sub.startDate).toLocaleDateString(locale)}</td>
                          <td className={cn('px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300', isRTL && 'text-right')}>{sub.endDate ? new Date(sub.endDate).toLocaleDateString(locale) : t('users.notAvailable')}</td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
            {activeTab === 'subscriptions' && totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-4 py-3 sm:px-6">
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-xl border-gray-300 dark:border-gray-600">
                  {t('common.previous')}
                </Button>
                <span className="text-sm text-gray-500 dark:text-gray-400">{t('users.pageOf', { page, totalPages })}</span>
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-xl border-gray-300 dark:border-gray-600">
                  {t('common.next')}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Package Modal */}
      <PackageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitPackage}
        initialData={selectedPackage}
      />

      <SubscribeModal 
         pkg={selectedPackage}
         isOpen={isSubscribeModalOpen}
         onClose={() => setIsSubscribeModalOpen(false)}
         onSuccess={() => { fetchData(); setActiveTab('subscriptions'); }}
      />
    </div>
  );
};

export default StudentSubscriptions;
