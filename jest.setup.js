// Polyfill fetch API first (must be before any other imports)
try {
  const { Response, Headers, Request, fetch } = require('undici')
  global.Response = global.Response || Response
  global.Headers = global.Headers || Headers
  global.Request = global.Request || Request
  global.fetch = global.fetch || fetch
} catch (e) {
  // undici not available
}

import '@testing-library/jest-dom'
import 'jest-axe/extend-expect'
import { configure } from '@testing-library/react'

// Configure Testing Library
configure({ testIdAttribute: 'data-testid' })

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => <img {...props} />,
}))

// Mock environment variables
process.env.NODE_ENV = 'test'
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'

// Mock fetch API (but keep undici polyfill)
global.fetch = global.fetch || jest.fn()

// Mock window.matchMedia (only in jsdom environment)
if (typeof window !== 'undefined') {
  // Mock scrollTo (needed by PDF generator)
  window.scrollTo = jest.fn();

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })

  // Mock ResizeObserver
  global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }))

  // Mock IntersectionObserver
  global.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }))

  // Mock canvas and html2canvas for PDF generation
  HTMLCanvasElement.prototype.getContext = jest.fn()
  HTMLCanvasElement.prototype.toDataURL = jest.fn(() => 'data:image/png;base64,mock')
}

// Mock jsPDF - properly mock the constructor
jest.mock('jspdf', () => {
  const mockJsPDF = jest.fn().mockImplementation(() => ({
    text: jest.fn().mockReturnThis(),
    addImage: jest.fn().mockReturnThis(),
    addPage: jest.fn().mockReturnThis(),
    setPage: jest.fn().mockReturnThis(),
    save: jest.fn().mockReturnThis(),
    output: jest.fn(() => new Uint8Array([1, 2, 3])),
    internal: {
      pages: [{}, {}],
      pageSize: { width: 210, height: 297 },
    },
  }))
  return {
    __esModule: true,
    default: mockJsPDF,
  }
})

// Mock html2canvas
jest.mock('html2canvas', () => {
  return {
    __esModule: true,
    default: jest.fn().mockResolvedValue({
      toDataURL: jest.fn(() => 'data:image/png;base64,mockImageData'),
      width: 794,
      height: 1123,
    }),
  }
})

// Setup MSW for API mocking (only in jsdom environment)
let server = null

beforeAll(async () => {
  // Only setup MSW if explicitly enabled via environment variable
  if (process.env.ENABLE_MSW !== 'true') {
    return
  }

  try {
    const { server: mswServer } = await import('./src/mocks/server')
    server = mswServer
    server.listen()
  } catch (error) {
    console.warn('MSW setup failed, continuing without mock server:', error.message)
  }
})

afterEach(() => {
  server?.resetHandlers()
  jest.clearAllMocks()
})

afterAll(() => {
  server?.close()
})

// Performance testing utilities
global.performance = {
  ...performance,
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByName: jest.fn(() => []),
  getEntriesByType: jest.fn(() => []),
}

// Mock Web Vitals
jest.mock('web-vitals', () => ({
  getCLS: jest.fn(),
  getFID: jest.fn(),
  getFCP: jest.fn(),
  getLCP: jest.fn(),
  getTTFB: jest.fn(),
}))

// Global test utilities
global.createMockQuoteResult = (overrides = {}) => ({
  basePrice: 1000,
  materialCost: 500,
  printingCost: 300,
  postProcessingCost: 200,
  setupFee: 100,
  totalCost: 2100,
  unitPrice: 21,
  leadTimeDays: 14,
  isValid: true,
  breakdown: {
    materials: { cost: 500, description: 'Material costs' },
    printing: { cost: 300, description: 'Printing costs' },
    postProcessing: { cost: 200, description: 'Post-processing costs' },
    setup: { cost: 100, description: 'Setup fees' },
  },
  discounts: [],
  taxes: { rate: 0.1, amount: 210 },
  ...overrides,
})

global.createMockMultiQuantityRequest = (overrides = {}) => ({
  baseParams: {
    bagTypeId: 'bag-type-1',
    materialId: 'material-1',
    width: 300,
    height: 400,
    depth: 100,
    thicknessSelection: 'standard',
    isUVPrinting: true,
    printingType: 'digital',
    printingColors: 4,
    doubleSided: false,
    postProcessingOptions: ['lamination'],
    deliveryLocation: 'domestic',
    urgency: 'standard',
  },
  quantities: [100, 500, 1000, 5000],
  comparisonMode: 'price',
  includeRecommendations: true,
  ...overrides,
})