import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkKraftWeight() {
  const { data: quote } = await client
    .from('quotations')
    .select('id')
    .eq('quotation_number', 'QT20260331-5931')
    .single();

  const { data: item } = await client
    .from('quotation_items')
    .select('specifications')
    .eq('quotation_id', quote.id)
    .single();

  const specs = item.specifications as any;
  const filmDetails = specs.film_cost_details;

  console.log('=== QT20260331-5931 ===');
  console.log('Bag Type:', specs.bagTypeId);
  console.log('Size:', specs.width + 'x' + specs.height + 'x' + specs.depth);
  console.log('Quantity:', item.quantity);
  console.log('');

  if (filmDetails?.materialLayerDetails) {
    console.log('=== Material Layer Details ===');
    for (const layer of filmDetails.materialLayerDetails) {
      console.log(layer.nameJa + ' (' + layer.materialId + '):');
      console.log('  grammage:', layer.grammage, 'g/m²');
      console.log('  weightKg:', layer.weightKg, 'kg');
      console.log('  unitPriceKRW:', layer.unitPriceKRW, 'KRW/kg');
      console.log('  costKRW:', layer.costKRW, 'KRW');
      console.log('  costJPY:', layer.costJPY, 'JPY');
      console.log('');

      // クラフト紙の場合、価格計算用の重量（比重1.0）を計算
      if (layer.materialId === 'KRAFT') {
        const grammage = layer.grammage || 80;
        const widthM = layer.widthM;
        const meters = layer.meters;
        const priceWeight = (grammage / 1000) * widthM * meters;
        const actualWeight = layer.weightKg;
        const density = actualWeight / priceWeight; // 実際の密度

        console.log('=== Kraft Paper Calculation ===');
        console.log('Price calculation weight (density 1.0):', priceWeight.toFixed(2), 'kg');
        console.log('Actual weight (density-based):', actualWeight.toFixed(2), 'kg');
        console.log('Actual density:', density.toFixed(3));
        console.log('Expected price: ₩' + (priceWeight * 3000).toLocaleString());
        console.log('Current price: ₩' + layer.costKRW.toLocaleString());
      }
    }
  }
}

checkKraftWeight().catch(console.error);
