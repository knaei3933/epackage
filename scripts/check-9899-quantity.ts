import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
  // quotationsテーブルからQT20260330-9899を探す
  const { data: quotes, error } = await client
    .from('quotations')
    .select('id, quotation_number')
    .ilike('quotation_number', '%9899%')
    .limit(1);

  if (error) {
    console.error('Error:', error);
    return;
  }

  if (!quotes || quotes.length === 0) {
    console.log('No quotation found');
    return;
  }

  const quote = quotes[0];
  console.log('Found quote:', quote.quotation_number, 'ID:', quote.id);

  // quotation_itemsを取得
  const { data: items, error: itemsError } = await client
    .from('quotation_items')
    .select('*')
    .eq('quotation_id', quote.id);

  if (itemsError) {
    console.error('Error:', itemsError);
    return;
  }

  console.log(`\nFound ${items?.length || 0} items:\n`);

  for (const item of items || []) {
    const specs = item.specifications as any;
    console.log('Item ID:', item.id);
    console.log('Quantity:', item.quantity);
    console.log('Bag Type:', specs.bagTypeId);
    console.log('Size:', specs.width, 'x', specs.height, 'x', specs.depth);
    console.log('Current totalMeters:', specs.film_cost_details?.totalMeters);
    console.log('Current materialWidthMM:', specs.film_cost_details?.materialWidthMM);
    console.log('');
  }
}

main().catch(console.error);
