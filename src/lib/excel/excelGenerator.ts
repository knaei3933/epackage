/**
 * Excel Quotation Generator
 * Generates Excel quotation files using ExcelJS
 * Based on quote_data_mapping.md specifications
 */

import ExcelJS from 'exceljs'
import { QuotationData, ExcelExportOptions, ExcelGenerationResult } from './excelQuotationTypes'
import { generateCellMappings, QUOTATION_CELL_LOCATIONS } from './excelDataMapper'

// ============================================================
// Default Export Options
// ============================================================

const DEFAULT_EXPORT_OPTIONS: ExcelExportOptions = {
  format: 'xlsx',
  includeFormulas: true,
  includeWatermark: true
}

// ============================================================
// Main Generator Function
// ============================================================

/**
 * Generate Excel quotation file
 * @param data - QuotationData object
 * @param options - Export options
 * @returns Generation result with file path
 */
export async function generateExcelQuotation(
  data: QuotationData,
  options: Partial<ExcelExportOptions> = {}
): Promise<ExcelGenerationResult> {
  const opts = { ...DEFAULT_EXPORT_OPTIONS, ...options }

  try {
    // Create workbook
    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'EPACKAGE Lab System'
    workbook.created = new Date()

    // Add worksheet
    const worksheet = workbook.addWorksheet('見積書')

    // Set column widths
    setColumnWidths(worksheet)

    // Apply document title
    await setDocumentTitle(worksheet, data)

    // Fill customer information
    await setCustomerInformation(worksheet, data)

    // Fill supplier information
    await setSupplierInformation(worksheet, data)

    // Fill payment terms
    await setPaymentTerms(worksheet, data)

    // Fill product specifications
    await setProductSpecifications(worksheet, data)

    // Create order table
    await createOrderTable(worksheet, data)

    // Fill processing options
    await setProcessingOptions(worksheet, data)

    // Add watermark if requested
    if (opts.includeWatermark && data.watermark) {
      await addWatermark(worksheet, data.watermark)
    }

    // Apply styling
    await applyWorksheetStyling(worksheet)

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer()

    // Generate filename
    const fileName = generateFileName(data.metadata.quotationNumber, opts.format)
    const filePath = opts.outputPath
      ? `${opts.outputPath}/${fileName}`
      : `/tmp/${fileName}`

    // Save file if outputPath provided
    if (opts.outputPath) {
      await workbook.xlsx.writeFile(filePath)
    }

    return {
      success: true,
      filePath,
      fileName,
      metadata: {
        generatedAt: new Date().toISOString(),
        version: '1.0',
        itemCount: data.orders.length,
        totalAmount: data.orderSummary.totalWithTax
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      metadata: {
        generatedAt: new Date().toISOString(),
        version: '1.0',
        itemCount: 0,
        totalAmount: 0
      }
    }
  }
}

// ============================================================
// Worksheet Setup Functions
// ============================================================

/**
 * Set column widths for quotation
 */
function setColumnWidths(worksheet: ExcelJS.Worksheet): void {
  worksheet.columns = [
    { key: 'A', width: 25 }, // Wide for labels
    { key: 'B', width: 15 }, // Medium for values
    { key: 'C', width: 15 },
    { key: 'D', width: 20 },
    { key: 'E', width: 8 },  // Order number
    { key: 'F', width: 12 }, // SKU count
    { key: 'G', width: 15 }, // Quantity
    { key: 'H', width: 15 }, // Unit price
    { key: 'I', width: 12 }, // Discount
    { key: 'J', width: 18 }  // Total
  ]
}

/**
 * Set document title
 */
async function setDocumentTitle(
  worksheet: ExcelJS.Worksheet,
  data: QuotationData
): Promise<void> {
  worksheet.mergeCells('D1:F1')
  const titleCell = worksheet.getCell('D1')
  titleCell.value = '見積書'
  titleCell.font = { bold: true, size: 24, color: { argb: 'FF008080' } }
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
}

/**
 * Set customer information (A3:A5)
 */
async function setCustomerInformation(
  worksheet: ExcelJS.Worksheet,
  data: QuotationData
): Promise<void> {
  // Company name (A3)
  const companyCell = worksheet.getCell('A3')
  companyCell.value = data.customer.companyName
  companyCell.font = { bold: true, size: 14 }

  // English company name if available
  if (data.customer.companyNameEn) {
    const enCell = worksheet.getCell('A3')
    enCell.value = `${data.customer.companyName}\n${data.customer.companyNameEn}`
  }

  // Postal code (A4)
  worksheet.getCell('A4').value = data.customer.postalCode

  // Address (A5)
  worksheet.getCell('A5').value = data.customer.address
  worksheet.getCell('A5').alignment = { wrapText: true }
}

/**
 * Set supplier information (G3:J8)
 */
async function setSupplierInformation(
  worksheet: ExcelJS.Worksheet,
  data: QuotationData
): Promise<void> {
  const supplier = data.supplier

  // Brand name (G3)
  const brandCell = worksheet.getCell('G3')
  brandCell.value = supplier.brandName
  brandCell.font = { bold: true, size: 16, color: { argb: 'FF008080' } }

  // Sub brand if available (G4)
  if (supplier.subBrand) {
    worksheet.getCell('G4').value = supplier.subBrand
    worksheet.getCell('G4').font = { italic: true, size: 10 }
  }

  // Description if available (G5)
  if (supplier.description) {
    worksheet.getCell('G5').value = supplier.description
  }

  // Company name (G6)
  worksheet.getCell('G6').value = supplier.companyName
  worksheet.getCell('G6').font = { bold: true }

  // Postal code (G7)
  worksheet.getCell('G7').value = supplier.postalCode

  // Address (G8)
  worksheet.getCell('G8').value = supplier.address
  worksheet.getCell('G8').alignment = { wrapText: true }

  // Phone (G9)
  worksheet.getCell('G9').value = supplier.phone
}

/**
 * Set payment terms (A7:B12)
 */
async function setPaymentTerms(
  worksheet: ExcelJS.Worksheet,
  data: QuotationData
): Promise<void> {
  const terms = data.paymentTerms

  worksheet.getCell('A7').value = `支払い条件: ${terms.paymentMethod}`
  worksheet.getCell('A8').value = `入稿期限: ${terms.submissionDeadline}`
  worksheet.getCell('A9').value = `校了締切: ${terms.proofDeadline}`
  worksheet.getCell('A10').value = `入金締切: ${terms.paymentDeadline}`
  worksheet.getCell('A11').value = `納期: ${terms.deliveryDate}`
  worksheet.getCell('A12').value = `振込先: ${terms.bankInfo}`

  // Style payment terms section
  for (let row = 7; row <= 12; row++) {
    const cell = worksheet.getCell(`A${row}`)
    cell.font = { size: 11 }
    cell.alignment = { vertical: 'top' }
  }
}

/**
 * Set product specifications (A14:C27)
 */
async function setProductSpecifications(
  worksheet: ExcelJS.Worksheet,
  data: QuotationData
): Promise<void> {
  const specs = data.specifications

  const specRows = [
    { label: '仕様番号', value: specs.specNumber },
    { label: '袋タイプ', value: `${specs.pouchType} (${specs.pouchTypeEn || ''})` },
    { label: '内容物', value: specs.contents },
    { label: 'サイズ', value: specs.size },
    { label: '素材', value: specs.material },
    { label: 'シール幅', value: specs.sealWidth },
    { label: '封入方向', value: specs.fillDirection },
    { label: 'ノッチ形状', value: specs.notchShape },
    { label: 'ノッチ位置', value: specs.notchPosition },
    { label: '吊り下げ加工', value: specs.hangingHole ? 'あり' : 'なし' },
    { label: '吊り下げ位置', value: specs.hangingPosition },
    { label: 'チャック位置', value: specs.ziplockPosition },
    { label: '角加工', value: specs.cornerRadius }
  ]

  specRows.forEach((spec, index) => {
    const row = 14 + index
    const labelCell = worksheet.getCell(`A${row}`)
    labelCell.value = spec.label
    labelCell.font = { bold: true }

    const valueCell = worksheet.getCell(`B${row}`)
    valueCell.value = spec.value
    valueCell.alignment = { wrapText: true, vertical: 'top' }
  })
}

/**
 * Create order table (E14:J16+)
 */
async function createOrderTable(
  worksheet: ExcelJS.Worksheet,
  data: QuotationData
): Promise<void> {
  // Table header
  const headers = ['番号', '商品数(SKU)', '合計数量', '単価', '割引', '合計(税別)']
  headers.forEach((header, index) => {
    const cell = worksheet.getCell(String.fromCharCode(69 + index) + '14') // E=69
    cell.value = header
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF008080' }
    }
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    }
  })

  // Order data
  const startRow = 15
  data.orders.forEach((order, index) => {
    const row = startRow + index

    worksheet.getCell(`E${row}`).value = order.no
    worksheet.getCell(`E${row}`).alignment = { horizontal: 'center' }

    worksheet.getCell(`F${row}`).value = order.skuCount
    worksheet.getCell(`F${row}`).alignment = { horizontal: 'center' }

    worksheet.getCell(`G${row}`).value = order.quantity
    worksheet.getCell(`G${row}`).numFmt = '#,##0'
    worksheet.getCell(`G${row}`).alignment = { horizontal: 'right' }

    worksheet.getCell(`H${row}`).value = order.unitPrice
    worksheet.getCell(`H${row}`).numFmt = '¥#,##0.0'
    worksheet.getCell(`H${row}`).alignment = { horizontal: 'right' }

    worksheet.getCell(`I${row}`).value = order.discount
    worksheet.getCell(`I${row}`).numFmt = '¥#,##0'
    worksheet.getCell(`I${row}`).alignment = { horizontal: 'right' }

    worksheet.getCell(`J${row}`).value = order.total
    worksheet.getCell(`J${row}`).numFmt = '¥#,##0'
    worksheet.getCell(`J${row}`).alignment = { horizontal: 'right' }
    worksheet.getCell(`J${row}`).font = { bold: true }

    // Add borders
    for (let col = 69; col <= 74; col++) { // E to J
      const cell = worksheet.getCell(`${String.fromCharCode(col)}${row}`)
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    }
  })

  // Order summary
  const summaryRow = startRow + data.orders.length + 1
  const summary = data.orderSummary

  worksheet.mergeCells(`E${summaryRow}:F${summaryRow}`)
  worksheet.getCell(`E${summaryRow}`).value = `品目数: ${summary.totalSkuCount} SKU`
  worksheet.getCell(`E${summaryRow}`).font = { bold: true }

  worksheet.mergeCells(`E${summaryRow + 1}:F${summaryRow + 1}`)
  worksheet.getCell(`E${summaryRow + 1}`).value = `総数量: ${summary.totalQuantity.toLocaleString()} 個`

  // Subtotal
  worksheet.getCell(`J${summaryRow + 1}`).value = summary.subtotal
  worksheet.getCell(`J${summaryRow + 1}`).numFmt = '¥#,##0'
  worksheet.getCell(`J${summaryRow + 1}`).font = { bold: true, size: 12 }
  worksheet.getCell(`J${summaryRow + 1}`).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE8F5F3' }
  }
}

