'use client';

import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { motion, type HTMLMotionProps } from 'framer-motion';

type BadgeVariant = 'default' | 'accent' | 'outline' | 'muted';
type BadgeSize = 'sm' | 'md';

interface BadgeProps extends Omit<HTMLMotionProps<'span'>, 'ref'> {
  variant?: BadgeVariant;
  size?: BadgeSize;
}

const variants: Record<BadgeVariant, string> = {
  default: 'bg-surface-elevated text-text-primary border border-border',
  accent: 'bg-accent/10 text-accent border border-accent/20',
  outline: 'bg-transparent text-text-secondary border border-border',
  muted: 'bg-surface text-text-muted',
};

const sizes: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', size = 'md', className, children, ...props }, ref) => {
    return (
      <motion.span
        ref={ref}
        whileHover={{ scale: 1.05 }}
        className={clsx(
          'inline-flex items-center font-medium rounded-full transition-colors',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </motion.span>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;
