import { unifiedPricingEngine } from '../src/lib/unified-pricing-engine';

async function test() {
  const result = await unifiedPricingEngine.calculateQuote({
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
    markupRate: 0.3,
    lossRate: 0.4,
    filmLayers: [
      { materialId: 'PET', thickness: 12 },
      { materialId: 'AL', thickness: 7 },
      { materialId: 'PET', thickness: 12 },
      { materialId: 'LLDPE', thickness: 70 }
    ]
  });

  console.log('=== 5단계 비용 내역 마진 확인 ===');
  console.log('');
  console.log('1. 원재료비:', Math.round(result.breakdown.materialCost).toLocaleString() + '원');
  console.log('2. 인쇄비:', Math.round(result.breakdown.printingCost).toLocaleString() + '원');
  console.log('3. 후가공비:', Math.round(result.breakdown.laminationCost + result.breakdown.slitterCost + result.breakdown.pouchProcessingCost + result.breakdown.surfaceTreatmentCost).toLocaleString() + '원');
  console.log('4. 기초 원가:', result.breakdown.baseCost ? Math.round(result.breakdown.baseCost).toLocaleString() + '원' : 'N/A');
  console.log('');
  console.log('=== 마진 내역 ===');
  console.log('제조사 마진:', result.breakdown.manufacturingMargin ? Math.round(result.breakdown.manufacturingMargin).toLocaleString() + '원' : 'N/A');
  console.log('판매 마진:', result.breakdown.salesMargin ? Math.round(result.breakdown.salesMargin).toLocaleString() + '원' : 'N/A');
  console.log('');

  if (result.breakdown.baseCost && result.breakdown.manufacturingMargin) {
    const mfgRate = (result.breakdown.manufacturingMargin / result.breakdown.baseCost * 100).toFixed(1);
    console.log('제조사 마진율:', mfgRate + '% (기대: 30%)');
  }
  if (result.breakdown.baseCost && result.breakdown.salesMargin) {
    const salesRate = (result.breakdown.salesMargin / result.breakdown.baseCost * 100).toFixed(1);
    console.log('판매 마진율:', salesRate + '% (기대: 30%)');
  }
}

test().catch(console.error);
