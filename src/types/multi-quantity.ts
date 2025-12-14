// Multi-Quantity System Type Definitions

export interface MultiQuantityRequest {
  baseParams: {
    bagTypeId: string
    materialId: string
    width: number
    height: number
    depth?: number
    thicknessSelection?: string
    isUVPrinting?: boolean
    printingType?: 'digital' | 'gravure'
    printingColors?: number
    doubleSided?: boolean
    postProcessingOptions?: string[]
    deliveryLocation?: 'domestic' | 'international'
    urgency?: 'standard' | 'express'
  }
  quantities: number[]
  comparisonMode?: 'price' | 'leadTime' | 'totalCost'
  includeRecommendations?: boolean
}

export interface MultiQuantityResult {
  baseParams: MultiQuantityRequest['baseParams']
  quantities: number[]
  calculations: Map<number, UnifiedQuoteResult>
  comparison: QuantityComparison
  recommendations: QuantityRecommendation[]
  metadata: {
    processingTime: number
    currency: string
    validUntil: Date
  }
}

export interface QuantityComparison {
  bestValue: {
    quantity: number
    savings: number
    percentage: number
    reason: string
  }
  priceBreaks: Array<{
    quantity: number
    priceBreak: string
    discountRate: number
  }>
  economiesOfScale: Record<number, {
    unitPrice: number
    totalSavings: number
    efficiency: number
  }>
  trends: {
    priceTrend: 'decreasing' | 'stable' | 'increasing'
    optimalQuantity: number
    diminishingReturns: number
  }
}

export interface QuantityRecommendation {
  type: 'cost-optimized' | 'balanced' | 'urgent-delivery'
  title: string
  description: string
  quantity: number
  reasoning: string[]
  estimatedSavings: number
  confidence: number
}

export interface SharedCosts {
  setupFee: number
  toolingCosts: number
  materialBaseCost: number
  validationResults: {
    isValid: boolean
    warnings: string[]
    errors: string[]
  }
}

export interface QuantityQuote {
  quantity: number
  unitPrice: number
  totalPrice: number
  discountRate: number
  priceBreak: string
  leadTimeDays: number
  isValid: boolean
  metadata?: {
    calculationMethod: 'standard' | 'batch' | 'cached'
    cachedAt?: Date
  }
}

// Enhanced QuoteState with multi-quantity support
export interface MultiQuantityQuoteState {
  // Existing fields
  bagTypeId: string
  materialId: string
  width: number
  height: number
  depth: number
  thicknessSelection?: string
  isUVPrinting: boolean
  printingType?: 'digital' | 'gravure'
  printingColors?: number
  doubleSided?: boolean
  postProcessingOptions: string[]
  postProcessingMultiplier: number
  deliveryLocation?: 'domestic' | 'international'
  urgency?: 'standard' | 'express'

  // Enhanced quantity fields
  quantities: number[] // Selected quantities for comparison
  comparisonQuantities: number[] // All quantities to compare
  selectedQuantity: number | null // Currently selected for detailed view
  multiQuantityResults: Map<number, UnifiedQuoteResult>
  comparison: QuantityComparison | null
  isLoading: boolean
  error: string | null

  // User preferences
  savedPatterns: SavedQuantityPattern[]
  recentCalculations: MultiQuantityResult[]

  // Save/Load functionality
  savedComparisons: any[]
  isLoadingSave: boolean
  exportUrl: string | null
  shareUrl: string | null
}

export interface SavedQuantityPattern {
  id: string
  name: string
  description: string
  quantities: number[]
  createdAt: Date
  lastUsed: Date
  isDefault: boolean
}

// API Request/Response Types
export interface MultiQuantityApiRequest extends MultiQuantityRequest {
  sessionId?: string
  locale?: string
  includeCache?: boolean
}

export interface MultiQuantityApiResponse {
  success: boolean
  data?: MultiQuantityResult
  error?: {
    code: string
    message: string
    details?: any
  }
  metadata: {
    processingTime: number
    cached: boolean
    sessionId: string
    timestamp: Date
  }
}

// Database Schema Types
export interface MultiQuantityQuoteRecord {
  id: string
  userId?: string
  sessionId: string
  baseParams: MultiQuantityRequest['baseParams']
  quantities: number[]
  calculations: Map<number, UnifiedQuoteResult>
  comparison: QuantityComparison
  sharedCosts: SharedCosts
  metadata: {
    createdAt: Date
    expiresAt: Date
    isShared: boolean
    shareUrl?: string
  }
}

// Validation Types
export interface QuantityValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  suggestions: string[]
}

export interface ValidationError {
  field: string
  code: string
  message: string
  severity: 'error' | 'warning'
}

export interface ValidationWarning {
  field: string
  code: string
  message: string
  recommendation: string
}

// Import existing types
import { UnifiedQuoteResult } from '@/lib/unified-pricing-engine'