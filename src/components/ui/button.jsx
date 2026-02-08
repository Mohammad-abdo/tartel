import { cn } from '../../lib/utils';

const buttonVariants = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/90',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  link: 'text-primary underline-offset-4 hover:underline',
};

const sizeVariants = {
  default: 'h-10 px-4 rounded-xl',
  sm: 'h-8 rounded-xl px-3 text-xs',
  lg: 'h-11 rounded-xl px-8 text-sm',
  icon: 'size-10 rounded-xl',
};

function Button({ className, variant = 'default', size = 'default', ...props }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
        buttonVariants[variant],
        sizeVariants[size],
        className
      )}
      {...props}
    />
  );
}

export { Button, buttonVariants, sizeVariants };
