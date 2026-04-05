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
    .select('cost_breakdown, specifications')
    .eq('quotation_id', quote.id)
    .single();

  const specs = item.specifications as any;
  const filmDetails = specs.film_cost_details;

  console.log('=== Updated Values ===');
  console.log('surfaceTreatmentCost:', item.cost_breakdown.surfaceTreatmentCost, 'JPY');
  console.log('printing:', item.cost_breakdown.printing, 'JPY');
  console.log('');
  console.log('=== film_cost_details.breakdown.printing ===');
  console.log(JSON.stringify(filmDetails?.breakdown?.printing, null, 2));
  console.log('');
  console.log('=== Expected Calculation (₩40/m) ===');
  const materialWidthM = (filmDetails?.materialWidthMM || 590) / 1000;
  const totalMeters = filmDetails?.totalMeters || 0;
  const expectedMatteKRW = materialWidthM * totalMeters * 40;
  const expectedMatteJPY = expectedMatteKRW * 0.12;
  console.log('Material Width:', materialWidthM, 'm');
  console.log('Total Meters:', totalMeters, 'm');
  console.log('Expected Matte Fee:', materialWidthM, 'm ×', totalMeters, 'm × ₩40/m = ₩' + expectedMatteKRW.toLocaleString());
  console.log('Expected JPY: ¥' + expectedMatteJPY.toLocaleString());
}

checkMatte().catch(console.error);
