import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { unifiedPricingEngine } from '../src/lib/unified-pricing-engine';

config({ path: '.env.local' });

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function update0629() {
  console.log('=== Fixing QT20260331-0629 Matte Fee ===\n');

  // キャッシュをクリア
  unifiedPricingEngine.clearCache();
  console.log('✓ Cache cleared');

  // データ取得
  const { data: quote } = await client
    .from('quotations')
    .select('id')
    .eq('quotation_number', 'QT20260331-0629')
    .single();

  const { data: item } = await client
    .from('quotation_items')
    .select('*')
    .eq('quotation_id', quote.id)
    .single();

  const specs = item.specifications as any;

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

  // 再計算
  const result = await unifiedPricingEngine.calculateQuote({
    bagTypeId: specs.bagTypeId,
    materialId: specs.materialId,
    quantity: item.quantity,
    width: specs.width,
    height: specs.height,
    depth: specs.depth,
    thicknessSelection: specs.thicknessSelection,
    printingColors: specs.printingColors,
    printingType: specs.printingType,
    doubleSided: specs.doubleSided,
    postProcessingOptions: specs.postProcessingOptions,
    useFilmCostCalculation: true,
    markupRate: 0.3,
    lossRate: 0.4,
    filmLayers: filmLayers
  });

  // 期待されるマット印刷追加費
  if (result.filmCostDetails) {
    const widthM = (result.filmCostDetails.materialWidthMM || 0) / 1000;
    const meters = result.filmCostDetails.totalMeters || 0;
    const expectedMatteFeeKRW = widthM * meters * 20; // 修正後: 20ウォン/m
    const expectedMatteFeeJPY = Math.round(expectedMatteFeeKRW * 0.12);

    console.log('Expected Matte Fee:');
    console.log('  ' + widthM + 'm x ' + meters + 'm x 20 = ₩' + expectedMatteFeeKRW.toLocaleString());
    console.log('  JPY: ¥' + expectedMatteFeeJPY.toLocaleString());
  }

  console.log('');
  console.log('Calculated Surface Treatment Cost:', result.breakdown?.surfaceTreatmentCost || 'undefined');

  // 更新
  const updatedSpecs = {
    ...specs,
    film_cost_details: result.filmCostDetails,
    breakdown: result.breakdown,
    filmLayers: filmLayers
  };

  const { error } = await client
    .from('quotation_items')
    .update({
      specifications: updatedSpecs,
      cost_breakdown: result.breakdown
    })
    .eq('id', item.id);

  if (error) {
    console.error('Update failed:', error.message);
  } else {
    console.log('');
    console.log('✓ Updated successfully!');
    console.log('Please refresh the admin page (F5) to see changes.');
  }
}

update0629().catch(console.error);
