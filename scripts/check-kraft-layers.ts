import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const { data } = await client
    .from('quotation_items')
    .select('id, specifications')
    .order('created_at', { ascending: false })
    .limit(30);

  const kraftItem = data?.find(item => {
    const specs = item.specifications as any;
    return specs.materialId?.includes('kraft');
  });

  if (kraftItem) {
    const specs = kraftItem.specifications as any;
    console.log('=== KRAFT Quote Specs ===');
    console.log('ID:', kraftItem.id?.substring(0, 12));
    console.log('materialId:', specs.materialId);
    console.log('bagTypeId:', specs.bagTypeId);
    console.log('filmLayers:', JSON.stringify(specs.filmLayers || [], null, 2));
    console.log('');
    console.log('film_cost_details exists:', !!specs.film_cost_details);
    if (specs.film_cost_details) {
      console.log('materialLayerDetails exists:', !!specs.film_cost_details.materialLayerDetails);
      console.log('materialLayerDetails:', JSON.stringify(specs.film_cost_details.materialLayerDetails || [], null, 2).substring(0, 500));
    }
  }
}

main().catch(console.error);
