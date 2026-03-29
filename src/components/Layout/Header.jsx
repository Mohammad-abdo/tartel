import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { notificationAPI } from '../../services/api';
import { useAdminInbox } from '../../context/AdminInboxContext';
import { FiBell, FiSearch, FiUser, FiSettings, FiLogOut, FiChevronDown, FiGlobe, FiSun, FiMoon } from 'react-icons/fi';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import {
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu';

const Header = () => {
  const { t } = useTranslation();
  const { language, changeLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const isRTL = language === 'ar';
  const { unreadCount, refreshUnreadCount, adjustUnreadOptimistic } = useAdminInbox();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const getNotificationRoute = (n) => {
    const id = n.relatedId;
    switch (n.type) {
      case 'BOOKING_CONFIRMED':
      case 'BOOKING_CANCELLED':
      case 'BOOKING_REJECTED':
      case 'BOOKING_REQUEST':
      case 'SESSION_REMINDER':
        return id ? `/bookings/${id}` : '/bookings';
      case 'TEACHER_APPROVED':
        return id ? `/teachers/${id}` : '/teachers';
      case 'COURSE_CREATED':
        return id ? `/courses/${id}` : '/courses';
      case 'PAYMENT_RECEIVED':
      case 'PAYMENT_FAILED':
        return '/bookings';
      case 'REVIEW_RECEIVED':
        return id ? `/teachers/${id}` : '/teachers';
      default:
        return '/notifications';
    }
  };

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const response = await notificationAPI.getNotifications({ limit: 20 });
      const data = response?.data ?? response;
      const list = Array.isArray(data) ? data : [];
      setNotifications(list);
      await refreshUnreadCount();
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setNotifications([]);
    }
  };

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const response = await notificationAPI.getNotifications({ limit: 20 });
        const data = response?.data ?? response;
        const list = Array.isArray(data) ? data : [];
        if (!cancelled) setNotifications(list);
        await refreshUnreadCount();
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to fetch notifications:', error);
          setNotifications([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, refreshUnreadCount]);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      adjustUnreadOptimistic(-1);
      refreshUnreadCount();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      await refreshUnreadCount();
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  const handleLogout = () => {
    setUserMenuOpen(false);
    logout();
    navigate('/login');
  };

  const displayName = user?.name || user?.email || 'Admin';
  const initial = (user?.name?.charAt(0) || user?.email?.charAt(0) || 'A').toUpperCase();

  return (
    <header
      className={cn(
        'sticky top-0 z-20 flex h-14 shrink-0 items-center border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:h-16',
        'px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 3xl:px-16'
      )}
      role="banner"
    >
      <div className={cn(
        'flex w-full max-w-full min-w-0 items-center gap-3 2xl:gap-4 xl:mx-auto xl:max-w-content 2xl:max-w-content-xl 3xl:max-w-content-2xl 4xl:max-w-content-3xl'
      )}>
        {/* Search */}
        <div className="flex flex-1 min-w-0 items-center">
          <div className={cn('relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-xl xl:max-w-2xl')}>
            <FiSearch
              className={cn('absolute top-1/2 size-4 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none', isRTL ? 'right-3' : 'left-3')}
            />
            <input
              type="text"
              placeholder={t('header.searchPlaceholder')}
              className={cn(
                'h-9 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-500 transition-colors dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 arabic-text',
                'focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none',
                isRTL ? 'pr-9 pl-4' : 'pl-9 pr-4'
              )}
            />
          </div>
        </div>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="size-9 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? t('theme.switchToLight') || 'Switch to light mode' : t('theme.switchToDark') || 'Switch to dark mode'}
        >
          {theme === 'dark' ? <FiSun className="size-4" /> : <FiMoon className="size-4" />}
        </Button>

        {/* Language dropdown */}
        <DropdownMenuRoot open={langMenuOpen} onOpenChange={setLangMenuOpen}>
          <DropdownMenuTrigger
            className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-sm font-medium text-emerald-900 hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-100 dark:hover:bg-emerald-900/30 transition-all duration-200 arabic-text"
            onClick={() => setLangMenuOpen(!langMenuOpen)}
          >
            <FiGlobe className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="hidden sm:inline">{language === 'ar' ? 'العربية' : 'English'}</span>
            <FiChevronDown className={cn('size-4 text-emerald-600 dark:text-emerald-400 transition-transform shrink-0', langMenuOpen && 'rotate-180')} />
          </DropdownMenuTrigger>
          {langMenuOpen && (
            <DropdownMenuContent isRTL={isRTL} className="min-w-32 rounded-xl border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800">
              <DropdownMenuItem onClick={() => { changeLanguage('en'); setLangMenuOpen(false); }}>English</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { changeLanguage('ar'); setLangMenuOpen(false); }}>العربية</DropdownMenuItem>
            </DropdownMenuContent>
          )}
        </DropdownMenuRoot>

        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="relative size-9 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-600 dark:hover:text-amber-400 transition-all duration-200"
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications) fetchNotifications();
            }}
          >
            <FiBell className="size-4" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg ring-2 ring-white dark:ring-gray-800 px-1">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} aria-hidden="true" />
              <div
                className={cn(
                  'absolute z-50 mt-2 w-80 rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-600 dark:bg-gray-800',
                  isRTL ? 'left-0' : 'right-0'
                )}
              >
                <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-600 dark:bg-gray-700/50">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t('header.notifications')}</h3>
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-emerald-600 dark:text-emerald-400 arabic-text" onClick={handleMarkAllAsRead}>
                      {t('header.markAllAsRead')}
                    </Button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    <>
                      {notifications.slice(0, 10).map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => {
                            if (!notification.isRead) handleMarkAsRead(notification.id);
                            setShowNotifications(false);
                            const dest = getNotificationRoute(notification);
                            if (dest) navigate(dest);
                          }}
                          className={cn(
                            'cursor-pointer border-b border-gray-100 px-4 py-3 transition-colors last:border-0 hover:bg-emerald-50 dark:border-gray-700 dark:hover:bg-emerald-900/20 arabic-text',
                            !notification.isRead && 'bg-emerald-50/80 dark:bg-emerald-900/20 border-r-2 border-r-emerald-500'
                          )}
                        >
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{notification.title}</p>
                          <p className="mt-0.5 line-clamp-2 text-xs text-gray-600 dark:text-gray-400">{notification.message}</p>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">{notification.createdAt ? new Date(notification.createdAt).toLocaleString() : ''}</p>
                        </div>
                      ))}
                      <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-2">
                        <button
                          type="button"
                          onClick={() => { setShowNotifications(false); navigate('/notifications'); }}
                          className="w-full text-center text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                          {t('notifications.title')} — {t('header.viewAll') || 'View all'}
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">{t('header.noNotifications')}</div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User menu — avatar with Islamic green gradient */}
        <DropdownMenuRoot open={userMenuOpen} onOpenChange={setUserMenuOpen}>
          <DropdownMenuTrigger
            className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-sm transition-all duration-200 hover:bg-emerald-100 hover:shadow-md dark:border-emerald-700 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/30"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-sm font-semibold text-white shadow-lg">
              {initial}
            </div>
            <div className={cn('hidden text-left sm:block arabic-text', isRTL && 'text-right')}>
              <p className="text-xs font-medium leading-tight text-emerald-900 truncate max-w-[120px] 2xl:max-w-[160px] dark:text-emerald-100">
                {displayName}
              </p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400">{t('sidebar.administrator')}</p>
            </div>
            <FiChevronDown className={cn('size-4 text-emerald-600 dark:text-emerald-400 transition-transform shrink-0', userMenuOpen && 'rotate-180')} />
          </DropdownMenuTrigger>
          {userMenuOpen && (
            <DropdownMenuContent isRTL={isRTL} className="min-w-44 rounded-xl border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800">
              <DropdownMenuLabel className="text-gray-900 dark:text-white">{t('sidebar.myAccount') || 'My account'}</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-600" />
              <DropdownMenuItem onClick={() => { navigate('/profile'); setUserMenuOpen(false); }} className="text-gray-700 dark:text-gray-300">
                <FiUser className="size-4" />
                {t('sidebar.profile')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { navigate('/settings'); setUserMenuOpen(false); }} className="text-gray-700 dark:text-gray-300">
                <FiSettings className="size-4" />
                {t('sidebar.settings')}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-600" />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:bg-red-50 focus:text-red-600 dark:text-red-400 dark:focus:bg-red-900/20">
                <FiLogOut className="size-4" />
                {t('sidebar.logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          )}
        </DropdownMenuRoot>
      </div>
    </header>
  );
};

export default Header;
