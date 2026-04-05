import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkOrder() {
  const orderId = '8e5b7283-a5b2-4e74-950d-344cb0abeaba';

  // Get items
  const { data, error } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderId);

  if (error) {
    console.error('Error:', error.message);
    return;
  }

  console.log('Items count:', data?.length || 0);
  if (data && data.length > 0) {
    for (const item of data) {
      console.log('\n--- Item:', item.id);
      console.log('product_name:', item.product_name);
      console.log('has specifications:', !!item.specifications);
      if (item.specifications) {
        console.log('specifications:', JSON.stringify(item.specifications, null, 2));
      }
    }
  }
}

checkOrder().catch(console.error);
