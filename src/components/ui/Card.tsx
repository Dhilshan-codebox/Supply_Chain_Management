import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface CardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  variant?: 'default' | 'heavy' | 'light' | 'accent' | 'warning' | 'success';
  depth?: boolean;
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  interactive = false,
  variant = 'default',
  depth = false,
  glow = false,
  ...props
}) => {
  const variantClass =
    variant === 'heavy'
      ? 'glass-heavy'
      : variant === 'light'
      ? 'glass-light'
      : variant === 'accent'
      ? 'glass-accent'
      : variant === 'warning'
      ? 'glass-warning'
      : variant === 'success'
      ? 'glass-success'
      : 'glass';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={`${variantClass} glass-shine rounded-2xl pointer-events-auto ${
        depth ? 'glass-depth' : ''
      } ${glow ? 'glass-glow' : ''} ${
        interactive ? 'glass-interactive cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};
