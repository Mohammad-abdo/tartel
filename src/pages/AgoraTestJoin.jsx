import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { videoAPI } from '../services/api';
import { FiVideo, FiUser } from 'react-icons/fi';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';
import AgoraRTC from 'agora-rtc-sdk-ng';

const AgoraTestJoin = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [searchParams] = useSearchParams();
  const channelFromUrl = searchParams.get('channel') || '';
  const [channelName, setChannelName] = useState(channelFromUrl || '');
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [remoteUsers, setRemoteUsers] = useState([]);
  const remotePlayersRef = useRef({});
  const clientRef = useRef(null);
  const localTracksRef = useRef([]);
  const localPlayerRef = useRef(null);
  const getReadableAgoraError = (err) => {
    const rawMessage = err?.response?.data?.message || err?.message || '';
    if (
      rawMessage.includes('Agora configuration invalid') ||
      rawMessage.includes('AGORA_APP_ID') ||
      rawMessage.includes('AGORA_APP_CERTIFICATE')
    ) {
      return isRTL
        ? 'إعدادات أجورا في الخادم غير صحيحة. تحقق من AGORA_APP_ID و AGORA_APP_CERTIFICATE (32 حرفًا hex) ومن أنهما من نفس مشروع Agora.'
        : 'Agora server configuration is invalid. Verify AGORA_APP_ID and AGORA_APP_CERTIFICATE are 32-char hex values from the same Agora project.';
    }
    return rawMessage || (isRTL ? 'فشل الاتصال' : 'Failed to connect');
  };

  useEffect(() => {
    if (channelFromUrl) setChannelName(channelFromUrl);
  }, [channelFromUrl]);

  const handleJoin = async () => {
    if (!channelName.trim()) {
      setError(isRTL ? 'أدخل اسم الغرفة' : 'Enter room name');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await videoAPI.getTestToken(channelName.trim(), 2);
      const data = res?.data ?? res;
      const appId = (data.appId || import.meta.env.VITE_AGORA_APP_ID || '').trim();
      const token = data.token;
      const ch = data.channelName || channelName.trim();
      const uid = data.uid ?? 2;
      if (!appId || !token) {
        setError(isRTL ? 'معرف تطبيق أجورا غير مضبوط. أضف AGORA_APP_ID في backend/.env أو VITE_AGORA_APP_ID في frontend/.env' : 'Agora App ID not set. Add AGORA_APP_ID in backend .env or VITE_AGORA_APP_ID in frontend .env');
        return;
      }
      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      clientRef.current = client;

      client.on('user-published', async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        setRemoteUsers((prev) => {
          const next = prev.filter((u) => u.uid !== user.uid);
          if (!next.find((u) => u.uid === user.uid)) next.push(user);
          return next;
        });
        if (mediaType === 'audio' && user.audioTrack) user.audioTrack.play();
      });

      client.on('user-unpublished', (user) => {
        setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
      });

      await client.join(appId, ch, token, uid);
      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks({ encoderConfig: '720p_2' });
      localTracksRef.current = [audioTrack, videoTrack];
      await client.publish([audioTrack, videoTrack]);
      if (localPlayerRef.current) {
        videoTrack.play(localPlayerRef.current, { fit: 'cover' });
      }
      setJoined(true);
    } catch (err) {
      console.error(err);
      setError(getReadableAgoraError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = async () => {
    try {
      for (const track of localTracksRef.current) {
        track?.close?.();
      }
      localTracksRef.current = [];
      Object.values(remotePlayersRef.current).forEach((el) => { if (el) el.innerHTML = ''; });
      if (clientRef.current) {
        await clientRef.current.leave();
        clientRef.current = null;
      }
      setRemoteUsers([]);
    } catch (e) {
      console.error(e);
    }
    setJoined(false);
  };

  useEffect(() => {
    remoteUsers.forEach((user) => {
      if (user.videoTrack) {
        const id = `remote-${user.uid}`;
        const el = document.getElementById(id);
        if (el && el.innerHTML === '') user.videoTrack.play(id, { fit: 'cover' });
      }
    });
  }, [remoteUsers]);

  useEffect(() => {
    return () => {
      handleLeave();
    };
  }, []);

  return (
    <div className={cn('space-y-6', isRTL && 'text-right')} dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <p className="text-xs font-semibold tracking-wide text-primary-600 uppercase mb-1">Agora</p>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          {isRTL ? 'تجربة أجورا — الانضمام (الطالب)' : 'Agora Test — Join Room (Student)'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          {isRTL ? 'ادخل اسم الغرفة التي أعطاك إياها الشيخ أو افتح الرابط المُشار إليه.' : 'Enter the room name from the sheikh or open the shared link.'}
        </p>
      </div>

      <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-gradient-to-br from-white to-amber-50/50 dark:from-gray-800 dark:to-amber-900/20 shadow-lg overflow-hidden">
        <div className="p-6 border-b border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/20">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {isRTL ? 'اسم الغرفة' : 'Room name'}
          </label>
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value.replace(/\s/g, '-'))}
              disabled={joined}
              placeholder="e.g. sheikh-room-xxx"
              className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            {!joined ? (
              <Button onClick={handleJoin} disabled={loading}>
                {loading ? (isRTL ? 'جاري الدخول...' : 'Joining...') : (isRTL ? 'انضم للغرفة' : 'Join Room')}
              </Button>
            ) : (
              <Button variant="destructive" onClick={handleLeave}>
                {isRTL ? 'إنهاء' : 'Leave'}
              </Button>
            )}
          </div>
          {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>

        {joined && (
          <div className="p-6 grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2">
                <FiVideo className="size-4" /> {isRTL ? 'أنت (الطالب)' : 'You (Student)'}
              </p>
              <div
                ref={localPlayerRef}
                className="w-full aspect-video rounded-xl bg-gray-900 overflow-hidden"
                style={{ minHeight: 220 }}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2">
                <FiUser className="size-4" /> {isRTL ? 'الشيخ (البث المباشر)' : 'Sheikh (Live)'}
              </p>
              <div className="space-y-3">
                {remoteUsers.length === 0 ? (
                  <div className="aspect-video rounded-xl bg-gray-800 flex items-center justify-center text-gray-500">
                    {isRTL ? 'في انتظار دخول الشيخ...' : 'Waiting for sheikh to join...'}
                  </div>
                ) : (
                  remoteUsers.map((user) => (
                    <div
                      key={user.uid}
                      id={`remote-${user.uid}`}
                      className="aspect-video rounded-xl bg-gray-900 overflow-hidden"
                      style={{ minHeight: 220 }}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgoraTestJoin;
