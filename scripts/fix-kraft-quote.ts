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
  console.log('=== KRAFT 견적 재계산 (filmLayers 수정) ===');
  console.log('ID:', kraftItem.id?.substring(0, 12));
  console.log('Material:', specs.materialId);
  console.log('Quantity:', kraftItem.quantity);
  console.log('Size:', specs.width, 'x', specs.height, 'x', specs.depth, 'mm');
  console.log('');

  // KRAFT/VMPET/LLDPE 올바른 filmLayers 구조
  const correctFilmLayers = [
    { materialId: 'KRAFT', thickness: 50 },
    { materialId: 'VMPET', thickness: 12 },
    { materialId: 'LLDPE', thickness: 50 }
  ];

  console.log('Setting filmLayers:', correctFilmLayers);
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
    filmLayers: correctFilmLayers  // 올바른 filmLayers 사용
  };

  console.log('Calculating...');
  const result = await unifiedPricingEngine.calculateQuote(params);
  const filmCostDetails = result.filmCostDetails;

  console.log('');
  console.log('=== 계산 결과 ===');
  console.log('총 메터:', filmCostDetails?.totalMeters, 'm');

  if (filmCostDetails?.materialLayerDetails) {
    console.log('');
    console.log('재료별 상세:');
    for (const layer of filmCostDetails.materialLayerDetails) {
      console.log(`  ${layer.nameJa} ${layer.thicknessMicron}μm:`);
      console.log(`    단가: ${layer.unitPriceKRW}원/kg`);
      console.log(`    중량: ${layer.weightKg}kg`);
      console.log(`    비용: ${Math.round(layer.costKRW).toLocaleString()}원`);
    }

    const kraft = filmCostDetails.materialLayerDetails.find((l: any) => l.materialId === 'KRAFT');
    console.log('');
    console.log('=== KRAFT 확인 ===');
    console.log('단가:', kraft?.unitPriceKRW, '원/kg (기대: 3000원)');
    console.log('밀도:', kraft?.density, 'kg/m³ (기대: 1.0)');

    if (kraft?.unitPriceKRW === 3000 && kraft?.density === 1.0) {
      console.log('');
      console.log('✅ KRAFT 설정 정확!');
    }
  }

  // Update database
  console.log('');
  console.log('데이터베이스 업데이트 중...');
  const updatedSpecs = {
    ...specs,
    film_cost_details: filmCostDetails,
    filmLayers: correctFilmLayers  // filmLayers도 함께 저장
  };

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

main().catch(console.error);
