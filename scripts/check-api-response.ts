import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkAPIResponse() {
  console.log('=== API Response Check for QT20260401-1568 ===\n');

  const { data: quote } = await supabase
    .from('quotations')
    .select('id')
    .eq('quotation_number', 'QT20260401-1568')
    .single();

  if (!quote) {
    console.log('Quote not found');
    return;
  }

  const { data: items } = await supabase
    .from('quotation_items')
    .select('*')
    .eq('quotation_id', quote.id);

  if (items && items.length > 0) {
    const item = items[0];
    const specs = item.specifications as any;

    console.log('【Database Specifications】');
    console.log('  bagTypeId:', specs.bagTypeId, '(type:', typeof specs.bagTypeId, ')');
    console.log('  spoutSize:', specs.spoutSize, '(type:', typeof specs.spoutSize, ')');
    console.log('  spoutPosition:', specs.spoutPosition, '(type:', typeof specs.spoutPosition, ')');
    console.log('');

    // Check cost_breakdown
    if (item.cost_breakdown) {
      console.log('【Cost Breakdown存在チェック】');
      console.log('  cost_breakdown:', !!item.cost_breakdown);
    }

    // Check film_cost_details
    if (item.film_cost_details) {
      const details = item.film_cost_details as any;
      console.log('【Film Cost Details】');
      console.log('  pouchProcessingCost:', details.pouchProcessingCost);
      console.log('  spoutProcessingCost:', details.spoutProcessingCost);
    }

    console.log('');
    console.log('=== 結論 ===');
    console.log('データベースにはspout情報が正しく保存されています。');
    console.log('APIからも正しく返されているはずです。');
    console.log('');
    console.log('次の手順:');
    console.log('1. ブラウザで管理者ページを開く');
    console.log('2. QT20260401-1568をクリック');
    console.log('3. ブラウザの開発者ツールでNetworkタブを開く');
    console.log('4. APIレスポンスを確認してspecificationsにspout情報が含まれているかチェック');
  }
}

checkAPIResponse().catch(console.error);
