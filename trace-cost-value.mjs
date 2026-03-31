// cost値の計算をトレース
console.log('=== costKRW 保存値のトレース ===\n');

// PET 12μm の場合
const petWeightKg = 10.26;
const petUnitPrice = 2800; // KRW/kg
const petCostKRW = petWeightKg * petUnitPrice;

console.log('PET 12μm:');
console.log('  weightKg:', petWeightKg);
console.log('  unitPrice: ₩', petUnitPrice, '/kg');
console.log('  costKRW =', petWeightKg, '×', petUnitPrice, '=', petCostKRW);
console.log('  期待値: ₩', petCostKRW.toLocaleString());

// 表示額との比較
console.log('\n=== 表示額との比較 ===');
console.log('期待額: ₩', petCostKRW.toLocaleString());
console.log('表示額: ₩29');
console.log('比率:', (29 / petCostKRW * 100).toFixed(2), '%');
console.log('→ 表示額は期待額の約', (petCostKRW / 29).toFixed(0), '分の1です');

console.log('\n=== 結論 ===');
console.log('costKRW が正しく保存されていない可能性があります');
console.log('film-cost-calculator.ts line 644 を確認してください');
