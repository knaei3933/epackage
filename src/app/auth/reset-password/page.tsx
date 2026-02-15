/**
 * Reset Password Page
 *
 * パスワード再設定ページ（新しいパスワード入力）
 * - トークン検証
 * - 新しいパスワード入力フォーム
 * - React Hook Form + Zod 検証
 * - 日本語エラーメッセージ
 */

import { Metadata } from 'next';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import Link from 'next/link';

// =====================================================
// Metadata
// =====================================================

export const metadata: Metadata = {
  title: 'パスワード再設定 | Epackage Lab',
  description: '新しいパスワードを設定してください。',
  keywords: ['パスワード再設定', 'パスワード変更', 'Epackage Lab'],
};

// =====================================================
// Page Component
// =====================================================

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-bg-secondary via-bg-primary to-bg-accent py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <h1 className="text-3xl font-bold text-brixa-600 dark:text-brixa-400">
              Epackage Lab
            </h1>
          </Link>
          <h2 className="text-2xl font-semibold text-text-primary mb-2">
            パスワード再設定
          </h2>
          <p className="text-text-muted">
            新しいパスワードを入力してください。
          </p>
        </div>

        {/* パスワード再設定フォーム */}
        <ResetPasswordForm />

        {/* ログインリンク */}
        <div className="text-center mt-6">
          <p className="text-sm text-text-muted">
            ログイン画面に戻る{' '}
            <Link
              href="/auth/signin"
              className="text-brixa-500 hover:text-brixa-600 font-medium"
            >
              ログイン
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
