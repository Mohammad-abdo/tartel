import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { rbacAPI, adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiShield, FiKey, FiPlus, FiEdit, FiTrash2, FiSettings, FiUserPlus, FiUsers, FiUser } from 'react-icons/fi';
import { Card, CardContent } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';
import { toast } from 'react-toastify';

const USER_ROLES = ['ADMIN', 'SUPPORT_ADMIN', 'CONTENT_ADMIN', 'FINANCE_ADMIN', 'STUDENT', 'TEACHER'];

const RBAC = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { user: authUser } = useAuth();
  const isRTL = language === 'ar';
  const isSuperAdmin = authUser?.role === 'SUPER_ADMIN';
  const [activeTab, setActiveTab] = useState('roles');
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [createRoleOpen, setCreateRoleOpen] = useState(false);
  const [createPermissionOpen, setCreatePermissionOpen] = useState(false);
  const [editRole, setEditRole] = useState(null);
  const [editPermission, setEditPermission] = useState(null);
  const [deleteRole, setDeleteRole] = useState(null);
  const [deletePermission, setDeletePermission] = useState(null);
  const [managePermissionsRole, setManagePermissionsRole] = useState(null);
  const [allPermissionsForSelect, setAllPermissionsForSelect] = useState([]);
  const [addPermissionId, setAddPermissionId] = useState('');

  const [roleForm, setRoleForm] = useState({ name: '', description: '' });
  const [permissionForm, setPermissionForm] = useState({ name: '', description: '', resource: '', action: '' });
  const [employeeForm, setEmployeeForm] = useState({ email: '', password: '', firstName: '', lastName: '', role: 'SUPPORT_ADMIN', roleIds: [] });
  const [assignUserId, setAssignUserId] = useState('');
  const [assignRoleId, setAssignRoleId] = useState('');
  const [selectedUserRoles, setSelectedUserRoles] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'roles') {
        const response = await rbacAPI.getAllRoles();
        const data = response?.data ?? response;
        setRoles(Array.isArray(data) ? data : []);
      } else if (activeTab === 'permissions') {
        const response = await rbacAPI.getAllPermissions();
        const data = response?.data ?? response;
        setPermissions(Array.isArray(data) ? data : []);
      } else if (activeTab === 'users') {
        const [rolesRes, usersRes] = await Promise.all([rbacAPI.getAllRoles(), adminAPI.getUsers({ limit: 200 })]);
        const rolesData = rolesRes?.data ?? rolesRes;
        const usersData = usersRes?.data ?? usersRes;
        setRoles(Array.isArray(rolesData) ? rolesData : []);
        setUsers(Array.isArray(usersData?.users) ? usersData.users : []);
      } else if (activeTab === 'employees') {
        const usersRes = await adminAPI.getUsers({ limit: 500 });
        const usersData = usersRes?.data ?? usersRes;
        const allUsers = Array.isArray(usersData?.users) ? usersData.users : [];
        const employeesOnly = allUsers.filter((u) => !['STUDENT', 'TEACHER'].includes(u.role));
        setUsers(employeesOnly);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error(error.response?.data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    if (!roleForm.name?.trim()) return;
    setActionLoading(true);
    try {
      await rbacAPI.createRole({ name: roleForm.name.trim(), description: roleForm.description?.trim() || undefined });
      toast.success(t('rbac.roleCreated') || 'Role created');
      setCreateRoleOpen(false);
      setRoleForm({ name: '', description: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.error'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    if (!editRole || !roleForm.name?.trim()) return;
    setActionLoading(true);
    try {
      await rbacAPI.updateRole(editRole.id, { name: roleForm.name.trim(), description: roleForm.description?.trim() || undefined });
      toast.success(t('rbac.roleUpdated') || 'Role updated');
      setEditRole(null);
      setRoleForm({ name: '', description: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.error'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!deleteRole) return;
    setActionLoading(true);
    try {
      await rbacAPI.deleteRole(deleteRole.id);
      toast.success(t('rbac.roleDeleted') || 'Role deleted');
      setDeleteRole(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.error'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreatePermission = async (e) => {
    e.preventDefault();
    if (!permissionForm.name?.trim() || !permissionForm.resource?.trim() || !permissionForm.action?.trim()) return;
    setActionLoading(true);
    try {
      await rbacAPI.createPermission({
        name: permissionForm.name.trim(),
        description: permissionForm.description?.trim() || undefined,
        resource: permissionForm.resource.trim(),
        action: permissionForm.action.trim(),
      });
      toast.success(t('rbac.permissionCreated') || 'Permission created');
      setCreatePermissionOpen(false);
      setPermissionForm({ name: '', description: '', resource: '', action: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.error'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdatePermission = async (e) => {
    e.preventDefault();
    if (!editPermission || !permissionForm.name?.trim() || !permissionForm.resource?.trim() || !permissionForm.action?.trim()) return;
    setActionLoading(true);
    try {
      await rbacAPI.updatePermission(editPermission.id, {
        name: permissionForm.name.trim(),
        description: permissionForm.description?.trim() || undefined,
        resource: permissionForm.resource.trim(),
        action: permissionForm.action.trim(),
      });
      toast.success(t('rbac.permissionUpdated') || 'Permission updated');
      setEditPermission(null);
      setPermissionForm({ name: '', description: '', resource: '', action: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.error'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePermission = async () => {
    if (!deletePermission) return;
    setActionLoading(true);
    try {
      await rbacAPI.deletePermission(deletePermission.id);
      toast.success(t('rbac.permissionDeleted') || 'Permission deleted');
      setDeletePermission(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.error'));
    } finally {
      setActionLoading(false);
    }
  };

  const openEditRole = (role) => {
    setEditRole(role);
    setRoleForm({ name: role.name || '', description: role.description || '' });
  };

  const openEditPermission = (permission) => {
    setEditPermission(permission);
    setPermissionForm({
      name: permission.name || '',
      description: permission.description || '',
      resource: permission.resource || '',
      action: permission.action || '',
    });
  };

  const openManagePermissions = async (role) => {
    setManagePermissionsRole(role);
    setAddPermissionId('');
    try {
      const res = await rbacAPI.getAllPermissions();
      const data = res?.data ?? res;
      setAllPermissionsForSelect(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error(e.response?.data?.message || t('common.error'));
    }
  };

  const handleAssignPermission = async () => {
    if (!managePermissionsRole || !addPermissionId) return;
    setActionLoading(true);
    try {
      await rbacAPI.assignPermission({ roleId: managePermissionsRole.id, permissionId: addPermissionId });
      toast.success(t('rbac.permissionAssigned') || 'Permission assigned');
      setAddPermissionId('');
      const res = await rbacAPI.getAllRoles();
      const data = res?.data ?? res;
      const list = Array.isArray(data) ? data : [];
      setRoles(list);
      const updated = list.find((r) => r.id === managePermissionsRole.id);
      if (updated) setManagePermissionsRole(updated);
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.error'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemovePermissionFromRole = async (permissionId) => {
    if (!managePermissionsRole) return;
    setActionLoading(true);
    try {
      await rbacAPI.removePermission(managePermissionsRole.id, permissionId);
      toast.success(t('rbac.permissionRemoved') || 'Permission removed');
      const res = await rbacAPI.getAllRoles();
      const data = res?.data ?? res;
      const list = Array.isArray(data) ? data : [];
      setRoles(list);
      const updated = list.find((r) => r.id === managePermissionsRole.id);
      if (updated) setManagePermissionsRole(updated);
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.error'));
    } finally {
      setActionLoading(false);
    }
  };

  const roleAssignedPermissionIds = (managePermissionsRole?.permissions || []).map((rp) => rp.permission?.id ?? rp.permissionId).filter(Boolean);
  const permissionsAvailableToAdd = allPermissionsForSelect.filter((p) => !roleAssignedPermissionIds.includes(p.id));

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    if (!employeeForm.email?.trim() || !employeeForm.password?.trim()) return;
    setActionLoading(true);
    try {
      await adminAPI.createUser({
        email: employeeForm.email.trim(),
        password: employeeForm.password,
        firstName: employeeForm.firstName?.trim() || '',
        lastName: employeeForm.lastName?.trim() || '',
        role: employeeForm.role,
        roleIds: employeeForm.roleIds,
      });
      toast.success(t('rbac.employeeCreated') || 'Employee created');
      setEmployeeForm({ email: '', password: '', firstName: '', lastName: '', role: 'SUPPORT_ADMIN', roleIds: [] });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.error'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignRoleToUser = async () => {
    if (!assignUserId || !assignRoleId) return;
    setActionLoading(true);
    try {
      await rbacAPI.assignRole({ userId: assignUserId, roleId: assignRoleId });
      toast.success(t('rbac.roleAssigned') || 'Role assigned');
      setAssignRoleId('');
      if (selectedUserRoles?.userId === assignUserId) {
        const res = await rbacAPI.getUserRoles(assignUserId);
        const data = res?.data ?? res;
        setSelectedUserRoles({ userId: assignUserId, roles: Array.isArray(data) ? data : [] });
      }
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.error'));
    } finally {
      setActionLoading(false);
    }
  };

  const loadUserRoles = async (userId) => {
    try {
      const res = await rbacAPI.getUserRoles(userId);
      const data = res?.data ?? res;
      setSelectedUserRoles({ userId, roles: Array.isArray(data) ? data : [] });
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.error'));
    }
  };

  const handleRemoveRoleFromUser = async (userId, roleId) => {
    setActionLoading(true);
    try {
      await rbacAPI.removeRole(userId, roleId);
      toast.success(t('rbac.roleRemoved') || 'Role removed');
      loadUserRoles(userId);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.error'));
    } finally {
      setActionLoading(false);
    }
  };

  const toggleEmployeeRoleId = (roleId) => {
    setEmployeeForm((p) => ({
      ...p,
      roleIds: p.roleIds.includes(roleId) ? p.roleIds.filter((id) => id !== roleId) : [...p.roleIds, roleId],
    }));
  };

  const data = activeTab === 'roles' ? roles : permissions;

  return (
    <div className="space-y-4 sm:space-y-5 lg:space-y-6 2xl:space-y-5" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">{t('rbac.title') || 'Roles & Permissions'}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{t('rbac.subtitle') || 'Manage user roles and permissions'}</p>
        </div>
        {(activeTab !== 'users' && activeTab !== 'employees') && (
          <Button
            className="shrink-0"
            onClick={() => (activeTab === 'roles' ? (setCreateRoleOpen(true), setRoleForm({ name: '', description: '' })) : (setCreatePermissionOpen(true), setPermissionForm({ name: '', description: '', resource: '', action: '' })))}
          >
            <FiPlus className="size-4" />
            {t('rbac.create') || 'Create'} {activeTab === 'roles' ? (t('rbac.role') || 'Role') : (t('rbac.permission') || 'Permission')}
          </Button>
        )}
      </div>

      <div className="flex gap-1 p-1 rounded-lg bg-muted w-fit flex-wrap">
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
        <button
          onClick={() => setActiveTab('users')}
          className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2', activeTab === 'users' ? 'bg-card text-foreground shadow-tarteel-sm' : 'text-muted-foreground hover:text-foreground')}
        >
          <FiUsers className="size-4" />
          {t('rbac.usersAndRoles') || 'Users & Roles'}
        </button>
        <button
          onClick={() => setActiveTab('employees')}
          className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2', activeTab === 'employees' ? 'bg-card text-foreground shadow-tarteel-sm' : 'text-muted-foreground hover:text-foreground')}
        >
          <FiUser className="size-4" />
          {t('rbac.employees') || 'Employees'}
        </button>
      </div>

      {activeTab === 'employees' ? (
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            ) : users.length === 0 ? (
              <div className="py-16 text-center">
                <FiUser className="size-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-lg font-semibold text-foreground mb-1">{t('rbac.noEmployees') || 'No employees'}</h2>
                <p className="text-sm text-muted-foreground">{t('rbac.addFromUsersTab') || 'Add employees from the Users & Roles tab.'}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('rbac.employeeName') || 'Name'}</th>
                      <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('rbac.email') || 'Email'}</th>
                      <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('rbac.userRole') || 'Role'}</th>
                      <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('common.status') || 'Status'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {users.map((u) => (
                      <tr key={u.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-medium">
                              {(u.firstName?.charAt(0) || u.email?.charAt(0) || '?').toUpperCase()}
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">{[u.firstName, u.lastName].filter(Boolean).join(' ') || '—'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{u.email}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">{u.role || '—'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', u.status === 'ACTIVE' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300')}>{u.status || '—'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      ) : activeTab === 'users' ? (
        <div className="space-y-6">
          {isSuperAdmin && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FiUserPlus className="size-5" />
                  {t('rbac.createEmployee') || 'Create employee'}
                </h3>
                <form onSubmit={handleCreateEmployee} className="space-y-4 max-w-xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">{t('rbac.email') || 'Email'}</label>
                      <input type="email" value={employeeForm.email} onChange={(e) => setEmployeeForm((p) => ({ ...p, email: e.target.value }))} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">{t('rbac.password') || 'Password'}</label>
                      <input type="password" value={employeeForm.password} onChange={(e) => setEmployeeForm((p) => ({ ...p, password: e.target.value }))} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" required minLength={6} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">{t('rbac.firstName') || 'First name'}</label>
                      <input type="text" value={employeeForm.firstName} onChange={(e) => setEmployeeForm((p) => ({ ...p, firstName: e.target.value }))} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">{t('rbac.lastName') || 'Last name'}</label>
                      <input type="text" value={employeeForm.lastName} onChange={(e) => setEmployeeForm((p) => ({ ...p, lastName: e.target.value }))} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('rbac.userRole') || 'User role (type)'}</label>
                    <select value={employeeForm.role} onChange={(e) => setEmployeeForm((p) => ({ ...p, role: e.target.value }))} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                      {USER_ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('rbac.assignRoles') || 'Assign RBAC roles (permissions)'}</label>
                    <div className="flex flex-wrap gap-2">
                      {roles.map((role) => (
                        <label key={role.id} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <input type="checkbox" checked={employeeForm.roleIds.includes(role.id)} onChange={() => toggleEmployeeRoleId(role.id)} className="rounded" />
                          <span className="text-sm">{role.name}</span>
                        </label>
                      ))}
                      {roles.length === 0 && <span className="text-sm text-gray-500">{t('rbac.noRolesToAssign') || 'No roles defined yet.'}</span>}
                    </div>
                  </div>
                  <Button type="submit" disabled={actionLoading}>{actionLoading ? (t('common.loading') || '...') : (t('rbac.createEmployee') || 'Create employee')}</Button>
                </form>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FiSettings className="size-5" />
                {t('rbac.assignRoleToUser') || 'Assign role to user'}
              </h3>
              {loading ? (
                <Skeleton className="h-20 w-full" />
              ) : (
                <div className="space-y-4 max-w-xl">
                  <div className="flex flex-wrap gap-2 items-end">
                    <div className="min-w-[180px] flex-1">
                      <label className="block text-sm font-medium mb-1">{t('rbac.user') || 'User'}</label>
                      <select value={assignUserId} onChange={(e) => { setAssignUserId(e.target.value); setSelectedUserRoles(null); if (e.target.value) loadUserRoles(e.target.value); }} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                        <option value="">— {t('rbac.selectUser') || 'Select'} —</option>
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>{[u.firstName, u.lastName].filter(Boolean).join(' ') || u.email} ({u.email})</option>
                        ))}
                      </select>
                    </div>
                    <div className="min-w-[180px] flex-1">
                      <label className="block text-sm font-medium mb-1">{t('rbac.role') || 'Role'}</label>
                      <select value={assignRoleId} onChange={(e) => setAssignRoleId(e.target.value)} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                        <option value="">— {t('rbac.selectRole') || 'Select'} —</option>
                        {roles.map((r) => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </select>
                    </div>
                    <Button onClick={handleAssignRoleToUser} disabled={!assignUserId || !assignRoleId || actionLoading}>
                      <FiPlus className="size-4" />
                      {t('rbac.assign') || 'Assign'}
                    </Button>
                  </div>
                  {selectedUserRoles && (
                    <div>
                      <label className="block text-sm font-medium mb-2">{t('rbac.userCurrentRoles') || 'Current roles for this user'}</label>
                      <ul className="space-y-1.5">
                        {selectedUserRoles.roles.length === 0 ? (
                          <li className="text-sm text-gray-500 py-2">{t('rbac.noRolesAssigned') || 'No roles assigned.'}</li>
                        ) : (
                          selectedUserRoles.roles.map((ur) => (
                            <li key={ur.id || ur.role?.id} className="flex items-center justify-between gap-2 py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                              <span className="text-sm font-medium">{ur.role?.name || ur.roleId}</span>
                              <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0" onClick={() => handleRemoveRoleFromUser(selectedUserRoles.userId, ur.role?.id || ur.roleId)} disabled={actionLoading}>
                                <FiTrash2 className="size-4" />
                              </Button>
                            </li>
                          ))
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{role.permissions?.length ?? 0} permissions</td>
                    <td className="px-6 py-4 text-end">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" className="text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" onClick={() => openManagePermissions(role)} disabled={actionLoading} title={t('rbac.managePermissions') || 'Manage permissions'}>
                          <FiSettings className="size-4" />
                          <span className="ml-1 hidden sm:inline">{t('rbac.permissions') || 'Permissions'}</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20" onClick={() => openEditRole(role)} disabled={actionLoading}><FiEdit className="size-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => setDeleteRole(role)} disabled={actionLoading}><FiTrash2 className="size-4" /></Button>
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
                        <Button variant="ghost" size="icon" className="text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20" onClick={() => openEditPermission(permission)} disabled={actionLoading}><FiEdit className="size-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => setDeletePermission(permission)} disabled={actionLoading}><FiTrash2 className="size-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      )}

      {/* Create Role Modal */}
      {createRoleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => !actionLoading && setCreateRoleOpen(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">{t('rbac.create') || 'Create'} {t('rbac.role') || 'Role'}</h3>
            <form onSubmit={handleCreateRole} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('rbac.roleName') || 'Name'}</label>
                <input type="text" value={roleForm.name} onChange={(e) => setRoleForm((p) => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('rbac.description') || 'Description'}</label>
                <input type="text" value={roleForm.description} onChange={(e) => setRoleForm((p) => ({ ...p, description: e.target.value }))} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setCreateRoleOpen(false)} disabled={actionLoading}>{t('common.cancel') || 'Cancel'}</Button>
                <Button type="submit" disabled={actionLoading}>{actionLoading ? (t('common.loading') || '...') : (t('rbac.create') || 'Create')}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {editRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => !actionLoading && setEditRole(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">{t('common.edit') || 'Edit'} {t('rbac.role') || 'Role'}</h3>
            <form onSubmit={handleUpdateRole} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('rbac.roleName') || 'Name'}</label>
                <input type="text" value={roleForm.name} onChange={(e) => setRoleForm((p) => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('rbac.description') || 'Description'}</label>
                <input type="text" value={roleForm.description} onChange={(e) => setRoleForm((p) => ({ ...p, description: e.target.value }))} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setEditRole(null)} disabled={actionLoading}>{t('common.cancel') || 'Cancel'}</Button>
                <Button type="submit" disabled={actionLoading}>{actionLoading ? (t('common.loading') || '...') : (t('common.save') || 'Save')}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Role Confirm */}
      {deleteRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => !actionLoading && setDeleteRole(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <p className="text-gray-700 dark:text-gray-300 mb-4">{t('rbac.deleteRoleConfirm') || 'Delete this role?'} <strong>{deleteRole.name}</strong></p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeleteRole(null)} disabled={actionLoading}>{t('common.cancel') || 'Cancel'}</Button>
              <Button variant="destructive" onClick={handleDeleteRole} disabled={actionLoading}>{actionLoading ? (t('common.loading') || '...') : (t('common.delete') || 'Delete')}</Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Permission Modal */}
      {createPermissionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => !actionLoading && setCreatePermissionOpen(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">{t('rbac.create') || 'Create'} {t('rbac.permission') || 'Permission'}</h3>
            <form onSubmit={handleCreatePermission} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('rbac.permissionName') || 'Name'}</label>
                <input type="text" value={permissionForm.name} onChange={(e) => setPermissionForm((p) => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" placeholder="MANAGE_USERS" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('rbac.resource') || 'Resource'}</label>
                <input type="text" value={permissionForm.resource} onChange={(e) => setPermissionForm((p) => ({ ...p, resource: e.target.value }))} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" placeholder="users" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('rbac.action') || 'Action'}</label>
                <input type="text" value={permissionForm.action} onChange={(e) => setPermissionForm((p) => ({ ...p, action: e.target.value }))} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" placeholder="manage" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('rbac.description') || 'Description'}</label>
                <input type="text" value={permissionForm.description} onChange={(e) => setPermissionForm((p) => ({ ...p, description: e.target.value }))} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setCreatePermissionOpen(false)} disabled={actionLoading}>{t('common.cancel') || 'Cancel'}</Button>
                <Button type="submit" disabled={actionLoading}>{actionLoading ? (t('common.loading') || '...') : (t('rbac.create') || 'Create')}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Permission Modal */}
      {editPermission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => !actionLoading && setEditPermission(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">{t('common.edit') || 'Edit'} {t('rbac.permission') || 'Permission'}</h3>
            <form onSubmit={handleUpdatePermission} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('rbac.permissionName') || 'Name'}</label>
                <input type="text" value={permissionForm.name} onChange={(e) => setPermissionForm((p) => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('rbac.resource') || 'Resource'}</label>
                <input type="text" value={permissionForm.resource} onChange={(e) => setPermissionForm((p) => ({ ...p, resource: e.target.value }))} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('rbac.action') || 'Action'}</label>
                <input type="text" value={permissionForm.action} onChange={(e) => setPermissionForm((p) => ({ ...p, action: e.target.value }))} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('rbac.description') || 'Description'}</label>
                <input type="text" value={permissionForm.description} onChange={(e) => setPermissionForm((p) => ({ ...p, description: e.target.value }))} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setEditPermission(null)} disabled={actionLoading}>{t('common.cancel') || 'Cancel'}</Button>
                <Button type="submit" disabled={actionLoading}>{actionLoading ? (t('common.loading') || '...') : (t('common.save') || 'Save')}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Permission Confirm */}
      {deletePermission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => !actionLoading && setDeletePermission(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <p className="text-gray-700 dark:text-gray-300 mb-4">{t('rbac.deletePermissionConfirm') || 'Delete this permission?'} <strong>{deletePermission.name}</strong></p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeletePermission(null)} disabled={actionLoading}>{t('common.cancel') || 'Cancel'}</Button>
              <Button variant="destructive" onClick={handleDeletePermission} disabled={actionLoading}>{actionLoading ? (t('common.loading') || '...') : (t('common.delete') || 'Delete')}</Button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Permissions for Role */}
      {managePermissionsRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => !actionLoading && setManagePermissionsRole(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('rbac.managePermissions') || 'Manage permissions'} — {managePermissionsRole.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{t('rbac.assignOrRemove') || 'Add or remove permissions for this role.'}</p>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('rbac.addPermission') || 'Add permission'}</label>
                  <div className="flex gap-2">
                    <select
                      value={addPermissionId}
                      onChange={(e) => setAddPermissionId(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    >
                      <option value="">— {t('rbac.selectPermission') || 'Select'} —</option>
                      {permissionsAvailableToAdd.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}{p.description ? ` — ${p.description}` : ''}</option>
                      ))}
                    </select>
                    <Button onClick={handleAssignPermission} disabled={!addPermissionId || actionLoading} size="sm">
                      <FiPlus className="size-4" />
                    </Button>
                  </div>
                  {permissionsAvailableToAdd.length === 0 && allPermissionsForSelect.length > 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('rbac.allAssigned') || 'All permissions are already assigned.'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('rbac.assignedPermissions') || 'Assigned permissions'}</label>
                  <ul className="space-y-1.5">
                    {(managePermissionsRole.permissions || []).length === 0 ? (
                      <li className="text-sm text-gray-500 dark:text-gray-400 py-2">{t('rbac.noPermissionsAssigned') || 'No permissions assigned yet.'}</li>
                    ) : (
                      (managePermissionsRole.permissions || []).map((rp) => {
                        const perm = rp.permission || { id: rp.permissionId, name: rp.permissionId };
                        return (
                          <li key={rp.id || perm.id} className="flex items-center justify-between gap-2 py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{perm.name}</span>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0" onClick={() => handleRemovePermissionFromRole(perm.id)} disabled={actionLoading}>
                              <FiTrash2 className="size-4" />
                            </Button>
                          </li>
                        );
                      })
                    )}
                  </ul>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <Button variant="outline" onClick={() => setManagePermissionsRole(null)} disabled={actionLoading}>{t('common.close') || 'Close'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RBAC;
