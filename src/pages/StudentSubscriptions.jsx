import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { subscriptionPackagesAPI, studentSubscriptionAPI } from '../services/api';
import { FiPlus } from 'react-icons/fi';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import PackageModal from '../components/students-subscription/PackageModal';
import SubscribeModal from '../components/SubscribeModal';
import PackagesTab from '../components/students-subscription/PackagesTab';
import SubscriptionsTab from '../components/students-subscription/SubscriptionsTab';

const StudentSubscriptions = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const isRTL = language === 'ar';
  
  const [activeTab, setActiveTab] = useState('packages');
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
          setTotalPages(1);
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
      setRefreshKey(prev => prev + 1);
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
      setRefreshKey(prev => prev + 1);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to submit package:', error);
      toast.error(error.response?.data?.message || 'Failed to save package');
      throw error;
    }
  };

  const handleSubscribe = (pkg) => {
    setSelectedPackage(pkg);
    setIsSubscribeModalOpen(true);
  };

  const handleSubscribeSuccess = () => {
    setRefreshKey(prev => prev + 1);
    setActiveTab('subscriptions');
    toast.success(t('subscriptions.subscribeSuccess'));
  };

  return (
    <div className={cn('space-y-6 animate-fade-in', isRTL && 'text-right')} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Page header */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className={cn('min-w-0', isRTL && 'sm:text-right')}>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            {t('packages.title')}
          </h1>
          <p className="mt-2 max-w-2xl text-base text-gray-600 dark:text-gray-400">
            {t('packages.subtitle')}
          </p>
        </div>

        {activeTab === 'packages' && isAdmin && (
          <Button 
            onClick={handleCreatePackage} 
            className="shrink-0 rounded-xl bg-gradient-to-r from-orange-600 to-orange-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:from-orange-700 hover:to-orange-800"
          >
            <FiPlus className={cn('size-4', isRTL ? 'ml-2' : 'mr-2')} />
            {t('packages.createPackage')}
          </Button>
        )}
      </section>

      {/* Tabs */}
      <div className="flex w-fit gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-600 dark:bg-gray-700/50">
        <button
          type="button"
          onClick={() => { setActiveTab('packages'); setPage(1); }}
          className={cn(
            'rounded-md px-4 py-2 text-sm font-medium transition-all',
            activeTab === 'packages' 
              ? 'bg-white text-orange-600 shadow dark:bg-gray-600 dark:text-orange-400' 
              : 'text-gray-600 hover:bg-white/50 dark:text-gray-400 dark:hover:bg-gray-600/50'
          )}
        >
          {t('packages.tabPackages')}
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('subscriptions'); setPage(1); }}
          className={cn(
            'rounded-md px-4 py-2 text-sm font-medium transition-all',
            activeTab === 'subscriptions' 
              ? 'bg-white text-orange-600 shadow dark:bg-gray-600 dark:text-orange-400' 
              : 'text-gray-600 hover:bg-white/50 dark:text-gray-400 dark:hover:bg-gray-600/50'
          )}
        >
          {t('packages.tabAllSubscriptions')}
        </button>
      </div>

      {/* Filters - Only for subscriptions tab */}
      {activeTab === 'subscriptions' && (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1); // Reset to first page on filter change
              }}
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

      {/* Content Card */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
        {activeTab === 'packages' ? (
          <PackagesTab
            key={`packages-${refreshKey}`}
            isAdmin={isAdmin}
            onEdit={handleEditPackage}
            onDelete={handleDeletePackage}
            onSubscribe={handleSubscribe}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-700/50">
                  <tr>
                    {activeTab === 'packages' ? (
                      <>
                        <th className={cn('px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400', isRTL ? 'text-right' : 'text-left')}>{t('subscriptions.packageName')}</th>
                        <th className={cn('px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400', isRTL ? 'text-right' : 'text-left')}>{t('packages.packageType')}</th>
                        <th className={cn('px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400', isRTL ? 'text-right' : 'text-left')}>{t('packages.price')}</th>
                        <th className={cn('px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400', isRTL ? 'text-right' : 'text-left')}>{t('packages.duration')}</th>
                        <th className={cn('px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400', isRTL ? 'text-right' : 'text-left')}>{t('packages.sessionsPerMonth')}</th>
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
                        {/* 📦 Package Name */}
                        <td className={cn('px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white', isRTL && 'text-right')}>
                          {isRTL ? (pkg.nameAr || pkg.name) : pkg.name}
                          {pkg.isPopular && <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400">⭐</span>}
                        </td>
                        
                        {/* 🏷️ Package Type Badge */}
                        <td className={cn('px-6 py-4 whitespace-nowrap', isRTL && 'text-right')}>
                          <span className={cn(
                            'px-2.5 py-1 rounded-full text-xs font-semibold',
                            pkg.packageType === 'fixed' ? 'bg-purple-100 text-purple-800 ring-1 ring-purple-200 dark:bg-purple-900/20 dark:text-purple-400' :
                            pkg.packageType === 'monthly' ? 'bg-blue-100 text-blue-800 ring-1 ring-blue-200 dark:bg-blue-900/20 dark:text-blue-400' :
                            pkg.packageType === 'weekly' ? 'bg-indigo-100 text-indigo-800 ring-1 ring-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400' :
                            'bg-amber-100 text-amber-800 ring-1 ring-amber-200 dark:bg-amber-900/20 dark:text-amber-400' // yearly
                          )}>
                            {t(`packages.${pkg.packageType || 'fixed'}`)}
                          </span>
                        </td>
                        
                        {/* Price - مرتبط بعملة الإعدادات */}
                        <td className={cn('px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white', isRTL && 'text-right')}>
                          {formatCurrency(pkg.price ?? 0)}
                          {pkg.packageType !== 'fixed' && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                              {`/${pkg.packageType}`}
                            </span>
                          )}
                        </td>
                        
                        {/* ⏱️ Duration */}
                        <td className={cn('px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300', isRTL && 'text-right')}>
                          {pkg.period ? `${pkg.period} ${t(`common.${pkg.periodUnit || 'days'}`)}` : '-'}
                        </td>
                        
                        {/* 📊 Sessions Per Month */}
                        <td className={cn('px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300', isRTL && 'text-right')}>
                          {pkg.sessionsPerMonth ?? pkg.totalSessions ?? pkg.maxBookings ?? t('subscriptions.unlimited')}
                        </td>
                        
                        {/* ✅ Status */}
                        <td className="px-6 py-4">
                          <span className={cn('px-2.5 py-1 rounded-full text-xs font-semibold', 
                            pkg.isActive ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400' : 
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          )}>
                            {pkg.isActive ? t('users.active') : t('users.inactive')}
                          </span>
                        </td>
                        
                        {/* ⚙️ Actions */}
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
                              {t('common.subscribe')}
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

      {/* Modals */}
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
        onSuccess={handleSubscribeSuccess}
      />
    </div>
  );
};

export default StudentSubscriptions;