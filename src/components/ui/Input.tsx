import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const inputVariants = cva(
  'flex w-full rounded-md border transition-all duration-fast file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-brixa-700 placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:file:text-brixa-300',
  {
    variants: {
      variant: {
        default: 'border-border-medium bg-bg-primary text-text-primary focus-visible:border-brixa-500 focus-visible:ring-brixa-500 dark:border-border-dark dark:bg-bg-secondary dark:text-text-primary',
        error: 'border-error-500 bg-bg-primary text-text-primary focus-visible:border-error-500 focus-visible:ring-error-500 dark:bg-bg-secondary',
        success: 'border-success-500 bg-bg-primary text-text-primary focus-visible:border-success-500 focus-visible:ring-success-500 dark:bg-bg-secondary',
        warning: 'border-warning-500 bg-bg-primary text-text-primary focus-visible:border-warning-500 focus-visible:ring-warning-500 dark:bg-bg-secondary',
        ghost: 'border-transparent bg-transparent text-text-primary focus-visible:border-brixa-300 focus-visible:ring-brixa-500 hover:bg-bg-accent dark:hover:bg-bg-accent',
        filled: 'border-transparent bg-bg-secondary text-text-primary focus-visible:border-brixa-500 focus-visible:ring-brixa-500 dark:bg-bg-muted',
        metallic: 'border-metallic-silver bg-gradient-to-r from-gray-50 to-gray-100 text-text-primary focus-visible:border-brixa-500 focus-visible:ring-brixa-500 dark:from-gray-800 dark:to-gray-900',
      },
      size: {
        xs: 'h-7 px-2 text-xs',
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-3 py-2 text-sm',
        lg: 'h-12 px-4 text-base',
        xl: 'h-14 px-5 text-lg',
      },
      rounded: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        full: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      rounded: 'md',
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  labelPosition?: 'top' | 'left' | 'right';
  showCharCount?: boolean;
  maxLength?: number;
  loading?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    variant,
    size,
    rounded,
    label,
    error,
    helperText,
    required,
    leftIcon,
    rightIcon,
    leftElement,
    rightElement,
    labelPosition = 'top',
    showCharCount,
    maxLength,
    loading,
    id,
    value,
    ...props
  }, ref) => {
    const generatedId = React.useId();
    const inputId = id || `input-${generatedId}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;
    const charCountId = showCharCount ? `${inputId}-charcount` : undefined;

    // Use variant from error state if not explicitly provided
    const finalVariant = error ? 'error' : variant;
    const currentValue = typeof value === 'string' ? value : '';
    const currentLength = currentValue.length;

    const getPaddingLeft = () => {
      if (leftIcon || leftElement) {
        switch (size) {
          case 'xs': return 'pl-8';
          case 'sm': return 'pl-9';
          case 'md': return 'pl-10';
          case 'lg': return 'pl-11';
          case 'xl': return 'pl-12';
          default: return 'pl-10';
        }
      }
      return '';
    };

    const getPaddingRight = () => {
      let paddingRight = '';

      if (loading || rightIcon || rightElement || showCharCount) {
        switch (size) {
          case 'xs': paddingRight = 'pr-8';
          case 'sm': paddingRight = 'pr-9';
          case 'md': paddingRight = 'pr-10';
          case 'lg': paddingRight = 'pr-11';
          case 'xl': paddingRight = 'pr-12';
          default: paddingRight = 'pr-10';
        }
      }

      return paddingRight;
    };

    const labelClassName = cn(
      'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
      labelPosition === 'top' && 'text-text-primary mb-2 block',
      labelPosition === 'left' && 'text-text-primary mr-3 self-center flex-shrink-0',
      labelPosition === 'right' && 'text-text-primary ml-3 self-center flex-shrink-0'
    );

    const containerClassName = cn(
      'space-y-2',
      labelPosition === 'left' && 'flex items-start space-x-0 space-y-0',
      labelPosition === 'right' && 'flex items-start space-x-0 space-y-0 flex-row-reverse'
    );

    return (
      <div className={containerClassName}>
        {/* Label */}
        {label && (
          <label htmlFor={inputId} className={labelClassName}>
            {label}
            {required && <span className="text-error-500 ml-1" aria-label="required">*</span>}
          </label>
        )}

        <div className={cn('relative flex-1', labelPosition !== 'top' && 'min-w-0')}>
          {/* Left Icon/Element */}
          {(leftIcon || leftElement) && (
            <div className={cn(
              'absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary flex items-center justify-center',
              {
                'w-4 h-4': size === 'xs' || size === 'sm',
                'w-5 h-5': size === 'md',
                'w-6 h-6': size === 'lg',
              }
            )}>
              {loading && (
                <svg
                  className="animate-spin"
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
              {!loading && leftIcon}
              {leftElement}
            </div>
          )}

          {/* Input Field */}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              inputVariants({ variant: finalVariant, size, rounded }),
              getPaddingLeft(),
              getPaddingRight(),
              className
            )}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={cn(errorId, helperId, charCountId)}
            aria-required={required}
            value={value}
            maxLength={maxLength}
            {...props}
          />

          {/* Right Icon/Element */}
          {(rightIcon || rightElement) && (
            <div className={cn(
              'absolute right-3 top-1/2 transform -translate-y-1/2 text-text-tertiary flex items-center justify-center',
              {
                'w-4 h-4': size === 'xs' || size === 'sm',
                'w-5 h-5': size === 'md',
                'w-6 h-6': size === 'lg',
              }
            )}>
              {rightIcon}
              {rightElement}
            </div>
          )}

          {/* Character Count */}
          {showCharCount && maxLength && (
            <div
              id={charCountId}
              className={cn(
                'absolute right-3 top-1/2 transform -translate-y-1/2 text-xs',
                currentLength > maxLength * 0.9
                  ? 'text-error-500 font-medium'
                  : 'text-text-muted'
              )}
              aria-live="polite"
            >
              {currentLength}/{maxLength}
            </div>
          )}
        </div>

        {/* Bottom Messages Container */}
        {(error || helperText) && (
          <div className={cn('text-sm', labelPosition !== 'top' && 'mt-2')}>
            {/* Error Message */}
            {error && (
              <p id={errorId} className="text-error-500" role="alert">
                {error}
              </p>
            )}

            {/* Helper Text */}
            {helperText && !error && (
              <p id={helperId} className="text-text-muted">
                {helperText}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input, inputVariants };