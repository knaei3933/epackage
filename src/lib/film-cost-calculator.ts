/**
 * 필름 원가 계산 엔진
 *
 * docs/reports/tjfrP/필름 계산.md 기반
 * 실제 필름 제조 원가를 계산하고, 고객별 마크업을 적용
 */

// ========================================
// 타입 정의
// ========================================

// DB 설정값 타입
export interface FilmCostSettings {
  // 필름 재료 단가 (원/kg)
  PET_unit_price?: number
  AL_unit_price?: number
  LLDPE_unit_price?: number
  NY_unit_price?: number
  VMPET_unit_price?: number

  // 필름 재료 밀도 (kg/m³)
  PET_density?: number
  AL_density?: number
  LLDPE_density?: number
  NY_density?: number
  VMPET_density?: number

  // 파우치 가공비 (원화)
  flat_3_side_cost?: number
  stand_up_cost?: number
  box_cost?: number
  other_cost?: number

  // 인쇄 단가
  printing_cost_per_m2?: number
  matte_cost_per_m?: number

  // 라미네이트 단가
  lamination_cost_per_m2?: number

  // 슬리터 단가
  slitter_cost_per_m?: number
  slitter_min_cost?: number

  // 환율/관세/배송
  exchange_rate_krw_to_jpy?: number
  duty_rate_import_duty?: number
  delivery_cost_per_roll?: number
  delivery_kg_per_roll?: number

  // 기본값
  production_default_loss_rate?: number
  pricing_default_markup_rate?: number
}

export interface FilmMaterial {
  id: string;
  name: string;
  nameJa: string;
  thickness: number; // 미크론 (μ)
  density: number; // 비중
  unitPrice: number; // 원/kg
}

export interface FilmStructureLayer {
  materialId: string;
  thickness: number; // 미크론 (μ)
}

export interface FilmCostCalculationParams {
  // 구조 정보
  layers: FilmStructureLayer[]; // 각 레이어의 재료와 두께

  // 치수 정보
  width: number; // mm
  length: number; // m (실제 공급 수량, 로스 제외)
  lossRate?: number; // 로스율 (기본값 0.4 = 40%)

  // 인쇄 정보
  hasPrinting?: boolean;
  printingType?: 'basic' | 'matte';
  colors?: number;

  // 재료 폭
  materialWidth?: number; // mm (540 또는 740)

  // 배송비 계산용 무게 (실제 납품량 기준)
  deliveryWeight?: number; // kg (지정 시 실제 납품량 기준 배송비 계산)

  // 후가공 옵션 (표면처리 비용 계산용)
  postProcessingOptions?: string[]; // ['glossy', 'matte', ...]

  // 고객별 마크업 (선택적 - 최종 가격 계산 시에만 사용)
  markupRate?: number; // 기본값 0.2 = 20%
}

export interface FilmCostResult {
  // 원가 breakdown (원화)
  materialCost: number; // 원단비
  printingCost: number; // 인쇄비
  laminationCost: number; // 라미네이트비
  slitterCost: number; // 슬리터비
  surfaceTreatmentCost: number; // 표면처리비 (glossy 등)
  totalCostKRW: number; // 총 원가 (원화: 재료+인쇄+라미+슬리터+표면처리)
  deliveryCostKRW: number; // 배송비 (원화)

  // 엔화 환산
  costJPY: number; // 엔화 환산 원가
  costWithDutyJPY: number; // 관세 포함 (5%)
  costWithDutyAndDeliveryJPY: number; // 배송비 포함 최종 원가

  // 중량 정보
  totalWeight: number; // 총 중량 (kg)
  rollCount: number; // 필요한 롤 수
  deliveryCostJPY: number; // 배송비 (엔)

  // 단가 정보
  costPerMeterJPY: number; // 미터당 단가 (엔/m)

