/**
 * Member Area Error Boundary
 *
 * Server Componentのエラーをキャッチして、
 * ユーザーフレンドリーなエラー画面を表示します。
 *
 * Next.js 15+では、error.tsxが自動的にServer Componentのエラーをキャッチします。
 */

'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui';
import { AlertTriangle, RefreshCw, Home, LogIn } from 'lucide-react';

// =====================================================
// Types
// =====================================================

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

// =====================================================
// Error Component
// =====================================================

export default function MemberError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('[MemberError] Server Component error caught:', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  // Determine if this is an authentication error
  const isAuthError =
    error.message?.includes('Unauthorized') ||
    error.message?.includes('Not authenticated') ||
    error.message?.includes('認証') ||
    error.digest?.includes('AUTH');

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-secondary p-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          {/* Error Icon */}
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>

          {/* Error Title */}
          <h1 className="text-xl font-bold text-text-primary mb-2">
            {isAuthError ? '認証エラー' : 'エラーが発生しました'}
          </h1>

          {/* Error Description */}
          <p className="text-text-muted mb-6">
            {isAuthError
              ? 'セッションが期限切れか、認証情報が見つかりません。再度ログインしてください。'
              : 'ページの読み込み中にエラーが発生しました。しばらく待ってから再度お試しください。'}
          </p>

          {/* Error Details (development only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-left">
              <p className="text-xs text-text-muted font-mono break-all">
                {error.message || 'Unknown error'}
              </p>
              {error.digest && (
                <p className="text-xs text-text-muted font-mono mt-2">
                  Digest: {error.digest}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="primary"
              onClick={reset}
              className="flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              再読み込み
            </Button>

            {isAuthError ? (
              <Button
                variant="outline"
                onClick={() => (window.location.href = '/auth/signin?redirect=/member/dashboard')}
                className="flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                ログイン
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => (window.location.href = '/')}
                className="flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                ホームへ
              </Button>
            )}
          </div>
        </div>

        {/* Help Text */}
        <p className="text-center text-sm text-text-muted mt-6">
          問題が続く場合は、
          <a href="/contact" className="text-primary hover:underline">
            サポートにお問い合わせ
          </a>
          ください。
        </p>
      </div>
    </div>
  );
}
