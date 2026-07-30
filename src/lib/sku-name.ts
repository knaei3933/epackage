/**
 * SKU 名（スナップショット）の構築ヘルパー。
 *
 * 従来 data-receipt GET でインライン実装されていた sku_name 文字列を一元化。
 * 仕様（変更時は全呼び出し元へ波及すること）:
 *   形式 = SKU番号_製品名_数量_サイズ
 *   例  : SKU1_三方シール平袋_5000枚_100×120
 *
 * - SKU番号: product_name の "SKU N" から抽出（無ければ 1）
 * - 製品名 : specifications.bagTypeId → 日本語袋タイプ名。無ければ product_name の先頭語
 * - サイズ : width×height（depth>0 なら追加・sideWidth があれば「×側面N」追加）
 *
 * 背景: Phase 4 SKU migration で files/design_revisions の sku_name snapshot 列を追加したが、
 * order_items.sku_name を保存する処理が不在だったため全行 null になっていた（trigger 連鎖が不発）。
 * 本ヘルパーで計算値を order_items.sku_name に保存すると、trigger が snapshot へ伝播する。
 */

// bagTypeId → 日本語袋タイプ名マップ（data-receipt GET 旧実装と完全一致）
const BAG_TYPE_JA: Record<string, string> = {
  flat_3_side: '三方シール平袋',
  three_side_seal: '三方シール平袋',
  stand_up: 'スタンドパウチ',
  standup_pouch: 'スタンドパウチ',
  gusset_pouch: 'ガゼットパウチ',
  zipper_pouch: 'ジッパーパウチ',
  spout_pouch: 'スパウトパウチ',
  roll_film: 'ロールフィルム',
  lap_seal: '合掌袋',
};

export interface SkuNameItem {
  product_name?: string | null;
  quantity: number;
  specifications?: Record<string, unknown> | null;
}

/**
 * order_item から sku_name 文字列を構築する。
 * data-receipt GET 旧インライン実装（L1023-1051）と完全一致。
 */
export function buildSkuName(item: SkuNameItem): string {
  const productNameRaw = item.product_name ?? '';

  // SKU番号: product_name の "SKU N" から抽出（無ければ 1）
  const skuMatch = productNameRaw.match(/SKU\s*(\d+)/i);
  const skuNumber = skuMatch ? skuMatch[1] : '1';

  // 製品名: bagTypeId → 日本語袋タイプ名。無ければ product_name の先頭語（'製品' フォールバック）
  const specs = item.specifications ?? {};
  const bagTypeId = specs.bagTypeId as string | undefined;
  const productLabel =
    (bagTypeId && BAG_TYPE_JA[bagTypeId]) ||
    (productNameRaw || '製品').split(/\s+-|\s+[(（]SKU/i)[0].trim();

  // サイズ: width×height（depth>0 なら追加・sideWidth があれば「×側面N」追加）
  const width = (specs.width as string | number | undefined) ?? '';
  const height = (specs.height as string | number | undefined) ?? '';
  const depth = specs.depth as number | undefined;
  const sideWidth = specs.sideWidth as string | number | undefined;
  let sizeLabel = '';
  if (width && height) {
    sizeLabel = `${width}×${height}`;
    if (depth && Number(depth) > 0) sizeLabel += `×${depth}`;
    if (sideWidth) sizeLabel += `×側面${sideWidth}`;
  }

  return `SKU${skuNumber}_${productLabel}_${item.quantity.toLocaleString()}枚${sizeLabel ? `_${sizeLabel}` : ''}`;
}