  // 상세 정보
  breakdown: {
    materials: Array<{
      materialId: string;
      name: string;
      cost: number;
      weight: number;
    }>;
    printing: {
      basic: number;
      matte: number;
      total: number;
    };
    lamination: {
      count: number;
      cost: number;
    };
    slitter: {
      calculated: number;
      final: number;
    };
    surfaceTreatment: {
      type: 'glossy' | 'matte' | 'none';
      cost: number;
    };
  };
}

// ========================================
// 상수 정의
// ========================================

const FILM_MATERIALS: Record<string, FilmMaterial> = {
  'PET': {
    id: 'PET',
    name: 'PET',
    nameJa: 'PET',
    thickness: 12,
    density: 1.40,
    unitPrice: 2800
  },
  'AL': {
    id: 'AL',
    name: 'Aluminum',
    nameJa: 'アルミ',
    thickness: 7,
    density: 2.71,
    unitPrice: 7800
  },
  'LLDPE': {
    id: 'LLDPE',
    name: 'LLDPE',
    nameJa: 'LLDPE',
    thickness: 80,
    density: 0.92,
    unitPrice: 2800
  },
  'NY': {
    id: 'NY',
    name: 'Nylon',
    nameJa: 'ナイロン',
    thickness: 15,
    density: 1.16,
    unitPrice: 5400
  },
  'VMPET': {
    id: 'VMPET',
    name: 'VM PET',
    nameJa: 'VM PET',
    thickness: 7,
    density: 1.40,
    unitPrice: 3600
  },
  // KP_PE 재질용 추가
  'KP': {
    id: 'KP',
    name: 'KP (Coated PP)',
    nameJa: 'KP (コーティングPP)',
    thickness: 12,
    density: 0.91,
    unitPrice: 2600
  },
  'PE': {
    id: 'PE',
    name: 'PE (Polyethylene)',
    nameJa: 'PE (ポリエチレン)',
    thickness: 60,
    density: 0.92,
    unitPrice: 2800
  }
};

const EXCHANGE_RATE = 0.12; // 원화 → 엔화 환율
const DUTY_RATE = 0.05; // 관세율 5%
const DELIVERY_COST_PER_ROLL = 16800; // 엔/롤
const KG_PER_ROLL = 30; // 1롤 = 30kg

// 인쇄 단가 (원/m²)
const PRINTING_COST_PER_M2 = 475;
const MATTE_PRINTING_COST_PER_M = 40; // 원/m

// 표면처리 추가비 (원/m)
const MATTE_SURFACE_COST_PER_M = 40; // 매트 코팅 추가비 (원/m) - 실제 사용 값
// 주의: 광택(glossy)은 추가 비용 없음

// 라미네이트 단가 (원/m²)
const LAMINATION_COST_PER_M2 = 75;

// 슬리터 단가 (원/m)
const SLITTER_COST_PER_M = 10;
const SLITTER_MIN_COST = 30000; // 최소 슬리터 비용 (원)

// ========================================
// 필름 원가 계산 엔진 클래스
// ========================================

export class FilmCostCalculator {
  private cache: Map<string, FilmCostResult> = new Map();

  /**
   * 필름 원가 계산 메인 메서드 (기존 호환성 유지)
   */
  calculateCost(params: FilmCostCalculationParams): FilmCostResult {
    const cacheKey = this.generateCacheKey(params);

    if (this.cache.has(cacheKey)) {
      return { ...this.cache.get(cacheKey)! };
    }

    const result = this.performCalculation(params, null);
    this.cache.set(cacheKey, { ...result });

    return result;
  }

  /**
   * DB 설정값을 사용한 필름 원가 계산 메서드
   * @param params 계산 파라미터
   * @param settings DB에서 로드한 설정값 (null인 경우 기본값 사용)
   */
  calculateCostWithDBSettings(
    params: FilmCostCalculationParams,
    settings: FilmCostSettings | null
  ): FilmCostResult {
    const cacheKey = this.generateCacheKey(params) + JSON.stringify(settings);

    if (this.cache.has(cacheKey)) {
      return { ...this.cache.get(cacheKey)! };
    }

    const result = this.performCalculation(params, settings);
    this.cache.set(cacheKey, { ...result });

    return result;
  }

  /**
   * 실제 계산 수행 (DB 설정값 사용)
   */
  private performCalculation(
    params: FilmCostCalculationParams,
    dbSettings: FilmCostSettings | null
  ): FilmCostResult {
    const {
      layers,
      width,
      length,
      lossRate,
      hasPrinting = true,
      printingType = 'basic',
      materialWidth = 740
    } = params;

    // params.lossRate를 우선 적용 (SKU 모드에서 이미 로스가 포함된 경우 0을 전달)
    const effectiveLossRate = lossRate ?? dbSettings?.production_default_loss_rate ?? 0.4;

    // DB 설정값 또는 기본값
    const exchangeRate = dbSettings?.exchange_rate_krw_to_jpy ?? EXCHANGE_RATE;
    const dutyRate = dbSettings?.duty_rate_import_duty ?? DUTY_RATE;
    const deliveryCostPerRoll = dbSettings?.delivery_cost_per_roll ?? DELIVERY_COST_PER_ROLL;
    const kgPerRoll = dbSettings?.delivery_kg_per_roll ?? KG_PER_ROLL;


    // 로스 포함 미터수 계산 (effectiveLossRate 사용)
    const lengthWithLoss = length * (1 + effectiveLossRate);

    // 폭을 미터로 변환
    const widthM = materialWidth / 1000;

    // ========================================
    // 1. 원단비 계산
    // ========================================
    const materialBreakdown = this.calculateMaterialCost(
      layers,
      widthM,
      lengthWithLoss,
      dbSettings
    );

    // ========================================
    // 2. 인쇄비 계산
    // ========================================
    const printingBreakdown = this.calculatePrintingCost(
      widthM,
      lengthWithLoss,
      hasPrinting,
      printingType,
      dbSettings
    );

    // ========================================
    // 3. 라미네이트비 계산
    // ========================================
    const laminationBreakdown = this.calculateLaminationCost(
      widthM,
      lengthWithLoss,
      layers.length,
      dbSettings
    );

    // ========================================
    // 4. 슬리터비 계산
    // ========================================
    const slitterBreakdown = this.calculateSlitterCost(
      lengthWithLoss,
      dbSettings
    );

    // ========================================
    // 4.5. 표면처리비 계산 (glossy 등)
    // ========================================
    const surfaceTreatmentBreakdown = this.calculateSurfaceTreatmentCost(
      widthM,
      lengthWithLoss,
      params.postProcessingOptions
    );

    // ========================================
    // 5. 총 원가 계산 (원화)
    // ========================================
    const totalCostKRW =
      materialBreakdown.totalCost +
      printingBreakdown.total +
      laminationBreakdown.cost +
      slitterBreakdown.final +
      surfaceTreatmentBreakdown.cost;

    // ========================================
    // 6. 엔화 환산
    // ========================================
    const costJPY = totalCostKRW * exchangeRate;

    // ========================================
    // 7. 관세 추가 (5%)
    // ========================================
    const costWithDutyJPY = costJPY * (1 + dutyRate);

    // ========================================
    // 8. 배송비 계산
    // ========================================
    // ========================================
    // 8. 배송비 계산
    // ========================================
    const deliveryCostPerBoxKRW = 127980; // Box per 29kg (KRW)
    const kgPerBox = 29; // Max 29kg per box

    let deliveryCostKRW = 0;
    let boxCount = 0;
    let totalWeight = 0;

    if (params.deliveryWeight !== undefined) {
      // 실제 납품량 기준 배송비 계산
      totalWeight = params.deliveryWeight;
    } else {
      // 전체 무게 기준 배송비 계산 (기존 방식)
      totalWeight = materialBreakdown.totalWeight;
    }

    boxCount = Math.ceil(totalWeight / kgPerBox);
    deliveryCostKRW = boxCount * deliveryCostPerBoxKRW;

    // 엔화 환산 (기존 호환성 유지)
    const deliveryCostJPY = deliveryCostKRW * exchangeRate; // ~15,357 JPY

    // ========================================
    // 9. 최종 원가 (배송비 포함)
    // ========================================
    const costWithDutyAndDeliveryJPY = costWithDutyJPY + deliveryCostJPY;

    // ========================================
    // 10. 미터당 단가
    // ========================================
    const costPerMeterJPY = costWithDutyAndDeliveryJPY / length;

    return {
      materialCost: materialBreakdown.totalCost,
      printingCost: printingBreakdown.total,
      laminationCost: laminationBreakdown.cost,
      slitterCost: slitterBreakdown.final,
      surfaceTreatmentCost: surfaceTreatmentBreakdown.cost,
      totalCostKRW,
      deliveryCostKRW,
      costJPY,
      costWithDutyJPY,
      costWithDutyAndDeliveryJPY,
      totalWeight,
      rollCount: boxCount, // Renamed notionally but keeping property for compatibility
      deliveryCostJPY,
      costPerMeterJPY,
      breakdown: {
        materials: materialBreakdown.materials,
        printing: printingBreakdown,
        lamination: laminationBreakdown,
        slitter: slitterBreakdown,
        surfaceTreatment: surfaceTreatmentBreakdown
      }
    };
  }

