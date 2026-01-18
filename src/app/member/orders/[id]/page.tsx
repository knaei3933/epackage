/**
 * Order Detail Page
 *
 * 注文詳細ページ
 * - 注文情報の詳細表示
 * - 納品先・請求先情報
 * - 商品明細
 */

import { Suspense } from 'react';
import { redirect, notFound } from 'next/navigation';
import { requireAuth } from '@/lib/dashboard';
import { getOrderById, getOrderStatusHistory } from '@/lib/dashboard';
import { Card, Badge, FullPageSpinner } from '@/components/ui';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import type { Order } from '@/types/dashboard';
import { OrderStatusTimeline } from '@/components/orders/OrderStatusTimeline';
import { OrderActions } from './OrderActions';
import { OrderFileUploadSection } from './OrderFileUploadSection';
import { OrderCommentsSection, CustomerApprovalSection } from '@/components/orders';

// Force dynamic rendering - this page requires authentication
export const dynamic = 'force-dynamic';

// =====================================================
// Constants
// =====================================================

const orderStatusLabels: Record<string, string> = {
  pending: '受付待',
  processing: '処理中',
  manufacturing: '製造中',
  ready: '発送待',
  shipped: '発送完了',
  delivered: '配送完了',
  cancelled: 'キャンセル',
};

const orderStatusVariants: Record<string, 'warning' | 'info' | 'success' | 'secondary' | 'error' | 'default'> = {
  pending: 'warning',
  processing: 'info',
  manufacturing: 'info',
  ready: 'secondary',
  shipped: 'success',
  delivered: 'default',
  cancelled: 'error',
};

// =====================================================
// Page Content
// =====================================================

