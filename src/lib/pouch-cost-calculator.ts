/**
 * パウチSKU別原価計算エンジン
 *
 * docs/reports/tjfrP/原価計算.md 基づ
 * SKU別の原価計算、ロス400m固定、最小確保量ルールを実装
 */

import { FilmCostCalculator, FilmCostResult, FilmStructureLayer } from './film-cost-calculator';

// ========================================
// タイプ定義
// ========================================

/**
 * 再料IDに基づいてデフォルトフィルムレイヤーを取得
 * QuoteContext.tsxのgetDefaultFilmLayersと同一のロジック
 */
function getDefaultFilmLayers(materialId: string, thicknessSelection: string): FilmStructureLayer[] {
  // thicknessSelectionに基づいてLLDPE厚さを決定
  const thicknessMap: Record<string, number> = {
    'light': 72,    // 80 * 0.9
    'medium': 80,   // 80 * 1.0 (基準)
    'standard': 80, // mediumと同じ
    'heavy': 88,    // 80 * 1.1
    'ultra': 96     // 80 * 1.2
  };

  const lldpeThickness = thicknessMap[thicknessSelection] || 80;

  // 再料IDに基づいてレイヤー構造を定義
  const layerMap: Record<string, (lldpe: number) => FilmStructureLayer[]> = {
    'pet_al_pet': (lldpe: number) => [
      { materialId: 'PET', thickness: 12 },
      { materialId: 'AL', thickness: 7 },
      { materialId: 'PET', thickness: 12 },
      { materialId: 'LLDPE', thickness: lldpe }
    ],
    'pet_ny': (lldpe: number) => [
      { materialId: 'PET', thickness: 12 },
      { materialId: 'NY', thickness: 15 },
      { materialId: 'PET', thickness: 12 },
      { materialId: 'LLDPE', thickness: lldpe }
    ],
    'pet_ny_al': (lldpe: number) => [
      { materialId: 'PET', thickness: 12 },
      { materialId: 'NY', thickness: 16 },
      { materialId: 'AL', thickness: 7 },
      { materialId: 'LLDPE', thickness: lldpe }
    ],
    'pet_ldpe': (lldpe: number) => [
      { materialId: 'PET', thickness: 12 },
      { materialId: 'LLDPE', thickness: lldpe }
    ],
    'kp_pe': () => [
      { materialId: 'KP', thickness: 12 },
      { materialId: 'PE', thickness: 60 }
    ],
    'pet': (lldpe: number) => [
      { materialId: 'PET', thickness: 12 },
      { materialId: 'LLDPE', thickness: lldpe }
    ],
    'pet_al': (lldpe: number) => [
      { materialId: 'PET', thickness: 12 },
      { materialId: 'AL', thickness: 7 },
      { materialId: 'LLDPE', thickness: lldpe }
    ]
  };

  const layersFn = layerMap[materialId] || layerMap['pet_al'];
  return layersFn(lldpeThickness);
}

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
  optionNumber: number;           // オプション番号
  quantity: number;               // 注文数量（例: 2個、3個）
  materialWidth: 590 | 760;       // 使用原反幅
  parallelCount: number;          // 並列本数
  filmWidthUtilization: number;   // フィルム幅利用率（%）
  estimatedUnitCost: number;      // 見積単価（円/m または 円/個）
  savingsRate: number;            // 節減率（%）
  isRecommended: boolean;         // 推奨オプションかどうか
  reason: string;                 // 推奨理由
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
  };
  // 필름 폭 계산 정보
  calculatedFilmWidth: number; // 계산된 필름 폭 (mm)
  materialWidth: 590 | 760; // 선택된 원단 폭 (mm)
}

/**
 * 2列生産オプション（新しい推奨システム用）
 */
export interface TwoColumnProductionOptions {
  sameQuantity: ProductionOptionDetail;
  doubleQuantity: ProductionOptionDetail;
}

/**
 * 生産オプション詳細
 */
export interface ProductionOptionDetail {
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  savingsRate: number;
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

const FIXED_LOSS_METERS = 400; // ロス固定400m

// ========================================
// SKU原価計算クラス
// ========================================

export class PouchCostCalculator {
  private filmCalculator: FilmCostCalculator;

  constructor() {
    this.filmCalculator = new FilmCostCalculator();
  }

  /**
   * 最適な列数を自動決定（パウチは1~2列、ロールフィルムは1~7列）
   *
   * @param pouchType 製品タイプ
   * @param dimensions 寸法
   * @param totalQuantity 総数量
   * @param materialWidth 原反幅
   * @returns 最適列数
   */
  private calculateOptimalColumnCount(
    pouchType: string,
    dimensions: PouchDimensions,
    totalQuantity: number,
    materialWidth: number
  ): number {
    // ========================================
    // ロールフィルムの場合: 1~7列まで対応
    // ========================================
    if (pouchType === 'roll_film') {
      const rollFilmWidth = dimensions.width; // ロール幅（mm）
      const MAX_PRINTABLE_WIDTH = 740; // 760mm原反の印刷可能幅

      // 最大列数計算
      const maxColumns = Math.floor(MAX_PRINTABLE_WIDTH / rollFilmWidth);

      // 数量による条件
      if (totalQuantity < 1000) {
        return 1; // 1000m未満は1列
      }

      // 可能な最大列数を使用（効率極大化）
      return Math.min(maxColumns, 7); // 最大7列
    }

    // ========================================
    // パウチの場合: 1~2列まで対応
    // ========================================
    // 2列フィルム幅計算（2列が可能か確認）
    const filmWidth2Columns = this.calculateFilmWidth(pouchType, dimensions, 2);
    const printableWidth = materialWidth === 590 ? 570 : 740;
    const canUse2Columns = filmWidth2Columns <= printableWidth;

    // 小量生産の場合は1列のみ使用（2列は大量生産時のみ効率的）
    if (totalQuantity < 500) {
      return 1; // 500個未満: 無条件1列（小量生産）
    } else if (totalQuantity < 1000) {
      return 1; // 500~1000個: 1列優先（2列効率が大きくない）
    } else {
      return canUse2Columns ? 2 : 1; // 1000個以上: 2列可能であれば2列使用
    }
  }

