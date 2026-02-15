/**
 * Invoices Page
 *
 * 請求書一覧ページ（サーバーコンポーネント）
 * - requireAuth()でサーバーサイド認証
 * - ユーザーIDをクライアントコンポーネントに渡す
 * - 日本語UI
 */

import { redirect } from 'next/navigation';
import { requireAuth, AuthRequiredError } from '@/lib/dashboard';
import { InvoicesClient } from './InvoicesClient';

// =====================================================
// Server Component Content
// =====================================================

async function InvoicesContent() {
  console.log('[InvoicesContent] START: Rendering invoices content');

  // Use requireAuth helper - works in both Dev Mode and Production
  let user;
  try {
    console.log('[InvoicesContent] Calling requireAuth...');
    user = await requireAuth();
    console.log('[InvoicesContent] requireAuth SUCCESS:', user.id);
  } catch (error) {
    console.error('[InvoicesContent] requireAuth FAILED:', error);
    if (error instanceof AuthRequiredError) {
      redirect('/auth/signin?redirect=/member/invoices');
    }
    throw error;
  }

  const userId = user.id || '';

  console.log('[InvoicesContent] User data extracted:', {
    userId,
  });

  return <InvoicesClient userId={userId} />;
}

// =====================================================
// Page Component (Server Component)
// =====================================================

export default async function InvoicesPage() {
  return <InvoicesContent />;
}

// =====================================================
// Server Component Metadata
// =====================================================

export const metadata = {
  title: '請求書一覧 | Epackage Lab',
  description: 'Epackage Lab請求書一覧ページ',
};

// Force dynamic rendering for this authenticated page
export const dynamic = 'force-dynamic';
