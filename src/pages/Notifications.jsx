import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { adminAPI } from '../services/api';
import { FiSend, FiUsers, FiGlobe, FiMessageSquare } from 'react-icons/fi';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';

const Notifications = () => {
  const { t } = useTranslation();
  const [notificationType, setNotificationType] = useState('global');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [userIds, setUserIds] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      if (notificationType === 'global') {
        await adminAPI.sendGlobalNotification({ title, message });
      } else {
        const userIdsArray = userIds.split(',').map((id) => id.trim()).filter(Boolean);
        await adminAPI.sendNotificationToUsers({ title, message, userIds: userIdsArray });
      }
      setSuccess(true);
      setTitle('');
      setMessage('');
      setUserIds('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to send notification:', error);
      alert(t('notifications.failed') || 'Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 lg:space-y-6 2xl:space-y-5">
      <div>
        <p className="text-xs font-semibold tracking-wide text-primary-600 uppercase mb-1">Notifications</p>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">{t('notifications.title') || 'Notifications'}</h1>
        <p className="text-gray-500 mt-1 text-sm">{t('notifications.subtitle') || 'Send notifications to users'}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('notifications.send') || 'Send Notification'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-2 p-1 rounded-lg bg-gray-100">
                <button
                  type="button"
                  onClick={() => setNotificationType('global')}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-colors',
                    notificationType === 'global' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
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
                    notificationType === 'users' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  <FiUsers className="size-4" />
                  {t('notifications.specificUsers') || 'Specific Users'}
                </button>
              </div>

              {success && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
                  {t('notifications.sentSuccess') || 'Notification sent successfully!'}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('notifications.titleLabel') || 'Title'}</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    placeholder={t('notifications.titlePlaceholder') || 'Notification title'}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('notifications.messageLabel') || 'Message'}</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
                    placeholder={t('notifications.messagePlaceholder') || 'Notification message'}
                    required
                  />
                </div>
                {notificationType === 'users' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('notifications.userIdsLabel') || 'User IDs (comma-separated)'}</label>
                    <input
                      type="text"
                      value={userIds}
                      onChange={(e) => setUserIds(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      placeholder="user-id-1, user-id-2"
                      required={notificationType === 'users'}
                    />
                  </div>
                )}
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      {t('notifications.sending') || 'Sending...'}
                    </>
                  ) : (
                    <>
                      <FiSend className="size-4" />
                      {t('notifications.sendButton') || 'Send Notification'}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary-50 p-2">
                <FiMessageSquare className="text-primary-600 size-5" />
              </div>
              <CardTitle className="text-base">{t('notifications.types') || 'Notification Types'}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-1">{t('notifications.global') || 'Global Notification'}</h4>
              <p className="text-sm text-gray-500">Send notification to all users on the platform.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">{t('notifications.specificUsers') || 'Specific Users'}</h4>
              <p className="text-sm text-gray-500">Send notification to selected users by providing their user IDs.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Notifications;
