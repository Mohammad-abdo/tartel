import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FiSettings, FiBell, FiShield, FiGlobe, FiSave, FiDollarSign, FiImage } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { toast } from 'react-toastify';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';
import { fileUploadAPI } from '../services/api';

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const cardVariants = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
};

const Settings = () => {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();
  const { user } = useAuth();
  const { currency, sidebar, formatCurrency, updateSettings, currencies } = useCurrency();
  const canEditCurrency = user?.role === 'SUPER_ADMIN';
  const [sidebarLogoUrl, setSidebarLogoUrl] = useState(sidebar?.logoUrl ?? '');
  const [sidebarTitleAr, setSidebarTitleAr] = useState(sidebar?.titleAr ?? '');
  const [sidebarTitleEn, setSidebarTitleEn] = useState(sidebar?.titleEn ?? '');
  const [sidebarSubtitleAr, setSidebarSubtitleAr] = useState(sidebar?.subtitleAr ?? '');
  const [sidebarSubtitleEn, setSidebarSubtitleEn] = useState(sidebar?.subtitleEn ?? '');
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    bookingReminders: true,
  });
  const [saving, setSaving] = useState(false);
  const [currencyCode, setCurrencyCode] = useState(currency?.code || 'EGP');
  const [savingCurrency, setSavingCurrency] = useState(false);
  useEffect(() => {
    if (currency?.code) setCurrencyCode(currency.code);
  }, [currency?.code]);
  useEffect(() => {
    if (sidebar) {
      setSidebarLogoUrl(sidebar.logoUrl ?? '');
      setSidebarTitleAr(sidebar.titleAr ?? '');
      setSidebarTitleEn(sidebar.titleEn ?? '');
      setSidebarSubtitleAr(sidebar.subtitleAr ?? '');
      setSidebarSubtitleEn(sidebar.subtitleEn ?? '');
    }
  }, [sidebar?.logoUrl, sidebar?.titleAr, sidebar?.titleEn, sidebar?.subtitleAr, sidebar?.subtitleEn]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      toast.success(t('settings.saved'));
    } catch {
      toast.error(t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCurrency = async () => {
    const selected = currencies.find((c) => c.code === currencyCode) || currencies[0];
    setSavingCurrency(true);
    try {
      const payload = {
        currencyCode: selected.code,
        currencySymbol: selected.symbol,
        currencyNameAr: selected.nameAr,
        currencyNameEn: selected.nameEn,
      };
      await updateSettings(payload);
      toast.success(t('settings.saved'));
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || t('common.error');
      toast.error(msg);
    } finally {
      setSavingCurrency(false);
    }
  };

  const [savingSidebar, setSavingSidebar] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = useRef(null);
  const handleLogoUpload = async (e) => {
    const file = e?.target?.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fileUploadAPI.uploadImage(formData);
      const url = res?.data?.url ?? res?.url;
      if (url) setSidebarLogoUrl(url);
      else toast.error(t('common.error'));
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || t('common.error');
      toast.error(msg);
    } finally {
      setUploadingLogo(false);
    }
  };
  const handleSaveSidebar = async () => {
    setSavingSidebar(true);
    try {
      await updateSettings({
        sidebar: {
          logoUrl: sidebarLogoUrl,
          titleAr: sidebarTitleAr,
          titleEn: sidebarTitleEn,
          subtitleAr: sidebarSubtitleAr,
          subtitleEn: sidebarSubtitleEn,
        },
      });
      toast.success(t('settings.saved'));
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || t('common.error');
      toast.error(msg);
    } finally {
      setSavingSidebar(false);
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <div>
        <p className="text-xs font-semibold tracking-wide text-primary-600 uppercase mb-1">{t('settings.title')}</p>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          <FiSettings className="text-primary-600 size-7" />
          {t('settings.title')}
        </h1>
        <p className="text-gray-500 mt-1 text-sm">{t('settings.subtitle')}</p>
      </div>

      <motion.div variants={cardVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FiGlobe className="size-5 text-primary-600" />
              {t('settings.language')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 p-1 rounded-lg bg-gray-100 w-fit">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={cn('px-4 py-2 rounded-md text-sm font-medium transition-colors', language === 'en' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900')}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('ar')}
                className={cn('px-4 py-2 rounded-md text-sm font-medium transition-colors', language === 'ar' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900')}
              >
                العربية
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={cardVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FiBell className="size-5 text-primary-600" />
              {t('settings.notifications')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { key: 'email', label: t('settings.emailNotifications') },
                { key: 'push', label: t('settings.pushNotifications') },
                { key: 'bookingReminders', label: t('settings.bookingReminders') },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center justify-between cursor-pointer py-1">
                  <span className="text-gray-700 text-sm">{label}</span>
                  <input
                    type="checkbox"
                    checked={notifications[key]}
                    onChange={(e) => setNotifications((s) => ({ ...s, [key]: e.target.checked }))}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 size-4"
                  />
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {canEditCurrency && (
        <motion.div variants={cardVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FiImage className="size-5 text-primary-600" />
                {language === 'ar' ? 'شعار الشريط الجانبي والعنوان' : 'Sidebar logo & title'}
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                {language === 'ar' ? 'رفع شعار وعنوان يظهران بجانب اللوجو في الشريط الجانبي.' : 'Upload a logo and set the title/subtitle shown next to it in the sidebar.'}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap items-start gap-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {language === 'ar' ? 'الشعار' : 'Logo'}
                    </span>
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={logoInputRef}
                        onChange={handleLogoUpload}
                        disabled={uploadingLogo}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploadingLogo}
                        onClick={() => logoInputRef.current?.click()}
                      >
                        {uploadingLogo ? t('common.loading') : (language === 'ar' ? 'رفع صورة' : 'Upload image')}
                      </Button>
                      {sidebarLogoUrl && (
                        <img src={sidebarLogoUrl} alt="Logo" className="h-10 w-10 object-contain rounded border border-gray-200 dark:border-gray-600" />
                      )}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'ar' ? 'العنوان (عربي)' : 'Title (Arabic)'}</label>
                    <input
                      type="text"
                      value={sidebarTitleAr}
                      onChange={(e) => setSidebarTitleAr(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white"
                      placeholder="ترتيل"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'ar' ? 'العنوان (إنجليزي)' : 'Title (English)'}</label>
                    <input
                      type="text"
                      value={sidebarTitleEn}
                      onChange={(e) => setSidebarTitleEn(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white"
                      placeholder="Tarteel"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'ar' ? 'العنوان الفرعي (عربي)' : 'Subtitle (Arabic)'}</label>
                    <input
                      type="text"
                      value={sidebarSubtitleAr}
                      onChange={(e) => setSidebarSubtitleAr(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white"
                      placeholder="منصة حفظ القرآن"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'ar' ? 'العنوان الفرعي (إنجليزي)' : 'Subtitle (English)'}</label>
                    <input
                      type="text"
                      value={sidebarSubtitleEn}
                      onChange={(e) => setSidebarSubtitleEn(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white"
                      placeholder="Quran memorization platform"
                    />
                  </div>
                </div>
                <Button onClick={handleSaveSidebar} disabled={savingSidebar}>
                  {savingSidebar ? t('common.loading') : t('common.save')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {canEditCurrency && (
        <motion.div variants={cardVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FiDollarSign className="size-5 text-primary-600" />
                {language === 'ar' ? 'العملة (النظام)' : 'Currency (System)'}
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                {language === 'ar' ? 'العملة الموحدة لعرض المبالغ في كل النظام. يقتصر التعديل على الأدمن.' : 'Unified currency for all amounts across the system. Only admins can change it.'}
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={currencyCode}
                  onChange={(e) => setCurrencyCode(e.target.value)}
                  className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white min-w-[180px]"
                >
                  {currencies.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} — {language === 'ar' ? c.nameAr : c.nameEn} ({c.symbol})
                    </option>
                  ))}
                </select>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'ar' ? 'مثال:' : 'Example:'} {formatCurrency(99.5)}
                </span>
                <Button onClick={handleSaveCurrency} disabled={savingCurrency}>
                  {savingCurrency ? t('common.loading') : t('common.save')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div variants={cardVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FiShield className="size-5 text-primary-600" />
              {t('settings.security')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm mb-4">{t('settings.securityDesc')}</p>
            <Button variant="outline" size="sm" className="text-primary-600 border-primary-200 hover:bg-primary-50">
              {t('settings.changePassword')}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          <FiSave className="size-4" />
          {saving ? t('common.loading') : t('common.save')}
        </Button>
      </div>
    </motion.div>
  );
};

export default Settings;
