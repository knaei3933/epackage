/**
 * Unit Tests: Excel Template Loader
 *
 * Excelテンプレートローダーの単体テスト
 */

import ExcelJS from 'exceljs';
import {
  loadTemplate,
  validateTemplate,
  getTemplateStructure,
  clearCache,
  getWorksheet,
  getCellValue,
  getRangeValues,
} from '../excelTemplateLoader';

// Mock the ExcelJS module
jest.mock('exceljs');

describe('excelTemplateLoader', () => {
  let mockWorkbook: ExcelJS.Workbook;
  let mockWorksheet: ExcelJS.Worksheet;

  beforeEach(() => {
    clearCache();

    mockWorksheet = {
      name: '見積書',
      rowCount: 40,
      columnCount: 10,
      cellCount: 400,
      getCell: jest.fn(),
      getRow: jest.fn(),
    } as unknown as ExcelJS.Worksheet;

    mockWorkbook = {
      worksheets: [mockWorksheet],
      xlsx: {
        readFile: jest.fn().mockResolvedValue(undefined),
      },
    } as unknown as ExcelJS.Workbook;

    (ExcelJS as unknown as jest.Mock).mockImplementation(() => mockWorkbook);

    (mockWorksheet.getCell as jest.Mock).mockReturnValue({
      value: '顧客情報',
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('loadTemplate', () => {
    it('should load template successfully', async () => {
      const result = await loadTemplate(false);

      expect(result).toBeDefined();
      expect(result.workbook).toBe(mockWorkbook);
      expect(result.structure).toBeDefined();
      expect(result.validation).toBeDefined();
    });

    it('should use cached workbook on second call', async () => {
      const firstCall = await loadTemplate(false);
      const secondCall = await loadTemplate(true);

      expect(firstCall.workbook).toBe(secondCall.workbook);
      expect(mockWorkbook.xlsx.readFile).toHaveBeenCalledTimes(1);
    });

    it('should extract template structure correctly', async () => {
      const result = await loadTemplate(false);
      const { structure } = result;

      expect(structure.fileName).toBe('quotation-epackage-lab.xlsx');
      expect(structure.sheetCount).toBe(1);
      expect(structure.sheetNames).toEqual(['見積書']);
      expect(structure.columns.count).toBe(10);
      expect(structure.columns.letters).toHaveLength(10);
      expect(structure.rows.count).toBe(40);
    });
  });

  describe('validateTemplate', () => {
    it('should return valid result for correct template', async () => {
      const result = await validateTemplate();

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return invalid result when template has no worksheets', async () => {
      mockWorkbook.worksheets = [];
      const result = await validateTemplate();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('ワークブックにワークシートが含まれていません');
    });

    it('should detect insufficient rows', async () => {
      (mockWorksheet.rowCount as number) = 20;
      const result = await validateTemplate();

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('行数が不足しています'))).toBe(true);
    });

    it('should detect insufficient columns', async () => {
      (mockWorksheet.columnCount as number) = 5;
      const result = await validateTemplate();

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('列数が不足しています'))).toBe(true);
    });
  });

  describe('getTemplateStructure', () => {
    it('should return template structure metadata', async () => {
      const structure = await getTemplateStructure();

      expect(structure).toBeDefined();
      expect(structure.fileName).toBe('quotation-epackage-lab.xlsx');
      expect(structure.sheetCount).toBeGreaterThanOrEqual(1);
      expect(structure.columns.letters).toContain('A');
      expect(structure.columns.letters).toContain('J');
    });
  });

  describe('clearCache', () => {
    it('should clear cached workbook', async () => {
      await loadTemplate(false);
      clearCache();
      await loadTemplate(true);

      expect(mockWorkbook.xlsx.readFile).toHaveBeenCalledTimes(2);
    });
  });

  describe('getWorksheet', () => {
    it('should return first worksheet by default', async () => {
      const worksheet = await getWorksheet();
      expect(worksheet).toBe(mockWorksheet);
    });

    it('should throw error for invalid index', async () => {
      await expect(getWorksheet(999)).rejects.toThrow('ワークシートインデックスが範囲外です');
    });
  });

  describe('getCellValue', () => {
    it('should return cell value for valid address', async () => {
      const value = await getCellValue('A3');

      expect(value).toBe('顧客情報');
      expect(mockWorksheet.getCell).toHaveBeenCalledWith('A3');
    });
  });

  describe('getRangeValues', () => {
    beforeEach(() => {
      let callCount = 0;
      (mockWorksheet.getCell as jest.Mock).mockImplementation(() => {
        const values = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
        return { value: values[callCount++ % 10] };
      });
    });

    it('should return 2D array of cell values for range', async () => {
      const values = await getRangeValues('A3:J5');

      expect(values).toBeDefined();
      expect(Array.isArray(values)).toBe(true);
      expect(values.length).toBe(3);
      expect(values[0].length).toBe(10);
    });
  });

  describe('error handling', () => {
    it('should throw error when file read fails', async () => {
      (mockWorkbook.xlsx.readFile as jest.Mock).mockRejectedValue(
        new Error('File not found')
      );

      await expect(loadTemplate(false)).rejects.toThrow('テンプレートの読み込みに失敗しました');
    });
  });
});
