import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function main() {
  const orderId = '8e5b7283-a5b2-4e74-950d-344cb0abeaba';
  
  const { data: history } = await supabase
    .from('order_status_history')
    .select('*')
    .eq('order_id', orderId);
    
  console.log('Records:', history?.length || 0);
  if (history && history.length > 0) {
    history.forEach((h, i) => {
      console.log(`  ${i + 1}. ${h.from_status} -> ${h.to_status}`);
    });
  }
}

main().catch(console.error);
