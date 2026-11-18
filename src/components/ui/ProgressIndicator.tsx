import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const progressIndicatorVariants = cva(
  'w-full rounded-full overflow-hidden',
  {
    variants: {
      size: {
        sm: 'h-1',
        md: 'h-2',
        lg: 'h-3',
        xl: 'h-4',
      },
      variant: {
        default: 'bg-bg-muted',
        primary: 'bg-brand-muted',
        success: 'bg-success-muted',
        warning: 'bg-warning-muted',
        error: 'bg-error-muted',
        metallic: 'bg-bg-muted',
      },
      rounded: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-container',
        full: 'rounded-full',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
      rounded: 'full',
    },
  }
);

const progressBarVariants = cva(
  'h-full transition-all duration-300 ease-out',
  {
    variants: {
      variant: {
        default: 'bg-brand',
        primary: 'bg-brand',
        success: 'bg-success',
        warning: 'bg-warning',
        error: 'bg-error',
        metallic: 'bg-brand',
      },
      animated: {
        true: 'relative overflow-hidden',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      animated: false,
    },
  }
);

export interface ProgressIndicatorProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressIndicatorVariants>,
    VariantProps<typeof progressBarVariants> {
  value: number; // Progress percentage (0-100)
  max?: number;
  showLabel?: boolean;
  labelPosition?: 'top' | 'bottom' | 'inline';
  labelFormat?: 'percentage' | 'fraction' | 'custom';
  customLabel?: string;
  striped?: boolean;
  animated?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const ProgressIndicator = React.forwardRef<HTMLDivElement, ProgressIndicatorProps>(
  (
    {
      className,
      value,
      max = 100,
      showLabel = false,
      labelPosition = 'top',
      labelFormat = 'percentage',
      customLabel,
      striped = false,
      animated: animatedProp = false,
      size,
      variant,
      rounded,
      ...props
    },
    ref
  ) => {
    // Calculate actual progress value
    const actualValue = Math.min(Math.max(value, 0), max);
    const percentage = (actualValue / max) * 100;

    // Generate label text
    const getLabelText = () => {
      if (customLabel) return customLabel;

      switch (labelFormat) {
        case 'percentage':
          return `${Math.round(percentage)}%`;
        case 'fraction':
          return `${actualValue}/${max}`;
        case 'custom':
          return customLabel || '';
        default:
          return `${Math.round(percentage)}%`;
      }
    };

    const containerClassName = cn(
      'w-full',
      {
        'space-y-2': showLabel && (labelPosition === 'top' || labelPosition === 'bottom'),
        'flex items-center space-x-3': showLabel && labelPosition === 'inline',
      }
    );

    const labelClassName = cn(
      'text-sm font-medium',
      {
        'order-2': labelPosition === 'bottom',
        'order-1': labelPosition === 'top',
        'flex-shrink-0 min-w-[3rem]': labelPosition === 'inline',
      }
    );

    return (
      <div className={containerClassName} ref={ref}>
        {/* Label */}
        {showLabel && labelPosition === 'top' && (
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-text-secondary">Progress</span>
            <span className="text-sm text-text-secondary">{getLabelText()}</span>
          </div>
        )}

        <div className={cn('relative flex-1', labelPosition === 'inline' && 'order-2')}>
          {/* Progress Bar */}
          <div
            className={progressIndicatorVariants({ size, variant, rounded, className })}
            role="progressbar"
            aria-valuenow={actualValue}
            aria-valuemin={0}
            aria-valuemax={max}
            aria-label={`Progress: ${getLabelText()}`}
            {...props}
          >
            {/* Progress Fill */}
            <div
              className={cn(
                progressBarVariants({ variant, animated: animatedProp || striped }),
                {
                  'absolute inset-y-0 left-0': true,
                }
              )}
              style={{ width: `${percentage}%` }}
            >
              {/* Stripes */}
              {striped && (
                <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.25)_0,rgba(255,255,255,0.25)_6px,transparent_6px,transparent_12px)]" />
              )}
            </div>
          </div>

          {/* Inline Label */}
          {showLabel && labelPosition === 'inline' && (
            <span className={labelClassName}>{getLabelText()}</span>
          )}
        </div>

        {/* Bottom Label */}
        {showLabel && labelPosition === 'bottom' && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-text-secondary">
              {actualValue} of {max} completed
            </span>
            <span className="text-sm text-text-secondary">{getLabelText()}</span>
          </div>
        )}
      </div>
    );
  }
);

ProgressIndicator.displayName = 'ProgressIndicator';

// Circular Progress Component
export interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  labelFormat?: 'percentage' | 'fraction';
  className?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
}

export function CircularProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  showLabel = true,
  labelFormat = 'percentage',
  className = '',
  variant = 'default'
}: CircularProgressProps) {
  const actualValue = Math.min(Math.max(value, 0), max);
  const percentage = (actualValue / max) * 100;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getLabelColor = () => {
    switch (variant) {
      case 'primary': return 'text-brand';
      case 'success': return 'text-success';
      case 'warning': return 'text-warning';
      case 'error': return 'text-error';
      default: return 'text-text-secondary';
    }
  };

  const getStrokeColor = () => {
    switch (variant) {
      case 'success': return 'var(--color-success)';
      case 'warning': return 'var(--color-warning)';
      case 'error': return 'var(--color-error)';
      default: return 'var(--color-brand)';
    }
  };

  const getLabelText = () => {
    switch (labelFormat) {
      case 'percentage':
        return `${Math.round(percentage)}%`;
      case 'fraction':
        return `${actualValue}/${max}`;
      default:
        return `${Math.round(percentage)}%`;
    }
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--color-border-emphasized)"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getStrokeColor()}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-out"
        />
      </svg>

      {/* Center Label */}
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn('text-lg font-semibold', getLabelColor())}>
            {getLabelText()}
          </span>
        </div>
      )}
    </div>
  );
}

export { ProgressIndicator, progressIndicatorVariants, progressBarVariants };