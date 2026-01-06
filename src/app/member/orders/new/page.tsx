/**
 * New Orders Page
 *
 * 新規注文一覧ページ
 * - 処理中の注文を表示
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

async function NewOrdersContent() {
  // Use requireAuth helper - works in both Dev Mode and Production
  let user;
  try {
    user = await requireAuth();
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      redirect('/auth/signin?redirect=/member/orders/new');
    }
    throw error;
  }

  const userId = user.id;

  // 処理中の注文を取得（pending, processing, manufacturing, ready）
  const { data: orders, total } = await getOrders(
    { status: 'PRODUCTION' },
    { page: 1, limit: 100, sortBy: 'createdAt', sortOrder: 'desc' }
  );

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">新規注文</h1>
        <p className="text-text-muted mt-1">
          現在処理中の注文一覧
        </p>
      </div>

      {/* 注文リスト */}
      <OrderList orders={orders} total={total} pageSize={10} />
    </div>
  );
}

// =====================================================
// Loading Component
// =====================================================

function NewOrdersLoading() {
  return <FullPageSpinner label="注文を読み込み中..." />;
}

// =====================================================
// Page Component
// =====================================================

export default function NewOrdersPage() {
  return (
    <Suspense fallback={<NewOrdersLoading />}>
      <NewOrdersContent />
    </Suspense>
  );
}

// =====================================================
// Metadata
// =====================================================

export const metadata = {
  title: '新規注文 | マイページ',
  description: '現在処理中の注文一覧',
};
