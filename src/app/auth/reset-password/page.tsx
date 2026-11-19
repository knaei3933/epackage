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
import { AuthShell } from '@/components/auth/AuthShell';

// =====================================================
// Metadata
// =====================================================

export const metadata: Metadata = {
  title: 'パスワード再設定 | Epackage Lab',
  description: '新しいパスワードを設定してください。',
};

// =====================================================
// Page Component
// =====================================================

export default function ResetPasswordPage() {
  return (
    <AuthShell title="パスワード再設定" description="新しいパスワードを入力してください。">

        {/* パスワード再設定フォーム */}
        <ResetPasswordForm />

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
