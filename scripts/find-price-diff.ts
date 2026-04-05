import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function findPriceDiff() {
  const numbers = ['QT20260330-9899', 'QT20260331-3571'];

  for (const qn of numbers) {
    const { data: quote } = await client
      .from('quotations')
      .select('*')
      .eq('quotation_number', qn)
      .single();

    const { data: item } = await client
      .from('quotation_items')
      .select('*')
      .eq('quotation_id', quote.id)
      .single();

    console.log('=== ' + qn + ' ===');
    console.log('Created:', quote.created_at);
    console.log('Updated:', quote.updated_at);
    console.log('Total Amount:', quote.total_amount);
    console.log('Subtotal:', quote.subtotal);
    console.log('SKU Count:', quote.sku_count);
    console.log('');
    console.log('Item Unit Price:', item.unit_price);
    console.log('Item Total Price:', item.total_price);
    console.log('Cost Breakdown:', item.cost_breakdown ? 'YES' : 'NO');

    const specs = item.specifications as any;
    console.log('Specs breakdown:', specs.breakdown ? 'YES' : 'NO');

    // unit_priceとtotal_priceの比率を確認
    if (item.quantity && item.unit_price && item.total_price) {
      const calculated = item.unit_price * item.quantity;
      console.log('Unit x Qty:', calculated);
      console.log('Total Price:', item.total_price);
      console.log('Match:', calculated === item.total_price ? 'YES' : 'NO');
    }
    console.log('');
  }

  // 価格差の原因を分析
  console.log('=== Price Difference Analysis ===');
  const priceDiff = 305200 - 244200;
  const unitDiff = 55.48 - 44.4;
  console.log('Total Difference: ¥' + priceDiff.toLocaleString());
  console.log('Unit Difference: ¥' + unitDiff.toFixed(2));
  console.log('');
  console.log('Possible reasons:');
  console.log('1. Different margin rates (old 40% vs new 30%)');
  console.log('2. Different cost calculation method');
  console.log('3. Manual price adjustment');
  console.log('4. Created before/after pricing engine update');
}

findPriceDiff().catch(console.error);
