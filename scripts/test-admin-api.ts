import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testAdminAPI() {
  console.log('=== Admin API Response Test ===\n');

  // Get quotation ID
  const { data: quote } = await supabase
    .from('quotations')
    .select('id')
    .eq('quotation_number', 'QT20260401-1568')
    .single();

  if (!quote) {
    console.log('Quote not found');
    return;
  }

  // Get quotation items with all fields
  const { data: items } = await supabase
    .from('quotation_items')
    .select('*')
    .eq('quotation_id', quote.id);

  if (items && items.length > 0) {
    const item = items[0];

    console.log('【API Response Simulation】');
    console.log('');
    console.log('item.specifications (DBから直接取得):');
    console.log(JSON.stringify(item.specifications, null, 2));
    console.log('');

    // Simulate AdminQuotationsClient specs logic
    const breakdown = item.breakdown;
    const specsOld = breakdown?.specifications || item.specifications || {};
    const specsNew = item.specifications || breakdown?.specifications || {};

    console.log('【Old Logic (breakdown優先)】');
    console.log('  specs.bagTypeId:', specsOld.bagTypeId);
    console.log('  specs.spoutSize:', specsOld.spoutSize);
    console.log('  specs.spoutPosition:', specsOld.spoutPosition);
    console.log('  スパウト表示されるか:', !!(specsOld.bagTypeId === 'spout_pouch' || specsOld.spoutSize || specsOld.spoutPosition));
    console.log('');

    console.log('【New Logic (item.specifications優先)】');
    console.log('  specs.bagTypeId:', specsNew.bagTypeId);
    console.log('  specs.spoutSize:', specsNew.spoutSize);
    console.log('  specs.spoutPosition:', specsNew.spoutPosition);
    console.log('  スパウト表示されるか:', !!(specsNew.bagTypeId === 'spout_pouch' || specsNew.spoutSize || specsNew.spoutPosition));
    console.log('');

    console.log('【結論】');
    if (specsNew.bagTypeId === 'spout_pouch' && specsNew.spoutSize && specsNew.spoutPosition) {
      console.log('✓ 修正後のコードで正しく表示されます');
      console.log('');
      console.log('期待される表示:');
      console.log('  - スパウト仕様 (見出し)');
      console.log('  - スパウトサイズ: ' + specsNew.spoutSize + 'mm');
      console.log('  - スパウト位置: ' + (specsNew.spoutPosition === 'top-center' ? '上部中央' : specsNew.spoutPosition));
    } else {
      console.log('✗ データが不足しています');
    }
  }
}

testAdminAPI().catch(console.error);
