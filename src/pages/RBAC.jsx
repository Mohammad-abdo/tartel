import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { rbacAPI } from '../services/api';
import { FiShield, FiKey, FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import { Card, CardContent } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';

const RBAC = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [activeTab, setActiveTab] = useState('roles');
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'roles') {
        const response = await rbacAPI.getAllRoles();
        setRoles(response.data || []);
      } else {
        const response = await rbacAPI.getAllPermissions();
        setPermissions(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const data = activeTab === 'roles' ? roles : permissions;

  return (
    <div className="space-y-4 sm:space-y-5 lg:space-y-6 2xl:space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">{t('rbac.title') || 'Roles & Permissions'}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{t('rbac.subtitle') || 'Manage user roles and permissions'}</p>
        </div>
        <Button className="shrink-0">
          <FiPlus className="size-4" />
          {t('rbac.create') || 'Create'} {activeTab === 'roles' ? (t('rbac.role') || 'Role') : (t('rbac.permission') || 'Permission')}
        </Button>
      </div>

      <div className="flex gap-1 p-1 rounded-lg bg-muted w-fit">
        <button
          onClick={() => setActiveTab('roles')}
          className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2', activeTab === 'roles' ? 'bg-card text-foreground shadow-tarteel-sm' : 'text-muted-foreground hover:text-foreground')}
        >
          <FiShield className="size-4" />
          {t('rbac.roles') || 'Roles'}
        </button>
        <button
          onClick={() => setActiveTab('permissions')}
          className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2', activeTab === 'permissions' ? 'bg-card text-foreground shadow-tarteel-sm' : 'text-muted-foreground hover:text-foreground')}
        >
          <FiKey className="size-4" />
          {t('rbac.permissions') || 'Permissions'}
        </button>
      </div>

      <Card>
        {loading ? (
          <CardContent className="py-14">
            <div className="flex flex-col items-center gap-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </CardContent>
        ) : data.length === 0 ? (
          <CardContent className="py-16 text-center">
            <FiShield className="size-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-1">{activeTab === 'roles' ? (t('rbac.noRoles') || 'No roles') : (t('rbac.noPermissions') || 'No permissions')}</h2>
            <p className="text-sm text-muted-foreground">Create one using the button above.</p>
          </CardContent>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-700/50">
                <tr>
                  {activeTab === 'roles' ? (
                    <>
                      <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('rbac.roleName') || 'Role Name'}</th>
                      <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('rbac.description') || 'Description'}</th>
                      <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('rbac.permissions') || 'Permissions'}</th>
                      <th className="px-6 py-3 text-end text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('common.actions')}</th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('rbac.permissionName') || 'Permission Name'}</th>
                      <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('rbac.description') || 'Description'}</th>
                      <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('rbac.resource') || 'Resource'}</th>
                      <th className="px-6 py-3 text-end text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('common.actions')}</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {activeTab === 'roles' ? roles.map((role) => (
                  <tr key={role.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
                          <FiShield className="size-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{role.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{role.description || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{role.permissions?.length || 0} permissions</td>
                    <td className="px-6 py-4 text-end">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"><FiEdit className="size-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"><FiTrash2 className="size-4" /></Button>
                      </div>
                    </td>
                  </tr>
                )) : permissions.map((permission) => (
                  <tr key={permission.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700/50">
                          <FiKey className="size-5 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{permission.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{permission.description || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{permission.resource || 'N/A'}</td>
                    <td className="px-6 py-4 text-end">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"><FiEdit className="size-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"><FiTrash2 className="size-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default RBAC;
