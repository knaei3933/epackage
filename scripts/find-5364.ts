import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  console.log('=== Finding QT20260331-5364 ===');

  const { data } = await client
    .from('quotations')
    .select('id, quotation_number')
    .ilike('quotation_number', '%5364%');

  console.log('Found:', data?.length || 0);

  if (data && data.length > 0) {
    const q = data[0];
    console.log('Quote:', q.quotation_number);

    const { data: items } = await client
      .from('quotation_items')
      .select('id, quantity, specifications')
      .eq('quotation_id', q.id);

    if (items && items.length > 0) {
      const specs = items[0].specifications as any;
      console.log('Quantity:', items[0].quantity);
      console.log('Size:', specs.width, 'x', specs.height, 'x', specs.depth);
      console.log('Material:', specs.materialId);
      console.log('');
      console.log('filmLayers:', JSON.stringify(specs.filmLayers || []));
      console.log('');
      console.log('totalMeters:', specs.film_cost_details?.totalMeters);
      console.log('areaM2:', specs.film_cost_details?.areaM2);
    }
  }
}

main().catch(console.error);
