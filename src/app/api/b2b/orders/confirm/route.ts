/**
 * B2B Order Confirmation API
 *
 * B2B注文確定API
 * Handles order confirmation from quotation
 *
 * @route POST /api/b2b/orders/confirm
 */

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'

// ============================================================
// Validation Schema
// ============================================================

const confirmOrderSchema = z.object({
  quotationId: z.string().min(1, '見積IDは必須です'),
  paymentTerm: z.enum(['credit', 'advance'], {
    required_error: '支払い条件は必須です',
  }),
  shippingAddress: z.object({
    postalCode: z.string().min(1, '郵便番号は必須です'),
    prefecture: z.string().min(1, '都道府県は必須です'),
    city: z.string().min(1, '市区町村は必須です'),
    addressLine1: z.string().min(1, '住所は必須です'),
    addressLine2: z.string().default(''),
    company: z.string().min(1, '会社名は必須です'),
    contactName: z.string().min(1, '担当者名は必須です'),
    phone: z.string().min(10, '電話番号は必須です'),
  }),
  billingAddress: z.object({
    postalCode: z.string().min(1, '郵便番号は必須です'),
    prefecture: z.string().min(1, '都道府県は必須です'),
    city: z.string().min(1, '市区町村は必須です'),
    addressLine1: z.string().min(1, '住所は必須です'),
    addressLine2: z.string().default(''),
    company: z.string().min(1, '会社名は必須です'),
    contactName: z.string().min(1, '担当者名は必須です'),
    phone: z.string().min(10, '電話番号は必須です'),
  }),
  requestedDeliveryDate: z.string().min(1, '納期は必須です'),
  deliveryNotes: z.string().default(''),
})

type ConfirmOrderRequest = z.infer<typeof confirmOrderSchema>

// ============================================================
// Order Number Generator
// ============================================================

/**
 * Generate unique order number
 * Format: ORD-YYYYMMDD-XXXX
 */
function generateOrderNumber(): string {
  const now = new Date()
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `ORD-${dateStr}-${randomStr}`
}

// ============================================================
// POST Handler - Confirm Order
// ============================================================

