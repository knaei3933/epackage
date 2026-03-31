// 現在のコードの計算式をシミュレート
console.log('=== 現在のコードの計算式 ===\n');

// 修正後の計算式
const thicknessM = 90 / 1000000; // μm → m (LLDPE 90μm)
const widthM = 0.59; // m
const lengthWithLoss = 1050; // m (ロス込み)
const density = 0.92; // LLDPE比重

const weight = thicknessM * widthM * lengthWithLoss * density * 1000;

console.log('LLDPE 90μm 計算（修正後のコード）:');
console.log('  thicknessM =', thicknessM, 'm');
console.log('  widthM =', widthM, 'm');
console.log('  lengthWithLoss =', lengthWithLoss, 'm');
console.log('  density =', density);
console.log('  weight =', thicknessM, '×', widthM, '×', lengthWithLoss, '×', density, '× 1000');
console.log('  weight =', weight.toFixed(2), 'kg');
console.log('  表示値:', 51.29, 'kg');
console.log('\n✓ 計算式は正しいです！');

// 問題: lengthWithLoss = 1050m が大きすぎる
console.log('\n=== 問題分析 ===');
console.log('lengthWithLoss = 1050m は、理論メートル数が約', (1050 / 1.3).toFixed(0), 'm です');
console.log('これはパウチサイズが非常に大きいか、数量が非常に多い場合です。');

// 通常のパウチ（130×130mm、1000個）の場合
const pitchM = 0.13; // 130mm
const theoreticalMeters = 1000 / (1000 / pitchM);
const lengthWithLossNormal = theoreticalMeters * 1.3;
const weightNormal = thicknessM * widthM * lengthWithLossNormal * density * 1000;

console.log('\n通常のパウチ（130×130mm、1000個）の場合:');
console.log('  理論メートル数 =', theoreticalMeters.toFixed(1), 'm');
console.log('  lengthWithLoss =', lengthWithLossNormal.toFixed(1), 'm');
console.log('  重量 =', weightNormal.toFixed(2), 'kg');
