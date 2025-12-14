import { z } from 'zod'
import { Product } from '@/types/database'

// Zod schemas for validation
export const QuoteCalculationParamsSchema = z.object({
  product: z.object({
    id: z.string(),
    category: z.enum(['flat_3_side', 'stand_up', 'gusset', 'box', 'flat_with_zip', 'special', 'soft_pouch']),
    name_ja: z.string(),
    name_en: z.string(),
    description_ja: z.string(),
    description_en: z.string(),
    specifications: z.any(),
    materials: z.array(z.string()),
    pricing_formula: z.any(),
    min_order_quantity: z.number(),
    lead_time_days: z.number(),
    sort_order: z.number(),
    is_active: z.boolean(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
    image: z.string().optional()
  }),
  quantity: z.number().min(100).max(100000),
  specifications: z.object({
    width: z.number().min(10).max(1000),
    height: z.number().min(10).max(1000),
    thickness: z.number().min(10).max(500),
    materialType: z.enum(['PE', 'PP', 'PET', 'ALUMINUM', 'PAPER_LAMINATE']),
    printingColors: z.number().min(0).max(8),
    specialFeatures: z.array(z.string()).optional()
  }),
  customOptions: z.object({
    printing: z.object({
      type: z.enum(['digital', 'gravure']),
      colors: z.number().min(1).max(8),
      doubleSided: z.boolean().optional()
    }).optional(),
    specialFeatures: z.array(z.string()).optional(),
    deliveryLocation: z.string().optional(),
    urgency: z.enum(['standard', 'express']).optional()
  }).optional()
})

export type QuoteCalculationParams = z.infer<typeof QuoteCalculationParamsSchema>

// Pricing calculation schema
export interface ProductSpecifications {
  width: number // mm
  height: number // mm
  thickness: number // microns
  materialType: 'PE' | 'PP' | 'PET' | 'ALUMINUM' | 'PAPER_LAMINATE'
  printingColors: number
  specialFeatures?: string[]
}

export interface PriceBreakdown {
  material: number
  processing: number
  printing: number
  setup: number
  discount: number
  delivery: number
  subtotal: number
  total: number
}

export interface QuoteResult {
  breakdown: PriceBreakdown
  unitPrice: number
  totalPrice: number
  currency: string
  validUntil: Date
  leadTimeDays: number
  minOrderQuantity: number
}

// Material costs per kg (JPY)
const MATERIAL_COSTS_PER_KG = {
  PE: 250,
  PP: 300,
  PET: 450,
  ALUMINUM: 1200,
  PAPER_LAMINATE: 380
} as const

// Material density (kg/m³)
const MATERIAL_DENSITY = {
  PE: 0.92,
  PP: 0.90,
  PET: 1.38,
  ALUMINUM: 2.70,
  PAPER_LAMINATE: 0.80
} as const

// Processing costs
const PROCESSING_COSTS = {
  flat_3_side: 15,    // 円/個
  stand_up: 18,       // 円/個
  gusset: 20,         // 円/個
  box: 22,            // 円/個
  flat_with_zip: 20,  // 円/個
  special: 25,        // 円/個
  soft_pouch: 17       // 円/個
} as const

// Printing costs
const PRINTING_COSTS = {
  digital: {
    setupFee: 10000,  // 円
    perColorPerUnit: 5, // 円
    minCharge: 5000   // 円
  },
  gravure: {
    setupFee: 50000,  // 円
    perColorPerUnit: 2, // 円
    minCharge: 20000  // 円
  }
} as const

// Labor cost per hour (JPY)
const LABOR_COST_PER_HOUR = 2800

// Delivery costs
const DELIVERY_COSTS = {
  domestic: {
    base: 1500,      // 円
    perKg: 150,      // 円/kg
    freeThreshold: 50000 // 円
  },
  international: {
    base: 5000,      // 円
    perKg: 500,      // 円/kg
    freeThreshold: 200000 // 円
  }
} as const

export class PricingEngine {
  /**
   * Calculate comprehensive quote for packaging materials
   */
  static async calculateQuote(params: QuoteCalculationParams): Promise<QuoteResult> {
    const { product, quantity, specifications, customOptions } = params

    // Validate minimum quantity
    if (quantity < product.min_order_quantity) {
      throw new Error(`Minimum order quantity is ${product.min_order_quantity} units`)
    }

    // Calculate individual cost components
    const materialCost = this.calculateMaterialCost(specifications)
    // Cast category to match Product['category'] because Zod enum is just string union
    const processingCost = this.calculateProcessingCost(product.category as Product['category'], quantity)
    const printingCost = this.calculatePrintingCost(customOptions?.printing, quantity)
    // Cast product to Product because Zod inferred type might be slightly different (optional fields)
    const setupCost = this.calculateSetupCost(product as unknown as Product, quantity, customOptions?.printing)

    // Calculate subtotal
    const subtotal = materialCost + processingCost + printingCost + setupCost

    // Apply volume discount
    const discountAmount = this.calculateVolumeDiscount(quantity, subtotal)

    // Calculate delivery cost
    const deliveryCost = this.calculateDeliveryCost(
      customOptions?.deliveryLocation,
      quantity,
      specifications
    )

    const total = subtotal - discountAmount + deliveryCost

    // Calculate lead time
    const leadTimeDays = this.calculateLeadTime(
      product.lead_time_days,
      customOptions?.urgency,
      quantity
    )

    return {
      breakdown: {
        material: materialCost,
        processing: processingCost,
        printing: printingCost,
        setup: setupCost,
        discount: discountAmount,
        delivery: deliveryCost,
        subtotal,
        total
      },
      unitPrice: total / quantity,
      totalPrice: total,
      currency: 'JPY',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      leadTimeDays,
      minOrderQuantity: product.min_order_quantity
    }
  }

  /**
   * Calculate material cost based on specifications
   */
  private static calculateMaterialCost(specs: ProductSpecifications): number {
    const { width, height, thickness, materialType } = specs

    // Calculate area in m²
    const area = (width * height) / 1000000 // Convert mm² to m²

    // Calculate volume in m³
    const thicknessInM = thickness / 1000000 // Convert microns to meters
    const volume = area * thicknessInM

    // Calculate weight in kg
    const weight = volume * MATERIAL_DENSITY[materialType]

    // Calculate cost
    return weight * MATERIAL_COSTS_PER_KG[materialType]
  }

  /**
   * Calculate processing cost based on package type and quantity
   */
  private static calculateProcessingCost(category: Product['category'], quantity: number): number {
    const baseCost = PROCESSING_COSTS[category]

    // Quantity discount for processing
    const quantityMultiplier = quantity >= 10000 ? 0.9 : quantity >= 5000 ? 0.95 : 1

    return baseCost * quantity * quantityMultiplier
  }

  /**
   * Calculate printing cost
   */
  private static calculatePrintingCost(
    printing: any,
    quantity: number
  ): number {
    if (!printing) return 0

    const printingType = PRINTING_COSTS[printing.type as keyof typeof PRINTING_COSTS]
    const colors = printing.colors || 1
    const sides = printing.doubleSided ? 2 : 1

    // Setup fee (one-time)
    const setupFee = printingType.setupFee

    // Per-unit printing cost
    const perUnitCost = printingType.perColorPerUnit * colors * sides * quantity

    // Minimum charge
    const printingCost = Math.max(perUnitCost, printingType.minCharge)

    return setupFee + printingCost
  }

  /**
   * Calculate setup cost
   */
  private static calculateSetupCost(
    product: Product,
    quantity: number,
    printing?: any
  ): number {
    let setupCost = 0

    // Basic setup cost
    if (quantity < 1000) {
      setupCost += 10000 // Small lot setup fee
    }

    // Special features setup
    if (printing && printing.type === 'gravure') {
      setupCost += 30000 // Gravure cylinder cost
    }

    return setupCost
  }

  /**
   * Calculate volume discount
   */
  private static calculateVolumeDiscount(quantity: number, subtotal: number): number {
    let discountRate = 0

    if (quantity >= 50000) {
      discountRate = 0.20 // 20% discount
    } else if (quantity >= 20000) {
      discountRate = 0.15 // 15% discount
    } else if (quantity >= 10000) {
      discountRate = 0.10 // 10% discount
    } else if (quantity >= 5000) {
      discountRate = 0.05 // 5% discount
    }

    return subtotal * discountRate
  }

  /**
   * Calculate delivery cost
   */
  private static calculateDeliveryCost(
    location: string | undefined,
    quantity: number,
    specs: ProductSpecifications
  ): number {
    const isDomestic = !location || location.includes('Japan')
    const rates = isDomestic ? DELIVERY_COSTS.domestic : DELIVERY_COSTS.international

    // Estimate total weight
    const materialCost = this.calculateMaterialCost(specs)
    const estimatedWeight = materialCost / MATERIAL_COSTS_PER_KG[specs.materialType]

    const shippingCost = rates.base + (estimatedWeight * rates.perKg)

    // Free shipping threshold
    const estimatedTotal = materialCost * quantity // Rough estimate
    if (estimatedTotal >= rates.freeThreshold) {
      return 0
    }

    return Math.max(shippingCost, rates.base)
  }

  /**
   * Calculate lead time
   */
  private static calculateLeadTime(
    baseLeadTime: number,
    urgency?: 'standard' | 'express',
    quantity?: number
  ): number {
    let leadTime = baseLeadTime

    // Urgency adjustment
    if (urgency === 'express') {
      leadTime = Math.max(leadTime * 0.6, 5) // 40% faster but minimum 5 days
    }

    // Quantity adjustment
    if (quantity && quantity > 10000) {
      leadTime += 3 // Additional time for large orders
    }

    return Math.ceil(leadTime)
  }

  /**
   * Validate quote parameters
   */
  static validateQuoteParams(params: QuoteCalculationParams): void {
    const { specifications, quantity } = params

    // Validate specifications
    if (specifications.width <= 0 || specifications.height <= 0) {
      throw new Error('Package dimensions must be positive')
    }

    if (specifications.thickness <= 0 || specifications.thickness > 500) {
      throw new Error('Thickness must be between 0 and 500 microns')
    }

    if (quantity < 100) {
      throw new Error('Minimum quantity is 100 units')
    }

    if (quantity > 100000) {
      throw new Error('Maximum quantity is 100,000 units')
    }
  }
}