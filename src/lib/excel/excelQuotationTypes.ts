/**
 * Excel Quotation System Types
 * Complete type definitions for Japanese quotation document generation
 */

// ============================================================
// Core Data Types
// ============================================================

/**
 * Customer information for quotation
 */
export interface CustomerInfo {
  // Basic company information
  companyName: string          // 有限会社加豆フーズ
  companyNameEn?: string       // Kato Foods Co., Ltd.
  postalCode: string           // 〒379-2311
  address: string              // 群馬県みどり市懸町阿佐美1940
  contactPerson?: string       // 担当者名
  email?: string               // 連絡先メール
  phone?: string               // 電話番号
}

/**
 * Supplier information (EPACKAGE Lab)
 */
export interface SupplierInfo {
  brandName: string            // EPACKAGE Lab
  subBrand?: string            // by kanei-trade
  description?: string         // オーダーメイドバッグ印刷専門
  companyName: string          // 金井貿易株式会社
  postalCode: string           // 〒673-0846
  address: string              // 兵庫県明石市上ノ丸2-11-21
  phone: string                // TEL: 050-1793-6500
  email?: string               // 連絡先メール
}

/**
 * Payment and delivery terms
 */
export interface PaymentTerms {
  paymentMethod: string        // 支払い条件: 先払い (선불)
  submissionDeadline: string   // 入稿期限: 指定なし
  proofDeadline: string        // 校了締切: 指定なし
  paymentDeadline: string      // 入金締切: 校了前
  deliveryDate: string         // 納期: 校了から約1か月
  bankInfo: string            // 振込先: PayPay銀行...
}

/**
 * Product specifications (13 items + surface treatment)
 */
export interface ProductSpecifications {
  specNumber: string           // 仕様番号: L
  pouchType: string            // 袋タイプ: スタンドパウチ / ロールフィルム
  pouchTypeEn?: string         // Stand Pouch / Roll Film
  productType?: string         // 製品タイプ: stand_pouch, roll_film, flat_pouch, etc.
  contents: string             // 内容物: 粉体
  size: string                 // サイズ: 130×130×60 (mm) / 幅: 356mm、ピッチ: 86mm (roll film)
  material: string             // 素材: PET12μ+AL7μ+PET12μ+LLDPE60
  surfaceFinish?: string       // 表面処理: 光沢仕上げ / マット仕上げ

  // Pouch-only fields
  sealWidth: string            // シール幅: 5mm (pouch only)
  fillDirection: string        // 封入方向: 上 (pouch only)
  notchShape: string           // ノッチ形状: V (pouch only)
  notchPosition: string        // ノッチ位置: 指定位置 (pouch only)
  hanging?: string             // 吊り下げ加工: あり/なし (pouch only, PDF用)
  hangingHole: boolean         // 吊り下げ加工: なし (pouch only, OptionalProcessing用)
  hangingPosition: string      // 吊り下げ位置: 指定位置/6mm/8mm (pouch only)
  ziplockPosition: string      // チャック位置: 指定位置 (pouch only)
  cornerRadius: string         // 角加工: R5 (pouch only)

  // Roll film-only fields (ロールフィルム専用フィールド)
  materialWidth?: number       // 原反幅/実幅: 356 (mm)
  totalLength?: number         // 総長さ: 2000 (m)
  rollCount?: number           // ロール数: 2
  pitch?: number               // ピッチ: 86 (mm) - デザインの繰り返し周期
  filmLayers?: Array<{         // フィルム構造
    materialId: string
    thickness: number
  }>
}

/**
 * Order item details
 */
export interface OrderItem {
  no: number                   // 番号: 1, 2, 3...
  skuCount: number            // 商品数(SKU): 1
  quantity: number             // 合計数量: 5,000
  unitPrice: number           // 単価: ¥73.9
  discount: number            // 割引: ¥0
  total: number               // 合計(税別): ¥369,500
}

/**
 * Order summary calculations
 */
export interface OrderSummary {
  totalSkuCount: number        // 総SKU数: 2
  totalQuantity: number        // 総数量: 15,000
  subtotal: number            // 小計(税別): ¥905,500
  taxRate: number             // 消費税率: 10%
  taxAmount: number           // 消費税額: ¥90,550
  totalWithTax: number        // 総額(税込): ¥996,050
}

/**
 * Optional processing options (8 items)
 * Maps to checkbox format (○/-)
 */
