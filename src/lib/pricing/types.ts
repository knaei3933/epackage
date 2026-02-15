// Core bag specification types
export interface BagSpecifications {
    bagTypeId: string
    materialCompositionId: string
    width: number // mm
    height: number // mm
    depth?: number // mm for gusset/standing bags
    capacity: number // ml
    zipperType?: 'zipper' | 'slider' | 'none'
    valveType?: 'coffee' | 'degas' | 'none'
    handleType?: 'die-cut' | 'flexible' | 'none'
}

// Printing specifications
export interface PrintingSpecifications {
    printColors: {
        front: number
        back: number
        sides?: { left: number; right: number }
    }
    printCoverage: 'partial' | 'full' | 'custom'
    printPosition: 'center' | 'offset' | 'wrap' | 'custom'
    printQuality: 'standard' | 'premium' | 'photo'
    matteFinish?: boolean
    spotUV?: boolean
    metallicInk?: boolean
}

// Feature specifications for special treatments
export interface FeatureSpecifications {
    window?: {
        shape: 'rectangle' | 'circle' | 'custom'
        material: 'PET' | 'CPP' | 'OPP'
        position: 'front' | 'back'
        size: { width: number; height: number }
    }
    barrier?: {
        oxygen: boolean
        moisture: boolean
        aroma: boolean
        uv: boolean
    }
    resealability?: {
        type: 'zipper' | 'adhesive' | 'velcro'
        position: 'top' | 'side' | 'bottom'
    }
    customShape?: {
        dieLine: string // Base64 encoded or URL
        complexity: 'simple' | 'moderate' | 'complex'
    }
}

// Complete quote pattern specification
export interface QuotePatternSpecification {
    id?: string
    patternName?: string
    skuCount: number
    quantity: number
    bag: BagSpecifications
    printing: PrintingSpecifications
    features: FeatureSpecifications
    selected?: boolean
}

// Pricing calculation inputs
export interface PriceCalculationInput {
    pattern: QuotePatternSpecification
    userTier: 'basic' | 'premium' | 'enterprise'
    isRepeatOrder: boolean
    deliveryZipCode?: string
}

// Volume discount tiers
export interface VolumeDiscountTier {
    minQuantity: number
    maxQuantity?: number
    discountRate: number
    efficiencyFactor: number
}

// Material pricing information
export interface MaterialPricingInfo {
    basePrice: number
    priceMultiplier: number
    thicknessCost: number
    barrierCost: number
    availabilityFactor: number // 0.1-1.0 based on material availability
}

// Bag type pricing information
export interface BagTypePricingInfo {
    basePrice: number
    minQuantity: number
    sizeComplexity: 'simple' | 'moderate' | 'complex'
    productionTime: number // Base production time in days
    setupCost: number
}

// Printing cost breakdown
export interface PrintingCostBreakdown {
    plateCost: number
    inkCost: number
    laborCost: number
    setupCost: number
    premiumFeaturesCost: {
        matteFinish?: number
        spotUV?: number
        metallicInk?: number
    }
    total: number
}

// Feature cost breakdown
export interface FeatureCostBreakdown {
    windowCost?: number
    barrierCost?: number
    resealabilityCost?: number
    customShapeCost?: number
    total: number
}

// Material cost breakdown
export interface MaterialCostBreakdown {
    baseMaterialCost: number
    thicknessAdjustment: number
    barrierAdjustment: number
    sizeAdjustment: number
    quantityAdjustment: number
    total: number
}

// Complete price breakdown
export interface PriceBreakdown {
    basePrice: number
    materialCost: MaterialCostBreakdown
    printingCost: PrintingCostBreakdown
    featureCost: FeatureCostBreakdown
    volumeDiscount: number
    userDiscount: number
    setupFee: number
    unitPrice: number
    totalPrice: number
    margin: number // Internal cost calculation
}

// Production timeline information
export interface ProductionTimeline {
    minProductionDays: number
    maxProductionDays: number
    shippingDays: number
    totalDays: number
    estimatedDeliveryDate: Date
    bufferDays: number
    factors: {
        materialAvailability: number
        productionComplexity: number
        queuePosition: number
        seasonDemand: number
    }
}

// Validation result
export interface ValidationResult {
    isValid: boolean
    errors: ValidationError[]
    warnings: ValidationWarning[]
    suggestions: ValidationSuggestion[]
}

export interface ValidationError {
    field: string
    code: string
    message: string
    severity: 'error' | 'warning' | 'info'
    fixable: boolean
    suggestedValue?: any
}

export interface ValidationWarning {
    field: string
    message: string
    impact: string
    recommendation: string
}

export interface ValidationSuggestion {
    field: string
    currentValue: any
    suggestedValue: any
    reason: string
    savings?: number
}

// Complete calculation result
export interface QuotePatternCalculationResult {
    patternId: string
    patternName: string
    specifications: QuotePatternSpecification
    priceBreakdown: PriceBreakdown
    productionTimeline: ProductionTimeline
    validation: ValidationResult
    isAvailable: boolean
    alternatives?: AlternativePattern[]
}

export interface AlternativePattern {
    name: string
    description: string
    savings: number
    percentageSavings: number
    differences: string[]
    newSpecifications: Partial<QuotePatternSpecification>
}
