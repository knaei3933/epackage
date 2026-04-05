import { PouchCostCalculator } from '../src/lib/pouch-cost-calculator';
import { getDefaultLayers } from '../src/lib/common/film-calculations';

async function testSpoutCalculation() {
  console.log('=== Testing Spout Pouch Cost Calculation ===\n');

  const calculator = new PouchCostCalculator();

  // Spout pouch parameters (QT20260401-1568)
  const spoutSize = 15; // 15mm
  const quantity = 5000;
  const dimensions = {
    width: 130,
    height: 130,
    depth: 30
  };
  const materialId = 'pet_pe';
  const thicknessSelection = 'medium';
  const pouchType = 'spout_pouch';
  const filmLayers = getDefaultLayers(materialId, thicknessSelection);
  const postProcessingOptions = ['matte'];

  console.log('Input Parameters:');
  console.log('  pouchType:', pouchType);
  console.log('  spoutSize:', spoutSize);
  console.log('  quantity:', quantity);
  console.log('  dimensions:', dimensions);
  console.log('  materialId:', materialId);
  console.log('  postProcessingOptions:', postProcessingOptions);
  console.log('');

  // Test calculatePouchProcessingCost directly
  console.log('=== Testing calculatePouchProcessingCost ===');
  const pouchProcessingCost = (calculator as any).calculatePouchProcessingCost(
    pouchType,
    dimensions.width,
    quantity,
    postProcessingOptions,
    spoutSize
  );

  console.log('Result:');
  console.log('  pouchProcessingCost (KRW):', pouchProcessingCost);
  console.log('  pouchProcessingCost (JPY):', Math.round(pouchProcessingCost * 0.12));
  console.log('');

  // Expected calculation:
  // Spout price (15mm): 80 KRW
  // Quantity: 5000
  // Round trip shipping: 150,000 KRW
  // Total: (80 * 5000) + 150,000 = 550,000 KRW
  // JPY: 550,000 * 0.12 = 66,000 JPY

  const expectedKRW = 80 * quantity + 150000;
  const expectedJPY = expectedKRW * 0.12;

  console.log('Expected Calculation:');
  console.log('  Spout price (15mm): 80 KRW');
  console.log('  Quantity:', quantity);
  console.log('  Round trip shipping: 150,000 KRW');
  console.log('  Expected (KRW):', expectedKRW);
  console.log('  Expected (JPY):', expectedJPY);
  console.log('');

  console.log('Comparison:');
  console.log('  Actual (KRW):', pouchProcessingCost);
  console.log('  Expected (KRW):', expectedKRW);
  console.log('  Match:', pouchProcessingCost === expectedKRW ? '✓ YES' : '✗ NO');
  console.log('');

  // Test full calculateSKUCost
  console.log('=== Testing calculateSKUCost ===');
  const skuResult = await calculator.calculateSKUCost({
    skuQuantities: [quantity],
    dimensions,
    materialId,
    thicknessSelection,
    pouchType,
    filmLayers,
    postProcessingOptions,
    spoutSize,
    spoutPosition: 'top-center',
    markupRate: 0.0
  });

  const costBreakdown = skuResult.costPerSKU[0].costBreakdown;
  console.log('Result from calculateSKUCost:');
  console.log('  pouchProcessingCost:', costBreakdown.pouchProcessingCost);
  console.log('  totalCost:', costBreakdown.totalCost);
  console.log('');

  console.log('Comparison:');
  console.log('  Expected pouchProcessingCost (JPY):', expectedJPY);
  console.log('  Actual pouchProcessingCost (JPY):', costBreakdown.pouchProcessingCost);
  console.log('  Match:', Math.round(costBreakdown.pouchProcessingCost) === Math.round(expectedJPY) ? '✓ YES' : '✗ NO');
}

testSpoutCalculation().catch(console.error);
