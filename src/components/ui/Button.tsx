import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Button variants using class-variance-authority with Tailwind CSS 4 integration
const buttonVariants = cva(
  // Base styles - Enhanced with better transitions and accessibility
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 gap-2 whitespace-nowrap relative overflow-hidden group',
  {
    variants: {
      variant: {
        // Primary - Enhanced with gradient, shadow, and micro-interactions
        primary: 'bg-gradient-to-br from-[var(--brixa-primary-500)] to-[var(--brixa-primary-700)] text-white hover:from-[var(--brixa-primary-600)] hover:to-[var(--brixa-primary-800)] focus-visible:ring-[var(--brixa-primary-500)] shadow-md hover:shadow-lg active:scale-[0.98] active:shadow-sm before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-500',

        // Secondary - Cleaner with better hover state
        secondary: 'bg-[var(--bg-primary)] text-[var(--brixa-primary-700)] border-2 border-[var(--brixa-primary-200)] hover:bg-[var(--brixa-primary-50)] hover:border-[var(--brixa-primary-300)] focus-visible:ring-[var(--brixa-primary-500)] dark:bg-[var(--bg-secondary)] dark:text-[var(--brixa-primary-300)] dark:border-[var(--brixa-primary-700)] dark:hover:bg-[var(--brixa-primary-800)] dark:hover:bg-opacity-20 shadow-sm hover:shadow active:scale-[0.98]',

        // Outline - Enhanced with smoother hover
        outline: 'border-2 border-[var(--brixa-primary-300)] text-[var(--brixa-primary-700)] bg-transparent hover:bg-[var(--brixa-primary-50)] hover:border-[var(--brixa-primary-400)] focus-visible:ring-[var(--brixa-primary-500)] dark:border-[var(--brixa-primary-600)] dark:text-[var(--brixa-primary-300)] dark:hover:bg-[var(--brixa-primary-800)] dark:hover:bg-opacity-20 dark:hover:border-[var(--brixa-primary-500)] transition-all active:scale-[0.98]',

        // Ghost - Subtle with better visibility
        ghost: 'text-[var(--brixa-primary-600)] hover:bg-[var(--brixa-primary-50)] hover:text-[var(--brixa-primary-700)] focus-visible:ring-[var(--brixa-primary-500)] dark:text-[var(--brixa-primary-400)] dark:hover:bg-[var(--brixa-primary-700)] dark:hover:bg-opacity-30 dark:hover:text-[var(--brixa-primary-300)] active:bg-[var(--brixa-primary-100)] dark:active:bg-[var(--brixa-primary-800)] dark:active:bg-opacity-30',

        // Link - Enhanced with better hover
        link: 'text-[var(--brixa-primary-600)] underline-offset-4 hover:underline hover:text-[var(--brixa-primary-700)] focus-visible:ring-[var(--brixa-primary-500)] dark:text-[var(--brixa-primary-400)] dark:hover:text-[var(--brixa-primary-300)] transition-all',

        // Destructive - Enhanced with gradient
        destructive: 'bg-gradient-to-br from-[var(--error-500)] to-[var(--error-600)] text-white hover:from-[var(--error-600)] hover:to-[var(--error-700)] focus-visible:ring-[var(--error-500)] shadow-md hover:shadow-lg hover:shadow-error-500/20 active:scale-[0.98] active:shadow-sm',

        // Success - Enhanced with gradient
        success: 'bg-gradient-to-br from-[var(--success-500)] to-[var(--success-600)] text-white hover:from-[var(--success-600)] hover:to-[var(--success-700)] focus-visible:ring-[var(--success-500)] shadow-md hover:shadow-lg hover:shadow-success-500/20 active:scale-[0.98] active:shadow-sm',

        // Warning - Enhanced with gradient
        warning: 'bg-gradient-to-br from-[var(--warning-500)] to-[var(--warning-600)] text-white hover:from-[var(--warning-600)] hover:to-[var(--warning-700)] focus-visible:ring-[var(--warning-500)] shadow-md hover:shadow-lg hover:shadow-warning-500/20 active:scale-[0.98] active:shadow-sm',

        // Info - Enhanced with gradient
        info: 'bg-gradient-to-br from-[var(--info-500)] to-[var(--info-600)] text-white hover:from-[var(--info-600)] hover:to-[var(--info-700)] focus-visible:ring-[var(--info-500)] shadow-md hover:shadow-lg hover:shadow-info-500/20 active:scale-[0.98] active:shadow-sm',

        // Metallic - Premium metallic effect
        metallic: 'bg-gradient-metallic text-white hover:from-metallic-gold hover:to-metallic-silver focus-visible:ring-metallic-silver shadow-md hover:shadow-lg active:scale-[0.98] before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700',

        // Brixa Gradient - Premium brand gradient
        'brixa-gradient': 'bg-gradient-brixa text-white hover:shadow-xl hover:shadow-brixa-500/30 focus-visible:ring-[var(--brixa-primary-500)] active:scale-[0.98] before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/15 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-600',
      },
      size: {
        xs: 'h-7 px-2 text-xs gap-1',
        sm: 'h-8 px-3 text-xs gap-1.5',
        md: 'h-10 px-4 py-2 text-sm gap-2',
        lg: 'h-12 px-6 text-base gap-2.5',
        xl: 'h-14 px-8 text-lg gap-3',
        '2xl': 'h-16 px-10 text-xl gap-3',
        icon: 'h-10 w-10 p-0',
        'icon-sm': 'h-8 w-8 p-0',
        'icon-lg': 'h-12 w-12 p-0',
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto',
      },
      rounded: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        '2xl': 'rounded-2xl',
        full: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
      rounded: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  badge?: React.ReactNode;
  badgePosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant,
    size,
    fullWidth,
    rounded,
    loading = false,
    loadingText,
    icon,
    iconPosition = 'left',
    badge,
    badgePosition = 'top-right',
    children,
    disabled,
    ...props
  }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <button
        className={cn(
          'relative',
          buttonVariants({ variant, size, fullWidth, rounded, className })
        )}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {/* Badge */}
        {badge && (
          <div
            className={cn(
              'absolute z-10',
              {
                'top-0 right-0 translate-x-1/2 -translate-y-1/2': badgePosition === 'top-right',
                'top-0 left-0 -translate-x-1/2 -translate-y-1/2': badgePosition === 'top-left',
                'bottom-0 right-0 translate-x-1/2 translate-y-1/2': badgePosition === 'bottom-right',
                'bottom-0 left-0 -translate-x-1/2 translate-y-1/2': badgePosition === 'bottom-left',
              }
            )}
          >
            {badge}
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}

        {/* Left Icon */}
        {!loading && icon && iconPosition === 'left' && (
          <span className="flex-shrink-0">{icon}</span>
        )}

        {/* Content */}
        <span className={cn('truncate', loading && 'opacity-75')}>
          {loading && loadingText ? loadingText : children}
        </span>

        {/* Right Icon */}
        {!loading && icon && iconPosition === 'right' && (
          <span className="flex-shrink-0">{icon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };