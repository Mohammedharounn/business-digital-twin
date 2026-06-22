import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind classes with clsx for conditional class names.
 */
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

/**
 * Formats a currency value.
 */
export function formatCurrency(value) {
    const prefix = value < 0 ? '-E£' : 'E£';
    const abs = Math.abs(value);
    if (abs >= 1000000) return prefix + (abs / 1000000).toFixed(1) + 'M';
    if (abs >= 1000) return prefix + (abs / 1000).toFixed(1) + 'K';
    return prefix + Math.round(abs).toLocaleString();
}

/**
 * Calculates percentage change.
 */
export function getPercentageChange(oldValue, newValue) {
    if (oldValue === 0) return 0;
    return ((newValue - oldValue) / oldValue) * 100;
}