export interface OptionalProcessing {
  ziplock: boolean            // チャック: ○/-
  notch: boolean              // ノッチ: ○/-
  hangingHole: boolean        // 吊り下げ穴: -/○
  cornerRound: boolean        // 角加工: ○/-
  gasVent: boolean            // ガス抜きバルブ: -/○
  easyCut: boolean           // Easy Cut: -/○
  embossing: boolean         // 型抜き: -/○
}

/**
 * Watermark/stamp information
 */
export interface WatermarkInfo {
  text: string                // 申101入
  position: 'center' | 'custom' // 位置
  style: {
    fontSize: number
    color: string
    opacity: number
    rotation?: number
  }
}

/**
 * Quotation metadata
 */
export interface QuotationMetadata {
  quotationNumber: string     // 見積番号: QT-2025-0001
  issueDate: string           // 発行日: 2025-12-31
  validDate?: string          // 有効期限: 2026-01-31
  status: 'draft' | 'sent' | 'approved' | 'rejected'
  version?: string            // バージョン: v1.0
}

// ============================================================
// Complete Quotation Data Structure
// ============================================================

/**
 * Complete quotation data for Excel generation
 */
export interface QuotationData {
  // Document metadata
  metadata: QuotationMetadata

  // Parties information
  customer: CustomerInfo
  supplier: SupplierInfo

  // Business terms
  paymentTerms: PaymentTerms

  // Product specifications
  specifications: ProductSpecifications

  // Order details
  orders: OrderItem[]
  orderSummary: OrderSummary

  // Optional processing
  options: OptionalProcessing

  // Raw postProcessingOptions for detailed display
  rawPostProcessingOptions?: string[]

  // Watermark
  watermark?: WatermarkInfo

  // Additional notes
  notes?: string
  adminNotes?: string
}

// ============================================================
// Excel Cell Mapping Types
// ============================================================

/**
 * Cell reference for Excel positioning
 */
export interface CellReference {
  sheet: string               // シート名
  cell: string                // セル参照 (A1, B3, etc.)
  value: string | number | boolean
  format?: {
    bold?: boolean
    italic?: boolean
    fontSize?: number
    color?: string
    backgroundColor?: string
    alignment?: 'left' | 'center' | 'right'
    wrapText?: boolean
    numberFormat?: string     // for currency, dates, etc.
  }
}

/**
 * Cell range for data blocks
 */
export interface CellRange {
  sheet: string
  fromCell: string            // E14
  toCell: string              // J16
  data: any[][]
}

// ============================================================
// Processing Option Mapping Types
// ============================================================

/**
 * Processing option from database to Excel mapping
 */
export interface ProcessingOptionMapping {
  dbOptionId: string          // zipper-yes, notch-yes, etc.
  excelOptionKey: keyof OptionalProcessing
  displayName: string         // チャック, ノッチ, etc.
  displayValue: (enabled: boolean) => string  // ○ or -
}

/**
 * Processing option configuration
 */
export interface ProcessingOptionConfig {
  category: 'opening-sealing' | 'surface-treatment' | 'shape-structure' | 'functionality'
  optionName: string
  optionNameJa: string
  priceMultiplier: number
  processingTime: string
  minimumQuantity: number
}

// ============================================================
// Export/Import Types
// ============================================================

/**
 * Excel export options
 */
export interface ExcelExportOptions {
  format: 'xlsx' | 'xls' | 'csv'
  includeFormulas?: boolean   // Include calculation formulas
  includeWatermark?: boolean  // Add watermark
  templatePath?: string       // Custom template path
  outputPath?: string         // Save location
}

/**
 * Excel generation result
 */
export interface ExcelGenerationResult {
  success: boolean
  filePath?: string
  fileName?: string
  error?: string
  metadata: {
    generatedAt: string
    version: string
    itemCount: number
    totalAmount: number
  }
}

// ============================================================
// Type Guards & Validators
// ============================================================

/**
 * Check if data is valid QuotationData
 */
export function isQuotationData(data: any): data is QuotationData {
  return (
    data &&
    typeof data === 'object' &&
    data.metadata &&
    data.customer &&
    data.supplier &&
    data.paymentTerms &&
    data.specifications &&
    Array.isArray(data.orders) &&
    data.options
  )
}

/**
 * Validate required fields
 */
export function validateQuotationData(data: QuotationData): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!data.customer.companyName) {
    errors.push('Customer company name is required')
  }
  if (!data.specifications.pouchType) {
    errors.push('Pouch type is required')
  }
  if (!data.orders || data.orders.length === 0) {
    errors.push('At least one order item is required')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