  /**
   * 원단비 계산 (DB 설정값 사용)
   * 원단 가격 = 도깨 × 폭 × 미터수(로스포함) × 비중 × 단가
   */
  private calculateMaterialCost(
    layers: FilmStructureLayer[],
    widthM: number,
    lengthWithLoss: number,
    dbSettings: FilmCostSettings | null
  ) {
    const materials: Array<{
      materialId: string;
      name: string;
      cost: number;
      weight: number;
    }> = [];

    let totalCost = 0;
    let totalWeight = 0;

    // DB 설정값 또는 기본값으로 필름 재료 정보 구성
    const filmMaterials: Record<string, { unitPrice: number; density: number; nameJa: string }> = {
      'PET': {
        unitPrice: dbSettings?.PET_unit_price ?? FILM_MATERIALS.PET.unitPrice,
        density: dbSettings?.PET_density ?? FILM_MATERIALS.PET.density,
        nameJa: FILM_MATERIALS.PET.nameJa
      },
      'AL': {
        unitPrice: dbSettings?.AL_unit_price ?? FILM_MATERIALS.AL.unitPrice,
        density: dbSettings?.AL_density ?? FILM_MATERIALS.AL.density,
        nameJa: FILM_MATERIALS.AL.nameJa
      },
      'LLDPE': {
        unitPrice: dbSettings?.LLDPE_unit_price ?? FILM_MATERIALS.LLDPE.unitPrice,
        density: dbSettings?.LLDPE_density ?? FILM_MATERIALS.LLDPE.density,
        nameJa: FILM_MATERIALS.LLDPE.nameJa
      },
      'NY': {
        unitPrice: dbSettings?.NY_unit_price ?? FILM_MATERIALS.NY.unitPrice,
        density: dbSettings?.NY_density ?? FILM_MATERIALS.NY.density,
        nameJa: FILM_MATERIALS.NY.nameJa
      },
      'VMPET': {
        unitPrice: dbSettings?.VMPET_unit_price ?? FILM_MATERIALS.VMPET.unitPrice,
        density: dbSettings?.VMPET_density ?? FILM_MATERIALS.VMPET.density,
        nameJa: FILM_MATERIALS.VMPET.nameJa
      },
      // KP_PE 재질용 추가
      'KP': {
        unitPrice: FILM_MATERIALS.KP.unitPrice,
        density: FILM_MATERIALS.KP.density,
        nameJa: FILM_MATERIALS.KP.nameJa
      },
      'PE': {
        unitPrice: FILM_MATERIALS.PE.unitPrice,
        density: FILM_MATERIALS.PE.density,
        nameJa: FILM_MATERIALS.PE.nameJa
      }
    };

    console.log('[calculateMaterialCost] INPUT:', { layers, widthM, lengthWithLoss });

    for (const layer of layers) {
      const material = filmMaterials[layer.materialId];
      if (!material) continue;

      // 두께를 mm로 변환 (미크론 → mm)
      const thicknessMm = layer.thickness / 1000;

      // 원단 가격 계산
      const cost = thicknessMm * widthM * lengthWithLoss * material.density * material.unitPrice;

      // 중량 계산 (kg)
      const weight = thicknessMm * widthM * lengthWithLoss * material.density;

      console.log('[calculateMaterialCost] LAYER:', {
        materialId: layer.materialId,
        thickness: layer.thickness,
        thicknessMm,
        widthM,
        lengthWithLoss,
        density: material.density,
        unitPrice: material.unitPrice,
        cost,
        weight
      });

      materials.push({
        materialId: layer.materialId,
        name: material.nameJa,
        cost: Math.round(cost),
        weight: Math.round(weight * 100) / 100
      });

      totalCost += cost;
      totalWeight += weight;
    }

    console.log('[calculateMaterialCost] RESULT:', {
      totalCost,
      totalWeight,
      totalCostRounded: Math.round(totalCost)
    });

    return {
      materials,
      totalCost: Math.round(totalCost),
      totalWeight: Math.round(totalWeight * 100) / 100
    };
  }

