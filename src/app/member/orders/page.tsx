/**
 * Unified Orders Page
 *
 * 注文一覧ページ（統合版）
 * - Server Component: サーバーサイド認証チェック
 * - Client Component: タブで「処理中」「履歴」「再注文」を切り替え
 * - ステータス管理・検索・フィルタリング・ソート
 * - 進捗状況表示
 */

import { redirect } from 'next/navigation';
import { requireAuth, AuthRequiredError } from '@/lib/dashboard';
import { OrdersClient } from './OrdersClient';

// Disable static generation for this page due to client-side interactivity
export const dynamic = 'force-dynamic';

// =====================================================
// Server Component Metadata
// =====================================================

export const metadata = {
  title: '注文一覧 | Epackage Lab',
  description: 'Epackage Lab会員注文一覧ページ',
};

// =====================================================
// Page Component (Server Component for Auth Check)
// =====================================================

export default async function OrdersPage() {
  // =====================================================
  // Server-side Authentication Check
  // =====================================================
  // This ensures the page is protected on the server-side
  // and cookies are properly validated before rendering
  let user;
  try {
    console.log('[OrdersPage] Calling requireAuth...');
    user = await requireAuth();
    console.log('[OrdersPage] requireAuth SUCCESS:', user.id);
  } catch (error) {
    console.error('[OrdersPage] requireAuth FAILED:', error);
    if (error instanceof AuthRequiredError) {
      redirect('/auth/signin?redirect=/member/orders');
    }
    throw error;
  }

  // Render the client component with user info
  return <OrdersClient userId={user.id} />;
}
