'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import {
  isAppError,
  getErrorTypeFromCode,
  AuthenticationError,
  ValidationError,
  NetworkError,
  NotFoundError,
} from '@/types/errors';

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

  /**
   * エラータイプに基づいてUI要素を決定
   */
  private getErrorUIConfig() {
    const error = this.state.error;

    // カスタムエラータイプの判定
    if (isAppError(error)) {
      const errorType = getErrorTypeFromCode(error.code);

      switch (errorType) {
        case 'authentication':
        case 'session':
          return {
            icon: '🔒',
            title: '認証エラー',
            message: error.getUserMessage(),
            showRetry: true,
            showReload: true,
            showHome: true,
          };

        case 'validation':
          return {
            icon: '⚠️',
            title: '入力エラー',
            message: error.getUserMessage(),
            showRetry: false,
            showReload: true,
            showHome: false,
          };

        case 'network':
        case 'api':
        case 'timeout':
          return {
            icon: '🌐',
            title: 'ネットワークエラー',
            message: error.getUserMessage(),
            showRetry: true,
            showReload: true,
            showHome: true,
          };

        case 'not_found':
          return {
            icon: '🔍',
            title: 'ページが見つかりません',
            message: error.getUserMessage(),
            showRetry: false,
            showReload: false,
            showHome: true,
          };

        case 'file':
          return {
            icon: '📁',
            title: 'ファイルエラー',
            message: error.getUserMessage(),
            showRetry: false,
            showReload: false,
            showHome: false,
          };

        case 'database':
          return {
            icon: '🗄️',
            title: 'データベースエラー',
            message: error.getUserMessage(),
            showRetry: true,
            showReload: true,
            showHome: true,
          };

        default:
          break;
      }
    }

    // デフォルトエラーUI
    return {
      icon: '⚠️',
      title: '予期しないエラーが発生しました',
      message: error?.message || '申し訳ございません。予期しないエラーが発生しました。',
      showRetry: true,
      showReload: true,
      showHome: true,
    };
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Get UI configuration based on error type
      const uiConfig = this.getErrorUIConfig();

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            {/* Error Icon */}
            <div className="w-20 h-20 bg-gradient-to-br from-red-50 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">{uiConfig.icon}</span>
            </div>

            {/* Error Message */}
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              {uiConfig.title}
            </h1>
            <p className="text-gray-600 mb-8 leading-relaxed">
              {uiConfig.message}
            </p>

            {/* Retry Count */}
            {this.state.retryCount > 0 && (
              <div className="mb-6 px-4 py-2 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  再試行回数: {this.state.retryCount} / {this.maxRetries}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {this.props.enableRetry && uiConfig.showRetry && this.state.retryCount < this.maxRetries && (
                <Button
                  onClick={this.handleRetry}
                  variant="primary"
                  className="w-full shadow-lg hover:shadow-xl transition-shadow"
                >
                  再試行する
                </Button>
              )}

              {uiConfig.showReload && (
                <Button
                  onClick={() => window.location.reload()}
                  variant="secondary"
                  className="w-full"
                >
                  ページを更新
                </Button>
              )}

              {uiConfig.showHome && (
                <Button
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                  className="w-full"
                >
                  ホームに戻る
                </Button>
              )}

              {/* Support Contact */}
              <div className="pt-4 mt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-2">
                  問題が解決しない場合は
                </p>
                <a
                  href="/contact"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 underline"
                >
                  お問い合わせフォーム
                </a>
                <span className="text-sm text-gray-500">からご連絡ください</span>
              </div>
            </div>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && this.props.showDetails && this.state.error && (
              <details className="mt-8 text-left">
                <summary className="cursor-pointer text-sm font-semibold text-gray-700 mb-3 hover:text-gray-900 transition-colors">
                  🔍 エラー詳細 (開発モード)
                </summary>
                <div className="bg-gray-900 rounded-lg p-4 text-xs overflow-auto max-h-64">
                  {isAppError(this.state.error) && (
                    <div className="mb-3 pb-3 border-b border-gray-700">
                      <div className="text-gray-400 mb-1">Error Code:</div>
                      <div className="text-red-400 font-mono">{this.state.error.code}</div>
                    </div>
                  )}
                  <div className="mb-3">
                    <div className="text-gray-400 mb-1">Error:</div>
                    <pre className="whitespace-pre-wrap text-red-400 font-mono">
                      {this.state.error.message}
                    </pre>
                  </div>
                  {this.state.error.stack && (
                    <div className="mb-3">
                      <div className="text-gray-400 mb-1">Stack Trace:</div>
                      <pre className="whitespace-pre-wrap text-gray-300 font-mono text-xs">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                  {this.state.errorInfo?.componentStack && (
                    <div>
                      <div className="text-gray-400 mb-1">Component Stack:</div>
                      <pre className="whitespace-pre-wrap text-gray-300 font-mono text-xs">
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