  /**
   * 인쇄비 계산 (DB 설정값 사용)
   *
   * 매트 인쇄 추가비 계산 (요구사항):
   * - 매트 인쇄 추가비(원) = 필름 폭(m) × 40원/m × 사용 미터수
   * - 예: 590mm 폭 필름 500m 사용 = 0.59 × 40 × 500 = 11,800원
   */
  private calculatePrintingCost(
    widthM: number,
    lengthWithLoss: number,
    hasPrinting: boolean,
    printingType: 'basic' | 'matte',
    dbSettings: FilmCostSettings | null
  ) {
    if (!hasPrinting) {
      return {
        basic: 0,
        matte: 0,
        total: 0
      };
    }

    // DB 설정값 또는 기본값
    const printingCostPerM2 = dbSettings?.printing_cost_per_m2 ?? PRINTING_COST_PER_M2;

    // 기본 인쇄비 = 1m × 미터수 × 인쇄 단가 (ガイド準拠: 1m固定)
    // docs/reports/tjfrP/계산가이드 기준: "항상 1m 폭으로 계산"
    const basic = 1 * lengthWithLoss * printingCostPerM2;

    // 매트 인쇄 추가비 계산 (요구사항 수정)
    // 매트 인쇄 추가비(원) = 필름 폭(m) × 40원/m × 사용 미터수
    const matte = printingType === 'matte'
      ? widthM * MATTE_PRINTING_COST_PER_M * lengthWithLoss  // 필름 폭(m) × 40원/m × 사용 미터수
      : 0;

    return {
      basic: Math.round(basic),
      matte: Math.round(matte),
      total: Math.round(basic + matte)
    };
  }

  /**
   * 라미네이트비 계산 (DB 설정값 사용)
   * 라미 횟수 = 중지 - 1
   */
  private calculateLaminationCost(
    widthM: number,
    lengthWithLoss: number,
    layerCount: number,
    dbSettings: FilmCostSettings | null
  ) {
    // 라미 횟수 = 중지 - 1
    const laminationCount = Math.max(0, layerCount - 1);

    // DB 설정값 또는 기본값
    const laminationCostPerM2 = dbSettings?.lamination_cost_per_m2 ?? LAMINATION_COST_PER_M2;

    // 라미 공정비 = 폭 × 미터수 × 라미네이트 단가 × 라미횟수
    const cost = widthM * lengthWithLoss * laminationCostPerM2 * laminationCount;

    return {
      count: laminationCount,
      cost: Math.round(cost)
    };
  }

