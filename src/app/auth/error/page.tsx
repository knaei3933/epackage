/**
 * Authentication Error Page
 *
 * 認証エラーページです。
 * - ログインエラー、権限なし等、様々な認証エラーを処理
 */

import { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { TriangleAlert } from 'lucide-react';
import { AuthStatusCard, AUTH_TEXT_LINK } from '@/components/auth/AuthShell';
import { buttonVariants } from '@/components/ui';
import { cn } from '@/lib/utils';

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
    <AuthStatusCard tone="error" icon={TriangleAlert} title="認証エラー">
      {/* 説明 */}
      <p className="mb-6 text-text-secondary">{errorMessage}</p>

      {/* ログインページリンク */}
      <Link href="/auth/signin" className={cn(buttonVariants({ variant: 'primary', size: 'lg', fullWidth: true }), 'mb-3')}>
        ログインページへ
      </Link>

      {/* ホームへリンク */}
      <Link href="/" className={AUTH_TEXT_LINK}>
        ホームへ
      </Link>
    </AuthStatusCard>
  );
}

// Wrapper component with Suspense boundary to avoid useSearchParams warning
export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-text-secondary">Loading...</div>}>
      <AuthErrorContent
        error={(await searchParams).error}
        message={(await searchParams).message}
      />
    </Suspense>
  );
}
