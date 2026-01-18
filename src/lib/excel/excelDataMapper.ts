/**
 * Excel Data Mapper
 * Transforms database quotation data to Excel cell mappings
 * Based on quote_data_mapping.md specifications
 */

import { Database } from '@/types/database'
import {
  QuotationData,
  CustomerInfo,
  SupplierInfo,
  PaymentTerms,
  ProductSpecifications,
  OrderItem,
  OrderSummary,
  OptionalProcessing,
  CellReference
} from './excelQuotationTypes'
import { mapProcessingOptionsToExcel, formatProcessingOptionsForDisplay } from './processingOptionMapper'

// ============================================================
// Cell Location Constants (from quote_data_mapping.md)
// ============================================================

/**
 * Excel cell locations for quotation template
 */
export const QUOTATION_CELL_LOCATIONS = {
  // Document title
  TITLE: 'D1',

  // Customer information (A3:A5)
  CUSTOMER_COMPANY: 'A3',
  CUSTOMER_POSTAL: 'A4',
  CUSTOMER_ADDRESS: 'A5',

  // Supplier information (G3:J12)
  SUPPLIER_BRAND: 'G3',
  SUPPLIER_NAME: 'G5',
  SUPPLIER_POSTAL: 'G6',
  SUPPLIER_ADDRESS: 'G7',
  SUPPLIER_PHONE: 'G8',

  // Payment terms (A7:B12)
  PAYMENT_METHOD: 'A7',
  SUBMISSION_DEADLINE: 'A8',
  PROOF_DEADLINE: 'A9',
  PAYMENT_DEADLINE: 'A10',
  DELIVERY_DATE: 'A11',
  BANK_INFO: 'A12',

  // Product specifications (A14:C27)
  SPEC_NUMBER: 'A14',
  POUCH_TYPE: 'A15',
  CONTENTS: 'A16',
  SIZE: 'A17',
  MATERIAL: 'A18',
  SEAL_WIDTH: 'A19',
  FILL_DIRECTION: 'A20',
  NOTCH_SHAPE: 'A21',
  NOTCH_POSITION: 'A22',
  HANGING_HOLE: 'A23',
  HANGING_POSITION: 'A24',
  ZIPLOCK_POSITION: 'A25',
  CORNER_RADIUS: 'A26',

  // Order table header (E14:J14)
  ORDER_TABLE_HEADER: 'E14:J14',

  // Order data (E15:J16)
  ORDER_DATA_START: 'E15',
  ORDER_DATA_END: 'J16',

  // Order summary (below table)
  ORDER_SUMMARY_SKU: 'E17',
  ORDER_SUMMARY_QTY: 'E18',
  ORDER_SUMMARY_SUBTOTAL: 'E19',

  // Optional processing (A32:B40)
  OPTIONS_HEADER: 'A32',
  OPTIONS_DATA_START: 'A33',
  OPTIONS_DATA_END: 'B40',

  // Watermark (E24:F26)
  WATERMARK_POSITION: 'E24:F26'
} as const

// ============================================================
// Default Values
// ============================================================

/**
 * Default supplier information (EPACKAGE Lab)
 */
export const DEFAULT_SUPPLIER: SupplierInfo = {
  brandName: 'EPACKAGE Lab',
  subBrand: 'by kanei-trade',
  description: 'オーダーメイドバッグ印刷専門',
  companyName: '金井貿易株式会社',
  postalCode: '〒673-0846',
  address: '兵庫県明石市上ノ丸2-11-21-102',
  phone: 'TEL: 080-6942-7235',
  email: 'info@epackage-lab.com'
}

/**
 * Default payment terms
 */
export const DEFAULT_PAYMENT_TERMS: PaymentTerms = {
  paymentMethod: '先払い',
  submissionDeadline: '指定なし',
  proofDeadline: '指定なし',
  paymentDeadline: '校了前',
  deliveryDate: '校了から約1か月',
  bankInfo: 'PayPay銀行 ビジネス営業部支店(005)普通 5630235'
}

// ============================================================
// Database to Excel Mapper Functions
// ============================================================

/**
 * Transform database quotation to Excel format
 * @param dbQuotation - Database quotation record
 * @param dbQuotationItems - Database quotation items
 * @param userProfile - User profile for customer info
 * @returns QuotationData for Excel generation
 */
