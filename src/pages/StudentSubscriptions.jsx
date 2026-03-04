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
  const [refreshKey, setRefreshKey] = useState(0);

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
      await subscriptionPackagesAPI.deletePackage(id);
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
        await subscriptionPackagesAPI.updatePackage(selectedPackage.id, data);
        toast.success(t('packages.updateSuccess'));
      } else {
        await subscriptionPackagesAPI.createPackage(data);
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
          <SubscriptionsTab
            key={`subscriptions-${refreshKey}-${page}-${statusFilter}`}
            isAdmin={isAdmin}
            statusFilter={statusFilter}
            page={page}
            onPageChange={setPage}
            onTotalPagesChange={setTotalPages}
          />
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