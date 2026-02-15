/**
 * ロールフィルム並列生産オプション提示テスト
 *
 * 顧客に「何個注文すると効率的か」を具体的に提案
 */

import { pouchCostCalculator, type PouchDimensions } from '../src/lib/pouch-cost-calculator';

console.log('='.repeat(80));
console.log('ロールフィルム並列生産オプション提示システム');
console.log('顧客への具体的な提案デモ');
console.log('='.repeat(80));

// ========================================
// シナリオ1: 200mm幅 × 500m、1個注文
// ========================================
console.log('\n【シナリオ1】200mm幅 × 500m、1個注文');
console.log('-'.repeat(80));

const dimensions1: PouchDimensions = {
  width: 200,
  height: 0,
  depth: 0
};

const suggestion1 = pouchCostCalculator.calculateEconomicQuantitySuggestion(
  1,      // 1個注文
  dimensions1,
  'roll_film',
  500,
  5000
);

console.log('【顧客への提案】');
console.log(`現在の注文: 200mm幅 × 500m、${suggestion1.orderQuantity}個`);
console.log(`現在の単価: ¥${suggestion1.unitCostAtOrderQty.toLocaleString()}/m`);
console.log('');

if (suggestion1.parallelProductionOptions && suggestion1.parallelProductionOptions.length > 0) {
  console.log('【効率的な注文オプション】');
  console.log('');

  for (const option of suggestion1.parallelProductionOptions) {
    const stars = option.isRecommended ? '⭐ ' : '';
    console.log(`${stars}オプション${option.optionNumber}: ${option.quantity}個注文`);
    console.log(`  使用原反: ${option.materialWidth}mm`);
    console.log(`  並列生産数: ${option.parallelCount}本 (${option.quantity}個 × ${dimensions1.width}mm = ${option.quantity * dimensions1.width}mm)`);
    console.log(`  原反効率: ${option.filmWidthUtilization.toFixed(1)}%`);
    console.log(`  見積単価: ¥${option.estimatedUnitCost.toLocaleString()}/m`);
    console.log(`  節減率: ${option.savingsRate.toFixed(1)}%`);
    console.log(`  ${option.reason}`);
    console.log('');
  }

  // 推奨オプションを強調表示
  const recommended = suggestion1.parallelProductionOptions.filter(opt => opt.isRecommended);
  if (recommended.length > 0) {
    console.log('💡 特におすすめ:');
    recommended.forEach(opt => {
      console.log(`   「${opt.quantity}個まとめて注文すると、${opt.materialWidth}mm原反を`);
      console.log(`    ${opt.filmWidthUtilization.toFixed(0)}%活用でき、単価が${opt.savingsRate.toFixed(0)}%安くなります！」`);
    });
  }
} else {
  console.log('並列生産のメリットはありません。');
}

// ========================================
// シナリオ2: 150mm幅 × 500m、1個注文
// ========================================
console.log('\n' + '='.repeat(80));
console.log('\n【シナリオ2】150mm幅 × 500m、1個注文');
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

console.log('【顧客への提案】');
console.log(`現在の注文: 150mm幅 × 500m、${suggestion2.orderQuantity}個`);
console.log(`現在の単価: ¥${suggestion2.unitCostAtOrderQty.toLocaleString()}/m`);
console.log('');

if (suggestion2.parallelProductionOptions && suggestion2.parallelProductionOptions.length > 0) {
  console.log('【効率的な注文オプション】');
  console.log('');

  for (const option of suggestion2.parallelProductionOptions) {
    const stars = option.isRecommended ? '⭐ ' : '';
    console.log(`${stars}オプション${option.optionNumber}: ${option.quantity}個注文`);
    console.log(`  使用原反: ${option.materialWidth}mm (${option.quantity}本 × ${dimensions2.width}mm = ${option.quantity * dimensions2.width}mm)`);
    console.log(`  原反効率: ${option.filmWidthUtilization.toFixed(1)}%`);
    console.log(`  見積単価: ¥${option.estimatedUnitCost.toLocaleString()}/m`);
    console.log(`  節減率: ${option.savingsRate.toFixed(1)}%`);
    console.log(`  ${option.reason}`);
    console.log('');
  }

  const recommended = suggestion2.parallelProductionOptions.filter(opt => opt.isRecommended);
  if (recommended.length > 0) {
    console.log('💡 特におすすめ:');
    recommended.forEach(opt => {
      console.log(`   「${opt.quantity}個まとめると、${opt.materialWidth}mm原反を`);
      console.log(`    ${opt.filmWidthUtilization.toFixed(0)}%活用でき、${opt.savingsRate.toFixed(0)}%もお得です！」`);
    });
  }
}

// ========================================
// シナリオ3: 300mm幅 × 500m、1個注文（幅が広い場合）
// ========================================
console.log('\n' + '='.repeat(80));
console.log('\n【シナリオ3】300mm幅 × 500m、1個注文（幅が広い場合）');
console.log('-'.repeat(80));

const dimensions3: PouchDimensions = {
  width: 300,
  height: 0,
  depth: 0
};

const suggestion3 = pouchCostCalculator.calculateEconomicQuantitySuggestion(
  1,
  dimensions3,
  'roll_film',
  500,
  7000
);

console.log('【顧客への提案】');
console.log(`現在の注文: 300mm幅 × 500m、${suggestion3.orderQuantity}個`);
console.log(`現在の単価: ¥${suggestion3.unitCostAtOrderQty.toLocaleString()}/m`);
console.log('');

if (suggestion3.parallelProductionOptions && suggestion3.parallelProductionOptions.length > 0) {
  console.log('【効率的な注文オプション】');
  console.log('');

  for (const option of suggestion3.parallelProductionOptions) {
    const stars = option.isRecommended ? '⭐ ' : '';
    console.log(`${stars}オプション${option.optionNumber}: ${option.quantity}個注文`);
    console.log(`  使用原反: ${option.materialWidth}mm (${option.quantity}本 × ${dimensions3.width}mm = ${option.quantity * dimensions3.width}mm)`);
    console.log(`  原反効率: ${option.filmWidthUtilization.toFixed(1)}%`);
    console.log(`  見積単価: ¥${option.estimatedUnitCost.toLocaleString()}/m`);
    console.log(`  節減率: ${option.savingsRate.toFixed(1)}%`);
    console.log(`  ${option.reason}`);
    console.log('');
  }

  const recommended = suggestion3.parallelProductionOptions.filter(opt => opt.isRecommended);
  if (recommended.length > 0) {
    console.log('💡 特におすすめ:');
    recommended.forEach(opt => {
      console.log(`   「${opt.quantity}個まとめると${opt.savingsRate.toFixed(0)}%お得です」`);
    });
  }
}

// ========================================
// まとめ
// ========================================
console.log('\n' + '='.repeat(80));
console.log('まとめ');
console.log('='.repeat(80));
console.log('');
console.log('✅ 顧客への具体的な提案機能が実装されました');
console.log('');
console.log('【提案の流れ】');
console.log('1. 顧客が「200mm幅 × 500m、1個」を注文');
console.log('2. システムが以下のオプションを提示:');
console.log('   - 2個注文: 590mm原反、68%効率、33%節減');
console.log('   - 3個注文: 760mm原反、79%効率、47%節減 ⭐推奨');
console.log('3. 顧客は「じゃあ3個でお願い」を選択可能');
console.log('');
console.log('【メリット】');
console.log('✓ 顧客は「何個注文すればいいか」明確に分かる');
console.log('✓ 各オプションの単価と節減率が分かる');
console.log('✓ 推奨オプションが一目で分かる');
console.log('');
console.log('='.repeat(80));