  /**
   * SKU別原価計算メインメソッド
   */
  calculateSKUCost(params: SKUCostParams): SKUCostResult {
    const {
      skuQuantities,
      dimensions,
      materialId,
      thicknessSelection,
      pouchType,
      filmLayers,
      postProcessingOptions
    } = params;

    const skuCount = skuQuantities.length;

    // ========================================
    // 原反幅の決定（先に決定する必要がある）
    // ========================================
    // 原反幅自動決定 (パウチ幅/インク印刷幅基準)
    // 590mm原反: 印刷可能幅570mm
    // 760mm原反: 印刷可能幅740mm
    const materialWidth = this.determineMaterialWidth(dimensions.width);
    const printableWidth = materialWidth === 590 ? 570 : 740;

    // ========================================
    // 列数自動判定ロジック（原反幅を考慮）
    // ========================================
    // 最適列数を自動決定（パウチは1~2列、ロールフィルムは1~7列）
    const optimalColumnCount = this.calculateOptimalColumnCount(
      pouchType,
      dimensions,
      skuQuantities.reduce((sum, q) => sum + q, 0),
      materialWidth
    );

    // 最終フィルム幅計算
    const filmWidth = this.calculateFilmWidth(pouchType, dimensions, optimalColumnCount);

    // 全数量の計算（後で使用）
    const totalQuantity = skuQuantities.reduce((sum, q) => sum + q, 0);

    console.log('[Film Width Calculation]', JSON.stringify({
      pouchType,
      dimensions: { width: dimensions.width, height: dimensions.height, depth: dimensions.depth },
      skuCount,
      totalQuantity,
      materialWidth,
      printableWidth: materialWidth === 590 ? 570 : 740,
      optimalColumnCount,
      calculatedFilmWidth: filmWidth,
      note: pouchType === 'roll_film'
        ? `ロールフィルム: ${optimalColumnCount}列並列生産`
        : `パウチ: ${optimalColumnCount}列生産`
    }, null, 2));

    // ========================================
    // 🆕 修正: 全体フィルム原価を先に計算（イン쇄비・ラミ네이션비・슬리터비 중복 계산 방지）
    // ========================================

    // まず各SKUの理論メートル数と確保量を計算（後で使用）
    const theoreticalAndSecuredMeters = skuQuantities.map((quantity) => {
      const theoreticalMeters = this.calculateTheoreticalMeters(quantity, dimensions, pouchType, optimalColumnCount);
      const securedMeters = this.calculateSecuredMeters(theoreticalMeters, skuCount, pouchType);
      return { theoreticalMeters, securedMeters };
    });

    // 全体の確保量を計算
    const totalSecuredMeters = theoreticalAndSecuredMeters.reduce((sum, item) => sum + item.securedMeters, 0);

    // 全体フィルム使用量（ロス込み）
    const totalWithLossMeters = totalSecuredMeters + FIXED_LOSS_METERS;

    console.log('[calculateSKUCost] Total Film Calculation:', {
      totalSecuredMeters,
      lossMeters: FIXED_LOSS_METERS,
      totalWithLossMeters,
      note: '全量を一度に印刷・加工するため、個別計算ではなく合計で計算'
    });

    // 全体フィルム原価計算（530m全体に対して1回のみ計算）
    const totalFilmCostResult = this.calculateFilmCost(
      dimensions,
      totalWithLossMeters, // 全体530mに対して計算
      materialId,
      thicknessSelection,
      materialWidth,
      filmLayers,
      undefined,
      postProcessingOptions
    );

    // フィルム原価の詳細内訳をログ出力
    console.log('[calculateSKUCost] Total Film Cost Breakdown:', {
      materialCost: totalFilmCostResult.materialCost,
      printingCost: totalFilmCostResult.printingCost,
      laminationCost: totalFilmCostResult.laminationCost,
      slitterCost: totalFilmCostResult.slitterCost,
      surfaceTreatmentCost: totalFilmCostResult.surfaceTreatmentCost || 0,
      totalCostKRW: totalFilmCostResult.totalCostKRW,
      meters: totalWithLossMeters,
      materialWidth
    });

    // 全体パウチ加工費計算（固定費用方式）
    // 同一スペックの場合、加工費は1回のみ計算（SKU数に関わらず固定）
    const totalPouchProcessingCostKRW = this.calculatePouchProcessingCost(
      pouchType,
      dimensions.width,
      totalQuantity,  // 全数量に対して1回のみ計算
      postProcessingOptions
    );

    console.log('[calculateSKUCost] Total Processing Cost:', {
      totalQuantity,
      skuCount,
      totalPouchProcessingCostKRW,
      note: '各SKUの固定費用を合算（按分なし）'
    });

    // 各SKUの配分を計算（数量比で按分）
    const costPerSKU = skuQuantities.map((quantity, index) => {
      const quantityRatio = quantity / totalQuantity;

      // 事前計算した理論メートル数と確保量を使用
      const { theoreticalMeters, securedMeters } = theoreticalAndSecuredMeters[index];

      // 配送重量計算
      const defaultPouchLayers: FilmStructureLayer[] = [
        { materialId: 'PET', thickness: 12 },
        { materialId: 'AL', thickness: 7 },
        { materialId: 'PET', thickness: 12 },
        { materialId: 'LLDPE', thickness: 80 }
      ];
      const layersForDelivery = filmLayers || defaultPouchLayers;
      const deliveryWeight = this.calculateDeliveryWeight(
        layersForDelivery,
        materialWidth,
        quantity,
        dimensions
      );

      // フィルム原価を数量比で按分
      const allocatedFilmCost: FilmCostResult = {
        ...totalFilmCostResult,
        totalCostKRW: totalFilmCostResult.totalCostKRW * quantityRatio,
        materialCost: totalFilmCostResult.materialCost * quantityRatio,
        printingCost: totalFilmCostResult.printingCost * quantityRatio,
        laminationCost: totalFilmCostResult.laminationCost * quantityRatio,
        slitterCost: totalFilmCostResult.slitterCost * quantityRatio,
        surfaceTreatmentCost: totalFilmCostResult.surfaceTreatmentCost ? totalFilmCostResult.surfaceTreatmentCost * quantityRatio : 0,
        deliveryCostJPY: 0 // 後で計算
      };

      // パウチ加工費を数量比で按分（全体加工費を各SKUに配分）
      const allocatedPouchProcessingCostKRW = totalPouchProcessingCostKRW * quantityRatio;

      console.log('[calculateSKUCost] SKU', index, 'Allocation:', {
        quantity,
        quantityRatio: (quantityRatio * 100).toFixed(1) + '%',
        allocatedFilmCostKRW: Math.round(allocatedFilmCost.totalCostKRW),
        allocatedPouchProcessingCostKRW: Math.round(allocatedPouchProcessingCostKRW)
      });

      // 配送料は仮計算（後で上書き）
      const costBreakdown = this.calculateCostBreakdown(
        allocatedFilmCost,
        allocatedPouchProcessingCostKRW,
        quantity,
        15358  // デフォルト配送料（後で上書き）
      );

      const costJPY = costBreakdown.totalCost;

      return {
        skuIndex: index,
        quantity,
        theoreticalMeters,
        securedMeters,
        lossMeters: 0,
        totalMeters: securedMeters,
        costJPY,
        costBreakdown,
        deliveryWeight
      };
    });

    // 総配送重量の計算（全SKUの合計）
    const totalDeliveryWeight = costPerSKU.reduce((sum, sku) => sum + (sku.deliveryWeight || 0), 0);

    // 必要な箱数の計算（29kg/箱）
    const BOX_CAPACITY_KG = 29;
    const deliveryBoxes = Math.ceil(totalDeliveryWeight / BOX_CAPACITY_KG);

    // 総配送料の計算（箱数 × 1箱あたりの配送料）
    const DELIVERY_COST_PER_BOX_KRW = 127980;
    const EXCHANGE_RATE = 0.12;
    const totalDeliveryJPY = deliveryBoxes * DELIVERY_COST_PER_BOX_KRW * EXCHANGE_RATE;

    console.log('[calculateSKUCost] Delivery Calculation:', {
      totalDeliveryWeight,
      deliveryBoxes,
      totalDeliveryJPY,
      perBoxCostJPY: DELIVERY_COST_PER_BOX_KRW * EXCHANGE_RATE
    });

    // 各SKUの配送料を再計算（数量比で按分）
    // totalQuantityは既にline 176で定義済み
    const updatedCostPerSKU = costPerSKU.map(sku => {
      // 数量比で配送料を按分
      const deliveryJPY = totalDeliveryJPY * (sku.quantity / totalQuantity);

      // 配送料以外のコストを取得
      const { delivery, totalCost, ...otherBreakdown } = sku.costBreakdown;

      // 新しい配送料で再計算（小数点以下を保持して、unified-pricing-engine.tsで正しく切り上げできるようにする）
      const newCostBreakdown: SKUCostBreakdown = {
        ...otherBreakdown,
        delivery: Math.round(deliveryJPY),
        // 小数点以下を保持: totalCost（小数点以下含む）- delivery + deliveryJPY
        // 例: 168400.646... - 0 + 15358 = 183758.646...
        totalCost: (totalCost - delivery) + deliveryJPY
      };

      return {
        ...sku,
        costBreakdown: newCostBreakdown,
        costJPY: newCostBreakdown.totalCost
      };
    });

    // 集計（更新されたコストを使用）
    const totalCostJPY = updatedCostPerSKU.reduce((sum, sku) => sum + sku.costJPY, 0);

    // 📝 注意: totalSecuredMeters と totalWithLossMeters は既にファイル前方（line 256, 259）で計算済み
    // ロスは400m固定（SKU数に関わらず）
    const lossMeters = FIXED_LOSS_METERS;

    const summary = {
      totalSecuredMeters,
      lossMeters,
      totalWithLossMeters,
      totalWeight: totalDeliveryWeight,
      deliveryBoxes
    };

    return {
      totalCostJPY,
      costPerSKU: updatedCostPerSKU,
      summary,
      calculatedFilmWidth: filmWidth,
      materialWidth
    };
  }

