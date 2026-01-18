'use client';

/**
 * Root Error Wrapper Component
 *
 * ルートレイアウト用のエラーラッパー
 * - メインコンテンツをErrorBoundaryでラップ
 * - ページレベルのエラーをキャッチ
 * - グレースフルなエラーハンドリングを提供
 */

import { ReactNode } from 'react';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

interface RootErrorWrapperProps {
  children: ReactNode;
}

export function RootErrorWrapper({ children }: RootErrorWrapperProps) {
  return (
    <ErrorBoundary
      enableRetry={false}
      showDetails={process.env.NODE_ENV === 'development'}
      onError={(error, errorInfo) => {
        // ルートレベルのエラーログ
        console.error('Root Error Boundary Caught:', {
          name: error?.name,
          message: error?.message,
          stack: error?.stack,
          componentStack: errorInfo?.componentStack,
        });

        // 本番環境ではエラーログサービスに送信
        if (process.env.NODE_ENV === 'production') {
          logErrorToService(error, errorInfo);
        }
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * エラーログサービスへの送信
 */
async function logErrorToService(error: Error, errorInfo: React.ErrorInfo) {
  try {
    await fetch('/api/errors/log', {
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
        boundary: 'root',
      }),
    }).catch(() => {
      // Silently fail if error logging fails
    });
  } catch (e) {
    // Silently fail if error logging fails
  }
}
