import { useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';

function DropdownMenuRoot({ children, open, onOpenChange }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onOpenChange?.(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, onOpenChange]);

  return <div ref={ref} className="relative inline-block">{children}</div>;
}

function DropdownMenuTrigger({ children, className, ...props }) {
  return (
    <button
      type="button"
      aria-haspopup="menu"
      className={cn('inline-flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg transition-all duration-200', className)}
      {...props}
    >
      {children}
    </button>
  );
}

function DropdownMenuContent({ children, className, align = 'end', isRTL, ...props }) {
  const alignClass = align === 'end' ? (isRTL ? 'left-0' : 'right-0') : (isRTL ? 'right-0' : 'left-0');
  return (
    <div
      className={cn(
        'absolute z-50 min-w-40 overflow-hidden rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-tarteel-md',
        'top-full mt-2',
        alignClass,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function DropdownMenuItem({ children, className, onClick, ...props }) {
  return (
    <button
      type="button"
      role="menuitem"
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors',
        'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}

function DropdownMenuLabel({ children, className }) {
  return <div className={cn('px-2 py-1.5 text-xs font-semibold text-muted-foreground', className)}>{children}</div>;
}

function DropdownMenuSeparator() {
  return <div className="my-1 h-px bg-border" />;
}

export { DropdownMenuRoot, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator };
