import { z } from 'zod'
import {
    QuotePatternSpecification,
    PriceCalculationInput,
    PriceBreakdown,
    MaterialCostBreakdown,
    PrintingCostBreakdown,
    FeatureCostBreakdown,
    BagTypePricingInfo,
    MaterialPricingInfo,
    VolumeDiscountTier,
    ProductionTimeline,
    ValidationResult,
    QuotePatternCalculationResult,
    ValidationError,
    ValidationWarning,
    ValidationSuggestion
} from './types'

/**
 * Core Price Calculation Engine
 * Implements reverse-engineered Brixa pricing logic.
 */
export class PriceCalculationEngine {
    private cache = new Map<string, CachedCalculationResult>()
    private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

    // Configuration constants (Aligned with verified pricing.ts logic)
    private readonly CONFIG = {
        // Fixed Costs
        FIXED_SETUP_COST: 150000,
        SMALL_LOT_SURCHARGE: 0,

        // Variable Costs (Per Unit)
        BASE_PROCESSING_FEE: 0,
        MATERIAL_RATE_PER_MM2: 0.0015, // JPY per mm² (OPP+Al/Matte)

        // Option Costs
        OPTION_NOTCH_COST: 4.6, // Per unit
        OPTION_CORNER_CUT_COST: 4.6, // Per unit
        OPTION_ZIPPER_COST: 10.0, // Per unit

        // Printing Costs (Simplified to match pricing.ts model for now)
        PRINTING_PLATE_COST: 0,
        BASE_INK_COST_PER_M2: 0,
        PRINTING_LABOR_COST_PER_COLOR: 0,

        // Other
        MIN_PROFIT_MARGIN: 0, // Rates include margin
        TAX_RATE: 0.10,
    }

