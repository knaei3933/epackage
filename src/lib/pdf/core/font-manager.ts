/**
 * Font Manager
 *
 * フォント管理者
 * - Google Fonts管理
 * - 日本語フォント設定
 * - フォントキャッシュ
 */

// ============================================================
// Types
// ============================================================

/**
 * フォント定義
 */
export interface FontDefinition {
  /** フォント名 */
  name: string;
  /** Google Fonts URL */
  url: string;
  /** フォントファミリー名 */
  family: string;
  /** 利用可能なウェイト */
  weights: number[];
  /** サブセット */
  subsets?: string[];
}

/**
 * フォントオプション
 */
export interface FontOptions {
  /** カスタムフォント */
  customFont?: FontDefinition;
  /** Google Fontsを使用するか */
  useGoogleFonts?: boolean;
  /** システムフォントを使用するか */
  useSystemFonts?: boolean;
}

// ============================================================
// Font Definitions
// ============================================================

/**
 * 定義済みフォント
 */
export const PREDEFINED_FONTS: Record<string, FontDefinition> = {
  notoSansJP: {
    name: 'Noto Sans JP',
    url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap',
    family: "'Noto Sans JP', sans-serif",
    weights: [400, 500, 700],
    subsets: ['japanese', 'latin'],
  },
  notoSerifJP: {
    name: 'Noto Serif JP',
    url: 'https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;500;700&display=swap',
    family: "'Noto Serif JP', serif",
    weights: [400, 500, 700],
    subsets: ['japanese', 'latin'],
  },
  zenKakuGothic: {
    name: 'Zen Kaku Gothic New',
    url: 'https://fonts.googleapis.com/css2?family=Zen+Kaku+Gothic+New:wght@400;500;700&display=swap',
    family: "'Zen Kaku Gothic New', sans-serif",
    weights: [400, 500, 700],
    subsets: ['japanese', 'latin'],
  },
  zenMaruGothic: {
    name: 'Zen Maru Gothic',
    url: 'https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@400;500;700&display=swap',
    family: "'Zen Maru Gothic', sans-serif",
    weights: [400, 500, 700],
    subsets: ['japanese', 'latin'],
  },
  sawarabiGothic: {
    name: 'Sawarabi Gothic',
    url: 'https://fonts.googleapis.com/css2?family=Sawarabi+Gothic:wght@400;500;700&display=swap',
    family: "'Sawarabi Gothic', sans-serif",
    weights: [400, 500, 700],
    subsets: ['japanese', 'latin'],
  },
};

// ============================================================
// Font Manager Class
// ============================================================

/**
 * フォントマネージャークラス
 * Font manager class
 */
export class FontManager {
  private currentFont: FontDefinition;
  private useGoogleFonts: boolean;
  private useSystemFonts: boolean;

  constructor(options: FontOptions = {}) {
    this.useGoogleFonts = options.useGoogleFonts !== false;
    this.useSystemFonts = options.useSystemFonts || false;
    this.currentFont = options.customFont || PREDEFINED_FONTS.notoSansJP;
  }

  /**
   * フォントを設定
   * Set font
   */
  setFont(fontKey: string): void;
  setFont(fontDefinition: FontDefinition): void;
  setFont(font: string | FontDefinition): void {
    if (typeof font === 'string') {
      if (PREDEFINED_FONTS[font]) {
        this.currentFont = PREDEFINED_FONTS[font];
      } else {
        throw new Error(`Unknown font key: ${font}`);
      }
    } else {
      this.currentFont = font;
    }
  }

  /**
   * 現在のフォントを取得
   * Get current font
   */
  getFont(): FontDefinition {
    return this.currentFont;
  }

  /**
   * フォントファミリーCSSを生成
   * Generate font family CSS
   */
  getFontFamily(): string {
    if (this.useSystemFonts) {
      return '"Yu Gothic", "Yu Mincho", "Hiragino Sans", "Hiragino Kaku Gothic ProN", "MS PGothic", sans-serif';
    }
    return this.currentFont.family;
  }

  /**
   * フォントインポートCSSを生成
   * Generate font import CSS
   */
  getFontImport(): string {
    if (this.useSystemFonts) {
      return '';
    }

    if (!this.useGoogleFonts) {
      return '';
    }

    return `@import url('${this.currentFont.url}');`;
  }

  /**
   * フォント定義済みキー一覧を取得
   * Get list of predefined font keys
   */
  static getAvailableFonts(): string[] {
    return Object.keys(PREDEFINED_FONTS);
  }

  /**
   * 日本語PDF推奨フォントを取得
   * Get recommended font for Japanese PDFs
   */
  static getRecommendedFont(): FontDefinition {
    return PREDEFINED_FONTS.notoSansJP;
  }

  /**
   * フォントCSSを生成
   * Generate font CSS
   */
  generateFontCss(): string {
    return `
      ${this.getFontImport()}

      body {
        font-family: ${this.getFontFamily()};
      }
    `.trim();
  }
}
