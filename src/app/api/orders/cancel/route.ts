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

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase'
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

const CANCELLABLE_STATUSES = [
  'PENDING',
  'QUOTATION',
  'DATA_RECEIVED',
  'WORK_ORDER',
  'CONTRACT_SENT',
]

// ============================================================
// POST: Cancel Order
// ============================================================

export async function POST(request: NextRequest) {
  try {
    // Next.js 16: cookies() now returns a Promise and must be awaited
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

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

    // Log order cancellation
    console.log('[Order Cancel] Order cancelled:', {
      orderId,
      orderNumber: order.order_number,
      userId: userIdForDb,
      customerEmail: user.email,
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

  } catch (error: any) {
    console.error('[Order Cancel] POST error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
