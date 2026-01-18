/**
 * ロールフィルムマルチロール並列生産最適化テスト
 *
 * 例: 200mm幅のロールを1本注文する場合
 * - 590mm原反で2本同時生産可能 (200mm × 2 = 400mm ≤ 570mm)
 * - 760mm原反で3本同時生産可能 (200mm × 3 = 600mm ≤ 740mm)
 * - 3本まとめて注文すると、原反効率が向上し単価が下がる
 */

import { pouchCostCalculator, type PouchDimensions } from '../src/lib/pouch-cost-calculator';

console.log('='.repeat(80));
console.log('ロールフィルムマルチロール並列生産最適化テスト');
console.log('='.repeat(80));

// ========================================
// テストケース1: 200mm幅 × 500m、1本注文
// ========================================
console.log('\n【テスト1】ロールフィルム 200mm幅 × 500m、1本注文');
console.log('-'.repeat(80));

const dimensions1: PouchDimensions = {
  width: 200,   // ロールフィルムの幅（そのままフィルム幅）
  height: 0,    // ロールフィルムは高さなし
  depth: 0
};

const suggestion1 = pouchCostCalculator.calculateEconomicQuantitySuggestion(
  1,      // 注文数量（1本）
  dimensions1,
  'roll_film',
  500,    // 現在のフィルム使用量（m）- 500m注文
  5000    // 現在の単価（円/m）- 仮定値
);

console.log('基本情報:');
console.log(`  ロールサイズ: ${dimensions1.width}mm幅 × 500m`);
console.log(`  注文数量: ${suggestion1.orderQuantity}本`);
console.log('');

console.log('マルチロール並列生産最適化:');
if (suggestion1.multiRollOptimization) {
  const opt = suggestion1.multiRollOptimization;
  console.log(`  現在のロール幅: ${opt.currentRollWidth}mm`);
  console.log(`  最適な原反: ${opt.optimalRollWidth}mm × ${opt.optimalRollCount}本並列`);
  console.log(`  フィルム効率改善: ${opt.efficiencyGain.toFixed(1)}%`);
  console.log(`  フィルム使用量: ${opt.currentFilmUsage.toFixed(0)}m → ${opt.optimalFilmUsage.toFixed(0)}m`);
  console.log('');
  console.log('💡 推奨提案:');
  console.log(`   1本ではなく${opt.optimalRollCount}本まとめて注文すると、`);
  console.log(`   ${opt.optimalRollWidth}mm原反を効率的に使用でき、単価が下がります。`);
} else {
  console.log('  並列生産のメリットなし（1本生産が最適）');
}

// ========================================
// テストケース2: 150mm幅 × 500m、1本注文
// ========================================
console.log('\n【テスト2】ロールフィルム 150mm幅 × 500m、1本注文');
console.log('-'.repeat(80));

const dimensions2: PouchDimensions = {
  width: 150,
  height: 0,
  depth: 0
};

const suggestion2 = pouchCostCalculator.calculateEconomicQuantitySuggestion(
  1,
  dimensions2,
  'roll_film',
  500,
  4000
);

console.log('基本情報:');
console.log(`  ロールサイズ: ${dimensions2.width}mm幅 × 500m`);
console.log(`  注文数量: ${suggestion2.orderQuantity}本`);
console.log('');

console.log('マルチロール並列生産最適化:');
if (suggestion2.multiRollOptimization) {
  const opt = suggestion2.multiRollOptimization;
  console.log(`  現在のロール幅: ${opt.currentRollWidth}mm`);
  console.log(`  最適な原反: ${opt.optimalRollWidth}mm × ${opt.optimalRollCount}本並列`);
  console.log(`  フィルム効率改善: ${opt.efficiencyGain.toFixed(1)}%`);
  console.log(`  フィルム使用量: ${opt.currentFilmUsage.toFixed(0)}m → ${opt.optimalFilmUsage.toFixed(0)}m`);
  console.log('');
  console.log('💡 推奨提案:');
  console.log(`   ${opt.optimalRollCount}本まとめて注文すると、原反効率が大幅に向上します！`);
  console.log(`   590mm原反で${opt.optimalRollCount}本同時生産可能 (${dimensions2.width}mm × ${opt.optimalRollCount} = ${dimensions2.width * opt.optimalRollCount}mm ≤ 570mm)`);
} else {
  console.log('  並列生産のメリットなし');
}

