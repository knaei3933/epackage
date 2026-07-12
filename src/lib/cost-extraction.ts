/**
 * cost-extraction.ts
 * 管理者用 原価抽出ヘルパー（リスト/詳細 共通）
 *
 * cost_breakdown の意味ブレを吸収し、常に「仕入原価（manufacturerCost）」と
 * 「販売価格（sellPrice）」を正確に分離して返す。
 *
 * manufacturerCost = materialCost + printingCost + laminationCost + slitterCost
 *                   + surfaceTreatmentCost + pouchProcessingCost + manufacturingMargin
 * sellPrice = cb.sellPrice ?? item.total_price ?? cb.totalCost (legacy fallback)
 */

export interface CostBreakdownLike {
  materialCost?: number;
  printingCost?: number;
  laminationCost?: number;
  slitterCost?: number;
  surfaceTreatmentCost?: number;
  pouchProcessingCost?: number;
  manufacturingMargin?: number;
  duty?: number;
  delivery?: number;
  salesMargin?: number;
  totalCost?: number;
  sellPrice?: number;
}

export interface QuotationItemLike {
  quantity?: number;
  unit_price?: number;
  total_price?: number;
  cost_breakdown?: CostBreakdownLike;
  specifications?: {
    cost_breakdown?: CostBreakdownLike;
  };
  breakdown?: {
    breakdown?: CostBreakdownLike;
  };
}

export interface ExtractedCostData {
  /** 仕入原価（製造業者価格 = components sum, duty/delivery/salesMargin 除外） */
  manufacturerCost: number;
  /** 総仕入原価（duty + delivery 含む、オプション表示用） */
  procurementCost: number;
  /** 販売価格（税抜） */
  sellPrice: number;
  /** 単価（manufacturerCost / quantity） */
  unitCost: number;
  /** 利益率 = (sellPrice - manufacturerCost) / sellPrice * 100 */
  margin: number;
  /** 有効な原価データがあるか */
  hasData: boolean;
  /** データソース（デバッグ・監査用） */
  source: 'components' | 'totalCost' | 'none';
}

const COST_COMPONENT_KEYS: (keyof CostBreakdownLike)[] = [
  'materialCost',
  'printingCost',
  'laminationCost',
  'slitterCost',
  'surfaceTreatmentCost',
  'pouchProcessingCost',
  'manufacturingMargin',
];

/**
 * cost_breakdown から原価コンポーネントの合計を計算
 */
function sumManufacturerComponents(cb: CostBreakdownLike): number {
  return COST_COMPONENT_KEYS.reduce((sum, key) => sum + (cb[key] ?? 0), 0);
}

/**
 * 全コスト項目（duty/delivery/salesMargin 含む）の合計
 */
function sumAllCostComponents(cb: CostBreakdownLike): number {
  const allKeys: (keyof CostBreakdownLike)[] = [
    ...COST_COMPONENT_KEYS,
    'duty',
    'delivery',
    'salesMargin',
  ];
  return allKeys.reduce((sum, key) => sum + (cb[key] ?? 0), 0);
}

/**
 * item から cost_breakdown を抽出（複数の格納場所を確認）
 */
export function getCostBreakdown(item: QuotationItemLike): CostBreakdownLike | null {
  const specs = item.specifications || {};
  const cb =
    item.breakdown?.breakdown ||
    specs.cost_breakdown ||
    item.cost_breakdown ||
    null;
  return cb;
}

/**
 * 管理者表示用の原価データを抽出する（リスト/詳細 共通）
 *
 * 優先順位:
 * 1. component-sum: materialCost + printingCost + ... + manufacturingMargin（最も正確）
 * 2. totalCost: sellPrice が分離済みなら totalCost を manufacturerCost として使用
 * 3. none: データ不足
 *
 * @param item - quotation_item（specifications.cost_breakdown, cost_breakdown, breakdown.breakdown のいずれかを保持）
 * @param subtotalExclTax - 税抜小計（利益率計算用、省略時は sellPrice から推定）
 */
