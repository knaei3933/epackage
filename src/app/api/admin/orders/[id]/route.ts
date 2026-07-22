/**
 * Admin Order Detail API (GET)
 *
 * 管理者 注文詳細取得API
 * - 注文データを UUID または注文番号で取得（src/lib/admin-orders.ts 共有関数）
 * - クライアント側の setCurrentOrder 再フェッチ用途:
 *   キャンセル承認後・商品明細編集後などにフルリロードせず状態を差し替える
 *
 * 認可: withAdminAuth (@/lib/api-auth) でラップ - ADMIN ロール必須
 * 参考: src/app/api/admin/orders/[id]/comments/route.ts と同一パターン
 *
 * @route /api/admin/orders/[id]
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { withAdminAuth } from '@/lib/api-auth';
import { fetchAdminOrderDetail } from '@/lib/admin-orders';

// ============================================================
// GET Handler - Fetch Order Detail (Admin)
// ============================================================

export const GET = withAdminAuth<any>(async (
  request: NextRequest,
  auth,
  context
) => {
  // Next.js 16: params is provided in context as a Promise
  // 注: context.params の値型は string | string[]。動的ルート [id] は常に単一文字列だが、
  // 型上 string | string[] になるため string へキャスト（実行時ロジック不変）。
  const { id } = await context.params;
  if (Array.isArray(id)) {
    return NextResponse.json(
      { success: false, error: '無効なパラメータです。', errorEn: 'Invalid parameter' },
      { status: 400 }
    );
  }
  const orderId = id as string;

  if (!orderId) {
    return NextResponse.json(
      { success: false, error: '注文IDが指定されていません。', errorEn: 'Order ID is required' },
      { status: 400 }
    );
  }

  console.log('[Admin Order Detail GET] Order ID:', orderId);
  console.log('[Admin Order Detail GET] Authenticated user:', auth?.userId);

  // service_role クライアントで RLS バイパス
  // 認可は withAdminAuth で検証済み（auth.userId, auth.role が利用可能）
  const supabase = createServiceClient();

  // 共有関数で注文詳細を取得（page.tsx のSSR取得と同一ロジック）
  const { order } = await fetchAdminOrderDetail(supabase, orderId);

  if (!order) {
    return NextResponse.json(
      { success: false, error: '注文が見つかりません。', errorEn: 'Order not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, order }, { status: 200 });
});

// ============================================================
// OPTIONS - CORS preflight
// ============================================================

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
