/**
 * Update Order API Route
 *
 * 注文更新API
 * - 数量変更
 * - 配送先変更
 * - 合計金額再計算
 * - Supabase MCPを使用したDB操作
 *
 * POST /api/orders/update
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseSSRClient } from '@/lib/supabase-ssr';
import { createServiceClient } from '@/lib/supabase'
import {
  getOrderStatus,
  updateOrderItemQuantity,
  updateOrderDeliveryAddress,
  recalculateOrderTotal,
} from '@/lib/supabase-mcp'

// ============================================================
// Types
// ============================================================

interface OrderItemUpdate {
  id: string
  quantity: number
}

interface DeliveryAddress {
  name: string
  postalCode: string
  prefecture: string
  city: string
  address: string
  building?: string
  phone: string
  contactPerson?: string
}

interface UpdateOrderRequest {
  orderId: string
  items?: OrderItemUpdate[]
  deliveryAddress?: DeliveryAddress
}

// ============================================================
// Constants
// ============================================================

const MODIFIABLE_STATUSES = [
  'PENDING',
  'QUOTATION',
  'DATA_RECEIVED',
]

// ============================================================
// POST: Update Order
// ============================================================

export async function POST(request: NextRequest) {
  try {
    // Next.js 16: cookies() now returns a Promise and must be awaited
    const cookieStore = await cookies()
    const { client: supabase } = await createSupabaseSSRClient($$$ARGS);
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse request body
    const body: UpdateOrderRequest = await request.json()
    const { orderId, items, deliveryAddress } = body

    // Validate required fields
    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'orderId is required' },
        { status: 400 }
      )
    }

    if (!items && !deliveryAddress) {
      return NextResponse.json(
        { success: false, error: 'At least one of items or deliveryAddress must be provided' },
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
      console.error('[Order Update] Order not found:', orderError)
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

    // Check if order can be modified
    const normalizedStatus = order.status?.toUpperCase()
    if (!MODIFIABLE_STATUSES.includes(normalizedStatus)) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot modify order with status: ${order.status}`,
          currentStatus: order.status,
          modifiableStatuses: MODIFIABLE_STATUSES,
        },
        { status: 400 }
      )
    }

    // Update order items if provided
    if (items && Array.isArray(items)) {
      for (const item of items) {
        const updateResult = await updateOrderItemQuantity(
          orderId,
          item.id,
          item.quantity
        )

        if (updateResult.error) {
          console.error('[Order Update] Failed to update item:', updateResult.error)
          return NextResponse.json(
            { success: false, error: 'Failed to update order item', details: updateResult.error.message },
            { status: 500 }
          )
        }
      }
    }

    // Update delivery address if provided
    if (deliveryAddress) {
      const addressResult = await updateOrderDeliveryAddress(
        orderId,
        deliveryAddress
      )

      if (addressResult.error) {
        console.error('[Order Update] Failed to update address:', addressResult.error)
        return NextResponse.json(
          { success: false, error: 'Failed to update delivery address', details: addressResult.error.message },
          { status: 500 }
        )
      }
    }

    // Recalculate order total
    const recalcResult = await recalculateOrderTotal(orderId)

    if (recalcResult.error) {
      console.error('[Order Update] Failed to recalculate total:', recalcResult.error)
      return NextResponse.json(
        { success: false, error: 'Failed to recalculate order total', details: recalcResult.error.message },
        { status: 500 }
      )
    }

    // Fetch updated order
    const { data: updatedOrder, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('id, order_number, status, subtotal_amount, tax_amount, total_amount')
      .eq('id', orderId)
      .single()

    if (fetchError) {
      console.error('[Order Update] Failed to fetch updated order:', fetchError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch updated order' },
        { status: 500 }
      )
    }

    // Log order update
    console.log('[Order Update] Order updated:', {
      orderId,
      orderNumber: order.order_number,
      userId: userIdForDb,
      customerEmail: user.email,
      itemsUpdated: items?.length || 0,
      addressUpdated: !!deliveryAddress,
    })

    return NextResponse.json({
      success: true,
      order: {
        id: updatedOrder.id,
        orderNumber: updatedOrder.order_number,
        status: updatedOrder.status,
        subtotal: updatedOrder.subtotal_amount,
        taxAmount: updatedOrder.tax_amount,
        totalAmount: updatedOrder.total_amount,
      },
      message: '注文を更新しました',
    })

  } catch (error: any) {
    console.error('[Order Update] POST error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
