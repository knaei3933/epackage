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
import { getRequestRBACContext } from '@/lib/auth/request-context';
import { createServiceClient } from '@/lib/supabase';
import { getStatusProgress, isOrderStatus } from '@/types/order-status';
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

  // Require the same DB-verified role used by the admin loader. The member
  // route intentionally exposes read access to ADMIN/OPERATOR/SALES; regular
  // members remain restricted to their own rows. The page takes no role input.
  const rbacContext = await getRequestRBACContext();
  const canViewAllOrders =
    rbacContext?.role === 'admin' ||
    rbacContext?.role === 'operator' ||
    rbacContext?.role === 'sales';

  // Mirror GET /api/member/orders for the initial payload so hydration does not
  // start an empty client-side request waterfall. An error intentionally leaves
  // initialOrders undefined so the existing client fetch/error path can run.
  let initialOrders: unknown[] | undefined;
  try {
    const supabase = createServiceClient();
    let query = supabase
      .from('orders')
      .select(`
        *,
        quotations (
          id,
          quotation_number,
          pdf_url,
          quotation_items (*)
        ),
        order_items (*)
      `)
      .order('created_at', { ascending: false });

    if (!canViewAllOrders) {
      query = query.eq('user_id', user.id);
    }

    const { data: orders, error } = await query.range(0, 19);

    if (error) {
      throw error;
    }

    const legacyProgressMap: Record<string, number> = {
      PENDING: 0,
      QUOTATION: 10,
      DATA_RECEIVED: 30,
      WORK_ORDER: 50,
      CONTRACT_SENT: 55,
      CONTRACT_SIGNED: 60,
      STOCK_IN: 90,
      DELIVERED: 100,
    };

    initialOrders = (orders || []).map((order: any) => {
      const progressPercentage = isOrderStatus(order.status)
        ? getStatusProgress(order.status)
        : legacyProgressMap[order.status] ?? (order.status === 'SHIPPED' ? 100 : 0);
      const orderItems = Array.isArray(order.order_items)
        ? order.order_items
        : order.order_items?.data || null;

      return {
        ...order,
        progress_percentage: progressPercentage,
        items: orderItems,
      };
    });
  } catch (error) {
    console.error('[OrdersPage] Initial order fetch failed:', error);
  }

  // Render the client component with user info
  return (
    <OrdersClient
      userId={user.id}
      userEmail={user.email}
      userProfile={user.user_metadata}
      initialOrders={initialOrders}
    />
  );
}
