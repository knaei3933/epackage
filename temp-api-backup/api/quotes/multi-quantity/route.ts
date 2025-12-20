import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { multiQuantityCalculator } from '@/lib/multi-quantity-calculator'
import {
  MultiQuantityApiRequest,
  MultiQuantityApiResponse,
  ValidationError
} from '@/types/multi-quantity'

// Validation schema
const multiQuantityRequestSchema = z.object({
  baseParams: z.object({
    bagTypeId: z.string().min(1, 'Bag type is required'),
    materialId: z.string().min(1, 'Material is required'),
    width: z.number().min(50, 'Width must be at least 50mm').max(1000, 'Width must not exceed 1000mm'),
    height: z.number().min(50, 'Height must be at least 50mm').max(1000, 'Height must not exceed 1000mm'),
    depth: z.number().min(0).max(500).optional(),
    thicknessSelection: z.string().optional(),
    isUVPrinting: z.boolean().default(false),
    printingType: z.enum(['digital', 'gravure']).optional(),
    printingColors: z.number().min(1).max(8).optional(),
    doubleSided: z.boolean().default(false),
    postProcessingOptions: z.array(z.string()).optional(),
    deliveryLocation: z.enum(['domestic', 'international']).optional(),
    urgency: z.enum(['standard', 'express']).optional()
  }),
  quantities: z.array(z.number().min(500, 'Minimum quantity is 500').max(1000000, 'Maximum quantity is 1,000,000'))
    .min(1, 'At least one quantity is required')
    .max(10, 'Maximum 10 quantities can be compared at once'),
  comparisonMode: z.enum(['price', 'leadTime', 'totalCost']).default('price'),
  includeRecommendations: z.boolean().default(true),
  sessionId: z.string().optional(),
  locale: z.string().default('ja'),
  includeCache: z.boolean().default(true)
})

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Parse and validate request body
    const body = await request.json()
    const validationResult = multiQuantityRequestSchema.safeParse(body)

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => ({
        field: err.path.join('.'),
        code: err.code,
        message: err.message,
        severity: 'error' as const
      }))

      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request parameters',
          details: errors
        },
        metadata: {
          processingTime: Date.now() - startTime,
          cached: false,
          sessionId: body.sessionId || 'anonymous',
          timestamp: new Date()
        }
      } as MultiQuantityApiResponse, { status: 400 })
    }

    const requestData = validationResult.data

    // Business rule validations
    const businessValidationErrors = await validateBusinessRules(requestData)
    if (businessValidationErrors.length > 0) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'BUSINESS_RULE_VIOLATION',
          message: 'Business rule violations detected',
          details: businessValidationErrors
        },
        metadata: {
          processingTime: Date.now() - startTime,
          cached: false,
          sessionId: body.sessionId || 'anonymous',
          timestamp: new Date()
        }
      } as MultiQuantityApiResponse, { status: 422 })
    }

    // Check cache if requested
    if (requestData.includeCache) {
      const cacheKey = generateCacheKey(requestData)
      const cachedResult = await getFromCache(cacheKey)

      if (cachedResult) {
        return NextResponse.json({
          success: true,
          data: cachedResult,
          metadata: {
            processingTime: Date.now() - startTime,
            cached: true,
            sessionId: body.sessionId || 'anonymous',
            timestamp: new Date()
          }
        } as MultiQuantityApiResponse)
      }
    }

    // Generate cache key
    const cacheKey = `multi-quantity-${JSON.stringify({
      baseParams: requestData.baseParams,
      quantities: requestData.quantities,
      comparisonMode: requestData.comparisonMode
    })}`;

    // Calculate multi-quantity quotes
    const result = await multiQuantityCalculator.calculateMultiQuantity({
      baseParams: requestData.baseParams,
      quantities: requestData.quantities,
      comparisonMode: requestData.comparisonMode,
      includeRecommendations: requestData.includeRecommendations
    })

    // Store result in cache
    if (requestData.includeCache) {
      await setCacheValue(cacheKey, result, 15 * 60) // 15 minutes
    }

    // Optional: Store for analytics (if session tracking enabled)
    if (requestData.sessionId) {
      await storeAnalyticsData(requestData.sessionId, requestData, result)
    }

    return NextResponse.json({
      success: true,
      data: result,
      metadata: {
        processingTime: Date.now() - startTime,
        cached: false,
        sessionId: body.sessionId || 'anonymous',
        timestamp: new Date()
      }
    } as MultiQuantityApiResponse)

  } catch (error) {
    console.error('Multi-quantity calculation error:', error)

    return NextResponse.json({
      success: false,
      error: {
        code: 'CALCULATION_ERROR',
        message: 'Failed to calculate multi-quantity quotes',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      metadata: {
        processingTime: Date.now() - startTime,
        cached: false,
        sessionId: 'anonymous',
        timestamp: new Date()
      }
    } as MultiQuantityApiResponse, { status: 500 })
  }
}

