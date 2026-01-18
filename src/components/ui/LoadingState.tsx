'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from './LoadingSpinner';

export interface LoadingStateProps {
  isLoading: boolean;
  error?: Error | string | null;
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'dots' | 'pulse' | 'bars' | 'bounce';
  color?: 'primary' | 'secondary' | 'white' | 'current';
  message?: string;
  fullScreen?: boolean;
}

/**
 * LoadingState Component
 *
 * A unified wrapper component that handles loading, error, and success states.
 * Provides consistent UX across the application.
 *
 * @example
 * ```tsx
 * <LoadingState
 *   isLoading={isLoading}
 *   error={error}
 *   message="読み込み中..."
 *   size="lg"
 * >
 *   <YourContent />
 * </LoadingState>
 * ```
 */
export function LoadingState({
  isLoading,
  error,
  children,
  loadingComponent,
  errorComponent,
  className,
  size = 'lg',
  variant = 'default',
  color = 'primary',
  message,
  fullScreen = false,
}: LoadingStateProps) {
  // Error state
  if (error) {
    if (errorComponent) {
      return <>{errorComponent}</>;
    }

    const errorMessage = typeof error === 'string' ? error : error.message;

    return (
      <div className={cn(
        'flex items-center justify-center p-8',
        fullScreen && 'min-h-[400px]',
        className
      )}>
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
            <svg
              className="w-8 h-8 text-red-600 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            エラーが発生しました
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {errorMessage || 'データの読み込みに失敗しました'}
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }

    return (
      <div className={cn(
        'flex items-center justify-center',
        fullScreen && 'min-h-[400px]',
        className
      )}>
        <LoadingSpinner
          size={size}
          variant={variant}
          color={color}
          center
          label={message || '読み込み中...'}
        />
      </div>
    );
  }

  // Success state - render children
  return <>{children}</>;
}

/**
 * PageLoadingState - Preconfigured for full-page loading
 */
export function PageLoadingState({
  isLoading,
  error,
  children,
  message = '読み込み中...',
}: Omit<LoadingStateProps, 'size' | 'fullScreen'>) {
  return (
    <LoadingState
      isLoading={isLoading}
      error={error}
      size="xl"
      fullScreen
      message={message}
    >
      {children}
    </LoadingState>
  );
}

/**
 * CardLoadingState - Preconfigured for card-level loading
 */
export function CardLoadingState({
  isLoading,
  error,
  children,
  message,
}: Omit<LoadingStateProps, 'size' | 'variant' | 'fullScreen'>) {
  return (
    <LoadingState
      isLoading={isLoading}
      error={error}
      size="md"
      variant="dots"
      message={message}
    >
      {children}
    </LoadingState>
  );
}

/**
 * InlineLoadingState - Preconfigured for inline loading
 */
export function InlineLoadingState({
  isLoading,
  error,
  children,
  message,
}: Omit<LoadingStateProps, 'size' | 'fullScreen' | 'center'>) {
  return (
    <LoadingState
      isLoading={isLoading}
      error={error}
      size="sm"
      message={message}
    >
      {children}
    </LoadingState>
  );
}
