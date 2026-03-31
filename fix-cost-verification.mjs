// 保存される値の検証
console.log('=== 保存される値の検証 ===\n');

// PET 12μm
const petCostKRW_calc = 10.26 * 2800;
console.log('計算された costKRW:');
console.log('  10.26kg × ₩2,800/kg = ₩', petCostKRW_calc.toLocaleString());

// film-cost-calculator.ts line 644
const costKRW_saved = Math.round(petCostKRW_calc);
console.log('\n保存される値 (line 644):');
console.log('  costKRW: Math.round(cost) =', costKRW_saved);

// film-cost-calculator.ts line 645
const EXCHANGE_RATE = 0.12;
const costJPY_saved = Math.round(petCostKRW_calc * EXCHANGE_RATE);
console.log('  costJPY: Math.round(cost × 0.12) =', costJPY_saved);

console.log('\n=== 問題 ===');
console.log('期待額: ₩', petCostKRW_calc.toLocaleString());
console.log('実際の保存値:');
console.log('  costKRW:', costKRW_saved, '(ウォン)');
console.log('  costJPY:', costJPY_saved, '(円)');

console.log('\n=== 表示額との対応 ===');
console.log('もし m.costJPY (円) をウォンとして表示すると:');
console.log('  ', costJPY_saved, '→ 表示額 ₩29 になる（誤り）');
console.log('\n正しくは m.costKRW (ウォン) を表示する必要があります');
