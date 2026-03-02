import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { adminAPI } from '../services/api';
import { toast } from 'react-toastify';
import {
  FiArrowRight,
  FiCreditCard,
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiClock,
  FiUser,
  FiMail,
  FiCheckCircle,
  FiXCircle,
  FiPlus,
  FiMinus,
  FiSend,
  FiDownload,
  FiUpload,
  FiInfo,
  FiCalendar,
  FiEye,
  FiActivity,
  FiBookOpen,
} from 'react-icons/fi';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { cn } from '../lib/utils';
import { useCurrency } from '../context/CurrencyContext';

function formatDate(d) {
  if (!d) return '—';
  try {
    const date = new Date(d);
    return date.toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  } catch {
    return new Date(d).toISOString().slice(0, 16).replace('T', ' ');
  }
}

const WalletDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const isTeacher = location.pathname.includes('/wallets/teacher/');
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { formatCurrency } = useCurrency();
  const isRTL = language === 'ar';
  const navigate = useNavigate();

  const [wallet, setWallet] = useState(null);
  const [studentTxPage, setStudentTxPage] = useState(1);
  const [studentTx, setStudentTx] = useState({ transactions: [], pagination: {} });
  const [loading, setLoading] = useState(true);
  const [sendMoneyOpen, setSendMoneyOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [sendAmount, setSendAmount] = useState('');
  const [sendDescription, setSendDescription] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [depositDescription, setDepositDescription] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawDescription, setWithdrawDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchWallet = async () => {
    setLoading(true);
    try {
      if (isTeacher) {
        const response = await adminAPI.getTeacherWallet(id);
        const raw = response?.data ?? response;
        const walletData = raw?.data ?? raw;
        setWallet(typeof walletData === 'object' && walletData !== null ? walletData : {});
      } else {
        const response = await adminAPI.getStudentWallet(id);
        const raw = response?.data ?? response;
        const walletData = raw?.data ?? raw;
        setWallet(typeof walletData === 'object' && walletData !== null ? walletData : {});
      }
    } catch (error) {
      console.error('Failed to fetch wallet:', error);
      toast.error(t('wallets.loadFailed'));
      navigate('/wallets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchWallet();
  }, [id]);

  const fetchStudentTransactions = async (walletId, page = 1) => {
    try {
      const response = await adminAPI.getStudentWalletTransactions(walletId, { page, limit: 50 });
      const body = response.data || response;
      setStudentTx({
        transactions: body.transactions || body.data || [],
        pagination: body.pagination || {},
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!isTeacher && wallet?.id) {
      fetchStudentTransactions(wallet.id, studentTxPage);
    }
  }, [isTeacher, wallet?.id, studentTxPage]);

  const handleSendMoney = async (e) => {
    e.preventDefault();
    const amount = parseFloat(sendAmount);
    if (!amount || amount <= 0) {
      toast.error(t('wallets.invalidAmount'));
      return;
    }
    setSubmitting(true);
    try {
      await adminAPI.sendMoneyToTeacher(wallet.id, { amount, description: sendDescription });
      toast.success(t('wallets.sendSuccess'));
      setSendMoneyOpen(false);
      setSendAmount('');
      setSendDescription('');
      fetchWallet();
    } catch (error) {
      toast.error(error.response?.data?.message || t('wallets.sendFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) {
      toast.error(t('wallets.invalidAmount'));
      return;
    }
    setSubmitting(true);
    try {
      await adminAPI.depositToStudentWallet({ studentId: id, amount, description: depositDescription });
      toast.success(t('wallets.depositSuccess'));
      setDepositOpen(false);
      setDepositAmount('');
      setDepositDescription('');
      fetchWallet();
      if (wallet?.id) fetchStudentTransactions(wallet.id, 1);
    } catch (error) {
      toast.error(error.response?.data?.message || t('wallets.depositFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      toast.error(t('wallets.invalidAmount'));
      return;
    }
    if (amount > (wallet?.balance ?? 0)) {
      toast.error(t('wallets.insufficientBalance'));
      return;
    }
    setSubmitting(true);
    try {
      await adminAPI.withdrawFromStudentWallet({ studentId: id, amount, description: withdrawDescription });
      toast.success(t('wallets.withdrawSuccess'));
      setWithdrawOpen(false);
      setWithdrawAmount('');
      setWithdrawDescription('');
      fetchWallet();
      if (wallet?.id) fetchStudentTransactions(wallet.id, 1);
    } catch (error) {
      toast.error(error.response?.data?.message || t('wallets.withdrawFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const displayName = isTeacher
    ? (wallet?.teacher?.user && [wallet.teacher.user.firstName, wallet.teacher.user.lastName].filter(Boolean).join(' ')) || '—'
    : (wallet?.student && [wallet.student.firstName, wallet.student.lastName].filter(Boolean).join(' ')) || '—';
  const displayEmail = isTeacher ? wallet?.teacher?.user?.email : wallet?.student?.email;
  const transactions = isTeacher ? (wallet?.transactions || []) : studentTx.transactions;

  const hourPrice = wallet?.hourlyRate ?? wallet?.hourPrice ?? wallet?.teacher?.hourlyRate ?? 0;
  const totalHours = wallet?.totalHours ?? 0;            // ← session-based (from creditFromSession)
  const totalWorkedHours = wallet?.totalWorkedHours ?? 0; // ← booking-duration-based (cross-check)
  const totalEarnedFromBookings = wallet?.totalEarnedFromBookings ?? (totalWorkedHours * hourPrice);
  const totalEarnedFromSessions = wallet?.totalEarnedFromSessions ?? null; // صافي من معاملات الجلسات فقط
  const txPagination = studentTx.pagination;

  if (loading && !wallet) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center bg-muted/30">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!wallet) return null;

  return (
    <div className="flex min-h-0 flex-1 flex-col space-y-6 animate-in fade-in duration-300" style={{ minWidth: 0 }} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* تنبيه معلومات المحفظة */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4 flex items-start gap-3">
        <div className="p-2 bg-purple-100 rounded-lg">
          <FiInfo className="h-5 w-5 text-purple-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-purple-900 mb-1">تفاصيل محفظة {isTeacher ? 'الشيخ' : 'الطالب'}</h3>
          <p className="text-sm text-purple-700">
            يمكنك إدارة رصيد المحفظة وعرض تاريخ المعاملات المالية من هذه الصفحة.
          </p>
        </div>
      </div>

      {/* Page Header */}
      <section className="flex flex-col gap-4">
        {/* Header - Mobile */}
        <div className="md:hidden">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/wallets')}
              className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
              aria-label="العودة للمحافظ"
            >
              <FiArrowRight className="text-xl text-gray-600 dark:text-gray-300 rotate-180" />
            </button>
            <div className="flex-1">
              <p className="text-xs font-semibold tracking-wide text-purple-600 dark:text-purple-400 uppercase mb-1">
                المحافظ → {isTeacher ? 'محفظة شيخ' : 'محفظة طالب'}
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                محفظة {displayName}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                إدارة الرصيد والمعاملات المالية
              </p>
            </div>
          </div>
          
          {/* Action buttons - Mobile */}
          <div className="flex gap-2">
            {isTeacher && (
              <>
                <button
                  onClick={() => setSendMoneyOpen(true)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-bold shadow-lg hover:from-green-700 hover:to-green-800 transition-all duration-200"
                >
                  <FiSend className="text-lg" />
                  إرسال مال
                </button>
                <button
                  onClick={async () => {
                    try {
                      await adminAPI[wallet.isActive ? 'disableWallet' : 'enableWallet'](wallet.id);
                      toast.success(wallet.isActive ? 'تم تعطيل المحفظة' : 'تم تفعيل المحفظة');
                      fetchWallet();
                    } catch (e) {
                      toast.error(e.response?.data?.message || 'حدث خطأ');
                    }
                  }}
                  className="px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  {wallet.isActive ? 'تعطيل' : 'تفعيل'}
                </button>
              </>
            )}
            {!isTeacher && (
              <>
                <button
                  onClick={() => setDepositOpen(true)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-bold shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
                >
                  <FiPlus className="text-lg" />
                  إيداع
                </button>
                <button
                  onClick={() => setWithdrawOpen(true)}
                  disabled={(wallet.balance ?? 0) <= 0}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-orange-700 text-white text-sm font-bold shadow-lg hover:from-orange-700 hover:to-orange-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiMinus className="text-lg" />
                  سحب
                </button>
              </>
            )}
          </div>
        </div>

        {/* Header - Desktop */}
        <div className="hidden md:flex md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/wallets')}
              className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
              aria-label="العودة للمحافظ"
            >
              <FiArrowRight className="text-xl text-gray-600 dark:text-gray-300 rotate-180" />
            </button>
            <div>
              <p className="text-xs font-semibold tracking-wide text-purple-600 dark:text-purple-400 uppercase mb-1">
                المحافظ → {isTeacher ? 'محفظة شيخ' : 'محفظة طالب'}
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                محفظة {displayName}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm flex items-center gap-2">
                <FiMail className="h-4 w-4" />
                {displayEmail}
              </p>
            </div>
          </div>
          
          {/* Action buttons - Desktop */}
          <div className="flex items-center gap-3 flex-wrap">
            {isTeacher && (
              <>
                <button
                  onClick={() => setSendMoneyOpen(true)}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-bold shadow-lg hover:from-green-700 hover:to-green-800 transition-all duration-200"
                >
                  <FiSend className="text-lg" />
                  إرسال مال للشيخ
                </button>
                <button
                  onClick={async () => {
                    try {
                      await adminAPI[wallet.isActive ? 'disableWallet' : 'enableWallet'](wallet.id);
                      toast.success(wallet.isActive ? 'تم تعطيل المحفظة' : 'تم تفعيل المحفظة');
                      fetchWallet();
                    } catch (e) {
                      toast.error(e.response?.data?.message || 'حدث خطأ');
                    }
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  {wallet.isActive ? 'تعطيل المحفظة' : 'تفعيل المحفظة'}
                </button>
              </>
            )}
            {!isTeacher && (
              <>
                <button
                  onClick={() => setDepositOpen(true)}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-bold shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
                >
                  <FiPlus className="text-lg" />
                  إيداع في المحفظة
                </button>
                <button
                  onClick={() => setWithdrawOpen(true)}
                  disabled={(wallet.balance ?? 0) <= 0}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-orange-700 text-white text-sm font-bold shadow-lg hover:from-orange-700 hover:to-orange-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiMinus className="text-lg" />
                  سحب من المحفظة
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* الرصيد الحالي (المتبقي) */}
        <div className="overflow-hidden rounded-2xl border border-purple-200 dark:border-purple-800/50 bg-white dark:bg-gray-800 shadow-sm">
          <div className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {isTeacher ? 'المتبقي (الرصيد الحالي)' : 'الرصيد الحالي'}
                </p>
                <p className="mt-2 text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {formatCurrency(wallet.balance)}
                </p>
              </div>
              <div className="flex size-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                <FiCreditCard className="size-6" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1">
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full',
                  wallet.isActive
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                )}
              >
                {wallet.isActive ? (
                  <>
                    <FiCheckCircle className="size-3" />
                    نشط
                  </>
                ) : (
                  <>
                    <FiXCircle className="size-3" />
                    معطل
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        {isTeacher && (
          <>
            {/* الرصيد المعلق للمشايخ */}
            <div className="overflow-hidden rounded-2xl border border-orange-200 dark:border-orange-800/50 bg-white dark:bg-gray-800 shadow-sm">
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      الرصيد المعلق
                    </p>
                    <p className="mt-2 text-3xl font-bold text-orange-600 dark:text-orange-400">
                      {formatCurrency(wallet.pendingBalance)}
                    </p>
                  </div>
                  <div className="flex size-12 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                    <FiClock className="size-6" />
                  </div>
                </div>
                <p className="mt-3 text-xs text-gray-600 dark:text-gray-400">
                  في انتظار التحويل
                </p>
              </div>
            </div>

            {/* الرصيد المرسل / إجمالي الأرباح */}
            <div className="overflow-hidden rounded-2xl border border-emerald-200 dark:border-emerald-800/50 bg-white dark:bg-gray-800 shadow-sm">
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      الرصيد المرسل (إجمالي الأرباح)
                    </p>
                    <p className="mt-2 text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(wallet.totalEarned)}
                    </p>
                  </div>
                  <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                    <FiTrendingUp className="size-6" />
                  </div>
                </div>
                <p className="mt-3 text-xs text-gray-600 dark:text-gray-400">
                  منذ بداية العمل
                </p>
              </div>
            </div>
          </>
        )}

        {!isTeacher && (
          <>
            {/* إجمالي الإيداعات للطلاب */}
            <div className="overflow-hidden rounded-2xl border border-blue-200 dark:border-blue-800/50 bg-white dark:bg-gray-800 shadow-sm">
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      إجمالي الإيداعات
                    </p>
                    <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(wallet.totalDeposited)}
                    </p>
                  </div>
                  <div className="flex size-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                    <FiUpload className="size-6" />
                  </div>
                </div>
                <p className="mt-3 text-xs text-gray-600 dark:text-gray-400">
                  كل المبالغ المودعة
                </p>
              </div>
            </div>

            {/* إجمالي المصروفات */}
            <div className="overflow-hidden rounded-2xl border border-red-200 dark:border-red-800/50 bg-white dark:bg-gray-800 shadow-sm">
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      إجمالي المصروفات
                    </p>
                    <p className="mt-2 text-3xl font-bold text-red-600 dark:text-red-400">
                      {formatCurrency(wallet.totalSpent)}
                    </p>
                  </div>
                  <div className="flex size-12 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                    <FiTrendingDown className="size-6" />
                  </div>
                </div>
                <p className="mt-3 text-xs text-gray-600 dark:text-gray-400">
                  كل المبالغ المنصرفة
                </p>
              </div>
            </div>
          </>
        )}

        {/* معلومات المستخدم */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 shadow-sm">
          <div className="p-5">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  {isTeacher ? 'الشيخ' : 'الطالب'}
                </p>
                <h3 className="font-bold text-gray-900 dark:text-white truncate text-lg">
                  {displayName}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate flex items-center gap-1 mt-1">
                  <FiMail className="size-3" />
                  {displayEmail}
                </p>
              </div>
              <div className="flex size-12 items-center justify-center rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                <FiUser className="size-6" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* عملية الحساب من الحجوزات: عدد الساعات + سعر الساعة + المبلغ المحسوب + الرصيد المرسل + المتبقي + المعاملات */}
      {isTeacher && (
        <div className="rounded-2xl border border-indigo-200 dark:border-indigo-800/50 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-indigo-50/50 dark:bg-indigo-900/20">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FiDollarSign className="text-indigo-600 dark:text-indigo-400" />
              العملية الحسابية لأرباح الشيخ — ساعات التدريس الفعلية
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              يتم احتساب الأرباح تلقائيًا لحظة انتهاء كل جلسة: عدد الساعات × سعر الساعة
            </p>
          </div>
          <div className="p-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {/* الساعات من الجلسات الفعلية */}
              <div className="lg:col-span-1 rounded-xl border-2 border-indigo-300 dark:border-indigo-600 p-4 bg-indigo-50/80 dark:bg-indigo-900/30">
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">ساعات التدريس الفعلية</p>
                <p className="mt-2 text-2xl font-bold text-indigo-700 dark:text-indigo-300">{Number(totalHours).toFixed(2)} ساعة</p>
                <p className="mt-1 text-xs text-indigo-500 dark:text-indigo-400">من الجلسات المكتملة</p>
              </div>
              {/* سعر الساعة */}
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-gray-50/50 dark:bg-gray-700/30">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">سعر الساعة</p>
                <p className="mt-2 text-2xl font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(hourPrice)}</p>
              </div>
              {/* إجمالي الأرباح من الساعات المعروضة (قبل الرسوم) */}
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-gray-50/50 dark:bg-gray-700/30">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">إجمالي الأرباح (محسوبة من الساعات)</p>
                <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalHours * hourPrice)}</p>
                <p className="mt-1 text-xs text-gray-500">قبل خصم رسوم المنصة</p>
              </div>
              {/* المعادلة */}
              <div className="lg:col-span-2 rounded-xl border border-indigo-200 dark:border-indigo-700 p-4 bg-indigo-50/50 dark:bg-indigo-900/20">
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">معادلة الاحتساب (من الساعات المسجلة)</p>
                <p className="mt-2 text-sm font-mono text-gray-700 dark:text-gray-300">
                  {Number(totalHours).toFixed(2)} ساعة × {formatCurrency(hourPrice)}
                </p>
                <p className="mt-1 text-lg font-bold text-emerald-600 dark:text-emerald-400">= {formatCurrency(totalHours * hourPrice)} <span className="text-xs font-normal text-gray-500">(إجمالي قبل رسوم المنصة)</span></p>
                {totalEarnedFromSessions != null && (
                  <p className="mt-2 text-xs text-indigo-600 dark:text-indigo-400">
                    صافي من الجلسات فقط (من سجل المعاملات): <strong>{formatCurrency(totalEarnedFromSessions)}</strong>
                  </p>
                )}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                إجمالي المرسل من المحفظة يشمل أرباح الجلسات وأي تحويلات يدوية أو إضافات أخرى منذ بداية العمل.
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  الرصيد المرسل (إجمالي الاعتمادات): <strong className="text-emerald-600 dark:text-emerald-400">{formatCurrency(wallet.totalEarned ?? 0)}</strong>
                </span>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  الرصيد المتاح: <strong className="text-purple-600 dark:text-purple-400">{formatCurrency(wallet.balance ?? 0)}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* طلبات السحب للمشايخ */}
      {isTeacher && (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FiDownload className="text-orange-600 dark:text-orange-400" />
              طلبات سحب الأرباح
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              عرض جميع طلبات سحب الأرباح وحالتها
            </p>
          </div>
          
          {!(wallet.payoutRequests?.length > 0) ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30 mb-4">
                <FiDownload className="size-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                لا توجد طلبات سحب
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                لم يقم الشيخ بتقديم أي طلبات لسحب الأرباح حتى الآن
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">المبلغ</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">الحالة</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">تاريخ الطلب</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">تاريخ المعالجة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {wallet.payoutRequests.map((req) => (
                    <tr key={req.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 tabular-nums text-sm font-bold text-orange-600 dark:text-orange-400">{formatCurrency(req.amount)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={cn(
                          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                          req.status === 'PENDING' && 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
                          req.status === 'APPROVED' && 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
                          req.status === 'COMPLETED' && 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
                          req.status === 'REJECTED' && 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                        )}>
                          {req.status === 'PENDING' ? (
                            <>
                              <FiClock className="size-3" />
                              في الانتظار
                            </>
                          ) : req.status === 'APPROVED' ? (
                            <>
                              <FiCheckCircle className="size-3" />
                              موافق عليه
                            </>
                          ) : req.status === 'COMPLETED' ? (
                            <>
                              <FiCheckCircle className="size-3" />
                              مكتمل
                            </>
                          ) : (
                            <>
                              <FiXCircle className="size-3" />
                              مرفوض
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-1">
                          <FiCalendar className="size-3" />
                          {formatDate(req.requestedAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                        {req.processedAt || req.approvedAt ? (
                          <div className="flex items-center gap-1">
                            <FiCalendar className="size-3" />
                            {formatDate(req.processedAt || req.approvedAt)}
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* المعاملات التي حدثت */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FiActivity className="text-purple-600 dark:text-purple-400" />
            المعاملات التي حدثت (تاريخ المعاملات المالية)
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            عرض جميع العمليات المالية التي تمت على هذه المحفظة
          </p>
        </div>
        
        {!transactions?.length ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30 mb-4">
              <FiActivity className="size-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              لا توجد معاملات مالية
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              لم تتم أي عمليات مالية على هذه المحفظة حتى الآن
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">التاريخ</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">نوع العملية</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">المبلغ</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">الوصف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-1">
                          <FiCalendar className="size-3" />
                          {formatDate(tx.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={cn(
                          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                          tx.type === 'SESSION_EARNING'
                            ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                            : (tx.type === 'CREDIT' || tx.type === 'DEPOSIT')
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                              : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                        )}>
                          {tx.type === 'SESSION_EARNING' ? (
                            <>
                              <FiBookOpen className="size-3" />
                              أرباح جلسة
                            </>
                          ) : (tx.type === 'CREDIT' || tx.type === 'DEPOSIT') ? (
                            <>
                              <FiTrendingUp className="size-3" />
                              إيداع
                            </>
                          ) : (
                            <>
                              <FiTrendingDown className="size-3" />
                              سحب
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={cn(
                          'tabular-nums text-sm font-bold',
                          tx.type === 'SESSION_EARNING'
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : (tx.type === 'CREDIT' || tx.type === 'DEPOSIT')
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-red-600 dark:text-red-400'
                        )}>
                          {tx.type !== 'WITHDRAWAL' && tx.type !== 'PAYMENT' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{tx.description || 'بدون وصف'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination للطلاب */}
            {!isTeacher && txPagination?.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-4 py-3 sm:px-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStudentTxPage((p) => Math.max(1, p - 1))}
                  disabled={studentTxPage <= 1}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50"
                >
                  السابق
                </Button>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  صفحة {studentTxPage} من {txPagination.totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStudentTxPage((p) => p + 1)}
                  disabled={studentTxPage >= txPagination.totalPages}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50"
                >
                  التالي
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Dialogs */}
      <Dialog open={sendMoneyOpen} onOpenChange={setSendMoneyOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FiSend className="text-green-600" />
              إرسال مال للشيخ
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              أدخل المبلغ الذي تريد إرساله إلى محفظة الشيخ مع وصف اختياري للعملية.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSendMoney} className="space-y-6">
            <div>
              <Label htmlFor="send-amount" className="text-gray-900 font-medium flex items-center gap-1">
                <FiDollarSign className="size-4 text-green-600" />
                المبلغ *
              </Label>
              <Input 
                id="send-amount" 
                type="number" 
                step="0.01" 
                min="0" 
                value={sendAmount} 
                onChange={(e) => setSendAmount(e.target.value)} 
                required 
                className="mt-2 text-lg font-semibold" 
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500 mt-1">{isRTL ? 'أدخل المبلغ بالجنيه المصري' : 'Enter amount in Egyptian Pounds (EGP)'}</p>
            </div>
            <div>
              <Label htmlFor="send-desc" className="text-gray-900 font-medium">وصف العملية (اختياري)</Label>
              <Input 
                id="send-desc" 
                value={sendDescription} 
                onChange={(e) => setSendDescription(e.target.value)} 
                placeholder="مثال: مكافأة أداء، راتب شهري، إلخ..." 
                className="mt-2" 
              />
            </div>
            <DialogFooter className="gap-2 border-t border-gray-200 pt-4">
              <Button type="button" variant="outline" onClick={() => setSendMoneyOpen(false)} className="flex-1">
                إلغاء
              </Button>
              <Button 
                type="submit" 
                disabled={submitting}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    <FiSend className="mr-2" />
                    إرسال المبلغ
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FiPlus className="text-blue-600" />
              إيداع في محفظة الطالب
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              أدخل المبلغ الذي تريد إيداعه في محفظة الطالب مع وصف اختياري للعملية.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleDeposit} className="space-y-6">
            <div>
              <Label htmlFor="deposit-amount" className="text-gray-900 font-medium flex items-center gap-1">
                <FiDollarSign className="size-4 text-blue-600" />
                المبلغ *
              </Label>
              <Input 
                id="deposit-amount" 
                type="number" 
                step="0.01" 
                min="0" 
                value={depositAmount} 
                onChange={(e) => setDepositAmount(e.target.value)} 
                required 
                className="mt-2 text-lg font-semibold" 
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500 mt-1">{isRTL ? 'أدخل المبلغ بالجنيه المصري' : 'Enter amount in Egyptian Pounds (EGP)'}</p>
            </div>
            <div>
              <Label htmlFor="deposit-desc" className="text-gray-900 font-medium">وصف العملية (اختياري)</Label>
              <Input 
                id="deposit-desc" 
                value={depositDescription} 
                onChange={(e) => setDepositDescription(e.target.value)} 
                placeholder="مثال: شحن رصيد، هدية، إلخ..." 
                className="mt-2" 
              />
            </div>
            <DialogFooter className="gap-2 border-t border-gray-200 pt-4">
              <Button type="button" variant="outline" onClick={() => setDepositOpen(false)} className="flex-1">
                إلغاء
              </Button>
              <Button 
                type="submit" 
                disabled={submitting}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    جاري الإيداع...
                  </>
                ) : (
                  <>
                    <FiPlus className="mr-2" />
                    إيداع المبلغ
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FiMinus className="text-orange-600" />
              سحب من محفظة الطالب
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              أدخل المبلغ الذي تريد سحبه من محفظة الطالب. لا يمكن سحب أكثر من الرصيد المتاح.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleWithdraw} className="space-y-6">
            <div>
              <Label htmlFor="withdraw-amount" className="text-gray-900 font-medium flex items-center gap-1">
                <FiDollarSign className="size-4 text-orange-600" />
                المبلغ *
              </Label>
              <Input 
                id="withdraw-amount" 
                type="number" 
                step="0.01" 
                min="0" 
                max={wallet?.balance} 
                value={withdrawAmount} 
                onChange={(e) => setWithdrawAmount(e.target.value)} 
                required 
                className="mt-2 text-lg font-semibold" 
                placeholder="0.00"
              />
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-gray-500">الرصيد المتاح للسحب</p>
                <p className="text-sm font-semibold text-orange-600">{formatCurrency(wallet?.balance)}</p>
              </div>
            </div>
            <div>
              <Label htmlFor="withdraw-desc" className="text-gray-900 font-medium">وصف العملية (اختياري)</Label>
              <Input 
                id="withdraw-desc" 
                value={withdrawDescription} 
                onChange={(e) => setWithdrawDescription(e.target.value)} 
                placeholder="مثال: سحب نقدي، استرداد، إلخ..." 
                className="mt-2" 
              />
            </div>
            <DialogFooter className="gap-2 border-t border-gray-200 pt-4">
              <Button type="button" variant="outline" onClick={() => setWithdrawOpen(false)} className="flex-1">
                إلغاء
              </Button>
              <Button 
                type="submit" 
                disabled={submitting}
                className="flex-1 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    جاري السحب...
                  </>
                ) : (
                  <>
                    <FiMinus className="mr-2" />
                    سحب المبلغ
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WalletDetail;
