/**
 * Sign In Page
 *
 * ログインページです。
 * - NextAuth.js Credentials Provider
 * - 日本語UI
 */

import { Metadata } from 'next';
import LoginForm from '@/components/auth/LoginForm';
import { AuthShell } from '@/components/auth/AuthShell';

// =====================================================
// Metadata
// =====================================================

export const metadata: Metadata = {
  title: 'ログイン | Epackage Lab',
  description: 'イパッケージLabのログインページ。',
};

// =====================================================
// Page Component
// =====================================================

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  // ?redirect=/path があればログイン後にそこへ戻す（既定は /member/dashboard）
  const { redirect } = await searchParams;
  const redirectUrl = redirect || '/member/dashboard';
  return (
    <AuthShell title="ログイン" description="アカウント情報を入力してください。">
      {/* ログインフォーム - Client Component */}
      <LoginForm {...({ redirectUrl } as any)} />
    </AuthShell>
  );
}
