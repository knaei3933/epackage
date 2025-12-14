// Cart types for B2B packaging materials ordering

export interface CartItem {
  id: string
  productId: string
  product: {
    id: string
    category: string
    name_ja: string
    name_en: string
    description_ja: string
    description_en: string
    specifications: any
    materials: string[]
    pricing_formula: {
      base_cost: number
      per_unit_cost: number
      min_quantity: number
      setup_fee?: number
    }
    min_order_quantity: number
    lead_time_days: number
    tags: string[]
    applications: string[]
    features: string[]
  }
  quantity: number
  specifications: {
    width?: number
    height?: number
    depth?: number
    thickness?: number
    material?: string
    printing?: {
      colors: number
      sides: 'front' | 'back' | 'both'
      method: 'digital' | 'offset' | 'flexographic'
    }
    custom_features?: string[]
  }
  unitPrice: number
  totalPrice: number
  addedAt: Date
  notes?: string
}

export interface Cart {
  id: string
  items: CartItem[]
  subtotal: number
  tax: number
  shipping: number
  discount: number
  total: number
  currency: 'JPY' | 'USD'
  customerInfo?: {
    companyName: string
    contactPerson: string
    email: string
    phone?: string
    address?: {
      postalCode: string
      prefecture: string
      city: string
      addressLine1: string
      addressLine2?: string
    }
  }
  createdAt: Date
  updatedAt: Date
  status: 'draft' | 'quote_requested' | 'order_placed' | 'completed'
}

export interface QuoteRequest {
  id: string
  cartId: string
  customerInfo: {
    companyName: string
    contactPerson: string
    email: string
    phone?: string
    department?: string
    position?: string
  }
  shippingAddress?: {
    postalCode: string
    prefecture: string
    city: string
    addressLine1: string
    addressLine2?: string
  }
  billingAddress?: {
    postalCode: string
    prefecture: string
    city: string
    addressLine1: string
    addressLine2?: string
  }
  projectInfo: {
    projectName: string
    intendedUse: string
    targetMarket: string
    estimatedAnnualVolume: number
    timeline: string
    specialRequirements?: string
  }
  urgency: 'standard' | 'priority' | 'rush'
  deliveryPreference: 'standard' | 'express'
  notes?: string
  requestedAt: Date
  status: 'pending' | 'reviewing' | 'quoted' | 'accepted' | 'rejected'
  quoteId?: string
}

export interface QuoteResponse {
  id: string
  requestId: string
  cartId: string
  customerInfo: QuoteRequest['customerInfo']
  items: Array<{
    productId: string
    productName: string
    quantity: number
    specifications: CartItem['specifications']
    unitPrice: number
    totalPrice: number
    leadTime: number
    setupFee?: number
    toolingCost?: number
  }>
  pricing: {
    subtotal: number
    setupFee: number
    toolingCost: number
    discount: number
    tax: number
    shipping: number
    total: number
    currency: 'JPY' | 'USD'
  }
  timeline: {
    sampleDelivery: string
    productionStart: string
    finalDelivery: string
  }
  terms: {
    paymentTerms: string
    deliveryTerms: string
    validityPeriod: string
    minimumOrder: number
  }
  notes?: string
  createdAt: Date
  validUntil: Date
  status: 'active' | 'accepted' | 'expired' | 'replaced'
}

export interface CartContextType {
  cart: Cart | null
  items: CartItem[]
  addItem: (product: CartItem['product'], quantity: number, specifications?: CartItem['specifications']) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  updateSpecifications: (itemId: string, specifications: CartItem['specifications']) => void
  clearCart: () => void
  calculateTotals: () => void
  requestQuote: (quoteRequest: Omit<QuoteRequest, 'id' | 'cartId' | 'requestedAt' | 'status'>) => Promise<QuoteResponse>
  convertToOrder: (quoteId: string) => Promise<void>
  isLoading: boolean
  error: string | null
}

// Utility functions for cart calculations
export const calculateItemPrice = (
  product: CartItem['product'],
  quantity: number,
  specifications?: CartItem['specifications']
): { unitPrice: number; totalPrice: number } => {
  const baseCost = product.pricing_formula.base_cost || 0
  const perUnitCost = product.pricing_formula.per_unit_cost || 0
  const setupFee = product.pricing_formula.setup_fee || 0

  // Base calculation
  let unitPrice = perUnitCost
  let totalPrice = baseCost + (unitPrice * quantity)

  // Add setup fee distributed across units
  if (setupFee && quantity > 0) {
    unitPrice += setupFee / quantity
    totalPrice += setupFee
  }

  // Adjust for material specifications
  if (specifications?.material) {
    const materialMultiplier = getMaterialMultiplier(specifications.material)
    unitPrice *= materialMultiplier
    totalPrice = unitPrice * quantity + baseCost
  }

  // Adjust for printing specifications
  if (specifications?.printing) {
    const printingCost = calculatePrintingCost(specifications.printing, quantity)
    totalPrice += printingCost
    unitPrice = totalPrice / quantity
  }

  return { unitPrice, totalPrice }
}

const getMaterialMultiplier = (material: string): number => {
  const multipliers: { [key: string]: number } = {
    'PE': 1.0,
    'PP': 1.1,
    'PET': 1.2,
    'ALUMINUM': 1.5,
    'PAPER_LAMINATE': 1.3,
    '特殊素材': 2.0
  }
  return multipliers[material] || 1.0
}

const calculatePrintingCost = (printing: CartItem['specifications']['printing'], quantity: number): number => {
  let cost = 0

  // Base setup cost per color
  cost += (printing?.colors || 0) * 10000

  // Cost per impression based on method
  const methodCosts = {
    'digital': 5,
    'offset': 3,
    'flexographic': 2
  }

  const sides = printing?.sides === 'both' ? 2 : 1
  cost += (methodCosts[printing?.method || 'digital'] || 5) * (printing?.colors || 0) * quantity * sides

  return cost
}