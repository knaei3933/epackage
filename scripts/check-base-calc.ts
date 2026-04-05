import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkBaseCost() {
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

  const bd = item.cost_breakdown;
  const specs = item.specifications as any;
  const filmDetails = specs.film_cost_details;

  console.log('=== cost_breakdown (JPY) ===');
  console.log('materialCost:', bd.materialCost);
  console.log('printing:', bd.printing);
  console.log('laminationCost:', bd.laminationCost);
  console.log('slitterCost:', bd.slitterCost);
  console.log('pouchProcessingCost:', bd.pouchProcessingCost);
  console.log('surfaceTreatmentCost:', bd.surfaceTreatmentCost);
  console.log('baseCost:', bd.baseCost);
  console.log('');

  // JPY to KRW conversion
  const rate = 8.33;
  console.log('=== Converted to KRW ===');
  const materialKRW = Math.round(bd.materialCost * rate);
  const printingKRW = Math.round(bd.printing * rate);
  const laminationKRW = Math.round(bd.laminationCost * rate);
  const slitterKRW = Math.round(bd.slitterCost * rate);
  const pouchKRW = bd.pouchProcessingCost > 0 ? Math.round(bd.pouchProcessingCost / 0.12) : 0;
  const surfaceKRW = Math.round(bd.surfaceTreatmentCost * rate);

  console.log('materialCost:', materialKRW, 'KRW');
  console.log('printing:', printingKRW, 'KRW');
  console.log('laminationCost:', laminationKRW, 'KRW');
  console.log('slitterCost:', slitterKRW, 'KRW');
  console.log('pouchProcessingCost:', pouchKRW, 'KRW');
  console.log('surfaceTreatmentCost:', surfaceKRW, 'KRW');
  console.log('');

  const rawMaterialTotalKRW = filmDetails?.materialLayerDetails?.reduce((sum: number, m: any) => sum + m.costKRW, 0) || 0;
  const postProcessingKRW = laminationKRW + slitterKRW + pouchKRW + surfaceKRW;
  const baseCostKRW = rawMaterialTotalKRW + printingKRW + postProcessingKRW;

  console.log('=== Step Calculation ===');
  console.log('Step 1 (Raw Material):', rawMaterialTotalKRW, 'KRW');
  console.log('Step 2 (Printing):', printingKRW, 'KRW');
  console.log('Step 3 (Post-processing):', postProcessingKRW, 'KRW');
  console.log('  - Lamination:', laminationKRW, 'KRW');
  console.log('  - Slitter:', slitterKRW, 'KRW');
  console.log('  - Pouch:', pouchKRW, 'KRW');
  console.log('  - Surface Treatment:', surfaceKRW, 'KRW');
  console.log('');
  console.log('Base Cost (Step 1 + 2 + 3):', baseCostKRW, 'KRW');
  console.log('Expected baseCostKRW:', Math.round(bd.baseCost * rate), 'KRW');
}

checkBaseCost().catch(console.error);
