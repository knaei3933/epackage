import { unifiedPricingEngine } from '../src/lib/unified-pricing-engine';
import { getDefaultLayers } from '../src/lib/common/film-calculations';

/**
 * 検証スクリプト: スパウトパウチのコスト計算が正しく動作することを確認
 *
 * 期待される結果 (15mmスパウト):
 * - スパウト単価: 80 KRW
 * - スパウト加工費: (80 × 5000) + 150000 = 550,000 KRW
 * - 円貨換算: 550,000 × 0.12 = 66,000 JPY
 *
 * 期待される結果 (18mmスパウト):
 * - スパウト単価: 110 KRW
 * - スパウト加工費: (110 × 5000) + 150000 = 700,000 KRW
 * - 円貨換算: 700,000 × 0.12 = 84,000 JPY
 */

async function verifySpoutCalculation() {
  console.log('=== スパウトパウチ コスト計算検証 ===\n');

  // Test 1: 15mm spout (current database value)
  console.log('【Test 1】15mm スパウトパウチ (QT20260401-1568)');
  const params15mm = {
    bagTypeId: 'spout_pouch',
    materialId: 'pet_pe',
    quantity: 5000,
    skuQuantities: [5000],
    useSKUCalculation: true,
    width: 130,
    height: 130,
    depth: 30,
    thickness: 80,
    thicknessSelection: 'medium',
    printingColors: 4,
    printingType: 'digital' as const,
    doubleSided: false,
    postProcessingOptions: ['matte'],
    filmLayers: getDefaultLayers('pet_pe', 'medium'),
    useFilmCostCalculation: true,
    markupRate: 0.5,
    lossRate: 0.4,
    spoutSize: 15 as 9 | 15 | 18 | 22 | 28,
    spoutPosition: 'top-center' as const
  };

  const result15mm = await unifiedPricingEngine.calculateQuote(params15mm);
  const processingCost15mm = result15mm.breakdown?.processing || result15mm.breakdown?.pouchProcessingCost || 0;
  const expected15mm = 66000; // 550,000 KRW × 0.12

  console.log('  期待値:', expected15mm, 'JPY (₩550,000)');
  console.log('  実際値:', Math.round(processingCost15mm), 'JPY');
  console.log('  一致:', Math.round(processingCost15mm) === expected15mm ? '✓ YES' : '✗ NO');

  if (Math.round(processingCost15mm) !== expected15mm) {
    console.error('  ❌ 15mmスパウトの計算が間違っています！');
    console.log('  詳細:', {
      breakdown: result15mm.breakdown,
      filmCostDetails: result15mm.filmCostDetails
    });
  }

  console.log('');

  // Test 2: 18mm spout (for comparison)
  console.log('【Test 2】18mm スパウトパウチ (比較用)');
  const params18mm = { ...params15mm, spoutSize: 18 as 9 | 15 | 18 | 22 | 28 };

  const result18mm = await unifiedPricingEngine.calculateQuote(params18mm);
  const processingCost18mm = result18mm.breakdown?.processing || result18mm.breakdown?.pouchProcessingCost || 0;
  const expected18mm = 84000; // 700,000 KRW × 0.12

  console.log('  期待値:', expected18mm, 'JPY (₩700,000)');
  console.log('  実際値:', Math.round(processingCost18mm), 'JPY');
  console.log('  一致:', Math.round(processingCost18mm) === expected18mm ? '✓ YES' : '✗ NO');

  console.log('');
  console.log('=== 結論 ===');

  if (Math.round(processingCost15mm) === expected15mm && Math.round(processingCost18mm) === expected18mm) {
    console.log('✓ すべてのテストがパスしました！');
    console.log('');
    console.log('次の手順:');
    console.log('1. Next.js dev serverを再起動 (npm run dev)');
    console.log('2. ブラウザで管理者ページを開き直す');
    console.log('3. QT20260401-1568を開いて「原価再計算」ボタンをクリック');
    console.log('4. 製袋加工費が₩550,000になっていることを確認');
    process.exit(0);
  } else {
    console.error('✗ テストが失敗しました。コードを修正してください。');
    process.exit(1);
  }
}

verifySpoutCalculation().catch(error => {
  console.error('エラー:', error);
  process.exit(1);
});
