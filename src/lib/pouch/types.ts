/**
 * Pouch Cost Calculator Type Definitions
 */

import type { FilmStructureLayer } from '../film-cost-calculator';

// ========================================
// タイプ定義
// ========================================
/**
 * パウチ寸法
 */
export interface PouchDimensions {
  width: number;  // mm (横幅) - パウチのピッチ（進行方向）
  height: number; // mm (縦/高さ)
  depth?: number; // mm (マチ/底)
}

/**
 * 経済的生産数量提案
 */
export interface EconomicQuantitySuggestion {
  // 注文数量
  orderQuantity: number;

  // 最小発注量（500m + 400mロス）
  minimumOrderQuantity: number;
  minimumFilmUsage: number; // m

  // フィルム長あたり生産可能数
  pouchesPerMeter: number;

  // 経済的生産数量（フィルム効率100%基準）
  economicQuantity: number;
  economicFilmUsage: number; // m

  // 効率改善率
  efficiencyImprovement: number; // %

  // コスト比較
  unitCostAtOrderQty: number; // 円/個
  unitCostAtEconomicQty: number; // 円/個
  costSavings: number; // 円
  costSavingsRate: number; // %

  // 最適な提案
  recommendedQuantity: number;
  recommendationReason: string;

  // マルチロール並列生産オプション（roll_film, t_shape, m_shape専用）
  parallelProductionOptions?: ParallelProductionOption[];
}

/**
 * 並列生産オプション（顧客への具体的な提案）
 */
export interface ParallelProductionOption {
  optionNumber: number;                  // オプション番号
  quantity: number;                      // 注文数量（例: 2個、3個）
  materialWidth: 590 | 760 | 780 | 1190; // 使用原反幅（クラフト材料: 780/1190mm）
  parallelCount: number;                 // 並列本数
  filmWidthUtilization: number;          // フィルム幅利用率（%）
  estimatedUnitCost: number;             // 見積単価（円/m または 円/個）
  savingsRate: number;                   // 節減率（%）
  isRecommended: boolean;                // 推奨オプションかどうか
  reason: string;                        // 推奨理由
}

/**
 * SKU原価計算パラメータ
 */
export interface SKUCostParams {
  skuQuantities: number[];      // 各SKUの数量 [500, 500]
  dimensions: PouchDimensions;
  materialId: string;
  thicknessSelection: string;
  pouchType: string;
  materialWidth?: number; // 再料幅 (540 or 740mm)
  filmLayers?: FilmStructureLayer[]; // フィルム構造レイヤー
  postProcessingOptions?: string[]; // 後加工オプション（ジッパーなど）
  markupRate?: number; // 顧客別マークアップ率（デフォルト0.0=調整なし・判断2）
  // スパウトパウチ専用パラメータ
  spoutSize?: 9 | 15 | 18 | 22 | 28; // スパウトサイズ（パイ径）
  spoutPosition?: 'top-left' | 'top-center' | 'top-right'; // スパウト位置
}

/**
 * パウチ加工設定（DB から一括プリロード — getSetting の同期参照を可能にする）
 */
export interface PouchProcessingSettings {
  exchangeRate: number;
  boxWeightKg: number;
  outsourcingShipping: number;
  spoutRoundTripShipping: number;
  spoutMinQuantity: number;
  spoutPrices: Record<number, number>;
  coefficients: Record<string, number>;
  minimumPrices: Record<string, number>;
  zipperSurcharges: Record<string, number>;
}

/**
 * SKU別原価内訳
 */
export interface SKUCostBreakdown {
  materialCost: number;      // 材料費 (円)
  printingCost: number;      // 印刷費 (円)
  laminationCost: number;    // ラミネート費 (円)
  slitterCost: number;       // スリッター費 (円)
  surfaceTreatmentCost: number; // 表面処理費 (円) - glossy 等
  pouchProcessingCost: number; // 袋加工費 (円)
  duty: number;              // 関税 (円)
  delivery: number;          // 配送料 (円)
  manufacturingMargin?: number; // 제조 마진 (円)
  salesMargin?: number;      // 판매 마진 (円)
  totalCost: number;         // 総原価 (円) = 최종 판매가
  // === G002: 누락 항목 표시용 DB 기반 실제값 (선택적, 과거 견적은 undefined) ===
  exchangeRate?: number;              // 적용된 환율 (KRW→JPY)
  manufacturerMarginRate?: number;    // 적용된 제조 마진율
  spoutPriceKRW?: number;             // 스파웃 단가 (원/개)
  spoutQuantity?: number;             // 스파웃 적용 수량
  spoutCostKRW?: number;              // 스파웃 부품비 (원)
  spoutRoundTripShippingKRW?: number; // 스파웃 왕복 배송료 (원)
  outsourcingShippingKRW?: number;    // 외주 가공 배송료 (원)
  materialMarkupRate?: number;        // 원단 인상률 (예: 0.10)
  laminationUnitPriceKRW?: number;    // 라미 단가 (원/m)
  laminationCycles?: number;          // 라미 회수
  hasALMaterial?: boolean;            // AL 유무 (라미 단가 분기용)
  slitterUnitPriceKRW?: number;       // 슬리터 단가 (원/m)
  slitterMinCostKRW?: number;         // 슬리터 최소 비용 (원)
  boxWeightKg?: number;               // 골판지 박스 중량 (kg)
  deliveryBoxes?: number;             // 배송 박스수
}

/**
 * SKU別原価計算結果
 */
export interface SKUCostResult {
  totalCostJPY: number;
  costPerSKU: {
    skuIndex: number;
    quantity: number;
    theoreticalMeters: number;
    securedMeters: number;
    lossMeters: number;
    totalMeters: number; // 確保量（ロスなし）
    costJPY: number;
    costBreakdown: SKUCostBreakdown;
    deliveryWeight: number; // 配送重量（kg）
  }[];
  summary: {
    totalSecuredMeters: number; // 総確保量（各SKUの合計）
    lossMeters: number;        // ロス（400m固定）
    totalWithLossMeters: number; // 総フィルム量（確保量 + ロス）
    totalWeight: number;
    deliveryBoxes: number;
    intlShippingJPY?: number;  // 韓国→日本 国際配送費（円）— 発注メールの原価計算で国内配送を除外するため分離
    domesticShippingJPY?: number; // 日本国内配送費（円、1,600円/箱）
  };
  // 필름 폭 계산 정보
  calculatedFilmWidth?: number;  // 計算されたフィルム幅
  materialWidth?: number;       // 原反幅
  filmCostResult?: any;          // フィルム原価詳細（管理者UI表示用）
}

/**
 * SKU分割オプション
 */
export interface SKUSplitOption {
  skuCount: number;
  quantityPerSKU: number;
  totalQuantity: number;
  description: string;
}

// ========================================
// 定数定義
// ========================================

/**
 * 材料に基づくロス量を計算
 * ALを含む場合は400m、KRAFTを含む場合は700m、その他は300m
 */
function getLossMeters(layers: FilmStructureLayer[]): number {
  const hasAL = layers.some(layer => layer.materialId === 'AL');
  const hasKraft = layers.some(layer => layer.materialId === 'KRAFT');

  if (hasAL) {
    return 400; // AL材料の場合は400m
  }
  if (hasKraft) {
    return 700; // KRAFT材料の場合は700m
  }
  return 300; // その他材料の場合は300m
}

// ========================================
// SKU原価計算クラス
// ========================================
