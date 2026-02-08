import * as React from 'react';
import { cn } from '../../lib/utils';
import { FiAlertCircle, FiCheckCircle, FiInfo, FiAlertTriangle } from 'react-icons/fi';

const alertVariantClasses = {
  default: 'bg-background text-foreground border-border',
  destructive:
    'border-destructive/50 text-destructive [&>svg]:text-destructive bg-destructive/10',
  success:
    'border-primary/50 text-primary [&>svg]:text-primary bg-primary/10',
  warning:
    'border-accent/50 text-accent-foreground [&>svg]:text-accent bg-accent/20',
  info: 'border-primary/50 text-primary [&>svg]:text-primary bg-primary/5',
};

const baseAlertClasses =
  'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground rtl:[&>svg]:left-auto rtl:[&>svg]:right-4 rtl:[&>svg~*]:pl-0 rtl:[&>svg~*]:pr-7';

const Alert = React.forwardRef(({ className, variant = 'default', ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(baseAlertClasses, alertVariantClasses[variant] ?? alertVariantClasses.default, className)}
    {...props}
  />
));
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn('mb-1 font-medium leading-none tracking-tight', className)}
    {...props}
  />
));
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm [&_p]:leading-relaxed', className)}
    {...props}
  />
));
AlertDescription.displayName = 'AlertDescription';

const AlertIcon = ({ variant = 'default' }) => {
  const icons = {
    default: FiInfo,
    destructive: FiAlertCircle,
    success: FiCheckCircle,
    warning: FiAlertTriangle,
    info: FiInfo,
  };
  const Icon = icons[variant] || FiInfo;
  return <Icon className="h-4 w-4" aria-hidden />;
};

export { Alert, AlertTitle, AlertDescription, AlertIcon, alertVariantClasses };
