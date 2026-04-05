import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function main() {
  const { data: items } = await supabase
    .from('order_items')
    .select('*')
    .limit(1);
    
  console.log('columns:', items?.[0] ? Object.keys(items[0]) : 'no data');
  if (items?.[0]) {
    console.log('product_name:', items[0].product_name);
  }
}

main().catch(console.error);
