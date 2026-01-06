// B2B Checkout and Payment System Types

export interface BillingAddress {
  company: string
  department?: string
  name: string
  email: string
  phone: string
  zipCode: string
  prefecture: string
  address: string
  building?: string
  taxId?: string // 税務署番号
}

export interface ShippingAddress {
  company: string
  department?: string
  contactName: string
  phone: string
  zipCode: string
  prefecture: string
  address: string
  building?: string
  deliveryInstructions?: string
}

export interface PaymentMethod {
  type: 'invoice' | 'credit_card' | 'bank_transfer'
  details?: {
    cardNumber?: string
    expiryDate?: string
    cvv?: string
    cardholderName?: string
    bankName?: string
    accountNumber?: string
  }
  purchaseOrder?: string // 購買発注番号
  approvalRequired?: boolean
}

export interface OrderItem {
  id: string
  productId: string
  name: string
  nameJa: string
  description?: string
  quantity: number
  unitPrice: number
  totalPrice: number
  specifications: {
    material: string
    thickness: number
    printing: {
      colors: number
      sides: string
      method: string
    }
    size?: {
      width: number
      height: number
    }
  }
  leadTime: number
  minOrderQuantity: number
}

export interface OrderSummary {
  subtotal: number
  tax: number // 消費税
  shippingFee: number
  installationFee?: number
  discountAmount?: number
  total: number
  estimatedDelivery: string
  paymentTerms: string
}

export interface Order {
  id: string
  orderNumber: string
  items: OrderItem[]
  billingAddress: BillingAddress
  shippingAddress: ShippingAddress
  paymentMethod: PaymentMethod
  summary: OrderSummary
  status: 'draft' | 'pending_approval' | 'approved' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  createdAt: Date
  updatedAt: Date
  approvedBy?: string
  approvedAt?: Date
  shippedAt?: Date
  deliveredAt?: Date
  trackingNumber?: string
  notes?: string
}

export interface CheckoutState {
  currentStep: number
  billingAddress: BillingAddress | null
  shippingAddress: ShippingAddress | null
  paymentMethod: PaymentMethod | null
  orderItems: OrderItem[]
  summary: OrderSummary | null
  isProcessing: boolean
  errors: Record<string, string[]>
}

export interface Invoice {
  id: string
  invoiceNumber: string
  orderId: string
  orderNumber: string
  billingAddress: BillingAddress
  items: OrderItem[]
  summary: OrderSummary
  issueDate: Date
  dueDate: Date
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  paymentStatus: 'pending' | 'partial' | 'paid'
  createdAt: Date
  updatedAt: Date
}

export interface QuoteRequest {
  id: string
  quoteNumber: string
  company: string
  contactName: string
  email: string
  phone: string
  items: OrderItem[]
  requirements: {
    projectDescription?: string
    targetPrice?: number
    deadline?: string
    specialRequirements?: string
    volume?: number
    frequency?: string
  }
  status: 'pending' | 'processing' | 'sent' | 'approved' | 'rejected'
  validUntil: Date
  createdAt: Date
  updatedAt: Date
  quoteAmount?: number
  notes?: string
}

export interface PaymentProcessing {
  sessionId: string
  clientSecret?: string
  amount: number
  currency: string
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled'
  paymentMethodId?: string
  errorCode?: string
  errorMessage?: string
}

// Japanese prefectures for form validation
export const JAPANESE_PREFECTURES = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
]

// Payment terms for B2B
export const PAYMENT_TERMS = {
  invoice_net30: '請求書払い（30日）',
  invoice_net60: '請求書払い（60日）',
  bank_transfer: '銀行振込',
  credit_card: 'クレジットカード',
  purchase_order: '購入発注書'
} as const

// Order status labels
export const ORDER_STATUS_LABELS = {
  draft: '下書き',
  pending_approval: '承認待ち',
  approved: '承認済み',
  processing: '処理中',
  shipped: '発送済み',
  delivered: '配達済み',
  cancelled: 'キャンセル'
} as const

// Invoice status labels
export const INVOICE_STATUS_LABELS = {
  draft: '下書き',
  sent: '送付済み',
  paid: '支払済み',
  overdue: '期限切れ'
} as const