export async function mapDatabaseQuotationToExcel(
  dbQuotation: Database['public']['Tables']['quotations']['Row'],
  dbQuotationItems: Database['public']['Tables']['quotation_items']['Row'][],
  userProfile?: Database['public']['Tables']['profiles']['Row']
): Promise<QuotationData> {
  // Extract customer information
  const customer: CustomerInfo = {
    companyName: userProfile?.company_name || dbQuotation.customer_name || 'お客様',
    companyNameEn: userProfile?.company_name_en || userProfile?.company_name || '', // Would need translation
    postalCode: userProfile?.postal_code || dbQuotation.customer_postal_code || '〒000-0000',
    address: formatJapaneseAddress(
      userProfile?.prefecture,
      userProfile?.city,
      userProfile?.street
    ) || dbQuotation.customer_address || '',
    contactPerson: formatFullName(
      userProfile?.kanji_last_name || dbQuotation.customer_name,
      userProfile?.kanji_first_name || ''
    ) || dbQuotation.customer_name || 'お客様',
    email: dbQuotation.customer_email || userProfile?.email || '',
    phone: dbQuotation.customer_phone || userProfile?.phone || undefined
  }

  // Use default supplier
  const supplier: SupplierInfo = DEFAULT_SUPPLIER

  // Use default payment terms
  const paymentTerms: PaymentTerms = DEFAULT_PAYMENT_TERMS

  // Extract product specifications from first quotation item
  const firstItem = dbQuotationItems[0]
  const specifications = extractProductSpecifications(firstItem?.specifications)

  // Map order items
  const orders: OrderItem[] = dbQuotationItems.map((item, index) => ({
    no: index + 1,
    skuCount: 1, // Each item is 1 SKU
    quantity: item.quantity,
    unitPrice: item.unit_price,
    discount: 0, // Calculate if needed
    total: item.total_price
  }))

  // Calculate order summary
  const orderSummary: OrderSummary = calculateOrderSummary(orders)

  // Extract processing options
  const options = extractProcessingOptions(dbQuotationItems)

  return {
    metadata: {
      quotationNumber: dbQuotation.quotation_number,
      issueDate: formatJapaneseDate(dbQuotation.created_at),
      validDate: dbQuotation.valid_until
        ? formatJapaneseDate(dbQuotation.valid_until)
        : undefined,
      status: (dbQuotation.status.toLowerCase() === 'expired' ? 'rejected' : dbQuotation.status.toLowerCase()) as 'draft' | 'sent' | 'approved' | 'rejected',
      version: 'v1.0'
    },
    customer,
    supplier,
    paymentTerms,
    specifications,
    orders,
    orderSummary,
    options,
    watermark: {
      text: '申101入',
      position: 'center',
      style: {
        fontSize: 48,
        color: '#CCCCCC',
        opacity: 0.3,
        rotation: 0
      }
    },
    notes: dbQuotation.notes || undefined,
    adminNotes: dbQuotation.admin_notes || undefined
  }
}

/**
 * Extract product specifications from JSON
 */
function extractProductSpecifications(
  specsJson: unknown
): ProductSpecifications {
  const specs = typeof specsJson === 'string' ? JSON.parse(specsJson) : specsJson || {}

  return {
    specNumber: specs.specNumber || 'L',
    pouchType: specs.pouchType || 'スタンドパウチ',
    pouchTypeEn: specs.pouchTypeEn || 'Stand Pouch',
    contents: specs.contents || '',
    size: specs.size || '',
    material: specs.material || '',
    sealWidth: specs.sealWidth || '',
    fillDirection: specs.fillDirection || '上',
    notchShape: specs.notchShape || '',
    notchPosition: specs.notchPosition || '指定位置',
    hangingHole: specs.hangingHole || false,
    hangingPosition: specs.hangingPosition || '指定位置',
    ziplockPosition: specs.ziplockPosition || '指定位置',
    cornerRadius: specs.cornerRadius || ''
  }
}

/**
 * Extract processing options from quotation items
 */
function extractProcessingOptions(
  items: Database['public']['Tables']['quotation_items']['Row'][]
): OptionalProcessing {
  // Get processing options from first item's specifications
  const firstItem = items[0]
  if (!firstItem?.specifications) {
    return {
      ziplock: false,
      notch: false,
      hangingHole: false,
      cornerRound: false,
      gasVent: false,
      easyCut: false,
      embossing: false
    }
  }

  const specs = typeof firstItem.specifications === 'string'
    ? JSON.parse(firstItem.specifications)
    : firstItem.specifications

  // Extract processing option IDs
  const processingOptions = specs.processingOptions || []

  return mapProcessingOptionsToExcel(processingOptions)
}

