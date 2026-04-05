import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { unifiedPricingEngine } from '../src/lib/unified-pricing-engine';

config({ path: '.env.local' });

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testMatte() {
  // QT20260331-0629の仕様を取得
  const { data: quote } = await client
    .from('quotations')
    .select('id')
    .eq('quotation_number', 'QT20260331-0629')
    .single();

  const { data: item } = await client
    .from('quotation_items')
    .select('specifications')
    .eq('quotation_id', quote.id)
    .single();

  const specs = item.specifications as any;

  console.log('=== Testing QT20260331-0629 ===');
  console.log('Post Processing Options:', specs.postProcessingOptions);
  console.log('Has matte:', specs.postProcessingOptions?.includes('matte'));
  console.log('');

  // filmLayersが未定義の場合はデフォルト値を使用
  const filmLayers = specs.filmLayers || [
    { materialId: 'PET', thickness: 12 },
    { materialId: 'AL', thickness: 7 },
    { materialId: 'PET', thickness: 12 },
    { materialId: 'LLDPE', thickness: 80 }
  ];

  // 再計算
  const result = await unifiedPricingEngine.calculateQuote({
    bagTypeId: specs.bagTypeId,
    materialId: specs.materialId,
    quantity: specs.quantity || item.quantity || 5000,
    width: specs.width,
    height: specs.height,
    depth: specs.depth,
    thicknessSelection: specs.thicknessSelection,
    printingColors: specs.printingColors || 1,
    printingType: specs.printingType || 'digital',
    doubleSided: specs.doubleSided || false,
    postProcessingOptions: specs.postProcessingOptions || [],
    useFilmCostCalculation: true,
    markupRate: 0.3,
    lossRate: 0.4,
    filmLayers: specs.filmLayers
  });

  console.log('=== Result ===');
  console.log('Surface Treatment Cost:', result.breakdown.surfaceTreatmentCost);
  console.log('Total Cost:', result.breakdown.totalCost);

  if (result.filmCostDetails) {
    console.log('Material Width:', result.filmCostDetails.materialWidthMM);
    console.log('Total Meters:', result.filmCostDetails.totalMeters);
  }
}

testMatte().catch(console.error);
