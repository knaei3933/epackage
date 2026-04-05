import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkSpoutSize() {
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
    .select('id, specifications')
    .eq('quotation_id', quote.id);

  if (items && items.length > 0) {
    const item = items[0];
    const specs = item.specifications as any;

    console.log('=== Spout Size Check ===');
    console.log('specs.spoutSize:', specs.spoutSize);
    console.log('specs.spoutSize type:', typeof specs.spoutSize);
    console.log('specs.spoutSize === 15:', specs.spoutSize === 15);
    console.log('specs.spoutSize === "15":', specs.spoutSize === '15');
    console.log('parseInt result:', parseInt(String(specs.spoutSize || ''), 10));
    console.log('');
    console.log('All specs keys:', Object.keys(specs));
  }
}

checkSpoutSize().catch(console.error);
