import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { subscriptionAPI } from '../services/api';
import { FiBox, FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';
import { useCurrency } from '../context/CurrencyContext';

const Subscriptions = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { formatCurrency } = useCurrency();
  const isRTL = language === 'ar';
  const [activeTab, setActiveTab] = useState('packages');
  const [packages, setPackages] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeTab, page, statusFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'packages') {
        const response = await subscriptionAPI.getAllPackages(false);
        setPackages(response.data || []);
      } else {
        const response = await subscriptionAPI.getAllPackages({ page, limit: 20, status: statusFilter });
        setSubscriptions(response.data.data || []);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      ACTIVE: 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200',
      INACTIVE: 'bg-gray-100 text-gray-800 ring-1 ring-gray-200',
      CANCELLED: 'bg-red-50 text-red-800 ring-1 ring-red-200',
      EXPIRED: 'bg-amber-50 text-amber-800 ring-1 ring-amber-200',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className={cn('min-w-0', isRTL && 'sm:text-right')}>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">{t('subscriptions.title')}</h1>
          <p className="mt-2 max-w-2xl text-base text-gray-600 dark:text-gray-400">{t('subscriptions.subtitle')}</p>
        </div>
        {activeTab === 'packages' && (
          <Button className="shrink-0 rounded-xl bg-gradient-to-r from-orange-600 to-orange-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:from-orange-700 hover:to-orange-800">
            <FiPlus className={cn('size-4', isRTL ? 'ml-2' : 'mr-2')} />
            {t('subscriptions.createPackage')}
          </Button>
        )}
      </section>

      {/* Tabs */}
      <div className="flex w-fit gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-600 dark:bg-gray-700/50">
        <button type="button" onClick={() => { setActiveTab('packages'); setPage(1); }} className={cn('rounded-md px-4 py-2 text-sm font-medium transition-all', activeTab === 'packages' ? 'bg-white text-orange-600 shadow dark:bg-gray-600 dark:text-orange-400' : 'text-gray-600 hover:bg-white/50 dark:text-gray-400 dark:hover:bg-gray-600/50')}>
          {t('subscriptions.packages')}
        </button>
        <button type="button" onClick={() => { setActiveTab('subscriptions'); setPage(1); }} className={cn('rounded-md px-4 py-2 text-sm font-medium transition-all', activeTab === 'subscriptions' ? 'bg-white text-orange-600 shadow dark:bg-gray-600 dark:text-orange-400' : 'text-gray-600 hover:bg-white/50 dark:text-gray-400 dark:hover:bg-gray-600/50')}>
          {t('subscriptions.allSubscriptions')}
        </button>
      </div>

      {/* Filters */}
      {activeTab === 'subscriptions' && (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 min-w-[170px] rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500">
              <option value="">{t('users.allStatus')}</option>
              <option value="ACTIVE">{t('users.active')}</option>
              <option value="INACTIVE">{t('users.inactive')}</option>
              <option value="CANCELLED">{t('subscriptions.cancelled')}</option>
              <option value="EXPIRED">{t('subscriptions.expired')}</option>
            </select>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="size-12 animate-spin rounded-full border-2 border-orange-600 border-t-transparent" />
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{t('common.loading')}</p>
          </div>
        ) : (activeTab === 'packages' ? packages : subscriptions).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
              <FiBox className="size-12 text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">{activeTab === 'packages' ? t('subscriptions.noPackages') : t('subscriptions.noSubscriptions')}</h2>
            <p className="mt-2 max-w-md text-center text-gray-500 dark:text-gray-400">{activeTab === 'subscriptions' && 'Try changing the filter.'}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-700/50">
                  <tr>
                    {activeTab === 'packages' ? (
                      <>
                        <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('subscriptions.packageName')}</th>
                        <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('subscriptions.price')}</th>
                        <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('subscriptions.duration')}</th>
                        <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('common.status')}</th>
                        <th className="px-6 py-3 text-end text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('common.actions')}</th>
                      </>
                    ) : (
                      <>
                        <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('bookings.teacher')}</th>
                        <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('subscriptions.packages')}</th>
                        <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('common.status')}</th>
                        <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('subscriptions.startDate')}</th>
                        <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('subscriptions.endDate')}</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {activeTab === 'packages' ? (
                    packages.map((pkg) => (
                      <tr key={pkg.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white"><div className="font-medium">{pkg.name}</div></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{formatCurrency(pkg.price)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{t('subscriptions.durationDays', { count: pkg.durationDays })}</td>
                        <td className="px-6 py-4">
                          <span className={cn('px-2.5 py-1 rounded-full text-xs font-semibold', pkg.isActive ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:ring-emerald-800' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300')}>
                            {pkg.isActive ? t('users.active') : t('users.inactive')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-end">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" className="text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/20"><FiEdit className="size-4" /></Button>
                            <Button variant="ghost" size="icon" className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"><FiTrash2 className="size-4" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    subscriptions.map((sub) => (
                      <tr key={sub.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{sub.teacher?.user?.name || t('common.notAvailable')}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{sub.package?.name || t('common.notAvailable')}</td>
                        <td className="px-6 py-4">
                          <span className={cn('px-2.5 py-1 rounded-full text-xs font-semibold', getStatusBadge(sub.status))}>{sub.status}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{new Date(sub.startDate).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{sub.endDate ? new Date(sub.endDate).toLocaleDateString() : t('common.notAvailable')}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {activeTab === 'subscriptions' && totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-4 py-3 sm:px-6">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">{t('common.previous')}</button>
                <span className="text-sm text-gray-500 dark:text-gray-400">{t('users.pageOf', { page, totalPages })}</span>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">{t('common.next')}</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Subscriptions;