async function validateBusinessRules(request: MultiQuantityApiRequest): Promise<ValidationError[]> {
  const errors: ValidationError[] = []

  // Validate quantity ranges and business logic
  const { quantities, baseParams } = request

  // Check for duplicate quantities
  const uniqueQuantities = new Set(quantities)
  if (uniqueQuantities.size !== quantities.length) {
    errors.push({
      field: 'quantities',
      code: 'DUPLICATE_QUANTITIES',
      message: 'Duplicate quantities are not allowed',
      severity: 'warning'
    })
  }

  // Validate quantity progression (should be in ascending order)
  const sortedQuantities = [...quantities].sort((a, b) => a - b)
  if (JSON.stringify(sortedQuantities) !== JSON.stringify(quantities)) {
    errors.push({
      field: 'quantities',
      code: 'QUANTITY_ORDER',
      message: 'Quantities should be provided in ascending order',
      severity: 'warning'
    })
  }

  // Validate bag type and material compatibility
  const incompatibleCombinations = [
    { bagType: 'roll_film', material: 'glass' },
    { bagType: 'spout_pouch', material: 'paper' },
    // Add more incompatible combinations as needed
  ]

  const incompatible = incompatibleCombinations.find(
    combo => combo.bagType === baseParams.bagTypeId && combo.material === baseParams.materialId
  )

  if (incompatible) {
    errors.push({
      field: 'baseParams',
      code: 'INCOMPATIBLE_COMBINATION',
      message: `Incompatible combination: ${baseParams.bagTypeId} with ${baseParams.materialId}`,
      severity: 'error'
    })
  }

  // Validate size constraints based on bag type
  const sizeConstraints: Record<string, { maxWidth: number; maxHeight: number; maxDepth: number }> = {
    'flat_3_side': { maxWidth: 600, maxHeight: 800, maxDepth: 0 },
    'stand_up': { maxWidth: 400, maxHeight: 600, maxDepth: 200 },
    'box': { maxWidth: 300, maxHeight: 400, maxDepth: 150 },
    'spout_pouch': { maxWidth: 350, maxHeight: 500, maxDepth: 100 },
    'roll_film': { maxWidth: 1000, maxHeight: 1, maxDepth: 0 } // Roll film has specific constraints
  }

  const constraints = sizeConstraints[baseParams.bagTypeId]
  if (constraints) {
    if (baseParams.width > constraints.maxWidth) {
      errors.push({
        field: 'baseParams.width',
        code: 'SIZE_VIOLATION',
        message: `Width exceeds maximum for ${baseParams.bagTypeId} (${constraints.maxWidth}mm)`,
        severity: 'error'
      })
    }

    if (baseParams.height > constraints.maxHeight) {
      errors.push({
        field: 'baseParams.height',
        code: 'SIZE_VIOLATION',
        message: `Height exceeds maximum for ${baseParams.bagTypeId} (${constraints.maxHeight}mm)`,
        severity: 'error'
      })
    }

    if (baseParams.depth && baseParams.depth > constraints.maxDepth) {
      errors.push({
        field: 'baseParams.depth',
        code: 'SIZE_VIOLATION',
        message: `Depth exceeds maximum for ${baseParams.bagTypeId} (${constraints.maxDepth}mm)`,
        severity: 'error'
      })
    }
  }

  return errors
}

function generateCacheKey(request: MultiQuantityApiRequest): string {
  const keyData = {
    baseParams: request.baseParams,
    quantities: request.quantities.sort((a, b) => a - b),
    comparisonMode: request.comparisonMode,
    includeRecommendations: request.includeRecommendations
  }
  return `multi-quote-${Buffer.from(JSON.stringify(keyData)).toString('base64')}`
}

// Cache functions (implement with your preferred caching solution)
async function getFromCache(key: string): Promise<any> {
  // Implement Redis or in-memory cache retrieval
  // For now, return null (no cache)
  return null
}

async function setCacheValue(key: string, value: any, ttlSeconds: number): Promise<void> {
  // Implement Redis or in-memory cache storage
  // For now, do nothing
  console.log(`Cache set for key: ${key}, TTL: ${ttlSeconds}s`)
}

async function storeAnalyticsData(sessionId: string, request: MultiQuantityApiRequest, result: any): Promise<void> {
  // Implement analytics data storage
  // This could track user behavior, popular configurations, etc.
  console.log(`Analytics data stored for session: ${sessionId}`)
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: false,
    error: {
      code: 'METHOD_NOT_ALLOWED',
      message: 'GET method not supported for this endpoint'
    },
    metadata: {
      processingTime: 0,
      cached: false,
      sessionId: 'anonymous',
      timestamp: new Date()
    }
  } as MultiQuantityApiResponse, { status: 405 })
}