  /**
   * 슬리터비 계산 (DB 설정값 사용)
   * 슬리터 비용 = MAX(최소 비용, 미터수 × 단가)
   */
  private calculateSlitterCost(
    lengthWithLoss: number,
    dbSettings: FilmCostSettings | null
  ) {
    // DB 설정값 또는 기본값
    const slitterCostPerM = dbSettings?.slitter_cost_per_m ?? SLITTER_COST_PER_M;
    const slitterMinCost = dbSettings?.slitter_min_cost ?? SLITTER_MIN_COST;

    const calculated = lengthWithLoss * slitterCostPerM;
    const final = Math.max(slitterMinCost, calculated);

    return {
      calculated: Math.round(calculated),
      final: Math.round(final)
    };
  }

  /**
   * 표면처리비 계산 (glossy/matte 코팅 비용)
   *
   * 요구사항 (사용자 피드백 기반):
   * - glossy/matte는 가격乘数(1.06, 1.04)가 아닌 추가 비용으로 계산
   * - 표면처리비(원) = 필름 폭(m) × 단가(원/m) × 사용 미터수
   *
   * 예: 매트 인쇄 추가비 = 필름 폭(m) × 40원/m × 사용 미터수
   * 예: 광택(glossy) 코팅 = 필름 폭(m) × 35원/m × 사용 미터수
   */
  private calculateSurfaceTreatmentCost(
    widthM: number,
    lengthWithLoss: number,
    postProcessingOptions: string[] = []
  ): {
    type: 'glossy' | 'matte' | 'none';
    cost: number;
  } {
    // デバッグログ: postProcessingOptionsの値を確認
    console.log('[calculateSurfaceTreatmentCost] DEBUG:', {
      widthM,
      lengthWithLoss,
      postProcessingOptions,
      hasGlossy: postProcessingOptions.includes('glossy'),
      hasMatte: postProcessingOptions.includes('matte')
    });

    // 후가공 옵션에서 표면처리 타입 확인
    const hasGlossy = postProcessingOptions.includes('glossy');
    const hasMatte = postProcessingOptions.includes('matte');

    if (!hasGlossy && !hasMatte) {
      console.log('[calculateSurfaceTreatmentCost] No surface treatment selected, returning cost: 0');
      return { type: 'none', cost: 0 };
    }

    // 표면처리 비용 계산: 필름 폭(m) × 단가(원/m) × 사용 미터수
    // 주의: 광택(glossy)은 추가 비용 없음
    // 매트(matte)만 코팅 추가비 적용
    if (hasGlossy) {
      console.log('[calculateSurfaceTreatmentCost] Glossy treatment - no additional cost');
      return { type: 'glossy', cost: 0 };
    }

    if (hasMatte) {
      const cost = widthM * MATTE_SURFACE_COST_PER_M * lengthWithLoss;
      console.log('[calculateSurfaceTreatmentCost] Matte treatment cost calculated:', {
        widthM,
        MATTE_SURFACE_COST_PER_M,
        lengthWithLoss,
        cost,
        roundedCost: Math.round(cost)
      });
      return { type: 'matte', cost: Math.round(cost) };
    }

    return { type: 'none', cost: 0 };
  }

  /**
   * 캐시 키 생성
   */
  private generateCacheKey(params: FilmCostCalculationParams): string {
    return JSON.stringify(params);
  }