  /**
   * 単一SKUの原価計算
   */
  private calculateSingleSKUCost(
    skuIndex: number,
    quantity: number,
    skuCount: number,
    dimensions: PouchDimensions,
    materialId: string,
    thicknessSelection: string,
    pouchType: string,
    materialWidth: number,
    columnCount: number, // Added param
    filmLayers?: FilmStructureLayer[],
    postProcessingOptions?: string[]
  ): SKUCostResult['costPerSKU'][0] {
    // 1. 理論メートル数計算
    const theoreticalMeters = this.calculateTheoreticalMeters(
      quantity,
      dimensions,
      pouchType,
      columnCount
    );

    // 2. 確保量計算（商品タイプ別ルール適用）
    const securedMeters = this.calculateSecuredMeters(theoreticalMeters, skuCount, pouchType);

    // 3. 各SKUのフィルム原価計算用メートル数（ロス込み）
    // ドキュメント仕様: 各SKUは自分の確保量 + 分配されたロス分を使用
    // 例: 2SKUの場合、各SKUは (自分の確保量 + 200m) を使用
    const totalMetersForCost = securedMeters + (FIXED_LOSS_METERS / skuCount);

    // 4. 集計用メートル数（ロスなし）
    const totalMeters = securedMeters;

    // 4.5. 配送重量計算（パウチ面積基準）
    // filmLayersが未定義の場合はデフォルトの4層構造を使用
    const defaultPouchLayers: FilmStructureLayer[] = [
      { materialId: 'PET', thickness: 12 },
      { materialId: 'AL', thickness: 7 },
      { materialId: 'PET', thickness: 12 },
      { materialId: 'LLDPE', thickness: 80 }
    ];
    const layersForDelivery = filmLayers || defaultPouchLayers;
    const deliveryWeight = this.calculateDeliveryWeight(
      layersForDelivery,
      materialWidth,
      quantity,
      dimensions
    );

    console.log('[calculateSingleSKUCost] Delivery Weight:', {
      deliveryWeight,
      quantity,
      pouchType
    });

    // 5. フィルム原価計算（ロス込みメートル数を使用）
    // DEBUG: 渡されるパラメータをログ
    console.log('[calculateSingleSKUCost] Before calculateFilmCost:', {
      theoreticalMeters,
      securedMeters,
      totalMetersForCost,
      materialWidth,
      skuCount,
      dimensions: { width: dimensions.width, height: dimensions.height, depth: dimensions.depth }
    });

    const filmCostResult = this.calculateFilmCost(
      dimensions,
      totalMetersForCost, // Secured + Loss per SKU
      materialId,
      thicknessSelection,
      materialWidth,
      filmLayers,
      undefined, // deliveryWeight (Auto calc)
      postProcessingOptions
    );

    // 6. 袋加工費計算
    const pouchProcessingCost = this.calculatePouchProcessingCost(
      pouchType,
      dimensions.width,
      quantity,
      postProcessingOptions
    );

    // 7. 原価内訳集計 (KRW 기준으로 엄격한 마진 및 관세 계산)
    // デフォルトは1箱分の配送料（calculateSKUCostメソッドで後で上書き）
    const costBreakdown = this.calculateCostBreakdown(
      filmCostResult,
      pouchProcessingCost, // KRW
      quantity,
      15358  // デフォルト配送料（1箱分）：127980ウォン × 0.12
    );

    // 8. 総原価（円） = 最終販売価格
    const costJPY = costBreakdown.totalCost;

    return {
      skuIndex,
      quantity,
      theoreticalMeters,
      securedMeters,
      lossMeters: 0,  // 各SKUにはロスを含めない
      totalMeters: securedMeters,  // 集計用（ロスなし）
      costJPY,
      costBreakdown,
      deliveryWeight  // 配送重量（kg）
    };
  }

  // --------------------------------------------------------------------------
  // Helper Methods (Restored)
  // --------------------------------------------------------------------------

  /**
   * 파우치 타입별 필름 폭 계산
   */
  private calculateFilmWidth(
    pouchType: string,
    dimensions: PouchDimensions,
    columnCount: number = 1
  ): number {
    const { height: H, width: W, depth: G = 0 } = dimensions;

    switch (pouchType) {
      case 'roll_film':
        // 롤 필름: columnCount × 롤 폭
        return W * columnCount;

      case 'flat_3_side':
      case 'three_side':
      case 'zipper':
        return columnCount === 1 ? (H * 2) + 41 : (H * 4) + 71;

      case 'stand_up':
      case 'zipper_stand':
        // 1열: (H × 2) + G + 35, 2열: (H × 4) + (G × 2) + 40
        return columnCount === 1 ? (H * 2) + G + 35 : (H * 4) + (G * 2) + 40;

      case 't_shape':
        return (W * 2) + 22;

      case 'm_shape':
      case 'box':
        return (G + W) * 2 + 32;

      default:
        return columnCount === 1 ? (H * 2) + 41 : (H * 4) + 71;
    }
  }

  /**
   * 理論メートル数計算
   * @param quantity 数量
   * @param dimensions 寸法
   * @param pouchType パウチタイプ (ピッチ決定用)
   * @param columnCount 列数
   */
  private calculateTheoreticalMeters(
    quantity: number,
    dimensions: PouchDimensions,
    pouchType: string,
    columnCount: number = 1
  ): number {
    // ガイド 04-미터수_및_원가_계산.md 基準ピッチ決定
    // 平袋/三方シール: H(高さ) - シナリオドキュメント確認済み
    // スタンド/スパウト: W(幅)
    // 合掌袋(T型): W(幅)
    // ボックス/M型: G(マチ) + W(幅)
    let pitch: number;
    if (pouchType.includes('flat_3_side') || pouchType.includes('three_side') || pouchType.includes('zipper')) {
      // 平袋/三方シール袋: ピッチ = 高さ
      // シナリオ確認: 80×120mm平袋、1m당 8.33개 = ピッチ 120mm
      pitch = dimensions.height;
    } else if (pouchType.includes('m_shape') || pouchType.includes('box')) {
      pitch = (dimensions.depth || 0) + dimensions.width;
    } else {
      // スタンドパウチ、スパウトパウチ、合掌袋など: ピッチ = 幅
      pitch = dimensions.width;
    }

    // DEBUG: ピッチ計算ログ
    console.log('[calculateTheoreticalMeters]', {
      pouchType,
      dimensions,
      pitch,
      columnCount,
      quantity
    });

    // 1mあたり生産可能数 = (1000 / ピッチ) * 列数
    const pouchesPerMeter = (1000 / pitch) * columnCount;

    // 理論メートル数 = 数量 / 1mあたり生産可能数
    const result = quantity / pouchesPerMeter;
    console.log('[calculateTheoreticalMeters] result:', { pouchesPerMeter, result });
    return result;
  }

  /**
   * 確保量計算（商品タイプ別ルール）
   *
   * docs/reports/calcultae/00-README.md 基準
   *
   * 【パウチ商品】
   * - 最小確保量: なし（1m単位でOK）
   * - 切り上げ単位: 1m単位
   *
   * 【ロールフィルム商品】
   * - 1SKU: 500m
   * - 2+SKU: 各300m
   * - 切り上げ単位: 50m単位
   */
  private calculateSecuredMeters(
    theoreticalMeters: number,
    skuCount: number,
    pouchType: string
  ): number {
    // ロールフィルムの場合
    if (pouchType === 'roll_film') {
      const minMetersPerSku = skuCount === 1 ? 500 : 300;
      if (theoreticalMeters <= minMetersPerSku) {
        return minMetersPerSku;
      }
      return Math.ceil(theoreticalMeters / 50) * 50;
    }

    // パウチ商品の場合: 最小確保量なし、1m単位
    // docs/reports/calcultae/시나리오_상세/02-소량생산_시나리오.md 参照
    // 例: 500個パウチ、理論メートル60m → 確保量60m（切り上げなし）
    return Math.ceil(theoreticalMeters);
  }

  /**
   * 원단 폭 자동 결정 (인쇄폭/패우치 폭 기준)
   * 인쇄폭이 570 이하라면 590폭, 인쇄폭이 570 초과라면 760폭 원단을 사용
   */
  private determineMaterialWidth(printingWidth: number): 590 | 760 {
    if (printingWidth <= 570) return 590;
    if (printingWidth <= 740) return 760;
    return 760;
  }

  // --------------------------------------------------------------------------
  // Core Calculation Methods
  // --------------------------------------------------------------------------

