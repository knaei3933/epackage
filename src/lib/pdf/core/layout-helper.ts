/**
 * Layout Helper
 *
 * レイアウトヘルパー
 * - PDFレイアウトユーティリティ
 * - マージン計算
 * - ページサイズ計算
 */

// ============================================================
// Types
// ============================================================

/**
 * ページサイズ
 */
export type PageSize = 'A4' | 'A3' | 'Letter' | 'Legal';

/**
 * 向き
 */
export type Orientation = 'portrait' | 'landscape';

/**
 * マージン定義
 */
export interface Margins {
  top: string;
  bottom: string;
  left: string;
  right: string;
}

/**
 * ページ寸法（mm）
 */
export interface PageDimensions {
  width: number;
  height: number;
}

// ============================================================
// Page Size Definitions
// ============================================================

/**
 * ページサイズ定義（mm単位）
 */
export const PAGE_SIZES: Record<PageSize, { portrait: PageDimensions; landscape: PageDimensions }> = {
  A4: {
    portrait: { width: 210, height: 297 },
    landscape: { width: 297, height: 210 },
  },
  A3: {
    portrait: { width: 297, height: 420 },
    landscape: { width: 420, height: 297 },
  },
  Letter: {
    portrait: { width: 215.9, height: 279.4 },
    landscape: { width: 279.4, height: 215.9 },
  },
  Legal: {
    portrait: { width: 215.9, height: 355.6 },
    landscape: { width: 355.6, height: 215.9 },
  },
};

/**
 * デフォルトマージン（mm単位）
 */
export const DEFAULT_MARGINS: Margins = {
  top: '20mm',
  bottom: '20mm',
  left: '15mm',
  right: '15mm',
};

// ============================================================
// Layout Helper Class
// ============================================================

/**
 * レイアウトヘルパークラス
 * Layout helper class
 */
export class LayoutHelper {
  /**
   * ページ寸法を取得
   * Get page dimensions
   */
  static getPageDimensions(
    pageSize: PageSize = 'A4',
    orientation: Orientation = 'portrait'
  ): PageDimensions {
    return PAGE_SIZES[pageSize][orientation];
  }

  /**
   * コンテンツ幅を計算（mm単位）
   * Calculate content width
   */
  static calculateContentWidth(
    pageSize: PageSize = 'A4',
    orientation: Orientation = 'portrait',
    marginLeft: string = DEFAULT_MARGINS.left,
    marginRight: string = DEFAULT_MARGINS.right
  ): number {
    const dimensions = this.getPageDimensions(pageSize, orientation);

    // マージンをパース（"20mm" -> 20）
    const left = this.parseMargin(marginLeft);
    const right = this.parseMargin(marginRight);

    return dimensions.width - left - right;
  }

  /**
   * コンテンツ高さを計算（mm単位）
   * Calculate content height
   */
  static calculateContentHeight(
    pageSize: PageSize = 'A4',
    orientation: Orientation = 'portrait',
    marginTop: string = DEFAULT_MARGINS.top,
    marginBottom: string = DEFAULT_MARGINS.bottom
  ): number {
    const dimensions = this.getPageDimensions(pageSize, orientation);

    // マージンをパース（"20mm" -> 20）
    const top = this.parseMargin(marginTop);
    const bottom = this.parseMargin(marginBottom);

    return dimensions.height - top - bottom;
  }

  /**
   * マージン文字列をパース
   * Parse margin string
   */
  static parseMargin(margin: string): number {
    // 数値に変換（"20mm" -> 20）
    const match = margin.match(/^([\d.]+)(mm|cm|in)?$/);
    if (!match) {
      return 0;
    }

    const value = parseFloat(match[1]);
    const unit = match[2] || 'mm';

    // mmに変換
    switch (unit) {
      case 'cm':
        return value * 10;
      case 'in':
        return value * 25.4;
      case 'mm':
      default:
        return value;
    }
  }

  /**
   * マージンCSSを生成
   * Generate margin CSS
   */
  static generateMarginCss(margins: Partial<Margins> = {}): string {
    const merged: Margins = {
      top: margins.top || DEFAULT_MARGINS.top,
      bottom: margins.bottom || DEFAULT_MARGINS.bottom,
      left: margins.left || DEFAULT_MARGINS.left,
      right: margins.right || DEFAULT_MARGINS.right,
    };

    return `
      margin-top: ${merged.top};
      margin-bottom: ${merged.bottom};
      margin-left: ${merged.left};
      margin-right: ${merged.right};
    `.trim();
  }

  /**
   * 最大幅スタイルを生成
   * Generate max-width style
   */
  static generateMaxWidthStyle(
    pageSize: PageSize = 'A4',
    orientation: Orientation = 'portrait'
  ): string {
    const dimensions = this.getPageDimensions(pageSize, orientation);
    return `max-width: ${dimensions.width}mm;`;
  }

  /**
   * A4サイズのコンテナスタイルを生成
   * Generate A4 container style
   */
  static generateA4ContainerStyle(): string {
    return `
      width: 210mm;
      min-height: 297mm;
      padding: 20mm;
      margin: 0 auto;
      background: white;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    `.trim();
  }

  /**
   * テーブル幅パーセンテージを計算
   * Calculate table width percentage
   */
  static calculateTableColumnWidths(columnCount: number): string[] {
    const width = 100 / columnCount;
    return Array(columnCount).fill(`${width}%`);
  }

  /**
   * 段レイアウトスタイルを生成
   * Generate section layout style
   */
  static generateSectionStyle(
    withBorder: boolean = true,
    withPadding: boolean = true
  ): string {
    return `
      margin-bottom: 20px;
      ${withBorder ? 'border-bottom: 1px solid #ddd;' : ''}
      ${withPadding ? 'padding-bottom: 15px;' : ''}
    `.trim();
  }

  /**
   * セクションタイトルスタイルを生成
   * Generate section title style
   */
  static generateSectionTitleStyle(): string {
    return `
      font-size: 14px;
      font-weight: 700;
      color: #333;
      background: #f5f5f5;
      padding: 8px 12px;
      margin-bottom: 10px;
      border-left: 4px solid #333;
    `.trim();
  }

  /**
   * テーブルスタイルを生成
   * Generate table style
   */
  static generateTableStyle(compact: boolean = false): string {
    const padding = compact ? '4px 8px' : '8px 12px';
    const fontSize = compact ? '9px' : '10px';

    return `
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 10px;
      font-size: ${fontSize};

      th,
      td {
        border: 1px solid #ddd;
        padding: ${padding};
        text-align: left;
      }

      th {
        background: #f9f9f9;
        font-weight: 500;
      }

      tbody tr:nth-child(even) {
        background: #fafafa;
      }
    `.trim();
  }
}
