/**
 * Admin Order Detail Page (Server Component)
 *
 * 管理者注文詳細ページ - Server Component
 * - RBAC認証チェック
 * - サーバーサイドでデータを取得（src/lib/admin-orders.ts 共有関数）
 * - Client Componentでインタラクティブ操作
 */

import { getAdminAuth } from '../../loader';
import AdminOrderDetailClient from './AdminOrderDetailClient';
import { createServiceClient } from '@/lib/supabase';
import { fetchAdminOrderDetail } from '@/lib/admin-orders';

// ============================================================
// Server-Side Data Fetching
// ============================================================

async function OrderDetailContent({ params }: { params: Promise<{ id: string }> }) {
  // Next.js 15: params is a Promise, need to await it
  const { id: orderId } = await params;

  // RBAC認証チェック
  await getAdminAuth(['order:read'], '/auth/signin?redirect=/admin/orders');

  // サーバーサイドで注文データを取得
  // ※ page.tsx（SSR初回描画）と [id]/route.ts GET（クライアント再フェッチ）で
  //    同一ロジックを共有。キャンセル承認後・商品明細編集後のフルリロードを廃止し、
  //    setCurrentOrder で状態を差し替えるために GET API からも同じ関数を呼ぶ。
  const supabaseService = createServiceClient();
  const { order, statusHistory, initialAdminNotes } = await fetchAdminOrderDetail(supabaseService, orderId);

  console.log('[AdminOrderDetailPage] Order data:', order ? `${order.order_number} (${order.items?.length || 0} items)` : 'not found');

  // Pass data to client component
  return (
    <AdminOrderDetailClient
      orderId={order?.id ?? orderId} // 子APIは uuid 型 order_id で検索するため UUID を優先（注文字 orderId は order=null 時のフォールバック）
      initialOrder={order}
      initialStatusHistory={statusHistory}
      initialAdminNotes={initialAdminNotes}
    />
  );
}

// ============================================================
// Page Component
// ============================================================

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <OrderDetailContent params={params} />;
}

export const metadata = {
  title: '注文詳細 | Epackage Lab Admin',
  description: '注文詳細ページ',
};

export const dynamic = 'force-dynamic';
