/**
 * Unified Orders Page
 *
 * 注文一覧ページ（統合版）
 * - Server Component: サーバーサイド認証チェック
 * - Client Component: タブで「処理中」「履歴」「再注文」を切り替え
 * - ステータス管理・検索・フィルタリング・ソート
 * - 進捗状況表示
 */

import { Suspense } from 'react';
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

function MemberOrdersRouteShell() {
  return (
    <div className="min-h-screen bg-bg-primary" aria-busy="true">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div
            aria-hidden="true"
            className="h-7 w-40 bg-border-light rounded animate-pulse"
          />
          <p className="mt-2 text-sm text-text-muted">読み込み中です。</p>
        </div>
        <section aria-label="注文一覧を読み込み中" data-testid="member-orders-list-shell">
          <div className="space-y-4" aria-hidden="true">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-md border border-border-light">
                <div className="h-4 w-32 bg-border-light rounded animate-pulse" />
                <div className="mt-4 h-3 w-48 bg-border-light rounded animate-pulse" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

async function getInitialOrders(userId: string, canViewAllOrders: boolean): Promise<unknown[] | undefined> {
  // Mirror GET /api/member/orders for the initial payload so hydration does not
  // start an empty client-side request waterfall. An error intentionally leaves
  // initialOrders undefined so the existing client fetch/error path can run.
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
      query = query.eq('user_id', userId);
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

    return (orders || []).map((order: any) => {
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
    return undefined;
  }
}

export async function AuthenticatedOrders() {
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

  // Start the scoped query after verified auth/RBAC, but stream the URL-derived
  // header while the query remains in flight.
  const initialOrdersPromise = getInitialOrders(user.id, canViewAllOrders);

  return (
    <OrdersClient
      userId={user.id}
      userEmail={user.email}
      userProfile={user.user_metadata}
      initialOrdersPromise={initialOrdersPromise}
    />
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<MemberOrdersRouteShell />}>
      <AuthenticatedOrders />
    </Suspense>
  );
}
