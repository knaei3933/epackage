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
        default: 'bg-gray-200',
        primary: 'bg-brixa-100',
        success: 'bg-success-100',
        warning: 'bg-warning-100',
        error: 'bg-error-100',
        metallic: 'bg-gradient-to-r from-gray-100 to-gray-200',
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
        default: 'bg-gradient-to-r from-brixa-600 to-brixa-700',
        primary: 'bg-gradient-to-r from-brixa-500 to-brixa-600',
        success: 'bg-gradient-to-r from-success-500 to-success-600',
        warning: 'bg-gradient-to-r from-warning-500 to-warning-600',
        error: 'bg-gradient-to-r from-error-500 to-error-600',
        metallic: 'bg-gradient-to-r from-metallic-gold to-metallic-silver',
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
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-600">{getLabelText()}</span>
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
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:20px_20px] animate-pulse" />
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
            <span className="text-sm text-gray-600">
              {actualValue} of {max} completed
            </span>
            <span className="text-sm text-gray-600">{getLabelText()}</span>
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
      case 'primary': return 'text-brixa-600';
      case 'success': return 'text-success-600';
      case 'warning': return 'text-warning-600';
      case 'error': return 'text-error-600';
      default: return 'text-gray-700';
    }
  };

  const getStrokeColor = () => {
    switch (variant) {
      case 'primary': return '#0891b2';
      case 'success': return '#059669';
      case 'warning': return '#d97706';
      case 'error': return '#dc2626';
      default: return '#0891b2';
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
          stroke="#e5e7eb"
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