/**
 * Set processing options (A32:B40)
 */
async function setProcessingOptions(
  worksheet: ExcelJS.Worksheet,
  data: QuotationData
): Promise<void> {
  const options = data.options

  // Header
  worksheet.mergeCells('A32:B32')
  const headerCell = worksheet.getCell('A32')
  headerCell.value = '加工内容及有無'
  headerCell.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } }
  headerCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF008080' }
  }
  headerCell.alignment = { horizontal: 'center', vertical: 'middle' }

  // Options data
  const optionList = [
    { name: 'チャック', enabled: options.ziplock },
    { name: 'ノッチ', enabled: options.notch },
    { name: '吊り下げ穴', enabled: options.hangingHole },
    { name: '角加工', enabled: options.cornerRound },
    { name: 'ガス抜きバルブ', enabled: options.gasVent },
    { name: 'Easy Cut', enabled: options.easyCut },
    { name: '型抜き', enabled: options.embossing }
  ]

  optionList.forEach((option, index) => {
    const row = 33 + index

    // Option name
    const nameCell = worksheet.getCell(`A${row}`)
    nameCell.value = option.name

    // Option value (checkbox style)
    const valueCell = worksheet.getCell(`B${row}`)
    valueCell.value = option.enabled ? '○' : '-'
    valueCell.font = { bold: true, size: 14 }
    valueCell.alignment = { horizontal: 'center' }

    // Add borders
    nameCell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    }
    valueCell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    }
  })
}

