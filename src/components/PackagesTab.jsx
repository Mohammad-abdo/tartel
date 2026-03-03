import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { subscriptionPackagesAPI } from '../services/api';
import { FiEdit, FiTrash2, FiPackage } from 'react-icons/fi';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';
import { useCurrency } from '../context/CurrencyContext';

const PackagesTab = ({ 
  isAdmin, 
  onEdit, 
  onDelete, 
  onSubscribe 
}) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { formatCurrency } = useCurrency();
  const isRTL = language === 'ar';
  
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPackages = useCallback(async () => {
    setLoading(true);
    try {
      // Students see only active packages, admins see all
      const response = await subscriptionPackagesAPI.getAllPackages(!isAdmin);
      setPackages(response.data || []);
    } catch (error) {
      console.error('Failed to fetch packages:', error);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  // Format period based on package type
  const formatPeriod = (pkg) => {
    if (!pkg.period) return '-';
    
    let unitKey = 'common.days';
    switch (pkg.packageType) {
      case 'daily':
        unitKey = pkg.period === 1 ? 'common.day' : 'common.days';
        break;
      case 'weekly':
        unitKey = pkg.period === 1 ? 'common.week' : 'common.weeks';
        break;
      case 'monthly':
        unitKey = pkg.period === 1 ? 'common.month' : 'common.months';
        break;
      case 'yearly':
        unitKey = pkg.period === 1 ? 'common.year' : 'common.years';
        break;
      default:
        unitKey = 'common.days';
    }
    
    return `${pkg.period} ${t(unitKey)}`;
  };

  // Get badge styling based on package type
  const getPackageTypeBadge = (packageType) => {
    switch (packageType) {
      case 'daily':
        return 'bg-amber-100 text-amber-800 ring-1 ring-amber-200 dark:bg-amber-900/20 dark:text-amber-400';
      case 'weekly':
        return 'bg-indigo-100 text-indigo-800 ring-1 ring-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400';
      case 'monthly':
        return 'bg-blue-100 text-blue-800 ring-1 ring-blue-200 dark:bg-blue-900/20 dark:text-blue-400';
      case 'yearly':
        return 'bg-purple-100 text-purple-800 ring-1 ring-purple-200 dark:bg-purple-900/20 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 ring-1 ring-gray-200 dark:bg-gray-700 dark:text-gray-300';
    }
  };



  // Check if sessions per month should be shown (only for monthly/yearly)
  const shouldShowSessionsPerMonth = (packageType) => {
    return packageType === 'monthly' || packageType === 'yearly';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="size-12 animate-spin rounded-full border-2 border-orange-600 border-t-transparent" aria-hidden />
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{t('common.loading')}</p>
      </div>
    );
  }

  if (packages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
          <FiPackage className="size-12 text-orange-600 dark:text-orange-400" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
          {t('packages.noPackages')}
        </h2>
        {!isAdmin && (
          <p className="mt-2 max-w-md text-center text-gray-500 dark:text-gray-400">
            {t('packages.noPackagesAvailable')}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full caption-bottom text-sm">
        <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-700/50">
          <tr>
            <th className={cn('px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400', isRTL ? 'text-right' : 'text-left')}>
              {t('subscriptions.packageName')}
            </th>
            <th className={cn('px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400', isRTL ? 'text-right' : 'text-left')}>
              {t('packages.packageType')}
            </th>
            <th className={cn('px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400', isRTL ? 'text-right' : 'text-left')}>
              {t('packages.price')}
            </th>
            <th className={cn('px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400', isRTL ? 'text-right' : 'text-left')}>
              {t('packages.duration')}
            </th>
            <th className={cn('px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400', isRTL ? 'text-right' : 'text-left')}>
              {t('packages.sessionsPerMonth')}
            </th>
            <th className={cn('px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400', isRTL ? 'text-right' : 'text-left')}>
              {t('common.status')}
            </th>
            <th className={cn('px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400', isRTL ? 'text-left' : 'text-right')}>
              {t('common.actions')}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {packages.map((pkg) => (
            <tr key={pkg.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
              {/* Package Name */}
              <td className={cn('px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white', isRTL && 'text-right')}>
                <div className="flex items-center gap-2">
                  <span>{isRTL ? (pkg.nameAr || pkg.name) : pkg.name}</span>
                  {pkg.isPopular && (
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
                      ⭐ {t('packages.isPopular')}
                    </span>
                  )}
                </div>
              </td>
              
              {/* Package Type Badge */}
              <td className={cn('px-6 py-4 whitespace-nowrap', isRTL && 'text-right')}>
                <span className={cn('px-2.5 py-1 rounded-full text-xs font-semibold', getPackageTypeBadge(pkg.packageType))}>
                  {t(`packages.${pkg.packageType}`)}
                </span>
              </td>
              
              {/* Price */}
              <td className={cn('px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white', isRTL && 'text-right')}>
                {formatCurrency(pkg)}
              </td>
              
              {/* Duration */}
              <td className={cn('px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300', isRTL && 'text-right')}>
                {formatPeriod(pkg)}
              </td>
              
              {/* Sessions Per Month */}
              <td className={cn('px-6 py-4 whitespace-nowrap text-sm', isRTL && 'text-right')}>
                {shouldShowSessionsPerMonth(pkg.packageType) ? (
                  <span className="text-gray-600 dark:text-gray-300">
                    {pkg.sessionsPerMonth ?? t('subscriptions.unlimited')}
                  </span>
                ) : (
                  <span className="text-gray-400 dark:text-gray-500 italic">
                    {t('common.notApplicable')}
                  </span>
                )}
              </td>
              
              {/* Status */}
              <td className="px-6 py-4">
                <span className={cn('px-2.5 py-1 rounded-full text-xs font-semibold', 
                  pkg.isActive ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400' : 
                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                )}>
                  {pkg.isActive ? t('users.active') : t('users.inactive')}
                </span>
              </td>
              
              {/* Actions */}
              <td className={cn('px-6 py-4', isRTL ? 'text-left' : 'text-right')}>
                {isAdmin ? (
                  <div className={cn('flex items-center gap-2', isRTL ? 'justify-start' : 'justify-end')}>
                    <Button 
                      onClick={() => onEdit(pkg)} 
                      variant="ghost" 
                      size="icon" 
                      className="text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/20"
                      title={t('common.edit')}
                    >
                      <FiEdit className="size-4" />
                    </Button>
                    <Button 
                      onClick={() => onDelete(pkg.id)} 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                      title={t('common.delete')}
                    >
                      <FiTrash2 className="size-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => onSubscribe(pkg)}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                    disabled={!pkg.isActive}
                  >
                    {t('common.subscribe')}
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PackagesTab;