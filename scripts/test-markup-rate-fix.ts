/**
 * Test markupRate fix in unified-pricing-engine.ts
 *
 * Tests that customer-specific markup rates are properly applied
 */

import { UnifiedPricingEngine } from '../src/lib/unified-pricing-engine';

async function runTest() {
  const engine = new UnifiedPricingEngine();

  const testParams = {
    bagTypeId: 'pouch' as const,
    quantity: 500,
    width: 100,
    height: 120,
    depth: 0,
    pouchType: 'flat_3_side',
    materialId: 'PET_AL',
    thicknessSelection: 'medium' as const,
    postProcessingOptions: [],
    skuQuantities: [500],
    useSKUCalculation: true  // IMPORTANT: Enable SKU calculation
  };

  console.log('='.repeat(70));
  console.log('MarkupRate Fix Verification Test');
  console.log('='.repeat(70));
  console.log('\nTest Parameters:');
  console.log(JSON.stringify(testParams, null, 2));

  // Test 1: Default markup rate (50%)
  console.log('\n' + '='.repeat(70));
  console.log('Test 1: Default Markup Rate (50%)');
  console.log('='.repeat(70));

  const result1 = await engine.calculateQuote({
    ...testParams,
    markupRate: 0.5
  });

  console.log('\nResult with markupRate = 0.5 (50%):');
  console.log(JSON.stringify(result1, null, 2));

  // Test 2: Customer markup rate (79.1%)
  console.log('\n' + '='.repeat(70));
  console.log('Test 2: Customer Markup Rate (79.1%)');
  console.log('='.repeat(70));

  const result2 = await engine.calculateQuote({
    ...testParams,
    markupRate: 0.791
  });

  console.log('\nResult with markupRate = 0.791 (79.1%):');
  console.log(JSON.stringify(result2, null, 2));

  // Test 3: Verify different markup rates produce different prices
  console.log('\n' + '='.repeat(70));
  console.log('Test 3: Markup Rate Differentiation');
  console.log('='.repeat(70));

  const pricesAreDifferent = result1.totalPrice !== result2.totalPrice;
  console.log(`\nPrice with 50% markup: ¥${result1.totalPrice.toLocaleString()}`);
  console.log(`Price with 79.1% markup: ¥${result2.totalPrice.toLocaleString()}`);
  console.log(`  Difference: ¥${(result2.totalPrice - result1.totalPrice).toLocaleString()}`);
  console.log(`  ${pricesAreDifferent ? '✅ PASS' : '❌ FAIL'} - Markup rates are being ${pricesAreDifferent ? 'applied' : 'ignored'}`);

  // Test 4: Expected price calculation
  console.log('\n' + '='.repeat(70));
  console.log('Test 4: Expected Price Calculation');
  console.log('='.repeat(70));
  console.log('\nBase Cost from pouch-cost-calculator.ts: ¥131,231');
  console.log('Expected with 50% markup: ¥291,614 (194,409 × 1.5)');
  console.log('Expected with 79.1% markup: ¥348,214 (194,409 × 1.791)');

  console.log('\nActual Results:');
  console.log(`  50% markup: ¥${result1.totalPrice.toLocaleString()}`);
  console.log(`  79.1% markup: ¥${result2.totalPrice.toLocaleString()}`);

  // Check console logs for salesMargin value
  console.log('\n' + '='.repeat(70));
  console.log('Console Log Verification');
  console.log('='.repeat(70));
  console.log('\nCheck console logs above for:');
  console.log('  - "salesMargin: 0.5" for Test 1');
  console.log('  - "salesMargin: 0.791" for Test 2');
  console.log('  - If both show 0.5, the bug is NOT fixed');

  console.log('\n' + '='.repeat(70));
}

runTest().catch(console.error);
