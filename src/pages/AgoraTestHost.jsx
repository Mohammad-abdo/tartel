import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { videoAPI } from '../services/api';
import { FiVideo, FiRadio, FiCopy, FiCheck } from 'react-icons/fi';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';
import AgoraRTC from 'agora-rtc-sdk-ng';

const AgoraTestHost = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [channelName, setChannelName] = useState(() => `sheikh-room-${Date.now().toString(36)}`);
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const localPlayerRef = useRef(null);
  const clientRef = useRef(null);
  const localTracksRef = useRef([]);
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
    return rawMessage || (isRTL ? 'فشل الاتصال بأجورا' : 'Failed to connect to Agora');
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}${isRTL ? '/ar' : ''}/agora-test-join?channel=${encodeURIComponent(channelName)}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateAndJoin = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await videoAPI.getTestToken(channelName, 1);
      const data = res?.data ?? res;
      const appIdValue = (data.appId || import.meta.env.VITE_AGORA_APP_ID || '').trim();
      const tokenValue = data.token;
      const chValue = data.channelName;
      const uidValue = data.uid;

      console.group('Agora Connection Debug (Host)');
      console.log('App ID Type:', typeof appIdValue);
      console.log('App ID Value:', `"${appIdValue}"`);
      console.log('Token Present:', !!tokenValue);
      console.log('Channel:', chValue);
      console.log('UID:', uidValue);
      console.groupEnd();

      if (!appIdValue || !tokenValue) {
        console.error('Missing App ID or Token');
        setError(isRTL ? 'معرف تطبيق أجورا غير مضبوط. أضف AGORA_APP_ID في backend/.env أو VITE_AGORA_APP_ID في frontend/.env' : 'Agora App ID not set. Add AGORA_APP_ID in backend .env or VITE_AGORA_APP_ID in frontend .env');
        return;
      }

      // Update state if needed commonly, otherwise just use local vars for join
      // setAppId(appIdValue); // removed to avoid RefError if not defined
      // setToken(tokenValue);
      setChannelName(chValue);
      // setUid(uidValue);

      if (!clientRef.current) {
        clientRef.current = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      }
      const client = clientRef.current;

      // existing event listeners would go here if any

      try {
        console.log(`Attempting join with AppID: ${appIdValue}, Channel: ${chValue}, UID: ${uidValue}`);
        await client.join(appIdValue, chValue, tokenValue, uidValue);
        console.log('Join successful');
      } catch (joinError) {
        console.error('Agora client join failed:', joinError);
        setError(joinError?.message || (isRTL ? 'فشل الانضمام إلى الغرفة' : 'Failed to join the room'));
        setLoading(false);
        return;
      }

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
      if (clientRef.current) {
        await clientRef.current.leave();
        clientRef.current = null;
      }
    } catch (e) {
      console.error(e);
    }
    setJoined(false);
  };

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
          {isRTL ? 'تجربة أجورا — إنشاء غرفة (الشيخ)' : 'Agora Test — Create Room (Sheikh)'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          {isRTL ? 'أنشئ غرفة فيديو للحجز مع الطالب. شارك رابط الانضمام مع الطالب للاختبار.' : 'Create a video room for booking with student. Share the join link for testing.'}
        </p>
      </div>

      <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-white to-emerald-50/50 dark:from-gray-800 dark:to-emerald-900/20 shadow-lg overflow-hidden">
        <div className="p-6 border-b border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/20">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {isRTL ? 'اسم الغرفة' : 'Room name'}
          </label>
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value.replace(/\s/g, '-'))}
              disabled={joined}
              placeholder="e.g. sheikh-room-1"
              className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            {!joined ? (
              <Button onClick={handleCreateAndJoin} disabled={loading}>
                {loading ? (isRTL ? 'جاري الدخول...' : 'Joining...') : (isRTL ? 'إنشاء الغرفة والدخول' : 'Create & Join')}
              </Button>
            ) : (
              <Button variant="destructive" onClick={handleLeave}>
                {isRTL ? 'إنهاء الجلسة' : 'Leave'}
              </Button>
            )}
          </div>
          {joined && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {isRTL ? 'شارك هذا الرابط مع الطالب:' : 'Share this link with student:'}
              </span>
              <div className="flex items-center gap-2">
                <code className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm">
                  {window.location.origin}/agora-test-join?channel={encodeURIComponent(channelName)}
                </code>
                <Button variant="outline" size="sm" onClick={handleCopyLink}>
                  {copied ? <FiCheck className="size-4 text-emerald-600" /> : <FiCopy className="size-4" />}
                  {copied ? (isRTL ? 'تم النسخ' : 'Copied') : (isRTL ? 'نسخ' : 'Copy')}
                </Button>
              </div>
            </div>
          )}
          {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>

        {joined && (
          <div className="p-6">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2">
              <FiVideo className="size-4" /> {isRTL ? 'كاميرتك (الشيخ)' : 'Your camera (Sheikh)'}
            </p>
            <div
              ref={localPlayerRef}
              className="w-full aspect-video max-w-2xl rounded-xl bg-gray-900 overflow-hidden"
              style={{ minHeight: 240 }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AgoraTestHost;