  /**
   * フィルム原価計算
   */
  private calculateFilmCost(
    dimensions: PouchDimensions,
    meters: number,
    materialId: string,
    thicknessSelection: string,
    materialWidth: number,
    filmLayers?: FilmStructureLayer[],
    deliveryWeight?: number,
    postProcessingOptions?: string[]
  ): FilmCostResult {
    // filmLayersが指定されていない場合は、materialIdとthicknessSelectionに基づいてデフォルトレイヤーを取得
    // getDefaultFilmLayersですでにthicknessSelectionに基づいて厚さを調整済み
    const baseLayers = filmLayers || getDefaultFilmLayers(materialId, thicknessSelection);

    // filmLayersが外部から明示的に渡された場合のみ、厚さ調整を適用
    // getDefaultFilmLayersを使用した場合は既に調整済みなので不要
    const adjustedLayers = filmLayers ? this.adjustLayersForThickness(baseLayers, thicknessSelection) : baseLayers;

    // DEBUG: 使用されるレイヤーをログ
    console.log('[calculateFilmCost] DEBUG:', {
      materialId,
      thicknessSelection,
      filmLayersReceived: filmLayers,
      baseLayers,
      adjustedLayers,
      note: filmLayers ? '外部指定レイヤー → 厚さ調整適用' : 'デフォルトレイヤー → 既に調整済み'
    });

    // マット仕上げ選択確認
    const hasMatteFinishing = postProcessingOptions?.includes('matte') ?? false;

    const filmCostResult = this.filmCalculator.calculateCostWithDBSettings({
      layers: adjustedLayers,
      width: dimensions.width,
      length: meters,
      materialWidth: materialWidth, // 原反幅を正しく渡す（590mm or 760mm）
      lossRate: 0,
      hasPrinting: true,
      printingType: hasMatteFinishing ? 'matte' : 'basic',
      colors: 1,
      postProcessingOptions  // 表面処理オプションを渡す (glossy等)
    }, null);

    return filmCostResult;
  }

  /**
   * 袋加工費計算
   * @param pouchType パウチタイプ
   * @param widthMM 袋の幅 (mm)
   * @param quantity 数量
   * @param postProcessingOptions 後加工オプション（ジッパーなど）
   * @returns 袋加工費 (KRW)
   */
  private calculatePouchProcessingCost(
    pouchType: string,
    widthMM: number,
    quantity: number,
    postProcessingOptions?: string[]
  ): number {
    // 基本パウチタイプを判定（ジッパーなし）
    // ジッパー追加は postProcessingMultiplier で調整するため、
    // ここでは基本タイプのみを使用して二重課税を防ぐ
    let basePouchType: 'flat_3_side' | 'stand_up' | 't_shape' | 'm_shape' | 'box' | 'spout' | 'other' = 'other';

    // スパウトパウチは最初にチェック（別部品と追加加工が必要）
    if (pouchType.includes('spout')) {
      basePouchType = 'spout';
    }
    // 合掌袋(lap_seal)はt_shapeとして判定
    else if (pouchType.includes('lap_seal') || pouchType.includes('t_shape') || pouchType.includes('T방')) {
      basePouchType = 't_shape';
    } else if (pouchType.includes('3_side') || pouchType.includes('flat') || pouchType.includes('three_side')) {
      basePouchType = 'flat_3_side';
    } else if (pouchType.includes('stand') || pouchType.includes('standing')) {
      basePouchType = 'stand_up';
    } else if (pouchType.includes('m_shape') || pouchType.includes('M방')) {
      basePouchType = 'm_shape';
    } else if (pouchType.includes('box') || pouchType.includes('gusset')) {
      basePouchType = 'box';
    }

    // ジッパーオションによる最低価格調整
    const hasZipper = postProcessingOptions?.includes('zipper-yes');

    // 基本価格設定（ジッパーなし）- 数量比例方式
    // docs/reports/calcultae/05-가공비용_계산.md 基準
    // 基本加工費(ウォン) = パウチ横幅(cm) × 単価(ウォン/cm) × 数量
    // 製袋加工費(ウォン) = MAX(基本加工費, 最小単価)
    const POUCH_PROCESSING_COSTS_BASE = {
      'flat_3_side': { pricePerCm: 0.4, minimumPrice: 200000 },    // 平袋: 0.4ウォン/cm, 最小200,000ウォン
      'stand_up': { pricePerCm: 1.2, minimumPrice: 250000 },    // スタンドアップ: 1.2ウォン/cm, 最小250,000ウォン
      't_shape': { pricePerCm: 1.2, minimumPrice: 440000 },      // 合掌袋: 1.2ウォン/cm, 最小440,000ウォン
      'm_shape': { pricePerCm: 1.2, minimumPrice: 440000 },      // M封: 1.2ウォン/cm, 最小440,000ウォン
      'box': { pricePerCm: 1.2, minimumPrice: 440000 },          // ボックス: 1.2ウォン/cm, 最小440,000ウォン
      'spout': { pricePerCm: 1.8, minimumPrice: 500000 },        // スパウトパウチ: 1.8ウォン/cm, 最小500,000ウォン (別部品・追加加工が必要)
      'other': { pricePerCm: 1.2, minimumPrice: 200000 }         // その他: 1.2ウォン/cm, 最小200,000ウォン
    } as const;

    // ジッパーありの場合の最低価格上乗
    const ZIPPER_SURCHARGE = {
      'flat_3_side': 50000,   // 200,000 → 250,000
      'stand_up': 30000,      // 250,000 → 280,000
      't_shape': 0,           // 440,000 → 440,000 (변화 없음)
      'm_shape': 0,           // 440,000 → 440,000 (변화 없음)
      'box': 0                // 440,000 → 440,000 (변화 없음)
    } as const;

    const finalPouchType = basePouchType;

    // 基本設定を取得
    let costConfig = POUCH_PROCESSING_COSTS_BASE[finalPouchType] || POUCH_PROCESSING_COSTS_BASE.other;

    // パウチ横幅をcmに変換
    const widthCM = widthMM / 10;

    // 基本加工費を計算（数量比例）
    // docs/reports/calcultae/05-가공비용_계산.md 基準
    // 基本加工費(ウォン) = パウチ横幅(cm) × 単価(ウォン/cm) × 数量
    const baseProcessingCostKRW = widthCM * costConfig.pricePerCm * quantity;

    // 最小価格との比較
    let finalCostKRW = Math.max(baseProcessingCostKRW, costConfig.minimumPrice);

    // ジッパー追加の場合の価格調整
    if (hasZipper) {
      const surcharge = ZIPPER_SURCHARGE[finalPouchType as keyof typeof ZIPPER_SURCHARGE] || 0;
      finalCostKRW += surcharge;
    }

    console.log('[Pouch Processing Cost]', {
      pouchType,
      finalPouchType,
      widthCM,
      quantity,
      pricePerCm: costConfig.pricePerCm,
      baseProcessingCostKRW,
      minimumPrice: costConfig.minimumPrice,
      hasZipper,
      zipperSurcharge: hasZipper ? ZIPPER_SURCHARGE[finalPouchType as keyof typeof ZIPPER_SURCHARGE] : 0,
      finalCostKRW,
      note: `基本加工費${baseProcessingCostKRW.toLocaleString()}ウォン vs 最小価格${costConfig.minimumPrice.toLocaleString()}ウォン`
    });

    return finalCostKRW;
  }

