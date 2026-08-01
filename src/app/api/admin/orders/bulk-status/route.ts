/**
 * Bulk Order Status Update API
 * PUT /api/admin/orders/bulk-status
 *
 * Updates the status of multiple orders at once
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { invalidateAdminDashboardCache } from '@/lib/cache-helpers';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';
import { cancelDesignerTasksForOrder } from '@/lib/order-cancellation';
import { mapStatusToCurrentStage, isValidStatusTransition } from '@/types/order-status';
import type { OrderStatus } from '@/types/order-status';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Helper function to create service role client
function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
  });
}

export async function PUT(request: NextRequest) {
  // SECURITY: ADMIN厳格認可（MAJOR-3・他 admin API route と統一・verifyAdminAuth は ADMIN+ACTIVE のみ許可）
  // 呼び出し元（AdminOrdersClient）は adminFetch で Bearer token を送信済み
  const auth = await verifyAdminAuth(request);
  if (!auth) {
    return unauthorizedResponse();
  }

  try {
    const body = await request.json();
    const { order_ids, status } = body;

    // Validate required fields
    if (!Array.isArray(order_ids) || order_ids.length === 0) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'order_ids is required and must be a non-empty array',
        },
      }, { status: 400 });
    }

    if (!status) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'status is required',
        },
      }, { status: 400 });
    }

    // Use service role client to bypass RLS
    const supabase = createServiceRoleClient();

    // Bug2修正: 各注文の現在ステータスを取得し isValidStatusTransition で検証してから更新。
    // 旧コードは .update().in('id', order_ids) で一括更新し、遷移の妥当性を検証せず、
    // current_stage も更新しなかった（単一 status API と保護レベルが異なる欠陥）。
    const { data: currentOrders, error: fetchError } = await supabase
      .from('orders')
      .select('id, status')
      .in('id', order_ids);

    if (fetchError) {
      console.error('[BulkStatusUpdate] fetch error:', fetchError);
      throw fetchError;
    }

    const targetStatus = status as OrderStatus;
    const validIds: string[] = [];
    const skipped: Array<{ id: string; from: string; to: string }> = [];
    for (const o of currentOrders || []) {
      if (isValidStatusTransition(o.status as OrderStatus, targetStatus)) {
        validIds.push(o.id);
      } else {
        skipped.push({ id: o.id, from: o.status ?? '(null)', to: status });
      }
    }

    if (validIds.length === 0) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_TRANSITION',
          message: `ステータス「${status}」へ遷移可能な注文がありません（${skipped.length}件すべて不正遷移）`,
          skipped,
        },
      }, { status: 400 });
    }

    // 正当な注文のみ更新（current_stage を mapStatusToCurrentStage で同期）
    // Bug3: SHIPPED 到達時に shipped_at を記録（正規 status API と対称）。
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('orders')
      .update({
        status,
        current_stage: mapStatusToCurrentStage(targetStatus),
        updated_at: now,
        ...(targetStatus === 'SHIPPED' && { shipped_at: now }),
      })
      .in('id', validIds)
      .select();

    if (error) {
      console.error('[BulkStatusUpdate] DB Error:', error);
      throw error;
    }

    // [連動] CANCELLED に一括更新された場合、正当に更新された注文（validIds）の designer_task_assignments をキャンセル（Option A）
    // designer 側失敗は警告ログのみで一括更新は維持（緩い整合性）
    if (String(status).toUpperCase() === 'CANCELLED') {
      for (const oid of validIds) {
        try {
          // verifier Gap-1 対応: 第3引数に service role client（L68 生成済み）を注入。
          // verifyAdminAuth は Bearer token 優先（auth-helpers L86-112）で cookie に依存しないが、
          // cancelDesignerTasksForOrder のデフォルト client（cookie SSR）は cookie 有無で RLS が変わる。
          // service role を注入し cookie 依存を排除して確実に UPDATE させる（member 経路 L139 と対称）。
          const designerResult = await cancelDesignerTasksForOrder(
            String(oid),
            {
              source: 'order_bulk_status',
              adminUserId: auth.userId,
            },
            supabase
          );
          if (designerResult.errors.length > 0) {
            console.warn('[BulkStatusUpdate] designer task cancel partial failure:', {
              orderId: oid,
              errors: designerResult.errors,
            });
          }
        } catch (designerCancelError) {
          console.warn('[BulkStatusUpdate] designer task cancel error:', {
            orderId: oid,
            error: designerCancelError,
          });
        }
      }
    }

    // ダッシュボード統計の即時反映（C2・Phase 4-3・orders 一括ステータス更新）
    invalidateAdminDashboardCache();

    return NextResponse.json({
      success: true,
      updated_count: data?.length || 0,
      skipped_count: skipped.length,
      skipped,
      orders: data,
    });

  } catch (error) {
    console.error('Bulk status update error:', error);

    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    }, { status: 500 });
  }
}
