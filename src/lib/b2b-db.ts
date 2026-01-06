/**
 * B2B Database Helper Functions
 *
 * B2Bデータベースヘルパー関数
 * Server-side database operations for B2B order system
 *
 * @server
 */

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Quotation, Order, QuotationItem, OrderItem, Database, Address } from '@/types/database'

// ============================================================
// Type Guards
// ============================================================

/**
 * Type guard for Address objects
 */
export function isAddress(value: unknown): value is Address {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const addr = value as Record<string, unknown>;
  return (
    typeof addr.postalCode === 'string' &&
    typeof addr.prefecture === 'string' &&
    typeof addr.city === 'string' &&
    typeof addr.addressLine1 === 'string' &&
    typeof addr.company === 'string' &&
    typeof addr.contactName === 'string' &&
    typeof addr.phone === 'string'
  );
}

// ============================================================
// Quotation Functions
// ============================================================

/**
 * Get quotation by ID with items
 */
export async function getQuotationById(
  id: string
): Promise<Quotation | null> {
  const supabase = createRouteHandlerClient({ cookies })

  const { data, error } = await supabase
    .from('quotations')
    .select(`
      *,
      quotation_items (*)
    `)
    .eq('id', id)
    .single()

  if (error || !data) {
    console.error('Error fetching quotation:', error)
    return null
  }

  // Transform database row to application type
  return {
    id: data.id,
    user_id: data.user_id,
    company_id: data.company_id,
    quotation_number: data.quotation_number,
    status: data.status,
    customer_name: data.customer_name,
    customer_email: data.customer_email,
    customer_phone: data.customer_phone,
    subtotal: data.subtotal_amount || 0,
    subtotal_amount: data.subtotal_amount || 0,
    tax_amount: data.tax_amount || 0,
    total_amount: data.total_amount || 0,
    valid_until: data.valid_until,
    notes: data.notes,
    pdf_url: data.pdf_url,
    admin_notes: data.admin_notes,
    sales_rep: data.sales_rep,
    estimated_delivery_date: data.estimated_delivery_date,
    created_at: data.created_at,
    updated_at: data.updated_at,
    sent_at: data.sent_at,
    approved_at: data.approved_at,
    rejected_at: data.rejected_at,
    items: (data.quotation_items || []) as QuotationItem[],
  }
}

/**
 * Get quotations for user with pagination
 */
export async function getQuotationsForUser(options: {
  userId: string
  status?: string
  page?: number
  limit?: number
}): Promise<{ quotations: Quotation[]; total: number }> {
  const { userId, status, page = 1, limit = 10 } = options
  const supabase = createRouteHandlerClient({ cookies })

  let query = supabase
    .from('quotations')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await query.range(from, to)

  if (error) {
    console.error('Error fetching quotations:', error)
    return { quotations: [], total: 0 }
  }

  return {
    quotations: (data || []) as Quotation[],
    total: count || 0,
  }
}

// ============================================================
// Order Functions
// ============================================================

/**
 * Get order by ID with items
 */
export async function getOrderById(id: string): Promise<Order | null> {
  const supabase = createRouteHandlerClient({ cookies })

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (*)
    `)
    .eq('id', id)
    .single()

  if (error || !data) {
    console.error('Error fetching order:', error)
    return null
  }

  // Transform database row to application type
  // Parse Json address fields
  const shippingAddress: Address | null = data.shipping_address
    ? data.shipping_address as unknown as Address
    : null;
  const billingAddress: Address | null = data.billing_address
    ? data.billing_address as unknown as Address
    : null;

  return {
    id: data.id,
    user_id: data.user_id,
    company_id: data.company_id,
    quotation_id: data.quotation_id,
    orderNumber: data.order_number,
    status: data.status,
    paymentTerm: data.payment_term || 'credit',
    subtotal: data.subtotal || 0,
    taxAmount: data.tax_amount || 0,
    totalAmount: data.total_amount || 0,
    shippingAddress,
    billingAddress,
    requestedDeliveryDate: data.requested_delivery_date,
    deliveryNotes: data.delivery_notes,
    estimatedDeliveryDate: data.estimated_delivery_date,
    items: (data.order_items || []) as OrderItem[],
    customer_name: data.customer_name,
    customer_email: data.customer_email,
    notes: data.notes,
    created_at: data.created_at,
    updated_at: data.updated_at,
    shipped_at: data.shipped_at,
    delivered_at: data.delivered_at,
  }
}

/**
 * Get orders for user with pagination
 */
export async function getOrdersForUser(options: {
  userId: string
  status?: string
  page?: number
  limit?: number
}): Promise<{ orders: Order[]; total: number }> {
  const { userId, status, page = 1, limit = 10 } = options
  const supabase = createRouteHandlerClient({ cookies })

  let query = supabase
    .from('orders')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await query.range(from, to)

  if (error) {
    console.error('Error fetching orders:', error)
    return { orders: [], total: 0 }
  }

  return {
    orders: (data || []) as Order[],
    total: count || 0,
  }
}

/**
 * Get orders by status (for admin/internal use)
 */
export async function getOrdersByStatus(options: {
  status: string
  page?: number
  limit?: number
}): Promise<{ orders: Order[]; total: number }> {
  const { status, page = 1, limit = 10 } = options
  const supabase = createRouteHandlerClient({ cookies })

  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await supabase
    .from('orders')
    .select('*', { count: 'exact' })
    .eq('status', status)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('Error fetching orders by status:', error)
    return { orders: [], total: 0 }
  }

  return {
    orders: (data || []) as Order[],
    total: count || 0,
  }
}

// ============================================================
// Utility Functions
// ============================================================

/**
 * Get quotation status label (Japanese)
 */
export function getQuotationStatusLabel(
  status: string
): string {
  const labels: Record<string, string> = {
    DRAFT: '作成中',
    SENT: '送信済',
    APPROVED: '承認済',
    REJECTED: '却下',
    EXPIRED: '期限切れ',
    CONVERTED: '注文変換済',
  }
  return labels[status] || status
}

/**
 * Get order status label (Japanese)
 */
export function getOrderStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: '登録待',
    QUOTATION: '見積',
    DATA_RECEIVED: 'データ入稿',
    WORK_ORDER: '作業標準書',
    CONTRACT_SENT: '契約書送付',
    CONTRACT_SIGNED: '契約署名完了',
    PRODUCTION: '製造中',
    STOCK_IN: '入庫完了',
    SHIPPED: '出荷完了',
    DELIVERED: '配送完了',
    CANCELLED: 'キャンセル',
  }
  return labels[status] || status
}

/**
 * Check if quotation can be converted to order
 */
export function canConvertQuotation(quotation: Quotation): boolean {
  return quotation.status === 'SENT' &&
    (!quotation.valid_until || new Date(quotation.valid_until) > new Date())
}

/**
 * Calculate quotation totals from items
 */
export function calculateQuotationTotals(items: QuotationItem[]): {
  subtotal: number
  tax: number
  total: number
} {
  const subtotal = items.reduce((sum, item) => sum + item.total_price, 0)
  const tax = Math.round(subtotal * 0.1) // 10% Japanese consumption tax
  const total = subtotal + tax

  return { subtotal, tax, total }
}
