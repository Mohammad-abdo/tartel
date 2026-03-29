import { createContext, useContext, useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { notificationAPI } from '../services/api';
import { playAdminNotificationBeep } from '../utils/playNotificationBeep';

const POLL_MS = 30000;
const SOUND_THROTTLE_MS = 2500;
const LS_SOUND_MUTED = 'tartel_admin_notification_sound_muted';

const AdminInboxContext = createContext(null);

function isAdminRole(user) {
  return user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
}

export function AdminInboxProvider({ children }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const lastServerCountRef = useRef(null);
  const lastSoundAtRef = useRef(0);
  const mountedRef = useRef(true);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const res = await notificationAPI.getUnreadCount();
      const raw = res?.data?.unreadCount ?? res?.unreadCount;
      const count = typeof raw === 'number' && !Number.isNaN(raw) ? raw : 0;
      if (!mountedRef.current) return;

      const prev = lastServerCountRef.current;
      if (prev !== null) {
        const shouldSound =
          isAdminRole(user) &&
          count > prev &&
          typeof localStorage !== 'undefined' &&
          localStorage.getItem(LS_SOUND_MUTED) !== '1';
        if (shouldSound) {
          const now = Date.now();
          if (now - lastSoundAtRef.current >= SOUND_THROTTLE_MS) {
            lastSoundAtRef.current = now;
            playAdminNotificationBeep();
          }
        }
      }
      lastServerCountRef.current = count;
      setUnreadCount(count);
    } catch {
      /* ignore */
    }
  }, [user]);

  useEffect(() => {
    mountedRef.current = true;
    if (!user) {
      setUnreadCount(0);
      lastServerCountRef.current = null;
      return undefined;
    }
    fetchUnreadCount();
    const id = setInterval(fetchUnreadCount, POLL_MS);
    const onVis = () => {
      if (document.visibilityState === 'visible') fetchUnreadCount();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      mountedRef.current = false;
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [user, fetchUnreadCount]);

  const refreshUnreadCount = useCallback(() => fetchUnreadCount(), [fetchUnreadCount]);

  const adjustUnreadOptimistic = useCallback((delta) => {
    setUnreadCount((c) => Math.max(0, c + delta));
  }, []);

  const value = { unreadCount, refreshUnreadCount, adjustUnreadOptimistic };
  return <AdminInboxContext.Provider value={value}>{children}</AdminInboxContext.Provider>;
}

export function useAdminInbox() {
  const ctx = useContext(AdminInboxContext);
  if (!ctx) {
    throw new Error('useAdminInbox must be used within AdminInboxProvider');
  }
  return ctx;
}
