import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSpoutData() {
  // First get the quotation ID
  const { data: quote, error: quoteError } = await supabase
    .from('quotations')
    .select('id')
    .eq('quotation_number', 'QT20260401-1568')
    .single();

  if (quoteError || !quote) {
    console.error('Quote Error:', quoteError);
    return;
  }

  console.log('Quote ID:', quote.id);

  // Then get items
  const { data: items, error: itemsError } = await supabase
    .from('quotation_items')
    .select('*')
    .eq('quotation_id', quote.id);

  if (itemsError) {
    console.error('Items Error:', itemsError);
    return;
  }

  console.log('\n=== Items Found ===');
  console.log('Count:', items?.length || 0);

  if (items && items.length > 0) {
    const item = items[0];
    console.log('\n=== All Item Fields ===');
    console.log('Keys:', Object.keys(item));
    
    console.log('\n=== Item Specifications ===');
    console.log(JSON.stringify(item.specifications, null, 2));

    console.log('\n=== Cost Breakdown ===');
    console.log(JSON.stringify(item.cost_breakdown, null, 2));

    console.log('\n=== Spout Related Fields ===');
    const specs = item.specifications || {};
    console.log('specifications.spoutSize:', specs.spoutSize);
    console.log('specifications.spoutPosition:', specs.spoutPosition);
    console.log('specifications.bagTypeId:', specs.bagTypeId);
    console.log('specifications.bag_type:', specs.bag_type);
    console.log('specifications.spout:', specs.spout);
  }
}

checkSpoutData();
