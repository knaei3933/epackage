/**
 * Excel Template Loader
 *
 * Excelテンプレートローダー
 * - quotation-epackage-lab.xlsx の読み込み
 * - テンプレート構造の検証
 * - キャッシュ機能付き
 */

import * as ExcelJS from 'exceljs';
import * as path from 'path';

// =====================================================
// Types
// =====================================================

export interface TemplateStructure {
  fileName: string;
  filePath: string;
  sheetCount: number;
  sheetNames: string[];
  columns: {
    count: number;
    letters: string[];
  };
  rows: {
    count: number;
    dataRange: string;
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface LoadTemplateResult {
  workbook: ExcelJS.Workbook;
  structure: TemplateStructure;
  validation: ValidationResult;
}

// =====================================================
// Constants
// =====================================================

const TEMPLATE_FILE_NAME = 'quotation-epackage-lab.xlsx';
const TEMPLATE_DIR = path.join(process.cwd(), 'templet');
const TEMPLATE_FILE_PATH = path.join(TEMPLATE_DIR, TEMPLATE_FILE_NAME);

// Expected structure for quotation template
const EXPECTED_STRUCTURE = {
  MIN_ROWS: 38,        // A3:J40 range (38 rows minimum)
  MIN_COLUMNS: 10,     // A to J (10 columns)
  MIN_SHEETS: 1,
  EXPECTED_SHEET_NAMES: ['見積書', 'Quotation', 'Sheet1', 'Sheet2', 'Sheet3'], // Common names
};

// =====================================================
// Module State (Cache)
// =====================================================

let cachedWorkbook: ExcelJS.Workbook | null = null;
let cacheTimestamp: number | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// =====================================================
// Helper Functions
// =====================================================

/**
 * Get column letter from index (0 = A, 1 = B, etc.)
 */
function getColumnLetter(index: number): string {
  let letter = '';
  let temp = index;
  while (temp >= 0) {
    letter = String.fromCharCode((temp % 26) + 65) + letter;
    temp = Math.floor(temp / 26) - 1;
  }
  return letter;
}

/**
 * Check if cache is valid
 */
function isCacheValid(): boolean {
  return cachedWorkbook !== null &&
    cacheTimestamp !== null &&
    Date.now() - cacheTimestamp < CACHE_TTL;
}

/**
 * Validate template structure
 */
function validateTemplateStructure(workbook: ExcelJS.Workbook): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if workbook has worksheets
  if (workbook.worksheets.length === 0) {
    errors.push('ワークブックにワークシートが含まれていません');
    return { isValid: false, errors, warnings };
  }

  const worksheet = workbook.worksheets[0];

  // Check row count
  const rowCount = worksheet.rowCount;
  if (rowCount < EXPECTED_STRUCTURE.MIN_ROWS) {
    errors.push(
      `行数が不足しています: 期待値 ${EXPECTED_STRUCTURE.MIN_ROWS}+, 実際 ${rowCount}`
    );
  }

  // Check column count
  const columnCount = worksheet.columnCount;
  if (columnCount < EXPECTED_STRUCTURE.MIN_COLUMNS) {
    errors.push(
      `列数が不足しています: 期待値 ${EXPECTED_STRUCTURE.MIN_COLUMNS}+, 実際 ${columnCount}`
    );
  }

  // Check for expected sheet name patterns
  const sheetName = worksheet.name;
  const hasExpectedName = EXPECTED_STRUCTURE.EXPECTED_SHEET_NAMES.some(
    expected => sheetName.includes(expected)
  );
  if (!hasExpectedName) {
    warnings.push(
      `ワークシート名が予期されないものです: "${sheetName}"`
    );
  }

  // Check for key cells (A3:A4 should have client info header)
  const clientInfoCell = worksheet.getCell('A3');
  if (!clientInfoCell.value) {
    warnings.push('A3セルに値がありません（顧客情報ヘッダーを期待）');
  }

  // Check for product section (around row 14)
  const productHeaderRow = worksheet.getRow(14);
  const hasProductSection = productHeaderRow.cellCount > 0;
  if (!hasProductSection) {
    warnings.push('14行目に商品セクションが見つかりません');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Extract template structure metadata
 */
function extractTemplateStructure(workbook: ExcelJS.Workbook): TemplateStructure {
  const worksheet = workbook.worksheets[0];
  const columnCount = worksheet.columnCount;

  return {
    fileName: TEMPLATE_FILE_NAME,
    filePath: TEMPLATE_FILE_PATH,
    sheetCount: workbook.worksheets.length,
    sheetNames: workbook.worksheets.map(ws => ws.name),
    columns: {
      count: columnCount,
      letters: Array.from({ length: columnCount }, (_, i) => getColumnLetter(i)),
    },
    rows: {
      count: worksheet.rowCount,
      dataRange: `A1:${getColumnLetter(columnCount - 1)}${worksheet.rowCount}`,
    },
  };
}

// =====================================================
// Main Functions
// =====================================================

/**
 * Load Excel quotation template
 *
 * @param useCache - Use cached workbook if available (default: true)
 * @returns Loaded workbook with structure and validation
 */
export async function loadTemplate(
  useCache: boolean = true
): Promise<LoadTemplateResult> {
  try {
    // Check cache first
    if (useCache && isCacheValid() && cachedWorkbook) {
      const structure = extractTemplateStructure(cachedWorkbook);
      const validation = validateTemplateStructure(cachedWorkbook);

      return {
        workbook: cachedWorkbook,
        structure,
        validation,
      };
    }

    // Load workbook from file
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(TEMPLATE_FILE_PATH);

    // Update cache
    cachedWorkbook = workbook;
    cacheTimestamp = Date.now();

    // Extract structure and validate
    const structure = extractTemplateStructure(workbook);
    const validation = validateTemplateStructure(workbook);

    return {
      workbook,
      structure,
      validation,
    };
  } catch (error) {
    throw new Error(
      `テンプレートの読み込みに失敗しました: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Validate template structure without loading
 *
 * @returns Validation result with errors and warnings
 */
export async function validateTemplate(): Promise<ValidationResult> {
  try {
    const result = await loadTemplate(true);
    return result.validation;
  } catch (error) {
    return {
      isValid: false,
      errors: [`テンプレートの検証に失敗しました: ${error instanceof Error ? error.message : String(error)}`],
      warnings: [],
    };
  }
}

/**
 * Get template structure information
 *
 * @param useCache - Use cached workbook if available (default: true)
 * @returns Template structure metadata
 */
export async function getTemplateStructure(
  useCache: boolean = true
): Promise<TemplateStructure> {
  const result = await loadTemplate(useCache);
  return result.structure;
}

/**
 * Clear cached workbook
 *
 * Useful for testing or when template file is updated
 */
export function clearCache(): void {
  cachedWorkbook = null;
  cacheTimestamp = null;
}

/**
 * Get a specific worksheet from template
 *
 * @param sheetIndex - Worksheet index (default: 0 for first sheet)
 * @param useCache - Use cached workbook if available (default: true)
 * @returns ExcelJS Worksheet
 */
export async function getWorksheet(
  sheetIndex: number = 0,
  useCache: boolean = true
): Promise<ExcelJS.Worksheet> {
  const result = await loadTemplate(useCache);

  if (sheetIndex < 0 || sheetIndex >= result.workbook.worksheets.length) {
    throw new Error(
      `ワークシートインデックスが範囲外です: ${sheetIndex} (有効範囲: 0-${result.workbook.worksheets.length - 1})`
    );
  }

  return result.workbook.worksheets[sheetIndex];
}

/**
 * Get cell value from template
 *
 * @param cellAddress - Excel cell address (e.g., "A3", "J10")
 * @param sheetIndex - Worksheet index (default: 0)
 * @param useCache - Use cached workbook if available (default: true)
 * @returns Cell value
 */
export async function getCellValue(
  cellAddress: string,
  sheetIndex: number = 0,
  useCache: boolean = true
): Promise<ExcelJS.CellValue> {
  const worksheet = await getWorksheet(sheetIndex, useCache);
  const cell = worksheet.getCell(cellAddress);
  return cell.value;
}

/**
 * Get cell range values from template
 *
 * @param range - Excel range (e.g., "A3:J10")
 * @param sheetIndex - Worksheet index (default: 0)
 * @param useCache - Use cached workbook if available (default: true)
 * @returns 2D array of cell values
 */
export async function getRangeValues(
  range: string,
  sheetIndex: number = 0,
  useCache: boolean = true
): Promise<ExcelJS.CellValue[][]> {
  const worksheet = await getWorksheet(sheetIndex, useCache);

  // Parse range (e.g., "A3:J10")
  const [start, end] = range.split(':');
  const startCol = start.match(/[A-Z]+/)?.[0] || 'A';
  const startRow = parseInt(start.match(/\d+/)?.[0] || '1');
  const endCol = end.match(/[A-Z]+/)?.[0] || 'A';
  const endRow = parseInt(end.match(/\d+/)?.[0] || '1');

  const values: ExcelJS.CellValue[][] = [];

  for (let row = startRow; row <= endRow; row++) {
    const rowData: ExcelJS.CellValue[] = [];
    for (let col = startCol.charCodeAt(0); col <= endCol.charCodeAt(0); col++) {
      const colLetter = String.fromCharCode(col);
      const cell = worksheet.getCell(`${colLetter}${row}`);
      rowData.push(cell.value);
    }
    values.push(rowData);
  }

  return values;
}

/**
 * Write quotation data to worksheet
 *
 * @param worksheet - ExcelJS Worksheet to write to
 * @param data - Quotation data to write (from excelDataMapper)
 * @returns Promise<void>
 */
export async function writeQuotationToWorksheet(
  worksheet: ExcelJS.Worksheet,
  data: any
): Promise<void> {
  try {
    // Client information section (A3:J10)
    if (data.customerInfo) {
      worksheet.getCell('A3').value = data.customerInfo.companyName || '';
      worksheet.getCell('A4').value = data.customerInfo.contactPerson || '';
      worksheet.getCell('A5').value = data.customerInfo.address || '';
      worksheet.getCell('A6').value = data.customerInfo.phone || '';
      worksheet.getCell('A7').value = data.customerInfo.email || '';
    }

    // Quotation details
    if (data.quotationInfo) {
      worksheet.getCell('E3').value = data.quotationInfo.quotationNumber || '';
      worksheet.getCell('E4').value = data.quotationInfo.issueDate || '';
      worksheet.getCell('E5').value = data.quotationInfo.validUntil || '';
    }

    // Line items (starting from row 14)
    if (data.items && Array.isArray(data.items)) {
      const currentRow = 14;
      data.items.forEach((item: any, index: number) => {
        const row = currentRow + index;
        worksheet.getCell(`A${row}`).value = index + 1; // No.
        worksheet.getCell(`B${row}`).value = item.productCode || '';
        worksheet.getCell(`C${row}`).value = item.productName || '';
        worksheet.getCell(`D${row}`).value = item.quantity || 0;
        worksheet.getCell(`E${row}`).value = item.unit || '';
        worksheet.getCell(`F${row}`).value = item.unitPrice || 0;
        worksheet.getCell(`G${row}`).value = item.amount || 0;
        worksheet.getCell(`H${row}`).value = item.remarks || '';
      });
    }

    // Totals
    if (data.totals) {
      worksheet.getCell('G34').value = data.totals.subtotal || 0;
      worksheet.getCell('G35').value = data.totals.tax || 0;
      worksheet.getCell('G36').value = data.totals.total || 0;
    }

    // Notes and remarks
    if (data.notes) {
      worksheet.getCell('A38').value = data.notes;
    }

  } catch (error) {
    throw new Error(
      `ワークシートへの書き込みに失敗しました: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
