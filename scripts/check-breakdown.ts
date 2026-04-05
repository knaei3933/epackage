import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkBreakdown() {
  const { data: quote } = await client
    .from('quotations')
    .select('id')
    .eq('quotation_number', 'QT20260331-0629')
    .single();

  const { data: item } = await client
    .from('quotation_items')
    .select('cost_breakdown, specifications')
    .eq('quotation_id', quote.id)
    .single();

  console.log('=== cost_breakdown ===');
  console.log(JSON.stringify(item.cost_breakdown, null, 2));
  console.log('');
  console.log('=== specifications.film_cost_details ===');
  console.log(JSON.stringify((item.specifications as any).film_cost_details, null, 2));
}

checkBreakdown().catch(console.error);
