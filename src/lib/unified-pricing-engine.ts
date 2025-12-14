import { z } from 'zod'

// 통합 가격 엔진을 위한 인터페이스 정의
export interface UnifiedQuoteParams {
  bagTypeId: string
  materialId: string
  width: number
  height: number
  depth?: number
  quantity: number
  thickness?: number
  thicknessSelection?: string
  thicknessMultiplier?: number
  isUVPrinting?: boolean
  postProcessingOptions?: string[]
  postProcessingMultiplier?: number
  printingType?: 'digital' | 'gravure'
  printingColors?: number
  doubleSided?: boolean
  deliveryLocation?: 'domestic' | 'international'
  urgency?: 'standard' | 'express'
}

export interface UnifiedQuoteResult {
  unitPrice: number
  totalPrice: number
  currency: string
  breakdown: {
    material: number
    processing: number
    printing: number
    setup: number
    discount: number
    delivery: number
    subtotal: number
    total: number
  }
  leadTimeDays: number
  validUntil: Date
  minOrderQuantity: number
  // 스마트 견적 호환성
  details?: {
    fixedCost: number
    variableCostPerUnit: number
    surcharge: number
    materialRate: number
    area: number
  }
  // 두께 정보
  thicknessMultiplier?: number
  selectedThicknessName?: string
  // 후가공 정보
  postProcessingMultiplier?: number
  // 최소 가격 정책 적용 여부
  minimumPriceApplied?: boolean
}

// 두께 설정
export interface ThicknessOption {
  id: string
  name: string
  nameJa: string
  specification: string
  weightRange: string
  multiplier: number
}

// 재료별 두께 옵션
export const MATERIAL_THICKNESS_OPTIONS: Record<string, ThicknessOption[]> = {
  'opp-alu-foil': [
    {
      id: 'light',
      name: 'Light Weight (~100g)',
      nameJa: '軽量タイプ (~100g)',
      specification: 'PET12μ+AL７μ+PET12μ+LLDPE60μ',
      weightRange: '~100g',
      multiplier: 0.9
    },
    {
      id: 'medium',
      name: 'Standard (~500g)',
      nameJa: '標準タイプ (~500g)',
      specification: 'PET12μ+AL７μ+PET12μ+LLDPE80μ',
      weightRange: '~500g',
      multiplier: 1.0
    },
    {
      id: 'heavy',
      name: 'Heavy Duty (~800g)',
      nameJa: '高耐久タイプ (~800g)',
      specification: 'PET12μ+AL７μ+PET12μ+LLDPE100μ',
      weightRange: '~800g',
      multiplier: 1.1
    },
    {
      id: 'ultra',
      name: 'Ultra Heavy (800g+)',
      nameJa: '超耐久タイプ (800g~)',
      specification: 'PET12μ+AL７μ+PET12μ+LLDPE110μ',
      weightRange: '800g~',
      multiplier: 1.2
    }
  ],
  'kraft-pe': [
    {
      id: 'light',
      name: 'Light Weight (~200g)',
      nameJa: '軽量タイプ (~200g)',
      specification: 'Kraft紙70μ+PE30μ',
      weightRange: '~200g',
      multiplier: 0.9
    },
    {
      id: 'medium',
      name: 'Standard (~500g)',
      nameJa: '標準タイプ (~500g)',
      specification: 'Kraft紙80μ+PE40μ',
      weightRange: '~500g',
      multiplier: 1.0
    },
    {
      id: 'heavy',
      name: 'Heavy Duty (~800g)',
      nameJa: '高耐久タイプ (~800g)',
      specification: 'Kraft紙90μ+PE50μ',
      weightRange: '~800g',
      multiplier: 1.1
    }
  ],
  'alu-vapor': [
    {
      id: 'light',
      name: 'Light Weight (~100g)',
      nameJa: '軽量タイプ (~100g)',
      specification: 'PET12μ+VMPET７μ+PET12μ+LLDPE60μ',
      weightRange: '~100g',
      multiplier: 0.9
    },
    {
      id: 'medium',
      name: 'Standard (~500g)',
      nameJa: '標準タイプ (~500g)',
      specification: 'PET12μ+VMPET７μ+PET12μ+LLDPE80μ',
      weightRange: '~500g',
      multiplier: 1.0
    },
    {
      id: 'heavy',
      name: 'Heavy Duty (~800g)',
      nameJa: '高耐久タイプ (~800g)',
      specification: 'PET12μ+VMPET７μ+PET12μ+LLDPE100μ',
      weightRange: '~800g',
      multiplier: 1.1
    }
  ],
  'pet-transparent': [
    {
      id: 'light',
      name: 'Thin Film (~50g)',
      nameJa: '薄肉タイプ (~50g)',
      specification: 'PET12μ+LLDPE40μ',
      weightRange: '~50g',
      multiplier: 0.9
    },
    {
      id: 'medium',
      name: 'Standard (~300g)',
      nameJa: '標準タイプ (~300g)',
      specification: 'PET12μ+LLDPE60μ',
      weightRange: '~300g',
      multiplier: 1.0
    },
    {
      id: 'heavy',
      name: 'Heavy Duty (~600g)',
      nameJa: '高耐久タイプ (~600g)',
      specification: 'PET12μ+LLDPE80μ',
      weightRange: '~600g',
      multiplier: 1.1
    }
  ]
}

