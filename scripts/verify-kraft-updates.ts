import { unifiedPricingEngine } from '../src/lib/unified-pricing-engine';

async function verifyKraftUpdates() {
  console.log('=== KRAFT Density/LOSS 업데이트 검증 ===\n');

  // 업데이트 내용 확인
  console.log('1. KRAFT Density: 0.9 → 1.0 kg/m³');
  console.log('2. KRAFT 로스량: 400m → 700m');
  console.log('3. AL 로스량: 400m (변경 없음)');
  console.log('');

  // KRAFT 포함 재료 테스트
  const testCases = [
    {
      name: 'KRAFT/VMPET/LLDPE (AL 없음)',
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
      name: 'KRAFT/PET/LLDPE (AL 없음)',
      params: {
        bagTypeId: 'box',
        materialId: 'kraft_pet_lldpe',
        quantity: 1500,
        width: 180,
        height: 220,
        depth: 60,
        thicknessSelection: 'medium',
        filmLayers: [
          { materialId: 'KRAFT', thickness: 50 },
          { materialId: 'PET', thickness: 12 },
          { materialId: 'LLDPE', thickness: 70 }
        ]
      }
    },
    {
      name: 'PET/AL/LLDPE (비교용)',
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

      console.log(`\n계산 결과:`);
      console.log(`- 총 미터 수: ${fcd?.totalMeters}m`);
      console.log(`- 면적: ${fcd?.areaM2}m²`);
      console.log(`\n재료별 상세:`);

      if (fcd?.materialLayerDetails) {
        let totalWeight = 0;
        for (const layer of fcd.materialLayerDetails) {
          totalWeight += layer.weightKg;

          console.log(`\n  ${layer.nameJa} ${layer.thicknessMicron}μm:`);
          console.log(`    - 비중: ${layer.density} kg/m³`);
          console.log(`    - 중량: ${layer.weightKg}kg`);

          // KRAFT 재료 확인
          if (layer.materialId === 'KRAFT') {
            const expectedWeight = (layer.thicknessMicron / 1000000) * layer.widthM * layer.meters * 1.0 * 1000;
            const diff = layer.weightKg - expectedWeight;
            console.log(`    - 기대 중량 (density 1.0): ${expectedWeight.toFixed(4)}kg`);
            console.log(`    - 차이: ${diff.toFixed(4)}kg`);

            if (Math.abs(diff) > 0.01) {
              console.log(`    ⚠️  경고: 차이가 0.01kg를 초과합니다!`);
            } else {
              console.log(`    ✓ 정확함`);
            }
          }
        }

        console.log(`\n  총 중량: ${totalWeight.toFixed(2)}kg`);
      }

      // 로스량 확인
      if (testCase.params.filmLayers.some(l => l.materialId === 'KRAFT')) {
        console.log(`\nKRAFT 로스량 확인:`);
        console.log(`  - 적용된 로스: ${fcd?.totalMeters} - ${result.theoreticalMeters || '?'}m`);
        const expectedLoss = fcd?.totalMeters - (result.theoreticalMeters || 0);
        console.log(`  - 계산된 로스: ${expectedLoss}m`);
        console.log(`  - 기대 로스: 700m`);

        if (expectedLoss === 700) {
          console.log(`  ✓ 700m 로스 정확히 적용됨`);
        } else if (expectedLoss === 400) {
          console.log(`  ⚠️  400m 로스 (AL/KRAFT 구분 전)`);
        } else {
          console.log(`  ⚠️  로스량 다름: ${expectedLoss}m`);
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

verifyKraftUpdates().catch(console.error);
