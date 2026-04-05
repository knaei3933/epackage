import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testAPIResponse() {
  console.log('=== API Response Test ===\n');

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
    const specs = item.specifications;

    console.log('【specificationsの完全なJSON】');
    console.log(JSON.stringify(specs, null, 2));
    console.log('');
    console.log('【個別フィールド確認】');
    console.log('  spoutSize:', specs.spoutSize, typeof specs.spoutSize);
    console.log('  spoutPosition:', specs.spoutPosition);
  }
}

testAPIResponse().catch(console.error);
