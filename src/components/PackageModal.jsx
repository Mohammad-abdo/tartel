import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { FiX } from 'react-icons/fi';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';

const PackageModal = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  //  UPDATED: Removed maxTeachers, added period for fixed packages
  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    description: '',
    descriptionAr: '',
    packageType: 'fixed', //  'fixed', 'monthly', 'weekly', 'yearly'
    price: '',
    period: '', // For all package types (fixed packages also have period)
    periodUnit: 'months', // 'weeks', 'months', or 'years'
    sessionsPerMonth: '',
    maxBookings: '',
    maxCourses: '',
    isActive: true,
    isPopular: false,
  });

  const [loading, setLoading] = useState(false);

  //  UPDATED: useEffect with new structure (removed maxTeachers)
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        nameAr: initialData.nameAr || '',
        description: initialData.description || '',
        descriptionAr: initialData.descriptionAr || '',
        packageType: initialData.packageType || 'fixed',
        price: initialData.price || '',
        period: initialData.period || '', // 🎯 Now used for all packages
        periodUnit: initialData.periodUnit || 'months',
        sessionsPerMonth: initialData.sessionsPerMonth ?? initialData.totalSessions ?? initialData.maxBookings ?? '',
        maxBookings: initialData.maxBookings || '',
        maxCourses: initialData.maxCourses || '',
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
        isPopular: initialData.isPopular || false,
      });
    } else {
      setFormData({
        name: '',
        nameAr: '',
        description: '',
        descriptionAr: '',
        packageType: 'fixed',
        price: '',
        period: '', // 🎯 Now used for all packages
        periodUnit: 'months',
        sessionsPerMonth: '',
        maxBookings: '',
        maxCourses: '',
        isActive: true,
        isPopular: false,
      });
    }
  }, [initialData, isOpen]);

  
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
        sessionsPerMonth: formData.sessionsPerMonth ? parseInt(formData.sessionsPerMonth) : null,
        maxBookings: formData.maxBookings ? parseInt(formData.maxBookings) : null,
        maxCourses: formData.maxCourses ? parseInt(formData.maxCourses) : null,
        isActive: formData.isActive,
        isPopular: formData.isPopular,
      };

      if (formData.packageType === 'fixed' || formData.packageType === 'weekly' || formData.packageType === 'monthly') {
        data.periodUnit = formData.periodUnit;
      }
      // For yearly, periodUnit is always 'years'
      else if (formData.packageType === 'yearly') {
        data.periodUnit = 'years';
      }

      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error('Failed to submit package:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className={cn('w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-gray-800 shadow-2xl', isRTL && 'text-right')}
        dir={isRTL ? 'rtl' : 'ltr'}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {initialData ? t('packages.editPackageTitle') : t('packages.createPackageTitle')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
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
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
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
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
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
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none resize-none"
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
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none resize-none"
              />
            </div>
          </div>

          {/*  Package Type Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('packages.packageType')} *
              </label>
              <select
                value={formData.packageType}
                onChange={(e) => setFormData({
                  ...formData,
                  packageType: e.target.value,
                  periodUnit: e.target.value === 'yearly' ? 'years' : formData.periodUnit
                })}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
              >
                <option value="fixed">{t('packages.fixed')}</option>
                <option value="monthly">{t('packages.monthly')}</option>
                <option value="weekly">{t('packages.weekly')}</option>
                <option value="yearly">{t('packages.yearly')}</option>
              </select>
            </div>

            {/* Price Field - Always shown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('packages.price')} ($) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                placeholder={formData.packageType === 'fixed' ? 'One-time price' : `Price per ${formData.packageType}`}
              />
            </div>
          </div>

          {/* Period Field - For ALL package types (including fixed) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('packages.period')} *
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                placeholder={`Number of ${formData.periodUnit}`}
              />
            </div>

            {/*Period Unit - Show for fixed, weekly, monthly as select (yearly stays fixed) */}
            {(formData.packageType === 'fixed' || formData.packageType === 'weekly' || formData.packageType === 'monthly') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('packages.periodUnit')}
                </label>
                <select
                  value={formData.periodUnit}
                  onChange={(e) => setFormData({ ...formData, periodUnit: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                >
                  <option value="months">{t('common.months')}</option>
                  {(formData.packageType === 'weekly' || formData.packageType === 'fixed') && (
                    <option value="weeks">{t('common.weeks')}</option>
                  )}
                  {formData.packageType === 'fixed' && (
                    <option value="days">{t('common.days')}</option>
                  )}
                </select>
              </div>
            )}

            {/* For yearly, keep it as text */}
            {formData.packageType === 'yearly' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('packages.periodUnit')}
                </label>
                <div className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-600 px-4 py-2.5 text-gray-700 dark:text-gray-300">
                  {t('common.years')}
                </div>
              </div>
            )}
          </div>

          {/* Limits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('packages.sessionsPerMonth')}
              </label>
              <input
                type="number"
                min="1"
                value={formData.sessionsPerMonth}
                onChange={(e) => setFormData({ ...formData, sessionsPerMonth: e.target.value })}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('packages.maxBookings')}
              </label>
              <input
                type="number"
                min="1"
                value={formData.maxBookings}
                onChange={(e) => setFormData({ ...formData, maxBookings: e.target.value })}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('packages.maxCourses')}
              </label>
              <input
                type="number"
                min="1"
                value={formData.maxCourses}
                onChange={(e) => setFormData({ ...formData, maxCourses: e.target.value })}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="size-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('users.active')}</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPopular}
                onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                className="size-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('packages.isPopular')}</span>
            </label>
          </div>

          {/* Actions */}
          <div className={cn('flex gap-3 pt-4', isRTL ? 'flex-row-reverse' : 'flex-row')}>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-2.5 text-sm font-semibold text-white shadow-lg hover:from-orange-700 hover:to-orange-800"
            >
              {loading ? t('common.saving') : (initialData ? t('common.save') : t('common.add'))}
            </Button>
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 rounded-xl border-gray-300 dark:border-gray-600"
            >
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PackageModal;