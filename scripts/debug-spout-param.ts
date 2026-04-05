import { unifiedPricingEngine } from '../src/lib/unified-pricing-engine';
import { getDefaultLayers } from '../src/lib/common/film-calculations';

async function debugSpoutParam() {
  console.log('=== Debugging Spout Parameter Passing ===\n');

  // Test specs as they come from database
  const specs = {
    bagTypeId: 'spout_pouch',
    materialId: 'pet_pe',
    quantity: 5000,
    skuQuantities: [5000],
    useSKUCalculation: true,
    width: 130,
    height: 130,
    depth: 30,
    thickness: 80,
    thicknessSelection: 'medium',
    printingColors: 4,
    printingType: 'digital',
    doubleSided: false,
    postProcessingOptions: ['matte'],
    filmLayers: getDefaultLayers('pet_pe', 'medium'),
    useFilmCostCalculation: true,
    markupRate: 0.5,
    lossRate: 0.4,
    // Spout parameters - explicitly as number
    spoutSize: 15 as 9 | 15 | 18 | 22 | 28,
    spoutPosition: 'top-center' as const
  };

  console.log('Input params:');
  console.log('  spoutSize:', specs.spoutSize, '(type:', typeof specs.spoutSize, ')');
  console.log('  spoutSize === 15:', specs.spoutSize === 15);
  console.log('');

  const result = await unifiedPricingEngine.calculateQuote(specs);

  console.log('\n=== Result ===');
  console.log('Total Cost (JPY):', result.breakdown?.total);

  // Check processing cost
  if (result.filmCostDetails) {
    console.log('Pouch Processing Cost (JPY):', result.filmCostDetails.pouchProcessingCost);
  }

  // Expected for 15mm spout:
  // 80 KRW × 5000 = 400,000 KRW
  // 400,000 + 150,000 = 550,000 KRW
  // 550,000 × 0.12 = 66,000 JPY
  const expectedJPY = 66000;

  console.log('\n=== Comparison ===');
  console.log('Expected pouchProcessingCost (JPY):', expectedJPY);
  console.log('Actual:', result.breakdown?.processing || result.breakdown?.pouchProcessingCost || result.filmCostDetails?.pouchProcessingCost);
  console.log('Match:', Math.round((result.breakdown?.processing || 0)) === expectedJPY ? '✓ YES' : '✗ NO');
}

debugSpoutParam().catch(console.error);
