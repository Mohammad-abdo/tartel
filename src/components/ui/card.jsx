import { cn } from '../../lib/utils';

/**
 * shadcn-style Card components
 */
const Card = ({ className, ...props }) => (
  <div
    data-slot="card"
    className={cn(
      'rounded-xl border border-gray-200 bg-white text-gray-900 shadow-sm transition-shadow dark:border-gray-700 dark:bg-gray-800 dark:text-white hover:shadow-md',
      className
    )}
    {...props}
  />
);

const CardHeader = ({ className, ...props }) => (
  <div
    data-slot="card-header"
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
);

const CardTitle = ({ className, ...props }) => (
  <h3
    data-slot="card-title"
    className={cn('text-xl font-semibold leading-none tracking-tight', className)}
    {...props}
  />
);

const CardDescription = ({ className, ...props }) => (
  <p
    data-slot="card-description"
    className={cn('text-sm text-gray-600 dark:text-gray-400', className)}
    {...props}
  />
);

const CardContent = ({ className, ...props }) => (
  <div data-slot="card-content" className={cn('p-6 pt-0', className)} {...props} />
);

const CardFooter = ({ className, ...props }) => (
  <div
    data-slot="card-footer"
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
);

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
