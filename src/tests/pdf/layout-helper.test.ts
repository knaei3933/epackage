/**
 * Layout Helper Tests
 *
 * レイアウトヘルパーテスト
 * - ページサイズ計算
 * - マージン計算
 * - CSS生成
 */

import { describe, it, expect } from '@jest/globals';
import {
  LayoutHelper,
  PAGE_SIZES,
  DEFAULT_MARGINS,
} from '@/lib/pdf/core/layout-helper';

// ============================================================
// Tests
// ============================================================

describe('LayoutHelper', () => {
  describe('Page Dimensions', () => {
    it('should return correct A4 portrait dimensions', () => {
      const dimensions = LayoutHelper.getPageDimensions('A4', 'portrait');
      expect(dimensions.width).toBe(210);
      expect(dimensions.height).toBe(297);
    });

    it('should return correct A4 landscape dimensions', () => {
      const dimensions = LayoutHelper.getPageDimensions('A4', 'landscape');
      expect(dimensions.width).toBe(297);
      expect(dimensions.height).toBe(210);
    });

    it('should return correct A3 dimensions', () => {
      const portrait = LayoutHelper.getPageDimensions('A3', 'portrait');
      expect(portrait.width).toBe(297);
      expect(portrait.height).toBe(420);

      const landscape = LayoutHelper.getPageDimensions('A3', 'landscape');
      expect(landscape.width).toBe(420);
      expect(landscape.height).toBe(297);
    });

    it('should return correct Letter dimensions', () => {
      const dimensions = LayoutHelper.getPageDimensions('Letter', 'portrait');
      expect(dimensions.width).toBeCloseTo(215.9, 1);
      expect(dimensions.height).toBeCloseTo(279.4, 1);
    });

    it('should return correct Legal dimensions', () => {
      const dimensions = LayoutHelper.getPageDimensions('Legal', 'portrait');
      expect(dimensions.width).toBeCloseTo(215.9, 1);
      expect(dimensions.height).toBeCloseTo(355.6, 1);
    });
  });

  describe('Content Width Calculation', () => {
    it('should calculate content width for A4 portrait', () => {
      const width = LayoutHelper.calculateContentWidth('A4', 'portrait');
      expect(width).toBeCloseTo(180, 1); // 210 - 15 - 15
    });

    it('should calculate content width with custom margins', () => {
      const width = LayoutHelper.calculateContentWidth('A4', 'portrait', '20mm', '20mm');
      expect(width).toBeCloseTo(170, 1); // 210 - 20 - 20
    });
  });

  describe('Content Height Calculation', () => {
    it('should calculate content height for A4 portrait', () => {
      const height = LayoutHelper.calculateContentHeight('A4', 'portrait');
      expect(height).toBeCloseTo(257, 1); // 297 - 20 - 20
    });

    it('should calculate content height with custom margins', () => {
      const height = LayoutHelper.calculateContentHeight('A4', 'portrait', '15mm', '15mm');
      expect(height).toBeCloseTo(267, 1); // 297 - 15 - 15
    });
  });

  describe('Margin Parsing', () => {
    it('should parse mm margins', () => {
      const margin = LayoutHelper.parseMargin('20mm');
      expect(margin).toBe(20);
    });

    it('should parse cm margins', () => {
      const margin = LayoutHelper.parseMargin('2cm');
      expect(margin).toBe(20); // 2cm = 20mm
    });

    it('should parse inch margins', () => {
      const margin = LayoutHelper.parseMargin('1in');
      expect(margin).toBeCloseTo(25.4, 1); // 1 inch = 25.4mm
    });

    it('should parse unitless margins as mm', () => {
      const margin = LayoutHelper.parseMargin('20');
      expect(margin).toBe(20);
    });

    it('should handle invalid margin strings', () => {
      const margin = LayoutHelper.parseMargin('invalid');
      expect(margin).toBe(0);
    });
  });

  describe('CSS Generation', () => {
    it('should generate margin CSS', () => {
      const css = LayoutHelper.generateMarginCss({
        top: '10mm',
        bottom: '15mm',
      });

      expect(css).toContain('margin-top: 20mm'); // Default left
      expect(css).toContain('margin-bottom: 15mm');
      expect(css).toContain('margin-left: 15mm'); // Default
      expect(css).toContain('margin-right: 15mm'); // Default
    });

    it('should generate max-width style', () => {
      const style = LayoutHelper.generateMaxWidthStyle('A4', 'portrait');
      expect(style).toContain('max-width: 210mm');
    });

    it('should generate A4 container style', () => {
      const style = LayoutHelper.generateA4ContainerStyle();
      expect(style).toContain('width: 210mm');
      expect(style).toContain('min-height: 297mm');
      expect(style).toContain('padding: 20mm');
    });
  });

  describe('Table Styles', () => {
    it('should calculate table column widths', () => {
      const widths = LayoutHelper.calculateTableColumnWidths(4);
      expect(widths).toEqual(['25%', '25%', '25%', '25%']);
    });

    it('should calculate table column widths for 3 columns', () => {
      const widths = LayoutHelper.calculateTableColumnWidths(3);
      expect(widths).toEqual(['33.33333333333333%', '33.33333333333333%', '33.33333333333333%']);
    });

    it('should generate standard table style', () => {
      const style = LayoutHelper.generateTableStyle(false);
      expect(style).toContain('border-collapse: collapse');
      expect(style).toContain('padding: 8px 12px');
      expect(style).toContain('font-size: 10px');
    });

    it('should generate compact table style', () => {
      const style = LayoutHelper.generateTableStyle(true);
      expect(style).toContain('padding: 4px 8px');
      expect(style).toContain('font-size: 9px');
    });
  });

  describe('Section Styles', () => {
    it('should generate section style', () => {
      const style = LayoutHelper.generateSectionStyle(true, true);
      expect(style).toContain('margin-bottom: 20px');
      expect(style).toContain('border-bottom: 1px solid #ddd');
      expect(style).toContain('padding-bottom: 15px');
    });

    it('should generate section style without border', () => {
      const style = LayoutHelper.generateSectionStyle(false, true);
      expect(style).not.toContain('border-bottom');
      expect(style).toContain('padding-bottom: 15px');
    });

    it('should generate section title style', () => {
      const style = LayoutHelper.generateSectionTitleStyle();
      expect(style).toContain('font-size: 14px');
      expect(style).toContain('font-weight: 700');
      expect(style).toContain('background: #f5f5f5');
      expect(style).toContain('border-left: 4px solid #333');
    });
  });
});