  /**
   * 파우치 가공비 계산 (고정비용 방식)
   *
   * [평방(3방) / 스탠드 후가공비]
   * - 평방(3방): 200,000원 → 지퍼 있으면 250,000원 (+50,000원)
   * - 스탠드: 250,000원 → 지퍼 있으면 280,000원 (+30,000원)
   * - 박스형: 400,000원 (지퍼 미지원)
   * - 기타: 300,000원
   *
   * @param quantity 파우치 수량
   * @param pouchType 파우치 타입
   * @param hasZipper 지퍼 유무
   * @returns 파우치 가공비 (엔)
   */
  static calculatePouchProcessingCost(
    quantity: number,
    pouchType: 'flat_3_side' | 'stand_up' | 'box' | 'other',
    hasZipper: boolean = false
  ): number {
    // 파우치 기본 가공비 (원화)
    const BASE_POUCH_PROCESSING_COSTS = {
      'flat_3_side': 200000, // 3방파우치 (평방)
      'stand_up': 250000, // 스탠드파우치
      'box': 400000, // 박스형파우치
      'other': 300000 // 기타
    };

    // 지퍼 추가 가공비 (원화)
    const ZIPPER_ADDITIONAL_COSTS = {
      'flat_3_side': 50000, // 평방 + 지퍼: +50,000원
      'stand_up': 30000, // 스탠드 + 지퍼: +30,000원
      'box': 0, // 박스형은 지퍼 미지원
      'other': 0 // 기타
    };

    const baseCost = BASE_POUCH_PROCESSING_COSTS[pouchType] || BASE_POUCH_PROCESSING_COSTS['other'];
    const zipperCost = hasZipper ? (ZIPPER_ADDITIONAL_COSTS[pouchType] || 0) : 0;
    const totalCostKRW = baseCost + zipperCost;

    // 엔화 환산
    const totalCostJPY = totalCostKRW * EXCHANGE_RATE;

    // 전체 가공비 (수량无关)
    return totalCostJPY;
  }

  /**
   * 고객별 마크업 적용 최종 가격 계산
   *
   * @param baseCost 원가 (엔)
   * @param markupRate 마크업율 (기본값 0.5 = 50%)
   * @returns 마크업 적용 후 가격 (엔)
   */
  static applyMarkup(baseCost: number, markupRate: number = 0.2): number {
    return baseCost * (1 + markupRate);
  }

  /**
   * 파우치 제품 최종 가격 계산
   * 필름 원가 + 파우치 가공비 + 마크업
   *
   * @param filmCost 필름 원가 결과
   * @param quantity 파우치 수량
   * @param pouchType 파우치 타입
   * @param hasZipper 지퍼 유무
   * @param markupRate 마크업율 (기본값 0.2 = 20%)
   * @returns 최종 가격 (엔)
   */
  static calculatePouchFinalPrice(
    filmCost: FilmCostResult,
    quantity: number,
    pouchType: 'flat_3_side' | 'stand_up' | 'box' | 'other',
    hasZipper: boolean = false,
    markupRate: number = 0.2
  ): {
    filmCostJPY: number;
    pouchProcessingCostJPY: number;
    baseCostJPY: number;
    finalPriceJPY: number;
    unitPriceJPY: number;
  } {
    // 필름 원가 (미터당)
    const filmCostJPY = filmCost.costPerMeterJPY * quantity;

    // 파우치 가공비 (지퍼 유무 반영)
    const pouchProcessingCostJPY = this.calculatePouchProcessingCost(quantity, pouchType, hasZipper);

    // 기본 원가 = 필름 원가 + 파우치 가공비
    const baseCostJPY = filmCostJPY + pouchProcessingCostJPY;

    // 마크업 적용
    const finalPriceJPY = this.applyMarkup(baseCostJPY, markupRate);

    // 단가
    const unitPriceJPY = finalPriceJPY / quantity;

    return {
      filmCostJPY: Math.round(filmCostJPY),
      pouchProcessingCostJPY: Math.round(pouchProcessingCostJPY),
      baseCostJPY: Math.round(baseCostJPY),
      finalPriceJPY: Math.round(finalPriceJPY),
      unitPriceJPY: Math.round(unitPriceJPY)
    };
  }
}

// ========================================
// 기본 설정 익스포트
// ========================================

export const filmCalculator = new FilmCostCalculator();

// 기본 레이어 설정 (PET/AL/LLDPE 3중지)
export const DEFAULT_LAYERS: FilmStructureLayer[] = [
  { materialId: 'PET', thickness: 12 },
  { materialId: 'AL', thickness: 7 },
  { materialId: 'LLDPE', thickness: 80 }
];

// 재료 폭 설정
export const MATERIAL_WIDTHS = {
  WIDTH_540MM: 540,
  WIDTH_740MM: 740
} as const;