export function extractCostData(
  item: QuotationItemLike,
  subtotalExclTax?: number
): ExtractedCostData {
  const cb = getCostBreakdown(item);
  const quantity = item.quantity && item.quantity > 0 ? item.quantity : 1;

  // 販売価格の決定: sellPrice > total_price > legacy totalCost
  const sellPrice =
    cb?.sellPrice ??
    item.total_price ??
    0;

  if (!cb) {
    return {
      manufacturerCost: 0,
      procurementCost: 0,
      sellPrice,
      unitCost: 0,
      margin: sellPrice > 0 ? 100 : 0,
      hasData: false,
      source: 'none',
    };
  }

  // Strategy 1: component-sum（最も正確 — 分岐に関係なく各項目は正しい原価値）
  const componentSum = sumManufacturerComponents(cb);

  if (componentSum > 0) {
    const procurementCost = componentSum + (cb.duty ?? 0) + (cb.delivery ?? 0);
    const marginBase = subtotalExclTax ?? sellPrice;
    const margin =
      marginBase > 0
        ? ((marginBase - componentSum) / marginBase) * 100
        : 0;
    return {
      manufacturerCost: Math.round(componentSum),
      procurementCost: Math.round(procurementCost),
      sellPrice,
      unitCost: Math.round(componentSum / quantity),
      margin: Math.round(margin * 10) / 10,
      hasData: true,
      source: 'components',
    };
  }

  // Strategy 2: totalCost を使用
  // - 新スキマ: totalCost = manufacturerCost, sellPrice あり
  // - legacy SKU: totalCost = sell price, sellPrice なし → component なしでここに来る
  //   この場合 totalCost は売価なので原価として不適切 → duty/delivery/salesMargin を引いて逆算
  if (cb.totalCost && cb.totalCost > 0) {
    const hasSellPriceField = cb.sellPrice !== undefined && cb.sellPrice !== null;

    if (hasSellPriceField) {
      // 新スキマ: totalCost は既に manufacturerCost
      const procurementCost = cb.totalCost + (cb.duty ?? 0) + (cb.delivery ?? 0);
      const marginBase = subtotalExclTax ?? sellPrice;
      const margin =
        marginBase > 0
          ? ((marginBase - cb.totalCost) / marginBase) * 100
          : 0;
      return {
        manufacturerCost: Math.round(cb.totalCost),
        procurementCost: Math.round(procurementCost),
        sellPrice,
        unitCost: Math.round(cb.totalCost / quantity),
        margin: Math.round(margin * 10) / 10,
        hasData: true,
        source: 'totalCost',
      };
    }

    // legacy: totalCost は売価（全マージン含む）
    // 全項目合計が totalCost に近ければ、totalCost = 売価として扱う
    const allComponentSum = sumAllCostComponents(cb);
    if (allComponentSum > 0 && Math.abs(allComponentSum - cb.totalCost) < cb.totalCost * 0.1) {
      // コンポーネント合計 ≈ totalCost → 全項目が原価として格納されている
      // manufacturingMargin まで含む = manufacturerCost
      const manufacturerCost =
        (cb.materialCost ?? 0) +
        (cb.printingCost ?? 0) +
        (cb.laminationCost ?? 0) +
        (cb.slitterCost ?? 0) +
        (cb.surfaceTreatmentCost ?? 0) +
        (cb.pouchProcessingCost ?? 0) +
        (cb.manufacturingMargin ?? 0);
      const marginBase = subtotalExclTax ?? sellPrice;
      const margin =
        marginBase > 0 && manufacturerCost > 0
          ? ((marginBase - manufacturerCost) / marginBase) * 100
          : 0;
      return {
        manufacturerCost: Math.round(manufacturerCost),
        procurementCost: Math.round(allComponentSum),
        sellPrice: sellPrice > 0 ? sellPrice : cb.totalCost,
        unitCost: Math.round(manufacturerCost / quantity),
        margin: Math.round(margin * 10) / 10,
        hasData: true,
        source: 'totalCost',
      };
    }

    // 真に component が無い legacy レコード: totalCost を売価として扱い、
    // マージン情報がないので manufacturerCost を推定不可
    // → totalCost を sellPrice として扱い、原価は不明（0）
    const finalSellPrice = sellPrice > 0 ? sellPrice : cb.totalCost;
    return {
      manufacturerCost: 0,
      procurementCost: 0,
      sellPrice: finalSellPrice,
      unitCost: 0,
      margin: 100,
      hasData: false,
      source: 'none',
    };
  }

  return {
    manufacturerCost: 0,
    procurementCost: 0,
    sellPrice,
    unitCost: 0,
    margin: sellPrice > 0 ? 100 : 0,
    hasData: false,
    source: 'none',
  };
}

/**
 * 複数アイテムの集計（リスト表示用）
 */
export function extractCostDataForQuotation(
  items: QuotationItemLike[],
  subtotalExclTax?: number
): { totalManufacturerCost: number; totalSellPrice: number; totalMargin: number } {
  let totalManufacturerCost = 0;
  let totalSellPrice = 0;

  for (const item of items) {
    const data = extractCostData(item);
    totalManufacturerCost += data.manufacturerCost;
    totalSellPrice += data.sellPrice;
  }

  const marginBase = subtotalExclTax ?? totalSellPrice;
  const totalMargin =
    marginBase > 0
      ? Math.round(((marginBase - totalManufacturerCost) / marginBase) * 1000) / 10
      : 0;

  return {
    totalManufacturerCost,
    totalSellPrice,
    totalMargin,
  };
}
