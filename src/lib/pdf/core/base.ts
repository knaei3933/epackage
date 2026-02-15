/**
 * Base PDF Generator
 *
 * 基底PDFジェネレーター
 * - 全PDFジェネレーターの抽象基底クラス
 * - 共通機能の提供（Playwright管理、テンプレート処理）
 * - エラーハンドリングとバリデーション
 */

import * as fs from 'fs';
import * as path from 'path';
import { chromium as playwright, type Browser, type Page } from 'playwright';
import * as Handlebars from 'handlebars';
import type { PdfGenerationOptions, PdfGenerationResult } from '@/types/contract';

// ============================================================
// Types
// ============================================================

/**
 * テンプレートデータ型
 */
export type TemplateData = Record<string, unknown>;

/**
 * PDF生成コンテキスト
 */
export interface PdfGenerationContext {
  /** ブラウザインスタンス */
  browser?: Browser;
  /** ページインスタンス */
  page?: Page;
  /** テンプレート */
  template?: HandlebarsTemplateDelegate;
  /** テンプレートデータ */
  templateData?: TemplateData;
}

/**
 * PDFジェネレーターオプション
 */
export interface BasePdfGeneratorOptions {
  /** テンプレートパス */
  templatePath: string;
  /** デフォルトPDFオプション */
  defaultPdfOptions?: PdfGenerationOptions;
  /** カスタムCSS */
  customCss?: string;
  /** フォントURL */
  fontUrl?: string;
}

// ============================================================
// Abstract Base Class
// ============================================================

/**
 * 基底PDFジェネレーター抽象クラス
 * Abstract base class for all PDF generators
 */
export abstract class BasePdfGenerator<TInput = unknown, TOutput = PdfGenerationResult> {
  protected readonly templatePath: string;
  protected readonly defaultPdfOptions: Required<PdfGenerationOptions>;
  protected readonly customCss?: string;
  protected readonly fontUrl?: string;

  // キャッシュ
  private templateCache?: HandlebarsTemplateDelegate;

  constructor(options: BasePdfGeneratorOptions) {
    this.templatePath = options.templatePath;
    this.customCss = options.customCss;
    this.fontUrl = options.fontUrl;

    // デフォルトPDFオプションの設定
    this.defaultPdfOptions = {
      format: options.defaultPdfOptions?.format || 'A4',
      orientation: options.defaultPdfOptions?.orientation || 'portrait',
      displayHeaderFooter: options.defaultPdfOptions?.displayHeaderFooter || false,
      printBackground: options.defaultPdfOptions?.printBackground !== false,
      outputPath: options.defaultPdfOptions?.outputPath || '',
    } as Required<PdfGenerationOptions>;
  }

  // ============================================================
  // Abstract Methods (Must be implemented by subclasses)
  // ============================================================

  /**
   * 入力データをテンプレートデータに変換
   * Convert input data to template data
   */
  protected abstract prepareTemplateData(data: TInput): TemplateData;

  /**
   * 入力データをバリデート
   * Validate input data
   */
  protected abstract validateData(data: TInput): { isValid: boolean; errors: string[] };

  // ============================================================
  // Template Management
  // ============================================================

  /**
   * テンプレートを読み込んでコンパイル
   * Load and compile template
   */
  protected async loadTemplate(): Promise<HandlebarsTemplateDelegate> {
    // キャッシュがあれば返す
    if (this.templateCache) {
      return this.templateCache;
    }

    // ファイルの存在確認
    if (!fs.existsSync(this.templatePath)) {
      throw new Error(`Template not found: ${this.templatePath}`);
    }

    // テンプレートを読み込んでコンパイル
    const templateContent = await fs.promises.readFile(this.templatePath, 'utf-8');
    this.templateCache = Handlebars.compile(templateContent);
    return this.templateCache;
  }

  /**
   * デフォルトテンプレートを取得（オーバーライド可能）
   * Get default template (can be overridden)
   */
  protected getDefaultTemplate(): HandlebarsTemplateDelegate {
    const template = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}}</title>
  ${this.getFontImport()}
  <style>
    ${this.getBaseStyles()}
    ${this.customCss || ''}
  </style>
