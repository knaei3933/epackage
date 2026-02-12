/**
 * Order Cancel API Route
 *
 * 注文キャンセル API
 * - POST: 注文キャンセル
 *
 * Features:
 * - Status validation (only PENDING, SENT allow cancellation)
 * - State machine validation
 * - Ownership verification
 * - Audit logging
 * - Admin notifications
 */

export const dynamic = 'force-dynamic';

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

interface CancelOrderRequest {
  reason?: string;
}

// ============================================================
// Constants: Cancellable statuses
// ============================================================

const CANCELLABLE_STATUSES: OrderStatus[] = [
  'PENDING',
  'QUOTATION',
  'DATA_RECEIVED',
  'WORK_ORDER',
  'CONTRACT_SENT',
];

// ============================================================
// POST: 注文キャンセル
// ============================================================

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id: orderId } = params;

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

    const body = await request.json() as CancelOrderRequest;
    const { reason } = body;

    // Create service client to bypass RLS
    const supabaseAdmin = createServiceClient();

    // Fetch order to verify ownership and status
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, user_id, status, order_number, current_state')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('[Order Cancel] Order not found:', orderError);
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

    if (!isDevMode && order.user_id !== userIdForDb) {
      // Check if user is admin (admins can cancel any order)
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', userIdForDb)
        .single();

      if (!profile || profile.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'この注文をキャンセルする権限がありません。' },
          { status: 403 }
        );
      }
    }

    // Check if order is already cancelled
    if (order.status === 'CANCELLED') {
      return NextResponse.json(
        {
          error: '注文は既にキャンセルされています。',
          order: {
            id: order.id,
            status: order.status,
          },
        },
        { status: 400 }
      );
    }

    // Check if order can be cancelled (using state machine validation)
    const currentState = mapOrderStatusToState(order.status as OrderStatus);
    const cancelledState = mapOrderStatusToState('CANCELLED');

    // Verify status is in cancellable list
    const normalizedStatus = order.status?.toUpperCase() as OrderStatus;
    if (!CANCELLABLE_STATUSES.includes(normalizedStatus)) {
      return NextResponse.json(
        {
          error: `注文ステータスが「${order.status}」のためキャンセルできません。`,
          currentStatus: order.status,
          cancellableStatuses: CANCELLABLE_STATUSES,
          reason: 'このステータスの注文はキャンセルできません。',
        },
        { status: 400 }
      );
    }

    // Validate state transition using state machine
    const canCancel = canTransition(currentState, cancelledState);

    if (!canCancel) {
      return NextResponse.json(
        {
          error: '現在のステータスからキャンセルに移行できません。',
          currentState,
          currentStatus: order.status,
        },
        { status: 400 }
      );
    }

    // Update order status to CANCELLED
    const { data: cancelledOrder, error: cancelError } = await supabaseAdmin
      .from('orders')
      .update({
        status: 'CANCELLED',
        current_state: 'cancelled',
        updated_at: new Date().toISOString(),
        // Store cancellation reason in state_metadata
        state_metadata: {
          ...(order.state_metadata || {}),
          cancelled_at: new Date().toISOString(),
          cancelled_by: userIdForDb,
          cancellation_reason: reason || 'Customer request',
        },
      })
      .eq('id', orderId)
      .select()
      .single();

    if (cancelError || !cancelledOrder) {
      console.error('[Order Cancel] Failed to cancel order:', cancelError);
      return NextResponse.json(
        { error: '注文のキャンセルに失敗しました。' },
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
          action: 'CANCEL',
          old_value: { status: order.status, current_state: order.current_state },
          new_value: { status: 'CANCELLED', current_state: 'cancelled' },
          changed_by: userIdForDb,
          reason: reason || 'Order cancelled',
        });
    } catch (auditError) {
      // Non-blocking: log error but don't fail the request
      console.warn('[Order Cancel] Failed to create audit log:', auditError);
    }

    // Send notification to admin
    try {
      // TODO: Implement admin notification service
      // For now, just log it
      console.log('[Order Cancel] Admin notification would be sent:', {
        orderId,
        orderNumber: order.order_number,
        cancelledBy: userIdForDb,
        reason,
      });
    } catch (notificationError) {
      // Non-blocking: log error but don't fail the request
      console.warn('[Order Cancel] Failed to send admin notification:', notificationError);
    }

    console.log('[Order Cancel] Order cancelled:', {
      orderId,
      orderNumber: order.order_number,
      oldStatus: order.status,
      newStatus: 'CANCELLED',
      userId: userIdForDb,
      reason,
    });

    return NextResponse.json({
      order: cancelledOrder,
      message: '注文をキャンセルしました。',
    });
  } catch (error) {
    console.error('[Order Cancel] POST error:', error);

    return NextResponse.json(
      {
        error: '注文のキャンセルに失敗しました。',
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
