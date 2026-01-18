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
    // 열(열) 수 자동 판정 로직
    // ========================================
    // 2열 필름 폭 계산 (2열이 가능한지 확인)
    const filmWidth2Columns = this.calculateFilmWidth(pouchType, dimensions, 2);

    // 2열 채택 가능 여부 판정: 2열 필름 폭이 740mm 이하인 경우
    const canUse2Columns = filmWidth2Columns <= 740;

    // 최종 열 수 결정 (2열 가능하면 2열 사용)
    const optimalColumnCount = canUse2Columns ? 2 : 1;

    // 최종 필름 폭 계산
    const filmWidth = this.calculateFilmWidth(pouchType, dimensions, optimalColumnCount);

    // 원단 폭 자동 결정 (계산된 필름 폭 기준)
    const materialWidth = this.determineMaterialWidth(filmWidth);

    console.log('[Film Width Calculation]', {
      pouchType,
      dimensions: { width: dimensions.width, height: dimensions.height, depth: dimensions.depth },
      skuCount,
      filmWidth2Columns,
      canUse2Columns,
      optimalColumnCount,
      calculatedFilmWidth: filmWidth,
      selectedMaterialWidth: materialWidth
    });
    const totalQuantity = skuQuantities.reduce((sum, q) => sum + q, 0);

    // 各SKUの原価を計算
    const costPerSKU = skuQuantities.map((quantity, index) => {
      return this.calculateSingleSKUCost(
        index,
        quantity,
        skuCount,
        dimensions,
        materialId,
        thicknessSelection,
        pouchType,
        materialWidth,
        optimalColumnCount, // Passed here
        filmLayers,
        postProcessingOptions
      );
    });

    // 集計
    const totalCostJPY = costPerSKU.reduce((sum, sku) => sum + sku.costJPY, 0);

    // 総確保量（各SKUの確保量を合計）
    const totalSecuredMeters = costPerSKU.reduce((sum, sku) => sum + sku.securedMeters, 0);

    // ロスは400m固定（SKU数に関わらず）
    const lossMeters = FIXED_LOSS_METERS;

    // 総フィルム量（確保量 + ロス）
    const totalWithLossMeters = totalSecuredMeters + lossMeters;

    const summary = {
      totalSecuredMeters,
      lossMeters,
      totalWithLossMeters,
      totalWeight: 0, // 後で計算
      deliveryBoxes: costPerSKU.reduce((sum, sku) => sum + (sku.costBreakdown.delivery ? Math.ceil(sku.costBreakdown.delivery / 15358) : 0), 0) // Approx
    };

    return {
      totalCostJPY,
      costPerSKU,
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

    // 2. 確保量計算（最小確保量 + 50m単位切り上げ）
    const securedMeters = this.calculateSecuredMeters(theoreticalMeters, skuCount);

    // 3. ロス計算（各SKUにロスを配分）
    // ロスは400m固定。SKU数で等分する
    const lossMeters = 400 / skuCount;

    // 4. 総メートル数（確保量 + ロス）
    const totalMeters = securedMeters + lossMeters;

    // 4.5. 配送重量計算
    // FilmCostCalculatorに任せるため、ここでは計算しない (undefinedを渡す)
    // FilmCostCalculatorは width(m) * length(m) * density で計算する (JIS規格/ガイド準拠)

    // 5. フィルム原価計算（総メートル数を使用）
    const filmCostResult = this.calculateFilmCost(
      dimensions,
      totalMeters, // Secured + Loss
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
    const costBreakdown = this.calculateCostBreakdown(
      filmCostResult,
      pouchProcessingCost, // KRW
      quantity
    );

    // 8. 総原価（円） = 最終販売価格
    const costJPY = costBreakdown.totalCost;

    return {
      skuIndex,
      quantity,
      theoreticalMeters,
      securedMeters,
      lossMeters,
      totalMeters,
      costJPY,
      costBreakdown
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
    // 平袋/スタンド/スパウト: W(幅)
    // 合掌袋(T型): W(幅)
    // ボックス/M型: G(マチ) + W(幅)
    let pitch: number;
    if (pouchType.includes('m_shape') || pouchType.includes('box')) {
      pitch = (dimensions.depth || 0) + dimensions.width;
    } else {
      pitch = dimensions.width;
    }

    // 1mあたり生産可能数 = (1000 / ピッチ) * 列数
    const pouchesPerMeter = (1000 / pitch) * columnCount;

    // 理論メートル数 = 数量 / 1mあたり生産可能数
    return quantity / pouchesPerMeter;
  }

  /**
   * 確保量計算（最小確保量ルール + 50m単位切り上げ）
   */
  private calculateSecuredMeters(theoreticalMeters: number, skuCount: number): number {
    const minMetersPerSku = skuCount === 1 ? 500 : 300;
    if (theoreticalMeters <= minMetersPerSku) {
      return minMetersPerSku;
    }
    return Math.ceil(theoreticalMeters / 50) * 50;
  }

  /**
   * 원단 폭 자동 결정
   */
  private determineMaterialWidth(filmWidth: number): 590 | 760 {
    if (filmWidth <= 570) return 590;
    if (filmWidth <= 740) return 760;
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
    // 基本レイヤー設定
    const defaultLayers: FilmStructureLayer[] = [
      { materialId: 'PET', thickness: 12 },
      { materialId: 'AL', thickness: 7 },
      { materialId: 'LLDPE', thickness: 80 }
    ];

    // 厚さ選択に応じてレイヤー調整
    const baseLayers = filmLayers || defaultLayers;
    const adjustedLayers = this.adjustLayersForThickness(baseLayers, thicknessSelection);

    // マット仕上げ選択確認
    const hasMatteFinishing = postProcessingOptions?.includes('matte') ?? false;

    const filmCostResult = this.filmCalculator.calculateCost({
      layers: adjustedLayers,
      width: dimensions.width,
      length: meters,
      lossRate: 0,
      hasPrinting: true,
      printingType: hasMatteFinishing ? 'matte' : 'basic',
      materialWidth,
      deliveryWeight
    });

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
    // ... (logic to determine finalPouchType and costConfig remains same)
    let basePouchType: 'flat_3_side' | 'stand_up' | 't_shape' | 'm_shape' | 'box' | 'other' = 'other';

    if (pouchType.includes('3_side') || pouchType.includes('flat') || pouchType.includes('three_side')) {
      basePouchType = 'flat_3_side';
    } else if (pouchType.includes('stand') || pouchType.includes('standing')) {
      basePouchType = 'stand_up';
    } else if (pouchType.includes('t_shape') || pouchType.includes('T방')) {
      basePouchType = 't_shape';
    } else if (pouchType.includes('m_shape') || pouchType.includes('M방')) {
      basePouchType = 'm_shape';
    } else if (pouchType.includes('box') || pouchType.includes('gusset')) {
      basePouchType = 'box';
    }

    const hasZipper = postProcessingOptions?.includes('zipper-yes');
    let finalPouchType: typeof basePouchType | 'zipper' | 'zipper_stand' = basePouchType;

    if (hasZipper) {
      if (basePouchType === 'flat_3_side') {
        finalPouchType = 'zipper';
      } else if (basePouchType === 'stand_up') {
        finalPouchType = 'zipper_stand';
      }
    }

    const POUCH_PROCESSING_COSTS = {
      'flat_3_side': { coefficient: 0.4, minimumPrice: 200000 },
      'stand_up': { coefficient: 1.2, minimumPrice: 250000 },
      'zipper': { coefficient: 1.2, minimumPrice: 250000 },
      'zipper_stand': { coefficient: 1.7, minimumPrice: 280000 },
      't_shape': { coefficient: 1.2, minimumPrice: 440000 },
      'm_shape': { coefficient: 1.2, minimumPrice: 440000 },
      'box': { coefficient: 1.2, minimumPrice: 440000 }, // Corrected to 440000 as per manual for Box logic if needed, or keep 250000? Guide says "Box Pouch (M-seal) 1.2 / Min 440,000" in 05-가공비용.md
      'other': { coefficient: 1.0, minimumPrice: 200000 }
    } as const;

    // Use Box cost if applicable
    const costConfig = POUCH_PROCESSING_COSTS[finalPouchType] || POUCH_PROCESSING_COSTS.other;

    const widthCM = widthMM / 10;
    const costPerUnitKRW = widthCM * costConfig.coefficient;
    const totalCostKRW = costPerUnitKRW * quantity;
    const finalCostKRW = Math.max(totalCostKRW, costConfig.minimumPrice);

    console.log('[Pouch Processing Cost]', {
      pouchType,
      finalPouchType,
      widthCM,
      coefficient: costConfig.coefficient,
      totalCostKRW,
      minimumPrice: costConfig.minimumPrice,
      finalCostKRW
    });

    // Return KRW directly
    return finalCostKRW;
  }

  /**
   * 原価内訳集計 (Strict 15-Step Logic)
   * 
   * 1. 基礎原価 = 原材料費 + 印刷費 + 後加工費 (KRW)
   * 2. 製造者価格 = 基礎原価 × 1.4 (KRW)
   * 3. 関税込み価格 = 製造者価格 × 1.05 (KRW)
   * 4. 配送料追加 (KRW)
   * 5. 輸入原価 = 関税込み価格 + 配送料 (KRW)
   * 6. 最終販売価格 = 輸入原価 × 1.2 (KRW)
   * 7. 円貨換算 = 最終販売価格 × 0.12 (JPY)
   */
  private calculateCostBreakdown(
    filmCostResult: FilmCostResult,
    pouchProcessingCostKRW: number,
    quantity: number
  ): SKUCostBreakdown {
    // 1. 基礎原価 (KRW)
    const baseCostKRW = filmCostResult.totalCostKRW + pouchProcessingCostKRW;

    // 2. 製造者価格 (KRW) - Margin 40%
    const manufacturerPriceKRW = baseCostKRW * 1.4;
    const manufacturingMarginKRW = manufacturerPriceKRW - baseCostKRW;

    // 3. 関税込み価格 (KRW) - Duty 5%
    const priceWithDutyKRW = manufacturerPriceKRW * 1.05;
    const dutyKRW = priceWithDutyKRW - manufacturerPriceKRW;

    // 4. 配送料 (KRW)
    const deliveryKRW = filmCostResult.deliveryCostKRW || 0;

    // 5. 輸入原価 (KRW)
    const importCostKRW = priceWithDutyKRW + deliveryKRW;

    // 6. 最終販売価格 (KRW) - Seller Margin 20%
    const finalSellingPriceKRW = importCostKRW * 1.2;
    const salesMarginKRW = finalSellingPriceKRW - importCostKRW;

    // 7. 円貨換算 (JPY) - Rate 0.12
    const EXCHANGE_RATE = 0.12;
    const finalCostJPY = finalSellingPriceKRW * EXCHANGE_RATE;

    // Breakdown for display (Convert KRW components to JPY for consistent display)
    // Note: The sum of these 'raw' components will NOT equal the final price because of the compounding margins.
    // We add margin fields to the breakdown.

    return {
      materialCost: Math.round(filmCostResult.materialCost * EXCHANGE_RATE),
      printingCost: Math.round(filmCostResult.printingCost * EXCHANGE_RATE),
      laminationCost: Math.round(filmCostResult.laminationCost * EXCHANGE_RATE),
      slitterCost: Math.round(filmCostResult.slitterCost * EXCHANGE_RATE),
      pouchProcessingCost: Math.round(pouchProcessingCostKRW * EXCHANGE_RATE),

      manufacturingMargin: Math.round(manufacturingMarginKRW * EXCHANGE_RATE),
      duty: Math.round(dutyKRW * EXCHANGE_RATE),
      delivery: Math.round(deliveryKRW * EXCHANGE_RATE),
      salesMargin: Math.round(salesMarginKRW * EXCHANGE_RATE),

      totalCost: Math.round(finalCostJPY)
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
   */
  private getMaterialInfo(materialId: string): { density: number } | null {
    const materialData: Record<string, { density: number }> = {
      'PET': { density: 1.38 },
      'AL': { density: 2.70 },
      'LLDPE': { density: 0.92 },
      'NY': { density: 1.15 },
      'VMPET': { density: 1.38 }
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
    const theoreticalMetersForOrder = orderQuantity / pouchesPerMeter;

    // 最小発注量と同じフィルム量で生産可能な数量
    const economicQuantity = Math.floor(minimumFilmUsage * pouchesPerMeter);

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
      economicFilmUsage: minimumFilmUsage,
      efficiencyImprovement,
      unitCostAtOrderQty,
      unitCostAtEconomicQty,
      costSavings,
      costSavingsRate,
      recommendedQuantity,
      recommendationReason,
      // multiRollOptimization removed as it contradicts interface
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

          const filmCostResult = this.filmCalculator.calculateCostWithDBSettings({
            layers: accurateParams.filmLayers,
            width: effectiveMaterialWidth, // 原反の幅（570mmまたは740mm）
            length: totalLength,
            lossRate: 0, // 固定400mロスを既に含めているため、追加のロス率は0
            hasPrinting: true,
            printingType: 'basic',
            colors: 1,
            materialWidth: effectiveMaterialWidth  // 原反の幅（570mmまたは740mm）
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
          // 割引対象: フィルム原価 + 印刷費 + ラミネート費
          // 全額請求: スリッター費 + 配送料
          // ========================================

          // 割引適用対象（フィルム原価 + 印刷費 + ラミネート費）
          const discountableCost = filmCostResult.materialCost +
            filmCostResult.printingCost +
            filmCostResult.laminationCost;

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
            discountRule: count === 2 ? '40% OFF (2本目)' : count >= 3 ? '70% OFF (3本目以降)' : 'No discount'
          });
        } else {
          // 従来の近似計算（フォールバック）
          // 🆕 並列生産割引ルールに基づき近似計算を修正
          const baseFilmCost = currentUnitPrice * 0.7; // フィルム原価の概算（約70%）
          const nonFilmCost = currentUnitPrice * 0.3; // 加工費などの概算（約30%）

          // 並列生産割引適用
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
   * 並列生産割引計算
   *
   * docs/reports/tjfrP/Pouch_Cost_Calculation_Guide_2026.md セクション8参照
   *
   * 割引ルール:
   * - 2本目（2列目）: 40%割引 = 60%価格
   * - 3本目以降: 70%割引 = 30%価格
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

    // 2本目（2列目）: 40%割引 = 60%価格
    // 3本目以降: 70%割引 = 30%価格
    let discountMultiplier = 1; // 1本目は100%

    if (parallelCount >= 2) {
      discountMultiplier += 0.6; // 2本目は60%
    }

    if (parallelCount >= 3) {
      discountMultiplier += 0.3 * (parallelCount - 2); // 3本目以降は各30%
    }

    return basePrice * discountMultiplier;
  }

  /**
   * 並列生産割引詳細計算
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

    // 割引係数計算
    let discountMultiplier = 1;
    if (parallelCount >= 2) discountMultiplier += 0.6;
    if (parallelCount >= 3) discountMultiplier += 0.3 * (parallelCount - 2);

    // 内訳計算
    const firstUnit = basePrice; // 1本目は100%
    let additionalUnits = 0;
    if (parallelCount >= 2) {
      additionalUnits += basePrice * 0.6; // 2本目は60%
    }
    if (parallelCount >= 3) {
      additionalUnits += basePrice * 0.3 * (parallelCount - 2); // 3本目以降は各30%
    }

    return {
      originalPrice: Math.round(originalPrice),
      discountedPrice: Math.round(discountedPrice),
      discountAmount: Math.round(discountAmount),
      discountRate: Math.round(discountRate * 10) / 10,
      discountMultiplier: Math.round(discountMultiplier * 100) / 100,
      breakdown: {
        firstUnit: Math.round(firstUnit),
        additionalUnits: Math.round(additionalUnits),
        additionalUnitCount: parallelCount - 1
      }
    };
  }
}

// シングルトンインスタンス
export const pouchCostCalculator = new PouchCostCalculator();
