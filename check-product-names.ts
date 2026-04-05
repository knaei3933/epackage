import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function main() {
  const orderId = '8e5b7283-a5b2-4e74-950d-344cb0abeaba';
  
  const { data: items } = await supabase
    .from('order_items')
    .select('id, product_name, quantity, unit_price')
    .eq('order_id', orderId);
    
  console.log('商品名確認:');
  if (items) {
    items.forEach((item, i) => {
      console.log(`  SKU ${i + 1}: ${item.product_name}`);
    });
  } else {
    console.log('  データなし');
  }
}

main().catch(console.error);