  /**
   * 原価内訳集計 (修正された計算順序)
   *
   * docs/reports/calcultae/06-마진_및_최종가격.md 基準
   *
   * 1. 基礎原価 = 原材料費 + 印刷費 + 後加工費 (KRW)
   * 2. 製造者価格 = 基礎原価 × 1.4 (KRW)
   * 3. 円貨製造者価格 = 製造者価格 × 0.12 (JPY)
   * 4. 関税 = 円貨製造者価格 × 0.05 (JPY)
   * 5. 配送料 = 必要箱数 × 127,980ウォン × 0.12 (JPY)
   * 6. 小計 = 円貨製造者価格 + 関税 + 配送料 (JPY)
   * 7. 最終販売価格 = 小計 × 1.2 (JPY)
   */
  private calculateCostBreakdown(
    filmCostResult: FilmCostResult,
    pouchProcessingCostKRW: number,
    quantity: number,
    deliveryJPY: number = 15358  // デフォルトは1箱分（後で上書き）
  ): SKUCostBreakdown {
    const EXCHANGE_RATE = 0.12;

    // 1. 基礎原価 (KRW)
    const baseCostKRW = filmCostResult.totalCostKRW + pouchProcessingCostKRW;

    console.log('[calculateCostBreakdown] DEBUG:', {
      filmCostTotalKRW: filmCostResult.totalCostKRW,
      pouchProcessingCostKRW,
      baseCostKRW,
      quantity,
      deliveryJPY
    });

    // 2. 製造者価格 (KRW) - Margin 40%
    const manufacturerPriceKRW = baseCostKRW * 1.4;
    const manufacturingMarginKRW = manufacturerPriceKRW - baseCostKRW;

    // 3. 円貨製造者価格 (JPY) - 엔화 환전
    const manufacturerPriceJPY = manufacturerPriceKRW * EXCHANGE_RATE;

    // 4. 関税 (JPY) - 円貨で計算
    const dutyJPY = manufacturerPriceJPY * 0.05;

    // 5. 配送料 (JPY) - 引数で渡された値を使用（総重量に基づいて計算済み）
    // deliveryJPYはcalculateSKUCostメソッドで総重量から計算された値

    // 6. 小計 (JPY) - 円貨製造者価格 + 関税 + 配送料
    const subtotalJPY = manufacturerPriceJPY + dutyJPY + deliveryJPY;

    // 7. 最終販売価格 (JPY) - Seller Margin 20%
    const finalPriceJPY = subtotalJPY * 1.2;
    const salesMarginJPY = finalPriceJPY - subtotalJPY;

    console.log('[calculateCostBreakdown] Price Calculation Detail', JSON.stringify({
      baseCostKRW,
      manufacturerPriceKRW,
      manufacturerPriceJPY,
      dutyJPY,
      deliveryJPY,
      subtotalJPY,
      finalPriceJPY,
      salesMarginJPY
    }, null, 2));

    // Breakdown for display (すべてJPY)
    // すべての項目を最終段階で丸めることで、一貫性を保証
    const roundedMaterialCost = Math.round(filmCostResult.materialCost * EXCHANGE_RATE);
    const roundedPrintingCost = Math.round(filmCostResult.printingCost * EXCHANGE_RATE);
    const roundedLaminationCost = Math.round(filmCostResult.laminationCost * EXCHANGE_RATE);
    const roundedSlitterCost = Math.round(filmCostResult.slitterCost * EXCHANGE_RATE);
    const roundedSurfaceTreatmentCost = Math.round((filmCostResult.surfaceTreatmentCost || 0) * EXCHANGE_RATE);
    const roundedPouchProcessingCost = Math.round(pouchProcessingCostKRW * EXCHANGE_RATE);
    const roundedManufacturingMargin = Math.round(manufacturingMarginKRW * EXCHANGE_RATE);
    const roundedDutyJPY = Math.round(dutyJPY);
    const roundedDeliveryJPY = Math.round(deliveryJPY);
    const roundedSalesMarginJPY = Math.round(salesMarginJPY);
    const roundedFinalPriceJPY = Math.round(finalPriceJPY);

    // 検証用：丸めた項目の合計と最終価格の整合性チェック
    const sumOfRoundedItems = roundedMaterialCost + roundedPrintingCost + roundedLaminationCost +
                               roundedSlitterCost + roundedSurfaceTreatmentCost + roundedPouchProcessingCost +
                               roundedManufacturingMargin + roundedDutyJPY + roundedDeliveryJPY + roundedSalesMarginJPY;

    if (sumOfRoundedItems !== roundedFinalPriceJPY) {
      console.log('[calculateCostBreakdown] Rounding inconsistency detected', {
        sumOfRoundedItems,
        roundedFinalPriceJPY,
        difference: sumOfRoundedItems - roundedFinalPriceJPY
      });
    }

    // 小数点以下を保持して、unified-pricing-engine.tsで100円単位の切り上げ処理が正しく動作するようにする
    // 例: 168400.646... → unified-pricing-engine.tsで Math.ceil(168400.646... / 100) * 100 = 168500
    const consistentTotalCost = finalPriceJPY;

    // デバッグ: totalCostの値をログ出力
    console.log('[calculateCostBreakdown] totalCost（小数点以下保持）:', consistentTotalCost);

    return {
      materialCost: roundedMaterialCost,
      printingCost: roundedPrintingCost,
      laminationCost: roundedLaminationCost,
      slitterCost: roundedSlitterCost,
      surfaceTreatmentCost: roundedSurfaceTreatmentCost,
      pouchProcessingCost: roundedPouchProcessingCost,
      manufacturingMargin: roundedManufacturingMargin,
      duty: roundedDutyJPY,
      delivery: roundedDeliveryJPY,
      salesMargin: roundedSalesMarginJPY,
      totalCost: consistentTotalCost
    };
  }

  /**
   * 配送重量計算 (パウチ面積基準)
   *
   * パウチ1個の重量計算:
   * 1. 面積(mm²) = (width + 15) × height
   * 2. 面積(m²) = mm² / 1,000,000
   * 3. 体積(m²·mm) = 面積(m²) × レイヤー総厚(mm)
   * 4. 重量(kg) = 体積 × 比重 / 1,000,000
   */
  private calculateDeliveryWeight(
    layers: FilmStructureLayer[],
    materialWidth: number,
    quantity: number,
    dimensions: PouchDimensions
  ): number {
    // パウチ1個の面積 (mm²)
    const areaMM2 = (dimensions.width + 15) * dimensions.height;

    // 面積 (m²)
    const areaM2 = areaMM2 / 1000000;

    // レイヤー総厚 (mm)
    const totalThicknessMM = layers.reduce((sum, layer) => {
      return sum + (layer.thickness / 1000); // μm → mm
    }, 0);

    // 体積 (m²·mm)
    const volume = areaM2 * totalThicknessMM;

    // 重量計算
    let totalWeight = 0;
    for (const layer of layers) {
      const materialInfo = this.getMaterialInfo(layer.materialId);
      if (materialInfo) {
        // 各レイヤーの体積比率計算
        const layerThicknessRatio = layer.thickness / 1000 / totalThicknessMM;
        const layerWeight = volume * layerThicknessRatio * materialInfo.density;
        totalWeight += layerWeight;
      }
    }

    // 全体重量 = 1個の重量 × 数量
    return totalWeight * quantity;
  }

  /**
   * 材料情報取得 (比重データ)
   * film-cost-calculator.tsのFILM_MATERIALSと同じ値を使用
   */
  private getMaterialInfo(materialId: string): { density: number } | null {
    const materialData: Record<string, { density: number }> = {
      'PET': { density: 1.40 },    // film-cost-calculator.tsと統一
      'AL': { density: 2.71 },     // film-cost-calculator.tsと統一
      'LLDPE': { density: 0.92 },  // 変更なし
      'NY': { density: 1.16 },     // film-cost-calculator.tsと統一
      'VMPET': { density: 1.40 },  // film-cost-calculator.tsと統一
      // KP_PE 재질용 추가
      'KP': { density: 0.91 },
      'PE': { density: 0.92 }
    };
    return materialData[materialId] || null;
  }

  /**
   * 厚さ選択に応じたフィルムレイヤー調整
   */
  private adjustLayersForThickness(
    baseLayers: FilmStructureLayer[],
    thicknessSelection: string
  ): FilmStructureLayer[] {
    if (!thicknessSelection) return baseLayers;

    const thicknessMultipliers: Record<string, number> = {
      'light': 0.9,
      'medium': 1.0,
      'heavy': 1.1,
      'ultra': 1.2
    };

    const multiplier = thicknessMultipliers[thicknessSelection];
    if (!multiplier || multiplier === 1.0) return baseLayers;

    return baseLayers.map(layer => {
      if (layer.materialId === 'LLDPE' || layer.materialId === 'PE') {
        return {
          ...layer,
          thickness: Math.round(layer.thickness * multiplier)
        };
      }
      return layer;
    });
  }

