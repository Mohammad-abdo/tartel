import { cn } from '../../lib/utils';

/**
 * shadcn-style Skeleton for loading states
 */
function Skeleton({ className, ...props }) {
  return (
    <div
      data-slot="skeleton"
      className={cn('animate-pulse rounded-lg bg-muted', className)}
      {...props}
    />
  );
}

export { Skeleton };
