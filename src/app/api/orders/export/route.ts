/**
 * Orders Export API Route
 *
 * 注文履歴PDF用の注文データ取得API
 * - 複数注文を一括取得（service client で .in クエリ）
 * - 所有権チェック付き（user_id で絞り込み・他ユーザーの注文は取得不可）
 * - execute_sql RPC の配列パラメータ問題を回避（フォローアップ1）
 *   従来の getOrdersForExport は ANY($1) + 配列を execute_sql の format/%L に渡し
 *   uuid[] キャスト不可で機能しなかった。service client の .in() で根本解決。
 *
 * POST /api/orders/export
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseSSRClient } from '@/lib/supabase-ssr'
import { createServiceClient } from '@/lib/supabase'
import { logger } from '@/lib/logger'

interface ExportRequest {
  orderIds: string[]
}

// supabaseAdmin は Database ジェネリックを持たないため select 戻り値が any になる。
// noImplicitAny 対策として取得列に対応する明示的な型を当てる。
interface FetchedOrder {
  id: string
  order_number: string | null
  created_at: string
  status: string | null
  total_amount: number | null
  tax_amount: number | null
  subtotal_amount: number | null
  customer_name: string | null
  delivery_address: unknown
}

interface FetchedItem {
  order_id: string
  product_name: string | null
  quantity: number | null
  unit_price: number | null
  total_price: number | null
}

export async function POST(request: NextRequest) {
  try {
    const { client: supabase } = await createSupabaseSSRClient(request)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body: ExportRequest = await request.json()
    const { orderIds } = body

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'orderIds is required and must be a non-empty array' },
        { status: 400 }
      )
    }

    // dev mode の user_id 扱いは cancel/update と同一（PLACEHOLDER）
    const isDevMode = process.env.NODE_ENV === 'development' &&
                      process.env.ENABLE_DEV_MOCK_AUTH === 'true'
    const DEV_MODE_PLACEHOLDER_USER_ID = '00000000-0000-0000-0000-000000000000'
    const userIdForDb = isDevMode ? DEV_MODE_PLACEHOLDER_USER_ID : user.id

    const supabaseAdmin = createServiceClient()

    // 注文取得（本人のもののみ・user_id で絞り込み＝所有権チェック）
    const { data: ordersData, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('id, order_number, created_at, status, total_amount, tax_amount, subtotal_amount, customer_name, delivery_address')
      .in('id', orderIds)
      .eq('user_id', userIdForDb)

    if (ordersError) {
      console.error('[Orders Export] Failed to fetch orders:', ordersError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch orders', details: ordersError.message },
        { status: 500 }
      )
    }

    const orders = (ordersData ?? []) as FetchedOrder[]

    if (orders.length === 0) {
      return NextResponse.json({
        success: true,
        orders: [],
      })
    }

    const fetchedOrderIds = orders.map((o) => o.id)

    // 注文アイテム取得
    const { data: itemsData, error: itemsError } = await supabaseAdmin
      .from('order_items')
      .select('order_id, product_name, quantity, unit_price, total_price')
      .in('order_id', fetchedOrderIds)

    if (itemsError) {
      console.error('[Orders Export] Failed to fetch order items:', itemsError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch order items', details: itemsError.message },
        { status: 500 }
      )
    }

    const items = (itemsData ?? []) as FetchedItem[]

    // 注文とアイテムを結合（subtotal_amount → subtotal にマッピング）
    const itemsByOrderId = new Map<string, FetchedItem[]>()
    for (const item of items) {
      const arr = itemsByOrderId.get(item.order_id) ?? []
      arr.push(item)
      itemsByOrderId.set(item.order_id, arr)
    }

    const result = orders
      .slice()
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map((o) => ({
        id: o.id,
        order_number: o.order_number,
        created_at: o.created_at,
        status: o.status,
        total_amount: o.total_amount,
        tax_amount: o.tax_amount,
        subtotal: o.subtotal_amount,
        customer_name: o.customer_name,
        delivery_address: o.delivery_address,
        items: (itemsByOrderId.get(o.id) ?? []).map((it) => ({
          product_name: it.product_name,
          quantity: it.quantity,
          unit_price: it.unit_price,
          total_price: it.total_price,
        })),
      }))

    logger.info('orders_export.success', {
      userId: userIdForDb,
      requestedCount: orderIds.length,
      returnedCount: result.length,
    })

    return NextResponse.json({
      success: true,
      orders: result,
    })

  } catch (error: unknown) {
    const errMsg = (error as { message?: string }).message
    console.error('[Orders Export] POST error:', error)
    return NextResponse.json(
      { success: false, error: errMsg || 'Internal server error' },
      { status: 500 }
    )
  }
}
