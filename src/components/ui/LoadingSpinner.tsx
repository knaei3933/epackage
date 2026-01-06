'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'dots' | 'pulse' | 'bars' | 'bounce';
  color?: 'primary' | 'secondary' | 'white' | 'current';
  className?: string;
  label?: string;
  center?: boolean;
  overlay?: boolean;
}

const sizeClasses = {
  xs: {
    default: 'w-4 h-4',
    dots: 'w-8 h-4',
    pulse: 'w-4 h-4',
    bars: 'h-8',
    bounce: 'w-8 h-8',
  },
  sm: {
    default: 'w-5 h-5',
    dots: 'w-10 h-5',
    pulse: 'w-5 h-5',
    bars: 'h-10',
    bounce: 'w-10 h-10',
  },
  md: {
    default: 'w-6 h-6',
    dots: 'w-12 h-6',
    pulse: 'w-6 h-6',
    bars: 'h-12',
    bounce: 'w-12 h-12',
  },
  lg: {
    default: 'w-8 h-8',
    dots: 'w-16 h-8',
    pulse: 'w-8 h-8',
    bars: 'h-16',
    bounce: 'w-16 h-16',
  },
  xl: {
    default: 'w-12 h-12',
    dots: 'w-20 h-10',
    pulse: 'w-12 h-12',
    bars: 'h-20',
    bounce: 'w-20 h-20',
  },
};

const colorClasses = {
  primary: 'text-blue-600',
  secondary: 'text-gray-600',
  white: 'text-white',
  current: 'text-current',
};

export function LoadingSpinner({
  size = 'md',
  variant = 'default',
  color = 'primary',
  className,
  label,
  center = false,
  overlay = false,
}: LoadingSpinnerProps) {
  const baseClasses = cn(
    'animate-spin',
    sizeClasses[size].default,
    colorClasses[color],
    center && 'mx-auto',
    className
  );

  const containerClasses = cn(
    'flex items-center justify-center',
    overlay && 'fixed inset-0 bg-white bg-opacity-75 z-50',
    center && !overlay && 'w-full flex-col'
  );

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className={cn('flex space-x-1', sizeClasses[size].dots)}>
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className={cn(
                  'w-2 h-2 rounded-full',
                  colorClasses[color],
                  'animate-pulse',
                  `animation-delay-${index * 200}`
                )}
                style={{
                  animationDelay: `${index * 0.2}s`,
                  animationDuration: '1.4s',
                }}
              />
            ))}
          </div>
        );

      case 'pulse':
        return (
          <div className={cn(
            'relative rounded-full',
            sizeClasses[size].pulse,
            colorClasses[color],
            'animate-pulse opacity-75'
          )}>
            <div className={cn(
              'absolute inset-0 rounded-full',
              colorClasses[color],
              'animate-ping opacity-25'
            )} />
          </div>
        );

      case 'bars':
        return (
          <div className={cn('flex space-x-1 items-end', sizeClasses[size].bars)}>
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className={cn(
                  'w-1 rounded-full',
                  colorClasses[color],
                  'animate-pulse'
                )}
                style={{
                  height: `${25 + (index * 15)}%`,
                  animationDelay: `${index * 0.1}s`,
                  animationDuration: '1.2s',
                }}
              />
            ))}
          </div>
        );

      case 'bounce':
        return (
          <div className={cn('flex space-x-1', sizeClasses[size].bounce)}>
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className={cn(
                  'w-2 h-2 rounded-full',
                  colorClasses[color],
                  'animate-bounce'
                )}
                style={{
                  animationDelay: `${index * 0.1}s`,
                }}
              />
            ))}
          </div>
        );

      case 'default':
      default:
        return (
          <svg
            className={baseClasses}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        );
    }
  };

  return (
    <div className={containerClasses}>
      {renderSpinner()}
      {label && (
        <span className={cn(
          'mt-2 text-sm',
          colorClasses[color],
          center && 'text-center'
        )}>
          {label}
        </span>
      )}
    </div>
  );
}

// Predefined spinner configurations
export const PageSpinner = (props: Omit<LoadingSpinnerProps, 'size' | 'variant' | 'center'>) => (
  <LoadingSpinner
    size="lg"
    variant="default"
    center
    {...props}
  />
);

export const ButtonSpinner = (props: Omit<LoadingSpinnerProps, 'size' | 'variant' | 'color'>) => (
  <LoadingSpinner
    size="sm"
    variant="default"
    color="white"
    {...props}
  />
);

export const CardSpinner = (props: Omit<LoadingSpinnerProps, 'size' | 'variant' | 'center'>) => (
  <LoadingSpinner
    size="md"
    variant="dots"
    center
    {...props}
  />
);

export const FullPageSpinner = ({ label = "読み込み中..." }: { label?: string }) => (
  <LoadingSpinner
    size="xl"
    variant="default"
    center
    overlay
    label={label}
  />
);

// Hook for consistent loading states
export function useSpinner(key: string) {
  const { isLoading, message, startLoading, stopLoading } = useLoadingState(key);

  const SpinnerComponent = ({ size, variant, color }: Partial<LoadingSpinnerProps>) => (
    <LoadingSpinner
      size={size}
      variant={variant}
      color={color}
      label={message}
      center
    />
  );

  return {
    isLoading,
    message,
    startLoading,
    stopLoading,
    Spinner: SpinnerComponent,
  };
}

// Import useLoadingState from the context
import { useLoadingState } from '@/contexts/LoadingContext';