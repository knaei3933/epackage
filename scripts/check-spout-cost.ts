import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSpoutCost() {
  const { data: quote } = await supabase
    .from('quotations')
    .select('id')
    .eq('quotation_number', 'QT20260331-6387')
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
    const breakdown = item.cost_breakdown as any;

    console.log('=== Spout Cost Check ===');
    console.log('spoutSize:', specs.spoutSize);
    console.log('spoutPosition:', specs.spoutPosition);
    console.log('quantity:', item.quantity);
    console.log('');

    console.log('=== Cost Breakdown ===');
    console.log('pouchProcessingCost:', breakdown?.pouchProcessingCost);
    console.log('totalCost:', breakdown?.totalCost);
    console.log('');

    // スパウト加工費計算（ドキュメント基準）
    // スパウト加工費(ウォン) = (スパウト単価 × 数量) + 往復配送料
    // 9パイ: 70ウォン, 往復配送料: 150,000ウォン
    const spoutPrice = 70; // 9パイ
    const quantity = item.quantity;
    const roundTripShipping = 150000;
    const spoutCost = spoutPrice * quantity + roundTripShipping;

    console.log('=== Expected Spout Cost ===');
    console.log('スパウト単価:', spoutPrice, 'ウォン');
    console.log('数量:', quantity);
    console.log('往復配送料:', roundTripShipping, 'ウォン');
    console.log('スパウト加工費:', spoutCost, 'ウォン');
    console.log('');
    console.log('単価:', item.unit_price, 'JPY');
    console.log('合計:', item.total_price, 'JPY');
  }
}

checkSpoutCost();
