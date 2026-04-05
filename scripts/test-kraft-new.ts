import { unifiedPricingEngine } from '../src/lib/unified-pricing-engine';
import { getDefaultLayers } from '../src/lib/common/film-calculations';

async function testKraft() {
  unifiedPricingEngine.clearCache();

  const result = await unifiedPricingEngine.calculateQuote({
    bagTypeId: 'flat_3_side',
    materialId: 'kraft_vmpet_lldpe',
    quantity: 5000,
    width: 130,
    height: 130,
    depth: 0,
    thicknessSelection: 'medium',
    printingColors: 1,
    printingType: 'digital',
    doubleSided: false,
    postProcessingOptions: [],
    useFilmCostCalculation: true,
    markupRate: 0.3,
    lossRate: 0.4,
    filmLayers: getDefaultLayers('kraft_vmpet_lldpe')
  });

  console.log('=== Kraft Paper Test ===');
  const filmDetails = result.filmCostDetails;
  if (filmDetails?.materialLayerDetails) {
    for (const layer of filmDetails.materialLayerDetails) {
      if (layer.materialId === 'KRAFT') {
        console.log('KRAFT:');
        console.log('  grammage:', layer.grammage, 'g/m²');
        console.log('  weightKg:', layer.weightKg, 'kg');
        console.log('  costKRW:', layer.costKRW, 'KRW');
        console.log('');

        // 計算検証
        const priceWeight = (layer.grammage || 80) / 1000 * layer.widthM * layer.meters;
        console.log('Price calculation (density 1.0):', priceWeight.toFixed(2), 'kg × ₩3,000 = ₩' + Math.round(priceWeight * 3000).toLocaleString());
      }
    }
  }
}

testKraft().catch(console.error);
