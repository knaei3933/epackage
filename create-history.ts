import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function main() {
  // 履歴がない注文を取得
  const { data: orders, error } = await supabase
    .from('orders')
    .select('id, order_number, status, created_at')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error:', error.message);
    return;
  }
  
  console.log('Found orders:', orders?.length || 0);
  
  let created = 0;
  let skipped = 0;
  
  for (const order of orders || []) {
    // 既に履歴があるか確認
    const { data: existing } = await supabase
      .from('order_status_history')
      .select('id')
      .eq('order_id', order.id)
      .limit(1);
      
    if (existing && existing.length > 0) {
      skipped++;
      continue;
    }
    
    // 初期履歴を作成
    const { error: insertError } = await supabase
      .from('order_status_history')
      .insert({
        order_id: order.id,
        from_status: '-',  // 初期ステータス
        to_status: order.status,
        changed_by: 'system',
        changed_at: order.created_at,
        reason: 'Initial status - backfilled',
      });
      
    if (insertError) {
      console.error('Failed for', order.order_number, ':', insertError.message);
    } else {
      created++;
      console.log('Created history for', order.order_number, 'status:', order.status);
    }
  }
  
  console.log('\n=== Summary ===');
  console.log('Created:', created);
  console.log('Skipped (already has history):', skipped);
}

main().catch(console.error);
