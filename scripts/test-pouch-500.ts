/**
 * Test pouch pricing calculation for 500 pieces (100×120mm)
 *
 * Test case: 100×120mm 三方シール平袋, 500個
 * Expected: Processing cost should be ₩200,000 minimum → ¥24,000
 */

import { PouchCostCalculator } from '../src/lib/pouch-cost-calculator';

// Test parameters
const params = {
  skuQuantities: [500],  // 500個
  dimensions: {
    width: 100,   // mm
    height: 120,  // mm
    depth: 0      // 平袋
  },
  materialId: 'PET_AL',
  thicknessSelection: 'medium',  // 標準タイプ
  pouchType: 'flat_3_side',  // 三方シール平袋
  materialWidth: 590,  // 100mm幅なので590mm原反
  postProcessingOptions: []  // ジッパーなし
};

console.log('='.repeat(60));
console.log('パウチ価格計算テスト: 100×120mm × 500個');
console.log('='.repeat(60));
console.log('\n入力パラメータ:');
console.log(JSON.stringify(params, null, 2));

const calculator = new PouchCostCalculator();

try {
  const result = calculator.calculateSKUCost(params);

  console.log('\n' + '='.repeat(60));
  console.log('計算結果:');
  console.log('='.repeat(60));

  console.log('\n【総額】');
  console.log(`総原価: ¥${result.totalCostJPY.toLocaleString()}`);
  console.log(`単価: ¥${Math.round(result.totalCostJPY / 500).toLocaleString()}/個`);

  console.log('\n【サマリー】');
  console.log(`総確保量: ${result.summary.totalSecuredMeters.toFixed(1)}m`);
  console.log(`総メートル数（ロス込み）: ${result.summary.totalWithLossMeters.toFixed(1)}m`);

  console.log('\n【SKU別内訳】');
  result.costPerSKU.forEach((sku) => {
    console.log(`\nSKU #${sku.skuIndex + 1}:`);
    console.log(`  数量: ${sku.quantity}個`);
    console.log(`  理論メートル数: ${sku.theoreticalMeters.toFixed(2)}m`);
    console.log(`  確保量: ${sku.securedMeters.toFixed(1)}m`);
    console.log(`  ロス: ${sku.lossMeters.toFixed(1)}m`);
    console.log(`  総メートル数: ${sku.totalMeters.toFixed(1)}m`);
    console.log(`  原価: ¥${sku.costJPY.toLocaleString()}`);

    console.log(`\n  原価内訳:`);
    console.log(`    材料費: ¥${sku.costBreakdown.materialCost.toLocaleString()}`);
    console.log(`    印刷費: ¥${sku.costBreakdown.printingCost.toLocaleString()}`);
    console.log(`    ラミネート費: ¥${sku.costBreakdown.laminationCost.toLocaleString()}`);
    console.log(`    スリッター費: ¥${sku.costBreakdown.slitterCost.toLocaleString()}`);
    console.log(`    袋加工費: ¥${sku.costBreakdown.pouchProcessingCost.toLocaleString()}`);
    console.log(`    関税: ¥${sku.costBreakdown.duty.toLocaleString()}`);
    console.log(`    配送料: ¥${sku.costBreakdown.delivery.toLocaleString()}`);
    console.log(`    総原価: ¥${sku.costBreakdown.totalCost.toLocaleString()}`);
  });

  console.log('\n' + '='.repeat(60));
  console.log('検証:');
  console.log('='.repeat(60));

  // 検証チェック
  const processingCost = result.costPerSKU[0].costBreakdown.pouchProcessingCost;
  const expectedMinProcessingCost = 24000; // ₩200,000 × 0.12

  console.log(`\n袋加工費:`);
  console.log(`  期待値（最小）: ¥${expectedMinProcessingCost.toLocaleString()}`);
  console.log(`  実際の値: ¥${processingCost.toLocaleString()}`);
  console.log(`  ${processingCost === expectedMinProcessingCost ? '✅ 一致' : '❌ 不一致'}`);

  // 2000個の場合と比較
  console.log(`\n\n比較テスト（2000個の場合）:`);
  const params2000 = { ...params, skuQuantities: [2000] };
  const result2000 = calculator.calculateSKUCost(params2000);

  console.log(`500個: ¥${result.totalCostJPY.toLocaleString()} (¥${Math.round(result.totalCostJPY / 500).toLocaleString()}/個)`);
  console.log(`2000個: ¥${result2000.totalCostJPY.toLocaleString()} (¥${Math.round(result2000.totalCostJPY / 2000).toLocaleString()}/個)`);

  const ratio = result2000.totalCostJPY / result.totalCostJPY;
  console.log(`価格比率: ${ratio.toFixed(2)}x (期待値: ${2000/500}x = 4x)`);

  if (ratio < 2) {
    console.log('\n⚠️ 警告: 価格が数量に比例して増加していません！');
    console.log('500個と2000個で同じ価格になっている可能性があります。');
  }

  console.log('\n' + '='.repeat(60));

} catch (error) {
  console.error('\n❌ エラーが発生しました:');
  console.error(error);
  process.exit(1);
}
