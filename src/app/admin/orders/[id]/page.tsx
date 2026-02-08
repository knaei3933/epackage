/**
 * Admin Order Detail Page (Server Component)
 *
 * 管理者注文詳細ページ - Server Component
 * - RBAC認証チェック
 * - サーバーサイドでデータを取得
 * - Client Componentでインタラクティブ操作
 */

import { redirect } from 'next/navigation';
import { requireAdminAuth } from '../../loader';
import AdminOrderDetailClient from './AdminOrderDetailClient';
import { createServiceClient } from '@/lib/supabase';

// ============================================================
// Types
// ============================================================

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  specifications?: any;
  category?: string;
}

interface Order {
  id: string;
  order_number: string;
  user_id: string;
  quotation_id?: string;
  status: string;
  total_amount: number;
  subtotal: number;
  tax_amount: number;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  delivery_address?: any;
  billing_address?: any;
  delivery_address_id?: string;
  billing_address_id?: string;
  requested_delivery_date?: string;
  estimated_delivery_date?: string;
  delivery_notes?: string;
  notes?: string;
  payment_term?: 'credit' | 'advance';
  created_at: string;
  updated_at: string;
  shipped_at?: string;
  delivered_at?: string;
  items?: OrderItem[];
  manual_discount_percentage?: number;
  manual_discount_amount?: number;
}

interface StatusHistory {
  id: string;
  from_status: string;
  to_status: string;
  changed_by: string;
  changed_at: string;
  reason?: string;
}

// ============================================================
// Server-Side Data Fetching
// ============================================================

async function OrderDetailContent({ params }: { params: Promise<{ id: string }> }) {
  // Next.js 15: params is a Promise, need to await it
  const { id: orderId } = await params;

  // RBAC認証チェック
  let authContext;
  try {
    authContext = await requireAdminAuth(['order:read']);
  } catch (error) {
    if (error instanceof Error && 'digest' in error) {
      throw error;
    }
    redirect('/auth/signin?redirect=/admin/orders');
  }

  // サーバーサイドで注文データを取得
  const supabaseService = createServiceClient();

  // 注文を取得 - UUIDか注文番号かを判定して適切に検索
  // UUID形式（xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx）かチェック
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId);

  const orderQuery = supabaseService
    .from('orders')
    .select('*');

  // UUIDの場合はidで、注文番号の場合はorder_numberで検索
  const { data: orderData, error: orderError } = await orderQuery
    .eq(isUuid ? 'id' : 'order_number', orderId)
    .maybeSingle();

  if (orderError) {
    console.error('[AdminOrderDetailPage] Order fetch error:', orderError);
  }

  // 配送先・請求先住所を取得 (delivery_address_id / billing_address_id가 있는 경우)
  let deliveryAddressData = null;
  let billingAddressData = null;

  if (orderData?.delivery_address_id) {
    const { data: deliveryAddr } = await supabaseService
      .from('delivery_addresses')
      .select('*')
      .eq('id', orderData.delivery_address_id)
      .maybeSingle();
    deliveryAddressData = deliveryAddr;
  }

  if (orderData?.billing_address_id) {
    const { data: billingAddr } = await supabaseService
      .from('billing_addresses')
      .select('*')
      .eq('id', orderData.billing_address_id)
      .maybeSingle();
    billingAddressData = billingAddr;
  }

  // アイテムを取得 - orderData.id（UUID）を使用
  let items: OrderItem[] = [];
  if (orderData) {
    const { data: itemsData, error: itemsError } = await supabaseService
      .from('order_items')
      .select('*')
      .eq('order_id', orderData.id);

    if (!itemsError && itemsData) {
      items = itemsData as OrderItem[];
    }
  }

  // ステータス履歴を取得 - orderData.id（UUID）を使用
  let statusHistory: StatusHistory[] = [];
  const { data: historyData, error: historyError } = await supabaseService
    .from('order_status_history')
    .select('*')
    .eq('order_id', orderData.id)
    .order('changed_at', { ascending: false });

  if (!historyError && historyData) {
    statusHistory = historyData as StatusHistory[];
  }

  // 管理者メモを取得（admin_order_notesテーブル） - orderData.id（UUID）を使用
  const { data: noteData, error: noteError } = await supabaseService
    .from('admin_order_notes')
    .select('notes')
    .eq('order_id', orderData.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const initialAdminNotes = noteData?.notes || '';

  // アイテムから小計と消費税を計算
  let calculatedSubtotal = 0;
  let calculatedTaxAmount = 0;

  if (orderData) {
    // items から小計を計算
    calculatedSubtotal = items.reduce((sum, item) => sum + (item.total_price || 0), 0);
    // 消費税10%
    calculatedTaxAmount = Math.round(calculatedSubtotal * 0.1);
  }

  // 注文データにアイテムと計算済みの金額、住所情報を追加
  // データベースの値がない（null/undefined/0）場合は計算値を使用
  const finalSubtotal = (orderData.subtotal === null || orderData.subtotal === undefined || orderData.subtotal === 0) ? calculatedSubtotal : orderData.subtotal;
  const finalTaxAmount = (orderData.tax_amount === null || orderData.tax_amount === undefined || orderData.tax_amount === 0) ? calculatedTaxAmount : orderData.tax_amount;

  const order: Order | null = orderData ? {
    ...orderData,
    delivery_address: deliveryAddressData || orderData.delivery_address,
    billing_address: billingAddressData || orderData.billing_address,
    subtotal: finalSubtotal,
    tax_amount: finalTaxAmount,
    items
  } as Order : null;

  console.log('[AdminOrderDetailPage] Order data:', order ? `${order.order_number} (${order.items?.length || 0} items)` : 'not found');

  // Pass data to client component
  return (
    <AdminOrderDetailClient
      orderId={orderId}
      initialOrder={order}
      initialStatusHistory={statusHistory}
      initialAdminNotes={initialAdminNotes}
    />
  );
}

// ============================================================
// Page Component
// ============================================================

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <OrderDetailContent params={params} />;
}

export const metadata = {
  title: '注文詳細 | Epackage Lab Admin',
  description: '注文詳細ページ',
};

export const dynamic = 'force-dynamic';
