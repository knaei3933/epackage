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
  address: '兵庫県明石市上ノ丸2-11-21',
  phone: 'TEL: 050-1793-6500',
  email: 'info@package-lab.com'
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

  // Get raw postProcessingOptions for detailed display
  const specs = typeof firstItem?.specifications === 'string'
    ? JSON.parse(firstItem.specifications)
    : firstItem?.specifications || {}
  const rawPostProcessingOptions = specs.postProcessingOptions || specs.postProcessing || []

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
    rawPostProcessingOptions,
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
 * Handles both pouch types (stand_pouch, flat_pouch, gusset, gassho) and roll_film
 * For roll_film: pouch-only fields are set to null/empty
 */
function extractProductSpecifications(
  specsJson: unknown
): ProductSpecifications {
  const specs = typeof specsJson === 'string' ? JSON.parse(specsJson) : specsJson || {}

  // Determine product type: roll_film or pouch type
  // Roll film can be identified by:
  // 1. Explicit productType/bagType = 'roll_film' or 'ロールフィルム'
  // 2. Dimensions containing both "幅" and "ピッチ" (width and pitch)
  // 3. Dimensions with "mm" but no "×" (roll film format vs pouch format like "130×130")
  const productType = specs.bagType || specs.productType || 'stand_pouch'
  const dimensions = specs.dimensions || specs.size || ''

  const isRollFilm =
    productType === 'roll_film' ||
    productType === 'ロールフィルム' ||
    (dimensions.includes('幅') && dimensions.includes('ピッチ')) ||
    (dimensions.includes('mm') && !dimensions.includes('×'))

  // Debug logging for roll film detection
  if (isRollFilm) {
    console.log('[extractProductSpecifications] Detected roll_film product')
    console.log('  - productType:', productType)
    console.log('  - dimensions:', dimensions)
  }

  // Extract surface finish from postProcessing options
  // Check both field names: postProcessing and postProcessingOptions
  const postProcessing = specs.postProcessing || specs.postProcessingOptions || []
  const finishOption = postProcessing.find((opt: string) => opt === 'glossy' || opt === 'matte')
  const surfaceFinish = finishOption === 'glossy' ? '光沢仕上げ' : finishOption === 'matte' ? 'マット仕上げ' : '光沢仕上げ'

  // Debug logging for surface finish
  if (finishOption) {
    console.log('[extractProductSpecifications] Surface finish:', finishOption, '->', surfaceFinish)
  }

  // 製品カテゴリーと内容物タイプの日本語ラベルマッピング
  const PRODUCT_CATEGORY_LABELS: Record<string, string> = {
    'food': '食品',
    'health_supplement': '健康食品',
    'cosmetic': '化粧品',
    'quasi_drug': '医薬部外品',
    'drug': '医薬品',
    'other': 'その他'
  }

  const CONTENTS_TYPE_LABELS: Record<string, string> = {
    'solid': '固体',
    'powder': '粉体',
    'liquid': '液体'
  }

  // 主成分の日本語ラベルマッピング
  const MAIN_INGREDIENT_LABELS: Record<string, string> = {
    'general_neutral': '一般/中性',
    'oil_surfactant': 'オイル/界面活性剤',
    'acidic_salty': '酸性/塩分',
    'volatile_fragrance': '揮発性/香料',
    'other': 'その他'
  }

  // 流通環境の日本語ラベルマッピング
  const DISTRIBUTION_ENVIRONMENT_LABELS: Record<string, string> = {
    'general_roomTemp': '一般/常温',
    'light_oxygen_sensitive': '光/酸素敏感',
    'refrigerated': '冷凍保管',
    'high_temp_sterilized': '高温殺菌',
    'other': 'その他'
  }

  // contentsフィールドを生成: 4つのフィールド（productCategory, contentsType, mainIngredient, distributionEnvironment）から
  // 優先順位: specs.contents (既存データ) > 4つのフィールドを組み合わせ
  let contents = specs.contents || ''
  if (!contents) {
    const categoryLabel = PRODUCT_CATEGORY_LABELS[specs.productCategory || ''] || ''
    const typeLabel = CONTENTS_TYPE_LABELS[specs.contentsType || ''] || ''
    const ingredientLabel = MAIN_INGREDIENT_LABELS[specs.mainIngredient || ''] || ''
    const environmentLabel = DISTRIBUTION_ENVIRONMENT_LABELS[specs.distributionEnvironment || ''] || ''

    // 4つのフィールドすべてがある場合は「 / 」で結合
    if (categoryLabel && typeLabel && ingredientLabel && environmentLabel) {
      contents = `${categoryLabel}（${typeLabel}） / ${ingredientLabel} / ${environmentLabel}`
    } else if (categoryLabel && typeLabel) {
      // 後方互換性: productCategoryとcontentsTypeのみの場合
      contents = `${categoryLabel}（${typeLabel}）`
    } else if (categoryLabel) {
      contents = categoryLabel
    } else if (typeLabel) {
      contents = typeLabel
    }
  }

  // Base specifications that apply to all product types
  const baseSpecs: ProductSpecifications = {
    specNumber: specs.specNumber || 'L',
    pouchType: isRollFilm ? 'ロールフィルム' : (specs.pouchType || 'スタンドパウチ'),
    pouchTypeEn: isRollFilm ? 'Roll Film' : (specs.pouchTypeEn || 'Stand Pouch'),
    productType: isRollFilm ? 'roll_film' : productType,
    contents,
    size: specs.size || specs.dimensions || '',
    material: specs.material || '',
    surfaceFinish: surfaceFinish
  }

  // For roll_film: pouch-only fields should be null/empty
  // Extract roll film specific fields from specs
  if (isRollFilm) {
    console.log('[extractProductSpecifications] Returning roll_film specs with productType:', baseSpecs.productType)
    console.log('  - materialWidth:', specs.materialWidth)
    console.log('  - totalLength:', specs.totalLength)
    console.log('  - rollCount:', specs.rollCount)
    console.log('  - pitch:', specs.pitch)

    return {
      ...baseSpecs,
      // Pouch-only fields set to empty
      sealWidth: '',
      fillDirection: '',
      notchShape: '',
      notchPosition: '',
      hangingHole: false,
      hangingPosition: '',
      ziplockPosition: '',
      cornerRadius: '',
      // Roll film specific fields
      materialWidth: specs.materialWidth,
      totalLength: specs.totalLength,
      rollCount: specs.rollCount,
      pitch: specs.pitch,
      filmLayers: specs.filmLayers
    }
  }

  // For pouch types: include all pouch-specific fields
  // Extract notch shape and hanging hole info from postProcessingOptions
  // Support both field names: postProcessing (old) and postProcessingOptions (new)
  // postProcessing variable is already declared above (line 250)

  console.log('[extractProductSpecifications] specs.postProcessing:', specs.postProcessing)
  console.log('[extractProductSpecifications] specs.postProcessingOptions:', specs.postProcessingOptions)
  console.log('[extractProductSpecifications] Combined postProcessing:', postProcessing)

  // Extract values from postProcessing options
  let notchShape = ''
  let hanging = 'なし'  // PDF用: "あり" or "なし"
  let hangingHole = false  // OptionalProcessing用: boolean
  let hangingPosition = ''

  // Extract notch from postProcessing
  for (const option of postProcessing) {
    if (option === 'notch-yes') {
      notchShape = 'Vノッチ'
      break
    } else if (option === 'notch-straight') {
      notchShape = '直線ノッチ'
      break
    } else if (option === 'notch-no') {
      notchShape = 'ノッチなし'
      break
    }
  }

  // Extract hanging hole from postProcessing
  for (const option of postProcessing) {
    if (option === 'hang-hole-6mm') {
      hanging = 'あり'
      hangingHole = true
      hangingPosition = '6mm'
      console.log('[extractProductSpecifications] Found hang-hole-6mm in postProcessing')
      break
    } else if (option === 'hang-hole-8mm') {
      hanging = 'あり'
      hangingHole = true
      hangingPosition = '8mm'
      console.log('[extractProductSpecifications] Found hang-hole-8mm in postProcessing')
      break
    } else if (option === 'hang-hole-no') {
      hanging = 'なし'
      hangingHole = false
      hangingPosition = ''
      console.log('[extractProductSpecifications] Found hang-hole-no in postProcessing')
      break
    }
  }

  console.log('[extractProductSpecifications] Pouch specs - notchShape:', notchShape, 'hanging:', hanging, 'hangingPosition:', hangingPosition)

  // Extract corner radius from postProcessing
  let cornerRadius = '';
  for (const option of postProcessing) {
    if (option === 'corner-round') {
      cornerRadius = 'R5';
      break;
    } else if (option === 'corner-square') {
      cornerRadius = 'R0';
      break;
    }
  }
  console.log('[extractProductSpecifications] Extracted cornerRadius from postProcessing:', cornerRadius);

  return {
    ...baseSpecs,
    sealWidth: specs.sealWidth || '',
    fillDirection: specs.fillDirection || '上',
    notchShape,
    notchPosition: (specs.notchPosition || (notchShape ? '指定位置' : '')),
    hanging,  // PDF用: "あり" or "なし"
    hangingHole,  // OptionalProcessing用: boolean
    hangingPosition,  // PDF用: "6mm", "8mm", or empty
    ziplockPosition: specs.ziplockPosition || '指定位置',
    cornerRadius  // postProcessingOptionsから抽出した値を使用
  }
}

