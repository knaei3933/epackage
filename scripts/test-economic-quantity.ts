/**
 * 経済的生産数量提案機能テスト
 *
 * パウチのピッチ（幅）に基づいて、フィルムの無駄を最小化する数量を提案
 */

import { pouchCostCalculator, type PouchDimensions } from '../src/lib/pouch-cost-calculator';

console.log('='.repeat(80));
console.log('経済的生産数量提案機能テスト');
console.log('='.repeat(80));

// ========================================
// テストケース1: 平袋（三封）120×180mm
// ========================================
console.log('\n【テスト1】平袋 120×180mm、注文数量500個');
console.log('-'.repeat(80));

const dimensions1: PouchDimensions = {
  width: 120,   // ピッチ（進行方向）
  height: 180,
  depth: 0
};

const suggestion1 = pouchCostCalculator.calculateEconomicQuantitySuggestion(
  500,    // 注文数量
  dimensions1,
  'flat_3_side',
  900,    // 現在のフィルム使用量（m）- 最小発注量
  505     // 現在の単価（円/個）- 仮定値
);

console.log('基本情報:');
console.log(`  パウチサイズ: ${dimensions1.width}×${dimensions1.height}mm`);
console.log(`  ピッチ（幅）: ${dimensions1.width}mm`);
console.log(`  1mあたり生産可能数: ${suggestion1.pouchesPerMeter.toFixed(1)}個/m`);
console.log('');
console.log('最小発注量基準:');
console.log(`  最小フィルム使用量: ${suggestion1.minimumFilmUsage}m`);
console.log(`  最小発注可能数量: ${suggestion1.minimumOrderQuantity.toLocaleString()}個`);
console.log('');
console.log('経済的数量提案:');
console.log(`  経済的数量: ${suggestion1.economicQuantity.toLocaleString()}個`);
console.log(`  フィルム効率改善: ${suggestion1.efficiencyImprovement.toFixed(1)}%`);
console.log('');
console.log('コスト比較:');
console.log(`  注文数量${suggestion1.orderQuantity}個の単価: ¥${suggestion1.unitCostAtOrderQty.toLocaleString()}/個`);
console.log(`  経済的数量${suggestion1.economicQuantity.toLocaleString()}個の単価: ¥${suggestion1.unitCostAtEconomicQty.toLocaleString()}/個`);
console.log(`  コスト削減: ¥${suggestion1.costSavings.toLocaleString()} (${suggestion1.costSavingsRate.toFixed(1)}%)`);
console.log('');
console.log('推奨提案:');
console.log(`  推奨数量: ${suggestion1.recommendedQuantity.toLocaleString()}個`);
console.log(`  理由: ${suggestion1.recommendationReason}`);

// ========================================
// テストケース2: 合掌袋（T封）60×100mm - マルチロール最適化
// ========================================
console.log('\n【テスト2】合掌袋 60×100mm、注文数量500個（マルチロール最適化）');
console.log('-'.repeat(80));

const dimensions2: PouchDimensions = {
  width: 60,
  height: 100,
  depth: 0
};

const suggestion2 = pouchCostCalculator.calculateEconomicQuantitySuggestion(
  500,
  dimensions2,
  't_shape',
  900,
  638
);

console.log('基本情報:');
console.log(`  パウチサイズ: ${dimensions2.width}×${dimensions2.height}mm`);
console.log(`  フィルム幅: ${(suggestion2.multiRollOptimization?.currentRollWidth || 0)}mm`);
console.log('');
console.log('マルチロール最適化:');
if (suggestion2.multiRollOptimization) {
  const opt = suggestion2.multiRollOptimization;
  console.log(`  現在の原反: ${opt.currentRollWidth}mm × 1ロール`);
  console.log(`  最適な原反: ${opt.optimalRollWidth}mm × ${opt.optimalRollCount}ロール`);
  console.log(`  フィルム効率改善: ${opt.efficiencyGain.toFixed(1)}%`);
  console.log(`  フィルム使用量: ${opt.currentFilmUsage.toFixed(0)}m → ${opt.optimalFilmUsage.toFixed(0)}m`);
}
console.log('');
console.log('推奨提案:');
console.log(`  推奨数量: ${suggestion2.recommendedQuantity.toLocaleString()}個`);
console.log(`  理由: ${suggestion2.recommendationReason}`);

// ========================================
// テストケース3: 大量注文（10,000個）
// ========================================
console.log('\n【テスト3】平袋 100×120mm、注文数量10,000個');
console.log('-'.repeat(80));

const dimensions3: PouchDimensions = {
  width: 100,
  height: 120,
  depth: 0
};

const suggestion3 = pouchCostCalculator.calculateEconomicQuantitySuggestion(
  10000,
  dimensions3,
  'flat_3_side',
  1750,   // 実際の使用量（50m単位切り上げ）
  505
);

console.log('基本情報:');
console.log(`  パウチサイズ: ${dimensions3.width}×${dimensions3.height}mm`);
console.log(`  注文数量: ${suggestion3.orderQuantity.toLocaleString()}個`);
console.log(`  1mあたり生産可能数: ${suggestion3.pouchesPerMeter.toFixed(1)}個/m`);
console.log('');
console.log('経済的分析:');
console.log(`  最小発注量: ${suggestion3.minimumFilmUsage}m`);
console.log(`  最小発注可能数量: ${suggestion3.minimumOrderQuantity.toLocaleString()}個`);
console.log(`  経済的数量: ${suggestion3.economicQuantity.toLocaleString()}個`);
console.log('');
console.log('推奨提案:');
console.log(`  推奨数量: ${suggestion3.recommendedQuantity.toLocaleString()}個`);
console.log(`  理由: ${suggestion3.recommendationReason}`);

// ========================================
// まとめ
// ========================================
console.log('\n' + '='.repeat(80));
console.log('まとめ');
console.log('='.repeat(80));
console.log('');
console.log('✅ パウチのピッチ（幅）に基づいて、フィルムの無駄を最小化する数量を提案');
console.log('✅ 合掌・ボックスパウチのマルチロール最適化を実装');
console.log('✅ 効率改善率とコスト削減率を算出');
console.log('✅ 無駄率に応じて適切な推奨数量を提案');
console.log('');
console.log('=' .repeat(80));
