import { cn } from '../../lib/utils';

function Separator({ className, orientation = 'horizontal', decorative = true, ...props }) {
  return (
    <div
      role={decorative ? 'none' : 'separator'}
      aria-orientation={decorative ? undefined : orientation}
      className={cn(
        'shrink-0 bg-gray-200',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        className
      )}
      {...props}
    />
  );
}

export { Separator };
