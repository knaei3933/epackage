/**
 * Check Order Schema Script
 * ordersテーブルのスキーマを確認
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// .env.localを読み込む
config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkOrderSchema() {
  console.log('=================================');
  console.log('Ordersテーブルスキーマ確認');
  console.log('=================================\n');

  // 既存の注文データを複数取得してステータス値を確認
  const { data: orders, error } = await supabase
    .from('orders')
    .select('status')
    .limit(10);

  if (error) {
    console.error('❌ エラー:', error);
    return;
  }

  if (!orders || orders.length === 0) {
    console.log('⚠️ 注文データが存在しません');
    return;
  }

  console.log('✅ 有効なステータス値:');
  const uniqueStatuses = [...new Set(orders.map(o => o.status))];
  uniqueStatuses.forEach(s => console.log(`  - ${s}`));

  // 最初の注文の詳細を取得
  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('❌ エラー:', error);
    return;
  }

  if (!order) {
    console.log('⚠️ 注文データが存在しません');
    return;
  }

  console.log('✅ 注文データのキー一覧:');
  console.log(Object.keys(order).join('\n'));

  console.log('\n=================================');
  console.log('サンプルデータ:');
  console.log(JSON.stringify(order, null, 2));
  console.log('=================================');
}

checkOrderSchema()
  .then(() => {
    console.log('\n完了');
    process.exit(0);
  })
  .catch((error) => {
    console.error('エラー:', error);
    process.exit(1);
  });
