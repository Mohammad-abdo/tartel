import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const Input = forwardRef(({ className, type = 'text', ...props }, ref) => {
  return (
    <input
      type={type}
      ref={ref}
      className={cn(
        'flex h-9 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground transition-all duration-200',
        'placeholder:text-muted-foreground',
        'focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted',
        'file:border-0 file:bg-transparent file:text-sm file:font-medium',
        className
      )}
      {...props}
    />
  );
});

Input.displayName = 'Input';

export { Input };
