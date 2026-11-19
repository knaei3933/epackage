/**
 * Registration Page
 *
 * 会員登録ページです。
 * - 18項目の会員登録フォーム
 * - 日本語UI
 * - レスポンシブデザイン
 */

import { Metadata } from 'next';
import { Suspense } from 'react';
import RegistrationForm from '@/components/auth/RegistrationForm';
import Link from 'next/link';
import { AuthShell } from '@/components/auth/AuthShell';

// =====================================================
// Metadata
// =====================================================

export const metadata: Metadata = {
  title: '会員登録 | Epackage Lab',
  description: 'イパッケージLabの会員登録ページ。必要な項目のみ入力してください。',
};

// =====================================================
// Page Component
// =====================================================

export default function RegisterPage() {
  return (
    <AuthShell title="会員登録" description="必要な項目のみ入力してください。" width="wide">
        {/* 会員登録フォーム */}
        <Suspense fallback={<div className="py-12 text-center text-text-secondary">読み込み中...</div>}>
          <RegistrationForm />
        </Suspense>

        {/* ログインリンク */}
        <div className="text-center mt-6">
          <p className="text-sm text-text-secondary">
            すでにアカウントをお持ちですか？{' '}
            <Link
              href="/auth/signin"
              className="inline-flex min-h-11 items-center rounded-inner font-medium text-brand underline underline-offset-4 hover:text-brand-pressed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              ログイン
            </Link>
          </p>
        </div>

        {/* 利用規約リンク */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 text-sm text-text-muted">
          <Link href="/terms" className="inline-flex min-h-11 items-center underline underline-offset-4 hover:text-text-primary">
            利用規約
          </Link>
          <span aria-hidden="true">|</span>
          <Link href="/privacy" className="inline-flex min-h-11 items-center underline underline-offset-4 hover:text-text-primary">
            プライバシーポリシー
          </Link>
        </div>
    </AuthShell>
  );
}
