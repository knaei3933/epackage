import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

async function main() {
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data } = await client
    .from('quotation_items')
    .select('id, specifications')
    .order('created_at', { ascending: false })
    .limit(30);

  for (const item of data || []) {
    const specs = item.specifications as any;
    if (specs.materialId?.includes('kraft')) {
      const fcd = specs.film_cost_details;
      const kraft = fcd?.materialLayerDetails?.find((l: any) => l.materialId === 'KRAFT');
      console.log('KRAFT item found!');
      console.log('ID:', item.id?.substring(0, 8));
      console.log('KRAFT unitPrice:', kraft?.unitPriceKRW || 'N/A');
      console.log('KRAFT density:', kraft?.density || 'N/A');
      console.log('Total meters:', fcd?.totalMeters || 'N/A');
      break;
    }
  }
}

main().catch(e => console.error('Error:', e.message));
