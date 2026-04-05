import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { unifiedPricingEngine } from '../src/lib/unified-pricing-engine';

config({ path: '.env.local' });

async function main() {
  console.log('=== QT20260331-5364 계산 검증 ===\n');

  // Parameters from the quote
  const params = {
    bagTypeId: 'spout_pouch',
    materialId: 'pet_al',
    quantity: 5000,
    width: 130,
    height: 130,
    depth: 30,
    thicknessSelection: 'standard',
    printingColors: 1,
    printingType: 'digital',
    doubleSided: false,
    postProcessingOptions: [],
    useFilmCostCalculation: true,
    markupRate: 0.5,
    lossRate: 0.4,
    filmLayers: [
      { materialId: 'PET', thickness: 12 },
      { materialId: 'AL', thickness: 7 },
      { materialId: 'PET', thickness: 12 },
      { materialId: 'LLDPE', thickness: 70 }
    ]
  };

  const result = await unifiedPricingEngine.calculateQuote(params);
  const fcd = result.filmCostDetails;

  console.log('총 메터:', fcd?.totalMeters, 'm (기대: 1050m)');
  console.log('면적:', fcd?.areaM2, 'm²');
  console.log('필름 폭:', fcd?.materialWidthMM, 'mm');
  console.log('');

  if (fcd?.materialLayerDetails) {
    console.log('=== 시스템 계산 결과 ===');
    for (const layer of fcd.materialLayerDetails) {
      const expectedWeight = (layer.thicknessMicron / 1000000) * (layer.widthM) * layer.meters * layer.density * 1000;
      const diff = layer.weightKg - expectedWeight;
      const diffPercent = (diff / expectedWeight) * 100;

      console.log(`\n${layer.nameJa} ${layer.thicknessMicron}μm:`);
      console.log(`  시스템 중량: ${layer.weightKg}kg`);
      console.log(`  수동 계산: ${expectedWeight.toFixed(4)}kg`);
      console.log(`  차이: ${diff.toFixed(4)}kg (${diffPercent.toFixed(2)}%)`);
      console.log(`  비용: ${Math.round(layer.costKRW).toLocaleString()}원`);
    }
  }

  console.log('\n=== 사용자 계산과 비교 ===');
  console.log('PET 12μm (2개):');
  console.log('  사용자: 10.4076kg × 2 = 20.8152kg');
  console.log('  시스템: 각 10.26kg (오차 있음)');
  console.log('');
  console.log('AL 7μm:');
  console.log('  사용자: 11.7519kg');
  console.log('  시스템: 11.71kg (오차 있음)');
}

main().catch(console.error);
