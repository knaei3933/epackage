/**
 * Order History Page
 *
 * 注文履歴ページ
 * - 全ての注文履歴を表示
 * - ステータス・検索・ソート機能
 */

import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { requireAuth, AuthRequiredError } from '@/lib/dashboard';
import { getOrders } from '@/lib/dashboard';
import { OrderList, FullPageSpinner } from '@/components/dashboard';

// Force dynamic rendering - this page requires authentication
export const dynamic = 'force-dynamic';

// =====================================================
// Page Content
// =====================================================

async function OrderHistoryContent() {
  // Use requireAuth helper - works in both Dev Mode and Production
  let user;
  try {
    user = await requireAuth();
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      redirect('/auth/signin?redirect=/member/orders/history');
    }
    throw error;
  }

  // 全ての注文を取得
  const { data: orders, total } = await getOrders(
    {},
    { page: 1, limit: 100, sortBy: 'createdAt', sortOrder: 'desc' }
  );

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">注文履歴</h1>
        <p className="text-text-muted mt-1">
          全ての注文履歴
        </p>
      </div>

      {/* 注文リスト */}
      <OrderList orders={orders} total={total} pageSize={20} />
    </div>
  );
}

// =====================================================
// Loading Component
// =====================================================

function OrderHistoryLoading() {
  return <FullPageSpinner label="注文履歴を読み込み中..." />;
}

// =====================================================
// Page Component
// =====================================================

export default function OrderHistoryPage() {
  return (
    <Suspense fallback={<OrderHistoryLoading />}>
      <OrderHistoryContent />
    </Suspense>
  );
}

// =====================================================
// Metadata
// =====================================================

export const metadata = {
  title: '注文履歴 | マイページ',
  description: '全ての注文履歴',
};
