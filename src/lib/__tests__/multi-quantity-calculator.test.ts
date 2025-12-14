import { MultiQuantityCalculator } from '../multi-quantity-calculator'
import { createMockMultiQuantityRequest, createMockQuoteResult } from '../../../jest.setup'
import type { MultiQuantityRequest } from '@/types/multi-quantity'

// Mock the unified pricing engine
jest.mock('../unified-pricing-engine', () => ({
  unifiedPricingEngine: {
    calculateQuote: jest.fn().mockImplementation(async (params: any) => {
      // Simulate realistic pricing calculation
      const baseCost = 5000 // Fixed setup cost
      const materialCost = params.width * params.height * 0.01 // Material cost
      const printingCost = params.printingColors * 100
      const unitPrice = (baseCost + materialCost + printingCost) / Math.max(params.quantity, 1) * (1 - Math.log(params.quantity) * 0.05)

      return createMockQuoteResult({
        ...params,
        basePrice: baseCost,
        materialCost,
        printingCost,
        totalCost: unitPrice * params.quantity,
        unitPrice: Math.max(50, unitPrice),
        leadTimeDays: Math.max(7, 21 - Math.log(params.quantity) * 2),
      })
    })
  },
  UnifiedQuoteParams: {},
  UnifiedQuoteResult: {}
}))