async function OrderDetailContent({ orderId }: { orderId: string }) {
  // Check authentication using middleware headers
  await requireAuth();

  // 注文詳細を取得
  const order = await getOrderById(orderId);

  if (!order) {
    notFound();
  }

  // ステータス履歴を取得
  const statusHistory = await getOrderStatusHistory(orderId);

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            注文詳細
          </h1>
          <p className="text-text-muted mt-1">
            注文番号: {order.orderNumber}
          </p>
        </div>
        <Badge variant={orderStatusVariants[order.status]} size="md">
          {orderStatusLabels[order.status]}
        </Badge>
      </div>

      {/* 注文情報 */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">注文情報</h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-text-muted">注文日時</dt>
            <dd className="text-text-primary mt-1">
              {new Date(order.createdAt).toLocaleString('ja-JP')}
              <span className="text-text-muted ml-2">
                ({formatDistanceToNow(new Date(order.createdAt), { addSuffix: true, locale: ja })})
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-text-muted">最終更新</dt>
            <dd className="text-text-primary mt-1">
              {new Date(order.updatedAt).toLocaleString('ja-JP')}
            </dd>
          </div>
          {order.shippedAt && (
            <div>
              <dt className="text-text-muted">発送日時</dt>
              <dd className="text-text-primary mt-1">
                {new Date(order.shippedAt).toLocaleString('ja-JP')}
              </dd>
            </div>
          )}
          {order.deliveredAt && (
            <div>
              <dt className="text-text-muted">配送完了日時</dt>
              <dd className="text-text-primary mt-1">
                {new Date(order.deliveredAt).toLocaleString('ja-JP')}
              </dd>
            </div>
          )}
        </dl>
      </Card>

      {/* 顧客情報 */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">顧客情報</h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-text-muted">注文番号</dt>
            <dd className="text-text-primary mt-1 font-medium">
              {order.orderNumber}
            </dd>
          </div>
          {order.customer_name && (
            <div>
              <dt className="text-text-muted">顧客名</dt>
              <dd className="text-text-primary mt-1">
                {order.customer_name}
              </dd>
            </div>
          )}
          {order.customer_email && (
            <div>
              <dt className="text-text-muted">メールアドレス</dt>
              <dd className="text-text-primary mt-1">
                {order.customer_email}
              </dd>
            </div>
          )}
          {order.customer_phone && (
            <div>
              <dt className="text-text-muted">電話番号</dt>
              <dd className="text-text-primary mt-1">
                {order.customer_phone}
              </dd>
            </div>
          )}
        </dl>
      </Card>

      {/* 商品明細 */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">商品明細</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border-secondary">
                <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">商品名</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">数量</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">単価</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">仕様・オプション</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-text-muted">金額</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-b border-border-secondary">
                  <td className="py-3 px-4">
                    <p className="font-medium text-text-primary">{item.productName}</p>
                  </td>
                  <td className="py-3 px-4 text-sm text-text-primary">
                    {item.quantity.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-sm text-text-primary">
                    {item.unitPrice.toLocaleString()}円
                  </td>
                  <td className="py-3 px-4 text-sm">
                    {item.specifications && Object.keys(item.specifications).length > 0 ? (
                      <div className="space-y-1">
                        {item.specifications.size && (
                          <div className="flex">
                            <span className="text-text-muted w-20">サイズ:</span>
                            <span className="text-text-primary">{item.specifications.size}</span>
                          </div>
                        )}
                        {item.specifications.material && (
                          <div className="flex">
                            <span className="text-text-muted w-20">素材:</span>
                            <span className="text-text-primary">{item.specifications.material}</span>
                          </div>
                        )}
                        {item.specifications.printing && (
                          <div className="flex">
                            <span className="text-text-muted w-20">印刷:</span>
                            <span className="text-text-primary">{item.specifications.printing}</span>
                          </div>
                        )}
                        {item.specifications.postProcessing && (
                          <div className="flex">
                            <span className="text-text-muted w-20">後加工:</span>
                            <span className="text-text-primary">
                              {Array.isArray(item.specifications.postProcessing)
                                ? item.specifications.postProcessing.join(', ')
                                : item.specifications.postProcessing}
                            </span>
                          </div>
                        )}
                        {item.specifications.thickness && (
                          <div className="flex">
                            <span className="text-text-muted w-20">厚さ:</span>
                            <span className="text-text-primary">{item.specifications.thickness}</span>
                          </div>
                        )}
                        {item.specifications.zipper && (
                          <div className="flex">
                            <span className="text-text-muted w-20">ジッパー:</span>
                            <span className="text-text-primary">{item.specifications.zipper}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-text-muted">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-text-primary">
                    {item.totalPrice.toLocaleString()}円
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 pt-4 border-t border-border-secondary space-y-2">
          {order.subtotal !== undefined && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">小計</span>
              <span className="text-text-primary">
                {order.subtotal.toLocaleString()}円
              </span>
            </div>
          )}
          {order.taxAmount !== undefined && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">消費税 (10%)</span>
              <span className="text-text-primary">
                {order.taxAmount.toLocaleString()}円
              </span>
            </div>
          )}
          <div className="flex items-center justify-between text-lg font-semibold pt-2 border-t border-border-secondary">
            <span className="text-text-primary">合計</span>
            <span className="text-text-primary">
              {order.totalAmount.toLocaleString()}円
            </span>
          </div>
        </div>
      </Card>

      {/* 納品先情報 */}
      {order.deliveryAddress && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">納品先</h2>
          <div className="text-sm space-y-2">
            <p className="font-medium text-text-primary">
              {order.deliveryAddress.name}
            </p>
            <p className="text-text-muted">
              〒{order.deliveryAddress.postalCode}
            </p>
            <p className="text-text-muted">
              {order.deliveryAddress.prefecture} {order.deliveryAddress.city}
              <br />
              {order.deliveryAddress.address}
              {order.deliveryAddress.building && (
                <>
                  <br />
                  {order.deliveryAddress.building}
                </>
              )}
            </p>
            <p className="text-text-muted">
              TEL: {order.deliveryAddress.phone}
            </p>
            {order.deliveryAddress.contactPerson && (
              <p className="text-text-muted">
                担当者: {order.deliveryAddress.contactPerson}
              </p>
            )}
          </div>
        </Card>
      )}

      {/* 請求先情報 */}
      {order.billingAddress && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">請求先</h2>
          <div className="text-sm space-y-2">
            <p className="font-medium text-text-primary">
              {order.billingAddress.companyName}
            </p>
            <p className="text-text-muted">
              〒{order.billingAddress.postalCode}
            </p>
            <p className="text-text-muted">
              {order.billingAddress.prefecture} {order.billingAddress.city}
              <br />
              {order.billingAddress.address}
              {order.billingAddress.building && (
                <>
                  <br />
                  {order.billingAddress.building}
                </>
              )}
            </p>
            {order.billingAddress.taxNumber && (
              <p className="text-text-muted">
                法人番号: {order.billingAddress.taxNumber}
              </p>
            )}
            {order.billingAddress.email && (
              <p className="text-text-muted">
                メール: {order.billingAddress.email}
              </p>
            )}
            {order.billingAddress.phone && (
              <p className="text-text-muted">
                TEL: {order.billingAddress.phone}
              </p>
            )}
          </div>
        </Card>
      )}

      {/* ステータス履歴 */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">ステータス履歴</h2>
        <OrderStatusTimeline
          statusHistory={statusHistory}
          currentStatus={order.status}
        />
      </Card>

      {/* デザインファイル入稿 */}
      <OrderFileUploadSection order={order} />

      {/* コメントセクション */}
      <OrderCommentsSection orderId={order.id} />

      {/* 承認待ちリクエストセクション */}
      <CustomerApprovalSection orderId={order.id} />

      {/* アクションボタン */}
      <OrderActions order={order} />
    </div>
  );
}

// =====================================================
// Loading Component
// =====================================================

function OrderDetailLoading() {
  return <FullPageSpinner label="注文詳細を読み込み中..." />;
}

// =====================================================
// Page Component
// =====================================================

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense fallback={<OrderDetailLoading />}>
      <OrderDetailContent orderId={id} />
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
    title: `注文詳細 ${id} | マイページ`,
    description: '注文詳細情報',
  };
}
