/**
 * 並列生産割引機能テストスクリプト
 *
 * docs/reports/tjfrP/Pouch_Cost_Calculation_Guide_2026.md セクション8参照
 *
 * 割引ルール:
 * - 2本目（2列目）: 40%割引 = 60%価格
 * - 3本目以降: 70%割引 = 30%価格
 */

import { PouchCostCalculator } from '../src/lib/pouch-cost-calculator';

// ========================================
// テスト1: 基本割引計算
// ========================================

console.log('========================================');
console.log('テスト1: 基本割引計算');
console.log('========================================\n');

const calculator = new PouchCostCalculator();

// テストケース: 基準価格20万円
const basePrice = 200000;

console.log('基準価格: 200,000円\n');

// 並列数1（基準）
const result1 = calculator.calculateParallelDiscount(basePrice, 1);
console.log(`1本（1列）: ${result1.toLocaleString()}円`);

// 並列数2（2本目40%OFF）
const result2 = calculator.calculateParallelDiscount(basePrice, 2);
console.log(`2本（2列）: ${result2.toLocaleString()}円 (割引適用後総額)`);
console.log(`  1本あたり: ${(result2 / 2).toLocaleString()}円`);
console.log(`  割引額: ${((basePrice * 2) - result2).toLocaleString()}円 (${40}%OFF)`);

// 並列数3（3本目70%OFF）
const result3 = calculator.calculateParallelDiscount(basePrice, 3);
console.log(`3本（3列）: ${result3.toLocaleString()}円 (割引適用後総額)`);
console.log(`  1本あたり: ${(result3 / 3).toLocaleString()}円`);
console.log(`  割引額: ${((basePrice * 3) - result3).toLocaleString()}円 (約70%OFF)`);

// 並列数4（4本目70%OFF）
const result4 = calculator.calculateParallelDiscount(basePrice, 4);
console.log(`4本（4列）: ${result4.toLocaleString()}円 (割引適用後総額)`);
console.log(`  1本あたり: ${(result4 / 4).toLocaleString()}円`);
console.log(`  割引額: ${((basePrice * 4) - result4).toLocaleString()}円 (70%OFF)`);

// ========================================
// テスト2: 割引詳細計算
// ========================================

console.log('\n========================================');
console.log('テスト2: 割引詳細計算');
console.log('========================================\n');

const detail2 = calculator.calculateParallelDiscountDetail(basePrice, 2);
console.log('2本（2列）詳細:');
console.log(`  割引前総額: ${detail2.originalPrice.toLocaleString()}円`);
console.log(`  割引適用後: ${detail2.discountedPrice.toLocaleString()}円`);
console.log(`  割引額: ${detail2.discountAmount.toLocaleString()}円`);
console.log(`  割引率: ${detail2.discountRate}%`);
console.log(`  割引係数: ${detail2.discountMultiplier}`);
console.log(`  内訳:`);
console.log(`    1本目: ${detail2.breakdown.firstUnit.toLocaleString()}円 (100%)`);
console.log(`    2本目: ${(detail2.breakdown.additionalUnits / 1).toLocaleString()}円 (60%)`);

const detail3 = calculator.calculateParallelDiscountDetail(basePrice, 3);
console.log('\n3本（3列）詳細:');
console.log(`  割引前総額: ${detail3.originalPrice.toLocaleString()}円`);
console.log(`  割引適用後: ${detail3.discountedPrice.toLocaleString()}円`);
console.log(`  割引額: ${detail3.discountAmount.toLocaleString()}円`);
console.log(`  割引率: ${detail3.discountRate}%`);
console.log(`  割引係数: ${detail3.discountMultiplier}`);
console.log(`  内訳:`);
console.log(`    1本目: ${detail3.breakdown.firstUnit.toLocaleString()}円 (100%)`);
console.log(`    追加2本合計: ${detail3.breakdown.additionalUnits.toLocaleString()}円 (各30%)`);
console.log(`    追加1本当たり: ${(detail3.breakdown.additionalUnits / 2).toLocaleString()}円`);

// ========================================
// テスト3: 検証テスト（期待値との比較）
// ========================================

console.log('\n========================================');
console.log('テスト3: 検証テスト（期待値との比較）');
console.log('========================================\n');

