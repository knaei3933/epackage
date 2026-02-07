/**
 * Update Order Addresses Script
 *
 * 既存の注文データに納品先・請求先IDを設定するスクリプト
 *
 * 使い方:
 * npx tsx scripts/update-order-addresses.ts <order_id>
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// .env.localファイルを読み込み
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Not set');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Set' : 'Not set');
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateOrderAddresses(orderId: string) {
  console.log(`[Update Order Addresses] Processing order: ${orderId}`);

  // 1. 注文を取得
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    console.error('[Update Order Addresses] Order not found:', orderError);
    return;
  }

  console.log('[Update Order Addresses] Order found:', {
    orderNumber: order.order_number,
    userId: order.user_id,
    currentDeliveryId: order.delivery_address_id,
    currentBillingId: order.billing_address_id,
  });

  // 既に住所IDが設定されている場合はスキップ
  if (order.delivery_address_id && order.billing_address_id) {
    console.log('[Update Order Addresses] Address IDs already set, skipping');
    return;
  }

  // 2. ユーザーのデフォルト住所を取得
  const { data: defaultDelivery } = await supabase
    .from('delivery_addresses')
    .select('id')
    .eq('user_id', order.user_id)
    .eq('is_default', true)
    .maybeSingle();

  const { data: defaultBilling } = await supabase
    .from('billing_addresses')
    .select('id')
    .eq('user_id', order.user_id)
    .eq('is_default', true)
    .maybeSingle();

  console.log('[Update Order Addresses] Default addresses:', {
    deliveryAddressId: defaultDelivery?.id,
    billingAddressId: defaultBilling?.id,
  });

  // 3. 注文を更新
  const updateData: any = {};
  if (!order.delivery_address_id && defaultDelivery?.id) {
    updateData.delivery_address_id = defaultDelivery.id;
  }
  if (!order.billing_address_id && defaultBilling?.id) {
    updateData.billing_address_id = defaultBilling.id;
  }

  if (Object.keys(updateData).length === 0) {
    console.log('[Update Order Addresses] No updates needed');
    return;
  }

  const { data: updatedOrder, error: updateError } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', orderId)
    .select()
    .single();

  if (updateError) {
    console.error('[Update Order Addresses] Update failed:', updateError);
    return;
  }

  console.log('[Update Order Addresses] Order updated successfully:', {
    orderId: updatedOrder.id,
    delivery_address_id: updatedOrder.delivery_address_id,
    billing_address_id: updatedOrder.billing_address_id,
  });
}

// メイン処理
const orderId = process.argv[2];

if (!orderId) {
  console.error('Usage: npx tsx scripts/update-order-addresses.ts <order_id>');
  process.exit(1);
}

updateOrderAddresses(orderId)
  .then(() => {
    console.log('[Update Order Addresses] Done');
    process.exit(0);
  })
  .catch((error) => {
    console.error('[Update Order Addresses] Error:', error);
    process.exit(1);
  });
