import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { unifiedPricingEngine } from '../src/lib/unified-pricing-engine';

config({ path: '.env.local' });

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const { data } = await client
    .from('quotation_items')
    .select('id, quantity, specifications')
    .order('created_at', { ascending: false })
    .limit(30);

  const kraftItem = data?.find(item => {
    const specs = item.specifications as any;
    return specs.materialId?.includes('kraft');
  });

  if (!kraftItem) {
    console.log('KRAFT item not found');
    return;
  }

  const specs = kraftItem.specifications as any;
  console.log('=== KRAFT 견적 재계산 ===');
  console.log('ID:', kraftItem.id?.substring(0, 12));
  console.log('Material:', specs.materialId);
  console.log('Quantity:', kraftItem.quantity);
  console.log('Size:', specs.width, 'x', specs.height, 'x', specs.depth, 'mm');
  console.log('');

  const params = {
    bagTypeId: specs.bagTypeId,
    materialId: specs.materialId,
    quantity: kraftItem.quantity,
    width: specs.width,
    height: specs.height,
    depth: specs.depth,
    thicknessSelection: specs.thicknessSelection || 'light',
    printingColors: specs.printingColors || 4,
    printingType: specs.printingType || 'digital',
    doubleSided: specs.doubleSided || false,
    postProcessingOptions: specs.postProcessingOptions || [],
    useFilmCostCalculation: true,
    markupRate: specs.markupRate || 0.5,
    lossRate: specs.lossRate || 0.4,
    filmLayers: specs.filmLayers || []
  };

  const result = await unifiedPricingEngine.calculateQuote(params);
  const filmCostDetails = result.filmCostDetails;

  if (filmCostDetails?.materialLayerDetails) {
    const kraft = filmCostDetails.materialLayerDetails.find((l: any) => l.materialId === 'KRAFT');
    console.log('=== 새로운 KRAFT 정보 ===');
    console.log('KRAFT 단가:', kraft?.unitPriceKRW, '원');
    console.log('KRAFT 중량:', kraft?.weightKg, 'kg');
    console.log('KRAFT 밀도:', kraft?.density, 'kg/m³');
    console.log('총 메터:', filmCostDetails.totalMeters, 'm');
    console.log('');

    // Update database
    const updatedSpecs = { ...specs, film_cost_details: filmCostDetails };
    const { error } = await client
      .from('quotation_items')
      .update({ specifications: updatedSpecs })
      .eq('id', kraftItem.id);

    if (error) {
      console.error('Update failed:', error.message);
    } else {
      console.log('✅ 업데이트 완료!');
    }
  }
}

main().catch(console.error);
