import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
  // quotationsテーブルからQT20260330-9899を探す
  const { data: quotes, error } = await client
    .from('quotations')
    .select('id, quotation_number')
    .ilike('quotation_number', '%QT20260330-9899%')
    .limit(1);

  if (error) {
    console.error('Error:', error);
    return;
  }

  if (!quotes || quotes.length === 0) {
    console.log('No quotation found');
    return;
  }

  const quote = quotes[0];
  console.log('Found quote:', quote.quotation_number, 'ID:', quote.id);

  // quotation_itemsを取得
  const { data: items, error: itemsError } = await client
    .from('quotation_items')
    .select('*')
    .eq('quotation_id', quote.id)
    .limit(1);

  if (itemsError) {
    console.error('Error:', itemsError);
    return;
  }

  if (!items || items.length === 0) {
    console.log('No items found');
    return;
  }

  const item = items[0];
  const specs = item.specifications as any;

  console.log('\n========================================');
  console.log('QT20260330-9899 Specifications:');
  console.log('========================================');
  console.log('Bag Type:', specs.bagTypeId);
  console.log('Size:', specs.width, 'x', specs.height, 'x', specs.depth, 'mm');
  console.log('Quantity:', item.quantity);
  console.log('Pitch:', specs.pitch);
  console.log('');
  console.log('Film Cost Details:');
  console.log('- totalMeters:', specs.film_cost_details?.totalMeters);
  console.log('- materialWidthMM:', specs.film_cost_details?.materialWidthMM);
  console.log('- areaM2:', specs.film_cost_details?.areaM2);
  console.log('');
  console.log('Material Layers:');
  const layers = specs.film_cost_details?.materialLayerDetails || [];
  for (let i = 0; i < layers.length; i++) {
    const l = layers[i];
    console.log(`  ${i + 1}. ${l.nameJa} ${l.thicknessMicron}μm`);
    console.log(`     - Weight: ${l.weightKg}kg`);
    console.log(`     - Cost: ₩${l.costKRW?.toLocaleString() || 'N/A'}`);
    console.log(`     - Area: ${l.areaM2}m²`);
    console.log(`     - Meters: ${l.meters}m`);
    console.log(`     - Width: ${l.widthM}m`);
  }
}

main().catch(console.error);
