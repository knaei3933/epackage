import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkMatte() {
  const { data: quote } = await client
    .from('quotations')
    .select('id')
    .eq('quotation_number', 'QT20260331-0629')
    .single();

  const { data: item } = await client
    .from('quotation_items')
    .select('specifications, cost_breakdown')
    .eq('quotation_id', quote.id)
    .single();

  const specs = item.specifications as any;
  const bd = item.cost_breakdown;

  console.log('=== QT20260331-0629 ===');
  console.log('Size:', specs.width + 'x' + specs.height + 'x' + specs.depth);
  console.log('Material:', specs.materialId);
  console.log('Post Processing:', JSON.stringify(specs.postProcessingOptions));
  console.log('');

  if (specs.film_cost_details) {
    console.log('Film Cost Details:');
    console.log('  Total Meters:', specs.film_cost_details.totalMeters);
    console.log('  Material Width MM:', specs.film_cost_details.materialWidthMM);
    const widthM = (specs.film_cost_details.materialWidthMM || 0) / 1000;
    console.log('  Material Width M:', widthM);
    console.log('');

    // マット印刷追加費の計算
    const meters = specs.film_cost_details.totalMeters || 0;
    const matteFeeKRW = widthM * meters * 40;
    const matteFeeJPY = Math.round(matteFeeKRW * 0.12);

    console.log('Matte Printing Fee Calculation:');
    console.log('  Formula: ' + widthM + 'm x ' + meters + 'm x 40 = ₩' + matteFeeKRW.toLocaleString());
    console.log('  JPY: ¥' + matteFeeJPY.toLocaleString());
  }

  console.log('');
  console.log('Current Breakdown:');
  console.log('  Printing Cost:', bd.printingCost || 0);
  console.log('  Surface Treatment Cost:', bd.surfaceTreatmentCost || 0);
}

checkMatte().catch(console.error);