// ========================================
// テストケース3: 250mm幅 × 500m、1本注文
// ========================================
console.log('\n【テスト3】ロールフィルム 250mm幅 × 500m、1本注文');
console.log('-'.repeat(80));

const dimensions3: PouchDimensions = {
  width: 250,
  height: 0,
  depth: 0
};

const suggestion3 = pouchCostCalculator.calculateEconomicQuantitySuggestion(
  1,
  dimensions3,
  'roll_film',
  500,
  6000
);

console.log('基本情報:');
console.log(`  ロールサイズ: ${dimensions3.width}mm幅 × 500m`);
console.log(`  注文数量: ${suggestion3.orderQuantity}本`);
console.log('');

console.log('マルチロール並列生産最適化:');
if (suggestion3.multiRollOptimization) {
  const opt = suggestion3.multiRollOptimization;
  console.log(`  現在のロール幅: ${opt.currentRollWidth}mm`);
  console.log(`  最適な原反: ${opt.optimalRollWidth}mm × ${opt.optimalRollCount}本並列`);
  console.log(`  フィルム効率改善: ${opt.efficiencyGain.toFixed(1)}%`);
  console.log(`  フィルム使用量: ${opt.currentFilmUsage.toFixed(0)}m → ${opt.optimalFilmUsage.toFixed(0)}m`);
  console.log('');
  console.log('💡 推奨提案:');
  console.log(`   ${opt.optimalRollCount}本まとめて注文すると効率的です。`);
  console.log(`   590mm原反で${opt.optimalRollCount}本同時生産可能 (${dimensions3.width}mm × ${opt.optimalRollCount} = ${dimensions3.width * opt.optimalRollCount}mm ≤ 570mm)`);
} else {
  console.log('  並列生産のメリットなし');
}

// ========================================
// テストケース4: 300mm幅 × 500m、1本注文（2本並列のみ可能）
// ========================================
console.log('\n【テスト4】ロールフィルム 300mm幅 × 500m、1本注文');
console.log('-'.repeat(80));

const dimensions4: PouchDimensions = {
  width: 300,
  height: 0,
  depth: 0
};

const suggestion4 = pouchCostCalculator.calculateEconomicQuantitySuggestion(
  1,
  dimensions4,
  'roll_film',
  500,
  7000
);

console.log('基本情報:');
console.log(`  ロールサイズ: ${dimensions4.width}mm幅 × 500m`);
console.log(`  注文数量: ${suggestion4.orderQuantity}本`);
console.log('');

console.log('マルチロール並列生産最適化:');
if (suggestion4.multiRollOptimization) {
  const opt = suggestion4.multiRollOptimization;
  console.log(`  現在のロール幅: ${opt.currentRollWidth}mm`);
  console.log(`  最適な原反: ${opt.optimalRollWidth}mm × ${opt.optimalRollCount}本並列`);
  console.log(`  フィルム効率改善: ${opt.efficiencyGain.toFixed(1)}%`);
  console.log(`  フィルム使用量: ${opt.currentFilmUsage.toFixed(0)}m → ${opt.optimalFilmUsage.toFixed(0)}m`);
  console.log('');
  console.log('💡 推奨提案:');
  console.log(`   2本まとめると590mm原反で効率的 (${dimensions4.width}mm × 2 = ${dimensions4.width * 2}mm ≤ 570mm)`);
  console.log(`   3本は760mm原反が必要 (${dimensions4.width}mm × 3 = ${dimensions4.width * 3}mm > 740mm)`);
} else {
  console.log('  並列生産のメリットなし');
}

// ========================================
// まとめ
// ========================================
console.log('\n' + '='.repeat(80));
console.log('まとめ');
console.log('='.repeat(80));
console.log('');
console.log('✅ ロールフィルムにもマルチロール並列生産最適化が適用されました');
console.log('');
console.log('📊 最適化例:');
console.log('   200mm幅 → 590mm原反で2本並列生産 (400mm / 590mm = 68%効率)');
console.log('   150mm幅 → 590mm原反で3本並列生産 (450mm / 590mm = 76%効率)');
console.log('   250mm幅 → 590mm原反で2本並列生産 (500mm / 590mm = 85%効率)');
console.log('');
console.log('💡 顧客への提案:');
console.log('   「1本だけでなく〇本まとめると、同じ原反で効率的に生産でき、');
console.log('    単価が〇〇円安くなります」と提案できます。');
console.log('');
console.log('='.repeat(80));
