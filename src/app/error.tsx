'use client';

/**
 * Global Error Boundary
 *
 * Next.js App Router用のグローバルエラーハンドラー
 * - ルートレイアウト内で発生するエラーをキャッチ
 * - ユーザーフレンドリーな日本語エラーメッセージを表示
 * - エラーログを記録
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/error-handling
 */

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { isAppError, getErrorTypeFromCode } from '@/types/errors';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * エラータイプに基づいてUI要素を決定
 */
function getErrorUIConfig(error: Error) {
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
          showReset: true,
          showContact: true,
        };

      case 'validation':
        return {
          icon: '⚠️',
          title: '入力エラー',
          message: error.getUserMessage(),
          showReset: false,
          showContact: true,
        };

      case 'network':
      case 'api':
      case 'timeout':
        return {
          icon: '🌐',
          title: 'ネットワークエラー',
          message: error.getUserMessage(),
          showReset: true,
          showContact: true,
        };

      case 'not_found':
        return {
          icon: '🔍',
          title: 'ページが見つかりません',
          message: error.getUserMessage(),
          showReset: false,
          showContact: false,
        };

      case 'database':
        return {
          icon: '🗄️',
          title: 'データベースエラー',
          message: error.getUserMessage(),
          showReset: true,
          showContact: true,
        };

      default:
        break;
    }
  }

  // デフォルトエラーUI
  return {
    icon: '⚠️',
    title: '予期しないエラーが発生しました',
    message: '申し訳ございません。予期しないエラーが発生しました。ページを更新するか、サポートまでご連絡ください。',
    showReset: true,
    showContact: true,
  };
}

export default function GlobalError({ error, reset }: ErrorProps) {
  const uiConfig = getErrorUIConfig(error);

  useEffect(() => {
    // エラーログ記録
    console.error('Global error caught:', error);

    // 外部ログサービスへの送信（本番環境）
    if (process.env.NODE_ENV === 'production') {
      logErrorToService(error);
    }
  }, [error]);

  const logErrorToService = async (error: Error) => {
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
            digest: error.digest,
          },
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
          global: true,
        }),
      }).catch(() => {
        // Silently fail if error logging fails
      });
    } catch (e) {
      // Silently fail if error logging fails
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl p-10 text-center">
        {/* Error Icon */}
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto">
            <span className="text-5xl">{uiConfig.icon}</span>
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">!</span>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {uiConfig.title}
        </h1>
        <p className="text-gray-600 mb-8 leading-relaxed text-lg">
          {uiConfig.message}
        </p>

        {/* Error Digest (for debugging) */}
        {error.digest && process.env.NODE_ENV === 'development' && (
          <div className="mb-6 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-800 font-mono">
              Error ID: {error.digest}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-4">
          {uiConfig.showReset && (
            <Button
              onClick={reset}
              variant="primary"
              className="w-full shadow-lg hover:shadow-xl transition-all text-lg py-6"
            >
              もう一度試す
            </Button>
          )}

          <Button
            onClick={() => window.location.reload()}
            variant="secondary"
            className="w-full text-lg py-6"
          >
            ページを更新
          </Button>

          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
            className="w-full text-lg py-6"
          >
            ホームに戻る
          </Button>
        </div>

        {/* Support Contact */}
        {uiConfig.showContact && (
          <div className="pt-6 mt-8 border-t border-gray-200">
            <p className="text-gray-600 mb-3">
              問題が解決しない場合は、サポートチームにお問い合わせください
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              お問い合わせフォーム
            </a>
          </div>
        )}

        {/* Error Details (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-8 text-left">
            <summary className="cursor-pointer text-sm font-semibold text-gray-700 mb-3 hover:text-gray-900 transition-colors">
              🔍 エラー詳細 (開発モード)
            </summary>
            <div className="bg-gray-900 rounded-lg p-4 text-xs overflow-auto max-h-80">
              {isAppError(error) && (
                <div className="mb-3 pb-3 border-b border-gray-700">
                  <div className="text-gray-400 mb-1">Error Code:</div>
                  <div className="text-red-400 font-mono">{error.code}</div>
                </div>
              )}
              <div className="mb-3">
                <div className="text-gray-400 mb-1">Error Name:</div>
                <div className="text-yellow-400 font-mono">{error.name}</div>
              </div>
              <div className="mb-3">
                <div className="text-gray-400 mb-1">Error Message:</div>
                <pre className="whitespace-pre-wrap text-red-400 font-mono">
                  {error.message}
                </pre>
              </div>
              {error.stack && (
                <div>
                  <div className="text-gray-400 mb-1">Stack Trace:</div>
                  <pre className="whitespace-pre-wrap text-gray-300 font-mono text-xs">
                    {error.stack}
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
