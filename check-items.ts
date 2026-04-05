import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function main() {
  const orderId = '8e5b7283-a5b2-4e74-950d-344cb0abeaba';
  
  const { data: items, error } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderId);
    
  if (error) {
    console.log('Error:', error.message);
    return;
  }
  
  console.log('Total items:', items?.length || 0);
  if (items && items.length > 0) {
    console.log('\nKeys:', Object.keys(items[0]));
    console.log('\nSample:');
    const item = items[0];
    console.log('  product_name:', item.product_name);
    console.log('  quantity:', item.quantity);
    console.log('  unit_price:', item.unit_price);
    console.log('  total_price:', item.total_price);
    console.log('  has specifications:', !!item.specifications);
    if (item.specifications) {
      console.log('  spec keys:', Object.keys(item.specifications));
    }
  }
}

main().catch(console.error);
