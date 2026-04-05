import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function compareQuotes() {
  // QT20260330-9899
  const { data: q1 } = await client
    .from('quotations')
    .select('*')
    .eq('quotation_number', 'QT20260330-9899')
    .single();

  const { data: q1_items } = await client
    .from('quotation_items')
    .select('*')
    .eq('quotation_id', q1.id)
    .single();

  const s1 = q1_items.specifications as any;

  console.log('=== QT20260330-9899 ===');
  console.log('Final Price:', q1.final_price);
  console.log('Unit Price:', q1.unit_price);
  console.log('Status:', q1.status);
  console.log('Quantity:', q1_items.quantity);
  console.log('Breakdown Total Cost:', s1.breakdown?.totalCost);
  console.log('Base Cost:', s1.breakdown?.baseCost);
  console.log('');

  // QT20260331-3571
  const { data: q2 } = await client
    .from('quotation')
    .select('*')
    .eq('quotation_number', 'QT20260331-3571')
    .single();

  const { data: q2_items } = await client
    .from('quotation_items')
    .select('*')
    .eq('quotation_id', q2.id)
    .single();

  const s2 = q2_items.specifications as any;

  console.log('=== QT20260331-3571 ===');
  console.log('Final Price:', q2.final_price);
  console.log('Unit Price:', q2.unit_price);
  console.log('Status:', q2.status);
  console.log('Quantity:', q2_items.quantity);
  console.log('Breakdown Total Cost:', s2.breakdown?.totalCost);
  console.log('Base Cost:', s2.breakdown?.baseCost);
}

compareQuotes().catch(console.error);
