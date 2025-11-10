import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/utils/helpers';

export interface CardProps extends Omit<HTMLMotionProps<'div'>, 'onAnimationStart'> {
  variant?: 'default' | 'glass' | 'gradient';
  hover?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hover = false, children, ...props }, ref) => {
    const variants = {
      default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
      glass: 'glass',
      gradient: 'bg-gradient-to-br from-primary-500/10 to-purple-500/10 border border-primary-200 dark:border-primary-800',
    };

    const Component = hover ? motion.div : 'div';
    const motionProps = hover
      ? {
          whileHover: { scale: 1.02, y: -4 },
          transition: { duration: 0.2 },
        }
      : {};

    return (
      <Component
        ref={ref}
        className={cn('rounded-xl shadow-lg p-6', variants[variant], className)}
        {...(motionProps as any)}
        {...(props as any)}
      >
        {children as React.ReactNode}
      </Component>
    );
  }
);

Card.displayName = 'Card';