// 상수 정의
const CONSTANTS = {
  MIN_ORDER_QUANTITY: 100,
  MAX_ORDER_QUANTITY: 100000,
  SMALL_LOT_THRESHOLD: 3000,
  MINIMUM_PRICE: 160000, // 160,000엔 최소 가격 정책

  // 재료 비용 (엔/kg)
  MATERIAL_COSTS: {
    'opp-alu-foil': 1200,
    'kraft-pe': 380,
    'alu-vapor': 900,
    'pet-transparent': 450,
    'PET': 450,
    'PP': 300,
    'PE': 250,
    'ALUMINUM': 1200,
    'PAPER_LAMINATE': 380
  } as const,

  // 재료 밀도 (kg/m³)
  MATERIAL_DENSITY: {
    'PET': 1.38,
    'PP': 0.90,
    'PE': 0.92,
    'ALUMINUM': 2.70,
    'PAPER_LAMINATE': 0.80
  } as const,

  // 제품 유형별 가공비 (엔/개)
  PROCESSING_COSTS: {
    'flat-pouch': 15,
    'standing-pouch': 18,
    'flat_3_side': 15,
    'stand_up': 18,
    'gusset': 20,
    'box': 22,
    'flat_with_zip': 20,
    'special': 25,
    'soft_pouch': 17
  } as const,

  // 인쇄 설정
  PRINTING_COSTS: {
    digital: {
      setupFee: 10000,
      perColorPerUnit: 5,
      minCharge: 5000
    },
    gravure: {
      setupFee: 50000,
      perColorPerUnit: 2,
      minCharge: 20000
    }
  } as const,

  // 배송비
  DELIVERY_COSTS: {
    domestic: {
      base: 1500,
      perKg: 150,
      freeThreshold: 50000
    },
    international: {
      base: 5000,
      perKg: 500,
      freeThreshold: 200000
    }
  } as const,

  // 소량 주문 수수료
  SMALL_LOT_SURCHARGE: 30000,

  // UV 인쇄 설정
  UV_PRINTING_FIXED_COST: 15000,
  UV_PRINTING_SURCHARGE: 20000,

  // 후가공 배수 (기본값)
  DEFAULT_POST_PROCESSING_MULTIPLIER: 1.0
} as const

export class UnifiedPricingEngine {
  private cache: Map<string, UnifiedQuoteResult> = new Map()

  constructor() {
    // 캐시 크기 제한
    if (typeof window !== 'undefined') {
      setInterval(() => {
        if (this.cache.size > 100) {
          this.cache.clear()
        }
      }, 60000) // 1분마다 캐시 정리
    }
  }

  /**
   * 통합 견적 계산 메서드
   */
  async calculateQuote(params: UnifiedQuoteParams): Promise<UnifiedQuoteResult> {
    // 캐시 키 생성
    const cacheKey = this.generateCacheKey(params)

    // 캐시 확인
    if (this.cache.has(cacheKey)) {
      return { ...this.cache.get(cacheKey)! }
    }

    const result = await this.performCalculation(params)

    // 캐시 저장 (복사본 저장)
    this.cache.set(cacheKey, { ...result })

    return result
  }

