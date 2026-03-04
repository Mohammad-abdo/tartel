import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FiHome,
  FiUser,
  FiUsers,
  FiUserCheck,
  FiCalendar,
  FiDollarSign,
  FiBarChart2,
  FiSettings,
  FiLogOut,
  FiCreditCard,
  FiBox,
  FiBell,
  FiBook,
  FiFile,
  FiShield,
  FiStar,
  FiVideo,
  FiTrendingUp,
  FiPieChart,
  FiChevronLeft,
  FiChevronRight,
  FiZap,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useCurrency } from '../../context/CurrencyContext';
import { canShowSidebarLink, SUPER_ADMIN_ONLY_PATHS } from '../../config/routePermissions';
import { cn } from '../../lib/utils';

const SIDEBAR_WIDTH_EXPANDED = 256; /* w-64 */
const SIDEBAR_WIDTH_COLLAPSED = 80; /* w-20 */

const Sidebar = ({ collapsed, onToggleCollapse }) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { sidebar } = useCurrency();
  const isRTL = language === 'ar';
  const location = useLocation();
  const { logout, user } = useAuth();
  const logoUrl = sidebar?.logoUrl || '/admin-logo.svg';
  const title = language === 'ar' ? (sidebar?.titleAr || 'ترتيل') : (sidebar?.titleEn || 'Tarteel');
  const subtitle = language === 'ar' ? (sidebar?.subtitleAr || 'منصة حفظ القرآن') : (sidebar?.subtitleEn || 'Quran memorization platform');
  const permissions = user?.permissions ?? [];

  const allMenuItems = [
    { path: '/dashboard', icon: FiHome, label: t('sidebar.dashboard') },
    { path: '/profile', icon: FiUser, label: t('sidebar.profile') },
    { path: '/users', icon: FiUsers, label: t('sidebar.students') },
    { path: '/teachers', icon: FiUserCheck, label: t('sidebar.teachers') },
    { path: '/bookings', icon: FiCalendar, label: t('sidebar.bookings') },
    { path: '/sessions', icon: FiVideo, label: t('sidebar.sessions') },
    { path: '/payments', icon: FiDollarSign, label: t('sidebar.payments') },
    { path: '/fawry-test', icon: FiZap, label: language === 'ar' ? 'تجربة فوري' : 'Fawry test' },
    { path: '/agora-test-host', icon: FiVideo, label: language === 'ar' ? 'تجربة أجورا — شيخ' : 'Agora test — Sheikh' },
    { path: '/agora-test-join', icon: FiVideo, label: language === 'ar' ? 'تجربة أجورا — طالب' : 'Agora test — Student' },
    { path: '/finance', icon: FiTrendingUp, label: t('sidebar.finance') },
    { path: '/wallets', icon: FiCreditCard, label: t('sidebar.wallets') },
    // { path: '/subscriptions', icon: FiBox, label: t('sidebar.subscriptions') },
    { path: '/student-subscriptions', icon: FiBox, label: t('sidebar.packages') },
    { path: '/courses', icon: FiBook, label: t('sidebar.courses') },
    { path: '/content', icon: FiFile, label: t('sidebar.content') },
    { path: '/reviews', icon: FiStar, label: t('sidebar.reviews') },
    { path: '/notifications', icon: FiBell, label: t('sidebar.notifications') },
    { path: '/rbac', icon: FiShield, label: t('sidebar.rbac') },
    { path: '/reports', icon: FiBarChart2, label: t('sidebar.reports') },
    { path: '/activity', icon: FiPieChart, label: t('sidebar.activity') },
    { path: '/settings', icon: FiSettings, label: t('sidebar.settings') },
  ];

  const menuItems = allMenuItems.filter((item) => {
    if (SUPER_ADMIN_ONLY_PATHS.includes(item.path)) return user?.role === 'SUPER_ADMIN';
    return canShowSidebarLink(permissions, item.path);
  });

  const width = collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;

  return (
    <aside
      className={cn(
        'fixed top-0 z-40 flex h-screen flex-col overflow-hidden border border-gray-200 bg-white shadow-2xl transition-[width] duration-200 ease-out dark:border-gray-700 dark:bg-gray-800',
        isRTL ? 'right-0 border-r-0 border-l' : 'left-0 border-l-0 border-r'
      )}
      style={{ width: `${width}px` }}
      aria-label={t('sidebar.navigation') || 'Main navigation'}
    >
      {/* Logo bar — Islamic green gradient with custom logo */}
      <div
        className={cn(
          'flex h-14 shrink-0 items-center border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-emerald-600 to-emerald-700 px-3 islamic-pattern',
          collapsed ? 'justify-center' : 'justify-between'
        )}
      >
        {!collapsed ? (
          <div className="flex min-w-0 flex-1 items-center gap-3 px-2 overflow-hidden">
            <div className="flex shrink-0 items-center justify-center w-8 h-8 bg-white/10 rounded-lg overflow-hidden">
              <img
                src={logoUrl}
                alt={title}
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  e.currentTarget.src = '/admin-logo.svg';
                }}
              />
            </div>
            <div className="flex flex-col min-w-0 overflow-hidden">
              <span className="text-lg font-bold tracking-tight text-white arabic-text truncate" dir="rtl" style={{ textShadow: '0 0 8px rgba(0,0,0,0.3)' }}>{title}</span>
              <span className="text-xs font-medium text-white/90 truncate" style={{ textShadow: '0 0 6px rgba(0,0,0,0.25)' }}>{subtitle}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center w-8 h-8 bg-white/10 rounded-lg overflow-hidden shrink-0">
            <img
              src={logoUrl}
              alt={title}
              className="w-7 h-7 object-contain"
              onError={(e) => {
                e.currentTarget.src = '/admin-logo.svg';
              }}
            />
          </div>
        )}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="flex size-9 shrink-0 items-center justify-center rounded-xl text-white/90 transition-all duration-200 hover:bg-white/20 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label={collapsed ? t('sidebar.expand') || 'Expand sidebar' : t('sidebar.collapse') || 'Collapse sidebar'}
        >
          {isRTL ? (
            collapsed ? <FiChevronLeft className="size-5" /> : <FiChevronRight className="size-5" />
          ) : (
            collapsed ? <FiChevronRight className="size-5" /> : <FiChevronLeft className="size-5" />
          )}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3" aria-label={t('sidebar.navigation') || 'Main navigation'}>
        <ul className="space-y-0.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 arabic-text',
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-emerald-100 shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-500/30'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-700 dark:hover:text-emerald-300'
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="size-5 shrink-0" aria-hidden />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User & Logout */}
      <div className="shrink-0 space-y-2 border-t border-gray-200 dark:border-gray-700 p-3">
        {!collapsed && (
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-700 bg-gradient-to-r from-emerald-50 to-amber-50 dark:from-emerald-900/30 dark:to-amber-900/30 px-3 py-2.5">
            <p className="truncate text-sm font-medium text-emerald-900 dark:text-emerald-100 arabic-text">{user?.name || user?.email}</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 arabic-text">{t('sidebar.administrator')}</p>
          </div>
        )}
        <button
          type="button"
          onClick={logout}
          className={cn(
            'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 arabic-text',
            collapsed && 'justify-center'
          )}
          title={collapsed ? t('sidebar.logout') : undefined}
        >
          <FiLogOut className="size-5 shrink-0" aria-hidden />
          {!collapsed && <span>{t('sidebar.logout')}</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
