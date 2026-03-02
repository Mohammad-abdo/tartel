import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { reviewAPI } from '../services/api';
import { FiStar, FiUser, FiBook, FiCalendar, FiMessageCircle, FiEdit2, FiTrash2, FiPauseCircle, FiPlayCircle } from 'react-icons/fi';
import { Card, CardContent } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { toast } from 'react-toastify';
import { cn } from '../lib/utils';

const TYPES = [
  { value: '', labelKey: 'reviews.filterAll', label: 'All' },
  { value: 'SHEIKH', labelKey: 'reviews.filterSheikh', label: 'Sheikh' },
  { value: 'COURSE', labelKey: 'reviews.filterCourse', label: 'Course' },
  { value: 'BOOKING', labelKey: 'reviews.filterBooking', label: 'Booking' },
];

const PAGE_SIZE = 10;

function displayUserName(user, lang) {
  if (!user) return '—';
  const isAr = lang === 'ar';
  const first = isAr ? user.firstNameAr || user.firstName : user.firstName;
  const last = isAr ? user.lastNameAr || user.lastName : user.lastName;
  return [first, last].filter(Boolean).join(' ') || user.email || '—';
}

function displayRelatedName(review, lang) {
  const isAr = lang === 'ar';
  if (review.type === 'SHEIKH' && review.teacher?.user) {
    return displayUserName(review.teacher.user, lang);
  }
  if (review.type === 'COURSE' && review.course) {
    return isAr ? review.course.titleAr || review.course.title : review.course.title;
  }
  if (review.type === 'BOOKING' && review.booking) {
    const d = review.booking.date ? new Date(review.booking.date).toLocaleDateString() : review.booking.id?.slice(0, 8);
    const who = review.booking.teacher?.user ? displayUserName(review.booking.teacher.user, lang) : '';
    return who ? `${who} — ${d}` : (d || review.booking.id?.slice(0, 8) || '—');
  }
  return '—';
}

function typeLabel(type, t) {
  const found = TYPES.find((x) => x.value === type);
  return found ? (t(found.labelKey) || found.label) : type;
}

