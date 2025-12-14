import { setupServer } from 'msw/node'
import { http } from 'msw'

// Mock data generators
const createMockQuoteResult = (params: any) => ({
  unitPrice: params.unitPrice || 100,
  totalCost: params.totalCost || (params.quantity || 1000) * (params.unitPrice || 100),
  leadTimeDays: params.leadTimeDays || 14,
  quantity: params.quantity || 1000,
  breakdown: {
    materials: 50,
    printing: 30,
    postProcessing: 20,
    packaging: 10,
    shipping: 15
  }
})
const generateMultiQuantityResults = (request: any) => {
  const { quantities } = request
  const calculations = new Map()

  quantities.forEach((quantity: number) => {
    calculations.set(quantity, {
      ...createMockQuoteResult({
        quantity,
        unitPrice: Math.max(10, 100 - Math.log(quantity) * 10),
        totalCost: quantity * Math.max(10, 100 - Math.log(quantity) * 10),
        leadTimeDays: Math.max(7, 21 - Math.log(quantity) * 2),
      }),
    })
  })

  return {
    baseParams: request.baseParams,
    quantities,
    calculations,
    comparison: {
      bestValue: {
        quantity: quantities[quantities.length - 1],
        savings: 250,
        percentage: 12.5,
        reason: 'Highest quantity provides best unit price economy',
      },
      priceBreaks: quantities.map((q: number, i: number) => ({
        quantity: q,
        priceBreak: `${(100 - i * 15).toFixed(0)}円/個`,
        discountRate: i * 0.15,
      })),
      economiesOfScale: quantities.reduce((acc: any, q: number) => {
        acc[q] = {
          unitPrice: Math.max(10, 100 - Math.log(q) * 10),
          totalSavings: Math.log(q) * 50,
          efficiency: Math.min(1, Math.log(q) / 10),
        }
        return acc
      }, {}),
      trends: {
        priceTrend: 'decreasing',
        optimalQuantity: quantities[quantities.length - 1],
        diminishingReturns: quantities[quantities.length - 2],
      },
    },
    recommendations: [
      {
        type: 'cost-optimized',
        title: 'コスト最適化プラン',
        description: '最大数量で最適な単価を実現',
        quantity: quantities[quantities.length - 1],
        reasoning: [
          '単価が最も安価',
          '生産効率が最大化',
          '在庫コストを考慮しても最適',
        ],
        estimatedSavings: 500,
        confidence: 0.9,
      },
      {
        type: 'balanced',
        title: 'バランスプラン',
        description: 'コストと需要のバランス',
        quantity: quantities[Math.floor(quantities.length / 2)],
        reasoning: [
          '適切な在庫レベル',
          '資金効率のバランス',
          '需要変動リスク低減',
        ],
        estimatedSavings: 200,
        confidence: 0.8,
      },
    ],
    metadata: {
      processingTime: 150,
      currency: 'JPY',
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  }
}

// API handlers - temporarily simplified for build compatibility
export const handlers = [
  // Standard quote calculation endpoint
  http.post('/api/quotation/calculate', ({ request }) => {
    const body = request.body as any

    return Response.json({
      success: true,
      data: createMockQuoteResult({
        ...body,
        quantity: body.quantity || 1000,
      }),
    })
  }),
]

// Setup server
export const server = setupServer(...handlers)