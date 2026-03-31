// 金額計算を検証
console.log('=== 金額計算検証 ===\n');

// PET 12μm
const petWeight = 10.26; // kg
const petPrice = 2800; // KRW/kg
const petCost = petWeight * petPrice;

console.log('PET 12μm:');
console.log('  重量:', petWeight, 'kg');
console.log('  単価: ₩', petPrice, '/kg');
console.log('  計算:', petWeight, '×', petPrice, '=', petCost.toLocaleString());
console.log('  期待額: ₩', petCost.toLocaleString());
console.log('  表示額: ₩267 または ₩83 または ₩25');
console.log('  ✗ 期待額と一致しません！');

// 正しい計算
console.log('\n=== 正しい金額 ===');
console.log('PET 12μm: 10.26kg × ₩2,800/kg = ₩' + (petCost).toLocaleString());
console.log('アルミ 7μm: 11.71kg × ₩7,800/kg = ₩' + (11.71 * 7800).toLocaleString());
console.log('LLDPE 90μm: 51.29kg × ₩2,800/kg = ₩' + (51.29 * 2800).toLocaleString());

console.log('\n=== 問題 ===');
console.log('表示額が期待額の約1/100になっています');
console.log('costKRW の計算で / 0.12 などの変換がされている可能性があります');
