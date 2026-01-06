/**
 * Sign In Page
 *
 * 로그인 페이지입니다.
 * - NextAuth.js Credentials Provider
 * - 일본어/한국어 이중 지원
 */

import { Metadata } from 'next';
import { Suspense } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import Link from 'next/link';

// =====================================================
// Metadata
// =====================================================

export const metadata: Metadata = {
  title: 'ログイン | Epackage Lab',
  description: 'イパッケージLabのログインページ。',
  keywords: ['ログイン', 'Epackage Lab', 'イパッケージLab'],
};

// =====================================================
// Page Component
// =====================================================

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-bg-secondary via-bg-primary to-bg-accent py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <h1 className="text-3xl font-bold text-brixa-600 dark:text-brixa-400">
              Epackage Lab
            </h1>
          </Link>
          <h2 className="text-2xl font-semibold text-text-primary mb-2">
            ログイン
          </h2>
          <p className="text-text-muted">
            アカウント情報を入力してください。
          </p>
        </div>

        {/* 로그인 폼 - Suspense boundary for useSearchParams */}
        <Suspense fallback={<div className="animate-pulse bg-gray-200 rounded-lg h-96" />}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