const Reviews = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { user } = useAuth();
  const isRTL = language === 'ar';
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const canManage = !!user;

  const [data, setData] = useState({ reviews: [], averageByType: null, pagination: null });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [includeSuspended, setIncludeSuspended] = useState(false);
  const [editReview, setEditReview] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');
  const [deleteReview, setDeleteReview] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReviews = async (typeFilter, pageNum = 1) => {
    setLoading(true);
    try {
      const params = { page: pageNum, limit: PAGE_SIZE };
      if (typeFilter) params.type = typeFilter;
      if (isAdmin && includeSuspended) params.includeSuspended = 'true';
      const res = await reviewAPI.getAll(params);
      const raw = res?.data ?? res;
      setData({
        reviews: Array.isArray(raw.reviews) ? raw.reviews : raw.reviews ?? [],
        averageByType: raw.averageByType ?? null,
        pagination: raw.pagination ?? null,
      });
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      setData({ reviews: [], averageByType: null, pagination: null });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(filter, page);
  }, [filter, page, includeSuspended, isAdmin]);

  const openEdit = (review) => {
    setEditReview(review);
    setEditRating(review?.rating ?? 5);
    setEditComment(review?.comment ?? '');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editReview) return;
    setActionLoading(true);
    try {
      await reviewAPI.updateById(editReview.id, { rating: editRating, comment: editComment || undefined });
      toast.success(t('reviews.updated') || 'Review updated');
      setEditReview(null);
      fetchReviews(filter, page);
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.error') || 'Error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteReview) return;
    setActionLoading(true);
    try {
      await reviewAPI.deleteById(deleteReview.id);
      toast.success(t('reviews.deleted') || 'Review deleted');
      setDeleteReview(null);
      fetchReviews(filter, page);
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.error') || 'Error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspend = async (review) => {
    setActionLoading(true);
    try {
      await reviewAPI.suspend(review.id);
      toast.success(t('reviews.suspended') || 'Review suspended');
      fetchReviews(filter, page);
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.error') || 'Error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivate = async (review) => {
    setActionLoading(true);
    try {
      await reviewAPI.activate(review.id);
      toast.success(t('reviews.activated') || 'Review activated');
      fetchReviews(filter, page);
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.error') || 'Error');
    } finally {
      setActionLoading(false);
    }
  };

  const canEditReview = (review) => canManage && (isAdmin || review.userId === user?.id);
  const canDeleteReview = (review) => canManage && (isAdmin || review.userId === user?.id);

  const handleFilterChange = (value) => {
    setFilter(value);
    setPage(1);
  };

  const renderStars = (rating, size = 'size-4') => {
    const r = Math.min(5, Math.max(0, Number(rating) || 0));
    return Array.from({ length: 5 }).map((_, i) => (
      <FiStar
        key={i}
        className={cn(size, i < r ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600')}
      />
    ));
  };

  const reviews = data.reviews;
  const avg = data.averageByType;
  const pagination = data.pagination;
  const currentAvg = filter ? avg?.[filter] : avg?.all;
  const totalPages = pagination?.totalPages ?? 1;
  const total = pagination?.total ?? 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col space-y-6 animate-in fade-in duration-300" style={{ minWidth: 0 }} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Info banner - هوية الصفحة */}
      <div className="rounded-xl border border-purple-200 dark:border-purple-800/50 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-4 flex items-start gap-3">
        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg shrink-0">
          <FiMessageCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-medium text-purple-900 dark:text-purple-100 mb-1">
            {t('reviews.title') || 'Reviews'}
          </h3>
          <p className="text-sm text-purple-700 dark:text-purple-300">
            {t('reviews.subtitle') || 'All reviews: Sheikh, Course, and Booking'}
          </p>
        </div>
      </div>

      {/* Page Header */}
      <section className={cn('flex flex-col gap-1', isRTL && 'text-right')}>
        <p className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
          {t('reviews.title') || 'Reviews'}
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
          {t('reviews.title') || 'Reviews'}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {t('reviews.subtitle') || 'Filter by type and browse with pagination'}
        </p>
      </section>

      {/* Filters + Average - بطاقات متناسقة مع الهوية */}
      <div className="rounded-2xl border border-purple-200 dark:border-purple-800/50 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-purple-50/50 dark:bg-purple-900/20">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            {t('common.filter') || 'Filter'}
          </h2>
        </div>
        <CardContent className="pt-5 pb-5">
          <div className="flex flex-wrap gap-2">
            {TYPES.map(({ value, labelKey, label }) => (
              <button
                key={value || 'all'}
                type="button"
                onClick={() => handleFilterChange(value)}
                className={cn(
                  'px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  filter === value
                    ? 'bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                )}
              >
                {t(labelKey) || label}
              </button>
            ))}
          </div>
          {isAdmin && (
            <label className={cn('mt-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer', isRTL && 'flex-row-reverse')}>
              <input
                type="checkbox"
                checked={includeSuspended}
                onChange={(e) => { setIncludeSuspended(e.target.checked); setPage(1); }}
                className="rounded border-gray-300"
              />
              <span>{t('reviews.includeSuspended') || 'Include suspended'}</span>
            </label>
          )}
          {currentAvg != null && (
            <div className={cn('mt-4 flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400', isRTL && 'flex-row-reverse')}>
              <span className="font-medium">
                {filter ? (t('reviews.averageForType') || 'Average for this type') : (t('reviews.averageOverall') || 'Overall average')}:
              </span>
              <span className="flex items-center gap-1.5">
                {renderStars(currentAvg.average, 'size-5')}
                <span className="font-bold text-amber-600 dark:text-amber-400 tabular-nums">{currentAvg.average?.toFixed(1)}</span>
                <span className="text-gray-500 dark:text-gray-500">({currentAvg.count} {t('reviews.reviewsCount') || 'reviews'})</span>
              </span>
            </div>
          )}
        </CardContent>
      </div>

      {/* List - تصميم البطاقات مثل باقي الصفحات */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FiStar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            {t('reviews.title') || 'Reviews'}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {total > 0 && `${total} ${t('reviews.reviewsCount') || 'reviews'} — ${t('common.page') || 'Page'} ${page} ${isRTL ? 'من' : 'of'} ${totalPages}`}
          </p>
        </div>

        {loading ? (
          <div className="p-6">
            <div className="flex flex-col gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-28 w-full rounded-xl" />
              ))}
            </div>
          </div>
        ) : reviews.length > 0 ? (
          <>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className={cn(
                    'px-6 py-5 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors',
                    isRTL && 'text-right'
                  )}
                >
                  <div className={cn('flex gap-4', isRTL && 'flex-row-reverse')}>
                    <div className="shrink-0">
                      {review.user?.avatar ? (
                        <img
                          src={review.user.avatar}
                          alt=""
                          className="w-12 h-12 rounded-full object-cover border-2 border-purple-200 dark:border-purple-700"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                          <FiUser className="size-6" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className={cn('flex flex-wrap items-center gap-2 mb-1', isRTL && 'flex-row-reverse justify-end')}>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {displayUserName(review.user, language)}
                        </span>
                        <span className="text-xs px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                          {typeLabel(review.type, t)}
                        </span>
                        {review.status === 'SUSPENDED' && (
                          <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            {t('reviews.suspended') || 'Suspended'}
                          </span>
                        )}
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {review.createdAt ? new Date(review.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '—'}
                        </span>
                      </div>
                      <div className={cn('flex items-center gap-1.5 mb-2', isRTL && 'flex-row-reverse')}>
                        {renderStars(review.rating)}
                        <span className="text-sm font-medium text-amber-600 dark:text-amber-400 tabular-nums">{review.rating}/5</span>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{review.comment}</p>
                      )}
                      <div className={cn('flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400', isRTL && 'flex-row-reverse justify-end')}>
                        {review.type === 'COURSE' && <FiBook className="size-3.5 shrink-0" />}
                        {(review.type === 'SHEIKH' || review.type === 'BOOKING') && <FiUser className="size-3.5 shrink-0" />}
                        {review.type === 'BOOKING' && <FiCalendar className="size-3.5 shrink-0" />}
                        <span>{displayRelatedName(review, language)}</span>
                      </div>
                    </div>
                    {canManage && (
                      <div className={cn('flex flex-col sm:flex-row gap-2 shrink-0', isRTL && 'flex-row-reverse')}>
                        {canEditReview(review) && (
                          <Button variant="outline" size="sm" onClick={() => openEdit(review)} disabled={actionLoading} className="gap-1">
                            <FiEdit2 className="size-4" />
                            {t('common.edit')}
                          </Button>
                        )}
                        {canDeleteReview(review) && (
                          <Button variant="outline" size="sm" onClick={() => setDeleteReview(review)} disabled={actionLoading} className="gap-1 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300">
                            <FiTrash2 className="size-4" />
                            {t('common.delete')}
                          </Button>
                        )}
                        {isAdmin && (
                          review.status === 'SUSPENDED' ? (
                            <Button variant="outline" size="sm" onClick={() => handleActivate(review)} disabled={actionLoading} className="gap-1 text-green-600">
                              <FiPlayCircle className="size-4" />
                              {t('reviews.activate') || 'Activate'}
                            </Button>
                          ) : (
                            <Button variant="outline" size="sm" onClick={() => handleSuspend(review)} disabled={actionLoading} className="gap-1 text-amber-600">
                              <FiPauseCircle className="size-4" />
                              {t('reviews.suspend') || 'Suspend'}
                            </Button>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={cn('flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-4 py-3 sm:px-6', isRTL && 'flex-row-reverse')}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50"
                >
                  {t('common.previous')}
                </Button>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {t('common.page') || 'Page'} {page} {isRTL ? 'من' : 'of'} {totalPages}
                  {total > 0 && ` (${total} ${t('reviews.reviewsCount') || 'reviews'})`}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50"
                >
                  {t('common.next')}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30 mb-4">
              <FiStar className="size-10 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {t('reviews.noReviews') || 'No reviews yet'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {filter
                ? (t('reviews.noReviewsForFilter') || 'No reviews for this filter. Try "All".')
                : (t('reviews.noReviewsSubtitle') || 'Reviews from Sheikh, Course, and Booking will appear here.')}
            </p>
          </div>
        )}
      </div>

      {/* Edit Review Dialog */}
      <Dialog open={!!editReview} onOpenChange={(open) => !open && setEditReview(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('reviews.editReview') || 'Edit review'}</DialogTitle>
            <DialogDescription>{t('reviews.editReviewDesc') || 'Update rating and comment.'}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <Label>{t('reviews.rating') || 'Rating'}</Label>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setEditRating(r)}
                    className={cn(
                      'p-2 rounded-lg border transition-colors',
                      editRating >= r ? 'bg-amber-100 border-amber-300 text-amber-700' : 'bg-gray-50 border-gray-200 text-gray-400'
                    )}
                  >
                    <FiStar className={cn('size-5', editRating >= r && 'fill-amber-500 text-amber-500')} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="edit-comment">{t('reviews.comment') || 'Comment'}</Label>
              <Input
                id="edit-comment"
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
                placeholder={t('reviews.commentPlaceholder') || 'Optional comment'}
                className="mt-2"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditReview(null)}>{t('common.cancel')}</Button>
              <Button type="submit" disabled={actionLoading}>
                {actionLoading ? (t('common.saving') || 'Saving...') : t('common.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteReview} onOpenChange={(open) => !open && setDeleteReview(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('reviews.deleteConfirmTitle') || 'Delete review?'}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('reviews.deleteConfirmDesc') || 'This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={actionLoading} className="bg-red-600 hover:bg-red-700">
              {actionLoading ? (t('common.loading') || '...') : t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Reviews;
