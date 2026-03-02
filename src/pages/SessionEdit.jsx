import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { sessionAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiVideo, FiBook, FiFileText } from 'react-icons/fi';
import { cn } from '../lib/utils';

function formatDate(d, locale = 'en-US') {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return '—';
  }
}

const SessionEdit = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const locale = language === 'ar' ? 'ar-SA' : 'en-US';

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const [memorizationForm, setMemorizationForm] = useState({
    surahName: '',
    surahNameAr: '',
    fromAyah: '',
    toAyah: '',
    isFullSurah: false,
    notes: '',
  });
  const [revisionForm, setRevisionForm] = useState({
    revisionType: 'CLOSE',
    rangeType: 'SURAH',
    fromSurah: '',
    toSurah: '',
    fromJuz: '',
    toJuz: '',
    notes: '',
  });
  const [reportForm, setReportForm] = useState({ content: '', rating: '' });
  const [submittingMem, setSubmittingMem] = useState(false);
  const [submittingRev, setSubmittingRev] = useState(false);
  const [submittingReport, setSubmittingReport] = useState(false);

  const fetchSession = async () => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const res = await sessionAPI.getSessionDetails(sessionId);
      const data = res?.data ?? res;
      setSession(data);
    } catch (err) {
      console.error('Failed to fetch session:', err);
      toast.error(isRTL ? 'الجلسة غير موجودة' : 'Session not found');
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, [sessionId]);

  const handleSaveMemorization = async (e) => {
    e.preventDefault();
    if (!sessionId || !memorizationForm.surahName?.trim()) return;
    setSubmittingMem(true);
    try {
      await sessionAPI.saveMemorization(sessionId, memorizationForm);
      toast.success(isRTL ? 'تم حفظ الحفظ الجديد' : 'Memorization saved');
      fetchSession();
      setMemorizationForm({ surahName: '', surahNameAr: '', fromAyah: '', toAyah: '', isFullSurah: false, notes: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || (isRTL ? 'فشل الحفظ' : 'Failed to save'));
    } finally {
      setSubmittingMem(false);
    }
  };

  const handleSaveRevision = async (e) => {
    e.preventDefault();
    if (!sessionId) return;
    setSubmittingRev(true);
    try {
      await sessionAPI.saveRevision(sessionId, revisionForm);
      toast.success(isRTL ? 'تم حفظ المراجعة' : 'Revision saved');
      fetchSession();
      setRevisionForm({ revisionType: 'CLOSE', rangeType: 'SURAH', fromSurah: '', toSurah: '', fromJuz: '', toJuz: '', notes: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || (isRTL ? 'فشل الحفظ' : 'Failed to save'));
    } finally {
      setSubmittingRev(false);
    }
  };

  const handleSaveReport = async (e) => {
    e.preventDefault();
    if (!sessionId || !reportForm.content?.trim()) {
      toast.error(isRTL ? 'الوصف مطلوب' : 'Content is required');
      return;
    }
    setSubmittingReport(true);
    try {
      await sessionAPI.saveReport(sessionId, {
        content: reportForm.content.trim(),
        rating: reportForm.rating || null,
      });
      toast.success(isRTL ? 'تم حفظ التقييم' : 'Report saved');
      fetchSession();
      setReportForm({ content: '', rating: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || (isRTL ? 'فشل الحفظ' : 'Failed to save'));
    } finally {
      setSubmittingReport(false);
    }
  };

  const bookingId = session?.bookingSession?.booking?.id;
  const slot = session?.bookingSession;
  const student = session?.bookingSession?.booking?.student;
  const teacher = session?.bookingSession?.booking?.teacher;
  const studentName = student
    ? (isRTL ? [student.firstNameAr, student.lastNameAr].filter(Boolean).join(' ') : [student.firstName, student.lastName].filter(Boolean).join(' ')) || student.email || '—'
    : '—';
  const teacherName = teacher?.user
    ? (isRTL ? [teacher.user.firstNameAr, teacher.user.lastNameAr].filter(Boolean).join(' ') : [teacher.user.firstName, teacher.user.lastName].filter(Boolean).join(' ')) || '—'
    : '—';

  if (loading && !session) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" aria-hidden />
      </div>
    );
  }

  if (!session) {
    return (
      <div className={cn('py-12 text-center', isRTL && 'text-right')} dir={isRTL ? 'rtl' : 'ltr'}>
        <p className="text-gray-500 dark:text-gray-400">{isRTL ? 'الجلسة غير موجودة' : 'Session not found'}</p>
        <button
          onClick={() => navigate(bookingId ? `/bookings/${bookingId}` : '/bookings')}
          className="mt-4 text-primary-600 hover:text-primary-700 dark:text-primary-400"
        >
          {isRTL ? 'العودة' : 'Go back'}
        </button>
      </div>
    );
  }

  return (
    <div className={cn(isRTL && 'text-right')} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(bookingId ? `/bookings/${bookingId}` : '/bookings')}
            className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <FiArrowLeft className="text-xl text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
              {isRTL ? 'تعديل بيانات الجلسة' : 'Edit session data'}
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              {slot && (
                <>
                  {new Date(slot.scheduledDate).toLocaleDateString(locale)} {slot.startTime}
                  {studentName !== '—' && ` · ${studentName}`}
                  {teacherName !== '—' && ` · ${teacherName}`}
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Session info card */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <FiVideo />
            {isRTL ? 'معلومات الجلسة' : 'Session info'}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {session.startedAt && (
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{isRTL ? 'وقت البداية' : 'Started'}</p>
                <p className="font-medium text-gray-900 dark:text-white">{formatDate(session.startedAt, locale)}</p>
              </div>
            )}
            {session.endedAt && (
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{isRTL ? 'وقت النهاية' : 'Ended'}</p>
                <p className="font-medium text-gray-900 dark:text-white">{formatDate(session.endedAt, locale)}</p>
              </div>
            )}
            {session.duration != null && (
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{isRTL ? 'المدة (دقيقة)' : 'Duration (min)'}</p>
                <p className="font-medium text-gray-900 dark:text-white">{session.duration}</p>
              </div>
            )}
          </div>
        </div>

        {/* New memorization */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <FiBook />
            {isRTL ? 'حفظ جديد' : 'New memorization'}
          </h2>
          {session.memorizations?.length > 0 && (
            <ul className="mb-4 space-y-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
              {session.memorizations.map((m) => (
                <li key={m.id} className="text-sm">
                  {m.surahName}
                  {m.surahNameAr ? ` (${m.surahNameAr})` : ''}
                  {m.isFullSurah ? ` — ${isRTL ? 'سورة كاملة' : 'Full surah'}` : m.fromAyah != null && m.toAyah != null ? ` — ${m.fromAyah}-${m.toAyah}` : ''}
                  {m.notes ? ` — ${m.notes}` : ''}
                </li>
              ))}
            </ul>
          )}
          <form onSubmit={handleSaveMemorization} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="text"
                placeholder={isRTL ? 'اسم السورة' : 'Surah name'}
                value={memorizationForm.surahName}
                onChange={(e) => setMemorizationForm((f) => ({ ...f, surahName: e.target.value }))}
                className="rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <input
                type="text"
                placeholder={isRTL ? 'اسم السورة (عربي)' : 'Surah name (Ar)'}
                value={memorizationForm.surahNameAr}
                onChange={(e) => setMemorizationForm((f) => ({ ...f, surahNameAr: e.target.value }))}
                className="rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <input
                type="number"
                min="1"
                placeholder={isRTL ? 'من آية' : 'From ayah'}
                value={memorizationForm.fromAyah}
                onChange={(e) => setMemorizationForm((f) => ({ ...f, fromAyah: e.target.value }))}
                className="rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <input
                type="number"
                min="1"
                placeholder={isRTL ? 'إلى آية' : 'To ayah'}
                value={memorizationForm.toAyah}
                onChange={(e) => setMemorizationForm((f) => ({ ...f, toAyah: e.target.value }))}
                className="rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={memorizationForm.isFullSurah}
                onChange={(e) => setMemorizationForm((f) => ({ ...f, isFullSurah: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm">{isRTL ? 'سورة كاملة' : 'Full surah'}</span>
            </label>
            <textarea
              placeholder={isRTL ? 'ملاحظات' : 'Notes'}
              value={memorizationForm.notes}
              onChange={(e) => setMemorizationForm((f) => ({ ...f, notes: e.target.value }))}
              rows={2}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <button
              type="submit"
              disabled={submittingMem || !memorizationForm.surahName?.trim()}
              className="rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {submittingMem ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'حفظ' : 'Save memorization')}
            </button>
          </form>
        </div>

        {/* Revision */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <FiBook />
            {isRTL ? 'مراجعة' : 'Revision'}
          </h2>
          {session.revisions?.length > 0 && (
            <ul className="mb-4 space-y-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
              {session.revisions.map((r) => (
                <li key={r.id} className="text-sm">
                  {r.revisionType} / {r.rangeType}
                  {r.fromSurah && r.toSurah && ` — ${r.fromSurah} to ${r.toSurah}`}
                  {r.fromJuz != null && r.toJuz != null && ` — Juz ${r.fromJuz}-${r.toJuz}`}
                  {r.notes ? ` — ${r.notes}` : ''}
                </li>
              ))}
            </ul>
          )}
          <form onSubmit={handleSaveRevision} className="space-y-3">
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="revType"
                  checked={revisionForm.revisionType === 'CLOSE'}
                  onChange={() => setRevisionForm((f) => ({ ...f, revisionType: 'CLOSE' }))}
                />
                <span className="text-sm">{isRTL ? 'قريب' : 'Close'}</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="revType"
                  checked={revisionForm.revisionType === 'FAR'}
                  onChange={() => setRevisionForm((f) => ({ ...f, revisionType: 'FAR' }))}
                />
                <span className="text-sm">{isRTL ? 'بعيد' : 'Far'}</span>
              </label>
            </div>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="rangeType"
                  checked={revisionForm.rangeType === 'SURAH'}
                  onChange={() => setRevisionForm((f) => ({ ...f, rangeType: 'SURAH' }))}
                />
                <span className="text-sm">SURAH</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="rangeType"
                  checked={revisionForm.rangeType === 'JUZ'}
                  onChange={() => setRevisionForm((f) => ({ ...f, rangeType: 'JUZ' }))}
                />
                <span className="text-sm">JUZ</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="rangeType"
                  checked={revisionForm.rangeType === 'QUARTER'}
                  onChange={() => setRevisionForm((f) => ({ ...f, rangeType: 'QUARTER' }))}
                />
                <span className="text-sm">QUARTER</span>
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="text"
                placeholder="From surah"
                value={revisionForm.fromSurah}
                onChange={(e) => setRevisionForm((f) => ({ ...f, fromSurah: e.target.value }))}
                className="rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <input
                type="text"
                placeholder="To surah"
                value={revisionForm.toSurah}
                onChange={(e) => setRevisionForm((f) => ({ ...f, toSurah: e.target.value }))}
                className="rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <input
                type="number"
                min="1"
                max="30"
                placeholder="From juz"
                value={revisionForm.fromJuz}
                onChange={(e) => setRevisionForm((f) => ({ ...f, fromJuz: e.target.value }))}
                className="rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <input
                type="number"
                min="1"
                max="30"
                placeholder="To juz"
                value={revisionForm.toJuz}
                onChange={(e) => setRevisionForm((f) => ({ ...f, toJuz: e.target.value }))}
                className="rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <textarea
              placeholder={isRTL ? 'ملاحظات' : 'Notes'}
              value={revisionForm.notes}
              onChange={(e) => setRevisionForm((f) => ({ ...f, notes: e.target.value }))}
              rows={2}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <button
              type="submit"
              disabled={submittingRev}
              className="rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {submittingRev ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'حفظ المراجعة' : 'Save revision')}
            </button>
          </form>
        </div>

        {/* Session evaluation */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <FiFileText />
            {isRTL ? 'تقييم الجلسة' : 'Session evaluation'}
          </h2>
          {session.report && (
            <div className="mb-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
              <p className="text-sm text-gray-700 dark:text-gray-300">{session.report.content}</p>
              {session.report.rating != null && (
                <p className="mt-2 text-sm font-medium">
                  {isRTL ? 'التقييم' : 'Rating'}: {session.report.rating}/5
                </p>
              )}
            </div>
          )}
          <form onSubmit={handleSaveReport} className="space-y-3">
            <textarea
              required
              placeholder={isRTL ? 'وصف التقييم...' : 'Evaluation content...'}
              value={reportForm.content}
              onChange={(e) => setReportForm((f) => ({ ...f, content: e.target.value }))}
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400">
                {isRTL ? 'التقييم (اختياري) 1-5' : 'Rating (optional) 1-5'}
              </label>
              <select
                value={reportForm.rating}
                onChange={(e) => setReportForm((f) => ({ ...f, rating: e.target.value }))}
                className="mt-1 rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">—</option>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={submittingReport}
              className="rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {submittingReport ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'حفظ التقييم' : 'Save report')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SessionEdit;
