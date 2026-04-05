import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { unifiedPricingEngine } from '../src/lib/unified-pricing-engine';

config({ path: '.env.local' });

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const { data: quotes } = await client
    .from('quotations')
    .select('id')
    .eq('quotation_number', 'QT20260331-8870')
    .single();

  if (!quotes) {
    console.log('Quote not found');
    return;
  }

  const { data: items } = await client
    .from('quotation_items')
    .select('id, specifications')
    .eq('quotation_id', quotes.id);

  if (!items || items.length === 0) {
    console.log('Items not found');
    return;
  }

  const item = items[0];
  const specs = item.specifications as any;

  console.log('=== QT20260331-8870 ===');
  console.log('');

  // Current state
  const currentBreakdown = specs.breakdown || {};
  if (currentBreakdown.baseCost && currentBreakdown.manufacturingMargin) {
    const currentRate = (currentBreakdown.manufacturingMargin / currentBreakdown.baseCost * 100).toFixed(1);
    console.log('현재 마진율:', currentRate + '%');
  }

  // Recalculate
  const params = {
    bagTypeId: specs.bagTypeId,
    materialId: specs.materialId,
    quantity: 5000,
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
    lossRate: specs.lossRate || 0.4,
    filmLayers: [
      { materialId: 'PET', thickness: 12 },
      { materialId: 'AL', thickness: 7 },
      { materialId: 'PET', thickness: 12 },
      { materialId: 'LLDPE', thickness: 70 }
    ]
  };

  const result = await unifiedPricingEngine.calculateQuote(params);

  console.log('');
  console.log('=== 새 계산 ===');
  console.log('기초 원가:', Math.round(result.breakdown.baseCost));
  console.log('제조사 마진:', Math.round(result.breakdown.manufacturingMargin));
  const newRate = (result.breakdown.manufacturingMargin / result.breakdown.baseCost * 100).toFixed(1);
  console.log('마진율:', newRate + '%');

  // Update
  const updatedSpecs = {
    ...specs,
    film_cost_details: result.filmCostDetails,
    breakdown: result.breakdown,
    filmLayers: params.filmLayers
  };

  const { error } = await client
    .from('quotation_items')
    .update({ specifications: updatedSpecs })
    .eq('id', item.id);

  if (error) {
    console.error('Update failed:', error.message);
  } else {
    console.log('');
    console.log('✅ 업데이트 완료! 페이지 새로고침(F5) 해주세요.');
  }
}

main().catch(console.error);
