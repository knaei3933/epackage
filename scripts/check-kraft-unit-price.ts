import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { unifiedPricingEngine } from '../src/lib/unified-pricing-engine';

config({ path: '.env.local' });

const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
  console.log('=== KRAFT 단가 검증 (재계산 후) ===\n');

  // unifiedPricingEngine 테스트
  console.log('1. unifiedPricingEngine 계산 테스트:');
  const testResult = await unifiedPricingEngine.calculateQuote({
    bagTypeId: 'box',
    materialId: 'kraft_vmpet_lldpe',
    quantity: 2000,
    width: 200,
    height: 250,
    depth: 80,
    thicknessSelection: 'light',
    printingColors: 4,
    printingType: 'digital',
    doubleSided: false,
    postProcessingOptions: [],
    useFilmCostCalculation: true,
    markupRate: 0.5,
    lossRate: 0.4,
    filmLayers: [
      { materialId: 'KRAFT', thickness: 50 },
      { materialId: 'VMPET', thickness: 12 },
      { materialId: 'LLDPE', thickness: 50 }
    ]
  });

  const kraftLayer = testResult.filmCostDetails?.materialLayerDetails?.find(l => l.materialId === 'KRAFT');
  if (kraftLayer) {
    console.log('   KRAFT 단가:', kraftLayer.unitPriceKRW, '원');
    console.log('   KRAFT 중량:', kraftLayer.weightKg, 'kg');
    console.log('   KRAFT 비용:', Math.round(kraftLayer.costKRW).toLocaleString(), '원');
    console.log('   총 메터:', testResult.filmCostDetails?.totalMeters, 'm');
    console.log('   KRAFT density:', kraftLayer.density, 'kg/m³');

    if (kraftLayer.unitPriceKRW === 3000) {
      console.log('   ✓ KRAFT 단가 3000원 정확!');
    } else {
      console.log('   ⚠️ KRAFT 단가', kraftLayer.unitPriceKRW, '원 (3000원 아님)');
    }
  }

  // 데이터베이스 확인
  console.log('\n2. 데이터베이스 KRAFT 견적 확인:');
  const { data, error } = await client
    .from('quotation_items')
    .select('id, material_id, specifications')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('   DB Error:', error.message);
    return;
  }

  const kraftItems = data?.filter(item => {
    const matId = (item as any).material_id || '';
    return matId.toLowerCase().includes('kraft');
  });

  console.log('   KRAFT 재료 견적 수:', kraftItems?.length || 0);

  if (kraftItems && kraftItems.length > 0) {
    for (const item of kraftItems.slice(0, 5)) {
      const specs = item.specifications as any;
      const fcd = specs.film_cost_details;
      const kraft = fcd?.materialLayerDetails?.find((l: any) => l.materialId === 'KRAFT');
      console.log('\n   ID:', item.id?.substring(0, 8));
      console.log('   수량:', specs.quantity);
      console.log('   KRAFT 단가:', kraft?.unitPriceKRW || 'N/A', '원');
      console.log('   총 메터:', fcd?.totalMeters || 'N/A', 'm');
    }
  }

  console.log('\n=== 검증 완료 ===');
}

main().catch(console.error);
