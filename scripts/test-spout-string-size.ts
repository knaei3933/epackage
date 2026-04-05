import { PouchCostCalculator } from '../src/lib/pouch-cost-calculator';
import { getDefaultLayers } from '../src/lib/common/film-calculations';

async function testSpoutCalculationWithStringSize() {
  console.log('=== Testing Spout Pouch Cost Calculation with String spoutSize ===\n');

  const calculator = new PouchCostCalculator();

  // Test 1: String spoutSize (as from database)
  console.log('=== Test 1: String spoutSize ===');
  const spoutSizeString = '15';
  const spoutSizeNum = Number(spoutSizeString);

  console.log('Original spoutSize:', spoutSizeString, '(type:', typeof spoutSizeString, ')');
  console.log('After Number():', spoutSizeNum, '(type:', typeof spoutSizeNum, ')');
  console.log('After Number() === 15:', spoutSizeNum === 15);
  console.log('');

  // Test with number conversion
  const dimensions = { width: 130, height: 130, depth: 30 };
  const quantity = 5000;
  const pouchType = 'spout_pouch';
  const materialId = 'pet_pe';
  const thicknessSelection = 'medium';
  const filmLayers = getDefaultLayers(materialId, thicknessSelection);
  const postProcessingOptions = ['matte'];

  // Call calculatePouchProcessingCost directly
  console.log('=== Test 2: Direct calculatePouchProcessingCost call ===');
  const pouchProcessingCostNum = (calculator as any).calculatePouchProcessingCost(
    pouchType,
    dimensions.width,
    quantity,
    postProcessingOptions,
    spoutSizeNum  // Pass as number
  );

  console.log('Result with number spoutSize:', pouchProcessingCostNum, 'KRW');
  console.log('Result (JPY):', Math.round(pouchProcessingCostNum * 0.12));
  console.log('');

  // Expected: 80 × 5000 + 150,000 = 550,000 KRW
  const expectedKRW = 80 * quantity + 150000;
  console.log('Expected:', expectedKRW, 'KRW');
  console.log('Match:', pouchProcessingCostNum === expectedKRW ? '✓ YES' : '✗ NO');
  console.log('');

  // Test 3: Full calculateSKUCost with number spoutSize
  console.log('=== Test 3: Full calculateSKUCost with number spoutSize ===');
  const skuResult = await calculator.calculateSKUCost({
    skuQuantities: [quantity],
    dimensions,
    materialId,
    thicknessSelection,
    pouchType,
    filmLayers,
    postProcessingOptions,
    spoutSize: spoutSizeNum as 9 | 15 | 18 | 22 | 28,  // Explicitly cast to number type
    spoutPosition: 'top-center',
    markupRate: 0.0
  });

  const costBreakdown = skuResult.costPerSKU[0].costBreakdown;
  console.log('Result from calculateSKUCost:');
  console.log('  pouchProcessingCost:', costBreakdown.pouchProcessingCost);
  console.log('');

  console.log('Comparison:');
  console.log('  Expected pouchProcessingCost (JPY):', Math.round(expectedKRW * 0.12));
  console.log('  Actual pouchProcessingCost (JPY):', costBreakdown.pouchProcessingCost);
  console.log('  Match:', Math.round(costBreakdown.pouchProcessingCost) === Math.round(expectedKRW * 0.12) ? '✓ YES' : '✗ NO');
}

testSpoutCalculationWithStringSize().catch(console.error);
