/**
 * أدوار ثابتة في النظام (الـ DB يستخدم TEACHER = شيخ، SUPPORT_ADMIN = دعم)
 * Fixed roles: only SUPER_ADMIN can create roles, permissions, and assign permissions.
 */
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  SHEIKH: 'TEACHER',
  STUDENT: 'STUDENT',
  SUPPORT: 'SUPPORT_ADMIN',
};

export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'مدير أعلى',
  [ROLES.ADMIN]: 'مدير',
  [ROLES.SHEIKH]: 'شيخ',
  [ROLES.STUDENT]: 'طالب',
  [ROLES.SUPPORT]: 'دعم فني',
};

/**
 * صلاحيات ديناميكية (توجد في الـ DB ويمكن تعيينها للأدوار)
 */
export const PERMISSIONS = {
  VIEW_DASHBOARD: 'VIEW_DASHBOARD',
  MANAGE_USERS: 'MANAGE_USERS',
  MANAGE_BOOKINGS: 'MANAGE_BOOKINGS',
  MANAGE_COURSES: 'MANAGE_COURSES',
  MANAGE_REVIEWS: 'MANAGE_REVIEWS',
  MANAGE_NOTIFICATIONS: 'MANAGE_NOTIFICATIONS',
  VIEW_REPORTS: 'VIEW_REPORTS',
};

export const PERMISSION_LABELS = {
  [PERMISSIONS.VIEW_DASHBOARD]: 'عرض لوحة التحكم',
  [PERMISSIONS.MANAGE_USERS]: 'إدارة المستخدمين',
  [PERMISSIONS.MANAGE_BOOKINGS]: 'إدارة الحجوزات',
  [PERMISSIONS.MANAGE_COURSES]: 'إدارة الدورات',
  [PERMISSIONS.MANAGE_REVIEWS]: 'إدارة التقييمات',
  [PERMISSIONS.MANAGE_NOTIFICATIONS]: 'إدارة الإشعارات',
  [PERMISSIONS.VIEW_REPORTS]: 'عرض التقارير',
};

/**
 * تحقق إذا المستخدم عنده الصلاحية (بما فيها * = كل الصلاحيات)
 */
export function hasPermission(permissions, permissionName) {
  if (!permissions || !Array.isArray(permissions)) return false;
  if (permissions.includes('*')) return true;
  return permissions.includes(permissionName);
}
