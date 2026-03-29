import { PERMISSIONS } from './rolesAndPermissions';

/**
 * ربط المسارات بالصلاحيات المطلوبة (صلاحية واحدة تكفي)
 * Empty array = أي مستخدم مسجل يستطيع الدخول
 */
export const routePermissions = {
  '/dashboard': [PERMISSIONS.VIEW_DASHBOARD],
  '/users': [PERMISSIONS.MANAGE_USERS],
  '/teachers': [PERMISSIONS.MANAGE_USERS],
  '/bookings': [PERMISSIONS.MANAGE_BOOKINGS],
  '/course-enrollments': [PERMISSIONS.MANAGE_COURSES],
  '/payments': [PERMISSIONS.MANAGE_BOOKINGS, PERMISSIONS.VIEW_REPORTS],
  '/wallets': [PERMISSIONS.MANAGE_BOOKINGS, PERMISSIONS.VIEW_REPORTS],
  '/subscriptions': [PERMISSIONS.MANAGE_BOOKINGS],
  '/courses': [PERMISSIONS.MANAGE_COURSES],
  '/content': [PERMISSIONS.MANAGE_COURSES],
  '/notifications': [PERMISSIONS.MANAGE_NOTIFICATIONS],
  '/rbac': [], // فقط SUPER_ADMIN (التحكم من السايدبار حسب الدور)
  '/sessions': [PERMISSIONS.MANAGE_BOOKINGS],
  '/finance': [PERMISSIONS.VIEW_REPORTS],
  '/student-subscriptions': [PERMISSIONS.MANAGE_BOOKINGS],
  '/reviews': [PERMISSIONS.MANAGE_REVIEWS],
  '/reports': [PERMISSIONS.VIEW_REPORTS],
  '/activity': [PERMISSIONS.VIEW_REPORTS],
  '/settings': [],
  '/profile': [],
  '/unauthorized': [],
};

/**
 * الصلاحية المطلوبة لعرض رابط في السايدبار (كل رابط → صلاحية واحدة)
 */
export const sidebarPermission = {
  '/dashboard': PERMISSIONS.VIEW_DASHBOARD,
  '/users': PERMISSIONS.MANAGE_USERS,
  '/teachers': PERMISSIONS.MANAGE_USERS,
  '/bookings': PERMISSIONS.MANAGE_BOOKINGS,
  '/course-enrollments': PERMISSIONS.MANAGE_COURSES,
  '/payments': PERMISSIONS.VIEW_REPORTS,
  '/wallets': PERMISSIONS.VIEW_REPORTS,
  '/subscriptions': PERMISSIONS.MANAGE_BOOKINGS,
  '/courses': PERMISSIONS.MANAGE_COURSES,
  '/content': PERMISSIONS.MANAGE_COURSES,
  '/notifications': PERMISSIONS.MANAGE_NOTIFICATIONS,
  '/rbac': null,
  '/sessions': PERMISSIONS.MANAGE_BOOKINGS,
  '/finance': PERMISSIONS.VIEW_REPORTS,
  '/student-subscriptions': PERMISSIONS.MANAGE_BOOKINGS,
  '/reviews': PERMISSIONS.MANAGE_REVIEWS,
  '/reports': PERMISSIONS.VIEW_REPORTS,
  '/activity': PERMISSIONS.VIEW_REPORTS,
  '/settings': null,
  '/profile': null,
};

export function getPermissionsForPath(path) {
  if (!path) return [];
  const exact = routePermissions[path];
  if (exact) return exact;
  for (const [prefix, perms] of Object.entries(routePermissions)) {
    if (prefix !== '/' && path.startsWith(prefix)) return perms;
  }
  return [];
}

export function canAccessPath(permissions, path) {
  if (!permissions || !Array.isArray(permissions)) return true;
  if (permissions.includes('*')) return true;
  const required = getPermissionsForPath(path);
  if (required.length === 0) return true;
  return required.some((p) => permissions.includes(p));
}

/**
 * يتحقق إذا يظهر رابط المسار في السايدبار
 * null = يظهر لكل مستخدم مسجل
 */
export function canShowSidebarLink(permissions, path) {
  if (!permissions || !Array.isArray(permissions)) return true;
  if (permissions.includes('*')) return true;
  const perm = sidebarPermission[path];
  if (perm == null) return true;
  return permissions.includes(perm);
}

/** مسارات تظهر فقط لـ SUPER_ADMIN (مثل RBAC) */
export const SUPER_ADMIN_ONLY_PATHS = ['/rbac'];