const testCases = [
  { parallelCount: 1, expectedMultiplier: 1.0, expectedTotal: 200000 },
  { parallelCount: 2, expectedMultiplier: 1.6, expectedTotal: 320000 },
  { parallelCount: 3, expectedMultiplier: 1.9, expectedTotal: 380000 }, // 修正: 1.6 → 1.9
  { parallelCount: 4, expectedMultiplier: 2.2, expectedTotal: 440000 }, // 修正: 2.0 → 2.2
  { parallelCount: 5, expectedMultiplier: 2.5, expectedTotal: 500000 }, // 修正: 2.3 → 2.5
];

let passedTests = 0;
let failedTests = 0;

testCases.forEach((testCase) => {
  const result = calculator.calculateParallelDiscount(basePrice, testCase.parallelCount);
  const expected = testCase.expectedTotal;
  const passed = Math.abs(result - expected) < 1;

  console.log(`${testCase.parallelCount}本: ${result.toLocaleString()}円 (期待: ${expected.toLocaleString()}円) ${passed ? '✅ PASS' : '❌ FAIL'}`);

  if (passed) {
    passedTests++;
  } else {
    failedTests++;
  }
});

console.log(`\nテスト結果: ${passedTests} PASS, ${failedTests} FAIL`);

// ========================================
// テスト4: 実使用シナリオ
// ========================================

console.log('\n========================================');
console.log('テスト4: 実使用シナリオ（ロールフィルム）');
console.log('========================================\n');

// ロールフィルム 200mm × 500m の例
const filmBasePrice = 60315; // 1本あたりの基準価格

console.log('ロールフィルム 200mm × 500m (基準価格: 60,315円)\n');

const filmCases = [
  { parallelCount: 1, description: '590mm原反, 1本' },
  { parallelCount: 2, description: '590mm原反, 2本' },
  { parallelCount: 3, description: '760mm原反, 3本' },
];

filmCases.forEach((testCase) => {
  const result = calculator.calculateParallelDiscountDetail(filmBasePrice, testCase.parallelCount);
  console.log(`${testCase.description}:`);
  console.log(`  総価格: ${result.discountedPrice.toLocaleString()}円`);
  console.log(`  1本あたり: ${(result.discountedPrice / testCase.parallelCount).toLocaleString()}円`);
  console.log(`  1mあたり: ${((result.discountedPrice / testCase.parallelCount) / 500).toLocaleString()}円/m`);
  console.log(`  割引額: ${result.discountAmount.toLocaleString()}円 (${result.discountRate}% OFF)\n`);
});

// ========================================
// テスト5: パウチ製品シナリオ
// ========================================

console.log('========================================');
console.log('テスト5: パウチ製品シナリオ（平袋）');
console.log('========================================\n');

// 平袋 80mm × 120mm × 10,000個 の例
// 1列生産: フィルム原価 250,000円
// 2列生産: フィルム使用量が半減（1,550m → 775m）、フィルム原価も半減（250,000円 → 125,000円）
// 並列生産割引: 125,000円 × 1.6 = 200,000円
// 1個あたり: 200,000円 ÷ 10,000個 = 20円/個

const pouch1ColBasePrice = 250000;
const pouch2ColBasePrice = 125000; // 2列生産でフィルム使用量半減

console.log('平袋 80mm × 120mm × 10,000個\n');

// 1列生産
const result1Col = calculator.calculateParallelDiscountDetail(pouch1ColBasePrice, 1);
console.log(`1列生産:`);
console.log(`  総価格: ${result1Col.discountedPrice.toLocaleString()}円`);
console.log(`  1個あたり: ${(result1Col.discountedPrice / 10000).toLocaleString()}円/個`);

// 2列生産（フィルム使用量半減 + 並列生産割引適用）
const result2Col = calculator.calculateParallelDiscountDetail(pouch2ColBasePrice, 2);
console.log(`\n2列生産:`);
console.log(`  総価格: ${result2Col.discountedPrice.toLocaleString()}円`);
console.log(`  1個あたり: ${(result2Col.discountedPrice / 10000).toLocaleString()}円/個`);
console.log(`  節減率: ${((250000 - result2Col.discountedPrice) / 250000 * 100).toFixed(0)}% OFF`);

console.log('========================================');
console.log('すべてのテスト完了');
console.log('========================================');
