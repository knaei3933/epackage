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

// =====================================================
// Metadata
// =====================================================

export const metadata: Metadata = {
  title: '会員登録 | Epackage Lab',
  description: 'イパッケージLabの会員登録ページ。必要な項目のみ入力してください。',
  keywords: ['会員登録', 'Epackage Lab', 'イパッケージLab'],
};

// =====================================================
// Page Component
// =====================================================

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-bg-secondary via-bg-primary to-bg-accent py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <h1 className="text-3xl font-bold text-brixa-600 dark:text-brixa-400">
              Epackage Lab
            </h1>
          </Link>
          <h2 className="text-2xl font-semibold text-text-primary mb-2">
            会員登録
          </h2>
          <p className="text-text-muted">
            必要な項目のみ入力してください。
          </p>
        </div>

        {/* 会員登録フォーム */}
        <Suspense fallback={<div className="text-center py-12">読み込み中...</div>}>
          <RegistrationForm />
        </Suspense>

        {/* ログインリンク */}
        <div className="text-center mt-6">
          <p className="text-sm text-text-muted">
            すでにアカウントをお持ちですか？{' '}
            <Link
              href="/auth/signin"
              className="text-brixa-500 hover:text-brixa-600 font-medium"
            >
              ログイン
            </Link>
          </p>
        </div>

        {/* 利用規約リンク */}
        <div className="text-center mt-4 text-xs text-text-muted">
          <Link href="/terms" className="hover:underline">
            利用規約
          </Link>
          {' | '}
          <Link href="/privacy" className="hover:underline">
            プライバシーポリシー
          </Link>
        </div>
      </div>
    </main>
  );
}
