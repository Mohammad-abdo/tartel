import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge class names with Tailwind merge (shadcn-style utility)
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
