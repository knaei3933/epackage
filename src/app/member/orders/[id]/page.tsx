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
import { CustomerApprovalSection, OrderStatusBadge } from '@/components/orders';
import { OrderInfoAccordion, DesignWorkflowSection, OrderItemsSummary, ModificationApprovalSection, RevisionHistoryTimeline } from '@/components/member';
import { OrderInquirySection } from '@/components/orders/OrderInquirySection';
import { JourneyStepper } from '@/components/member/JourneyStepper';
import { NextActionBanner } from '@/components/member/NextActionBanner';
import { getOrderJourneyStage } from '@/lib/journey-stage';
import { getOrderDeliveryTracking } from '@/lib/delivery-tracking';
import { DeliveryTrackingCard } from '@/components/member/DeliveryTrackingCard';

// Force dynamic rendering - this page requires authentication
export const dynamic = 'force-dynamic';

// =====================================================
// Page Content
// =====================================================

async function OrderDetailContent({ orderId }: { orderId: string }) {
  // Check authentication using middleware headers
  const authUser = await requireAuth();

  // 注文詳細を取得
  const order = await getOrderById(orderId);

  if (!order) {
    notFound();
  }

  // ステータス履歴を取得（WS-3: order.id の UUID を渡す・orderId は URL param で order_number の可能性があるため）
  const statusHistory = await getOrderStatusHistory(order.id);
  // ジャーニー進行状態（見積→注文→入稿→校正→承認）の単一データソース
  const journey = getOrderJourneyStage(order.status);
  // 配送追跡情報（自分の注文のみ・追跡レコード未作成なら null）
  const deliveryTracking = await getOrderDeliveryTracking(order.id, authUser.id);

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

      {/* ジャーニーステッパー＋ステータスバナー（スクロール中も上部に固定表示） */}
      {!journey.isCancelled && (
        <div className="sticky top-16 z-30 space-y-3">
          <Card className="p-4 shadow-md">
            <JourneyStepper journey={journey} />
          </Card>

      {/* =====================================================
          状態別ガイダンスメッセージ（NextActionBanner 統合版）
          - テキストは従来のインラインバナーから変更なし
          ===================================================== */}
      {order.status === 'CUSTOMER_APPROVAL_PENDING' && (
        <NextActionBanner
          sticky={false}
          tone="action"
          iconKey="clipboard"
          title="📋 教正データの承認待ちです"
          description="下記「デザインワークフロー」Step 2でプレビューをご確認の上、承認ボタンを押してください"
        />
      )}

      {order.status === 'MODIFICATION_REQUESTED' && (
        <NextActionBanner
          sticky={false}
          tone="action"
          iconKey="filePen"
          title="⚠️ 修正承認待ちです"
          description="管理者が注文内容を修正しました。下部の「修正承認待ち」セクションで修正内容をご確認の上、承認または拒否を選択してください"
        />
      )}

      {order.status === 'MODIFICATION_APPROVED' && (
        <NextActionBanner
          sticky={false}
          tone="success"
          title="✓ 修正が承認されました"
          description="管理者の修正内容が承認されました。校正作業に進みます"
        />
      )}

      {order.status === 'MODIFICATION_REJECTED' && (
        <NextActionBanner
          sticky={false}
          tone="error"
          title="✕ 修正が拒否されました"
          description="管理者の修正内容が拒否されました。管理者が再検討します"
        />
      )}

      {order.status === 'CORRECTION_IN_PROGRESS' && (
        <NextActionBanner
          sticky={false}
          tone="info"
          title="⏳ 教正作業中です"
          description="現在、デザイナーが教正データを作成中です。完成次第、ここで通知いたします"
        />
      )}

      {order.status === 'DATA_UPLOAD_PENDING' && (
        <NextActionBanner
          sticky={false}
          tone="action"
          title="📤 製造データの入稿をお願いします"
          description="下記「デザインワークフロー」Step 1から製造データ（AI・PDF等）をアップロードしてください"
        />
      )}

      {order.status === 'DATA_UPLOADED' && (
        <NextActionBanner
          sticky={false}
          tone="info"
          title="✓ データ入稿を確認しました"
          description="入稿データを韓国デザイナーに送信しました。教正データの作成を待っています"
        />
      )}

      {order.status === 'PRODUCTION' && (
        <NextActionBanner
          sticky={false}
          tone="info"
          iconKey="factory"
          title="🏭 製造中です"
          description="現在、パッケージの製造を行っています。完成まで2〜3週間程度かかります"
        />
      )}

      {order.status === 'READY_TO_SHIP' && (
        <NextActionBanner
          sticky={false}
          tone="info"
          title="📦 出荷準備完了"
          description="製造が完了し、出荷準備が整いました。まもなく発送いたします"
        />
      )}

      {order.status === 'SHIPPED' && (
        <NextActionBanner
          sticky={false}
          tone="success"
          title="🚚 発送完了"
          description="商品を発送しました。下記の配送追跡カードから配送状況をご確認いただけます"
        />
      )}

      {order.status === 'DELIVERED' && (
        <NextActionBanner
          sticky={false}
          tone="success"
          title="🎉 お取引が完了しました"
          description="商品の配達が完了しました。この度はご利用いただき、誠にありがとうございました。"
        />
      )}

      {/* =====================================================
          配送追跡カード（出荷以降・追跡レコード存在時のみ）
          ===================================================== */}
      {deliveryTracking && (
        <DeliveryTrackingCard tracking={deliveryTracking} />
      )}
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
