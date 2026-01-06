'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/Button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  enableRetry?: boolean;
  showDetails?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private maxRetries = 3;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 ErrorBoundary caught an error');
      console.error('Error:', error);
      console.error('Error Message:', error?.message);
      console.error('Error Stack:', error?.stack);
      console.error('Error Info:', {
        componentStack: errorInfo?.componentStack,
      });
      console.groupEnd();
    }

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Implement external logging service (Sentry, LogRocket, etc.)
      this.logErrorToService(error, errorInfo);
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // Placeholder for external error logging
    // Example implementation with fetch:
    try {
      fetch('/api/errors/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
          },
          errorInfo: {
            componentStack: errorInfo.componentStack,
          },
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        }),
      }).catch(() => {
        // Silently fail if error logging fails
      });
    } catch (e) {
      // Silently fail if error logging fails
    }
  };

  private handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: prevState.retryCount + 1,
      }));
    }
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: 0,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            {/* Error Icon */}
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>

            {/* Error Message */}
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              予期しないエラーが発生しました
            </h1>
            <p className="text-gray-600 mb-6">
              申し訳ございません。予期しないエラーが発生しました。ページを更新するか、サポートまでご連絡ください。
            </p>

            {/* Retry Count */}
            {this.state.retryCount > 0 && (
              <p className="text-sm text-gray-500 mb-4">
                再試行回数: {this.state.retryCount}/{this.maxRetries}
              </p>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {this.props.enableRetry && this.state.retryCount < this.maxRetries && (
                <Button
                  onClick={this.handleRetry}
                  variant="primary"
                  className="w-full"
                >
                  再試行する
                </Button>
              )}

              <Button
                onClick={() => window.location.reload()}
                variant="secondary"
                className="w-full"
              >
                ページを更新
              </Button>

              <Button
                onClick={() => window.location.href = '/'}
                variant="outline"
                className="w-full"
              >
                ホームに戻る
              </Button>
            </div>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && this.props.showDetails && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                  エラー詳細 (開発モード)
                </summary>
                <div className="bg-gray-50 rounded p-3 text-xs">
                  <div className="mb-2">
                    <strong>Error:</strong>
                    <pre className="mt-1 whitespace-pre-wrap text-red-600">
                      {this.state.error.message}
                    </pre>
                  </div>
                  {this.state.error.stack && (
                    <div className="mb-2">
                      <strong>Stack Trace:</strong>
                      <pre className="mt-1 whitespace-pre-wrap text-gray-600">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                  {this.state.errorInfo?.componentStack && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="mt-1 whitespace-pre-wrap text-gray-600">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional wrapper for easier usage - this doesn't accept event handlers
export function ErrorBoundaryWrapper({
  children,
  enableRetry = false,
  showDetails = false,
}: {
  children: ReactNode;
  enableRetry?: boolean;
  showDetails?: boolean;
}) {
  return (
    <ErrorBoundary
      enableRetry={enableRetry}
      showDetails={showDetails}
      onError={(error, errorInfo) => {
        // Custom error logging can be added here
        console.error('🚨 Layout Error Boundary Caught:', {
          name: error?.name,
          message: error?.message,
          stack: error?.stack,
          componentStack: errorInfo?.componentStack,
        });
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

// Hook for handling errors in functional components
export function useErrorHandler() {
  const handleError = (error: Error, errorInfo?: string) => {
    console.group('🚨 Manual Error Handling');
    console.error('Error:', error?.message || error);
    if (error?.stack) {
      console.error('Stack:', error.stack);
    }
    if (errorInfo) {
      console.error('Additional Info:', errorInfo);
    }
    console.groupEnd();

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/errors/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
          },
          additionalInfo: errorInfo,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
          manual: true,
        }),
      }).catch(() => {
        // Silently fail if error logging fails
      });
    }
  };

  return { handleError };
}