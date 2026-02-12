/**
 * Authentication Error Page
 *
 * 認証エラーページです。
 * - ログインエラー、権限なし等、様々な認証エラーを処理
 */

import { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '認証エラー | Epackage Lab',
  description: '認証エラーが発生しました。',
};

function AuthErrorContent({
  error,
  message,
}: {
  error?: string;
  message?: string;
}) {
  // エラーメッセージマッピング
  const errorMessages: Record<string, string> = {
    AccessDenied: 'このページにアクセスする権限がありません。',
    Configuration: 'サーバー設定エラーが発生しました。',
    verification_failed: message || 'メール認証に失敗しました。トークンの有効期限が切れているか、無効です。',
    Default: message || '認証エラーが発生しました。',
  };

  const errorKey = error || 'Default';
  const errorMessage = errorMessages[errorKey] || errorMessages.Default;

  return (
    <main className="min-h-screen bg-gradient-to-br from-bg-secondary via-bg-primary to-bg-accent flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-bg-secondary rounded-lg shadow-lg p-8 text-center">
          {/* アイコン */}
          <div className="w-16 h-16 mx-auto mb-6 bg-error-100 dark:bg-error-900/20 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-error-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* タイトル */}
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            認証エラー
          </h1>

          {/* 説明 */}
          <p className="text-text-muted mb-6">
            {errorMessage}
          </p>

          {/* ログインページリンク */}
          <Link
            href="/auth/signin"
            className="inline-block w-full px-4 py-2 bg-brixa-500 hover:bg-brixa-600 text-white font-medium rounded-md transition-colors mb-3"
          >
            ログインページへ
          </Link>

          {/* ホームへリンク */}
          <Link
            href="/"
            className="block text-sm text-text-muted hover:text-brixa-500"
          >
            ホームへ
          </Link>
        </div>
      </div>
    </main>
  );
}

// Wrapper component with Suspense boundary to avoid useSearchParams warning
export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthErrorContent
        error={(await searchParams).error}
        message={(await searchParams).message}
      />
    </Suspense>
  );
}
