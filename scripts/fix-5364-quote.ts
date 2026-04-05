import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { unifiedPricingEngine } from '../src/lib/unified-pricing-engine';

config({ path: '.env.local' });

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  console.log('=== QT20260331-5364 재계산 ===\n');

  // Find the quote
  const { data: quotes } = await client
    .from('quotations')
    .select('id')
    .eq('quotation_number', 'QT20260331-5364')
    .single();

  if (!quotes) {
    console.log('Quote not found');
    return;
  }

  const { data: items } = await client
    .from('quotation_items')
    .select('id, quantity, specifications')
    .eq('quotation_id', quotes.id);

  if (!items || items.length === 0) {
    console.log('Items not found');
    return;
  }

  const item = items[0];
  const specs = item.specifications as any;

  console.log('수량:', item.quantity);
  console.log('사이즈:', specs.width, 'x', specs.height, 'x', specs.depth, 'mm');
  console.log('');

  // Recalculate
  const params = {
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
    markupRate: specs.markupRate,
    lossRate: specs.lossRate,
    filmLayers: [
      { materialId: 'PET', thickness: 12 },
      { materialId: 'AL', thickness: 7 },
      { materialId: 'PET', thickness: 12 },
      { materialId: 'LLDPE', thickness: 70 }
    ]
  };

  const result = await unifiedPricingEngine.calculateQuote(params);
  const filmCostDetails = result.filmCostDetails;

  console.log('=== 새로 계산된 중량 ===');
  if (filmCostDetails?.materialLayerDetails) {
    for (const layer of filmCostDetails.materialLayerDetails) {
      console.log(`${layer.nameJa} ${layer.thicknessMicron}μm: ${layer.weightKg}kg`);
    }
  }

  // Update database
  const updatedSpecs = { ...specs, film_cost_details: filmCostDetails };
  const { error } = await client
    .from('quotation_items')
    .update({ specifications: updatedSpecs })
    .eq('id', item.id);

  if (error) {
    console.error('\nUpdate failed:', error.message);
  } else {
    console.log('\n✅ 업데이트 완료!');
  }
}

main().catch(console.error);
