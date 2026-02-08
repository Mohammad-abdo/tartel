import { cn } from '../../lib/utils';

const badgeVariants = {
  default: 'border-transparent bg-primary text-primary-foreground',
  secondary: 'border-transparent bg-secondary text-secondary-foreground',
  destructive: 'border-transparent bg-destructive/15 text-destructive',
  outline: 'border-border text-foreground bg-transparent',
  success: 'border-transparent bg-primary/15 text-primary',
  warning: 'border-transparent bg-accent/30 text-accent-foreground',
};

function Badge({ className, variant = 'default', ...props }) {
  return (
    <span
      data-slot="badge"
      className={cn(
        'inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-medium transition-colors',
        badgeVariants[variant] || badgeVariants.default,
        className
      )}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