  /**
   * 経済的生産数量提案を計算
   *
   * パウチのピッチ（幅）に基づいて、フィルムの無駄を最小化する数量を提案
   *
   * @param orderQuantity 注文数量
   * @param dimensions パウチ寸法
   * @param pouchType パウチタイプ
   * @param currentFilmUsage 現在のフィルム使用量（m）
   * @param currentUnitPrice 現在の単価（円/個）
   * @param accurateCalculationParams 正確な原価計算用パラメータ（オプション）
   * @returns 経済的生産数量提案
   */
  calculateEconomicQuantitySuggestion(
    orderQuantity: number,
    dimensions: PouchDimensions,
    pouchType: string,
    currentFilmUsage: number,
    currentUnitPrice: number,
    accurateCalculationParams?: {
      filmLayers?: FilmStructureLayer[];
      materialId?: string;
      thicknessSelection?: string;
      postProcessingOptions?: string[];
    }
  ): EconomicQuantitySuggestion {
    // ========================================
    // 1. 基本計算
    // ========================================

    // ロールフィルムの場合、orderQuantityがそのままフィルム長（m）になる
    // パウチの場合、currentFilmUsageパラメータを使用
    const effectiveFilmUsage = pouchType === 'roll_film' ? orderQuantity : currentFilmUsage;

    // パウチのピッチ（進行方向の幅）
    const pitchMM = dimensions.width;

    // 1mあたり生産可能数
    const pouchesPerMeter = 1000 / pitchMM;

    // 現在の最小発注量（500m + 400mロス = 900m）
    const minimumFilmUsage = 900;
    const minimumOrderQuantity = Math.floor(minimumFilmUsage * pouchesPerMeter);

    // ========================================
    // 2. 経済的生産数量計算
    // ========================================

    // 注文数量分の理論フィルム長（ロスなし）
    // ドキュメント: docs/reports/calcultae/07-SKU_및_병렬생산.md
    const theoreticalMetersForOrder = orderQuantity / pouchesPerMeter;

    // 総フィルム量 = 理論メートル + 400m（ロス）
    // ロスは同じピッチのSKUグループごとに400m固定
    const LOSS_METERS = 400;
    const totalFilmUsage = theoreticalMetersForOrder + LOSS_METERS;

    // 経済的数量 = 総フィルム量で生産可能な数量
    const economicQuantity = Math.floor(totalFilmUsage * pouchesPerMeter);

    // ========================================
    // 3. 効率改善計算
    // ========================================

    const currentEfficiency = orderQuantity / effectiveFilmUsage;
    const economicEfficiency = economicQuantity / minimumFilmUsage;
    const efficiencyImprovement = ((economicEfficiency - currentEfficiency) / currentEfficiency) * 100;

    // ========================================
    // 4. コスト比較計算
    // ========================================

    // 現在の単価は総額を数量で割ったものと仮定
    // 経済的数量の場合、同じフィルム量で多く生産できるため単価が下がる
    const unitCostAtOrderQty = currentUnitPrice;
    const unitCostAtEconomicQty = (currentUnitPrice * orderQuantity) / economicQuantity;
    const costSavings = unitCostAtOrderQty - unitCostAtEconomicQty;
    const costSavingsRate = (costSavings / unitCostAtOrderQty) * 100;

    // ========================================
    // 5. 最適提案の決定
    // ========================================

    let recommendedQuantity: number;
    let recommendationReason: string;

    const wasteQuantity = economicQuantity - orderQuantity;
    const wasteRate = (wasteQuantity / economicQuantity) * 100;

    if (wasteRate <= 10) {
      // 無駄率10%以下なら経済的数量を推奨
      recommendedQuantity = economicQuantity;
      recommendationReason = `フィルム効率最大化：${orderQuantity.toLocaleString()}個 → ${economicQuantity.toLocaleString()}個（無駄${wasteQuantity.toLocaleString()}個、${wasteRate.toFixed(1)}%）`;
    } else if (wasteRate <= 30) {
      // 無駄率10-30%なら選択肢を提示
      recommendedQuantity = orderQuantity;
      recommendationReason = `選択肢提示：${orderQuantity.toLocaleString()}個（注文通り）または${economicQuantity.toLocaleString()}個（フィルム効率化、無駄${wasteRate.toFixed(1)}%）`;
    } else {
      // 無駄率30%超なら注文数量を推奨
      recommendedQuantity = orderQuantity;
      recommendationReason = `注文数量推奨：無駄を避けるため${orderQuantity.toLocaleString()}個を推奨（経済的数量の場合${wasteRate.toFixed(1)}%の無駄発生）`;
    }

    return {
      orderQuantity,
      minimumOrderQuantity,
      minimumFilmUsage,
      pouchesPerMeter,
      economicQuantity,
      economicFilmUsage: totalFilmUsage, // 実際の総フィルム量
      efficiencyImprovement,
      unitCostAtOrderQty,
      unitCostAtEconomicQty,
      costSavings,
      costSavingsRate,
      recommendedQuantity,
      recommendationReason,
      // 2列生産オプションを経済的数量に基づいて計算
      parallelProductionOptions: this.calculateParallelProductionOptions(
        dimensions,
        pouchType,
        effectiveFilmUsage,
        currentUnitPrice,
        accurateCalculationParams
      )
    };
  }

