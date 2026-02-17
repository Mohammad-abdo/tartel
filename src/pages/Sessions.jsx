import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { adminAPI, sessionAPI, videoAPI } from '../services/api';
import { FiVideo, FiPlay, FiSquare, FiClock, FiSearch, FiUser, FiUserCheck } from 'react-icons/fi';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';
import AgoraRTC from 'agora-rtc-sdk-ng';

function formatDate(d) {
  if (!d) return '—';
  const x = typeof d === 'string' ? new Date(d) : d;
  return isNaN(x.getTime()) ? d : x.toLocaleString();
}

function nameOf(u, ar = false) {
  if (!u) return '—';
  const a = ar ? [u.firstNameAr, u.lastNameAr] : [u.firstName, u.lastName];
  return a.filter(Boolean).join(' ').trim() || [u.firstName, u.lastName].filter(Boolean).join(' ').trim() || u.email || '—';
}

/** Inline Agora room: join with appId, token, channel (roomId), uid */
function AgoraRoom({ appId, token, channelName, uid, onLeave }) {
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState('');
  const localRef = useRef(null);
  const clientRef = useRef(null);
  const tracksRef = useRef([]);
  const remoteUsers = useRef([]);
  const [remoteList, setRemoteList] = useState([]);

  useEffect(() => {
    if (!appId || !token || !channelName) return;
    let mounted = true;
    const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    clientRef.current = client;
    client.on('user-published', async (user, mediaType) => {
      await client.subscribe(user, mediaType);
      if (!mounted) return;
      remoteUsers.current = [...remoteUsers.current.filter((u) => u.uid !== user.uid), user];
      setRemoteList([...remoteUsers.current]);
      if (mediaType === 'audio' && user.audioTrack) user.audioTrack.play();
    });
    client.on('user-unpublished', (user) => {
      remoteUsers.current = remoteUsers.current.filter((u) => u.uid !== user.uid);
      setRemoteList([...remoteUsers.current]);
    });
    (async () => {
      try {
        await client.join(appId, channelName, token, uid);
        const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks({ encoderConfig: '720p_2' });
        tracksRef.current = [audioTrack, videoTrack];
        await client.publish([audioTrack, videoTrack]);
        if (localRef.current) videoTrack.play(localRef.current, { fit: 'cover' });
        if (mounted) setJoined(true);
      } catch (e) {
        if (mounted) setError(e?.message || 'Failed to join');
      }
    })();
    return () => {
      mounted = false;
      tracksRef.current.forEach((t) => t?.close?.());
      client.leave?.();
    };
  }, [appId, token, channelName, uid]);

  useEffect(() => {
    remoteList.forEach((user) => {
      if (user.videoTrack) {
        const id = `sess-remote-${user.uid}`;
        const el = document.getElementById(id);
        if (el && el.innerHTML === '') user.videoTrack.play(id, { fit: 'cover' });
      }
    });
  }, [remoteList]);

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-red-600">{error}</p>}
      {joined && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">You</p>
            <div ref={localRef} className="aspect-video rounded-lg bg-gray-900" />
          </div>
          {remoteList.map((user) => (
            <div key={user.uid}>
              <p className="text-xs font-medium text-gray-500 mb-1">Remote</p>
              <div id={`sess-remote-${user.uid}`} className="aspect-video rounded-lg bg-gray-900" />
            </div>
          ))}
        </div>
      )}
      <Button variant="outline" size="sm" onClick={onLeave}>Leave call</Button>
    </div>
  );
}

