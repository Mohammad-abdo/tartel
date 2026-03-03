import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { studentSubscriptionAPI } from '../services/api';
import { FiPackage } from 'react-icons/fi';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

const SubscriptionsTab = ({ 
  isAdmin, 
  statusFilter, 
  page, 
  onPageChange, 
  onTotalPagesChange 
}) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const locale = language === 'ar' ? 'ar-SA' : 'en-US';
  
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        const response = await studentSubscriptionAPI.getAllSubscriptions({ 
          page, 
          limit: 20, 
          status: statusFilter 
        });
        const payload = response.data || {};
        const list = payload.subscriptions?.data || payload.subscriptions || [];
        const pages = payload.subscriptions?.pagination?.totalPages || 
                     payload.pagination?.totalPages || 
                     payload.totalPages || 
                     1;
        setSubscriptions(Array.isArray(list) ? list : []);
        setTotalPages(pages);
        onTotalPagesChange(pages);
      } else {
        const response = await studentSubscriptionAPI.getMySubscriptions();
        setSubscriptions(response.data || []);
        setTotalPages(1);
        onTotalPagesChange(1);
      }
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, page, statusFilter, onTotalPagesChange]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

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

  const formatDate = (dateString) => {
    if (!dateString) return t('users.notAvailable');
    return new Date(dateString).toLocaleDateString(locale);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="size-12 animate-spin rounded-full border-2 border-orange-600 border-t-transparent" aria-hidden />
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{t('common.loading')}</p>
      </div>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
          <FiPackage className="size-12 text-orange-600 dark:text-orange-400" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
          {t('packages.noSubscriptions')}
        </h2>
        <p className="mt-2 max-w-md text-center text-gray-500 dark:text-gray-400">
          {t('packages.changeFilter')}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full caption-bottom text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-700/50">
            <tr>
              <th className={cn('px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400', isRTL ? 'text-right' : 'text-left')}>
                {t('bookings.student')}
              </th>
              <th className={cn('px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400', isRTL ? 'text-right' : 'text-left')}>
                {t('subscriptions.packages')}
              </th>
              <th className={cn('px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400', isRTL ? 'text-right' : 'text-left')}>
                {t('common.status')}
              </th>
              <th className={cn('px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400', isRTL ? 'text-right' : 'text-left')}>
                {t('subscriptions.startDate')}
              </th>
              <th className={cn('px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400', isRTL ? 'text-right' : 'text-left')}>
                {t('subscriptions.endDate')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {subscriptions.map((sub) => (
              <tr key={sub.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className={cn('px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white', isRTL && 'text-right')}>
                  {sub.student?.user?.name || sub.studentId || t('users.notAvailable')}
                </td>
                <td className={cn('px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300', isRTL && 'text-right')}>
                  {isRTL ? (sub.package?.nameAr || sub.package?.name) : sub.package?.name || t('users.notAvailable')}
                </td>
                <td className="px-6 py-4">
                  <span className={cn('px-2.5 py-1 rounded-full text-xs font-semibold', getStatusBadge(sub.status))}>
                    {getStatusLabel(sub.status)}
                  </span>
                </td>
                <td className={cn('px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300', isRTL && 'text-right')}>
                  {formatDate(sub.startDate)}
                </td>
                <td className={cn('px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300', isRTL && 'text-right')}>
                  {formatDate(sub.endDate)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-4 py-3 sm:px-6">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onPageChange(Math.max(1, page - 1))} 
            disabled={page === 1} 
            className="rounded-xl border-gray-300 dark:border-gray-600"
          >
            {t('common.previous')}
          </Button>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {t('users.pageOf', { page, totalPages })}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onPageChange(Math.min(totalPages, page + 1))} 
            disabled={page === totalPages} 
            className="rounded-xl border-gray-300 dark:border-gray-600"
          >
            {t('common.next')}
          </Button>
        </div>
      )}
    </>
  );
};

export default SubscriptionsTab;