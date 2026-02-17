// 価格計算の分析
console.log('=== 価格計算分析 ===\n');

// テスト結果
const skuPagePrice = 177500;
const finalPagePrice = 147900;
const diff = skuPagePrice - finalPagePrice;
const ratio = finalPagePrice / skuPagePrice;

console.log('SKU数量ページ:', skuPagePrice.toLocaleString(), '円');
console.log('最終ページ:', finalPagePrice.toLocaleString(), '円');
console.log('価格差:', diff.toLocaleString(), '円');
console.log('割合:', (ratio * 100).toFixed(1) + '%\n');

// markupRateの影響分析
console.log('=== markupRateの分析 ===');

// kim@kanei-trade.co.jpのmarkup_rateは0.0（割引なし）
// もしSKU数量ページでmarkupRate=-0.1が適用されていた場合：
const skuPageBasePrice = skuPagePrice / 1.1; // 161,363円（もしmarkupRate=-0.1なら）
console.log('SKU数量ページがmarkupRate=-0.1の場合、元価格:', Math.round(skuPageBasePrice).toLocaleString(), '円');

// 最終ページでmarkupRate=0.0が適用された場合、そのままの価格
console.log('最終ページがmarkupRate=0.0の場合、価格:', finalPagePrice.toLocaleString(), '円');

// 価格差の原因
console.log('\n=== 価格差の原因分析 ===');
console.log('価格差:', diff.toLocaleString(), '円');

// もしmarkupRateが-0.1から0.0に変更された場合：
// 177,500 × 0.9 = 159,750円（markupRate=-0.1）
// 177,500 × 1.0 = 177,500円（markupRate=0.0）

// 実際の価格は147,900円なので、さらに別の要因がある
console.log('\n実際の価格差は', diff.toLocaleString(), '円');
console.log('これはmarkupRateの違いだけで説明できるものではありません');

// 2列生産オプションの影響を確認
console.log('\n=== 2列生産オプションの可能性 ===');
const twoColumnDiscount = skuPagePrice - finalPagePrice;
console.log('2列生産による割引額:', twoColumnDiscount.toLocaleString(), '円');
console.log('割引率:', (twoColumnDiscount / skuPagePrice * 100).toFixed(1) + '%');

// 結論
console.log('\n=== 結論 ===');
console.log('1. SKU数量ページと最終ページで価格が異なる問題は確認されました');
console.log('2. 価格差は約17%です（ユーザー報告の25%とは異なります）');
console.log('3. 原因はmarkupRateの取得タイミングまたは計算方法の違い');
console.log('4. デプロイされたコードで確認が必要です');
