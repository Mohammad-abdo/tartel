import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { adminAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FiArrowLeft } from 'react-icons/fi';
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

function formatDate(d) {
  if (!d) return '—';
  try {
    const date = new Date(d);
    return date.toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  } catch {
    return new Date(d).toISOString().slice(0, 16).replace('T', ' ');
  }
}
const formatAmount = (n) => `$${(Number(n) || 0).toFixed(2)}`;

const WalletDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const isTeacher = location.pathname.includes('/wallets/teacher/');
  const { t } = useTranslation();
  const { language } = useLanguage();
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
        setWallet(response.data || response);
      } else {
        const response = await adminAPI.getStudentWallet(id);
        setWallet(response.data || response);
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
    <div className="flex min-h-0 flex-1 flex-col bg-background" style={{ minWidth: 0 }}>
      {/* Header: back, identity, status, actions — no decoration */}
      <div className="border-b border-border bg-card px-6 py-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => navigate('/wallets')} className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
              <FiArrowLeft className="size-4" />
              {t('common.back')}
            </button>
            <span className="text-border">|</span>
            <div>
              <h1 className="text-base font-semibold text-foreground">{displayName}</h1>
              <p className="text-xs text-muted-foreground">{displayEmail || wallet.id}</p>
            </div>
            <span className="text-border">|</span>
            <span className={cn('text-sm font-medium', wallet.isActive ? 'text-green-700' : 'text-red-700')}>
              {wallet.isActive ? t('wallets.active') : t('wallets.disabled')}
            </span>
          </div>
          <div className="flex gap-2">
            {isTeacher && (
              <>
                <Button size="sm" onClick={() => setSendMoneyOpen(true)}>{t('wallets.sendMoney')}</Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      await adminAPI[wallet.isActive ? 'disableWallet' : 'enableWallet'](wallet.id);
                      toast.success(wallet.isActive ? t('wallets.walletDisabled') : t('wallets.walletEnabled'));
                      fetchWallet();
                    } catch (e) {
                      toast.error(e.response?.data?.message || t('common.error'));
                    }
                  }}
                >
                  {wallet.isActive ? t('wallets.disableWallet') : t('wallets.enableWallet')}
                </Button>
              </>
            )}
            {!isTeacher && (
              <>
                <Button size="sm" onClick={() => setDepositOpen(true)}>{t('wallets.deposit')}</Button>
                <Button variant="outline" size="sm" onClick={() => setWithdrawOpen(true)} disabled={(wallet.balance ?? 0) <= 0}>
                  {t('wallets.withdraw')}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Summary: label/value strip — no cards, no icons */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-2 border-b border-border bg-card px-6 py-4 md:grid-cols-4 lg:grid-cols-6">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t('wallets.balance')}</div>
          <div className="mt-0.5 tabular-nums text-sm font-semibold text-foreground">{formatAmount(wallet.balance)}</div>
        </div>
        {isTeacher && (
          <>
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t('wallets.pendingBalance')}</div>
              <div className="mt-0.5 tabular-nums text-sm font-semibold text-foreground">{formatAmount(wallet.pendingBalance)}</div>
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t('wallets.totalEarned')}</div>
              <div className="mt-0.5 tabular-nums text-sm font-semibold text-foreground">{formatAmount(wallet.totalEarned)}</div>
            </div>
          </>
        )}
        {!isTeacher && (
          <>
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t('wallets.totalDeposited')}</div>
              <div className="mt-0.5 tabular-nums text-sm font-semibold text-foreground">{formatAmount(wallet.totalDeposited)}</div>
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t('wallets.totalSpent')}</div>
              <div className="mt-0.5 tabular-nums text-sm font-semibold text-foreground">{formatAmount(wallet.totalSpent)}</div>
            </div>
          </>
        )}
      </div>

      {/* Payout requests (teacher) — table only, no card */}
      {isTeacher && (
        <div className="border-b border-border bg-card px-6 py-4">
          <h2 className="mb-3 text-sm font-semibold text-foreground">{t('wallets.payoutRequests')}</h2>
          {!(wallet.payoutRequests?.length > 0) ? (
            <p className="py-4 text-sm text-muted-foreground">{t('wallets.noPayoutRequests')}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('wallets.amount')}</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('wallets.status')}</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('wallets.requestedAt')}</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('wallets.processedAt')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {wallet.payoutRequests.map((req) => (
                    <tr key={req.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 tabular-nums text-sm font-medium text-gray-900 dark:text-white">{formatAmount(req.amount)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={cn('font-medium', req.status === 'PENDING' && 'text-amber-600 dark:text-amber-400', req.status === 'APPROVED' && 'text-emerald-600 dark:text-emerald-400', req.status === 'COMPLETED' && 'text-emerald-600 dark:text-emerald-400', req.status === 'REJECTED' && 'text-red-600 dark:text-red-400')}>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{formatDate(req.requestedAt)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{formatDate(req.processedAt || req.approvedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Transactions — table only, no card */}
      <div className="flex-1 overflow-auto border-b border-border bg-card px-6 py-4">
        <h2 className="mb-3 text-sm font-semibold text-foreground">{t('wallets.transactions')}</h2>
        {!transactions?.length ? (
          <p className="py-6 text-sm text-muted-foreground">{t('wallets.noTransactions')}</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('wallets.date')}</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('wallets.type')}</th>
                    <th className="px-6 py-3 text-end text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('wallets.amount')}</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('wallets.description')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{formatDate(tx.createdAt)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={cn('font-medium', (tx.type === 'CREDIT' || tx.type === 'DEPOSIT') ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400')}>
                          {(tx.type === 'CREDIT' || tx.type === 'DEPOSIT') ? t('wallets.credit') : t('wallets.debit')}
                        </span>
                      </td>
                      <td className={cn('px-6 py-4 text-end tabular-nums text-sm font-medium', (tx.type === 'CREDIT' || tx.type === 'DEPOSIT') ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400')}>
                        {(tx.type === 'CREDIT' || tx.type === 'DEPOSIT') ? '+' : '-'}{formatAmount(tx.amount)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{tx.description || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!isTeacher && txPagination?.totalPages > 1 && (
              <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-sm text-muted-foreground">
                <button type="button" onClick={() => setStudentTxPage((p) => Math.max(1, p - 1))} disabled={studentTxPage <= 1} className="hover:text-foreground disabled:opacity-50">
                  {t('common.previous')}
                </button>
                <span>{t('users.pageOf', { page: studentTxPage, totalPages: txPagination.totalPages })}</span>
                <button type="button" onClick={() => setStudentTxPage((p) => p + 1)} disabled={studentTxPage >= txPagination.totalPages} className="hover:text-foreground disabled:opacity-50">
                  {t('common.next')}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Dialogs */}
      <Dialog open={sendMoneyOpen} onOpenChange={setSendMoneyOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-section-title">{t('wallets.sendMoney')}</DialogTitle>
            <DialogDescription className="text-muted-foreground">{t('wallets.sendMoneyDescription')}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSendMoney} className="space-y-4">
            <div>
              <Label htmlFor="send-amount" className="text-foreground">{t('wallets.amount')} *</Label>
              <Input id="send-amount" type="number" step="0.01" min="0" value={sendAmount} onChange={(e) => setSendAmount(e.target.value)} required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="send-desc" className="text-foreground">{t('wallets.description')}</Label>
              <Input id="send-desc" value={sendDescription} onChange={(e) => setSendDescription(e.target.value)} placeholder={t('wallets.optional')} className="mt-1" />
            </div>
            <DialogFooter className="gap-2 border-t border-border pt-4">
              <Button type="button" variant="outline" onClick={() => setSendMoneyOpen(false)}>{t('common.cancel')}</Button>
              <Button type="submit" disabled={submitting}>{submitting ? t('common.saving') : t('common.save')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-section-title">{t('wallets.deposit')}</DialogTitle>
            <DialogDescription className="text-muted-foreground">{t('wallets.depositDescription')}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleDeposit} className="space-y-4">
            <div>
              <Label htmlFor="deposit-amount" className="text-foreground">{t('wallets.amount')} *</Label>
              <Input id="deposit-amount" type="number" step="0.01" min="0" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="deposit-desc" className="text-foreground">{t('wallets.description')}</Label>
              <Input id="deposit-desc" value={depositDescription} onChange={(e) => setDepositDescription(e.target.value)} placeholder={t('wallets.optional')} className="mt-1" />
            </div>
            <DialogFooter className="gap-2 border-t border-border pt-4">
              <Button type="button" variant="outline" onClick={() => setDepositOpen(false)}>{t('common.cancel')}</Button>
              <Button type="submit" disabled={submitting}>{submitting ? t('common.saving') : t('common.save')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-section-title">{t('wallets.withdraw')}</DialogTitle>
            <DialogDescription className="text-muted-foreground">{t('wallets.withdrawDescription')}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleWithdraw} className="space-y-4">
            <div>
              <Label htmlFor="withdraw-amount" className="text-foreground">{t('wallets.amount')} *</Label>
              <Input id="withdraw-amount" type="number" step="0.01" min="0" max={wallet?.balance} value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} required className="mt-1" />
              <p className="mt-1 text-sm text-muted-foreground">{t('wallets.availableBalance')}: {formatAmount(wallet?.balance)}</p>
            </div>
            <div>
              <Label htmlFor="withdraw-desc" className="text-foreground">{t('wallets.description')}</Label>
              <Input id="withdraw-desc" value={withdrawDescription} onChange={(e) => setWithdrawDescription(e.target.value)} placeholder={t('wallets.optional')} className="mt-1" />
            </div>
            <DialogFooter className="gap-2 border-t border-border pt-4">
              <Button type="button" variant="outline" onClick={() => setWithdrawOpen(false)}>{t('common.cancel')}</Button>
              <Button type="submit" disabled={submitting}>{submitting ? t('common.saving') : t('common.save')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WalletDetail;
