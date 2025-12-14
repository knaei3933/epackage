import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Button variants using class-variance-authority with Tailwind CSS 4 integration
const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 gap-2 whitespace-nowrap',
  {
    variants: {
      variant: {
        primary: 'bg-brixa-600 text-white hover:bg-brixa-700 focus-visible:ring-brixa-500 shadow-sm active:scale-[0.98]',
        secondary: 'bg-bg-primary text-brixa-700 border-2 border-brixa-200 hover:bg-brixa-50 focus-visible:ring-brixa-500 dark:bg-bg-secondary dark:text-brixa-300 dark:border-brixa-700',
        outline: 'border-2 border-brixa-300 text-brixa-700 bg-transparent hover:bg-brixa-50 focus-visible:ring-brixa-500 dark:border-brixa-600 dark:text-brixa-300 dark:hover:bg-brixa-900/20',
        ghost: 'text-brixa-600 hover:bg-brixa-50 hover:text-brixa-700 focus-visible:ring-brixa-500 dark:text-brixa-400 dark:hover:bg-brixa-800/30',
        link: 'text-brixa-600 underline-offset-4 hover:underline focus-visible:ring-brixa-500 dark:text-brixa-400',
        destructive: 'bg-error-500 text-white hover:bg-error-600 focus-visible:ring-error-500 active:scale-[0.98]',
        success: 'bg-success-500 text-white hover:bg-success-600 focus-visible:ring-success-500 active:scale-[0.98]',
        warning: 'bg-warning-500 text-white hover:bg-warning-600 focus-visible:ring-warning-500 active:scale-[0.98]',
        info: 'bg-info-500 text-white hover:bg-info-600 focus-visible:ring-info-500 active:scale-[0.98]',
        metallic: 'bg-gradient-metallic text-white hover:from-metallic-gold hover:to-metallic-silver focus-visible:ring-metallic-silver shadow-md active:scale-[0.98]',
        'brixa-gradient': 'bg-gradient-brixa text-white hover:shadow-lg focus-visible:ring-brixa-500 active:scale-[0.98] transition-shadow',
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