import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
  // quotation_itemsから直接最新のデータを取得
  const { data: items, error } = await client
    .from('quotation_items')
    .select('id, specifications, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error:', error.message);
    return;
  }

  console.log(`Found ${items?.length || 0} quotation items:\n`);

  for (const item of items || []) {
    const specs = item.specifications as any;
    const fcd = specs?.film_cost_details;

    console.log('========================================');
    console.log(`ID: ${item.id?.substring(0, 8)}...`);
    console.log(`Created: ${item.created_at}`);
    console.log(`Bag Type: ${specs?.bagTypeId || 'N/A'}`);
    console.log(`Material: ${specs?.materialId || 'N/A'}`);
    console.log(`Has film_cost_details: ${!!fcd}`);

    if (fcd) {
      console.log(`Total Meters: ${fcd.totalMeters || 'N/A'}`);
      console.log(`Material Layers: ${fcd.materialLayerDetails?.length || 0}`);

      if (fcd.materialLayerDetails && fcd.materialLayerDetails.length > 0) {
        const layer = fcd.materialLayerDetails[0];
        console.log('First layer:');
        console.log(`  - ${layer.nameJa} ${layer.thicknessMicron}μm`);
        console.log(`  - Weight: ${layer.weightKg}kg`);
        console.log(`  - Cost: ₩${layer.costKRW?.toLocaleString() || 'N/A'}`);
      }
    } else {
      console.log('⚠️  NO film_cost_details - needs recalculation');
    }
    console.log('');
  }
}

main().catch(console.error);
