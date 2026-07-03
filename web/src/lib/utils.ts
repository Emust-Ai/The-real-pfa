import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

const twMerge = extendTailwindMerge({
  classGroups: {
    'font-size': [{ text: ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl'] }],
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