/**
 * Calculate order summary
 */
function calculateOrderSummary(orders: OrderItem[]): OrderSummary {
  const TAX_RATE = 0.10 // Japanese consumption tax

  const totalSkuCount = orders.length
  const totalQuantity = orders.reduce((sum, order) => sum + order.quantity, 0)
  const subtotal = orders.reduce((sum, order) => sum + order.total, 0)
  const taxAmount = Math.round(subtotal * TAX_RATE)
  const totalWithTax = subtotal + taxAmount

  return {
    totalSkuCount,
    totalQuantity,
    subtotal,
    taxRate: TAX_RATE,
    taxAmount,
    totalWithTax
  }
}

// ============================================================
// Cell Mapping Functions
// ============================================================

/**
 * Generate complete cell mappings for Excel template
 * @param data - QuotationData
 * @returns Array of CellReference objects
 */
export function generateCellMappings(
  data: QuotationData
): CellReference[] {
  const mappings: CellReference[] = []
  const sheet = '見積書'

  // Document title
  mappings.push({
    sheet,
    cell: QUOTATION_CELL_LOCATIONS.TITLE,
    value: '見積書',
    format: { bold: true, fontSize: 24, alignment: 'center' }
  })

  // Customer information
  mappings.push({
    sheet,
    cell: QUOTATION_CELL_LOCATIONS.CUSTOMER_COMPANY,
    value: data.customer.companyName,
    format: { bold: true, fontSize: 14 }
  })
  mappings.push({
    sheet,
    cell: QUOTATION_CELL_LOCATIONS.CUSTOMER_POSTAL,
    value: data.customer.postalCode
  })
  mappings.push({
    sheet,
    cell: QUOTATION_CELL_LOCATIONS.CUSTOMER_ADDRESS,
    value: data.customer.address
  })

  // Supplier information
  mappings.push({
    sheet,
    cell: QUOTATION_CELL_LOCATIONS.SUPPLIER_BRAND,
    value: data.supplier.brandName,
    format: { bold: true, fontSize: 16 }
  })
  mappings.push({
    sheet,
    cell: QUOTATION_CELL_LOCATIONS.SUPPLIER_NAME,
    value: data.supplier.companyName
  })
  mappings.push({
    sheet,
    cell: QUOTATION_CELL_LOCATIONS.SUPPLIER_POSTAL,
    value: data.supplier.postalCode
  })
  mappings.push({
    sheet,
    cell: QUOTATION_CELL_LOCATIONS.SUPPLIER_ADDRESS,
    value: data.supplier.address
  })
  mappings.push({
    sheet,
    cell: QUOTATION_CELL_LOCATIONS.SUPPLIER_PHONE,
    value: data.supplier.phone
  })

  // Payment terms
  mappings.push({
    sheet,
    cell: QUOTATION_CELL_LOCATIONS.PAYMENT_METHOD,
    value: `支払い条件: ${data.paymentTerms.paymentMethod}`
  })
  mappings.push({
    sheet,
    cell: QUOTATION_CELL_LOCATIONS.SUBMISSION_DEADLINE,
    value: `入稿期限: ${data.paymentTerms.submissionDeadline}`
  })
  mappings.push({
    sheet,
    cell: QUOTATION_CELL_LOCATIONS.PROOF_DEADLINE,
    value: `校了締切: ${data.paymentTerms.proofDeadline}`
  })
  mappings.push({
    sheet,
    cell: QUOTATION_CELL_LOCATIONS.PAYMENT_DEADLINE,
    value: `入金締切: ${data.paymentTerms.paymentDeadline}`
  })
  mappings.push({
    sheet,
    cell: QUOTATION_CELL_LOCATIONS.DELIVERY_DATE,
    value: `納期: ${data.paymentTerms.deliveryDate}`
  })
  mappings.push({
    sheet,
    cell: QUOTATION_CELL_LOCATIONS.BANK_INFO,
    value: `振込先: ${data.paymentTerms.bankInfo}`
  })

  // Product specifications
  mappings.push({
    sheet,
    cell: QUOTATION_CELL_LOCATIONS.SPEC_NUMBER,
    value: `仕様番号: ${data.specifications.specNumber}`
  })
  mappings.push({
    sheet,
    cell: QUOTATION_CELL_LOCATIONS.POUCH_TYPE,
    value: `袋タイプ: ${data.specifications.pouchType}`
  })
  mappings.push({
    sheet,
    cell: QUOTATION_CELL_LOCATIONS.CONTENTS,
    value: `内容物: ${data.specifications.contents}`
  })
  mappings.push({
    sheet,
    cell: QUOTATION_CELL_LOCATIONS.SIZE,
    value: `サイズ: ${data.specifications.size}`
  })
  mappings.push({
    sheet,
    cell: QUOTATION_CELL_LOCATIONS.MATERIAL,
    value: `素材: ${data.specifications.material}`
  })
  mappings.push({
    sheet,
    cell: QUOTATION_CELL_LOCATIONS.SEAL_WIDTH,
    value: `シール幅: ${data.specifications.sealWidth}`
  })
  mappings.push({
    sheet,
    cell: QUOTATION_CELL_LOCATIONS.FILL_DIRECTION,
    value: `封入方向: ${data.specifications.fillDirection}`
  })
  mappings.push({
    sheet,
    cell: QUOTATION_CELL_LOCATIONS.NOTCH_SHAPE,
    value: `ノッチ形状: ${data.specifications.notchShape}`
  })
  mappings.push({
    sheet,
    cell: QUOTATION_CELL_LOCATIONS.NOTCH_POSITION,
    value: `ノッチ位置: ${data.specifications.notchPosition}`
  })
  mappings.push({
    sheet,
    cell: QUOTATION_CELL_LOCATIONS.HANGING_HOLE,
    value: `吊り下げ加工: ${data.specifications.hangingHole ? 'あり' : 'なし'}`
  })
  mappings.push({
    sheet,
    cell: QUOTATION_CELL_LOCATIONS.HANGING_POSITION,
    value: `吊り下げ位置: ${data.specifications.hangingPosition}`
  })
  mappings.push({
    sheet,
    cell: QUOTATION_CELL_LOCATIONS.ZIPLOCK_POSITION,
    value: `チャック位置: ${data.specifications.ziplockPosition}`
  })
  mappings.push({
    sheet,
    cell: QUOTATION_CELL_LOCATIONS.CORNER_RADIUS,
    value: `角加工: ${data.specifications.cornerRadius}`
  })

  // Order table data
  const startRow = parseInt(QUOTATION_CELL_LOCATIONS.ORDER_DATA_START.match(/\d+/)?.[0] || '15')
  data.orders.forEach((order, index) => {
    const row = startRow + index
    mappings.push({
      sheet,
      cell: `E${row}`,
      value: order.no
    })
    mappings.push({
      sheet,
      cell: `F${row}`,
      value: order.skuCount
    })
    mappings.push({
      sheet,
      cell: `G${row}`,
      value: order.quantity,
      format: { numberFormat: '#,##0' }
    })
    mappings.push({
      sheet,
      cell: `H${row}`,
      value: order.unitPrice,
      format: { numberFormat: '¥#,##0.0' }
    })
    mappings.push({
      sheet,
      cell: `I${row}`,
      value: order.discount,
      format: { numberFormat: '¥#,##0' }
    })
    mappings.push({
      sheet,
      cell: `J${row}`,
      value: order.total,
      format: { numberFormat: '¥#,##0' }
    })
  })

  // Order summary
  const summaryRow = startRow + data.orders.length + 1
  mappings.push({
    sheet,
    cell: `E${summaryRow}`,
    value: `品目数: ${data.orderSummary.totalSkuCount} SKU`
  })
  mappings.push({
    sheet,
    cell: `F${summaryRow}`,
    value: `総数量: ${data.orderSummary.totalQuantity.toLocaleString()} 個`
  })
  mappings.push({
    sheet,
    cell: `J${summaryRow}`,
    value: data.orderSummary.subtotal,
    format: { bold: true, numberFormat: '¥#,##0' }
  })

  // Processing options
  const optionsForDisplay = formatProcessingOptionsForDisplay(data.options)
  const optionStartRow = parseInt(QUOTATION_CELL_LOCATIONS.OPTIONS_DATA_START.match(/\d+/)?.[0] || '33')
  optionsForDisplay.forEach((option, index) => {
    const row = optionStartRow + index
    mappings.push({
      sheet,
      cell: `A${row}`,
      value: option.name
    })
    mappings.push({
      sheet,
      cell: `B${row}`,
      value: option.value,
      format: { bold: true, alignment: 'center' }
    })
  })

  return mappings
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * Format Japanese address from components
 */
function formatJapaneseAddress(
  prefecture?: string | null,
  city?: string | null,
  street?: string | null
): string {
  const parts = [prefecture, city, street].filter(Boolean)
  return parts.join('')
}

/**
 * Format full name from kanji components
 */
function formatFullName(
  lastName?: string | null,
  firstName?: string | null
): string {
  const parts = [lastName, firstName].filter(Boolean)
  return parts.join('')
}

/**
 * Format date to Japanese format (YYYY年MM月DD日)
 */
function formatJapaneseDate(dateString: string): string {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${year}年${month}月${day}日`
}

/**
 * Format currency to Japanese yen
 */
export function formatJapaneseYen(amount: number): string {
  return `¥${amount.toLocaleString('ja-JP')}`
}

// ============================================================
// Task 3 Required Functions
// ============================================================

/**
 * Japanese era definitions for date formatting
 */
export const JAPANESE_ERAS = [
  { name: '明治', start: new Date(1868, 8, 8), end: new Date(1912, 6, 29) },
  { name: '大正', start: new Date(1912, 7, 29), end: new Date(1926, 11, 24) },
  { name: '昭和', start: new Date(1926, 11, 24), end: new Date(1989, 0, 7) },
  { name: '平成', start: new Date(1989, 0, 8), end: new Date(2019, 3, 30) },
  { name: '令和', start: new Date(2019, 4, 1), end: new Date(2030, 11, 31) },
] as const

/**
 * Format date to Japanese era format (令和6年4月1日)
 * @param date - Date object or date string
 * @returns Japanese era formatted date string
 */
export function formatJapaneseDateWithEra(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  if (isNaN(dateObj.getTime())) return ''

  const era = JAPANESE_ERAS.find(e => dateObj >= e.start && dateObj <= e.end)
  if (!era) {
    // Fallback to Western calendar
    return `${dateObj.getFullYear()}年${dateObj.getMonth() + 1}月${dateObj.getDate()}日`
  }

  const year = dateObj.getFullYear() - era.start.getFullYear() + 1
  const month = dateObj.getMonth() + 1
  const day = dateObj.getDate()

  return `${era.name}${year}年${month}月${day}日`
}

/**
 * Format currency to Japanese yen (alias for formatJapaneseYen)
 * @param amount - Amount to format
 * @returns Formatted currency string (¥1,000,000)
 */
export function formatJapaneseCurrency(amount: number): string {
  return formatJapaneseYen(amount)
}

/**
 * Convert boolean to Japanese checkmark symbol
 * @param value - Boolean value
 * @returns "○" for true, "-" for false/null/undefined
 */
export function booleanToSymbol(value: boolean | null | undefined): '○' | '-' {
  return value ? '○' : '-'
}

/**
 * Format postal code to Japanese format (XXX-XXXX)
 * @param postalCode - Postal code with or without hyphen
 * @returns Formatted postal code
 */
export function formatPostalCode(postalCode: string): string {
  if (!postalCode) return ''
  const cleaned = postalCode.replace(/[-]/g, '')
  if (cleaned.length === 7) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`
  }
  return postalCode
}

/**
 * Safe string conversion with default value
 * @param value - Value to convert
 * @param defaultValue - Default value if null/undefined/empty
 * @returns String value
 */
export function safeString(
  value: string | null | undefined,
  defaultValue: string = ''
): string {
  if (value === null || value === undefined || value === '') {
    return defaultValue
  }
  return String(value)
}

/**
 * Safe number conversion with default value
 * @param value - Value to convert
 * @param defaultValue - Default value if conversion fails
 * @returns Number value
 */
export function safeNumber(
  value: number | string | null | undefined,
  defaultValue: number = 0
): number {
  if (value === null || value === undefined || value === '') {
    return defaultValue
  }
  const num = typeof value === 'number' ? value : parseFloat(String(value))
  return isNaN(num) ? defaultValue : num
}
