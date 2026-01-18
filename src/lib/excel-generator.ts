/**
 * Excel Quotation Generator
 *
 * Excel 見積書作成ライブラリ
 * Uses ExcelJS with template-based approach
 */

import ExcelJS from 'exceljs';

// ============================================================
// Type Definitions
// ============================================================

export interface QuoteItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
}

export interface QuoteData {
  quoteNumber: string;
  issueDate: string;
  expiryDate: string;
  quoteCreator?: string;

  // Customer information
  customerName: string;
  customerNameKana?: string;
  companyName?: string;
  postalCode?: string;
  address?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;

  // Quote items
  items: QuoteItem[];

  // Product specifications
  specifications?: {
    bagType?: string;
    contents?: string;
    size?: string;
    material?: string;
    sealWidth?: string;
    sealDirection?: string;
    notchShape?: string;
    notchPosition?: string;
    hanging?: string;
    hangingPosition?: string;
    zipperPosition?: string;
    cornerR?: string;
  };

  // Optional processing
  optionalProcessing?: {
    zipper?: boolean;
    notch?: boolean;
    hangingHole?: boolean;
    cornerProcessing?: boolean;
    gasValve?: boolean;
    easyCut?: boolean;
    dieCut?: boolean;
  };
}

export interface ExcelGenerationOptions {
  filename?: string;
}

export interface ExcelGenerationResult {
  success: boolean;
  buffer?: Buffer;
  filename?: string;
  error?: string;
}

// ============================================================
// Constants
// ============================================================

const TEMPLATE_PATH = '/templates/quotation-epackage-lab.xlsx';

const SUPABASE_TEMPLATE_PATH = 'templates/quotation-epackage-lab.xlsx';

// Default supplier information
const DEFAULT_SUPPLIER_INFO = {
  brandName: 'EPACKAGE Lab',
  subBrand: 'by kanei-trade',
  description: 'オーダーメイドバッグ印刷専門',
  companyName: '金井貿易株式会社',
  postalCode: '〒673-0846',
  address: '兵庫県明石市上ノ丸2-11-21-102',
  phone: 'TEL: 080-6942-7235',
};

// Cell mappings based on quote_data_mapping.md
const CELL_MAPPINGS = {
  // Client information
  customerName: 'A3',
  customerNameEn: 'A4',
  postalCode: 'B4',
  address: 'A4',

  // Quote number and date (right side)
  quoteNumber: 'G2', // Approximate - needs adjustment

  // Payment terms
  paymentTerms: 'A7',
  submissionDeadline: 'A8',
  proofreadingDeadline: 'A9',
  paymentDeadline: 'A10',
  deliveryDate: 'A11',
  bankInfo: 'A12',

  // Product specifications (A14:C27)
  specNumber: 'A14',
  bagType: 'A15',
  contents: 'A16',
  size: 'A17',
  material: 'A18',
  sealWidth: 'A19',
  sealDirection: 'A20',
  notchShape: 'A21',
  notchPosition: 'A22',
  hanging: 'A23',
  hangingPosition: 'A24',
  zipperPosition: 'A25',
  cornerR: 'A26',

  // Order details table (E14:J16)
  orderTableStart: 'E15',
  orderTableEnd: 'J16',

  // Optional processing (A32:B40)
  optionalProcessingStart: 'A33',
  optionalProcessingEnd: 'B40',
};

// ============================================================
// Helper Functions
// ============================================================

/**
 * Get Excel cell value from column and row
 */
function getCellAddress(column: string, row: number): string {
  return `${column}${row}`;
}

/**
 * Format number as Japanese currency
 */
function formatCurrency(amount: number): string {
  return `¥${amount.toLocaleString('ja-JP')}`;
}

/**
 * Format date as Japanese date
 */
function formatDateJP(dateStr: string): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Convert to Japanese era (optional - using Reiwa for 2019+)
  if (year >= 2019) {
    const reiwaYear = year - 2018;
    return `令和${reiwaYear}年${month}月${day}日`;
  }
  return `${year}年${month}月${day}日`;
}

// ============================================================
// Main Generator Function
// ============================================================

/**
 * Generate Excel quotation from template
 */
