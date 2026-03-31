import { unifiedPricingEngine } from '../src/lib/unified-pricing-engine';

// 테스트 케이스 정의
const testCases = [
  {
    name: '스파우트 파우치 (PET/AL/LLDPE)',
    params: {
      bagTypeId: 'spout_pouch',
      materialId: 'pet_al',
      quantity: 5000,
      width: 130,
      height: 130,
      depth: 30,
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
    name: '스탠드 파우치 (PET/AL/LLDPE)',
    params: {
      bagTypeId: 'stand_up',
      materialId: 'pet_al',
      quantity: 3000,
      width: 150,
      height: 200,
      depth: 50,
      thicknessSelection: 'medium',
      filmLayers: [
        { materialId: 'PET', thickness: 12 },
        { materialId: 'AL', thickness: 7 },
        { materialId: 'LLDPE', thickness: 70 }
      ]
    }
  },
  {
    name: '박스 (KRAFT/VMPET/LLDPE)',
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
    name: '스파우트 파우치 (PET/PE - 알루미늄 없음)',
    params: {
      bagTypeId: 'spout_pouch',
      materialId: 'pet_pe',
      quantity: 1000,
      width: 100,
      height: 150,
      depth: 0,
      thicknessSelection: 'standard',
      filmLayers: [
        { materialId: 'PET', thickness: 12 },
        { materialId: 'PE', thickness: 80 }
      ]
    }
  },
  {
    name: '대량 스탠드 파우치 (10000개)',
    params: {
      bagTypeId: 'stand_up',
      materialId: 'pet_al',
      quantity: 10000,
      width: 180,
      height: 220,
      depth: 60,
      thicknessSelection: 'heavy',
      filmLayers: [
        { materialId: 'PET', thickness: 12 },
        { materialId: 'AL', thickness: 7 },
        { materialId: 'PET', thickness: 12 },
        { materialId: 'LLDPE', thickness: 100 }
      ]
    }
  },
  {
    name: '소량 박스 (500개)',
    params: {
      bagTypeId: 'box',
      materialId: 'kraft_vmpet_lldpe',
      quantity: 500,
      width: 120,
      height: 180,
      depth: 40,
      thicknessSelection: 'medium',
      filmLayers: [
        { materialId: 'KRAFT', thickness: 50 },
        { materialId: 'VMPET', thickness: 12 },
        { materialId: 'LLDPE', thickness: 70 }
      ]
    }
  }
];

async function verifyCalculations() {
  console.log('=== 전체 계산 검증 ===\n');

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

      console.log(`수량: ${params.quantity}개`);
      console.log(`사이즈: ${params.width} x ${params.height} x ${params.depth}mm`);
      console.log(`\n계산 결과:`);
      console.log(`- 총 미터 수: ${fcd?.totalMeters}m`);
      console.log(`- 원단 폭: ${fcd?.materialWidthMM}mm`);
      console.log(`- 면적: ${fcd?.areaM2}m²`);

      if (fcd?.materialLayerDetails && fcd.materialLayerDetails.length > 0) {
        console.log(`\n재료별 중량 검증:`);
        let totalWeight = 0;

        for (const layer of fcd.materialLayerDetails) {
          const expectedWeight = (layer.thicknessMicron / 1000000) * layer.widthM * layer.meters * layer.density * 1000;
          const diff = layer.weightKg - expectedWeight;
          const diffPercent = (diff / expectedWeight) * 100;

          totalWeight += layer.weightKg;

          console.log(`  ${layer.nameJa} ${layer.thicknessMicron}μm:`);
          console.log(`    저장된 중량: ${layer.weightKg}kg`);
          console.log(`    계산된 중량: ${expectedWeight.toFixed(4)}kg`);
          console.log(`    차이: ${diff.toFixed(4)}kg (${diffPercent.toFixed(2)}%)`);

          // 차이가 0.1% 이상인 경우 경고
          if (Math.abs(diffPercent) > 0.1) {
            console.log(`    ⚠️  경고: 차이가 0.1%를 초과합니다!`);
          }
        }

        console.log(`\n  총 중량: ${totalWeight.toFixed(2)}kg`);
      }

      // 메터 수 검증
      if (params.bagTypeId === 'spout_pouch' || params.bagTypeId === 'stand_up') {
        const pitch = params.width; // 스바우트/스탠드는 width가 pitch
        const pouchesPerMeter = 1000 / pitch;
        const theoreticalMeters = params.quantity / pouchesPerMeter;
        const expectedMeters = theoreticalMeters + 400; // 400m 고정 로스

        console.log(`\n미터 수 검증:`);
        console.log(`  피치: ${pitch}mm`);
        console.log(`  개수/m: ${pouchesPerMeter.toFixed(2)}개`);
        console.log(`  이론 미터: ${theoreticalMeters.toFixed(0)}m`);
        console.log(`  예상 총 미터: ${expectedMeters.toFixed(0)}m`);
        console.log(`  실제 총 미터: ${fcd?.totalMeters}m`);

        if (Math.abs(fcd?.totalMeters - expectedMeters) > 1) {
          console.log(`  ⚠️  경고: 미터 수 차이가 큽니다!`);
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

verifyCalculations().catch(console.error);
