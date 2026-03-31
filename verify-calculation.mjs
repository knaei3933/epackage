// 計算検証スクリプト
console.log('=== 重量計算検証 ===\n');

// PET 12μm の計算
const thicknessM = 12 / 1000000; // μm → m
const widthM = 0.59; // m
const lengthWithLoss = 1050; // m (ロス込み)
const density = 1.40; // 比重

// 修正後の計算式
const weight = thicknessM * widthM * lengthWithLoss * density * 1000; // g → kg

console.log('PET 12μm 計算:');
console.log('  thicknessM =', thicknessM, 'm');
console.log('  widthM =', widthM, 'm');
console.log('  lengthWithLoss =', lengthWithLoss, 'm');
console.log('  density =', density);
console.log('  計算式: thicknessM × widthM × lengthWithLoss × density × 1000');
console.log('  weight =', thicknessM, '×', widthM, '×', lengthWithLoss, '×', density, '× 1000');
console.log('  weight =', weight.toFixed(2), 'kg');
console.log('\n期待値: ~10.42kg');

// アルミ 7μm
const alThicknessM = 7 / 1000000;
const alDensity = 2.71;
const alWeight = alThicknessM * widthM * lengthWithLoss * alDensity * 1000;

console.log('\nアルミ 7μm 計算:');
console.log('  weight =', alWeight.toFixed(2), 'kg');
console.log('  期待値: ~8.47kg');

// LLDPE 45μm
const lldpeThicknessM = 45 / 1000000;
const lldpeDensity = 0.92;
const lldpeWeight = lldpeThicknessM * widthM * lengthWithLoss * lldpeDensity * 1000;

console.log('\nLLDPE 45μm 計算:');
console.log('  weight =', lldpeWeight.toFixed(2), 'kg');
console.log('  期待値: ~2.59kg');

console.log('\n=== 検証完了 ===');
