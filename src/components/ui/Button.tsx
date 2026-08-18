import React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'teal' | 'destructive' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<string, string> = {
  primary:     'bg-brand-primary hover:bg-brand-primary-600 active:bg-brand-primary-700 text-white shadow-sm shadow-brand-primary/25 hover:shadow-md hover:shadow-brand-primary/30',
  secondary:   'bg-bg-surface-2 hover:bg-bg-surface-3 active:bg-border text-txt-primary border border-border hover:border-border-strong',
  teal:        'bg-brand-teal hover:bg-brand-teal-600 active:opacity-90 text-white shadow-sm shadow-brand-teal/25',
  destructive: 'bg-status-absent/10 hover:bg-status-absent/20 active:bg-status-absent/30 text-status-absent border border-status-absent/20 hover:border-status-absent/40',
  ghost:       'hover:bg-bg-surface-2 text-txt-secondary hover:text-txt-primary',
  outline:     'border border-border hover:border-brand-primary text-txt-primary hover:text-brand-primary',
};

const sizeStyles: Record<string, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-9 px-4 text-xs gap-2',
  lg: 'h-11 px-6 text-sm gap-2',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className,
  disabled,
  ...props
}) => (
  <button
    disabled={disabled || isLoading}
    className={clsx(
      'inline-flex items-center justify-center font-semibold rounded-btn transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-primary/35 focus:ring-offset-1 select-none whitespace-nowrap',
      variantStyles[variant],
      sizeStyles[size],
      (disabled || isLoading) && 'opacity-50 cursor-not-allowed pointer-events-none',
      className
    )}
    {...props}
  >
    {isLoading ? (
      <Loader2 className="w-4 h-4 animate-spin mr-1" />
    ) : leftIcon ? (
      <span className="flex-shrink-0">{leftIcon}</span>
    ) : null}
    {children}
    {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
  </button>
);
