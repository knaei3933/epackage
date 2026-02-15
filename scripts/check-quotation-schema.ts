/**
 * Check Quotation Schema Script
 * quotationsテーブルのスキーマを確認
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// .env.localを読み込む
config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkQuotationSchema() {
  console.log('=================================');
  console.log('Quotationsテーブルスキーマ確認');
  console.log('=================================\n');

  // 既存の見積データを1件取得
  const { data: quotation, error } = await supabase
    .from('quotations')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('❌ エラー:', error);
    return;
  }

  if (!quotation) {
    console.log('⚠️ 見積データが存在しません');
    return;
  }

  console.log('✅ 見積データのキー一覧:');
  console.log(Object.keys(quotation).join('\n'));

  console.log('\n=================================');
  console.log('サンプルデータ:');
  console.log(JSON.stringify(quotation, null, 2));
  console.log('=================================');
}

checkQuotationSchema()
  .then(() => {
    console.log('\n完了');
    process.exit(0);
  })
  .catch((error) => {
    console.error('エラー:', error);
    process.exit(1);
  });
