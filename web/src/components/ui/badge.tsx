import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

const variants = {
  default: 'bg-card text-foreground shadow-sm',
  primary: 'bg-primary text-primary-foreground',
  outline: 'border border-border text-foreground',
  success: 'bg-green-50 text-green-800 border border-green-200',
} as const;

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variants;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
          variants[variant],
          className,
        )}
        {...props}
      />
    );
  },
);
Badge.displayName = 'Badge';

export { Badge };
