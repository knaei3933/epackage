import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkSpecs() {
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
    .select('id, specifications, quantity')
    .eq('quotation_id', quote.id);

  if (items && items.length > 0) {
    const item = items[0];
    const specs = item.specifications as any;

    console.log('=== Specs Check ===');
    console.log('specs keys:', Object.keys(specs));
    console.log('specs.spoutSize:', specs.spoutSize);
    console.log('specs.spoutSize type:', typeof specs.spoutSize);
    console.log('specs.spoutSize === undefined:', specs.spoutSize === undefined);
    console.log('specs.spoutSize === null:', specs.spoutSize === null);
    console.log('');

    // Test conversion
    if (specs.spoutSize !== undefined) {
      const num = Number(specs.spoutSize);
      const parsed = parseInt(String(specs.spoutSize), 10);
      console.log('Number(specs.spoutSize):', num);
      console.log('parseInt(String(specs.spoutSize), 10):', parsed);
      console.log('num === 15:', num === 15);
      console.log('parsed === 15:', parsed === 15);
    }
  }
}

checkSpecs().catch(console.error);
