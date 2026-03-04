import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';
import { FiActivity, FiUser, FiCalendar, FiDollarSign, FiFilter } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { auditAPI } from '../services/api';
import { Card, CardContent } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const iconByEntity = {
  User: FiUser,
  Booking: FiCalendar,
  Payment: FiDollarSign,
  default: FiActivity,
};

const ActivityPage = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ entity: '', action: '', page: 1, limit: 20 });

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const res = await auditAPI.getLogs(filters);
        const data = res.data;
        setLogs(data?.logs ?? []);
        setPagination({
          page: data?.pagination?.page ?? 1,
          totalPages: data?.pagination?.totalPages ?? 1,
          total: data?.pagination?.total ?? 0,
        });
      } catch {
        setLogs([]);
        toast.error(t('activity.loadFailed'));
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [filters.page, filters.entity, filters.action, filters.limit]);

  const Icon = (entity) => iconByEntity[entity] || iconByEntity.default;

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
        <p className="text-xs font-semibold tracking-wide text-primary-600 uppercase mb-1">{t('activity.title')}</p>
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          <FiActivity className="text-primary-600 size-7" />
          {t('activity.title')}
        </h1>
        <p className="text-gray-500 mt-1 text-sm">{t('activity.subtitle')}</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <FiFilter className="text-gray-500 size-4" />
              <span className="text-sm text-gray-600">{t('activity.entity')}:</span>
              <select
                value={filters.entity}
                onChange={(e) => setFilters((s) => ({ ...s, entity: e.target.value, page: 1 }))}
                className={cn(
                  'rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:bg-gray-800',
                  isRTL ? 'text-right' : 'text-left'
                )}
              >
                <option className="text-gray-900 dark:text-gray-100" value="">{t('common.filter')}</option>
                <option className="text-gray-900 dark:text-gray-100" value="User">User</option>
                <option className="text-gray-900 dark:text-gray-100" value="Booking">Booking</option>
                <option className="text-gray-900 dark:text-gray-100" value="Payment">Payment</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        {loading ? (
          <CardContent className="py-14">
            <div className="flex flex-col gap-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </CardContent>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full caption-bottom text-sm">
                <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('activity.action')}</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('activity.entity')}</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('activity.user')}</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('common.date')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                        {t('activity.noLogs')}
                      </td>
                    </tr>
                  ) : (
                    logs.map((log, idx) => {
                      const IconComponent = Icon(log.entity);
                      return (
                        <motion.tr
                          key={log.id || idx}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.02 }}
                          className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-lg bg-primary-50">
                                <IconComponent className="text-primary-600 size-4" />
                              </div>
                              <span className="text-sm font-medium text-gray-900">{log.action}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {log.entity}
                            {log.entityId && <span className="text-gray-400 ml-1">#{log.entityId?.slice?.(0, 8)}</span>}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {log.user ? `${log.user.firstName ?? ''} ${log.user.lastName ?? ''}`.trim() || log.user.email : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {log.createdAt ? new Date(log.createdAt).toLocaleString() : '-'}
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
                <p className="text-sm text-gray-600">{t('activity.total')}: {pagination.total}</p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={filters.page <= 1}
                    onClick={() => setFilters((s) => ({ ...s, page: s.page - 1 }))}
                  >
                    {t('common.previous')}
                  </Button>
                  <span className="text-sm text-gray-600 px-2">{filters.page} / {pagination.totalPages}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={filters.page >= pagination.totalPages}
                    onClick={() => setFilters((s) => ({ ...s, page: s.page + 1 }))}
                  >
                    {t('common.next')}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </motion.div>
  );
};

export default ActivityPage;
