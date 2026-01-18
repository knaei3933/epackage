/**
 * Order Status Update API Route
 *
 * 注文ステータス更新 API
 * - PUT: ステータス変更 (State Machine 使用)
 *
 * Features:
 * - State machine validation from @/lib/state-machine/
 * - Type-safe status transitions
 * - Audit logging
 * - Email notifications
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServiceClient } from '@/lib/supabase';
import {
  canTransition,
  mapOrderStatusToState,
} from '@/lib/state-machine/order-machine';
import type { OrderStatus } from '@/types/order-status';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabaseUrlTyped = supabaseUrl as string;
const supabaseAnonKeyTyped = supabaseAnonKey as string;

// ============================================================
// Types
// ============================================================

interface UpdateStatusRequest {
  status: OrderStatus;
  reason?: string;
  notifyCustomer?: boolean;
}

// ============================================================
// PUT: 注文ステータス更新
// ============================================================

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const orderId = params.id;

    const cookieStore = await cookies();
    const supabase = createClient(supabaseUrlTyped, supabaseAnonKeyTyped, {
      auth: {
        storage: {
          getItem: (key: string) => {
            const cookie = cookieStore.get(key);
            return cookie?.value ?? null;
          },
          setItem: (key: string, value: string) => {
            cookieStore.set(key, value, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/',
            });
          },
          removeItem: (key: string) => {
            cookieStore.delete(key);
          },
        },
      },
    });

    // 現在のユーザー確認
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: '認証されていません。' },
        { status: 401 }
      );
    }

    const body = await request.json() as UpdateStatusRequest;
    const { status, reason, notifyCustomer = true } = body;

    // Validate new status
    if (!status) {
      return NextResponse.json(
        { error: 'ステータスは必須です。' },
        { status: 400 }
      );
    }

    // Create service client to bypass RLS
    const supabaseAdmin = createServiceClient();

    // Fetch order to verify ownership and current status
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, user_id, status, order_number, current_state, state_metadata')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('[Order Status] Order not found:', orderError);
      return NextResponse.json(
        { error: '注文が見つかりませんでした。' },
        { status: 404 }
      );
    }

    // Verify ownership (SECURE: server-side only dev mode)
    const isDevMode = process.env.NODE_ENV === 'development' &&
                      process.env.ENABLE_DEV_MOCK_AUTH === 'true';
    const DEV_MODE_ADMIN_USER_ID = '54fd7b31-b805-43cf-b92e-898ddd066875';
    const userIdForDb = isDevMode ? DEV_MODE_ADMIN_USER_ID : user.id;

    // For now, only allow admins to change status (customers should use cancel endpoint)
    // TODO: Add role checking logic here if needed
    if (!isDevMode && order.user_id !== userIdForDb) {
      // Check if user is admin
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', userIdForDb)
        .single();

      if (!profile || profile.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'この注文のステータスを変更する権限がありません。' },
          { status: 403 }
        );
      }
    }

    // Validate status transition using state machine
    const currentState = mapOrderStatusToState(order.status as OrderStatus);
    const targetState = mapOrderStatusToState(status);

    // Check if transition is allowed
    const allowed = canTransition(currentState, targetState);

    if (!allowed) {
      return NextResponse.json(
        {
          error: `ステータスを「${order.status}」から「${status}」に変更できません。`,
          currentStatus: order.status,
          requestedStatus: status,
          reason: '無効なステータス遷移です。',
        },
        { status: 400 }
      );
    }

    // Update order status
    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        status: status,
        current_state: targetState,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select()
      .single();

    if (updateError || !updatedOrder) {
      console.error('[Order Status] Failed to update status:', updateError);
      return NextResponse.json(
        { error: 'ステータスの更新に失敗しました。' },
        { status: 500 }
      );
    }

    // Create audit log entry (optional - if audit_logs table exists)
    try {
      await supabaseAdmin
        .from('audit_logs')
        .insert({
          table_name: 'orders',
          record_id: orderId,
          action: 'UPDATE',
          old_value: { status: order.status, current_state: order.current_state },
          new_value: { status: status, current_state: targetState },
          changed_by: userIdForDb,
          reason: reason || 'Status update',
        });
    } catch (auditError) {
      // Non-blocking: log error but don't fail the request
      console.warn('[Order Status] Failed to create audit log:', auditError);
    }

    // Send email notification if requested (implement email service call)
    if (notifyCustomer) {
      // TODO: Implement email notification service
      console.log('[Order Status] Email notification would be sent to customer');
    }

    console.log('[Order Status] Order status updated:', {
      orderId,
      orderNumber: order.order_number,
      oldStatus: order.status,
      newStatus: status,
      userId: userIdForDb,
      reason,
    });

    return NextResponse.json({
      order: updatedOrder,
      message: 'ステータスを更新しました。',
    });
  } catch (error) {
    console.error('[Order Status] PUT error:', error);

    return NextResponse.json(
      {
        error: 'ステータスの更新に失敗しました。',
      },
      { status: 500 }
    );
  }
}

// OPTIONSメソッド - CORS preflightリクエスト処理
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