export async function POST(request: NextRequest) {
  try {
    // Validate request body
    const body = await request.json()
    const validatedData = confirmOrderSchema.parse(body)

    // Next.js 16: cookies() now returns a Promise and must be awaited
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: '認証されていません。再度ログインしてください。' },
        { status: 401 }
      )
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, role, company_id')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'ユーザープロフィールが見つかりません' },
        { status: 404 }
      )
    }

    // Fetch quotation details
    const { data: quotation, error: quotationError } = await supabase
      .from('quotations')
      .select(
        `
        *,
        quotation_items (*)
      `
      )
      .eq('id', validatedData.quotationId)
      .eq('user_id', profile.id)
      .single()

    if (quotationError || !quotation) {
      return NextResponse.json(
        { error: '見積が見つかりません' },
        { status: 404 }
      )
    }

    // Check if quotation can be ordered
    if (quotation.status !== 'sent') {
      return NextResponse.json(
        {
          error: `この見積は現在注文できません（ステータス: ${quotation.status}）`,
        },
        { status: 400 }
      )
    }

    // Check if quotation is expired
    if (quotation.validUntil && new Date(quotation.validUntil) < new Date()) {
      return NextResponse.json(
        { error: '見積の有効期限が切れています' },
        { status: 400 }
      )
    }

    // Generate order number
    const orderNumber = generateOrderNumber()

    // Start a transaction by creating the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: profile.id,
        company_id: profile.company_id,
        quotation_id: quotation.id,
        status: 'PENDING',
        payment_term: validatedData.paymentTerm,
        subtotal: quotation.subtotal,
        tax_amount: quotation.tax_amount,
        total_amount: quotation.total_amount,
        shipping_address: validatedData.shippingAddress,
        billing_address: validatedData.billingAddress,
        requested_delivery_date: validatedData.requestedDeliveryDate,
        delivery_notes: validatedData.deliveryNotes,
        estimated_delivery_date: quotation.estimated_delivery_date,
      })
      .select()
      .single()

    if (orderError || !order) {
      console.error('Order creation error:', orderError)
      return NextResponse.json(
        { error: '注文の作成に失敗しました' },
        { status: 500 }
      )
    }

    // Copy quotation items to order items
    const orderItems = quotation.quotation_items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
      specifications: item.specifications,
      notes: item.notes,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      console.error('Order items creation error:', itemsError)
      // Rollback order creation
      await supabase.from('orders').delete().eq('id', order.id)
      return NextResponse.json(
        { error: '注文明細の作成に失敗しました' },
        { status: 500 }
      )
    }

    // Update quotation status to 'approved'
    const { error: updateError } = await supabase
      .from('quotations')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: profile.id,
      })
      .eq('id', quotation.id)

    if (updateError) {
      console.error('Quotation update error:', updateError)
      // Note: We don't rollback here as the order is already created
      // This could be handled with a proper database transaction
    }

    // Send confirmation emails (non-blocking)
    sendOrderConfirmationEmails(order, quotation, profile).catch((err) => {
      console.error('Email sending error:', err)
    })

    // Return success response
    return NextResponse.json(
      {
        success: true,
        order: {
          id: order.id,
          orderNumber: order.order_number,
          status: order.status,
          totalAmount: order.total_amount,
        },
        message: '注文を受け付けました',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Order confirmation error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'リクエストデータが無効です',
          details: error.errors,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: '注文の確定中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

// ============================================================
// Email Notifications
// ============================================================

/**
 * Send order confirmation emails to customer and admin
 */
async function sendOrderConfirmationEmails(
  order: any,
  quotation: any,
  profile: any
): Promise<void> {
  // This is a placeholder for email functionality
  // In production, integrate with your email service (e.g., SendGrid)

  const customerEmail = {
    to: profile.email,
    subject: `注文確認 - ${order.order_number}`,
    html: `
      <h2>注文ありがとうございます</h2>
      <p>注文番号: ${order.order_number}</p>
      <p>注文日時: ${new Date(order.created_at).toLocaleString('ja-JP')}</p>
      <p>合計金額: ¥${order.total_amount?.toLocaleString()}</p>
      <p>注文状況: ${order.status}</p>
      <p>詳細は会員ページよりご確認いただけます。</p>
    `,
  }

  const adminEmail = {
    to: process.env.ADMIN_EMAIL || 'admin@epackage-lab.com',
    subject: `新規注文 - ${order.order_number}`,
    html: `
      <h2>新規注文が入りました</h2>
      <p>注文番号: ${order.order_number}</p>
      <p>顧客: ${profile.company?.name || profile.email}</p>
      <p>合計金額: ¥${order.total_amount?.toLocaleString()}</p>
      <p>支払い条件: ${order.payment_term === 'credit' ? '掛け払い' : '前払い'}</p>
      <p>希望納期: ${new Date(order.requested_delivery_date).toLocaleDateString('ja-JP')}</p>
    `,
  }

  // TODO: Implement actual email sending with SendGrid or similar service
  console.log('Customer email:', customerEmail)
  console.log('Admin email:', adminEmail)
}

// ============================================================
// GET Handler - Get order confirmation status (optional)
// ============================================================

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const quotationId = searchParams.get('quotationId')

    if (!quotationId) {
      return NextResponse.json(
        { error: '見積IDは必須です' },
        { status: 400 }
      )
    }

    // Next.js 16: cookies() now returns a Promise and must be awaited
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: '認証されていません' },
        { status: 401 }
      )
    }

    // Check if quotation has been ordered
    const { data: order } = await supabase
      .from('orders')
      .select('id, order_number, status, created_at')
      .eq('quotation_id', quotationId)
      .single()

    if (!order) {
      return NextResponse.json(
        { canConfirm: true, message: '注文可能です' },
        { status: 200 }
      )
    }

    return NextResponse.json(
      {
        canConfirm: false,
        order: {
          id: order.id,
          orderNumber: order.order_number,
          status: order.status,
          createdAt: order.created_at,
        },
        message: 'この見積は既に注文されています',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Order status check error:', error)
    return NextResponse.json(
      { error: 'ステータスの取得に失敗しました' },
      { status: 500 }
    )
  }
}