</head>
<body>
  <div class="container">
    {{#each content}}
      {{{this}}}
    {{/each}}
  </div>
</body>
</html>
    `;
    return Handlebars.compile(template);
  }

  // ============================================================
  // Font Management
  // ============================================================

  /**
   * フォントインポートCSSを生成
   * Generate font import CSS
   */
  protected getFontImport(): string {
    if (this.fontUrl) {
      return `@import url('${this.fontUrl}');`;
    }
    // デフォルト: Google Fonts - Noto Sans JP
    return "@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap');";
  }

  /**
   * ベーススタイルを取得
   * Get base styles
   */
  protected getBaseStyles(): string {
    return `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: 'Noto Sans JP', sans-serif;
        font-size: 10px;
        line-height: 1.6;
        color: #333;
        padding: 20px;
      }

      .container {
        max-width: 210mm;
        margin: 0 auto;
      }

      h1, h2, h3, h4, h5, h6 {
        font-weight: 700;
        margin-bottom: 0.5em;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 1em;
      }

      table th,
      table td {
        border: 1px solid #ddd;
        padding: 8px 12px;
        text-align: left;
      }

      table th {
        background: #f9f9f9;
        font-weight: 500;
      }

      .section {
        margin-bottom: 20px;
      }

      .section-title {
        font-size: 12px;
        font-weight: 700;
        background: #f5f5f5;
        padding: 8px 12px;
        margin-bottom: 10px;
        border-left: 4px solid #333;
      }
    `;
  }

  // ============================================================
  // PDF Generation
  // ============================================================

  /**
   * PDFを生成
   * Generate PDF
   */
  async generate(data: TInput, options: PdfGenerationOptions = {}): Promise<TOutput> {
    // データをバリデート
    const validation = this.validateData(data);
    if (!validation.isValid) {
      return this.createErrorResult(`Validation failed: ${validation.errors.join(', ')}`) as TOutput;
    }

    // オプションをマージ
    const opts = { ...this.defaultPdfOptions, ...options };

    // コンテキストを初期化
    const context: PdfGenerationContext = {};

    try {
      // テンプレートを読み込む
      context.template = await this.loadTemplate();

      // テンプレートデータを準備
      context.templateData = this.prepareTemplateData(data);

      // HTMLを生成
      const html = context.template(context.templateData);

      // ブラウザを起動
      context.browser = await playwright.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      context.page = await context.browser.newPage();

      // カスタムCSSを注入
      if (this.customCss) {
        await context.page.addStyleTag({ content: this.customCss });
      }

      // コンテンツを設定
      await context.page.setContent(html, {
        waitUntil: 'networkidle',
        timeout: 30000,
      });

      // PDFを生成
      const pdfBuffer = await context.page.pdf({
        format: opts.format,
        orientation: opts.orientation as 'portrait' | 'landscape',
        displayHeaderFooter: opts.displayHeaderFooter,
        printBackground: opts.printBackground,
        margin: opts.margin,
      });

      // ファイルに保存
      if (opts.outputPath) {
        await fs.promises.mkdir(path.dirname(opts.outputPath), { recursive: true });
        await fs.promises.writeFile(opts.outputPath, pdfBuffer);
      }

      // 成功結果を返す
      return this.createSuccessResult(Buffer.from(pdfBuffer), opts.outputPath, {
        generatedAt: new Date().toISOString(),
        fileSize: pdfBuffer.length,
      }) as TOutput;

    } catch (error) {
      return this.createErrorResult(
        error instanceof Error ? error.message : 'Unknown error'
      ) as TOutput;
    } finally {
      // クリーンアップ
      await this.cleanup(context);
    }
  }

  /**
   * Base64エンコードされたPDFを生成
   * Generate base64 encoded PDF
   */
  async generateBase64(data: TInput): Promise<{ success: boolean; base64?: string; error?: string }> {
    const result = await this.generate(data);

    if (!this.isSuccessResult(result)) {
      return {
        success: false,
        error: (result as any).error,
      };
    }

    const buffer = (result as any).buffer;
    if (!buffer) {
      return {
        success: false,
        error: 'No buffer in result',
      };
    }

    return {
      success: true,
      base64: buffer.toString('base64'),
    };
  }

  // ============================================================
  // Result Creation Helpers
  // ============================================================

  /**
   * 成功結果を作成
   * Create success result
   */
  protected createSuccessResult(
    buffer: Buffer,
    filePath?: string,
    metadata?: Record<string, unknown>
  ): PdfGenerationResult {
    const result: PdfGenerationResult = {
      success: true,
      buffer,
    };

    if (filePath) {
      result.filePath = filePath;
    }

    if (metadata) {
      result.metadata = metadata;
    }

    return result;
  }

  /**
   * エラー結果を作成
   * Create error result
   */
  protected createErrorResult(error: string): PdfGenerationResult {
    return {
      success: false,
      error,
    };
  }

  /**
   * 成功結果かどうかチェック
   * Check if result is successful
   */
  protected isSuccessResult(result: unknown): boolean {
    return typeof result === 'object' && result !== null && (result as any).success === true;
  }

  // ============================================================
  // Cleanup
  // ============================================================

  /**
   * リソースをクリーンアップ
   * Cleanup resources
   */
  protected async cleanup(context: PdfGenerationContext): Promise<void> {
    if (context.page) {
      await context.page.close().catch(() => {});
    }
    if (context.browser) {
      await context.browser.close().catch(() => {});
    }
  }

  // ============================================================
  // Utility Methods
  // ============================================================

  /**
   * 日本の日付フォーマット（和暦）
   * Format Japanese date with era
   */
  protected formatJapaneseDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    const eras = [
      { name: '明治', start: new Date(1868, 8, 8), end: new Date(1912, 6, 29) },
      { name: '大正', start: new Date(1912, 7, 29), end: new Date(1926, 11, 24) },
      { name: '昭和', start: new Date(1926, 11, 24), end: new Date(1989, 0, 7) },
      { name: '平成', start: new Date(1989, 0, 8), end: new Date(2019, 3, 30) },
      { name: '令和', start: new Date(2019, 4, 1), end: new Date(2030, 11, 31) },
    ];

    const era = eras.find(e => dateObj >= e.start && dateObj <= e.end);
    if (era) {
      const year = dateObj.getFullYear() - era.start.getFullYear() + 1;
      return `${era.name}${year}年${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;
    }

    // 西暦フォールバック
    return `${dateObj.getFullYear()}年${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;
  }

  /**
   * 日本円フォーマット
   * Format Japanese currency
   */
  protected formatCurrency(amount: number, currency: 'JPY' | 'USD' = 'JPY'): string {
    const symbol = currency === 'JPY' ? '¥' : '$';
    return `${symbol}${amount.toLocaleString('ja-JP')}`;
  }

  /**
   * PDFサイズを見積もり
   * Estimate PDF file size
   */
  protected abstract estimateSize(data: TInput): number;
}
