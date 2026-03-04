import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { FiX } from 'react-icons/fi';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { createPortal } from "react-dom";

const PackageModal = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { currency } = useCurrency();
  const isRTL = language === 'ar';
  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    description: '',
    descriptionAr: '',
    packageType: 'monthly',
    price: '',
    period: '1',
    sessionsPerMonth: '',
    isActive: true,
    isPopular: false,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        nameAr: initialData.nameAr || '',
        description: initialData.description || '',
        descriptionAr: initialData.descriptionAr || '',
        packageType: initialData.packageType || 'monthly',
        price: initialData.price || '',
        period: initialData.period || '1',
        sessionsPerMonth: initialData.sessionsPerMonth ?? initialData.totalSessions ?? '',
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
        isPopular: initialData.isPopular || false,
      });
    } else {
      setFormData({
        name: '',
        nameAr: '',
        description: '',
        descriptionAr: '',
        packageType: 'monthly',
        price: '',
        period: '1',
        sessionsPerMonth: '',
        isActive: true,
        isPopular: false,
      });
    }
  }, [initialData, isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const getPeriodUnitLabel = (packageType, period) => {
    const numPeriod = parseInt(period) || 1;

    switch (packageType) {
      case 'daily':
        return numPeriod === 1 ? t('common.day') : t('common.days');
      case 'weekly':
        return numPeriod === 1 ? t('common.week') : t('common.weeks');
      case 'monthly':
        return numPeriod === 1 ? t('common.month') : t('common.months');
      case 'yearly':
        return numPeriod === 1 ? t('common.year') : t('common.years');
      default:
        return numPeriod === 1 ? t('common.day') : t('common.days');
    }
  };

  const getPeriodPlaceholder = (packageType) => {
    switch (packageType) {
      case 'daily':
        return t('packages.numberOfDays');
      case 'weekly':
        return t('packages.numberOfWeeks');
      case 'monthly':
        return t('packages.numberOfMonths');
      case 'yearly':
        return t('packages.numberOfYears');
      default:
        return t('packages.price');
    }
  };

  // Check if package type should show sessions per month
  const shouldShowSessionsPerMonth = () => {
    return formData.packageType === 'monthly' || formData.packageType === 'yearly';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        name: formData.name,
        nameAr: formData.nameAr,
        description: formData.description,
        descriptionAr: formData.descriptionAr,
        packageType: formData.packageType,
        price: parseFloat(formData.price) || 0,
        period: parseInt(formData.period) || 1,
        // Only include sessionsPerMonth if it's applicable and has a value
        sessionsPerMonth: shouldShowSessionsPerMonth() && formData.sessionsPerMonth
          ? parseInt(formData.sessionsPerMonth)
          : null,
        isActive: formData.isActive,
        isPopular: formData.isPopular,
      };

      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error('Failed to submit package:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    // Only close if clicking the backdrop itself, not the modal content
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        className={cn(
          'w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-gray-800 shadow-2xl',
          'transform transition-all duration-300 ease-in-out',
          'animate-in fade-in zoom-in-95',
          isRTL && 'text-right'
        )}
        dir={isRTL ? 'rtl' : 'ltr'}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-4 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {initialData ? t('packages.editPackageTitle') : t('packages.createPackageTitle')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <FiX className="size-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Package Names */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('packages.packageNameEn')} *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('packages.packageNameAr')}
              </label>
              <input
                type="text"
                value={formData.nameAr}
                onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Descriptions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('packages.descriptionEn')}
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none resize-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('packages.descriptionAr')}
              </label>
              <textarea
                rows={3}
                value={formData.descriptionAr}
                onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none resize-none transition-colors"
              />
            </div>
          </div>

          {/* Package Type and Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('packages.packageType')} *
              </label>
              <select
                value={formData.packageType}
                onChange={(e) => setFormData({ ...formData, packageType: e.target.value })}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-colors"
              >
                <option value="daily">{t('packages.daily')}</option>
                <option value="weekly">{t('packages.weekly')}</option>
                <option value="monthly">{t('packages.monthly')}</option>
                <option value="yearly">{t('packages.yearly')}</option>
              </select>
            </div>

            {/* Price Field - مرتبط بعملة الإعدادات */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('packages.price')} ({currency?.symbol ?? 'ج.م'}) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-colors"
                placeholder={t('packages.price')}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {t(`packages.${formData.packageType}`)}
              </p>
            </div>
          </div>

          {/* Period Field - With integrated unit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="py-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {t('packages.duration')} *
              </label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1">
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-colors"
                    placeholder={getPeriodPlaceholder(formData.packageType)}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <div className={cn(
                    'px-4 py-2.5 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg text-orange-700 dark:text-orange-400 font-medium',
                    'min-w-[100px] text-center'
                  )}>
                    {getPeriodUnitLabel(formData.packageType, formData.period)}
                  </div>
                </div>
              </div>
            </div>

            {/* Conditional Sessions Per Month - Only for monthly/yearly packages */}
            {shouldShowSessionsPerMonth() && (
              <div className="py-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {t('packages.sessionsPerMonth')}
                </label>

                <input
                  type="number"
                  min="1"
                  value={formData.sessionsPerMonth}
                  onChange={(e) => setFormData({ ...formData, sessionsPerMonth: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-colors"
                  placeholder={t('common.unlimited')}
                />
              </div>
            )}
          </div>
          
          {/* Checkboxes */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="size-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 transition-colors"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('users.active')}</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPopular}
                onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                className="size-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 transition-colors"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('packages.isPopular')}</span>
            </label>
          </div>

          {/* Actions */}
          <div className={cn('flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700', isRTL ? 'flex-row-reverse' : 'flex-row')}>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-2.5 text-sm font-semibold text-white shadow-lg hover:from-orange-700 hover:to-orange-800 disabled:opacity-50 transition-all"
            >
              {loading ? t('common.saving') : (initialData ? t('common.save') : t('common.add'))}
            </Button>
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 rounded-xl border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default PackageModal;