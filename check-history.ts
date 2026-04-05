import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function main() {
  // 注文ステータス履歴を確認
  const { data: history, error } = await supabase
    .from('order_status_history')
    .select('*')
    .order('changed_at', { ascending: false })
    .limit(10);

  console.log('=== order_status_history ===');
  if (error) {
    console.log('Error:', error.message);
  } else {
    console.log('Total records:', history?.length || 0);
    if (history && history.length > 0) {
      console.log('Latest records:');
      history.forEach((h, i) => {
        console.log(`  ${i + 1}. order_id=${h.order_id}, status=${h.status}, changed_at=${h.changed_at}`);
      });
    }
  }

  // 注文数も確認
  const { data: orders } = await supabase
    .from('orders')
    .select('id, order_number, status');

  console.log('\n=== orders ===');
  console.log('Total orders:', orders?.length || 0);
}

main().catch(console.error);
