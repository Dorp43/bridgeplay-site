import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Class-name merge used by every component under components/shadcn.
 *  clsx flattens conditionals; twMerge resolves Tailwind conflicts so a caller's
 *  `className` beats the component's own defaults instead of racing them in the
 *  cascade (both live in @layer utilities, where source order would decide). */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