  /**
   * 실제 계산 수행
   */
  private async performCalculation(params: UnifiedQuoteParams): Promise<UnifiedQuoteResult> {
    const {
      bagTypeId,
      materialId,
      width,
      height,
      depth = 0,
      quantity,
      thicknessSelection,
      thicknessMultiplier = 1.0,
      isUVPrinting = false,
      postProcessingMultiplier = CONSTANTS.DEFAULT_POST_PROCESSING_MULTIPLIER,
      printingType = 'digital',
      printingColors = 1,
      doubleSided = false,
      deliveryLocation = 'domestic',
      urgency = 'standard'
    } = params

    // 파라미터 검증
    this.validateParams(params)

    // 1. 재료비 계산
    const materialCost = this.calculateMaterialCost(
      materialId,
      width,
      height,
      depth,
      bagTypeId,
      thicknessSelection,
      thicknessMultiplier
    )

    // 2. 가공비 계산
    const processingCost = this.calculateProcessingCost(
      bagTypeId,
      quantity,
      isUVPrinting
    )

    // 3. 인쇄비 계산
    const printingCost = this.calculatePrintingCost(
      printingType,
      printingColors,
      quantity,
      doubleSided,
      isUVPrinting
    )

    // 4. 설정비 계산
    const setupCost = this.calculateSetupCost(
      bagTypeId,
      quantity,
      isUVPrinting
    )

    // 5. 소량 주문 수수료 계산
    const surcharge = this.calculateSmallLotSurcharge(
      quantity,
      bagTypeId,
      isUVPrinting
    )

    // 6. 중간 계산
    const subtotal = materialCost + processingCost + printingCost + setupCost + surcharge

    // 7. 후가공 배수 적용
    const postProcessingAdjustedTotal = subtotal * postProcessingMultiplier

    // 8. 최소 가격 정책 적용
    const minimumPriceAdjustedTotal = Math.max(
      postProcessingAdjustedTotal,
      CONSTANTS.MINIMUM_PRICE
    )

    // 9. 대량 할인 계산
    const discountAmount = this.calculateVolumeDiscount(quantity, minimumPriceAdjustedTotal)

    // 10. 배송비 계산
    const deliveryCost = this.calculateDeliveryCost(
      deliveryLocation,
      quantity,
      width,
      height,
      depth,
      materialId
    )

    // 11. 최종 가격 계산
    const total = Math.max(minimumPriceAdjustedTotal - discountAmount + deliveryCost, CONSTANTS.MINIMUM_PRICE)

    // 12. 리드타임 계산
    const leadTimeDays = this.calculateLeadTime(
      urgency,
      quantity,
      isUVPrinting,
      postProcessingMultiplier > 1.0
    )

    // 13. 결과 구성
    const result: UnifiedQuoteResult = {
      unitPrice: Math.round(total / quantity),
      totalPrice: Math.round(total),
      currency: 'JPY',
      breakdown: {
        material: Math.round(materialCost),
        processing: Math.round(processingCost),
        printing: Math.round(printingCost),
        setup: Math.round(setupCost),
        discount: Math.round(discountAmount),
        delivery: Math.round(deliveryCost),
        subtotal: Math.round(subtotal),
        total: Math.round(total)
      },
      leadTimeDays,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30일 유효
      minOrderQuantity: CONSTANTS.MIN_ORDER_QUANTITY,
      // 스마트 견적 호환성
      details: {
        fixedCost: setupCost,
        variableCostPerUnit: (materialCost + processingCost + printingCost) / quantity,
        surcharge,
        materialRate: this.getMaterialRate(materialId),
        area: width * height
      },
      // 두께 정보
      thicknessMultiplier: thicknessMultiplier !== 1.0 ? thicknessMultiplier : undefined,
      selectedThicknessName: this.getSelectedThicknessName(materialId, thicknessSelection),
      // 후가공 정보
      postProcessingMultiplier: postProcessingMultiplier !== 1.0 ? postProcessingMultiplier : undefined,
      // 최소 가격 적용 여부
      minimumPriceApplied: minimumPriceAdjustedTotal >= total
    }

    return result
  }

  /**
   * 파라미터 검증
   */
  private validateParams(params: UnifiedQuoteParams): void {
    if (params.quantity < CONSTANTS.MIN_ORDER_QUANTITY) {
      throw new Error(`최소 주문 수량은 ${CONSTANTS.MIN_ORDER_QUANTITY}개입니다.`)
    }

    if (params.quantity > CONSTANTS.MAX_ORDER_QUANTITY) {
      throw new Error(`최대 주문 수량은 ${CONSTANTS.MAX_ORDER_QUANTITY}개입니다.`)
    }

    if (params.width < 10 || params.width > 1000) {
      throw new Error('가로 크기는 10mm에서 1000mm 사이여야 합니다.')
    }

    if (params.height < 10 || params.height > 1000) {
      throw new Error('세로 크기는 10mm에서 1000mm 사이여야 합니다.')
    }
  }