/**
 * Extract processing options from quotation items
 * Maps postProcessingOptions array to OptionalProcessing format
 * postProcessingOptions contains IDs like: 'zipper-yes', 'glossy', 'notch-yes', 'hang-hole-6mm', etc.
 *
 * Note: Database field can be either 'postProcessing' or 'postProcessingOptions'
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

  // Extract postProcessingOptions array (check both field names for compatibility)
  // Database may use 'postProcessingOptions' or 'postProcessing'
  const postProcessingOptions = specs.postProcessingOptions || specs.postProcessing || []

  // Debug logging
  console.log('[extractProcessingOptions] postProcessingOptions:', JSON.stringify(postProcessingOptions))

  // Map postProcessingOptions IDs to OptionalProcessing
  const result: OptionalProcessing = {
    ziplock: false,
    notch: false,
    hangingHole: false,
    cornerRound: false,
    gasVent: false,
    easyCut: false,
    embossing: false
  }

  // Check each option in postProcessingOptions array
  // Only set to true if the option is explicitly selected (e.g., 'zipper-yes', 'notch-yes')
  // Options ending with '-no' should remain false (default)
  console.log('[extractProcessingOptions] Processing all options:', postProcessingOptions)

  for (const optionId of postProcessingOptions) {
    console.log('[extractProcessingOptions] Processing option:', optionId)

    if (optionId === 'zipper-yes') {
      result.ziplock = true
      console.log('[extractProcessingOptions] -> ziplock = true')
    } else if (optionId === 'notch-yes' || optionId === 'notch-straight') {
      // Vノッチ or 直線ノッチ
      result.notch = true
      console.log('[extractProcessingOptions] -> notch = true (option:', optionId, ')')
    } else if (optionId === 'hang-hole-6mm' || optionId === 'hang-hole-8mm') {
      // hang-hole-6mm or hang-hole-8mm means hanging hole exists
      result.hangingHole = true
      console.log('[extractProcessingOptions] -> hangingHole = true (option:', optionId, ')')
    } else if (optionId === 'corner-round') {
      result.cornerRound = true
      console.log('[extractProcessingOptions] -> cornerRound = true')
    } else if (optionId === 'valve-yes') {
      // valve-yes means gas valve exists
      result.gasVent = true
      console.log('[extractProcessingOptions] -> gasVent = true')
    } else if (optionId === 'tear-notch') {
      result.easyCut = true
      console.log('[extractProcessingOptions] -> easyCut = true')
    } else if (optionId === 'die-cut-window') {
      result.embossing = true
      console.log('[extractProcessingOptions] -> embossing = true')
    }
  }

  console.log('[extractProcessingOptions] Final result:', JSON.stringify(result))
  return result
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
  // Only add mappings for fields that have values (skip empty strings)
  // This prevents pouch-only fields from showing for roll film products
  if (data.specifications.specNumber) {
    mappings.push({
      sheet,
      cell: QUOTATION_CELL_LOCATIONS.SPEC_NUMBER,
      value: `仕様番号: ${data.specifications.specNumber}`
    })
  }

  if (data.specifications.pouchType) {
    mappings.push({
      sheet,
      cell: QUOTATION_CELL_LOCATIONS.POUCH_TYPE,
      value: `袋タイプ: ${data.specifications.pouchType}`
    })
  }

  if (data.specifications.contents) {
    mappings.push({
      sheet,
      cell: QUOTATION_CELL_LOCATIONS.CONTENTS,
      value: `内容物: ${data.specifications.contents}`
    })
  }

  if (data.specifications.size) {
    mappings.push({
      sheet,
      cell: QUOTATION_CELL_LOCATIONS.SIZE,
      value: `サイズ: ${data.specifications.size}`
    })
  }

  if (data.specifications.material) {
    mappings.push({
      sheet,
      cell: QUOTATION_CELL_LOCATIONS.MATERIAL,
      value: `素材: ${data.specifications.material}`
    })
  }

  // Pouch-only fields (should be empty for roll film)
  if (data.specifications.sealWidth) {
    mappings.push({
      sheet,
      cell: QUOTATION_CELL_LOCATIONS.SEAL_WIDTH,
      value: `シール幅: ${data.specifications.sealWidth}`
    })
  }

  if (data.specifications.fillDirection) {
    mappings.push({
      sheet,
      cell: QUOTATION_CELL_LOCATIONS.FILL_DIRECTION,
      value: `封入方向: ${data.specifications.fillDirection}`
    })
  }

  if (data.specifications.notchShape) {
    mappings.push({
      sheet,
      cell: QUOTATION_CELL_LOCATIONS.NOTCH_SHAPE,
      value: `ノッチ形状: ${data.specifications.notchShape}`
    })
  }

  if (data.specifications.notchPosition) {
    mappings.push({
      sheet,
      cell: QUOTATION_CELL_LOCATIONS.NOTCH_POSITION,
      value: `ノッチ位置: ${data.specifications.notchPosition}`
    })
  }

  if (data.specifications.hangingHole !== undefined && data.specifications.hangingHole !== null) {
    mappings.push({
      sheet,
      cell: QUOTATION_CELL_LOCATIONS.HANGING_HOLE,
      value: `吊り下げ加工: ${data.specifications.hangingHole ? 'あり' : 'なし'}`
    })
  }

  if (data.specifications.hangingPosition) {
    mappings.push({
      sheet,
      cell: QUOTATION_CELL_LOCATIONS.HANGING_POSITION,
      value: `吊り下げ位置: ${data.specifications.hangingPosition}`
    })
  }

  if (data.specifications.ziplockPosition) {
    mappings.push({
      sheet,
      cell: QUOTATION_CELL_LOCATIONS.ZIPLOCK_POSITION,
      value: `チャック位置: ${data.specifications.ziplockPosition}`
    })
  }

  if (data.specifications.cornerRadius) {
    mappings.push({
      sheet,
      cell: QUOTATION_CELL_LOCATIONS.CORNER_RADIUS,
      value: `角加工: ${data.specifications.cornerRadius}`
    })
  }

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
  const optionsForDisplay = formatProcessingOptionsForDisplay(data.options, data.rawPostProcessingOptions)
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
