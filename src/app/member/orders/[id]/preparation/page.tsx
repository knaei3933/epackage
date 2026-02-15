/**
 * Order Preparation Page
 *
 * 顧客用注文準備ページ
 * - データ入稿後の仕様変更を許可
 * - 現在の仕様と変更履歴を表示
 */

import { Suspense } from 'react';
import { redirect, notFound } from 'next/navigation';
import { requireAuth } from '@/lib/dashboard';
import { getOrderById } from '@/lib/dashboard';
import { Card, Badge, FullPageSpinner } from '@/components/ui';
import { OrderSpecificationItemList } from './OrderSpecificationItemList';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// =====================================================
// Constants
// =====================================================

const statusLabels: Record<string, string> = {
  pending: '受付待',
  processing: '処理中',
  data_received: 'データ入稿済',
  spec_approved: '仕様承認済',
  in_production: '製造中',
  ready: '発送待',
  shipped: '発送完了',
  delivered: '配送完了',
  cancelled: 'キャンセル',
};

const statusVariants: Record<string, 'warning' | 'info' | 'success' | 'secondary' | 'error' | 'default'> = {
  pending: 'warning',
  processing: 'info',
  data_received: 'info',
  spec_approved: 'success',
  in_production: 'info',
  ready: 'secondary',
  shipped: 'success',
  delivered: 'default',
  cancelled: 'error',
};

// =====================================================
// Page Content
// =====================================================

async function OrderPreparationContent({ orderId }: { orderId: string }) {
  // 認証確認
  await requireAuth();

  // 注文詳細を取得
  const order = await getOrderById(orderId);

  if (!order) {
    notFound();
  }

  // 仕様変更が可能なステータスか確認
  const canModifySpec = ['data_received', 'spec_approved', 'in_production'].includes(order.status);

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            注文準備ページ
          </h1>
          <p className="text-sm text-text-muted mt-1">
            注文番号: {order.orderNumber}
          </p>
        </div>
        <Badge variant={statusVariants[order.status] || 'default'} size="md">
          {statusLabels[order.status] || order.status}
        </Badge>
      </div>

      {/* 注文情報 */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">注文情報</h2>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-text-muted">注文日時</dt>
            <dd className="text-text-primary mt-1">
              {new Date(order.created_at).toLocaleString('ja-JP')}
            </dd>
          </div>
          <div>
            <dt className="text-text-muted">ステータス</dt>
            <dd className="text-text-primary mt-1">
              {statusLabels[order.status] || order.status}
            </dd>
          </div>
        </dl>
      </Card>

      {/* 商品明細 */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">商品明細</h2>
        <OrderSpecificationItemList
          items={order.items}
          orderId={order.id}
          canModify={canModifySpec}
        />
      </Card>

      {/* 注意事項 */}
      <Card className="p-6 bg-yellow-50 border-yellow-200">
        <h3 className="text-sm font-semibold text-yellow-800 mb-2">注意事項</h3>
        <ul className="text-xs text-yellow-700 space-y-1 list-disc list-inside">
          <li>仕様変更はデータ入稿済みの注文のみ可能です</li>
          <li>仕様変更により金額が変更される場合があります</li>
          <li>変更後の金額は承認時に確定されます</li>
          <li>製造開始後の変更はできない場合があります</li>
        </ul>
      </Card>
    </div>
  );
}

// =====================================================
// Loading Component
// =====================================================

function OrderPreparationLoading() {
  return <FullPageSpinner label="注文準備ページを読み込み中..." />;
}

// =====================================================
// Page Component
// =====================================================

export default async function OrderPreparationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense fallback={<OrderPreparationLoading />}>
      <OrderPreparationContent orderId={id} />
    </Suspense>
  );
}

// =====================================================
// Metadata
// =====================================================

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<{
  title: string;
  description: string;
}> {
  const { id } = await params;
  return {
    title: `注文準備 ${id} | マイページ`,
    description: '注文準備と仕様変更',
  };
}