  /**
   * 並列生産オプションを計算（roll_film, t_shape, m_shape専用）
   *
   * 顧客に具体的な数量オプションを提示
   * 例: 200mm幅ロールの場合
   *   - 2個注文: 590mm原反使用 (68%効率)
   *   - 3個注文: 760mm原反使用 (79%効率) ⭐推奨
   *
   * @param dimensions パウチ寸法
   * @param pouchType パウチタイプ
   * @param currentFilmUsage 現在のフィルム使用量（m）
   * @param currentUnitPrice 現在の単価（円/個）
   * @param accurateParams 正確な原価計算用パラメータ（オプション）
   */
  private calculateParallelProductionOptions(
    dimensions: PouchDimensions,
    pouchType: string,
    currentFilmUsage: number,
    currentUnitPrice: number,
    accurateParams?: {
      filmLayers?: FilmStructureLayer[];
      materialId?: string;
      thicknessSelection?: string;
      postProcessingOptions?: string[];
    }
  ): ParallelProductionOption[] | undefined {
    // 롤 필름, 합장, 박스에만 적용
    if (pouchType !== 'roll_film' && pouchType !== 't_shape' && pouchType !== 'm_shape') {
      return undefined;
    }

    // 현재 필름 폭 계산
    let filmWidth: number;
    if (pouchType === 'roll_film') {
      filmWidth = dimensions.width;
    } else {
      filmWidth = this.calculateFilmWidth(pouchType, dimensions, 1);
    }

    // 가능한 병행 생산 조합 계산
    const availableRollWidths: Array<590 | 760> = [590, 760];
    const options: ParallelProductionOption[] = [];
    let optionNumber = 1;

    for (const rollWidth of availableRollWidths) {
      // 유효 폭 (양쪽 10mm 여백 제외)
      const effectiveWidth = rollWidth - 20;

      // 이 원반으로 최대 몇 개 병행 생산 가능한지 계산
      const maxParallelCount = Math.floor(effectiveWidth / filmWidth);

      // 2個から最大並行個数まで各オプション生成（1本は並列生産の意味がないため除外）
      for (let count = 2; count <= maxParallelCount; count++) {
        // 중복 옵션 제거 (이미 더 좋은 효율의 옵션이 있으면 스킵)
        const existingBetterOption = options.find(opt =>
          opt.quantity === count && opt.filmWidthUtilization > (count * filmWidth / rollWidth) * 100
        );
        if (existingBetterOption) continue;

        const totalFilmWidth = count * filmWidth;
        const utilization = (totalFilmWidth / rollWidth) * 100;

        // 正確な原価計算（パラメータがある場合）
        let estimatedUnitCost: number;
        let savingsRate: number;

        if (accurateParams?.filmLayers && accurateParams.filmLayers.length > 0) {
          // filmCalculatorを使用した正確な計算
          // ロールフィルム計算と同じ固定400mロスを使用（重要）
          // 並列生産の場合: 500m注文×2本=1000m完成品に対して、原反投与は500m+400mロス=900m
          const totalLength = currentFilmUsage + 400;  // 注文数量＋固定ロス（countを掛けない！）
          const effectiveMaterialWidth = rollWidth === 760 ? 740 : 570;

          // デバッグログ
          console.log('[ParallelProductionOption] Start', {
            count,
            rollWidth,
            effectiveMaterialWidth,
            filmWidth,
            totalFilmWidth,
            currentFilmUsage,
            totalLength,
            currentUnitPrice,
            utilization: (totalFilmWidth / rollWidth) * 100,
            note: '並列生産: 500m注文×2本=1000m完成、原反投与500m+400m=900m'
          });

          // マット仕上げ選択確認
          const hasMatteFinishing = accurateParams.postProcessingOptions?.includes('matte') ?? false;

          const filmCostResult = this.filmCalculator.calculateCostWithDBSettings({
            layers: accurateParams.filmLayers,
            width: effectiveMaterialWidth, // 原反の幅（570mmまたは740mm）
            length: totalLength,
            lossRate: 0, // 固定400mロスを既に含めているため、追加のロス率は0
            hasPrinting: true,
            printingType: hasMatteFinishing ? 'matte' : 'basic',
            colors: 1,
            materialWidth: effectiveMaterialWidth,  // 原反の幅（570mmまたは740mm）
            postProcessingOptions: accurateParams.postProcessingOptions  // 表面処理オプション
          }, null);

          console.log('[ParallelProductionOption] filmCostResult', {
            materialCost: filmCostResult.materialCost,
            printingCost: filmCostResult.printingCost,
            laminationCost: filmCostResult.laminationCost,
            slitterCost: filmCostResult.slitterCost,
            deliveryCostJPY: filmCostResult.deliveryCostJPY,
            costWithDutyAndDeliveryJPY: filmCostResult.costWithDutyAndDeliveryJPY
          });

          // ========================================
          // 🆕 並列生産割引適用（2026-01-18）
          // 割引対象: フィルム原価 + 印刷費 + ラミネート費 + 表面処理費
          // 全額請求: スリッター費 + 配送料
          // ========================================

          // 割引適用対象（フィルム原価 + 印刷費 + ラミネート費 + 表面処理費）
          const discountableCost = filmCostResult.materialCost +
            filmCostResult.printingCost +
            filmCostResult.laminationCost +
            (filmCostResult.surfaceTreatmentCost || 0);  // 表面処理費を追加

          // 全額請求対象（スリッター費 + 配送料）
          const nonDiscountableCost = filmCostResult.slitterCost +
            filmCostResult.deliveryCostJPY;

          // 並列生産割引適用
          const discountedCost = this.calculateParallelDiscount(discountableCost, count);

          // 並列生産後の総価格
          const totalDiscountedCost = discountedCost + nonDiscountableCost;

          // 1本あたり単価（総価格 / 並列数）
          estimatedUnitCost = totalDiscountedCost / count;

          // 節減率計算
          savingsRate = ((currentUnitPrice - estimatedUnitCost) / currentUnitPrice) * 100;

          console.log('[ParallelProductionOption] Discount Applied', {
            count,
            discountableCost: Math.round(discountableCost),
            nonDiscountableCost: Math.round(nonDiscountableCost),
            discountedCost: Math.round(discountedCost),
            totalDiscountedCost: Math.round(totalDiscountedCost),
            estimatedUnitCost: Math.round(estimatedUnitCost),
            savingsRate: savingsRate.toFixed(1) + '%',
            discountRule: count === 2 ? '7.5% OFF (2列)' : count === 3 ? '10% OFF (3列)' : count === 4 ? '11.25% OFF (4列)' : 'No discount'
          });
        } else {
          // 近似計算（フォールバック）
          // 🆕 新ビジネスロジックに基づき近似計算を修正
          const baseFilmCost = currentUnitPrice * 0.7; // フィルム原価の概算（約70%）
          const nonFilmCost = currentUnitPrice * 0.3; // 加工費などの概算（約30%）

          // 並列生産割引適用（新しいロジック: 7.5%, 10%, 11.25%）
          const discountedFilmCost = this.calculateParallelDiscount(baseFilmCost, count);
          const totalCost = discountedFilmCost + nonFilmCost;
          estimatedUnitCost = totalCost;
          savingsRate = ((currentUnitPrice - estimatedUnitCost) / currentUnitPrice) * 100;
        }

        options.push({
          optionNumber: optionNumber++,
          quantity: count,
          materialWidth: rollWidth,
          parallelCount: count,
          filmWidthUtilization: utilization,
          estimatedUnitCost,
          savingsRate,
          isRecommended: false,
          reason: `${count}本注文時 ${rollWidth}mm原反使用 (${utilization.toFixed(0)}%効率)`
        });
      }
    }

    // 효율 순으로 정렬
    options.sort((a, b) => b.filmWidthUtilization - a.filmWidthUtilization);

    // 추천 옵션 설정 (효율 75% 이상이거나 가장 높은 효율)
    const maxUtilization = Math.max(...options.map(opt => opt.filmWidthUtilization));
    options.forEach(opt => {
      if (opt.filmWidthUtilization >= 75 || opt.filmWidthUtilization === maxUtilization) {
        opt.isRecommended = true;
        opt.reason = `⭐ 推奨: ${opt.quantity}本注文時 ${opt.materialWidth}mm原反を効率的に使用 (${opt.filmWidthUtilization.toFixed(0)}%活用, 単価${opt.savingsRate.toFixed(0)}%節減)`;
      }
    });

    // 옵션 번호 재설정
    options.forEach((opt, index) => opt.optionNumber = index + 1);

    return options.length > 0 ? options : undefined;
  }

  /**
   * 並列生産割引計算（ビジネスロジックベース）
   *
   * 設計原則:
   * 1. 実際のコスト構造を反映：スリッター費の分散効果のみを割引に反映
   * 2. 漸進的割引：並列数が増えるほど追加割引が減少（限界効用逓減）
   * 3. 購買者魅力度確保：割引率が視認できることで選択動機を付与
   * 4. 販売者利益保護：過度な割引でマージン悪化を防止
   *
   * 割引設計（単価基準）:
   * - 1列: 100% (基準)
   * - 2列: 個別92.5% = 総185% (7.5% OFF)
   * - 3列: 個別90.0% = 総270% (10% OFF)
   * - 4列: 個別88.75% = 総355% (11.25% OFF)
   *
   * 設計根拠:
   * - スリッター費: 30,000円 ÷ 2 = 15,000円/個 (15,000円節減)
   * - 500m × 10円/m = 5,000円の場合、スリッター費節減効果 = 15,000円
   * - 総コスト約20万円想定時、約7.5%割引
   *
   * @param basePrice 基準価格（フィルム原価+印刷費+ラミネート費）
   * @param parallelCount 並列数（1=単独生産、2=2列/2本、3=3列/3本...）
   * @returns 割引適用後価格
   */
  calculateParallelDiscount(
    basePrice: number,
    parallelCount: number
  ): number {
    if (parallelCount <= 1) return basePrice;

    // 並列数別総倍率（個別SKU単価基準）
    const multipliers: Record<number, number> = {
      2: 1.85,   // 2列: 個別92.5% = 総185% (7.5% OFF)
      3: 2.70,   // 3列: 個別90.0% = 総270% (10% OFF)
      4: 3.55,   // 4列: 個別88.75% = 総355% (11.25% OFF)
    };

    const multiplier = multipliers[parallelCount] ?? parallelCount;
    return basePrice * multiplier;
  }

  /**
   * 並列生産割引詳細計算（ビジネスロジックベース）
   *
   * 割引内訳を返す
   *
   * @param basePrice 基準価格（フィルム原価+印刷費+ラミネート費）
   * @param parallelCount 並列数
   * @returns 割引詳細
   */
  calculateParallelDiscountDetail(
    basePrice: number,
    parallelCount: number
  ): {
    originalPrice: number;      // 割引前総額
    discountedPrice: number;    // 割引適用後価格
    discountAmount: number;     // 割引額
    discountRate: number;       // 割引率（%）
    discountMultiplier: number; // 割引係数
    breakdown: {
      firstUnit: number;        // 1本目（1列目）価格
      additionalUnits: number;  // 追加本数合計価格
      additionalUnitCount: number; // 追加本数
    };
  } {
    const originalPrice = basePrice * parallelCount;
    const discountedPrice = this.calculateParallelDiscount(basePrice, parallelCount);
    const discountAmount = originalPrice - discountedPrice;
    const discountRate = (discountAmount / originalPrice) * 100;

    // 新しい割引係数計算（ビジネスロジックベース）
    const multipliers: Record<number, number> = {
      2: 1.85,   // 2列: 7.5% OFF
      3: 2.70,   // 3列: 10% OFF
      4: 3.55,   // 4列: 11.25% OFF
    };
    const discountMultiplier = multipliers[parallelCount] ?? parallelCount;

    // 内訳計算
    const firstUnit = basePrice; // 1本目は100%
    let additionalUnits = 0;
    if (parallelCount >= 2) {
      additionalUnits += basePrice * 0.85; // 2本目は85%
    }
    if (parallelCount >= 3) {
      additionalUnits += basePrice * 0.85; // 3本目も85%
    }
    if (parallelCount >= 4) {
      additionalUnits += basePrice * 0.85; // 4本目も85%
    }

    return {
      originalPrice: Math.round(originalPrice),
      discountedPrice: Math.round(discountedPrice),
      discountAmount: Math.round(discountAmount),
      discountRate: Math.round(discountRate * 100) / 100, // 小数点第2位まで（7.5%, 11.25%など）
      discountMultiplier: Math.round(discountMultiplier * 100) / 100,
      breakdown: {
        firstUnit: Math.round(firstUnit),
        additionalUnits: Math.round(additionalUnits),
        additionalUnitCount: parallelCount - 1
      }
    };
  }