  /**
   * 재료비 계산
   */
  private calculateMaterialCost(
    materialId: string,
    width: number,
    height: number,
    depth: number,
    bagTypeId: string,
    thicknessSelection?: string,
    thicknessMultiplier: number = 1.0
  ): number {
    const materialCostPerKg = (CONSTANTS.MATERIAL_COSTS as any)[materialId] || CONSTANTS.MATERIAL_COSTS.PET

    // 면적 계산 (mm² → m²)
    const areaMm2 = width * height
    const areaM2 = areaMm2 / 1000000

    // 부피 계산 (단순화)
    const thickness = thicknessSelection ? this.getThicknessInMicrons(thicknessSelection) : 80 // 기본 두께 80μm
    const volumeM3 = areaM2 * (thickness / 1000000)

    // 무게 계산 (kg)
    const materialRate = this.getMaterialRate(materialId)
    const weightKg = volumeM3 * materialRate

    // 재료비
    const materialCost = weightKg * materialCostPerKg * thicknessMultiplier

    return materialCost
  }

  /**
   * 가공비 계산
   */
  private calculateProcessingCost(
    bagTypeId: string,
    quantity: number,
    isUVPrinting: boolean = false
  ): number {
    const baseCost = (CONSTANTS.PROCESSING_COSTS as any)[bagTypeId] || CONSTANTS.PROCESSING_COSTS['flat-pouch']
    const isFlat = bagTypeId.toLowerCase().includes('flat') || bagTypeId.toLowerCase().includes('3_side')

    // UV 인쇄 시 가공비 조정
    if (isUVPrinting) {
      return baseCost * 1.1 // 10% 추가
    }

    return baseCost * quantity
  }

  /**
   * 인쇄비 계산
   */
  private calculatePrintingCost(
    printingType: 'digital' | 'gravure',
    colors: number,
    quantity: number,
    doubleSided: boolean = false,
    isUVPrinting: boolean = false
  ): number {
    if (isUVPrinting) {
      return CONSTANTS.UV_PRINTING_FIXED_COST
    }

    const printingConfig = CONSTANTS.PRINTING_COSTS[printingType]
    const colorMultiplier = doubleSided ? 2 : 1

    const colorCost = colors * colorMultiplier * printingConfig.perColorPerUnit * quantity
    const setupCost = printingConfig.setupFee

    const totalCost = setupCost + colorCost

    return Math.max(totalCost, printingConfig.minCharge)
  }

  /**
   * 설정비 계산
   */
  private calculateSetupCost(
    bagTypeId: string,
    quantity: number,
    isUVPrinting: boolean = false
  ): number {
    if (isUVPrinting) {
      return CONSTANTS.UV_PRINTING_FIXED_COST
    }

    const isFlat = bagTypeId.toLowerCase().includes('flat') || bagTypeId.toLowerCase().includes('3_side')
    let baseSetupCost = isFlat ? 30000 : 40000

    // 소량 주문 시 설정비 조정
    if (quantity < CONSTANTS.SMALL_LOT_THRESHOLD) {
      baseSetupCost *= 1.2
    }

    return baseSetupCost
  }

  /**
   * 소량 주문 수수료 계산
   */
  private calculateSmallLotSurcharge(
    quantity: number,
    bagTypeId: string,
    isUVPrinting: boolean = false
  ): number {
    if (isUVPrinting && quantity < CONSTANTS.SMALL_LOT_THRESHOLD) {
      return CONSTANTS.UV_PRINTING_SURCHARGE
    }

    const isFlat = bagTypeId.toLowerCase().includes('flat') || bagTypeId.toLowerCase().includes('3_side')

    if (isFlat && quantity < CONSTANTS.SMALL_LOT_THRESHOLD) {
      return CONSTANTS.SMALL_LOT_SURCHARGE
    }

    return 0
  }

  /**
   * 대량 할인 계산
   */
  private calculateVolumeDiscount(quantity: number, subtotal: number): number {
    let discountRate = 0

    if (quantity >= 10000) {
      discountRate = 0.15 // 15%
    } else if (quantity >= 5000) {
      discountRate = 0.10 // 10%
    } else if (quantity >= 3000) {
      discountRate = 0.05 // 5%
    }

    return subtotal * discountRate
  }

  /**
   * 배송비 계산
   */
  private calculateDeliveryCost(
    deliveryLocation: 'domestic' | 'international',
    quantity: number,
    width: number,
    height: number,
    depth: number,
    materialId: string
  ): number {
    const deliveryConfig = CONSTANTS.DELIVERY_COSTS[deliveryLocation]

    // 예상 무게 계산
    const areaMm2 = width * height
    const thickness = 80 // 기본 두께
    const volumeM3 = (areaMm2 / 1000000) * (thickness / 1000000)
    const materialRate = this.getMaterialRate(materialId)
    const estimatedWeight = volumeM3 * materialRate

    const weightBasedCost = estimatedWeight * deliveryConfig.perKg
    const totalCost = deliveryConfig.base + weightBasedCost

    // 무료 배송 임계값 확인
    if (totalCost < deliveryConfig.freeThreshold) {
      return totalCost
    }

    return 0
  }

