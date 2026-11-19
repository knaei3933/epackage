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
import { Lock, AlertTriangle, Globe, Search, Database, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/layout';
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
          icon: Lock,
          title: '認証エラー',
          message: error.getUserMessage(),
          showReset: true,
          showContact: true,
        };

      case 'validation':
        return {
          icon: AlertTriangle,
          title: '入力エラー',
          message: error.getUserMessage(),
          showReset: false,
          showContact: true,
        };

      case 'network':
      case 'api':
      case 'timeout':
        return {
          icon: Globe,
          title: 'ネットワークエラー',
          message: error.getUserMessage(),
          showReset: true,
          showContact: true,
        };

      case 'not_found':
        return {
          icon: Search,
          title: 'ページが見つかりません',
          message: error.getUserMessage(),
          showReset: false,
          showContact: false,
        };

      case 'database':
        return {
          icon: Database,
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
    icon: AlertTriangle,
    title: '予期しないエラーが発生しました',
    message: '申し訳ございません。予期しないエラーが発生しました。ページを更新するか、サポートまでご連絡ください。',
    showReset: true,
    showContact: true,
  };
}

export default function GlobalError({ error, reset }: ErrorProps) {
  const uiConfig = getErrorUIConfig(error);

  useEffect(() => {
    // 에러 에어백 — 관리자 통지 (실패 무시, rate-limit은 서버측)
    fetch('/api/error-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        digest: error.digest,
        message: error.message,
        stack: error.stack,
        url: window.location.href,
      }),
    }).catch(() => {});
    // エラーログ記録
    console.error('Global error caught:', error);

    // 외부 로그 서비스 — 에어백으로 통일 (prod에서만)
    // (fetch는 위 에어백 POST에서 이미 수행됨)
  }, [error]);


  const Icon = uiConfig.icon;

  return (
    <div className="min-h-screen bg-bg-primary">
      <PageHeader
        title={
          <span className="flex items-center gap-3">
            <Icon className="h-7 w-7 shrink-0 text-error" aria-hidden="true" />
            {uiConfig.title}
          </span>
        }
        lead={uiConfig.message}
        actions={
          <>
            {uiConfig.showReset && (
              <Button onClick={reset} variant="primary">
                もう一度試す
              </Button>
            )}

            <Button
              onClick={() => window.location.reload()}
              variant={uiConfig.showReset ? 'outline' : 'primary'}
            >
              ページを更新
            </Button>

            <a
              href="/"
              className="inline-flex min-h-11 items-center text-brand underline underline-offset-4 hover:text-brand-pressed"
            >
              ホームに戻る
            </a>
          </>
        }
      />

      <div className="mx-auto max-w-[1120px] px-4 py-12 sm:px-6">
        <div className="max-w-2xl">
          {/* Error Digest (for debugging) */}
          {error.digest && process.env.NODE_ENV === 'development' && (
            <div className="mb-6 rounded-container border border-warning bg-warning-muted px-4 py-3">
              <p className="font-mono text-[13px] text-on-warning-muted">
                Error ID: {error.digest}
              </p>
            </div>
          )}

          {/* Support Contact */}
          {uiConfig.showContact && (
            <div>
              <p className="mb-3 text-text-secondary">
                問題が解決しない場合は、サポートチームにお問い合わせください
              </p>
              <a
                href="/contact"
                className="inline-flex min-h-11 items-center gap-2 font-medium text-brand underline underline-offset-4 transition-colors hover:text-brand-pressed"
              >
                <Mail className="h-5 w-5" aria-hidden="true" />
                お問い合わせフォーム
              </a>
            </div>
          )}

          {/* Error Details (Development Only) */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-8 text-left">
              <summary className="mb-3 flex cursor-pointer items-center gap-2 text-sm font-bold text-text-primary transition-colors hover:text-brand">
                <Search className="h-4 w-4" aria-hidden="true" />
                エラー詳細 (開発モード)
              </summary>
              <div className="max-h-80 overflow-auto rounded-container border border-border-medium bg-bg-secondary p-4 text-xs">
                {isAppError(error) && (
                  <div className="mb-3 border-b border-border-medium pb-3">
                    <div className="mb-1 text-text-muted">Error Code:</div>
                    <div className="font-mono text-error">{error.code}</div>
                  </div>
                )}
                <div className="mb-3">
                  <div className="mb-1 text-text-muted">Error Name:</div>
                  <div className="font-mono text-warning">{error.name}</div>
                </div>
                <div className="mb-3">
                  <div className="mb-1 text-text-muted">Error Message:</div>
                  <pre className="whitespace-pre-wrap font-mono text-error">
                    {error.message}
                  </pre>
                </div>
                {error.stack && (
                  <div>
                    <div className="mb-1 text-text-muted">Stack Trace:</div>
                    <pre className="whitespace-pre-wrap font-mono text-xs text-text-secondary">
                      {error.stack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}
