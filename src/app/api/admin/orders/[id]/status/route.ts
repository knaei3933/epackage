/**
 * Admin Order Status Update API Route
 *
 * 管理者用注文ステータス更新 API
 * - PUT: ステータス変更 (管理者専用)
 * - GET: ステータス取得
 * - Service Role Keyを使用してRLSを回避
 *
 * 修正履歴:
 * - H-9: isValidStatusTransition で状態遷移検証（不正遷移は 400）
 * - C-5: audit_logs（本番未存在・サイレント失敗）→ order_status_history に統一
 * - H-13: changed_by 'ADMIN' ハードコード → 実行者 auth.userId
 * - M-9: 本番ログ肥大化する console.log を削減
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';
import type { OrderStatus } from '@/types/order-status';
import { mapStatusToCurrentStage, isValidStatusTransition } from '@/types/order-status';
import { revalidatePath, revalidateTag } from 'next/cache';

// ============================================================
// Types
// ============================================================

interface UpdateStatusRequest {
  status: OrderStatus;
  reason?: string;
  notifyCustomer?: boolean;
}

// ============================================================
// PUT: 注文ステータス更新（管理者専用）
// ============================================================

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // 認証（認証バイパス修正 — 全 admin ルートと統一・ACTIVE のみ許可）
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const params = await context.params;
    const { id: orderId } = params;

    const body = await request.json() as UpdateStatusRequest;
    const { status, reason } = body;

    // 新ステータスの必須チェック
    if (!status) {
      return NextResponse.json(
        { error: 'ステータスは必須です。' },
        { status: 400 }
      );
    }

    // Service clientを使用（RLS回避）
    const supabase = createServiceClient();

    // 注文取得
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, user_id, status, order_number')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: '注文が見つかりませんでした。' },
        { status: 404 }
      );
    }

    // H-9: 状態遷移検証（API はクライアントから直接叩けるため必須）
    // 不正遷移（例: SHIPPED → QUOTATION_PENDING の逆行）は 400 で拒否。
    if (!isValidStatusTransition(order.status as OrderStatus, status)) {
      return NextResponse.json(
        {
          error: `ステータスを「${order.status}」から「${status}」に変更できません。無効なステータス遷移です。`,
        },
        { status: 400 }
      );
    }

    // ステータス更新
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        status: status,
        current_stage: mapStatusToCurrentStage(status),
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select()
      .single();

    if (updateError || !updatedOrder) {
      console.error('[Admin Order Status] Failed to update status:', updateError);
      return NextResponse.json(
        { error: 'ステータスの更新に失敗しました。' },
        { status: 500 }
      );
    }

    // C-5 + H-13: 監査ログを order_status_history（本番存在テーブル）に記録
    // 旧 audit_logs は本番未存在・changed_by 'ADMIN' ハードコードで追跡不能だった。
    try {
      await supabase.from('order_status_history').insert({
        order_id: orderId,
        from_status: order.status,
        to_status: status,
        changed_by: auth.userId,
        reason: reason || 'Admin status update',
      });
    } catch (auditError) {
      console.warn('[Admin Order Status] Failed to record status history:', auditError);
    }

    // ダッシュボード統計の即時反映（C2・Phase 4-3）
    revalidatePath('/admin/dashboard');
    revalidateTag('admin-dashboard', 'max');

    return NextResponse.json({
      order: updatedOrder,
      message: 'ステータスを更新しました。',
    });
  } catch (error) {
    console.error('[Admin Order Status] PUT error:', error);

    return NextResponse.json(
      {
        error: 'ステータスの更新に失敗しました。',
      },
      { status: 500 }
    );
  }
}

// ============================================================
// GET: 注文ステータス取得
// ============================================================

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // 認証（認証バイパス修正 — 全 admin ルートと統一・ACTIVE のみ許可）
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const params = await context.params;
    const { id: orderId } = params;

    const supabase = createServiceClient();

    // 注文ステータス取得
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, status, order_number, updated_at')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: '注文が見つかりませんでした。' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('[Admin Order Status] GET error:', error);
    return NextResponse.json(
      { error: 'ステータスの取得に失敗しました。' },
      { status: 500 }
    );
  }
}

// OPTIONSメソッド - CORS preflightリクエスト処理
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
