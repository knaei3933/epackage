/**
 * Base PDF Generator Tests
 *
 * 基底PDFジェネレーターテスト
 * - 抽象クラスの振る舞い検証
 * - 共通機能のテスト
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { BasePdfGenerator } from '@/lib/pdf/core/base';
import type { PdfGenerationOptions } from '@/types/contract';

// ============================================================
// Test Implementation
// ============================================================

/**
 * テスト用実装クラス
 * Test implementation of BasePdfGenerator
 */
class TestPdfGenerator extends BasePdfGenerator<
  { name: string; value: number },
  { success: boolean; buffer?: Buffer; error?: string; testValue?: number }
> {
  constructor() {
    super({
      templatePath: 'test-template.html',
      defaultPdfOptions: {
        format: 'A4',
        orientation: 'portrait',
      },
    });
  }

  protected prepareTemplateData(data: { name: string; value: number }): Record<string, unknown> {
    return {
      name: data.name,
      value: data.value,
      formattedValue: this.formatCurrency(data.value),
      formattedDate: this.formatJapaneseDate(new Date()),
    };
  }

  protected validateData(data: { name: string; value: number }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.name) {
      errors.push('name is required');
    }
    if (data.value < 0) {
      errors.push('value must be non-negative');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  protected estimateSize(data: { name: string; value: number }): number {
    return 1000 + data.name.length * 10 + data.value * 2;
  }

  // テスト用メソッド
  public getTestValue(): number {
    return 42;
  }
}

// ============================================================
// Tests
// ============================================================

describe('BasePdfGenerator', () => {
  let generator: TestPdfGenerator;

  beforeEach(() => {
    generator = new TestPdfGenerator();
  });

  afterEach(() => {
    // クリーンアップ
  });

  describe('Initialization', () => {
    it('should initialize with default options', () => {
      expect(generator).toBeInstanceOf(BasePdfGenerator);
      expect(generator).toBeInstanceOf(TestPdfGenerator);
    });

    it('should have test methods accessible', () => {
      expect(generator.getTestValue()).toBe(42);
    });
  });

  describe('Validation', () => {
    it('should validate correct data', () => {
      const result = generator.validateData({ name: 'Test', value: 100 });
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject data with missing name', () => {
      const result = generator.validateData({ name: '', value: 100 });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('name is required');
    });

    it('should reject data with negative value', () => {
      const result = generator.validateData({ name: 'Test', value: -1 });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('value must be non-negative');
    });

    it('should collect multiple validation errors', () => {
      const result = generator.validateData({ name: '', value: -1 });
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Template Data Preparation', () => {
    it('should prepare template data correctly', () => {
      const data = { name: 'Test Product', value: 1500 };
      const templateData = generator.prepareTemplateData(data);

      expect(templateData.name).toBe('Test Product');
      expect(templateData.value).toBe(1500);
      expect(templateData.formattedValue).toBe('¥1,500');
      expect(templateData.formattedDate).toMatch(/¥d{4}年\d{1,2}月\d{1,2}日/);
    });
  });

  describe('Utility Methods', () => {
    describe('formatJapaneseDate', () => {
      it('should format Reiwa dates correctly', () => {
        const date = new Date(2024, 3, 1); // 2024年4月1日
        const formatted = generator.formatJapaneseDate(date);
        expect(formatted).toBe('令和6年4月1日');
      });

      it('should format Heisei dates correctly', () => {
        const date = new Date(2010, 0, 1); // 2010年1月1日
        const formatted = generator.formatJapaneseDate(date);
        expect(formatted).toBe('平成22年1月1日');
      });

      it('should handle string dates', () => {
        const formatted = generator.formatJapaneseDate('2024-04-01');
        expect(formatted).toBe('令和6年4月1日');
      });
    });

    describe('formatCurrency', () => {
      it('should format JPY currency correctly', () => {
        expect(generator.formatCurrency(1000)).toBe('¥1,000');
        expect(generator.formatCurrency(1234567)).toBe('¥1,234,567');
      });

      it('should format USD currency correctly', () => {
        expect(generator.formatCurrency(1000, 'USD')).toBe('$1,000');
      });
    });
  });

  describe('Size Estimation', () => {
    it('should estimate size correctly', () => {
      const size = generator.estimateSize({ name: 'Test', value: 100 });
      expect(size).toBe(1000 + 4 * 10 + 100 * 2); // 1000 + 40 + 200 = 1240
    });
  });

  describe('Result Creation', () => {
    it('should create success result', () => {
      const buffer = Buffer.from('test');
      const result = generator.createSuccessResult(buffer, '/path/to/file.pdf', {
        fileSize: 4,
      });

      expect(result.success).toBe(true);
      expect(result.buffer).toEqual(buffer);
      expect(result.filePath).toBe('/path/to/file.pdf');
      expect(result.metadata?.fileSize).toBe(4);
    });

    it('should create error result', () => {
      const result = generator.createErrorResult('Test error');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Test error');
    });

    it('should identify success results correctly', () => {
      const successResult = { success: true, buffer: Buffer.from('test') };
      const errorResult = { success: false, error: 'error' };

      expect(generator.isSuccessResult(successResult)).toBe(true);
      expect(generator.isSuccessResult(errorResult)).toBe(false);
    });
  });
});

describe('BasePdfGenerator Edge Cases', () => {
  it('should handle empty string name', () => {
    const generator = new TestPdfGenerator();
    const result = generator.validateData({ name: '', value: 0 });
    expect(result.isValid).toBe(false);
  });

  it('should handle zero value', () => {
    const generator = new TestPdfGenerator();
    const result = generator.validateData({ name: 'Test', value: 0 });
    expect(result.isValid).toBe(true);
  });

  it('should handle very large values', () => {
    const generator = new TestPdfGenerator();
    const formatted = generator.formatCurrency(999999999);
    expect(formatted).toBe('¥999,999,999');
  });

  it('should handle dates at era boundaries', () => {
    const generator = new TestPdfGenerator();
    // Heisei end (2019-04-30)
    const heiseiEnd = generator.formatJapaneseDate('2019-04-30');
    expect(heiseiEnd).toBe('平成31年4月30日');

    // Reiwa start (2019-05-01)
    const reiwaStart = generator.formatJapaneseDate('2019-05-01');
    expect(reiwaStart).toBe('令和1年5月1日');
  });
});