/**
 * Add watermark (E24:F26)
 */
async function addWatermark(
  worksheet: ExcelJS.Worksheet,
  watermark: { text: string; style: any }
): Promise<void> {
  // Merge watermark cells
  worksheet.mergeCells('E24:F26')

  const watermarkCell = worksheet.getCell('E24')
  watermarkCell.value = watermark.text
  watermarkCell.font = {
    bold: true,
    size: watermark.style.fontSize || 48,
    color: { argb: watermark.style.color || 'FFCCCCCC' }
  }
  watermarkCell.alignment = {
    horizontal: 'center',
    vertical: 'middle'
  }

  // Note: ExcelJS doesn't support text rotation directly
  // For rotated text, would need to use different approach or library
}

/**
 * Apply overall worksheet styling
 */
async function applyWorksheetStyling(
  worksheet: ExcelJS.Worksheet
): Promise<void> {
  // Set page properties
  worksheet.properties.defaultColWidth = 15
  worksheet.properties.defaultRowHeight = 20

  // Add gridlines toggle (optional)
  worksheet.views = [
    { showGridLines: false }
  ]
}

// ============================================================
// Utility Functions
// ============================================================

/**
 * Generate filename for quotation
 */
function generateFileName(quotationNumber: string, format: string): string {
  const date = new Date().toISOString().split('T')[0]
  return `${quotationNumber}_${date}.${format}`
}

/**
 * Convert Excel buffer to base64 for download
 */
export function excelBufferToBase64(buffer: Buffer): string {
  return buffer.toString('base64')
}

/**
 * Generate data URL for Excel file
 */
export function generateExcelDataUrl(buffer: Buffer, mimeType: string = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'): string {
  const base64 = excelBufferToBase64(buffer)
  return `data:${mimeType};base64,${base64}`
}
