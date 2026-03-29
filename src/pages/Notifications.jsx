import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useAdminInbox } from '../context/AdminInboxContext';
import { notificationAPI, adminAPI } from '../services/api';
import { FiBell, FiCheck, FiCheckCircle, FiTrash2, FiSend, FiUsers, FiGlobe } from 'react-icons/fi';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { toast } from 'react-toastify';
import { cn } from '../lib/utils';

const POLL_INTERVAL_MS = 30000;

function formatDate(d) {
  if (!d) return '—';
  try {
    const date = new Date(d);
    return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return '—';
  }
}

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
      return null;
  }
};

const Notifications = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { user } = useAuth();
  const { refreshUnreadCount } = useAdminInbox();
  const navigate = useNavigate();
  const isRTL = language === 'ar';
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [unreadOnly, setUnreadOnly] = useState(false);

  const [notificationType, setNotificationType] = useState('global');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [userIds, setUserIds] = useState('');
  const [sendLoading, setSendLoading] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const params = unreadOnly ? { unreadOnly: 'true' } : {};
      const res = await notificationAPI.getNotifications(params);
      const data = res?.data ?? res;
      setList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [unreadOnly]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setList([]);
      return;
    }
    setLoading(true);
    fetchNotifications();
  }, [user, fetchNotifications]);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(fetchNotifications, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [user, fetchNotifications]);

  const handleMarkAsRead = async (id) => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      await notificationAPI.markAsRead(id);
      setList((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date() } : n)));
      refreshUnreadCount();
      toast.success(t('notifications.markedRead') || 'Marked as read');
    } catch (e) {
      toast.error(e.response?.data?.message || t('common.error'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      await notificationAPI.markAllAsRead();
      setList((prev) => prev.map((n) => ({ ...n, isRead: true, readAt: new Date() })));
      refreshUnreadCount();
      toast.success(t('notifications.allMarkedRead') || 'All marked as read');
    } catch (e) {
      toast.error(e.response?.data?.message || t('common.error'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      await notificationAPI.deleteNotification(id);
      setList((prev) => prev.filter((n) => n.id !== id));
      refreshUnreadCount();
      toast.success(t('notifications.deleted') || 'Notification deleted');
    } catch (e) {
      toast.error(e.response?.data?.message || t('common.error'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendSubmit = async (e) => {
    e.preventDefault();
    setSendLoading(true);
    setSendSuccess(false);
    try {
      if (notificationType === 'global') {
        await adminAPI.sendGlobalNotification({ title, message });
      } else {
        const userIdsArray = userIds.split(',').map((id) => id.trim()).filter(Boolean);
        await adminAPI.sendNotificationToUsers({ title, message, userIds: userIdsArray });
      }
      setSendSuccess(true);
      setTitle('');
      setMessage('');
      setUserIds('');
      setTimeout(() => setSendSuccess(false), 3000);
      toast.success(t('notifications.sentSuccess') || 'Notification sent');
    } catch (error) {
      console.error('Failed to send notification:', error);
      toast.error(error.response?.data?.message || t('notifications.failed') || 'Failed to send');
    } finally {
      setSendLoading(false);
    }
  };

  const unreadCount = list.filter((n) => !n.isRead).length;

  return (
    <div className="flex min-h-0 flex-1 flex-col space-y-6 animate-in fade-in duration-300" style={{ minWidth: 0 }} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className={cn('flex flex-col gap-1', isRTL && 'text-right')}>
        <p className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
          {t('notifications.title') || 'Notifications'}
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
          {t('notifications.title') || 'Notifications'}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {t('notifications.inboxSubtitle') || 'Your notifications (Admin, Sheikh, and Student each see their own)'}
        </p>
      </div>

      {/* Inbox */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-purple-50/50 dark:bg-purple-900/20 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FiBell className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('notifications.inbox') || 'Inbox'}
              {unreadCount > 0 && (
                <span className="ml-2 text-sm font-normal text-purple-600 dark:text-purple-400">
                  ({unreadCount} {t('notifications.unread') || 'unread'})
                </span>
              )}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
              <input
                type="checkbox"
                checked={unreadOnly}
                onChange={(e) => setUnreadOnly(e.target.checked)}
                className="rounded border-gray-300"
              />
              {t('notifications.unreadOnly') || 'Unread only'}
            </label>
            {list.some((n) => !n.isRead) && (
              <Button variant="outline" size="sm" onClick={handleMarkAllAsRead} disabled={actionLoading}>
                <FiCheckCircle className="size-4 mr-1" />
                {t('notifications.markAllRead') || 'Mark all read'}
              </Button>
            )}
          </div>
        </div>

        {!user ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            {t('notifications.loginRequired') || 'Please log in to see your notifications.'}
          </div>
        ) : loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <FiBell className="size-14 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {t('notifications.emptyTitle') || 'No notifications'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('notifications.emptyDesc') || 'You have no notifications yet.'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {list.map((n) => {
              const dest = getNotificationRoute(n);
              return (
                <li
                  key={n.id}
                  onClick={() => {
                    if (!n.isRead) handleMarkAsRead(n.id);
                    if (dest) navigate(dest);
                  }}
                  className={cn(
                    'px-6 py-4 flex items-start gap-3 transition-colors cursor-pointer hover:bg-purple-50/50 dark:hover:bg-purple-900/20',
                    n.isRead ? 'bg-white dark:bg-gray-800' : 'bg-purple-50/30 dark:bg-purple-900/10',
                    isRTL && 'flex-row-reverse'
                  )}
                >
                  <div className={cn('flex-1 min-w-0', isRTL && 'text-right')}>
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <span className="font-semibold text-gray-900 dark:text-white">{n.title}</span>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" title={t('notifications.unread') || 'Unread'} />
                      )}
                      {dest && (
                        <span className="text-xs text-purple-500 dark:text-purple-400">←</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{n.message}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatDate(n.createdAt)}</p>
                  </div>
                  <div className={cn('flex gap-1 shrink-0', isRTL && 'flex-row-reverse')}>
                    {!n.isRead && (
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleMarkAsRead(n.id); }} disabled={actionLoading} title={t('notifications.markAsRead') || 'Mark as read'}>
                        <FiCheck className="size-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(n.id); }} disabled={actionLoading} className="text-red-600 hover:text-red-700" title={t('common.delete')}>
                      <FiTrash2 className="size-4" />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Admin: Send notification */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FiSend className="size-5 text-purple-600" />
              {t('notifications.send') || 'Send Notification'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 p-1 rounded-lg bg-gray-100 dark:bg-gray-800">
              <button
                type="button"
                onClick={() => setNotificationType('global')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-colors',
                  notificationType === 'global' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                )}
              >
                <FiGlobe className="size-4" />
                {t('notifications.global') || 'Global'}
              </button>
              <button
                type="button"
                onClick={() => setNotificationType('users')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-colors',
                  notificationType === 'users' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                )}
              >
                <FiUsers className="size-4" />
                {t('notifications.specificUsers') || 'Specific Users'}
              </button>
            </div>
            {sendSuccess && (
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm">
                {t('notifications.sentSuccess') || 'Notification sent successfully!'}
              </div>
            )}
            <form onSubmit={handleSendSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('notifications.titleLabel') || 'Title'}</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-purple-500"
                  placeholder={t('notifications.titlePlaceholder') || 'Title'}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('notifications.messageLabel') || 'Message'}</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 resize-none"
                  placeholder={t('notifications.messagePlaceholder') || 'Message'}
                  required
                />
              </div>
              {notificationType === 'users' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('notifications.userIdsLabel') || 'User IDs (comma-separated)'}</label>
                  <input
                    type="text"
                    value={userIds}
                    onChange={(e) => setUserIds(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800"
                    placeholder="id1, id2"
                    required={notificationType === 'users'}
                  />
                </div>
              )}
              <Button type="submit" disabled={sendLoading}>
                {sendLoading ? (t('notifications.sending') || 'Sending...') : (t('notifications.sendButton') || 'Send')}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Notifications;
