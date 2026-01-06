/**
 * AI File Parser Unit Tests
 *
 * AIファイルパーサー単体テスト
 * Unit tests for AI file parsing functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from '@jest/globals';
import {
  parseAiFile,
  extractAiDataFromBuffer,
  parseAiFileFromPath,
  validateAiFile,
  validateAiBuffer,
  cmykToRgb,
  rgbToCmyk,
  ptToMm,
  mmToPt,
  inToMm,
  mmToIn,
  parseAiVersion,
  validateAiFileData,
  createMockAiData,
} from '../aiFileParser';
import type { AiFileData, Color, CmykColor } from '@/types/aiFile';
import { isAiFileData, isColor, isLayer } from '@/types/aiFile';

// ============================================================
// Test Utilities
// ============================================================

// Mock pdf-parse
jest.mock('pdf-parse', () => ({
  default: jest.fn(),
}));

// Mock fs/promises
jest.mock('fs/promises', () => ({
  readFile: jest.fn(),
}));

// ============================================================
// Test Fixtures
// ============================================================

const createMockPdfData = (customData?: any) => ({
  numpages: 1,
  pages: [
    {
      width: 595, // A4 width in points
      height: 842, // A4 height in points
    },
  ],
  text: 'Sample Text\n日本語テキスト',
  info: {
    Creator: 'Adobe Illustrator CS6',
    Producer: 'Adobe Illustrator CS6',
    CreationDate: 'D:20240101',
    ModDate: 'D:20240115',
    Author: 'Test User',
    Title: 'Test Document',
    Subject: 'AI File Parser Test',
    Keywords: 'test,ai,illustrator',
    PDFFormatVersion: '1.4',
    Thumbnail: 'mock-thumbnail-data',
  },
  ...customData,
});

const createMockAiBuffer = (): Buffer => {
  return Buffer.from('%PDF-1.4\n%ai');
};

// ============================================================
// Test Suites
// ============================================================

describe('AI File Parser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ============================================================
  // parseAiFile Tests
  // ============================================================

  describe('parseAiFile', () => {
    it('should parse valid AI file buffer', async () => {
      const mockBuffer = createMockAiBuffer();
      const mockPdfData = createMockPdfData();

      const pdf = await import('pdf-parse');
      jest.mocked(pdf.default).mockResolvedValue(mockPdfData);

      const result = await parseAiFile(mockBuffer);

      expect(result).toBeDefined();
      expect(result.version).toBe('CS6+');
      expect(result.dimensions).toBeDefined();
      expect(result.dimensions.width).toBeCloseTo(210, 0); // A4 width in mm
      expect(result.dimensions.height).toBeCloseTo(297, 0); // A4 height in mm
      expect(result.dimensions.unit).toBe('mm');
    });

    it('should extract colors from AI file', async () => {
      const mockBuffer = createMockAiBuffer();
      const mockPdfData = createMockPdfData();

      const pdf = await import('pdf-parse');
      jest.mocked(pdf.default).mockResolvedValue(mockPdfData);

      const result = await parseAiFile(mockBuffer);

      expect(result.colors).toBeDefined();
      expect(result.colors.length).toBeGreaterThan(0);
      expect(result.colors[0]).toHaveProperty('cmyk');
      expect(result.colors[0].cmyk).toMatchObject({
        c: expect.any(Number),
        m: expect.any(Number),
        y: expect.any(Number),
        k: expect.any(Number),
      });
    });

    it('should extract fonts from AI file', async () => {
      const mockBuffer = createMockAiBuffer();
      const mockPdfData = createMockPdfData();

      const pdf = await import('pdf-parse');
      jest.mocked(pdf.default).mockResolvedValue(mockPdfData);

      const result = await parseAiFile(mockBuffer);

      expect(result.fonts).toBeDefined();
      expect(result.fonts.length).toBeGreaterThan(0);
      expect(result.fonts[0]).toMatchObject({
        name: expect.any(String),
        family: expect.any(String),
        size: expect.any(Number),
        type: expect.any(String),
      });
    });

    it('should detect Japanese fonts when Japanese text is present', async () => {
      const mockBuffer = createMockAiBuffer();
      const mockPdfData = createMockPdfData({
        text: '日本語テキスト\nテスト',
      });

      const pdf = await import('pdf-parse');
      jest.mocked(pdf.default).mockResolvedValue(mockPdfData);

      const result = await parseAiFile(mockBuffer);

      expect(result.fonts).toBeDefined();
      const japaneseFont = result.fonts.find(f => f.isJapanese);
      expect(japaneseFont).toBeDefined();
    });

    it('should extract layers from AI file', async () => {
      const mockBuffer = createMockAiBuffer();
      const mockPdfData = createMockPdfData();

      const pdf = await import('pdf-parse');
      jest.mocked(pdf.default).mockResolvedValue(mockPdfData);

      const result = await parseAiFile(mockBuffer);

      expect(result.layers).toBeDefined();
      expect(result.layers.length).toBeGreaterThan(0);
      expect(result.layers[0]).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        visible: expect.any(Boolean),
        locked: expect.any(Boolean),
        opacity: expect.any(Number),
      });
    });

    it('should extract text elements from AI file', async () => {
      const mockBuffer = createMockAiBuffer();
      const mockPdfData = createMockPdfData({
        text: 'Sample Text\nSecond Line',
      });

      const pdf = await import('pdf-parse');
      jest.mocked(pdf.default).mockResolvedValue(mockPdfData);

      const result = await parseAiFile(mockBuffer);

      expect(result.textElements).toBeDefined();
      expect(result.textElements.length).toBeGreaterThan(0);
      expect(result.textElements[0]).toMatchObject({
        content: expect.any(String),
        font: expect.any(Object),
        position: expect.any(Object),
      });
    });

    it('should extract artboards from multi-page PDF', async () => {
      const mockBuffer = createMockAiBuffer();
      const mockPdfData = createMockPdfData({
        numpages: 2,
        pages: [
          { width: 595, height: 842 },
          { width: 420, height: 595 },
        ],
      });

      const pdf = await import('pdf-parse');
      jest.mocked(pdf.default).mockResolvedValue(mockPdfData);

      const result = await parseAiFile(mockBuffer);

      expect(result.artboards).toBeDefined();
      expect(result.artboards?.length).toBe(2);
      expect(result.artboards?.[0].isActive).toBe(true);
      expect(result.artboards?.[1].isActive).toBe(false);
    });

    it('should extract metadata from AI file', async () => {
      const mockBuffer = createMockAiBuffer();
      const mockPdfData = createMockPdfData();

      const pdf = await import('pdf-parse');
      jest.mocked(pdf.default).mockResolvedValue(mockPdfData);

      const result = await parseAiFile(mockBuffer);

      expect(result.metadata).toBeDefined();
      expect(result.metadata?.created).toBe('D:20240101');
      expect(result.metadata?.modified).toBe('D:20240115');
      expect(result.metadata?.author).toBe('Test User');
      expect(result.metadata?.creator).toContain('Illustrator');
    });

    it('should handle parse options - textOnly', async () => {
      const mockBuffer = createMockAiBuffer();
      const mockPdfData = createMockPdfData();

      const pdf = await import('pdf-parse');
      jest.mocked(pdf.default).mockResolvedValue(mockPdfData);

      const result = await parseAiFile(mockBuffer, { textOnly: true });

      expect(result.colors).toHaveLength(0);
      expect(result.paths).toBeUndefined();
      expect(result.shapes).toBeDefined();
    });

    it('should include processing time', async () => {
      const mockBuffer = createMockAiBuffer();
      const mockPdfData = createMockPdfData();

      const pdf = await import('pdf-parse');
      jest.mocked(pdf.default).mockResolvedValue(mockPdfData);

      const result = await parseAiFile(mockBuffer);

      expect(result.processingTime).toBeDefined();
      expect(result.processingTime).toBeGreaterThanOrEqual(0);
      expect(result.processingTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should throw error for invalid buffer', async () => {
      const mockBuffer = Buffer.from('invalid-data');

      const pdf = await import('pdf-parse');
      jest.mocked(pdf.default).mockRejectedValue(new Error('Invalid PDF'));

      await expect(parseAiFile(mockBuffer)).rejects.toThrow('AIファイル解析エラー');
    });
  });

  // ============================================================
  // extractAiDataFromBuffer Tests
  // ============================================================

  describe('extractAiDataFromBuffer', () => {
    it('should extract AI data from buffer', async () => {
      const mockBuffer = createMockAiBuffer();
      const mockPdfData = createMockPdfData();

      const pdf = await import('pdf-parse');
      jest.mocked(pdf.default).mockResolvedValue(mockPdfData);

      const result = await extractAiDataFromBuffer(mockBuffer);

      expect(result).toBeDefined();
      expect(result.version).toBeDefined();
      expect(result.dimensions).toBeDefined();
    });
  });

  // ============================================================
  // parseAiFileFromPath Tests
  // ============================================================

  describe('parseAiFileFromPath', () => {
    it('should parse AI file from file path', async () => {
      const filePath = '/path/to/file.ai';
      const mockBuffer = createMockAiBuffer();
      const mockPdfData = createMockPdfData();

      const fs = await import('fs/promises');
      jest.mocked(fs.readFile).mockResolvedValue(mockBuffer);

      const pdf = await import('pdf-parse');
      jest.mocked(pdf.default).mockResolvedValue(mockPdfData);

      const result = await parseAiFileFromPath(filePath);

      expect(result).toBeDefined();
      expect(result.sourcePath).toBe(filePath);
      expect(fs.readFile).toHaveBeenCalledWith(filePath);
    });
  });

  // ============================================================
  // validateAiFile Tests
  // ============================================================

  describe('validateAiFile', () => {
    it('should validate valid AI file', async () => {
      const mockFile = new File(['%PDF-1.4'], 'test.ai', {
        type: 'application/postscript',
      });

      const result = await validateAiFile(mockFile);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject file with invalid extension', async () => {
      const mockFile = new File(['%PDF-1.4'], 'test.pdf', {
        type: 'application/pdf',
      });

      const result = await validateAiFile(mockFile);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('ファイル拡張子が.aiではありません');
    });

    it('should reject file exceeding max size', async () => {
      const largeBuffer = Buffer.alloc(101 * 1024 * 1024); // 101MB
      const mockFile = new File([largeBuffer], 'large.ai');

      const result = await validateAiFile(mockFile);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('ファイルサイズが100MBを超えています');
    });

    it('should reject empty file', async () => {
      const mockFile = new File([], 'empty.ai');

      const result = await validateAiFile(mockFile);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('ファイルサイズが0です');
    });

    it('should warn about unrecognized header', async () => {
      const mockFile = new File(['INVALID'], 'test.ai');

      const result = await validateAiFile(mockFile);

      expect(result.warnings).toContain(
        'AIファイルヘッダーが認識されません。PDFまたはEPSベースである必要があります。'
      );
    });

    it('should use custom validation options', async () => {
      const mockFile = new File(['%PDF-1.4'], 'test.ai');

      const result = await validateAiFile(mockFile, {
        maxSize: 1024, // 1KB
        allowedVersions: ['CS6'],
      });

      expect(result).toBeDefined();
    });
  });

  // ============================================================
  // validateAiBuffer Tests
  // ============================================================

  describe('validateAiBuffer', () => {
    it('should validate valid AI buffer', async () => {
      const mockBuffer = Buffer.from('%PDF-1.4');

      const result = await validateAiBuffer(mockBuffer, 'test.ai');

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate buffer without filename', async () => {
      const mockBuffer = Buffer.from('%PDF-1.4');

      const result = await validateAiBuffer(mockBuffer);

      expect(result.isValid).toBe(true);
    });

    it('should reject buffer with invalid filename', async () => {
      const mockBuffer = Buffer.from('%PDF-1.4');

      const result = await validateAiBuffer(mockBuffer, 'test.pdf');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('ファイル拡張子が.aiではありません');
    });

    it('should reject oversized buffer', async () => {
      const largeBuffer = Buffer.alloc(101 * 1024 * 1024);

      const result = await validateAiBuffer(largeBuffer);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('ファイルサイズが100MBを超えています');
    });

    it('should reject empty buffer', async () => {
      const emptyBuffer = Buffer.alloc(0);

      const result = await validateAiBuffer(emptyBuffer);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('ファイルサイズが0です');
    });

    it('should reject tiny buffer', async () => {
      const tinyBuffer = Buffer.from('xyz');

      const result = await validateAiBuffer(tinyBuffer);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('ファイルサイズが小さすぎます');
    });
  });

  // ============================================================
  // Color Conversion Tests
  // ============================================================

  describe('cmykToRgb', () => {
    it('should convert black CMYK to RGB', () => {
      const cmyk: CmykColor = { c: 0, m: 0, y: 0, k: 100 };
      const rgb = cmykToRgb(cmyk);

      expect(rgb).toEqual({ r: 0, g: 0, b: 0 });
    });

    it('should convert white CMYK to RGB', () => {
      const cmyk: CmykColor = { c: 0, m: 0, y: 0, k: 0 };
      const rgb = cmykToRgb(cmyk);

      expect(rgb).toEqual({ r: 255, g: 255, b: 255 });
    });

    it('should convert red CMYK to RGB', () => {
      const cmyk: CmykColor = { c: 0, m: 100, y: 100, k: 0 };
      const rgb = cmykToRgb(cmyk);

      expect(rgb.r).toBeGreaterThan(200);
      expect(rgb.g).toBeLessThan(50);
      expect(rgb.b).toBeLessThan(50);
    });

    it('should convert cyan CMYK to RGB', () => {
      const cmyk: CmykColor = { c: 100, m: 0, y: 0, k: 0 };
      const rgb = cmykToRgb(cmyk);

      expect(rgb.r).toBeLessThan(50);
      expect(rgb.g).toBeGreaterThan(200);
      expect(rgb.b).toBeGreaterThan(200);
    });

    it('should handle intermediate CMYK values', () => {
      const cmyk: CmykColor = { c: 50, m: 50, y: 50, k: 50 };
      const rgb = cmykToRgb(cmyk);

      expect(rgb.r).toBeGreaterThanOrEqual(0);
      expect(rgb.r).toBeLessThanOrEqual(255);
      expect(rgb.g).toBeGreaterThanOrEqual(0);
      expect(rgb.g).toBeLessThanOrEqual(255);
      expect(rgb.b).toBeGreaterThanOrEqual(0);
      expect(rgb.b).toBeLessThanOrEqual(255);
    });
  });

  describe('rgbToCmyk', () => {
    it('should convert black RGB to CMYK', () => {
      const cmyk = rgbToCmyk(0, 0, 0);

      expect(cmyk.c).toBe(0);
      expect(cmyk.m).toBe(0);
      expect(cmyk.y).toBe(0);
      expect(cmyk.k).toBe(100);
    });

    it('should convert white RGB to CMYK', () => {
      const cmyk = rgbToCmyk(255, 255, 255);

      expect(cmyk.c).toBe(0);
      expect(cmyk.m).toBe(0);
      expect(cmyk.y).toBe(0);
      expect(cmyk.k).toBe(0);
    });

    it('should convert red RGB to CMYK', () => {
      const cmyk = rgbToCmyk(255, 0, 0);

      expect(cmyk.m).toBeGreaterThan(90);
      expect(cmyk.y).toBeGreaterThan(90);
    });

    it('should round CMYK values to integers', () => {
      const cmyk = rgbToCmyk(128, 128, 128);

      expect(Number.isInteger(cmyk.c)).toBe(true);
      expect(Number.isInteger(cmyk.m)).toBe(true);
      expect(Number.isInteger(cmyk.y)).toBe(true);
      expect(Number.isInteger(cmyk.k)).toBe(true);
    });
  });

  // ============================================================
  // Unit Conversion Tests
  // ============================================================

  describe('ptToMm', () => {
    it('should convert points to millimeters', () => {
      expect(ptToMm(0)).toBe(0);
      expect(ptToMm(1)).toBeCloseTo(0.35, 2);
      expect(ptToMm(100)).toBeCloseTo(35.28, 2);
      expect(ptToMm(595)).toBeCloseTo(210, 0); // A4 width
    });
  });

  describe('mmToPt', () => {
    it('should convert millimeters to points', () => {
      expect(mmToPt(0)).toBe(0);
      expect(mmToPt(1)).toBeCloseTo(2.83, 2);
      expect(mmToPt(100)).toBeCloseTo(283.46, 2);
      expect(mmToPt(210)).toBeCloseTo(595, 0); // A4 width
    });
  });

  describe('inToMm', () => {
    it('should convert inches to millimeters', () => {
      expect(inToMm(0)).toBe(0);
      expect(inToMm(1)).toBeCloseTo(25.4, 1);
      expect(inToMm(8.27)).toBeCloseTo(210, 0); // A4 width
    });
  });

  describe('mmToIn', () => {
    it('should convert millimeters to inches', () => {
      expect(mmToIn(0)).toBe(0);
      expect(mmToIn(25.4)).toBeCloseTo(1, 1);
      expect(mmToIn(210)).toBeCloseTo(8.27, 2);
    });
  });

  // ============================================================
  // Version Parsing Tests
  // ============================================================

  describe('parseAiVersion', () => {
    it('should parse CC version with year', () => {
      const result = parseAiVersion('CC2020');

      expect(result.major).toBe('CC');
      expect(result.minor).toBe(2020);
      expect(result.year).toBe(2020);
      expect(result.isPdfBased).toBe(true);
      expect(result.fullVersion).toBe('CC2020');
    });

    it('should parse CC version without year', () => {
      const result = parseAiVersion('CC');

      expect(result.major).toBe('CC');
      expect(result.isPdfBased).toBe(true);
    });

    it('should parse CS version', () => {
      const result = parseAiVersion('CS6');

      expect(result.major).toBe('CS');
      expect(result.minor).toBe(6);
      expect(result.isPdfBased).toBe(true);
    });

    it('should handle unknown version', () => {
      const result = parseAiVersion('Unknown');

      expect(result.major).toBe('Unknown');
      expect(result.isPdfBased).toBe(false);
    });
  });

  // ============================================================
  // Data Validation Tests
  // ============================================================

  describe('validateAiFileData', () => {
    it('should validate correct AiFileData', () => {
      const mockData = createMockAiData();

      const result = validateAiFileData(mockData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid data structure', () => {
      const invalidData = { not: 'valid' };

      const result = validateAiFileData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('データがAiFileData型ではありません');
    });

    it('should detect invalid dimensions', () => {
      const invalidData = createMockAiData();
      invalidData.dimensions.width = 0;

      const result = validateAiFileData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('寸法が無効です');
    });

    it('should warn about missing layers', () => {
      const dataWithoutLayers = createMockAiData();
      dataWithoutLayers.layers = [];

      const result = validateAiFileData(dataWithoutLayers);

      expect(result.warnings).toContain('レイヤーがありません');
    });

    it('should warn about missing version', () => {
      const dataWithoutVersion = createMockAiData();
      delete (dataWithoutVersion as any).version;

      const result = validateAiFileData(dataWithoutVersion);

      expect(result.warnings).toContain('AIバージョンが不明です');
    });
  });

  // ============================================================
  // Mock Data Tests
  // ============================================================

  describe('createMockAiData', () => {
    it('should create valid mock AI data', () => {
      const mockData = createMockAiData();

      expect(isAiFileData(mockData)).toBe(true);
      expect(mockData.version).toBeDefined();
      expect(mockData.dimensions).toBeDefined();
      expect(mockData.colors.length).toBeGreaterThan(0);
      expect(mockData.fonts.length).toBeGreaterThan(0);
      expect(mockData.layers.length).toBeGreaterThan(0);
      expect(mockData.textElements.length).toBeGreaterThan(0);
    });

    it('should have all required fields', () => {
      const mockData = createMockAiData();

      expect(mockData.version).toBeTruthy();
      expect(mockData.fileName).toBeTruthy();
      expect(mockData.artboardCount).toBeGreaterThan(0);
      expect(mockData.artboards).toBeDefined();
      expect(mockData.metadata).toBeDefined();
      expect(mockData.processingTime).toBeGreaterThanOrEqual(0);
    });

    it('should have valid colors', () => {
      const mockData = createMockAiData();

      mockData.colors.forEach(color => {
        expect(isColor(color)).toBe(true);
        expect(color.cmyk).toBeDefined();
        expect(color.hex).toBeDefined();
      });
    });

    it('should have valid layers', () => {
      const mockData = createMockAiData();

      mockData.layers.forEach(layer => {
        expect(isLayer(layer)).toBe(true);
        expect(layer.id).toBeTruthy();
        expect(layer.name).toBeTruthy();
      });
    });

    it('should include Japanese fonts', () => {
      const mockData = createMockAiData();

      const japaneseFont = mockData.fonts.find(f => f.isJapanese);
      expect(japaneseFont).toBeDefined();
      expect(japaneseFont?.name).toContain('Hiragino');
    });

    it('should have valid dimensions', () => {
      const mockData = createMockAiData();

      expect(mockData.dimensions.width).toBe(210); // A4 width
      expect(mockData.dimensions.height).toBe(297); // A4 height
      expect(mockData.dimensions.unit).toBe('mm');
    });
  });

  // ============================================================
  // Type Guard Tests
  // ============================================================

  describe('Type Guards', () => {
    it('isAiFileData should correctly identify AiFileData', () => {
      const validData = createMockAiData();
      expect(isAiFileData(validData)).toBe(true);

      const invalidData = { foo: 'bar' };
      expect(isAiFileData(invalidData)).toBe(false);
    });

    it('isColor should correctly identify Color', () => {
      const validColor: Color = {
        cmyk: { c: 0, m: 0, y: 0, k: 100 },
        hex: '#000000',
      };
      expect(isColor(validColor)).toBe(true);

      const invalidColor = { foo: 'bar' };
      expect(isColor(invalidColor)).toBe(false);
    });

    it('isLayer should correctly identify Layer', () => {
      const validLayer = {
        id: 'layer-1',
        name: 'Layer 1',
        visible: true,
        locked: false,
        opacity: 100,
      };
      expect(isLayer(validLayer)).toBe(true);

      const invalidLayer = { foo: 'bar' };
      expect(isLayer(invalidLayer)).toBe(false);
    });
  });

  // ============================================================
  // Integration Tests
  // ============================================================

  describe('Integration Tests', () => {
    it('should handle complete workflow: validate -> parse -> validate data', async () => {
      const mockFile = new File(['%PDF-1.4'], 'test.ai');
      const mockBuffer = Buffer.from('%PDF-1.4');
      const mockPdfData = createMockPdfData();

      // Step 1: Validate file
      const fileValidation = await validateAiFile(mockFile);
      expect(fileValidation.isValid).toBe(true);

      // Step 2: Parse file
      const pdf = await import('pdf-parse');
      jest.mocked(pdf.default).mockResolvedValue(mockPdfData);

      const aiData = await parseAiFile(mockBuffer);
      expect(aiData).toBeDefined();

      // Step 3: Validate parsed data
      const dataValidation = validateAiFileData(aiData);
      expect(dataValidation.isValid).toBe(true);
    });

    it('should handle color conversions round-trip', () => {
      // RGB -> CMYK -> RGB
      const originalRgb = { r: 128, g: 64, b: 32 };
      const cmyk = rgbToCmyk(originalRgb.r, originalRgb.g, originalRgb.b);
      const convertedRgb = cmykToRgb(cmyk);

      // Allow some tolerance due to rounding
      expect(convertedRgb.r).toBeCloseTo(originalRgb.r, 0);
      expect(convertedRgb.g).toBeCloseTo(originalRgb.g, 0);
      expect(convertedRgb.b).toBeCloseTo(originalRgb.b, 0);
    });

    it('should handle unit conversions round-trip', () => {
      // mm -> pt -> mm
      const originalMm = 100;
      const pt = mmToPt(originalMm);
      const convertedMm = ptToMm(pt);

      expect(convertedMm).toBeCloseTo(originalMm, 1);
    });
  });
});
