const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

(async () => {
  // 최신 견적 확인
  const { data: quotes } = await supabase
    .from('quotations')
    .select('id, quotation_number, status, total_amount')
    .eq('user_id', '3b67b1c5-5f88-40d8-998a-436f0f81fac0')
    .order('created_at', { ascending: false })
    .limit(5);

  console.log('=== 최신 견적 목록 ===');
  quotes.forEach(q => {
    console.log(`${q.quotation_number}: ${q.status} - ¥${q.total_amount?.toLocaleString() || 0}`);
  });

  // orders 테이블 구조 확인
  const { data: orders } = await supabase
    .from('orders')
    .select('id, order_number, status, total_amount, quotation_id')
    .order('created_at', { ascending: false })
    .limit(5);

  console.log('\n=== 최신 주문 목록 ===');
  if (!orders || orders.length === 0) {
    console.log('주문 없음');
  } else {
    orders.forEach(o => {
      console.log(`${o.order_number}: ${o.status} - ¥${o.total_amount?.toLocaleString() || 0} (견적ID: ${o.quotation_id})`);
    });
  }
})();
