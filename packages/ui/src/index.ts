/**
 * TeamFlow AI - UI Components Package
 *
 * Shared React components used across TeamFlow applications.
 * This is a stub implementation - full component library coming soon.
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Placeholder for Button component
 */
export const Button = () => null;

/**
 * Placeholder for Card component
 */
export const Card = () => null;

/**
 * Placeholder for Input component
 */
export const Input = () => null;

/**
 * Export utility
 */
export { cn as default };