  /**
   * 数量を100単位で切り捨て（14431 → 14400）
   * @param quantity 数量
   * @returns 100単位で切り捨てた数量
   */
  private roundDownToHundreds(quantity: number): number {
    return Math.floor(quantity / 100) * 100;
  }

  /**
   * 2列生産推奨オプション計算（15% OFF、31% OFF）
   *
   * docs/reports/calcultae/07-SKU_및_병렬생산.md 参照
   *
   * 2列生産が可能な場合のみオプションを返す
   * - 原反幅（590mm or 760mm）に2列分のフィルム幅が収まる必要がある
   * - 平袋/三方シール、スタンドパウチ等の主要パウチタイプのみ対応
   *
   * @param currentQuantity 現在の注文数量
   * @param currentUnitPrice 現在の単価
   * @param pouchType パウチタイプ
   * @param dimensions パウチ寸法
   * @returns 2列生産オプション（2列生産不可能な場合はnull）
   */
  calculateTwoColumnProductionOptions(
    currentQuantity: number,
    currentUnitPrice: number,
    pouchType: string,
    dimensions: PouchDimensions
  ): TwoColumnProductionOptions | null {
    // 2列生産が可能かチェック
    if (!this.canUseTwoColumnProduction(pouchType, dimensions, currentQuantity)) {
      return null; // 2列生産不可能
    }

    // ========================================
    // 経済的数量を計算（ドキュメントに基づく）
    // docs/reports/calcultae/07-SKU_및_병렬생산.md
    // ========================================

    const pitchMM = dimensions.width;
    const pouchesPerMeter = 1000 / pitchMM;

    // 理論メートル = 注文数量 ÷ (1,000 ÷ ピッチ)
    const theoreticalMeters = currentQuantity / pouchesPerMeter;

    // 総フィルム量 = 理論メートル + 400m（ロス）
    const LOSS_METERS = 400;
    const totalFilmUsage = theoreticalMeters + LOSS_METERS;

    // 経済的数量 = 総フィルム量で生産可能な数量
    const economicQuantity = Math.floor(totalFilmUsage * pouchesPerMeter);

    // ========================================
    // 2列生産オプションを計算
    // ========================================

    // 15% OFF: 同じ数量（経済的数量を100単位で切り捨て）
    const roundedQuantity = this.roundDownToHundreds(economicQuantity);
    const sameQuantityPrice = currentUnitPrice * 0.85; // ドキュメント: 原価削減30% → 顧客割引15%

    // 30% OFF: 倍の数量（経済的数量×2を100単位で切り捨て）
    const doubleQuantity = this.roundDownToHundreds(economicQuantity * 2);
    const doubleQuantityPrice = currentUnitPrice * 0.70; // 原価削減50%: 顧客30% OFF + 販売者マージン20%追加

    console.log('[calculateTwoColumnProductionOptions] 計算結果:', {
      currentQuantity,
      pitchMM,
      pouchesPerMeter: pouchesPerMeter.toFixed(2),
      theoreticalMeters: theoreticalMeters.toFixed(0),
      totalFilmUsage: totalFilmUsage.toFixed(0),
      economicQuantity,
      roundedQuantity,
      doubleQuantity,
      sameQuantityPrice: Math.round(sameQuantityPrice),
      doubleQuantityPrice: Math.round(doubleQuantityPrice)
    });

    return {
      sameQuantity: {
        quantity: currentQuantity, // ユーザー入力の数量を保持
        unitPrice: Math.round(sameQuantityPrice),
        totalPrice: Math.round(sameQuantityPrice * currentQuantity),
        savingsRate: 15
      },
      doubleQuantity: {
        quantity: doubleQuantity,
        unitPrice: Math.round(doubleQuantityPrice),
        totalPrice: Math.round(doubleQuantityPrice * doubleQuantity),
        savingsRate: 30
      }
    };
  }

  /**
   * 2列生産が可能かどうかを判定
   *
   * @param pouchType パウチタイプ
   * @param dimensions パウチ寸法
   * @returns 2列生産可能な場合はtrue
   */
  private canUseTwoColumnProduction(
    pouchType: string,
    dimensions: PouchDimensions,
    currentQuantity: number
  ): boolean {
    // ロールフィルム、合掌袋、ボックス型パウチには2列生産を適用しない
    // （これらは既存の並列生産オプションで対応）
    if (pouchType === 'roll_film' ||
        pouchType.includes('t_shape') ||
        pouchType.includes('m_shape') ||
        pouchType.includes('box')) {
      return false;
    }

    // 2列分のフィルム幅を計算
    const filmWidth2Columns = this.calculateFilmWidth(pouchType, dimensions, 2);

    // 最大原反幅（760mm）の印刷可能幅（740mm）に収まるかチェック
    const MAX_PRINTABLE_WIDTH = 740; // 760mm原反の印刷可能幅
    if (filmWidth2Columns > MAX_PRINTABLE_WIDTH) {
      return false;
    }

    // 1列生産での実際の印刷メートル数を計算
    const pitch = dimensions.width; // ピッチ = パウチ横幅 (mm)
    const pouchesPerMeter = 1000 / pitch; // 1列生産の場合の個数/m
    const actualPrintMeters = currentQuantity / pouchesPerMeter; // 実際の印刷メートル数

    // 2列生産推奨オプションは印刷メートル数が1000m以上の場合のみ表示
    // docs/reports/calcultae/07-SKU_및_병렬생산.md 基準
    const MIN_PRINT_METERS_FOR_2COLUMN = 1000;
    const canUse2Column = actualPrintMeters >= MIN_PRINT_METERS_FOR_2COLUMN;

    console.log('[canUseTwoColumnProduction] 検証:', {
      pouchType,
      dimensions,
      currentQuantity,
      pitch,
      pouchesPerMeter: pouchesPerMeter.toFixed(2),
      actualPrintMeters: actualPrintMeters.toFixed(2),
      MIN_PRINT_METERS_FOR_2COLUMN,
      canUse2Column,
      reason: canUse2Column
        ? `印刷メートル数${actualPrintMeters.toFixed(0)}m >= ${MIN_PRINT_METERS_FOR_2COLUMN}m`
        : `印刷メートル数${actualPrintMeters.toFixed(0)}m < ${MIN_PRINT_METERS_FOR_2COLUMN}m`
    });

    return canUse2Column;
  }

  /**
   * SKU分割オプション計算
   *
   * docs/reports/calcultae/07-SKU_및_병렬생산.md 参照
   *
   * @param economicQuantity 経済的数量
   * @param minSKUParts 最小SKU数（デフォルト: 2）
   * @param maxSKUParts 最大SKU数（デフォルト: 10）
   * @param minQuantityPerSKU 1 SKUあたりの最小数量（デフォルト: 500）
   * @returns SKU分割オプション配列
   */
  calculateSKUSplitOptions(
    economicQuantity: number,
    minSKUParts: number = 2,
    maxSKUParts: number = 10,
    minQuantityPerSKU: number = 500
  ): SKUSplitOption[] {
    const options: SKUSplitOption[] = [];

    // 1000個未満はSKU分割推奨なし
    if (economicQuantity < 1000) return options;

    // 経済的数量も100単位で切り捨て
    const roundedQuantity = this.roundDownToHundreds(economicQuantity);

    // 2~10 SKUまで分割可能か計算
    for (let skuCount = minSKUParts; skuCount <= maxSKUParts; skuCount++) {
      // 100単位で切り捨てて各SKUの数量を計算
      const quantityPerSKU = Math.floor(roundedQuantity / skuCount / 100) * 100;

      // 各SKUが最小数量以上でなければ終了
      if (quantityPerSKU < minQuantityPerSKU) break;

      options.push({
        skuCount,
        quantityPerSKU,
        totalQuantity: quantityPerSKU * skuCount,
        description: `${skuCount} SKU × ${quantityPerSKU}個 = ${(quantityPerSKU * skuCount).toLocaleString()}個`
      });
    }

    return options;
  }
}

// シングルトンインスタンス
export const pouchCostCalculator = new PouchCostCalculator();
