/**
 * Reorder Page
 *
 * 再注文ページ
 * - 過去の注文から再注文
 * - 注文履歴から選択
 */

import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requireAuth, AuthRequiredError } from '@/lib/dashboard';
import { getOrders } from '@/lib/dashboard';
import { Card, Button, FullPageSpinner } from '@/components/ui';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import type { Order } from '@/types/dashboard';

// Force dynamic rendering - this page requires authentication
export const dynamic = 'force-dynamic';

// =====================================================
// Page Content
// =====================================================

async function ReorderContent() {
  // Use requireAuth helper - works in both Dev Mode and Production
  let user;
  try {
    user = await requireAuth();
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      redirect('/auth/signin?redirect=/member/orders/reorder');
    }
    throw error;
  }

  // 配送完了・キャンセル以外の注文を取得（再注文可能）
  const { data: orders } = await getOrders(
    {},
    { page: 1, limit: 50, sortBy: 'createdAt', sortOrder: 'desc' }
  );

  // 再注文可能な注文（delivered, shipped）をフィルタ
  const reorderableOrders = orders.filter(
    (order) => order.status === 'DELIVERED' || order.status === 'SHIPPED'
  );

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">再注文</h1>
        <p className="text-text-muted mt-1">
          過去の注文から同じ商品を再度注文できます
        </p>
      </div>

      {/* 再注文可能な注文 */}
      {reorderableOrders.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-text-muted">
            再注文可能な注文がありません
          </p>
          <Link href="/catalog">
            <Button
              variant="primary"
              className="mt-4"
            >
              商品カタログを見る
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {reorderableOrders.map((order) => (
            <Card key={order.id} className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {/* 注文番号と日付 */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className="font-medium text-text-primary">
                      {order.orderNumber}
                    </span>
                    <span className="text-sm text-text-muted">
                      {formatDistanceToNow(new Date(order.createdAt), {
                        addSuffix: true,
                        locale: ja,
                      })}
                    </span>
                  </div>

                  {/* 商品一覧 */}
                  <div className="space-y-2 mb-4">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex-1">
                          <span className="text-text-primary">
                            {item.productName}
                          </span>
                          <span className="text-text-muted ml-2">
                            x{item.quantity}
                          </span>
                        </div>
                        <span className="text-text-muted">
                          {item.totalPrice.toLocaleString()}円
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* 合計 */}
                  <div className="text-lg font-semibold text-text-primary">
                    合計: {order.totalAmount.toLocaleString()}円
                  </div>
                </div>

                {/* 再注文ボタン */}
                <Link href={`/quote-simulator?orderId=${order.id}`}>
                  <Button variant="secondary">
                    再注文する
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// =====================================================
// Loading Component
// =====================================================

function ReorderLoading() {
  return <FullPageSpinner label="注文履歴を読み込み中..." />;
}

// =====================================================
// Page Component
// =====================================================

export default function ReorderPage() {
  return (
    <Suspense fallback={<ReorderLoading />}>
      <ReorderContent />
    </Suspense>
  );
}

// =====================================================
// Metadata
// =====================================================

export const metadata = {
  title: '再注文 | マイページ',
  description: '過去の注文から再注文',
};
