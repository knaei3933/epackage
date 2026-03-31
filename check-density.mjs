// densityの単位を確認
console.log('=== density の単位確認 ===\n');

// FILM_MATERIALSの定義
const materials = {
  PET: { density: 1.40, name: 'PET' },
  AL: { density: 2.71, name: 'Aluminum' },
  LLDPE: { density: 0.92, name: 'LLDPE' }
};

console.log('FILM_MATERIALSのdensity値:');
for (const [key, val] of Object.entries(materials)) {
  console.log(`  ${val.name}: density = ${val.density}`);
  console.log(`    → これは比重（無次元）です`);
  console.log(`    → kg/m³に変換: ${val.density} × 1000 = ${val.density * 1000} kg/m³`);
}

console.log('\n=== 正しい重量計算式 ===');
const thicknessM = 90 / 1000000; // LLDPE 90μm → m
const widthM = 0.59;
const lengthWithLoss = 1050;
const density = materials.LLDPE.density; // 0.92 (比重)

// 方法1: 比重を使用
const weight1 = thicknessM * widthM * lengthWithLoss * density * 1000;
console.log('\n方法1: 比重 × 1000');
console.log('  weight =', thicknessM, '×', widthM, '×', lengthWithLoss, '×', density, '× 1000');
console.log('  weight =', weight1.toFixed(2), 'kg');

// 方法2: kg/m³に変換
const densityKgPerM3 = density * 1000;
const weight2 = thicknessM * widthM * lengthWithLoss * densityKgPerM3;
console.log('\n方法2: kg/m³に変換');
console.log('  densityKgPerM3 =', densityKgPerM3, 'kg/m³');
console.log('  weight =', thicknessM, '×', widthM, '×', lengthWithLoss, '×', densityKgPerM3);
console.log('  weight =', weight2.toFixed(2), 'kg');

console.log('\n✓ 両方の結果は同じです');
