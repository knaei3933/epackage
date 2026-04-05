import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { unifiedPricingEngine } from '../src/lib/unified-pricing-engine';

config({ path: '.env.local' });

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function fix9899() {
  console.log('=== Fixing QT20260330-9899 ===\n');

  // キャッシュをクリア
  unifiedPricingEngine.clearCache();
  console.log('✓ Cache cleared');

  // QT20260330-9899を取得
  const { data: quote } = await client
    .from('quotations')
    .select('id')
    .eq('quotation_number', 'QT20260330-9899')
    .single();

  const { data: item } = await client
    .from('quotation_items')
    .select('*')
    .eq('quotation_id', quote.id)
    .single();

  const specs = item.specifications as any;

  console.log('Current Material Cost:', item.cost_breakdown?.materialCost || 0);
  console.log('');

  // 再計算
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
    lossRate: 0.4,
    filmLayers: specs.filmLayers
  };

  const result = await unifiedPricingEngine.calculateQuote(params);

  console.log('=== New Calculation ===');
  console.log('Material Cost:', Math.round(result.breakdown.materialCost));
  console.log('Base Cost:', Math.round(result.breakdown.baseCost));
  console.log('Manufacturing Margin (30%):', Math.round(result.breakdown.manufacturingMargin));
  console.log('Total Cost:', Math.round(result.breakdown.totalCost));
  console.log('');

  // 更新（total_priceは計算フィールドなので更新しない）
  const updatedSpecs = {
    ...specs,
    film_cost_details: result.filmCostDetails,
    breakdown: result.breakdown,
    filmLayers: params.filmLayers
  };

  const { error } = await client
    .from('quotation_items')
    .update({
      specifications: updatedSpecs,
      cost_breakdown: result.breakdown,
      unit_price: Math.round(result.breakdown.totalCost / 5000)
      // total_priceは更新しない（計算フィールド）
    })
    .eq('id', item.id);

  if (error) {
    console.error('Update failed:', error.message);
  } else {
    console.log('✓ Updated successfully!');
    console.log('Please refresh the admin page (F5) to see changes.');
  }
}

fix9899().catch(console.error);