const Sessions = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { user } = useAuth();
  const isRTL = language === 'ar';
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  const [sessions, setSessions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [bookingIdSearch, setBookingIdSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [joinModal, setJoinModal] = useState(null);
  const [joinLoading, setJoinLoading] = useState(false);

  const fetchSessions = async (page = 1) => {
    setLoading(true);
    try {
      if (isAdmin) {
        const res = await adminAPI.getSessions({
          page,
          limit: 20,
          ...(bookingIdSearch && { bookingId: bookingIdSearch }),
          ...(dateFrom && { dateFrom }),
          ...(dateTo && { dateTo }),
          ...(statusFilter && { status: statusFilter }),
        });
        const data = res?.data ?? res;
        setSessions(data?.data ?? []);
        setPagination(data?.pagination ?? { page: 1, totalPages: 1 });
      } else {
        const res = await sessionAPI.listMySessions({ page, limit: 20 });
        const data = res?.data ?? res;
        setSessions(data?.data ?? []);
        setPagination(data?.pagination ?? { page: 1, totalPages: 1 });
      }
    } catch (e) {
      console.error(e);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions(pagination.page);
  }, [isAdmin, pagination.page, bookingIdSearch, dateFrom, dateTo, statusFilter]);

  const handleSearch = () => {
    setPagination((p) => ({ ...p, page: 1 }));
    fetchSessions(1);
  };

  const handleJoinVideo = async (session) => {
    const bid = session.bookingId;
    setJoinLoading(true);
    setJoinModal(null);
    try {
      const tokenRes = await videoAPI.getSessionToken(bid);
      const data = tokenRes?.data ?? tokenRes;
      const appId = (data.appId || import.meta.env.VITE_AGORA_APP_ID || '').trim();
      const token = data.token ?? data.agoraToken;
      const channelName = data.roomId;
      if (!appId || !token || !channelName) {
        const msg = !appId
          ? (isRTL ? 'معرف تطبيق أجورا غير مضبوط. أضف AGORA_APP_ID في backend/.env أو VITE_AGORA_APP_ID في frontend/.env' : 'Agora App ID not set. Add AGORA_APP_ID in backend .env or VITE_AGORA_APP_ID in frontend .env')
          : (isRTL ? 'لم يتم استلام بيانات الجلسة' : 'Session data not received');
        setJoinModal({ error: msg });
        return;
      }
      const uid = user?.id ? Math.abs(String(user.id).split('').reduce((a, c) => (a << 5) - a + c.charCodeAt(0), 0)) % 100000 : 1;
      setJoinModal({ appId, token, channelName, uid, bookingId: bid });
    } catch (e) {
      setJoinModal({ error: e?.response?.data?.message || e?.message || (isRTL ? 'فشل الحصول على الجلسة' : 'Failed to get session') });
    } finally {
      setJoinLoading(false);
    }
  };

  const canJoinSession = (session) => {
    if (!user?.id) return false;
    const b = session.booking;
    if (!b) return false;
    const teacherUserId = b.teacher?.userId ?? b.teacher?.user?.id;
    return b.studentId === user.id || teacherUserId === user.id;
  };

  return (
    <div className={cn('space-y-6', isRTL && 'text-right')} dir={isRTL ? 'rtl' : 'ltr'}>
      <section>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          {isRTL ? 'الجلسات (أجورا)' : 'Sessions (Agora)'}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {isRTL ? 'عرض وإدارة جلسات الفيديو للحجوزات بين المشايخ والطلاب. انضم للجلسة من هنا.' : 'View and manage video sessions for sheikh–student bookings. Join the call from here.'}
        </p>
      </section>

      {isAdmin && (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="min-w-[140px]">
              <label className="block text-xs font-medium text-gray-500 mb-1">{isRTL ? 'معرف الحجز' : 'Booking ID'}</label>
              <input
                type="text"
                value={bookingIdSearch}
                onChange={(e) => setBookingIdSearch(e.target.value)}
                placeholder="UUID"
                className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{isRTL ? 'من تاريخ' : 'From'}</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{isRTL ? 'إلى تاريخ' : 'To'}</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{isRTL ? 'الحالة' : 'Status'}</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm">
                <option value="">{isRTL ? 'الكل' : 'All'}</option>
                <option value="active">{isRTL ? 'جارية' : 'Active'}</option>
                <option value="ended">{isRTL ? 'منتهية' : 'Ended'}</option>
              </select>
            </div>
            <Button onClick={handleSearch}>
              <FiSearch className="size-4 mr-2 rtl:ml-2 rtl:mr-0" />
              {isRTL ? 'بحث' : 'Search'}
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="size-12 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
            <p className="mt-4 text-sm text-gray-500">{isRTL ? 'جاري التحميل...' : 'Loading...'}</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            {isRTL ? 'لا توجد جلسات. تأكد من وجود حجوزات مؤكدة وجلسات مبدوءة.' : 'No sessions. Ensure you have confirmed bookings with started sessions.'}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400">{isRTL ? 'الحجز' : 'Booking'}</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400">{isRTL ? 'الشيخ' : 'Sheikh'}</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400">{isRTL ? 'الطالب' : 'Student'}</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400">{isRTL ? 'تاريخ الحجز' : 'Booking date'}</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400">{isRTL ? 'الغرفة' : 'Room'}</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400">{isRTL ? 'بداية' : 'Started'}</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400">{isRTL ? 'نهاية' : 'Ended'}</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400">{isRTL ? 'المدة' : 'Duration'}</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400">{isRTL ? 'الحالة' : 'Status'}</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400">{isRTL ? 'إجراء' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {sessions.map((session) => {
                    const b = session.booking || {};
                    const teacher = b.teacher?.user || b.teacher;
                    const student = b.student;
                    const started = session.startedAt;
                    const ended = session.endedAt;
                    const status = ended ? (isRTL ? 'منتهية' : 'Ended') : started ? (isRTL ? 'جارية' : 'Active') : (isRTL ? 'لم تبدأ' : 'Not started');
                    const canJoin = canJoinSession(session);
                    return (
                      <tr key={session.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">{session.bookingId?.slice(0, 8)}…</td>
                        <td className="px-4 py-3">{nameOf(teacher, isRTL)}</td>
                        <td className="px-4 py-3">{nameOf(student, isRTL)}</td>
                        <td className="px-4 py-3">{formatDate(b.date)}</td>
                        <td className="px-4 py-3 font-mono text-xs">{session.roomId?.slice(0, 12)}…</td>
                        <td className="px-4 py-3">{formatDate(session.startedAt)}</td>
                        <td className="px-4 py-3">{formatDate(session.endedAt)}</td>
                        <td className="px-4 py-3">{session.duration != null ? `${session.duration} min` : '—'}</td>
                        <td className="px-4 py-3">
                          <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', ended ? 'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300' : started ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400')}>
                            {status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {canJoin && !ended && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={joinLoading}
                              onClick={() => handleJoinVideo(session)}
                            >
                              <FiVideo className="size-4 mr-1 rtl:ml-1 rtl:mr-0" />
                              {isRTL ? 'انضم للفيديو' : 'Join video'}
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-4 py-3">
                <Button variant="outline" size="sm" disabled={pagination.page <= 1} onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}>
                  {isRTL ? 'السابق' : 'Previous'}
                </Button>
                <span className="text-sm text-gray-500">{pagination.page} / {pagination.totalPages}</span>
                <Button variant="outline" size="sm" disabled={pagination.page >= pagination.totalPages} onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}>
                  {isRTL ? 'التالي' : 'Next'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {joinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setJoinModal(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{isRTL ? 'جلسة الفيديو (أجورا)' : 'Video session (Agora)'}</h3>
            {joinModal.error ? (
              <p className="text-red-600 dark:text-red-400">{joinModal.error}</p>
            ) : (
              <AgoraRoom
                appId={joinModal.appId}
                token={joinModal.token}
                channelName={joinModal.channelName}
                uid={joinModal.uid}
                onLeave={() => setJoinModal(null)}
              />
            )}
            <div className="mt-4">
              <Button variant="ghost" onClick={() => setJoinModal(null)}>{isRTL ? 'إغلاق' : 'Close'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sessions;
