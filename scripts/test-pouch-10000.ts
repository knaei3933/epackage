/**
 * Test pouch pricing calculation for 10,000 pieces
 */

import { PouchCostCalculator } from '../src/lib/pouch-cost-calculator';

const calculator = new PouchCostCalculator();

const testCases = [
  { quantity: 500, label: '500個' },
  { quantity: 2000, label: '2000個' },
  { quantity: 5000, label: '5000個' },
  { quantity: 10000, label: '10000個' }
];

const params = {
  dimensions: {
    width: 100,
    height: 120,
    depth: 0
  },
  materialId: 'PET_AL',
  thicknessSelection: 'medium',
  pouchType: 'flat_3_side',
  materialWidth: 590,
  postProcessingOptions: []
};

console.log('='.repeat(70));
console.log('パウチ価格計算比較テスト: 100×120mm');
console.log('='.repeat(70));

const results = testCases.map(testCase => {
  const result = calculator.calculateSKUCost({
    skuQuantities: [testCase.quantity],
    ...params
  });

  const sku = result.costPerSKU[0];

  console.log(`\n【${testCase.label}】`);
  console.log(`  理論メートル数: ${sku.theoreticalMeters.toFixed(1)}m`);
  console.log(`  確保量: ${sku.securedMeters.toFixed(1)}m`);
  console.log(`  ロス: ${sku.lossMeters.toFixed(1)}m`);
  console.log(`  総メートル数: ${sku.totalMeters.toFixed(1)}m`);
  console.log(`  原価: ¥${result.totalCostJPY.toLocaleString()}`);
  console.log(`  単価: ¥${Math.round(result.totalCostJPY / testCase.quantity).toLocaleString()}/個`);

  return {
    quantity: testCase.quantity,
    label: testCase.label,
    totalCost: result.totalCostJPY,
    unitPrice: Math.round(result.totalCostJPY / testCase.quantity),
    theoreticalMeters: sku.theoreticalMeters,
    securedMeters: sku.securedMeters
  };
});

console.log('\n' + '='.repeat(70));
console.log('まとめ:');
console.log('='.repeat(70));

results.forEach(r => {
  const securedMin = r.securedMeters === 500 ? '(最小)' : '';
  console.log(`${r.label}: ¥${r.totalCost.toLocaleString()} (¥${r.unitPrice}/個) | 確保量: ${r.securedMeters.toFixed(1)}m ${securedMin}`);
});

console.log('\n' + '='.repeat(70));
console.log('価格比率分析:');
console.log('='.repeat(70));

for (let i = 1; i < results.length; i++) {
  const prev = results[i - 1];
  const curr = results[i];
  const quantityRatio = curr.quantity / prev.quantity;
  const priceRatio = curr.totalCost / prev.totalCost;
  const expectedRatio = quantityRatio;

  console.log(`${prev.label} → ${curr.label}:`);
  console.log(`  数量比率: ${quantityRatio}x`);
  console.log(`  価格比率: ${priceRatio.toFixed(2)}x (期待: ${expectedRatio}x)`);
  console.log(`  ${Math.abs(priceRatio - expectedRatio) < 0.1 ? '✅ 比例' : '⚠️ 非比例'}`);
}
