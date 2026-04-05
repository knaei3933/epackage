import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  // quotation_itemsからIDで取得（前に見つかったID）
  const { data: item1 } = await client
    .from('quotation_items')
    .select('*')
    .eq('id', '0198dbbf-7e8f-78d1-8290-c8d5bfe7b8f0')
    .single();

  if (item1) {
    const specs = item1.specifications as any;
    console.log('=== Item by ID ===');
    console.log('Item ID:', item1.id);
    console.log('Quotation ID:', item1.quotation_id);
    console.log('Quantity:', item1.quantity);
    console.log('');

    // 親のquotationを取得
    const { data: quote1 } = await client
      .from('quotations')
      .select('*')
      .eq('id', item1.quotation_id)
      .single();

    if (quote1) {
      console.log('Quotation Number:', quote1.quotation_number);
      console.log('Status:', quote1.status);
      console.log('Final Price:', quote1.final_price);
      console.log('Unit Price:', quote1.unit_price);
      console.log('');
      console.log('Breakdown:');
      console.log('  Base Cost:', specs.breakdown?.baseCost);
      console.log('  Total Cost:', specs.breakdown?.totalCost);
    }
  } else {
    console.log('Item not found');
  }

  // 最近のquotationsを確認
  const { data: recent } = await client
    .from('quotation_items')
    .select('id, quotation_id, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  console.log('\n=== Recent Items ===');
  for (const item of recent || []) {
    console.log(item.id + ' -> ' + item.quotation_id);
  }
}

main().catch(console.error);
