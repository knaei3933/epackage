import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function main() {
  const orderId = '8e5b7283-a5b2-4e74-950d-344cb0abeaba';
  
  // 注文を確認
  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();
    
  console.log('=== Order ===');
  if (order) {
    console.log('ID:', order.id);
    console.log('Order Number:', order.order_number);
    console.log('Status:', order.status);
  } else {
    console.log('Order not found');
  }
  
  // 履歴を確認
  const { data: history } = await supabase
    .from('order_status_history')
    .select('*')
    .eq('order_id', orderId);
    
  console.log('\n=== History Records ===');
  console.log('Count:', history?.length || 0);
  if (history && history.length > 0) {
    console.log('Columns:', Object.keys(history[0]));
    console.log('First record:', JSON.stringify(history[0], null, 2));
  }
  
  // すべての履歴のカラム構造
  const { data: sample } = await supabase
    .from('order_status_history')
    .select('*')
    .limit(1);
    
  if (sample && sample.length > 0) {
    console.log('\n=== Table Columns ===');
    console.log('All columns:', Object.keys(sample[0]));
  }
}

main().catch(console.error);
