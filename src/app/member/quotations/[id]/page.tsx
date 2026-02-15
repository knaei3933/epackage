/**
 * Member Quotation Detail Page
 *
 * 会員見積書詳細ページ
 * - Server Component: サーバーサイド認証チェック
 * - Client Component: 見積情報の詳細表示、PDFダウンロード、注文変換
 */

import { redirect } from 'next/navigation';
import { requireAuth, AuthRequiredError } from '@/lib/dashboard';
import { auth } from '@/lib/supabase';
import { QuotationDetailClient } from './QuotationDetailClient';

// Disable static generation for this page due to client-side interactivity
export const dynamic = 'force-dynamic';

// =====================================================
// Server Component Metadata
// =====================================================

export const metadata = {
  title: '見積詳細 | Epackage Lab',
  description: 'Epackage Lab会員見積詳細ページ',
};

// =====================================================
// Page Component (Server Component for Auth Check)
// =====================================================

export default async function QuotationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // =====================================================
  // Server-side Authentication Check
  // =====================================================
  let user;
  try {
    console.log('[QuotationDetailPage] Calling requireAuth...');
    user = await requireAuth();
    console.log('[QuotationDetailPage] requireAuth SUCCESS:', user.id);
  } catch (error) {
    console.error('[QuotationDetailPage] requireAuth FAILED:', error);
    if (error instanceof AuthRequiredError) {
      const { id } = await params;
      redirect(`/auth/signin?redirect=/member/quotations/${id}`);
    }
    throw error;
  }

  // Get quotation ID from params
  const { id: quotationId } = await params;

  // Fetch user profile
  const profile = await auth.getProfile(user.id);

  // Render client component with user info
  return (
    <QuotationDetailClient
      userId={user.id}
      userEmail={user.email}
      userProfile={profile}
      quotationId={quotationId}
    />
  );
}
