/**
 * Cancel Order API Route
 *
 * 注文キャンセルAPI
 * - Supabase MCPを使用して注文をキャンセル状態に更新
 * - ステータスチェック（キャンセル可能かどうか）
 * - 管理者通知送信
 *
 * POST /api/orders/cancel
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseSSRClient } from '@/lib/supabase-ssr';
import { createServiceClient } from '@/lib/supabase'
import { cancelDesignerTasksForOrder } from '@/lib/order-cancellation'
import { logger, maskEmail } from '@/lib/logger'
import {
  getOrderStatus,
  cancelOrder,
  createNotification,
} from '@/lib/supabase-mcp'

// ============================================================
// Types
// ============================================================

interface CancelOrderRequest {
  orderId: string
}

// ============================================================
// Constants
// ============================================================

// キャンセル可能ステータス（生産開始前のすべて）
// designer_task が active になるデータ準備・校正・修正・承認待ちの各段階を含む。
// PRODUCTION 以降（STOCK_IN/SHIPPED/DELIVERED/READY_TO_SHIP）と
// 既に CANCELLED のものはキャンセル不可。
const CANCELLABLE_STATUSES = [
  // 従来の5状態
  'PENDING',
  'QUOTATION',
  'DATA_RECEIVED',
  'WORK_ORDER',
  'CONTRACT_SENT',
  // 契約署名後も生産前ならキャンセル可能
  'CONTRACT_SIGNED',
  // 見積もり承認フロー
  'QUOTATION_PENDING',
  'QUOTATION_APPROVED',
  // データアップロード・校正段階（designer_task active）
  'DATA_UPLOAD_PENDING',
  'DATA_UPLOADED',
  'CORRECTION_IN_PROGRESS',
  'CORRECTION_COMPLETED',
  'CUSTOMER_APPROVAL_PENDING',
  // 修正リクエストフロー（生産前の差し戻し）
  'MODIFICATION_REQUESTED',
  'MODIFICATION_APPROVED',
  'MODIFICATION_REJECTED',
]

// ============================================================
// POST: Cancel Order
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const { client: supabase } = await createSupabaseSSRClient(request);
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse request body
    const body: CancelOrderRequest = await request.json()
    const { orderId } = body

    // Validate required fields
    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'orderId is required' },
        { status: 400 }
      )
    }

    // Create service client to bypass RLS
    const supabaseAdmin = createServiceClient()

    // Fetch order to verify ownership
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, user_id, status, order_number')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      console.error('[Order Cancel] Order not found:', orderError)
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    // Verify ownership (SECURE: server-side only dev mode)
    const isDevMode = process.env.NODE_ENV === 'development' &&
                      process.env.ENABLE_DEV_MOCK_AUTH === 'true'
    const DEV_MODE_PLACEHOLDER_USER_ID = '00000000-0000-0000-0000-000000000000'
    const userIdForDb = isDevMode ? DEV_MODE_PLACEHOLDER_USER_ID : user.id

    if (!isDevMode && order.user_id !== userIdForDb) {
      return NextResponse.json(
        { success: false, error: 'Access denied: This order does not belong to you' },
        { status: 403 }
      )
    }

    // Check if order can be cancelled
    const normalizedStatus = order.status?.toUpperCase()
    if (!CANCELLABLE_STATUSES.includes(normalizedStatus)) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot cancel order with status: ${order.status}`,
          currentStatus: order.status,
          cancellableStatuses: CANCELLABLE_STATUSES,
        },
        { status: 400 }
      )
    }

    // Cancel order using Supabase MCP
    const cancelResult = await cancelOrder(orderId)

    if (cancelResult.error) {
      console.error('[Order Cancel] Failed to cancel order:', cancelResult.error)
      return NextResponse.json(
        { success: false, error: 'Failed to cancel order', details: cancelResult.error.message },
        { status: 500 }
      )
    }

    // [連動] 注文キャンセルに伴い designer_task_assignments をキャンセル（Option A）
    // 会員経路では cookie ベース client だと UPDATE が staff ポリシー（20260724000001）で
    // 拒否されるため、createServiceClient（service role・RLS bypass）を注入。
    // designer 側失敗は警告ログのみで注文キャンセルは維持（緩い整合性）
    try {
      const designerResult = await cancelDesignerTasksForOrder(
        orderId,
        {
          source: 'order_cancel_member',
          memberUserId: userIdForDb,
        },
        supabaseAdmin
      )
      if (designerResult.errors.length > 0) {
        console.warn('[Order Cancel] designer task cancel partial failure:', designerResult.errors)
      }
    } catch (designerCancelError) {
      console.warn('[Order Cancel] designer task cancel error:', designerCancelError)
    }

    // Create admin notification
    try {
      await createNotification(
        'order_cancelled',
        '注文キャンセル通知',
        `注文 ${order.order_number} がキャンセルされました`,
        orderId,
        'admin'
      )
    } catch (notificationError) {
      // Non-blocking: log error but don't fail the request
      console.warn('[Order Cancel] Failed to create admin notification:', notificationError)
    }

    // Log order cancellation（security-reviewer M-1: customerEmail は maskEmail で難読化・PII 保護）
    logger.info('order_cancel.success', {
      orderId,
      orderNumber: order.order_number,
      userId: userIdForDb,
      customerEmail: maskEmail(user.email),
    })

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.order_number,
        status: 'CANCELLED',
      },
      message: '注文をキャンセルしました',
    })

  } catch (error: unknown) {
    const errMsg = (error as { message?: string }).message;
    console.error('[Order Cancel] POST error:', error)
    return NextResponse.json(
      { success: false, error: errMsg || 'Internal server error' },
      { status: 500 }
    )
  }
}
