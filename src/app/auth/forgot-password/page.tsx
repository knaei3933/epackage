/**
 * Forgot Password Page
 *
 * パスワード再設定ページ（メール送信）
 * - メールアドレス入力フォーム
 * - 再設定リンクをメールで送信
 * - React Hook Form + Zod 検証
 * - 日本語エラーメッセージ
 */

import { Metadata } from 'next';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import Link from 'next/link';

// Disable static generation for this page due to client-side form
export const dynamic = 'force-dynamic';

// =====================================================
// Metadata
// =====================================================

export const metadata: Metadata = {
  title: 'パスワードを忘れた方 | Epackage Lab',
  description: 'パスワードを再設定するためのメールを送信します。',
  keywords: ['パスワード再設定', 'パスワードリセット', 'Epackage Lab'],
};

// =====================================================
// Page Component
// =====================================================

export default function ForgotPasswordPage() {
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
            パスワードを忘れた方
          </h2>
          <p className="text-text-muted">
            ご登録のメールアドレスを入力してください。
            <br />
            パスワード再設定用のリンクをお送りします。
          </p>
        </div>

        {/* パスワード再設定フォーム */}
        <ForgotPasswordForm />

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
