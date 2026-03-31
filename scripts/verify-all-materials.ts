import { unifiedPricingEngine } from '../src/lib/unified-pricing-engine';

// 모든 재료의 density 값을 정의
const MATERIAL_DENSITIES = {
  'PET': 1.40,
  'AL': 2.71,
  'LLDPE': 0.92,
  'NY': 1.16,
  'VMPET': 1.40,
  'KRAFT': 0.9,
  'KP': 0.91,
  'PE': 0.92
};

async function verifyAllMaterials() {
  console.log('=== 모든 원단 비중값 검증 ===\n');

  console.log('시스템 정의된 Density 값:');
  for (const [material, density] of Object.entries(MATERIAL_DENSITIES)) {
    console.log(`- ${material.padEnd(8)}: ${density} kg/m³`);
  }

  console.log('\n========================================\n');

  // 다양한 재료 조합 테스트
  const testCases = [
    {
      name: 'PET/AL/LLDPE (standard)',
      params: {
        bagTypeId: 'stand_up',
        materialId: 'pet_al',
        quantity: 3000,
        width: 150,
        height: 200,
        depth: 50,
        thicknessSelection: 'standard',
        filmLayers: [
          { materialId: 'PET', thickness: 12 },
          { materialId: 'AL', thickness: 7 },
          { materialId: 'PET', thickness: 12 },
          { materialId: 'LLDPE', thickness: 80 }
        ]
      }
    },
    {
      name: 'KRAFT/VMPET/LLDPE',
      params: {
        bagTypeId: 'box',
        materialId: 'kraft_vmpet_lldpe',
        quantity: 2000,
        width: 200,
        height: 250,
        depth: 80,
        thicknessSelection: 'light',
        filmLayers: [
          { materialId: 'KRAFT', thickness: 50 },
          { materialId: 'VMPET', thickness: 12 },
          { materialId: 'LLDPE', thickness: 50 }
        ]
      }
    },
    {
      name: 'PET/PE (AL 없음)',
      params: {
        bagTypeId: 'spout_pouch',
        materialId: 'pet_pe',
        quantity: 1000,
        width: 100,
        height: 150,
        depth: 0,
        thicknessSelection: 'medium',
        filmLayers: [
          { materialId: 'PET', thickness: 12 },
          { materialId: 'PE', thickness: 80 }
        ]
      }
    },
    {
      name: 'NY/LLDPE',
      params: {
        bagTypeId: 'stand_up',
        materialId: 'ny_lldpe',
        quantity: 5000,
        width: 120,
        height: 180,
        depth: 40,
        thicknessSelection: 'standard',
        filmLayers: [
          { materialId: 'NY', thickness: 15 },
          { materialId: 'LLDPE', thickness: 70 }
        ]
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n========================================`);
    console.log(`테스트: ${testCase.name}`);
    console.log('========================================');

    const params = {
      ...testCase.params,
      printingColors: 4,
      printingType: 'digital',
      doubleSided: false,
      postProcessingOptions: [],
      useFilmCostCalculation: true,
      markupRate: 0.5,
      lossRate: 0.4
    };

    try {
      const result = await unifiedPricingEngine.calculateQuote(params);
      const fcd = result.filmCostDetails;

      if (fcd?.materialLayerDetails && fcd.materialLayerDetails.length > 0) {
        console.log(`\n${testCase.name} 검증 결과:`);

        for (const layer of fcd.materialLayerDetails) {
          const expectedDensity = MATERIAL_DENSITIES[layer.materialId] || 0;
          const expectedWeight = (layer.thicknessMicron / 1000000) * layer.widthM * layer.meters * expectedDensity * 1000;
          const diff = layer.weightKg - expectedWeight;
          const diffPercent = (diff / expectedWeight) * 100;

          console.log(`\n  ${layer.nameJa} ${layer.thicknessMicron}μm:`);
          console.log(`    - 시스템 저장 density: ${layer.density}`);
          console.log(`    - 기대 density: ${expectedDensity}`);
          console.log(`    - 저장된 중량: ${layer.weightKg}kg`);
          console.log(`    - 계산된 중량: ${expectedWeight.toFixed(4)}kg`);
          console.log(`    - 차이: ${diff.toFixed(4)}kg (${diffPercent.toFixed(4)}%)`);

          // density 불일치 확인
          if (Math.abs(layer.density - expectedDensity) > 0.01) {
            console.log(`    ⚠️  경고: density 불일치! (시스템: ${layer.density}, 기대: ${expectedDensity})`);
          }

          // 오차 확인
          if (Math.abs(diffPercent) > 0.01) {
            console.log(`    ⚠️  경고: 중량 오차 0.01% 초과!`);
          }
        }
      }

    } catch (error: any) {
      console.error(`❌ 오류: ${error.message}`);
    }
  }

  console.log('\n========================================');
  console.log('검증 완료');
  console.log('========================================');
}

verifyAllMaterials().catch(console.error);
