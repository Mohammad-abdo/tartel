import { useState, useEffect } from 'react';

// هوك لإدارة إعدادات الإشعارات الإسلامية
export const useIslamicNotifications = () => {
  const [settings, setSettings] = useState(() => {
    // استرجاع الإعدادات من localStorage
    const saved = localStorage.getItem('islamic-notifications-settings');
    return saved ? JSON.parse(saved) : {
      enabled: true,
      interval: 300000, // 5 دقائق
      showDhikr: true,
      showIstighfar: true,
      showVerses: true,
      autoHide: true,
      autoHideDelay: 10000
    };
  });

  // حفظ الإعدادات في localStorage عند تغييرها
  useEffect(() => {
    localStorage.setItem('islamic-notifications-settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings
    }));
  };

  const toggleEnabled = () => {
    updateSettings({ enabled: !settings.enabled });
  };

  const setInterval = (interval) => {
    updateSettings({ interval });
  };

  const toggleContentType = (type) => {
    const key = `show${type.charAt(0).toUpperCase() + type.slice(1)}`;
    updateSettings({ [key]: !settings[key] });
  };

  return {
    settings,
    updateSettings,
    toggleEnabled,
    setInterval,
    toggleContentType
  };
};