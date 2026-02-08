import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { reviewAPI } from '../services/api';
import { FiStar, FiSearch } from 'react-icons/fi';
import { Card, CardContent } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';

const Reviews = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [teacherId, setTeacherId] = useState('');

  const fetchReviews = async () => {
    if (!teacherId) return;
    setLoading(true);
    try {
      const response = await reviewAPI.getTeacherReviews(teacherId);
      setReviews(response.data || []);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <FiStar key={i} className={cn('size-4', i < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300')} />
    ));
  };

  return (
    <div className="space-y-4 sm:space-y-5 lg:space-y-6 2xl:space-y-5">
      <div>
        <p className="text-xs font-semibold tracking-wide text-primary-600 uppercase mb-1">Reviews</p>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">{t('reviews.title') || 'Reviews'}</h1>
        <p className="text-gray-500 mt-1 text-sm">{t('reviews.subtitle') || 'View and manage reviews'}</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className={cn('relative flex-1')}>
              <FiSearch className={cn('absolute top-1/2 -translate-y-1/2 text-gray-400 size-4', isRTL ? 'right-3' : 'left-3')} />
              <input
                type="text"
                placeholder={t('reviews.teacherIdPlaceholder') || 'Enter Teacher ID to view reviews'}
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                className={cn('w-full py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none', isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4')}
              />
            </div>
            <Button onClick={fetchReviews} disabled={!teacherId} className="shrink-0">
              <FiSearch className="size-4" />
              {t('common.search') || 'Search'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        {loading ? (
          <CardContent className="py-14">
            <div className="flex flex-col gap-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </CardContent>
        ) : reviews.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {reviews.map((review) => (
              <CardContent key={review.id} className="py-6 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <div className="flex items-center gap-0.5">{renderStars(review.rating)}</div>
                      <span className="text-sm font-medium text-gray-900">{review.student?.user?.name || 'Anonymous'}</span>
                      <span className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-700 text-sm mb-1">{review.comment}</p>
                    <div className="text-xs text-gray-500">Booking: {review.bookingId}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="ghost" size="icon" className="text-primary-600 hover:bg-primary-50">{t('common.edit') || 'Edit'}</Button>
                    <Button variant="ghost" size="icon" className="text-red-600 hover:bg-red-50">{t('common.delete') || 'Delete'}</Button>
                  </div>
                </div>
              </CardContent>
            ))}
          </div>
        ) : (
          <CardContent className="py-16 text-center">
            <FiStar className="size-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              {teacherId ? (t('reviews.noReviews') || 'No reviews found for this teacher') : (t('reviews.enterTeacherId') || 'Enter a teacher ID to view reviews')}
            </h2>
            <p className="text-sm text-gray-500">{!teacherId && 'Use the search above to load reviews.'}</p>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default Reviews;