    /**
     * Calculate complete price for a quote pattern
     */
    async calculatePrice(input: PriceCalculationInput): Promise<QuotePatternCalculationResult> {
        const startTime = Date.now()

        // Check cache first
        const cacheKey = this.generateCacheKey(input)
        const cached = this.getCachedResult(cacheKey)
        if (cached) {
            return cached.result
        }

        try {
            // Validate specifications
            const validation = await this.validateSpecifications(input.pattern)

            if (!validation.isValid) {
                return {
                    patternId: input.pattern.id || 'unknown',
                    patternName: input.pattern.patternName || 'Unnamed Pattern',
                    specifications: input.pattern,
                    priceBreakdown: this.createZeroBreakdown(),
                    productionTimeline: this.createZeroTimeline(),
                    validation,
                    isAvailable: false
                }
            }

            // Get pricing information (Mocked for now)
            const bagTypePricing = await this.getBagTypePricing(input.pattern.bag.bagTypeId)
            const materialPricing = await this.getMaterialPricing(input.pattern.bag.materialCompositionId)
            const volumeDiscounts = await this.getVolumeDiscounts(input.pattern.bag.bagTypeId, input.pattern.bag.materialCompositionId)

            // Calculate cost components
            const materialCost = await this.calculateMaterialCost(input.pattern, bagTypePricing, materialPricing)
            const printingCost = await this.calculatePrintingCost(input.pattern, bagTypePricing)
            const featureCost = await this.calculateFeatureCost(input.pattern, bagTypePricing)

            // Apply pricing strategy
            const basePrice = this.calculateBasePrice(input.pattern, bagTypePricing, materialCost, printingCost, featureCost)
            const volumeDiscount = this.calculateVolumeDiscount(input.pattern.quantity, basePrice, volumeDiscounts)
            const userDiscount = this.calculateUserDiscount(basePrice, input.userTier, input.isRepeatOrder)

            // Calculate Setup Fee (Base Setup + Printing Fixed Costs)
            const printingFixedCost = printingCost.plateCost + printingCost.laborCost + printingCost.setupCost
            const setupFee = this.calculateSetupFee(input.pattern) + printingFixedCost

            // Final price calculation
            // Unit Price = (Base - Discounts) + (Setup / Qty)
            const unitPrice = (basePrice - volumeDiscount - userDiscount) + (setupFee / input.pattern.quantity)
            const totalPrice = unitPrice * input.pattern.quantity

            const priceBreakdown: PriceBreakdown = {
                basePrice,
                materialCost,
                printingCost,
                featureCost,
                volumeDiscount,
                userDiscount,
                setupFee,
                unitPrice,
                totalPrice,
                margin: this.calculateMargin(unitPrice, materialCost, printingCost, featureCost)
            }

            // Calculate production timeline
            const productionTimeline = await this.calculateProductionTimeline(input.pattern, input.deliveryZipCode)

            const result: QuotePatternCalculationResult = {
                patternId: input.pattern.id || this.generatePatternId(),
                patternName: input.pattern.patternName || 'Unnamed Pattern',
                specifications: input.pattern,
                priceBreakdown,
                productionTimeline,
                validation,
                isAvailable: true
            }

            // Cache the result
            this.cacheResult(cacheKey, result)

            return result

        } catch (error) {
            console.error('Price calculation error:', error)
            throw new Error(`Price calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    /**
     * Calculate material cost breakdown
     */
    private async calculateMaterialCost(
        pattern: QuotePatternSpecification,
        bagTypePricing: BagTypePricingInfo,
        materialPricing: MaterialPricingInfo
    ): Promise<MaterialCostBreakdown> {
        const { bag } = pattern

        // Brixa Logic: Variable Unit Cost = Base Processing Fee + (Area * Material Rate)
        const areaMm2 = (bag.width * bag.height) + (bag.depth ? bag.width * bag.depth * 2 : 0)

        // Material Rate per mm2 (adjusted by material multiplier)
        const materialRate = this.CONFIG.MATERIAL_RATE_PER_MM2 * materialPricing.priceMultiplier

        // Variable Cost derived from Area
        const variableMaterialCost = areaMm2 * materialRate

        // Base Processing Fee (per unit)
        const baseProcessingFee = this.CONFIG.BASE_PROCESSING_FEE

        // Total Base Unit Cost (Material + Processing)
        const baseMaterialCost = baseProcessingFee + variableMaterialCost

        // Other adjustments
        const thicknessAdjustment = 0
        const barrierAdjustment = 0
        const sizeAdjustment = 0
        const quantityAdjustment = 0

        return {
            baseMaterialCost,
            thicknessAdjustment,
            barrierAdjustment,
            sizeAdjustment,
            quantityAdjustment,
            total: baseMaterialCost + thicknessAdjustment + barrierAdjustment + sizeAdjustment + quantityAdjustment
        }
    }

    /**
     * Calculate printing cost breakdown
     */
    private async calculatePrintingCost(
        pattern: QuotePatternSpecification,
        bagTypePricing: BagTypePricingInfo
    ): Promise<PrintingCostBreakdown> {
        const { printing } = pattern

        const totalColors = printing.printColors.front + printing.printColors.back +
            (printing.printColors.sides?.left || 0) + (printing.printColors.sides?.right || 0)

        const plateCost = totalColors * this.CONFIG.PRINTING_PLATE_COST

        // Ink cost calculation
        const areaM2 = (pattern.bag.width * pattern.bag.height) / 1000000
        const inkCostMultiplier = this.calculateInkCostMultiplier(printing.printCoverage, printing.printQuality)

        // Ink Cost per Unit (Variable)
        const inkCostPerUnit = areaM2 * inkCostMultiplier * this.CONFIG.BASE_INK_COST_PER_M2

        // Labor cost (Fixed)
        const laborCost = totalColors * this.CONFIG.PRINTING_LABOR_COST_PER_COLOR +
            (pattern.quantity > 1000 ? 5000 : 2500)

        return {
            plateCost, // Fixed
            inkCost: inkCostPerUnit, // Per Unit
            laborCost, // Fixed
            setupCost: 3500, // Fixed
            premiumFeaturesCost: {},
            total: inkCostPerUnit // Only variable cost contributes to unit base price
        }
    }

    /**
     * Calculate feature cost breakdown
     */
    private async calculateFeatureCost(
        pattern: QuotePatternSpecification,
        bagTypePricing: BagTypePricingInfo
    ): Promise<FeatureCostBreakdown> {
        const { features } = pattern
        const windowCost = 0
        const barrierCost = 0
        let resealabilityCost = 0
        let customShapeCost = 0

        // Resealability (Zipper) cost calculation
        if (features.resealability) {
            resealabilityCost = this.CONFIG.OPTION_ZIPPER_COST
        }

        // Custom shape (Corner Cut / Notch) cost calculation
        if (features.customShape) {
            customShapeCost = this.CONFIG.OPTION_CORNER_CUT_COST
        }

        return {
            windowCost,
            barrierCost,
            resealabilityCost,
            customShapeCost,
            total: windowCost + barrierCost + resealabilityCost + customShapeCost
        }
    }

    /**
     * Calculate base price before discounts
     */
    private calculateBasePrice(
        pattern: QuotePatternSpecification,
        bagTypePricing: BagTypePricingInfo,
        materialCost: MaterialCostBreakdown,
        printingCost: PrintingCostBreakdown,
        featureCost: FeatureCostBreakdown
    ): number {
        const basePrice = bagTypePricing.basePrice +
            materialCost.total +
            printingCost.total + // This is now Per Unit (Ink only)
            featureCost.total

        // Add profit margin
        return basePrice * (1 + this.CONFIG.MIN_PROFIT_MARGIN)
    }

    /**
     * Calculate volume discount based on quantity
     */
    private calculateVolumeDiscount(
        quantity: number,
        basePrice: number,
        discountTiers: VolumeDiscountTier[]
    ): number {
        const applicableTier = discountTiers
            .filter(tier => quantity >= tier.minQuantity && (!tier.maxQuantity || quantity <= tier.maxQuantity))
            .sort((a, b) => b.minQuantity - a.minQuantity)[0]

        if (!applicableTier) {
            return 0
        }

        return basePrice * applicableTier.discountRate
    }

    /**
     * Calculate user-tier discount
     */
    private calculateUserDiscount(
        basePrice: number,
        userTier: string,
        isRepeatOrder: boolean
    ): number {
        let discount = 0

        switch (userTier) {
            case 'premium':
                discount += 0.05
                break
            case 'enterprise':
                discount += 0.10
                break
        }

        if (isRepeatOrder) {
            discount += 0.02
        }

        return basePrice * discount
    }

    /**
     * Calculate setup fee based on pattern complexity
     */
    private calculateSetupFee(pattern: QuotePatternSpecification): number {
        // High Volume (Gravure) Logic
        if (pattern.quantity >= 50000) {
            return 200000
        }
        return this.CONFIG.FIXED_SETUP_COST
    }

    /**
     * Calculate production timeline
     */
    private async calculateProductionTimeline(
        pattern: QuotePatternSpecification,
        deliveryZipCode?: string
    ): Promise<ProductionTimeline> {
        const baseProductionDays = 7
        const quantityDays = Math.ceil(pattern.quantity / 1000)
        const complexityDays = this.calculatePatternComplexity(pattern) * 2

        const minProductionDays = baseProductionDays + Math.floor(quantityDays / 2) + complexityDays
        const maxProductionDays = minProductionDays + 3

        const shippingDays = deliveryZipCode ? 5 : 5 // Simplified

        const totalDays = maxProductionDays + shippingDays
        const estimatedDeliveryDate = new Date()
        estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + totalDays)

        return {
            minProductionDays,
            maxProductionDays,
            shippingDays,
            totalDays,
            estimatedDeliveryDate,
            bufferDays: 3,
            factors: {
                materialAvailability: 1.0,
                productionComplexity: this.calculatePatternComplexity(pattern),
                queuePosition: 1.0,
                seasonDemand: 1.0
            }
        }
    }

    /**
     * Validate specifications
     */
    private async validateSpecifications(pattern: QuotePatternSpecification): Promise<ValidationResult> {
        const errors: ValidationError[] = []
        const warnings: ValidationWarning[] = []
        const suggestions: ValidationSuggestion[] = []

        // Basic validation
        if (pattern.bag.width < 50 || pattern.bag.width > 500) {
            errors.push({
                field: 'bag.width',
                code: 'INVALID_RANGE',
                message: 'Bag width must be between 50mm and 500mm',
                severity: 'error',
                fixable: true,
                suggestedValue: Math.max(50, Math.min(500, pattern.bag.width))
            })
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            suggestions
        }
    }

    // Helpers
    private calculateInkCostMultiplier(coverage: string, quality: string): number {
        let multiplier = 1.0
        if (coverage === 'full') multiplier += 0.3
        if (quality === 'premium') multiplier += 0.3
        return multiplier
    }

    private calculatePatternComplexity(pattern: QuotePatternSpecification): number {
        let complexity = 0
        if (pattern.features.window) complexity += 1
        if (pattern.features.resealability) complexity += 0.5
        return complexity
    }

    private calculateMargin(unitPrice: number, materialCost: MaterialCostBreakdown, printingCost: PrintingCostBreakdown, featureCost: FeatureCostBreakdown): number {
        const totalCost = materialCost.total + printingCost.total + featureCost.total
        return unitPrice > 0 ? (unitPrice - totalCost) / unitPrice : 0
    }

    private generateCacheKey(input: PriceCalculationInput): string {
        return JSON.stringify(input)
    }

    private getCachedResult(cacheKey: string): CachedCalculationResult | null {
        const cached = this.cache.get(cacheKey)
        if (cached && Date.now() < cached.expiresAt.getTime()) {
            return cached
        }
        return null
    }

    private cacheResult(cacheKey: string, result: QuotePatternCalculationResult): void {
        this.cache.set(cacheKey, {
            result,
            timestamp: new Date(),
            expiresAt: new Date(Date.now() + this.CACHE_TTL),
            cacheKey
        })
    }

    private generatePatternId(): string {
        return `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    private createZeroBreakdown(): PriceBreakdown {
        return {
            basePrice: 0,
            materialCost: { baseMaterialCost: 0, thicknessAdjustment: 0, barrierAdjustment: 0, sizeAdjustment: 0, quantityAdjustment: 0, total: 0 },
            printingCost: { plateCost: 0, inkCost: 0, laborCost: 0, setupCost: 0, premiumFeaturesCost: {}, total: 0 },
            featureCost: { total: 0 },
            volumeDiscount: 0,
            userDiscount: 0,
            setupFee: 0,
            unitPrice: 0,
            totalPrice: 0,
            margin: 0
        }
    }

    private createZeroTimeline(): ProductionTimeline {
        return {
            minProductionDays: 0, maxProductionDays: 0, shippingDays: 0, totalDays: 0, estimatedDeliveryDate: new Date(), bufferDays: 0,
            factors: { materialAvailability: 0, productionComplexity: 0, queuePosition: 0, seasonDemand: 0 }
        }
    }

    // Mock Data Providers
    private async getBagTypePricing(bagTypeId: string): Promise<BagTypePricingInfo> {
        let basePrice = 0;
        if (bagTypeId === 'stand_up') basePrice = 8.0;
        if (bagTypeId === 'gusset') basePrice = 15.0;

        return {
            basePrice,
            minQuantity: 1000,
            sizeComplexity: 'moderate',
            productionTime: 7,
            setupCost: 5000
        }
    }

    private async getMaterialPricing(materialCompositionId: string): Promise<MaterialPricingInfo> {
        return {
            basePrice: 1.0,
            priceMultiplier: 1.0, // Adjust based on material type
            thicknessCost: 0,
            barrierCost: 0,
            availabilityFactor: 1.0
        }
    }

    private async getVolumeDiscounts(bagTypeId: string, materialCompositionId: string): Promise<VolumeDiscountTier[]> {
        return [
            { minQuantity: 1000, discountRate: 0, efficiencyFactor: 1.0 },
            { minQuantity: 3000, discountRate: 0.05, efficiencyFactor: 1.05 }
        ]
    }
}

interface CachedCalculationResult {
    result: QuotePatternCalculationResult
    timestamp: Date
    expiresAt: Date
    cacheKey: string
}
