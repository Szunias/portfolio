'use client';

import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
  variant?: 'default' | 'elevated' | 'glass';
  hover?: boolean;
  glow?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', hover = false, glow = false, className, children, ...props }, ref) => {
    const baseStyles = 'rounded-xl overflow-hidden transition-all duration-300';

    const variants = {
      default: 'bg-surface border border-border',
      elevated: 'bg-surface-elevated border border-border shadow-xl',
      glass: 'glass border border-border/50',
    };

    return (
      <motion.div
        ref={ref}
        whileHover={hover ? { scale: 1.02, y: -4 } : undefined}
        className={clsx(
          baseStyles,
          variants[variant],
          hover && 'cursor-pointer hover:border-accent/50',
          glow && 'glow-hover',
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={clsx('p-6 pb-4', className)} {...props} />
  )
);

CardHeader.displayName = 'CardHeader';

export const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={clsx('p-6 pt-0', className)} {...props} />
  )
);

CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={clsx('p-6 pt-4 border-t border-border', className)} {...props} />
  )
);

CardFooter.displayName = 'CardFooter';

export default Card;
