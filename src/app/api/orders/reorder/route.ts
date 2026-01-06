/**
 * Reorder API Route
 *
 * 再注文API
 * - 過去の注文を複製して新規注文を作成
 * - 注文アイテムのコピー
 * - 配送先・請求先のコピー
 * - Supabase MCPを使用したDB操作
 *
 * POST /api/orders/reorder
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase'
import {
  getOrderDetails,
  duplicateOrder,
  duplicateOrderItems,
  recalculateOrderTotal,
} from '@/lib/supabase-mcp'

// ============================================================
// Types
// ============================================================

interface ReorderRequest {
  originalOrderId: string
}

// ============================================================
// Constants
// ============================================================

const REORDERABLE_STATUSES = [
  'DELIVERED',
  'CANCELLED',
]

// ============================================================
// POST: Reorder
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
    const body: ReorderRequest = await request.json()
    const { originalOrderId } = body

    // Validate required fields
    if (!originalOrderId) {
      return NextResponse.json(
        { success: false, error: 'originalOrderId is required' },
        { status: 400 }
      )
    }

    // Create service client to bypass RLS
    const supabaseAdmin = createServiceClient()

    // Fetch original order to verify ownership
    const { data: originalOrder, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, user_id, status, order_number')
      .eq('id', originalOrderId)
      .single()

    if (orderError || !originalOrder) {
      console.error('[Reorder] Original order not found:', orderError)
      return NextResponse.json(
        { success: false, error: 'Original order not found' },
        { status: 404 }
      )
    }

    // Verify ownership (SECURE: server-side only dev mode)
    const isDevMode = process.env.NODE_ENV === 'development' &&
                      process.env.ENABLE_DEV_MOCK_AUTH === 'true'
    const DEV_MODE_PLACEHOLDER_USER_ID = '00000000-0000-0000-0000-000000000000'
    const userIdForDb = isDevMode ? DEV_MODE_PLACEHOLDER_USER_ID : user.id

    if (!isDevMode && originalOrder.user_id !== userIdForDb) {
      return NextResponse.json(
        { success: false, error: 'Access denied: This order does not belong to you' },
        { status: 403 }
      )
    }

    // Check if order can be reordered
    const normalizedStatus = originalOrder.status?.toUpperCase()
    if (!REORDERABLE_STATUSES.includes(normalizedStatus)) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot reorder order with status: ${originalOrder.status}`,
          currentStatus: originalOrder.status,
          reorderableStatuses: REORDERABLE_STATUSES,
        },
        { status: 400 }
      )
    }

    // Get original order details
    const orderDetailsResult = await getOrderDetails(originalOrderId)

    if (orderDetailsResult.error || !orderDetailsResult.data || orderDetailsResult.data.length === 0) {
      console.error('[Reorder] Failed to get order details:', orderDetailsResult.error)
      return NextResponse.json(
        { success: false, error: 'Failed to get original order details' },
        { status: 500 }
      )
    }

    // Create new order
    const newOrderResult = await duplicateOrder(originalOrderId)

    if (newOrderResult.error || !newOrderResult.data || newOrderResult.data.length === 0) {
      console.error('[Reorder] Failed to create new order:', newOrderResult.error)
      return NextResponse.json(
        { success: false, error: 'Failed to create new order', details: newOrderResult.error?.message },
        { status: 500 }
      )
    }

    const newOrderId = newOrderResult.data[0].id

    // Duplicate order items
    const itemsResult = await duplicateOrderItems(newOrderId, originalOrderId)

    if (itemsResult.error) {
      console.error('[Reorder] Failed to duplicate items:', itemsResult.error)
      // Rollback: delete the new order
      await supabaseAdmin.from('orders').delete().eq('id', newOrderId)
      return NextResponse.json(
        { success: false, error: 'Failed to duplicate order items', details: itemsResult.error.message },
        { status: 500 }
      )
    }

    // Recalculate order total
    const recalcResult = await recalculateOrderTotal(newOrderId)

    if (recalcResult.error) {
      console.error('[Reorder] Failed to recalculate total:', recalcResult.error)
      // Don't fail the reorder, just log the error
      console.warn('[Reorder] Order created but total recalculation failed')
    }

    // Fetch new order details
    const { data: newOrder, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('id, order_number, status, subtotal_amount, tax_amount, total_amount')
      .eq('id', newOrderId)
      .single()

    if (fetchError) {
      console.error('[Reorder] Failed to fetch new order:', fetchError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch new order details' },
        { status: 500 }
      )
    }

    // Log reorder
    console.log('[Reorder] Order reordered:', {
      originalOrderId,
      originalOrderNumber: originalOrder.order_number,
      newOrderId,
      newOrderNumber: newOrder.order_number,
      userId: userIdForDb,
      customerEmail: user.email,
    })

    return NextResponse.json({
      success: true,
      order: {
        id: newOrder.id,
        orderNumber: newOrder.order_number,
        status: newOrder.status,
        subtotal: newOrder.subtotal_amount,
        taxAmount: newOrder.tax_amount,
        totalAmount: newOrder.total_amount,
      },
      originalOrder: {
        id: originalOrder.id,
        orderNumber: originalOrder.order_number,
      },
      redirectUrl: `/member/orders/${newOrderId}`,
      message: '新しい注文を作成しました',
    }, { status: 201 })

  } catch (error: any) {
    console.error('[Reorder] POST error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
