// 価格計算の完全な分析
// SKU数量ページ: 177,500円 vs 最終ページ: 133,200円

console.log('=== 価格計算の完全な分析 ===\n');

// 基本データ
const skuPagePrice = 177500;
const finalPagePrice = 133200;
const diff = skuPagePrice - finalPagePrice;
const ratio = finalPagePrice / skuPagePrice;

console.log('SKU数量ページ:', skuPagePrice.toLocaleString(), '円');
console.log('最終ページ:', finalPagePrice.toLocaleString(), '円');
console.log('価格差:', diff.toLocaleString(), '円');
console.log('割合:', (ratio * 100).toFixed(1) + '%\n');

// markupRateの分析
console.log('=== markupRateの影響分析 ===');

// もし両方ともmarkupRate=0.0で、配送料だけが違う場合：
// 配送料は箱数に基づいて計算される
const deliveryPerBoxJPY = 127980 * 0.12; // 15,357.6円/箱

// 箱数の違いによる価格差を計算
const boxCountDiff = diff / deliveryPerBoxJPY;
console.log('配送料1箱あたり:', Math.round(deliveryPerBoxJPY).toLocaleString(), '円');
console.log('価格差が箱数の違いによる場合:', boxCountDiff.toFixed(1), '箱分の違い\n');

// SKU追加料金の分析
console.log('=== SKU追加料金の分析 ===');
const skuSurchargePerUnit = 10000; // 1 SKU追加あたり10,000円
const skuCountDiff = diff / skuSurchargePerUnit;
console.log('SKU追加料金1つあたり:', skuSurchargePerUnit.toLocaleString(), '円');
console.log('価格差がSKU追加料金による場合:', skuCountDiff.toFixed(1), '個分の違い\n');

// 2列生産オプションの分析
console.log('=== 2列生産オプションの分析 ===');
// 2列生産の場合、フィルム使用量が減り、価格が下がる可能性がある
const twoColumnDiscount = diff / skuPagePrice;
console.log('2列生産による割引率:', (twoColumnDiscount * 100).toFixed(1) + '%\n');

// 結論
console.log('=== 結論 ===');
console.log('価格差の主な原因は以下のいずれかです：');
console.log('1. SKU追加料金の計算違い');
console.log('2. 配送料（箱数）の計算違い');
console.log('3. 2列生産オプションの適用違い');
console.log('4. markupRateの取得タイミングの違い');
console.log('\nデプロイ後、ブラウザのコンソールログを確認して');
console.log('実際のmarkupRateと計算パラメータを確認してください。');