describe('MultiQuantityCalculator', () => {
  let calculator: MultiQuantityCalculator
  let mockRequest: MultiQuantityRequest

  beforeEach(() => {
    calculator = new MultiQuantityCalculator()
    mockRequest = createMockMultiQuantityRequest()
    jest.clearAllMocks()
  })

  describe('calculateMultiQuantity', () => {
    it('should calculate quotes for all requested quantities', async () => {
      const result = await calculator.calculateMultiQuantity(mockRequest)

      expect(result.quantities).toEqual([100, 500, 1000, 5000])
      expect(result.calculations.size).toBe(4)

      // Check that calculations exist for all quantities
      mockRequest.quantities.forEach(quantity => {
        expect(result.calculations.has(quantity)).toBe(true)
        const quote = result.calculations.get(quantity)
        expect(quote).toBeDefined()
        expect(quote?.quantity).toBe(quantity)
        expect(quote?.unitPrice).toBeGreaterThan(0)
        expect(quote?.totalCost).toBeGreaterThan(0)
      })
    })

    it('should generate comparison analysis', async () => {
      const result = await calculator.calculateMultiQuantity(mockRequest)

      expect(result.comparison).toBeDefined()
      expect(result.comparison.bestValue).toBeDefined()
      expect(result.comparison.priceBreaks).toHaveLength(4)
      expect(result.comparison.economiesOfScale).toBeDefined()
      expect(result.comparison.trends).toBeDefined()
    })

    it('should generate recommendations when requested', async () => {
      const requestWithRecommendations = {
        ...mockRequest,
        includeRecommendations: true
      }

      const result = await calculator.calculateMultiQuantity(requestWithRecommendations)

      expect(result.recommendations).toBeDefined()
      expect(result.recommendations.length).toBeGreaterThan(0)

      // Check recommendation structure
      result.recommendations.forEach(rec => {
        expect(rec).toHaveProperty('type')
        expect(rec).toHaveProperty('title')
        expect(rec).toHaveProperty('description')
        expect(rec).toHaveProperty('quantity')
        expect(rec).toHaveProperty('reasoning')
        expect(rec).toHaveProperty('estimatedSavings')
        expect(rec).toHaveProperty('confidence')
        expect(rec.confidence).toBeGreaterThanOrEqual(0)
        expect(rec.confidence).toBeLessThanOrEqual(1)
      })
    })

    it('should not generate recommendations when not requested', async () => {
      const requestWithoutRecommendations = {
        ...mockRequest,
        includeRecommendations: false
      }

      const result = await calculator.calculateMultiQuantity(requestWithoutRecommendations)

      expect(result.recommendations).toEqual([])
    })

    it('should process quantities in correct order', async () => {
      const requestWithUnsortedQuantities = {
        ...mockRequest,
        quantities: [1000, 100, 5000, 500] // Unsorted
      }

      const result = await calculator.calculateMultiQuantity(requestWithUnsortedQuantities)

      expect(result.quantities).toEqual([1000, 100, 5000, 500]) // Should preserve input order
      expect(result.calculations.size).toBe(4)
    })

    it('should handle empty quantities array', async () => {
      const emptyRequest = {
        ...mockRequest,
        quantities: []
      }

      const result = await calculator.calculateMultiQuantity(emptyRequest)

      expect(result.quantities).toEqual([])
      expect(result.calculations.size).toBe(0)
      expect(result.comparison.bestValue.quantity).toBe(0)
    })

    it('should include proper metadata', async () => {
      const result = await calculator.calculateMultiQuantity(mockRequest)

      expect(result.metadata).toBeDefined()
      expect(result.metadata.processingTime).toBeGreaterThan(0)
      expect(result.metadata.currency).toBe('JPY')
      expect(result.metadata.validUntil).toBeInstanceOf(Date)
      expect(result.metadata.validUntil.getTime()).toBeGreaterThan(Date.now())
    })

    it('should complete within reasonable time', async () => {
      const startTime = Date.now()
      await calculator.calculateMultiQuantity(mockRequest)
      const endTime = Date.now()

      const processingTime = endTime - startTime
      expect(processingTime).toBeLessThan(5000) // Should complete within 5 seconds
    })
  })

  describe('calculateSingleQuantity', () => {
    it('should cache calculation results', async () => {
      const quantity = 1000

      // First calculation
      const result1 = await calculator.calculateMultiQuantity({
        ...mockRequest,
        quantities: [quantity]
      })

      // Second calculation with same parameters
      const result2 = await calculator.calculateMultiQuantity({
        ...mockRequest,
        quantities: [quantity]
      })

      // Results should be identical
      const quote1 = result1.calculations.get(quantity)
      const quote2 = result2.calculations.get(quantity)

      expect(quote1?.unitPrice).toBe(quote2?.unitPrice)
      expect(quote1?.totalCost).toBe(quote2?.totalCost)
    })

    it('should apply economies of scale', async () => {
      const result = await calculator.calculateMultiQuantity(mockRequest)

      const smallQuote = result.calculations.get(100)
      const largeQuote = result.calculations.get(5000)

      expect(smallQuote?.unitPrice).toBeGreaterThan(largeQuote?.unitPrice)
      expect(largeQuote?.totalCost).toBeGreaterThan(smallQuote?.totalCost)
    })
  })

  describe('comparison analysis', () => {
    it('should identify best value quantity', async () => {
      const result = await calculator.calculateMultiQuantity(mockRequest)

      const bestValue = result.comparison.bestValue
      expect(bestValue.quantity).toBe(5000) // Highest quantity should have best unit price
      expect(bestValue.savings).toBeGreaterThan(0)
      expect(bestValue.percentage).toBeGreaterThan(0)
      expect(bestValue.reason).toBeDefined()
    })

    it('should calculate price breaks correctly', async () => {
      const result = await calculator.calculateMultiQuantity(mockRequest)

      const priceBreaks = result.comparison.priceBreaks
      expect(priceBreaks).toHaveLength(4)

      priceBreaks.forEach((breakItem, index) => {
        expect(breakItem.quantity).toBe(mockRequest.quantities[index])
        expect(breakItem.priceBreak).toBeDefined()
        expect(breakItem.discountRate).toBeGreaterThanOrEqual(0)
      })
    })

    it('should analyze economies of scale', async () => {
      const result = await calculator.calculateMultiQuantity(mockRequest)

      const economies = result.comparison.economiesOfScale
      mockRequest.quantities.forEach(quantity => {
        expect(economies[quantity]).toBeDefined()
        expect(economies[quantity].unitPrice).toBeGreaterThan(0)
        expect(economies[quantity].efficiency).toBeGreaterThanOrEqual(0)
        expect(economies[quantity].efficiency).toBeLessThanOrEqual(1)
      })
    })

    it('should identify price trends', async () => {
      const result = await calculator.calculateMultiQuantity(mockRequest)

      const trends = result.comparison.trends
      expect(trends.priceTrend).toBe('decreasing')
      expect(trends.optimalQuantity).toBe(5000)
      expect(trends.diminishingReturns).toBeDefined()
    })
  })

  describe('error handling', () => {
    it('should handle invalid parameters gracefully', async () => {
      const invalidRequest = {
        ...mockRequest,
        baseParams: {
          ...mockRequest.baseParams,
          width: -100, // Invalid width
          height: 0,   // Invalid height
        }
      }

      // Should not throw error but handle gracefully
      const result = await calculator.calculateMultiQuantity(invalidRequest)
      expect(result).toBeDefined()
    })

    it('should handle zero quantity', async () => {
      const requestWithZero = {
        ...mockRequest,
        quantities: [0, 100, 500]
      }

      const result = await calculator.calculateMultiQuantity(requestWithZero)
      expect(result.calculations.has(0)).toBe(true)

      const zeroQuote = result.calculations.get(0)
      expect(zeroQuote?.quantity).toBe(0)
    })

    it('should handle very large quantities', async () => {
      const requestWithLargeQuantity = {
        ...mockRequest,
        quantities: [1000000] // 1 million
      }

      const result = await calculator.calculateMultiQuantity(requestWithLargeQuantity)
      expect(result.calculations.has(1000000)).toBe(true)

      const largeQuote = result.calculations.get(1000000)
      expect(largeQuote?.unitPrice).toBeGreaterThan(0)
      expect(largeQuote?.unitPrice).toBeLessThan(100) // Should have significant discount
    })
  })

  describe('performance optimization', () => {
    it('should use cached shared costs for multiple calculations', async () => {
      const request1 = createMockMultiQuantityRequest({
        quantities: [100, 500]
      })
      const request2 = createMockMultiQuantityRequest({
        quantities: [1000, 5000]
      })

      // Run first calculation
      await calculator.calculateMultiQuantity(request1)

      // Run second calculation with same baseParams
      const startTime = Date.now()
      await calculator.calculateMultiQuantity(request2)
      const endTime = Date.now()

      // Should be faster due to caching
      expect(endTime - startTime).toBeLessThan(1000)
    })

    it('should process large quantities array efficiently', async () => {
      const largeQuantities = Array.from({ length: 50 }, (_, i) => (i + 1) * 100)
      const largeRequest = {
        ...mockRequest,
        quantities: largeQuantities
      }

      const startTime = Date.now()
      const result = await calculator.calculateMultiQuantity(largeRequest)
      const endTime = Date.now()

      expect(result.calculations.size).toBe(50)
      expect(endTime - startTime).toBeLessThan(10000) // Should complete within 10 seconds
    })
  })

  describe('integration with unified pricing engine', () => {
    it('should pass correct parameters to pricing engine', async () => {
      const { unifiedPricingEngine } = require('../unified-pricing-engine')

      await calculator.calculateMultiQuantity(mockRequest)

      // Should call pricing engine for each quantity
      expect(unifiedPricingEngine.calculateQuote).toHaveBeenCalledTimes(mockRequest.quantities.length)

      // Check that it was called with correct parameters
      mockRequest.quantities.forEach(quantity => {
        expect(unifiedPricingEngine.calculateQuote).toHaveBeenCalledWith(
          expect.objectContaining({
            ...mockRequest.baseParams,
            quantity
          })
        )
      })
    })

    it('should handle pricing engine errors gracefully', async () => {
      const { unifiedPricingEngine } = require('../unified-pricing-engine')

      // Mock pricing engine to throw error
      unifiedPricingEngine.calculateQuote.mockRejectedValueOnce(new Error('Pricing engine error'))

      // Should not throw error but handle gracefully
      const result = await calculator.calculateMultiQuantity(mockRequest)
      expect(result).toBeDefined()
    })
  })
})