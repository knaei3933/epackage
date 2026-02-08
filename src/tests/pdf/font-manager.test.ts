/**
 * Font Manager Tests
 *
 * フォントマネージャーテスト
 * - Google Fonts管理
 * - 日本語フォント設定
 * - フォント切り替え
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  FontManager,
  PREDEFINED_FONTS,
} from '@/lib/pdf/core/font-manager';
import type { FontDefinition } from '@/lib/pdf/core/font-manager';

// ============================================================
// Tests
// ============================================================

describe('FontManager', () => {
  let manager: FontManager;

  beforeEach(() => {
    manager = new FontManager();
  });

  describe('Initialization', () => {
    it('should initialize with default font (Noto Sans JP)', () => {
      const font = manager.getFont();
      expect(font.name).toBe('Noto Sans JP');
      expect(font.family).toBe("'Noto Sans JP', sans-serif");
    });

    it('should have Google Fonts enabled by default', () => {
      const importCss = manager.getFontImport();
      expect(importCss).toContain('fonts.googleapis.com');
    });
  });

  describe('Font Selection', () => {
    it('should switch to predefined font by key', () => {
      manager.setFont('zenMaruGothic');
      const font = manager.getFont();
      expect(font.name).toBe('Zen Maru Gothic');
    });

    it('should accept custom font definition', () => {
      const customFont: FontDefinition = {
        name: 'Custom Font',
        url: 'https://example.com/font.css',
        family: "'Custom Font', sans-serif",
        weights: [400],
      };

      manager.setFont(customFont);
      const font = manager.getFont();
      expect(font.name).toBe('Custom Font');
      expect(font.url).toBe('https://example.com/font.css');
    });

    it('should throw error for unknown font key', () => {
      expect(() => manager.setFont('unknownFont')).toThrow('Unknown font key');
    });
  });

  describe('Font Family Generation', () => {
    it('should generate correct font family for Google Fonts', () => {
      const family = manager.getFontFamily();
      expect(family).toBe("'Noto Sans JP', sans-serif");
    });

    it('should use system fonts when enabled', () => {
      const systemFontManager = new FontManager({ useSystemFonts: true });
      const family = systemFontManager.getFontFamily();
      expect(family).toContain('Yu Gothic');
      expect(family).toContain('sans-serif');
    });
  });

  describe('Font Import CSS Generation', () => {
    it('should generate @import CSS for Google Fonts', () => {
      const importCss = manager.getFontImport();
      expect(importCss).toContain('@import url');
      expect(importCss).toContain('fonts.googleapis.com');
    });

    it('should return empty string when using system fonts', () => {
      const systemFontManager = new FontManager({ useSystemFonts: true });
      const importCss = systemFontManager.getFontImport();
      expect(importCss).toBe('');
    });

    it('should return empty string when Google Fonts disabled', () => {
      const noGoogleFontManager = new FontManager({ useGoogleFonts: false });
      const importCss = noGoogleFontManager.getFontImport();
      expect(importCss).toBe('');
    });
  });

  describe('CSS Generation', () => {
    it('should generate complete font CSS', () => {
      const css = manager.generateFontCss();
      expect(css).toContain('@import');
      expect(css).toContain('font-family');
    });

    it('should include custom font in CSS', () => {
      manager.setFont('zenMaruGothic');
      const css = manager.generateFontCss();
      expect(css).toContain('Zen Maru Gothic');
    });
  });

  describe('Static Methods', () => {
    it('should return list of available fonts', () => {
      const fonts = FontManager.getAvailableFonts();
      expect(fonts).toContain('notoSansJP');
      expect(fonts).toContain('notoSerifJP');
      expect(fonts).toContain('zenKakuGothic');
      expect(fonts).toContain('zenMaruGothic');
      expect(fonts).toContain('sawarabiGothic');
    });

    it('should return recommended font', () => {
      const recommended = FontManager.getRecommendedFont();
      expect(recommended.name).toBe('Noto Sans JP');
    });
  });

  describe('Predefined Fonts', () => {
    it('should have correct font definitions', () => {
      expect(PREDEFINED_FONTS.notoSansJP.name).toBe('Noto Sans JP');
      expect(PREDEFINED_FONTS.notoSerifJP.name).toBe('Noto Serif JP');
      expect(PREDEFINED_FONTS.zenKakuGothic.name).toBe('Zen Kaku Gothic New');
      expect(PREDEFINED_FONTS.zenMaruGothic.name).toBe('Zen Maru Gothic');
      expect(PREDEFINED_FONTS.sawarabiGothic.name).toBe('Sawarabi Gothic');
    });

    it('should have correct URLs for predefined fonts', () => {
      expect(PREDEFINED_FONTS.notoSansJP.url).toContain('fonts.googleapis.com');
      expect(PREDEFINED_FONTS.notoSerifJP.url).toContain('fonts.googleapis.com');
    });

    it('should have Japanese subsets', () => {
      expect(PREDEFINED_FONTS.notoSansJP.subsets).toContain('japanese');
      expect(PREDEFINED_FONTS.notoSansJP.subsets).toContain('latin');
    });
  });
});

describe('FontManager Edge Cases', () => {
  it('should handle empty font definition', () => {
    const manager = new FontManager();
    expect(() => manager.setFont({} as FontDefinition)).not.toThrow();
  });

  it('should handle font with no weights', () => {
    const manager = new FontManager();
    const fontWithNoWeights: FontDefinition = {
      name: 'No Weights',
      url: 'https://example.com/font.css',
      family: 'sans-serif',
      weights: [],
    };
    manager.setFont(fontWithNoWeights);
    expect(manager.getFont().weights).toEqual([]);
  });

  it('should handle font switching multiple times', () => {
    const manager = new FontManager();
    manager.setFont('zenMaruGothic');
    expect(manager.getFont().name).toBe('Zen Maru Gothic');

    manager.setFont('notoSerifJP');
    expect(manager.getFont().name).toBe('Noto Serif JP');

    manager.setFont('notoSansJP');
    expect(manager.getFont().name).toBe('Noto Sans JP');
  });
});
