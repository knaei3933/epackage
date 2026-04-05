import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { unifiedPricingEngine } from '../src/lib/unified-pricing-engine';

config({ path: '.env.local' });

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testMatte() {
  // キャッシュをクリア
  unifiedPricingEngine.clearCache();

  // QT20260331-0629の仕様を取得
  const { data: quote } = await client
    .from('quotations')
    .select('id')
    .eq('quotation_number', 'QT20260331-0629')
    .single();

  const { data: item } = await client
    .from('quotation_items')
    .select('specifications, quantity')
    .eq('quotation_id', quote.id)
    .single();

  const specs = item.specifications as any;

  console.log('=== Testing QT20260331-0629 ===');
  console.log('Post Processing Options:', specs.postProcessingOptions);
  console.log('Has matte:', specs.postProcessingOptions?.includes('matte'));
  console.log('');

  // filmLayersを設定
  const filmLayers = specs.filmLayers || [
    { materialId: 'PET', thickness: 12 },
    { materialId: 'AL', thickness: 7 },
    { materialId: 'PET', thickness: 12 },
    { materialId: 'LLDPE', thickness: 80 }
  ];

  console.log('Using filmLayers:', filmLayers);
  console.log('');

  // 再計算
  const result = await unifiedPricingEngine.calculateQuote({
    bagTypeId: specs.bagTypeId,
    materialId: specs.materialId,
    quantity: specs.quantity || item.quantity || 5000,
    width: specs.width,
    height: specs.height,
    depth: specs.depth,
    thicknessSelection: specs.thicknessSelection || 'medium',
    printingColors: specs.printingColors || 1,
    printingType: specs.printingType || 'digital',
    doubleSided: specs.doubleSided || false,
    postProcessingOptions: specs.postProcessingOptions || [],
    useFilmCostCalculation: true,
    markupRate: 0.3,
    lossRate: 0.4,
    filmLayers: filmLayers
  });

  console.log('=== Result ===');
  console.log('Surface Treatment Cost:', result.breakdown.surfaceTreatmentCost);
  console.log('Printing Cost:', result.breakdown.printingCost);
  console.log('Total Cost:', result.breakdown.totalCost);

  if (result.filmCostDetails) {
    console.log('');
    console.log('Film Cost Details:');
    console.log('  Material Width:', result.filmCostDetails.materialWidthMM, 'mm');
    console.log('  Total Meters:', result.filmCostDetails.totalMeters);

    // 期待されるマット印刷追加費
    const widthM = (result.filmCostDetails.materialWidthMM || 0) / 1000;
    const meters = result.filmCostDetails.totalMeters || 0;
    const expectedMatteFeeKRW = widthM * meters * 40;
    const expectedMatteFeeJPY = Math.round(expectedMatteFeeKRW * 0.12);
    console.log('');
    console.log('Expected Matte Fee:');
    console.log('  ' + widthM + 'm x ' + meters + 'm x 40 = ₩' + expectedMatteFeeKRW.toLocaleString());
    console.log('  JPY: ¥' + expectedMatteFeeJPY.toLocaleString());
  }
}

testMatte().catch(console.error);