export async function generateQuoteExcel(
  data: QuoteData,
  options: ExcelGenerationOptions = {}
): Promise<ExcelGenerationResult> {
  try {
    // Create workbook
    const workbook = new ExcelJS.Workbook();

    // Create worksheet from scratch to avoid template formula issues
    // Templates with shared formulas can cause "Shared Formula master must exist" errors
    await createQuoteWorksheet(workbook, data);
    console.log('[ExcelGenerator] Created worksheet from scratch (template bypassed to avoid formula errors)');

    const worksheet = workbook.getWorksheet(1);

    if (!worksheet) {
      throw new Error('Worksheet not found');
    }

    // Fill in data
    await fillQuoteData(worksheet, data);

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    return {
      success: true,
      buffer: buffer as unknown as Buffer,
      filename: options.filename || `${data.quoteNumber}.xlsx`,
    };
  } catch (error) {
    console.error('[ExcelGenerator] Generation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Create quote worksheet from scratch (fallback)
 */
async function createQuoteWorksheet(workbook: ExcelJS.Workbook, data: QuoteData): Promise<void> {
  const worksheet = workbook.addWorksheet('見積書');

  // Set column widths
  worksheet.columns = [
    { width: 20 },
    { width: 20 },
    { width: 15 },
    { width: 15 },
    { width: 15 },
    { width: 15 },
    { width: 15 },
    { width: 15 },
    { width: 15 },
    { width: 15 },
  ];

  // Title
  worksheet.mergeCells('D1:F1');
  const titleCell = worksheet.getCell('D1');
  titleCell.value = '見積書';
  titleCell.font = { size: 24, bold: true };
  titleCell.alignment = { horizontal: 'center' };

  // Client information
  worksheet.getCell('A3').value = '御中';
  worksheet.getCell('A4').value = data.customerName;

  // Supplier info
  worksheet.getCell('G3').value = DEFAULT_SUPPLIER_INFO.brandName;
  worksheet.getCell('G4').value = DEFAULT_SUPPLIER_INFO.subBrand;
  worksheet.getCell('G5').value = DEFAULT_SUPPLIER_INFO.description;
  worksheet.getCell('G6').value = DEFAULT_SUPPLIER_INFO.companyName;
  worksheet.getCell('G7').value = DEFAULT_SUPPLIER_INFO.postalCode;
  worksheet.getCell('G8').value = DEFAULT_SUPPLIER_INFO.address;
  worksheet.getCell('G9').value = DEFAULT_SUPPLIER_INFO.phone;

  // Payment terms
  const paymentTerms = [
    ['支払い条件', '先払い'],
    ['入稿期限', '指定なし'],
    ['校了締切', '指定なし'],
    ['入金締切', '校了前'],
    ['納期', '校了から約1か月'],
    ['振込先', 'PayPay銀行 ビジネス営業部支店(005)普通 5630235'],
  ];

  paymentTerms.forEach(([label, value], index) => {
    worksheet.getCell(`A${7 + index}`).value = `${label}: ${value}`;
  });

  return;
}

/**
 * Fill quote data into worksheet
 */
async function fillQuoteData(
  worksheet: ExcelJS.Worksheet,
  data: QuoteData
): Promise<void> {
  // Quote number
  worksheet.getCell('J2').value = `No: ${data.quoteNumber}`;

  // Issue date
  worksheet.getCell('B2').value = formatDateJP(data.issueDate);

  // Customer name
  if (data.customerName) {
    worksheet.getCell('A4').value = data.customerName;
  }

  // Product specifications
  if (data.specifications) {
    const specs = data.specifications;
    worksheet.getCell('A15').value = specs.bagType || 'スタンドパウチ';
    worksheet.getCell('A16').value = specs.contents || '粉体';
    worksheet.getCell('A17').value = specs.size || '';
    worksheet.getCell('A18').value = specs.material || '';
    worksheet.getCell('A19').value = specs.sealWidth || '5mm';
    worksheet.getCell('A20').value = specs.sealDirection || '上';
    worksheet.getCell('A21').value = specs.notchShape || 'V';
    worksheet.getCell('A22').value = specs.notchPosition || '指定位置';
    worksheet.getCell('A23').value = specs.hanging || 'なし';
    worksheet.getCell('A24').value = specs.hangingPosition || '指定位置';
    worksheet.getCell('A25').value = specs.zipperPosition || '指定位置';
    worksheet.getCell('A26').value = specs.cornerR || 'R5';
  }

  // Order details table
  let currentRow = 15;
  let totalAmount = 0;
  let totalQuantity = 0;

  // Table header
  worksheet.getCell('E14').value = '番号';
  worksheet.getCell('F14').value = '商品数(SKU)';
  worksheet.getCell('G14').value = '合計数量';
  worksheet.getCell('H14').value = '単価';
  worksheet.getCell('I14').value = '割引';
  worksheet.getCell('J14').value = '合計(税別)';

  // Style header row
  const headerRow = 14;
  for (let col = 5; col <= 10; col++) {
    const cell = worksheet.getCell(headerRow, col);
    cell.font = { bold: true };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3E4EF' },
    };
  }

  // Data rows
  data.items.forEach((item, index) => {
    currentRow = 15 + index;

    worksheet.getCell(`E${currentRow}`).value = index + 1;
    worksheet.getCell(`F${currentRow}`).value = 1;
    worksheet.getCell(`G${currentRow}`).value = item.quantity;
    worksheet.getCell(`H${currentRow}`).value = item.unitPrice;
    worksheet.getCell(`I${currentRow}`).value = 0;
    worksheet.getCell(`J${currentRow}`).value = item.amount;
    worksheet.getCell(`J${currentRow}`).numFmt = '"¥"#,##0';

    totalQuantity += item.quantity;
    totalAmount += item.amount;
  });

  // Optional processing
  if (data.optionalProcessing) {
    const processing = data.optionalProcessing;
    const processingRow = 33;

    worksheet.getCell('A32').value = '加工内容';
    worksheet.getCell('B32').value = '有無';

    const processingItems: [keyof typeof processing, string][] = [
      ['zipper', 'チェック (チャック)'],
      ['notch', 'ノッチ'],
      ['hangingHole', '吊り下げ穴'],
      ['cornerProcessing', '角加工'],
      ['gasValve', 'ガス抜きバルブ'],
      ['easyCut', 'Easy Cut'],
      ['dieCut', '型抜き'],
    ];

    processingItems.forEach(([key, label], index) => {
      const row = processingRow + index;
      worksheet.getCell(`A${row}`).value = label;
      worksheet.getCell(`B${row}`).value = processing[key] ? '○' : '-';
    });
  }

  // Total summary (if template allows, otherwise add at end)
  const summaryRow = currentRow + 2;
  worksheet.getCell(`E${summaryRow}`).value = '合計';
  worksheet.getCell(`G${summaryRow}`).value = totalQuantity;
  worksheet.getCell(`J${summaryRow}`).value = totalAmount;
  worksheet.getCell(`J${summaryRow}`).numFmt = '"¥"#,##0';

  // Style total row
  for (let col = 5; col <= 10; col++) {
    const cell = worksheet.getCell(summaryRow, col);
    cell.font = { bold: true };
  }
}
