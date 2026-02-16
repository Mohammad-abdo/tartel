import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiEdit2, FiSave } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'react-toastify';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';
import AvailabilityScheduler from '../components/Teacher/AvailabilityScheduler';

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const Profile = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.firstName ?? user?.name?.split?.(' ')?.[0] ?? '',
    lastName: user?.lastName ?? user?.name?.split?.(' ')?.[1] ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 500));
      setEditing(false);
      toast.success(t('profile.saved'));
    } catch {
      toast.error(t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.2 }}
      className="max-w-2xl space-y-6"
    >
      <div>
        <p className="text-xs font-semibold tracking-wide text-primary-600 uppercase mb-1">{t('profile.title')}</p>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          <FiUser className="text-primary-600 size-7" />
          {t('profile.title')}
        </h1>
        <p className="text-gray-500 mt-1 text-sm">{t('profile.subtitle')}</p>
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>{t('profile.personalInfo')}</CardTitle>
            {!editing ? (
              <Button variant="ghost" size="sm" onClick={() => setEditing(true)} className="text-primary-600 hover:bg-primary-50">
                <FiEdit2 className="size-4" />
                {t('common.edit')}
              </Button>
            ) : (
              <Button size="sm" onClick={handleSave} disabled={saving}>
                <FiSave className="size-4" />
                {saving ? t('common.loading') : t('common.save')}
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.firstName')}</label>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) => setForm((s) => ({ ...s, firstName: e.target.value }))}
                  disabled={!editing}
                  className={cn('w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 disabled:bg-gray-50 disabled:text-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none', isRTL && 'text-right')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.lastName')}</label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={(e) => setForm((s) => ({ ...s, lastName: e.target.value }))}
                  disabled={!editing}
                  className={cn('w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 disabled:bg-gray-50 disabled:text-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none', isRTL && 'text-right')}
                />
              </div>
              <div className="sm:col-span-2 flex items-center gap-2">
                <FiMail className="text-gray-400 size-4 shrink-0" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.email')}</label>
                  <input
                    type="email"
                    value={form.email}
                    readOnly
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600"
                  />
                </div>
              </div>
              <div className="sm:col-span-2 flex items-center gap-2">
                <FiPhone className="text-gray-400 size-4 shrink-0" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.phone')}</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
                    disabled={!editing}
                    className={cn('w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 disabled:bg-gray-50 disabled:text-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none', isRTL && 'text-right')}
                  />
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                {t('profile.role')}: <span className="font-medium text-gray-700">{user?.role ?? 'Admin'}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {user?.role === 'TEACHER' && (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <AvailabilityScheduler />
        </motion.div>
      )}
    </motion.div>
  );
};

export default Profile;
