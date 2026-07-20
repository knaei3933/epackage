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
import { OrderInfoAccordion, DesignWorkflowSection, OrderItemsSummary, ModificationApprovalSection, RevisionHistoryTimeline } from '@/components/member';
import { OrderInquirySection } from '@/components/orders/OrderInquirySection';

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

      {order.status === 'DATA_UPLOAD_PENDING' && (
        <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-lg flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-medium text-amber-900">
              📤 製造データの入稿をお願いします
            </p>
            <p className="text-sm text-amber-700 mt-1">
              下記「デザインワークフロー」Step 1から製造データ（AI・PDF等）をアップロードしてください
            </p>
          </div>
        </div>
      )}

      {order.status === 'DATA_UPLOADED' && (
        <div className="p-4 bg-blue-50 border-2 border-blue-300 rounded-lg flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-medium text-blue-900">
              ✓ データ入稿を確認しました
            </p>
            <p className="text-sm text-blue-700 mt-1">
              入稿データを韓国デザイナーに送信しました。教正データの作成を待っています
            </p>
          </div>
        </div>
      )}

      {order.status === 'PRODUCTION' && (
        <div className="p-4 bg-indigo-50 border-2 border-indigo-300 rounded-lg flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-medium text-indigo-900">
              🏭 製造中です
            </p>
            <p className="text-sm text-indigo-700 mt-1">
              現在、パッケージの製造を行っています。完成まで2〜3週間程度かかります
            </p>
          </div>
        </div>
      )}

      {order.status === 'READY_TO_SHIP' && (
        <div className="p-4 bg-teal-50 border-2 border-teal-300 rounded-lg flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-medium text-teal-900">
              📦 出荷準備完了
            </p>
            <p className="text-sm text-teal-700 mt-1">
              製造が完了し、出荷準備が整いました。まもなく発送いたします
            </p>
          </div>
        </div>
      )}

      {order.status === 'SHIPPED' && (
        <div className="p-4 bg-green-50 border-2 border-green-300 rounded-lg flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-medium text-green-900">
              🚚 発送完了
            </p>
            <p className="text-sm text-green-700 mt-1">
              商品を発送しました。配送状況は追跡情報をご確認ください
            </p>
          </div>
        </div>
      )}

      {/* =====================================================
          情報系セクション（統合済み）
          ===================================================== */}
      <OrderInfoAccordion order={order} statusHistory={statusHistory} />

      {/* =====================================================
          商品明細
          ===================================================== */}
      <OrderItemsSummary order={order} quotationId={order.quotation_id} />

      {/* =====================================================
          デザインワークフロー（2列レイアウト）
          ===================================================== */}
      <DesignWorkflowSection order={order} />

      {/* =====================================================
          注文へのお問い合わせチャット（1注文=1スレッド・order-inquiry-link）
          - 既存スレッドがあれば折りたたみ表示・無ければ作成フォーム
          - 注文番号 {orderNumber} が件名に自動付与される（API 側で生成）
          ===================================================== */}
      <OrderInquirySection orderId={order.id} orderNumber={order.orderNumber} />

      {/* =====================================================
          リビジョン履歴タイムライン
          ===================================================== */}
      <RevisionHistoryTimeline orderId={order.id} />

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
