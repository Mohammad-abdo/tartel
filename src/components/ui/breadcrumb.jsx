import { Fragment } from 'react';
import { FiChevronRight } from 'react-icons/fi';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';

const Breadcrumb = ({ className, ...props }) => (
  <nav
    aria-label="Breadcrumb"
    className={cn('flex', className)}
    {...props}
  />
);
Breadcrumb.displayName = 'Breadcrumb';

const BreadcrumbList = ({ className, ...props }) => (
  <ol
    className={cn(
      'flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2',
      className
    )}
    {...props}
  />
);
BreadcrumbList.displayName = 'BreadcrumbList';

const BreadcrumbItem = ({ className, ...props }) => (
  <li
    className={cn('inline-flex items-center gap-1.5', className)}
    {...props}
  />
);
BreadcrumbItem.displayName = 'BreadcrumbItem';

const BreadcrumbLink = ({ className, ...props }) => (
  <Link
    className={cn('transition-colors hover:text-foreground', className)}
    {...props}
  />
);
BreadcrumbLink.displayName = 'BreadcrumbLink';

const BreadcrumbPage = ({ className, ...props }) => (
  <span
    role="link"
    aria-disabled="true"
    aria-current="page"
    className={cn('font-normal text-foreground', className)}
    {...props}
  />
);
BreadcrumbPage.displayName = 'BreadcrumbPage';

const BreadcrumbSeparator = ({ children, className, ...props }) => (
  <li
    role="presentation"
    aria-hidden="true"
    className={cn('[&>svg]:w-3.5 [&>svg]:h-3.5', className)}
    {...props}
  >
    {children ?? <FiChevronRight className="text-muted-foreground" />}
  </li>
);
BreadcrumbSeparator.displayName = 'BreadcrumbSeparator';

const BreadcrumbEllipsis = ({ className, ...props }) => (
  <span
    role="presentation"
    aria-hidden="true"
    className={cn('flex h-9 w-9 items-center justify-center', className)}
    {...props}
  >
    <span className="sr-only">More</span>
    <span className="text-muted-foreground">...</span>
  </span>
);
BreadcrumbEllipsis.displayName = 'BreadcrumbEllipsis';

/** Maps pathname to breadcrumb labels (i18n keys or raw labels). Override via prop or extend in app. */
const defaultPathLabels = {
  dashboard: 'sidebar.dashboard',
  users: 'sidebar.users',
  teachers: 'sidebar.teachers',
  bookings: 'sidebar.bookings',
  'course-enrollments': 'sidebar.courseEnrollments',
  payments: 'sidebar.payments',
  wallets: 'sidebar.wallets',
  subscriptions: 'sidebar.subscriptions',
  'student-subscriptions': 'sidebar.packages',
  courses: 'sidebar.courses',
  content: 'sidebar.content',
  reviews: 'sidebar.reviews',
  certificates: 'sidebar.certificates',
  notifications: 'sidebar.notifications',
  rbac: 'sidebar.rbac',
  reports: 'sidebar.reports',
  activity: 'sidebar.activity',
  settings: 'sidebar.settings',
  profile: 'sidebar.profile',
  add: 'common.add',
  edit: 'common.edit',
};

function BreadcrumbNav({ pathLabels = defaultPathLabels, t = (k) => k }) {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(Boolean);
  const isRTL = document.documentElement.dir === 'rtl';

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink to="/dashboard">{t('sidebar.dashboard')}</BreadcrumbLink>
        </BreadcrumbItem>
        {pathnames.map((name, index) => {
          const href = '/' + pathnames.slice(0, index + 1).join('/');
          const labelKey = pathLabels[name] ?? name;
          const label = typeof labelKey === 'string' && labelKey.startsWith('sidebar.') ? t(labelKey) : t(labelKey);
          const isLast = index === pathnames.length - 1;

          return (
            <Fragment key={href}>
              <BreadcrumbSeparator>
                {isRTL ? <FiChevronRight className="rotate-180" /> : <FiChevronRight />}
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink to={href}>{label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
  BreadcrumbNav,
};
