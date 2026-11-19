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
import { AuthShell } from '@/components/auth/AuthShell';

// Disable static generation for this page due to client-side form
export const dynamic = 'force-dynamic';

// =====================================================
// Metadata
// =====================================================

export const metadata: Metadata = {
  title: 'パスワードを忘れた方 | Epackage Lab',
  description: 'パスワードを再設定するためのメールを送信します。',
};

// =====================================================
// Page Component
// =====================================================

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="パスワードを忘れた方"
      description={
        <>
          ご登録のメールアドレスを入力してください。
          <br />
          パスワード再設定用のリンクをお送りします。
        </>
      }
    >

        {/* パスワード再設定フォーム */}
        <ForgotPasswordForm />

        {/* ログインリンク */}
        <div className="text-center mt-6">
          <p className="text-sm text-text-secondary">
            ログイン画面に戻る{' '}
            <Link
              href="/auth/signin"
              className="inline-flex min-h-11 items-center rounded-inner font-medium text-brand underline underline-offset-4 hover:text-brand-pressed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              ログイン
            </Link>
          </p>
        </div>
    </AuthShell>
  );
}
