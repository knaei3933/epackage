/**
 * Template Manager
 *
 * テンプレート管理者
 * - HTMLテンプレート管理
 * - テンプレートキャッシュ
 * - テンプレートヘルパー関数
 */

import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';

// ============================================================
// Types
// ============================================================

/**
 * テンプレートソースタイプ
 */
export type TemplateSource = 'file' | 'string' | 'inline';

/**
 * テンプレート定義
 */
export interface TemplateDefinition {
  /** テンプレートID */
  id: string;
  /** テンプレート名 */
  name: string;
  /** ソースタイプ */
  sourceType: TemplateSource;
  /** ファイルパス（sourceType='file'の場合） */
  filePath?: string;
  /** テンプレート文字列（sourceType='string'の場合） */
  templateString?: string;
  /** 説明 */
  description?: string;
}

/**
 * テンプレートオプション
 */
export interface TemplateOptions {
  /** キャッシュを有効にするか */
  enableCache?: boolean;
  /** カスタムヘルパー関数 */
  helpers?: Record<string, (...args: unknown[]) => string>;
}

// ============================================================
// Template Manager Class
// ============================================================

/**
 * テンプレートマネージャークラス
 * Template manager class
 */
export class TemplateManager {
  private templates: Map<string, HandlebarsTemplateDelegate>;
  private templateDefinitions: Map<string, TemplateDefinition>;
  private enableCache: boolean;

  constructor(options: TemplateOptions = {}) {
    this.templates = new Map();
    this.templateDefinitions = new Map();
    this.enableCache = options.enableCache !== false;

    // デフォルトヘルパーを登録
    this.registerDefaultHelpers();

    // カスタムヘルパーを登録
    if (options.helpers) {
      this.registerHelpers(options.helpers);
    }
  }

  // ============================================================
  // Template Registration
  // ============================================================

  /**
   * テンプレートを登録
   * Register template
   */
  registerTemplate(definition: TemplateDefinition): void {
    this.templateDefinitions.set(definition.id, definition);

    // キャッシュが無効ならクリア
    if (!this.enableCache) {
      this.templates.delete(definition.id);
    }
  }

  /**
   * テンプレートをファイルから登録
   * Register template from file
   */
  registerTemplateFromFile(id: string, filePath: string, name?: string): void {
    this.registerTemplate({
      id,
      name: name || id,
      sourceType: 'file',
      filePath,
    });
  }

  /**
   * テンプレートを文字列から登録
   * Register template from string
   */
  registerTemplateFromString(id: string, templateString: string, name?: string): void {
    this.registerTemplate({
      id,
      name: name || id,
      sourceType: 'string',
      templateString,
    });
  }

  // ============================================================
  // Template Loading
  // ============================================================

  /**
   * テンプレートを取得
   * Get template
   */
  async getTemplate(id: string): Promise<HandlebarsTemplateDelegate> {
    // キャッシュチェック
    if (this.templates.has(id)) {
      return this.templates.get(id)!;
    }

    // 定義チェック
    const definition = this.templateDefinitions.get(id);
    if (!definition) {
      throw new Error(`Template not found: ${id}`);
    }

    // テンプレートを読み込んでコンパイル
    let templateSource: string;

    switch (definition.sourceType) {
      case 'file':
        if (!definition.filePath) {
          throw new Error(`Template file path not specified for: ${id}`);
        }

        // ファイルの存在確認
        if (!fs.existsSync(definition.filePath)) {
          throw new Error(`Template file not found: ${definition.filePath}`);
        }

        templateSource = await fs.promises.readFile(definition.filePath, 'utf-8');
        break;

      case 'string':
        templateSource = definition.templateString || '';
        break;

      case 'inline':
        templateSource = this.getInlineTemplate(id);
        break;

      default:
        throw new Error(`Unknown template source type: ${definition.sourceType}`);
    }

    // コンパイル
    const template = Handlebars.compile(templateSource);

    // キャッシュ
    if (this.enableCache) {
      this.templates.set(id, template);
    }

    return template;
  }

  /**
   * インラインテンプレートを取得
   * Get inline template
   */
  protected getInlineTemplate(id: string): string {
    // サブクラスでオーバーライド可能
    return `<!-- Inline Template: ${id} -->`;
  }

  // ============================================================
  // Helper Registration
  // ============================================================

  /**
   * ヘルパー関数を登録
   * Register helper functions
   */
  registerHelpers(helpers: Record<string, (...args: unknown[]) => string>): void {
    Object.entries(helpers).forEach(([name, helper]) => {
      Handlebars.registerHelper(name, helper);
    });
  }

  /**
   * デフォルトヘルパーを登録
   * Register default helpers
   */
  protected registerDefaultHelpers(): void {
    // 日本語フォーマットヘルパー
    Handlebars.registerHelper('formatYen', (amount: number) => {
      return `¥${amount.toLocaleString('ja-JP')}`;
    });

    Handlebars.registerHelper('formatJapaneseDate', (date: string | Date) => {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return `${dateObj.getFullYear()}年${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;
    });

    // 条件ヘルパー
    Handlebars.registerHelper('eq', (a: unknown, b: unknown) => {
      return a === b;
    });

    Handlebars.registerHelper('ne', (a: unknown, b: unknown) => {
      return a !== b;
    });

    Handlebars.registerHelper('gt', (a: number, b: number) => {
      return a > b;
    });

    Handlebars.registerHelper('lt', (a: number, b: number) => {
      return a < b;
    });

    // 配列ヘルパー
    Handlebars.registerHelper('length', (array: unknown[]) => {
      return array ? array.length : 0;
    });

    // 文字列ヘルパー
    Handlebars.registerHelper('truncate', (str: string, length: number) => {
      if (!str) return '';
      return str.length > length ? str.substring(0, length) + '...' : str;
    });

    // 繰り返しヘルパー
    Handlebars.registerHelper('repeat', (count: number, options: Handlebars.HelperOptions) => {
      let result = '';
      for (let i = 0; i < count; i++) {
        result += options.fn({ index: i, ...options.hash });
      }
      return result;
    });
  }

  // ============================================================
  // Cache Management
  // ============================================================

  /**
   * キャッシュをクリア
   * Clear cache
   */
  clearCache(): void {
    this.templates.clear();
  }

  /**
   * 特定テンプレートのキャッシュをクリア
   * Clear specific template cache
   */
  clearTemplateCache(id: string): void {
    this.templates.delete(id);
  }

  // ============================================================
  // Utility
  // ============================================================

  /**
   * 登録済みテンプレートID一覧を取得
   * Get list of registered template IDs
   */
  getRegisteredTemplateIds(): string[] {
    return Array.from(this.templateDefinitions.keys());
  }

  /**
   * テンプレートが登録されているかチェック
   * Check if template is registered
   */
  hasTemplate(id: string): boolean {
    return this.templateDefinitions.has(id);
  }
}
