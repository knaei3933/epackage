/**
 * Order Detail Page
 *
 * 注文詳細ページ
 * - 注文情報の詳細表示
 * - 納品先・請求先情報
 * - 商品明細
 * - デザインワークフロー
 *
 * UI改善版:
 * - 情報系セクションをアコーディオンでコンパクト化
 * - アクション系セクションをワークフロー形式で表示
 * - 商品明細をサマリー形式で表示
 */

import { Suspense } from 'react';
import { redirect, notFound } from 'next/navigation';
import { requireAuth } from '@/lib/dashboard';
import { getOrderById, getOrderStatusHistory } from '@/lib/dashboard';
import { Card, FullPageSpinner } from '@/components/ui';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import type { Order } from '@/types/dashboard';
import { OrderStatusTimeline } from '@/components/orders/OrderStatusTimeline';
import { OrderActions } from './OrderActions';
import { OrderCommentsSectionWrapper, CustomerApprovalSection, OrderStatusBadge } from '@/components/orders';
import { OrderInfoAccordion, OrderAddressInfo, DesignWorkflowSection, OrderItemsSummary, ModificationApprovalSection } from '@/components/member';

// Force dynamic rendering - this page requires authentication
export const dynamic = 'force-dynamic';

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
        <OrderStatusBadge status={order.status} locale="ja" />
      </div>

      {/* =====================================================
          状態別ガイダンスメッセージ
          ===================================================== */}
      {order.status === 'CUSTOMER_APPROVAL_PENDING' && (
        <div className="p-4 bg-orange-50 border-2 border-orange-300 rounded-lg flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-medium text-orange-900">
              📋 教正データの承認待ちです
            </p>
            <p className="text-sm text-orange-700 mt-1">
              下記「デザインワークフロー」Step 2でプレビューをご確認の上、承認ボタンを押してください
            </p>
          </div>
        </div>
      )}

      {order.status === 'MODIFICATION_REQUESTED' && (
        <div className="p-4 bg-orange-50 border-2 border-orange-300 rounded-lg flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-medium text-orange-900">
              ⚠️ 修正承認待ちです
            </p>
            <p className="text-sm text-orange-700 mt-1">
              管理者が注文内容を修正しました。下部の「修正承認待ち」セクションで修正内容をご確認の上、承認または拒否を選択してください
            </p>
          </div>
        </div>
      )}

      {order.status === 'MODIFICATION_APPROVED' && (
        <div className="p-4 bg-green-50 border-2 border-green-300 rounded-lg flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-medium text-green-900">
              ✓ 修正が承認されました
            </p>
            <p className="text-sm text-green-700 mt-1">
              管理者の修正内容が承認されました。校正作業に進みます
            </p>
          </div>
        </div>
      )}

      {order.status === 'MODIFICATION_REJECTED' && (
        <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-medium text-red-900">
              ✕ 修正が拒否されました
            </p>
            <p className="text-sm text-red-700 mt-1">
              管理者の修正内容が拒否されました。管理者が再検討します
            </p>
          </div>
        </div>
      )}

      {order.status === 'CORRECTION_IN_PROGRESS' && (
        <div className="p-4 bg-blue-50 border-2 border-blue-300 rounded-lg flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-medium text-blue-900">
              ⏳ 教正作業中です
            </p>
            <p className="text-sm text-blue-700 mt-1">
              現在、デザイナーが教正データを作成中です。完成次第、ここで通知いたします
            </p>
          </div>
        </div>
      )}

      {/* =====================================================
          情報系セクション（3列グリッドでコンパクト化）
          ===================================================== */}
      <OrderInfoAccordion order={order} statusHistory={statusHistory} />

      {/* =====================================================
          商品明細と納品先/請求先（2列グリッド）
          ===================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左列: 商品明細 */}
        <OrderItemsSummary order={order} quotationId={order.quotation_id} />

        {/* 右列: 納品先・請求先 */}
        <OrderAddressInfo order={order} />
      </div>

      {/* =====================================================
          デザインワークフロー（2列レイアウト）
          ===================================================== */}
      <DesignWorkflowSection order={order} />

      {/* =====================================================
          その他のアクションボタン（キャンセル、PDFダウンロード、戻る）
          ===================================================== */}
      <OrderActions order={order} excludeModifyButton={true} />

      {/* =====================================================
          管理者修正承認セクション
          ===================================================== */}
      <ModificationApprovalSection order={order} />

      {/* =====================================================
          承認待ちリクエストセクション
          ===================================================== */}
      <CustomerApprovalSection orderId={order.id} />
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
