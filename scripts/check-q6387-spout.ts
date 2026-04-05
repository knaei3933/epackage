import { config } from 'dotenv';
config();
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSpoutData() {
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

    console.log('=== Quote Item Specs ===');
    console.log('bagTypeId:', specs.bagTypeId);
    console.log('spoutSize:', specs.spoutSize);
    console.log('spoutPosition:', specs.spoutPosition);
    console.log('hasGusset:', specs.hasGusset);
    console.log('');
    console.log('Full specs:', JSON.stringify(specs, null, 2));
  }
}

checkSpoutData();