  /**
   * 리드타임 계산
   */
  private calculateLeadTime(
    urgency: 'standard' | 'express',
    quantity: number,
    isUVPrinting: boolean = false,
    hasPostProcessing: boolean = false
  ): number {
    let baseDays = 14 // 기본 14일 (2주)

    // 긴급 주문
    if (urgency === 'express') {
      baseDays = 7
    }

    // UV 인쇄
    if (isUVPrinting) {
      baseDays = Math.max(baseDays - 3, 5) // 최소 5일
    }

    // 대량 주문
    if (quantity >= 10000) {
      baseDays += 7
    } else if (quantity >= 5000) {
      baseDays += 3
    }

    // 후가공
    if (hasPostProcessing) {
      baseDays += 2
    }

    return baseDays
  }

  /**
   * 재료 비율 가져오기
   */
  private getMaterialRate(materialId: string): number {
    const rateMap: Record<string, number> = {
      'opp-alu-foil': 2.5,
      'kraft-pe': 0.85,
      'alu-vapor': 2.0,
      'pet-transparent': 1.4,
      'PET': 1.38,
      'PP': 0.90,
      'PE': 0.92,
      'ALUMINUM': 2.70,
      'PAPER_LAMINATE': 0.80
    }

    return rateMap[materialId] || rateMap.PET
  }

  /**
   * 두께(마이크론) 가져오기
   */
  private getThicknessInMicrons(thicknessSelection?: string): number {
    if (!thicknessSelection) return 80

    const thicknessMap: Record<string, number> = {
      'light': 60,
      'medium': 80,
      'heavy': 100,
      'ultra': 120
    }

    return thicknessMap[thicknessSelection] || 80
  }

  /**
   * 선택된 두께 이름 가져오기
   */
  private getSelectedThicknessName(materialId: string, thicknessSelection?: string): string | undefined {
    if (!thicknessSelection) return undefined

    const options = MATERIAL_THICKNESS_OPTIONS[materialId]
    if (!options) return undefined

    const selected = options.find(opt => opt.id === thicknessSelection)
    return selected?.nameJa || selected?.name
  }

  /**
   * 캐시 키 생성
   */
  private generateCacheKey(params: UnifiedQuoteParams): string {
    const keyParts = [
      params.bagTypeId,
      params.materialId,
      params.width.toString(),
      params.height.toString(),
      params.depth?.toString() || '0',
      params.quantity.toString(),
      params.thicknessSelection || 'default',
      params.thicknessMultiplier?.toString() || '1.0',
      params.isUVPrinting?.toString() || 'false',
      params.postProcessingMultiplier?.toString() || '1.0',
      params.printingType || 'digital',
      params.printingColors?.toString() || '1',
      params.doubleSided?.toString() || 'false',
      params.deliveryLocation || 'domestic',
      params.urgency || 'standard'
    ]

    return keyParts.join('|')
  }

  /**
   * 캐시 비우기
   */
  public clearCache(): void {
    this.cache.clear()
  }

  /**
   * 캐시 크기 가져오기
   */
  public getCacheSize(): number {
    return this.cache.size
  }

  /**
   * 스마트 견적 호환성을 위한 단순 계산 메서드
   */
  async calculateSimpleQuote(params: {
    bagTypeId: string
    materialId: string
    width: number
    height: number
    quantity: number
    isUVPrinting?: boolean
    thicknessSelection?: string
    postProcessingMultiplier?: number
  }): Promise<Omit<UnifiedQuoteResult, 'breakdown' | 'validUntil' | 'minOrderQuantity'>> {
    const result = await this.calculateQuote({
      ...params,
      isUVPrinting: params.isUVPrinting || false,
      postProcessingMultiplier: params.postProcessingMultiplier || 1.0
    })

    return {
      unitPrice: result.unitPrice,
      totalPrice: result.totalPrice,
      currency: result.currency,
      leadTimeDays: result.leadTimeDays,
      details: result.details,
      thicknessMultiplier: result.thicknessMultiplier,
      selectedThicknessName: result.selectedThicknessName,
      postProcessingMultiplier: result.postProcessingMultiplier,
      minimumPriceApplied: result.minimumPriceApplied
    }
  }
}

// 싱글톤 인스턴스 내보내기
export const unifiedPricingEngine = new UnifiedPricingEngine()