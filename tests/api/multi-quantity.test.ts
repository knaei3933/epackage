import { NextRequest } from 'next/server'
import { POST } from '@/app/api/quotes/multi-quantity/route'
import { createMockMultiQuantityRequest } from '../../jest.setup'

// Mock the multi-quantity calculator
jest.mock('@/lib/multi-quantity-calculator', () => ({
  multiQuantityCalculator: {
    calculateMultiQuantity: jest.fn().mockImplementation(async (request) => {
      // Simulate calculation logic
      const { quantities } = request
      const calculations = new Map()

      quantities.forEach((quantity: number) => {
        const basePrice = 5000
        const unitPrice = Math.max(10, 100 - Math.log(quantity) * 5)
        calculations.set(quantity, {
          quantity,
          basePrice,
          materialCost: 1000,
          printingCost: 500,
          postProcessingCost: 300,
          setupFee: 500,
          totalCost: unitPrice * quantity,
          unitPrice,
          leadTimeDays: Math.max(7, 21 - Math.log(quantity) * 2),
          isValid: true,
          breakdown: {
            materials: { cost: 1000, description: 'Material costs' },
            printing: { cost: 500, description: 'Printing costs' },
            postProcessing: { cost: 300, description: 'Post-processing costs' },
            setup: { cost: 500, description: 'Setup fees' }
          },
          discounts: [],
          taxes: { rate: 0.1, amount: unitPrice * quantity * 0.1 }
        })
      })

      return {
        baseParams: request.baseParams,
        quantities,
        calculations,
        comparison: {
          bestValue: {
            quantity: quantities[quantities.length - 1],
            savings: 500,
            percentage: 10,
            reason: 'Highest quantity provides best unit price'
          },
          priceBreaks: quantities.map((q: number, i: number) => ({
            quantity: q,
            priceBreak: `${(100 - i * 10).toFixed(0)}%割引`,
            discountRate: i * 0.1
          })),
          economiesOfScale: quantities.reduce((acc: any, q: number) => {
            acc[q] = {
              unitPrice: Math.max(10, 100 - Math.log(q) * 5),
              totalSavings: Math.log(q) * 100,
              efficiency: Math.min(1, Math.log(q) / 10)
            }
            return acc
          }, {}),
          trends: {
            priceTrend: 'decreasing',
            optimalQuantity: quantities[quantities.length - 1],
            diminishingReturns: quantities[quantities.length - 2]
          }
        },
        recommendations: [
          {
            type: 'cost-optimized',
            title: 'コスト最適化',
            description: '最大数量推奨',
            quantity: quantities[quantities.length - 1],
            reasoning: ['単価最適', '生産効率向上'],
            estimatedSavings: 300,
            confidence: 0.85
          }
        ],
        metadata: {
          processingTime: 200,
          currency: 'JPY',
          validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
      }
    })
  }
}))

// Mock error handling
jest.mock('@/lib/error-logger', () => ({
  logError: jest.fn()
}))

describe('/api/quotes/multi-quantity', () => {
  let mockRequest: NextRequest

  beforeEach(() => {
    jest.clearAllMocks()
  })

  const createMockNextRequest = (body: any, headers: Record<string, string> = {}) => {
    return {
      json: jest.fn().mockResolvedValue(body),
      headers: new Map(Object.entries(headers)),
      method: 'POST',
      url: 'http://localhost:3000/api/quotes/multi-quantity'
    } as unknown as NextRequest
  }

  describe('successful requests', () => {
    it('should return multi-quantity calculation results', async () => {
      const requestBody = createMockMultiQuantityRequest()
      mockRequest = createMockNextRequest(requestBody)

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toBeDefined()
      expect(data.data.baseParams).toEqual(requestBody.baseParams)
      expect(data.data.quantities).toEqual(requestBody.quantities)
      expect(data.data.calculations.size).toBe(requestBody.quantities.length)
      expect(data.data.comparison).toBeDefined()
      expect(data.data.recommendations).toBeDefined()
      expect(data.metadata).toBeDefined()
    })

    it('should include processing time in metadata', async () => {
      const requestBody = createMockMultiQuantityRequest()
      mockRequest = createMockNextRequest(requestBody)

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(data.metadata.processingTime).toBeGreaterThan(0)
      expect(data.metadata.sessionId).toBeDefined()
      expect(data.metadata.timestamp).toBeDefined()
      expect(data.metadata.cached).toBe(false)
    })

    it('should handle different comparison modes', async () => {
      const requestBody = createMockMultiQuantityRequest({
        comparisonMode: 'leadTime'
      })
      mockRequest = createMockNextRequest(requestBody)

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('should handle requests without recommendations', async () => {
      const requestBody = createMockMultiQuantityRequest({
        includeRecommendations: false
      })
      mockRequest = createMockNextRequest(requestBody)

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.recommendations).toEqual([])
    })

    it('should process large quantity arrays efficiently', async () => {
      const largeQuantities = Array.from({ length: 20 }, (_, i) => (i + 1) * 500)
      const requestBody = createMockMultiQuantityRequest({
        quantities: largeQuantities
      })
      mockRequest = createMockNextRequest(requestBody)

      const startTime = Date.now()
      const response = await POST(mockRequest)
      const endTime = Date.now()

      expect(response.status).toBe(200)
      expect(endTime - startTime).toBeLessThan(5000) // Should complete within 5 seconds

      const data = await response.json()
      expect(data.data.calculations.size).toBe(20)
    })
  })

  describe('input validation', () => {
    it('should validate required fields', async () => {
      const invalidBody = {
        // Missing required fields
        quantities: [100, 500, 1000]
      }
      mockRequest = createMockNextRequest(invalidBody)

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('VALIDATION_ERROR')
      expect(data.error.message).toContain('required')
    })

    it('should validate quantities array', async () => {
      const requestBody = createMockMultiQuantityRequest({
        quantities: [] // Empty array
      })
      mockRequest = createMockNextRequest(requestBody)

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('INVALID_QUANTITIES')
    })

    it('should validate individual quantities', async () => {
      const requestBody = createMockMultiQuantityRequest({
        quantities: [0, -100, 50] // Contains invalid quantities
      })
      mockRequest = createMockNextRequest(requestBody)

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('INVALID_QUANTITY_VALUES')
    })

    it('should validate base parameters', async () => {
      const requestBody = createMockMultiQuantityRequest({
        baseParams: {
          ...createMockMultiQuantityRequest().baseParams,
          width: -100, // Invalid width
          height: 0,   // Invalid height
          materialId: '' // Empty material ID
        }
      })
      mockRequest = createMockNextRequest(requestBody)

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error.details.fields).toContain('width')
      expect(data.error.details.fields).toContain('height')
      expect(data.error.details.fields).toContain('materialId')
    })

    it('should limit maximum quantities', async () => {
      const tooManyQuantities = Array.from({ length: 51 }, (_, i) => i + 1) // 51 quantities
      const requestBody = createMockMultiQuantityRequest({
        quantities: tooManyQuantities
      })
      mockRequest = createMockNextRequest(requestBody)

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('TOO_MANY_QUANTITIES')
      expect(data.error.message).toContain('最大50個')
    })
  })

  describe('error handling', () => {
    it('should handle calculation engine errors', async () => {
      const { multiQuantityCalculator } = require('@/lib/multi-quantity-calculator')
      multiQuantityCalculator.calculateMultiQuantity.mockRejectedValueOnce(
        new Error('Calculation engine failed')
      )

      const requestBody = createMockMultiQuantityRequest()
      mockRequest = createMockNextRequest(requestBody)

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('CALCULATION_ERROR')
      expect(data.error.message).toContain('計算中にエラー')
    })

    it('should handle timeout errors', async () => {
      const { multiQuantityCalculator } = require('@/lib/multi-quantity-calculator')
      multiQuantityCalculator.calculateMultiQuantity.mockImplementationOnce(
        () => new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 6000)
        )
      )

      const requestBody = createMockMultiQuantityRequest()
      mockRequest = createMockNextRequest(requestBody)

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(408)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('TIMEOUT')
    })

    it('should handle malformed JSON', async () => {
      mockRequest = {
        json: jest.fn().mockRejectedValueOnce(new Error('Invalid JSON')),
        method: 'POST',
        url: 'http://localhost:3000/api/quotes/multi-quantity'
      } as unknown as NextRequest

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('INVALID_JSON')
    })

    it('should handle memory errors', async () => {
      const { multiQuantityCalculator } = require('@/lib/multi-quantity-calculator')
      multiQuantityCalculator.calculateMultiQuantity.mockRejectedValueOnce(
        new Error('OutOfMemoryError')
      )

      const requestBody = createMockMultiQuantityRequest()
      mockRequest = createMockNextRequest(requestBody)

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(507)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('INSUFFICIENT_STORAGE')
    })
  })

  describe('performance optimization', () => {
    it('should use caching for identical requests', async () => {
      const { multiQuantityCalculator } = require('@/lib/multi-quantity-calculator')
      const requestBody = createMockMultiQuantityRequest()
      mockRequest = createMockNextRequest(requestBody)

      // First request
      await POST(mockRequest)

      // Second identical request
      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.metadata.cached).toBe(true)
      expect(multiQuantityCalculator.calculateMultiQuantity).toHaveBeenCalledTimes(1)
    })

    it('should implement rate limiting', async () => {
      const requestBody = createMockMultiQuantityRequest()

      // Make multiple rapid requests
      const requests = Array.from({ length: 10 }, () =>
        POST(createMockNextRequest(requestBody))
      )

      const responses = await Promise.all(requests)

      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter(res => res.status === 429)
      expect(rateLimitedResponses.length).toBeGreaterThan(0)
    })

    it('should handle concurrent requests efficiently', async () => {
      const requestBody = createMockMultiQuantityRequest({
        quantities: [100, 500, 1000, 2000, 5000]
      })

      const concurrentRequests = Array.from({ length: 5 }, () =>
        POST(createMockNextRequest(requestBody))
      )

      const startTime = Date.now()
      const responses = await Promise.all(concurrentRequests)
      const endTime = Date.now()

      expect(responses.every(res => res.status === 200)).toBe(true)
      expect(endTime - startTime).toBeLessThan(3000) // Should complete within 3 seconds
    })
  })

  describe('security', () => {
    it('should sanitize input data', async () => {
      const maliciousBody = createMockMultiQuantityRequest({
        baseParams: {
          ...createMockMultiQuantityRequest().baseParams,
          bagTypeId: '<script>alert("xss")</script>',
          materialId: '../../etc/passwd'
        }
      })
      mockRequest = createMockNextRequest(maliciousBody)

      const response = await POST(mockRequest)
      const data = await response.json()

      // Should sanitize or reject malicious input
      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('INVALID_INPUT')
    })

    it('should handle large payload attacks', async () => {
      const largePayload = {
        ...createMockMultiQuantityRequest(),
        largeField: 'x'.repeat(10000000) // 10MB string
      }
      mockRequest = createMockNextRequest(largePayload)

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(413)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('PAYLOAD_TOO_LARGE')
    })

    it('should validate request origin', async () => {
      const requestBody = createMockMultiQuantityRequest()
      mockRequest = createMockNextRequest(requestBody, {
        'origin': 'https://malicious-site.com'
      })

      const response = await POST(mockRequest)

      // Should reject requests from unauthorized origins
      expect(response.status).toBe(403)
    })
  })

  describe('monitoring and logging', () => {
    it('should log errors appropriately', async () => {
      const { multiQuantityCalculator } = require('@/lib/multi-quantity-calculator')
      const { logError } = require('@/lib/error-logger')

      multiQuantityCalculator.calculateMultiQuantity.mockRejectedValueOnce(
        new Error('Test error')
      )

      const requestBody = createMockMultiQuantityRequest()
      mockRequest = createMockNextRequest(requestBody)

      await POST(mockRequest)

      expect(logError).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(Error),
          endpoint: '/api/quotes/multi-quantity',
          requestId: expect.any(String)
        })
      )
    })

    it('should include request tracking headers', async () => {
      const requestBody = createMockMultiQuantityRequest()
      mockRequest = createMockNextRequest(requestBody)

      const response = await POST(mockRequest)

      expect(response.headers.get('x-request-id')).toBeDefined()
      expect(response.headers.get('x-processing-time')).toBeDefined()
    })
  })

  describe('response format', () => {
    it('should return consistent API response format', async () => {
      const requestBody = createMockMultiQuantityRequest()
      mockRequest = createMockNextRequest(requestBody)

      const response = await POST(mockRequest)
      const data = await response.json()

      // Validate response structure
      expect(data).toHaveProperty('success')
      expect(data).toHaveProperty('data')
      expect(data).toHaveProperty('metadata')

      if (data.success) {
        expect(data.data).toHaveProperty('baseParams')
        expect(data.data).toHaveProperty('quantities')
        expect(data.data).toHaveProperty('calculations')
        expect(data.data).toHaveProperty('comparison')
        expect(data.data).toHaveProperty('recommendations')
      } else {
        expect(data).toHaveProperty('error')
        expect(data.error).toHaveProperty('code')
        expect(data.error).toHaveProperty('message')
      }
    })

    it('should include proper HTTP status codes', async () => {
      const testCases = [
        { body: createMockMultiQuantityRequest(), expectedStatus: 200 },
        { body: {}, expectedStatus: 400 }, // Invalid request
      ]

      for (const testCase of testCases) {
        mockRequest = createMockNextRequest(testCase.body)
        const response = await POST(mockRequest)
        expect(response.status).toBe(testCase.expectedStatus)
      }
    })

    it('should set appropriate cache headers', async () => {
      const requestBody = createMockMultiQuantityRequest()
      mockRequest = createMockNextRequest(requestBody)

      const response = await POST(mockRequest)

      expect(response.headers.get('cache-control')).toBe('no-cache, no-store, must-revalidate')
      expect(response.headers.get('pragma')).toBe('no-cache')
    })
  })
})