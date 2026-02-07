/**
 * Check Order Data Script
 * 생성된 주문 데이터를 확인
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// .env.localを読み込む
config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkOrderData() {
  console.log('=================================');
  console.log('注文データ確認');
  console.log('=================================\n');

  // 전체 주문 수 확인
  const { data: allOrders, count, error } = await supabase
    .from('orders')
    .select('id, order_number, status, customer_name, created_at');

  if (error) {
    console.error('❌ エラー:', error);
    return;
  }

  console.log(`✅ 全注文数: ${count}`);

  if (!allOrders || allOrders.length === 0) {
    console.log('⚠️ 注文データが存在しません');
    return;
  }

  console.log('\n直近5件の注文:');
  allOrders.slice(0, 5).forEach(order => {
    console.log(`- ${order.order_number} (${order.status})`);
  });

  // TEST 주문 확인
  const { data: testOrders } = await supabase
    .from('orders')
    .select('*')
    .ilike('order_number', 'ORD-TEST%')
    .order('created_at', { ascending: false });

  console.log(`\n✅ TEST注文数: ${testOrders?.length || 0}`);

  if (testOrders && testOrders.length > 0) {
    testOrders.forEach(order => {
      console.log(`- ${order.order_number}`);
      console.log(`  ステータス: ${order.status}`);
      console.log(`  顧客: ${order.customer_name}`);
      console.log(`  金額: ¥${order.total_amount?.toLocaleString() || 'N/A'}`);
    });
  }

  console.log('\n=================================');
  console.log('完了');
  console.log('=================================');
}

checkOrderData()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('エラー:', error);
    process.exit(1);
  });