describe('LayoutHelper Constants', () => {
  it('should have correct page size definitions', () => {
    expect(PAGE_SIZES.A4.portrait.width).toBe(210);
    expect(PAGE_SIZES.A4.portrait.height).toBe(297);
    expect(PAGE_SIZES.A3.portrait.width).toBe(297);
    expect(PAGE_SIZES.A3.portrait.height).toBe(420);
  });

  it('should have default margin definitions', () => {
    expect(DEFAULT_MARGINS.top).toBe('20mm');
    expect(DEFAULT_MARGINS.bottom).toBe('20mm');
    expect(DEFAULT_MARGINS.left).toBe('15mm');
    expect(DEFAULT_MARGINS.right).toBe('15mm');
  });
});

describe('LayoutHelper Edge Cases', () => {
  it('should handle zero columns', () => {
    const widths = LayoutHelper.calculateTableColumnWidths(0);
    expect(widths).toEqual([]);
  });

  it('should handle single column', () => {
    const widths = LayoutHelper.calculateTableColumnWidths(1);
    expect(widths).toEqual(['100%']);
  });

  it('should handle many columns', () => {
    const widths = LayoutHelper.calculateTableColumnWidths(10);
    expect(widths.length).toBe(10);
    expect(widths[0]).toBe('10%');
  });

  it('should handle decimal inch values', () => {
    const margin = LayoutHelper.parseMargin('0.5in');
    expect(margin).toBeCloseTo(12.7, 1); // 0.5 * 25.4
  });

  it('should handle very large margin values', () => {
    const margin = LayoutHelper.parseMargin('1000mm');
    expect(margin).toBe(1000);
  });
});
