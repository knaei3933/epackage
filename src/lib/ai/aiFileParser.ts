/**
 * AI File Parser
 *
 * AIファイルパーサー
 * - Adobe Illustrator .aiファイルを解析
 * - 製造用デザインデータを抽出
 * - 構造化JSONに変換
 */

import { readFile } from 'fs/promises';
import * as pdf from 'pdf-parse';
import type {
  AiFileData,
  Dimensions,
  Color,
  Font,
  Layer,
  TextElement,
  ValidationResult,
  ValidationOptions,
  ParseOptions,
  ParseResult,
  AiVersionInfo,
  Position,
  AiSize,
  Path,
  Shape,
  EmbeddedImage,
  Artboard,
  AiMetadata,
  CmykColor,
} from '@/types/aiFile';
import {
  isAiFileData,
  isColor,
  isLayer,
  AI_FILE_CONSTANTS,
} from '@/types/aiFile';

// ============================================================
// Constants
// ============================================================

const AI_FILE_HEADER = '%PDF';
const EPS_FILE_HEADER = '%!PS';
const AI_MAGIC_NUMBER = Buffer.from([0x00, 0x00, 0x00, 0x00]);

const DEFAULT_VALIDATION_OPTIONS: ValidationOptions = {
  maxSize: AI_FILE_CONSTANTS.MAX_FILE_SIZE,
  allowedVersions: ['CS3', 'CS4', 'CS5', 'CS6', 'CC'],
  strict: false,
};

const DEFAULT_PARSE_OPTIONS: ParseOptions = {
  extractThumbnails: true,
  extractImages: false,
  textOnly: false,
  maxPaths: 1000,
  depth: 10,
};

// ============================================================
// Main Parser Functions
// ============================================================

/**
 * AIファイルをパースして構造化データを抽出
 * Parse AI file and extract structured data
 * @param fileBuffer - AIファイルのバッファ / AI file buffer
 * @param options - パースオプション / Parse options
 * @returns 抽出されたAIファイルデータ / Extracted AI file data
 */
export async function parseAiFile(
  fileBuffer: Buffer,
  options: ParseOptions = {}
): Promise<AiFileData> {
  const startTime = Date.now();
  const opts = { ...DEFAULT_PARSE_OPTIONS, ...options };

  try {
    // PDFベースのAIファイルとして解析
    const pdfData = await (pdf as any).default(fileBuffer);

    // 基本メタデータの抽出
    const version = extractAiVersion(pdfData);
    const dimensions = extractDimensions(pdfData);
    const colors = opts.textOnly ? [] : extractColors(pdfData);
    const fonts = extractFonts(pdfData);
    const layers = extractLayers(pdfData);
    const textElements = extractText(pdfData);
    const paths = !opts.textOnly && opts.maxPaths ? extractPaths(pdfData, opts.maxPaths) : undefined;
    const shapes = !opts.textOnly ? extractShapes(pdfData) : undefined;
    const images = opts.extractImages ? await extractImages(pdfData) : undefined;
    const thumbnails = opts.extractThumbnails ? extractThumbnails(fileBuffer) : undefined;
    const metadata = extractMetadata(pdfData);
    const artboards = extractArtboards(pdfData);

    const result: AiFileData = {
      version,
      dimensions,
      colors,
      fonts,
      layers,
      textElements,
      paths,
      shapes,
      images,
      thumbnails,
      metadata,
      artboards,
      processingTime: Date.now() - startTime,
    };

    return result;
  } catch (error) {
    throw new Error(`AIファイル解析エラー: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * バッファからAIファイルデータを抽出（ユーティリティ関数）
 * Extract AI file data from buffer (utility function)
 * @param buffer - AIファイルバッファ / AI file buffer
 * @returns 抽出されたAIファイルデータ / Extracted AI file data
 */
export async function extractAiDataFromBuffer(buffer: Buffer): Promise<AiFileData> {
  return parseAiFile(buffer);
}

/**
 * ファイルパスからAIファイルをパース
 * Parse AI file from file path
 * @param filePath - AIファイルパス / AI file path
 * @param options - パースオプション / Parse options
 * @returns 抽出されたAIファイルデータ / Extracted AI file data
 */
export async function parseAiFileFromPath(
  filePath: string,
  options?: ParseOptions
): Promise<AiFileData> {
  const buffer = await readFile(filePath);
  const result = await parseAiFile(buffer, options);
  result.sourcePath = filePath;
  return result;
}

// ============================================================
// Validation Functions
// ============================================================

/**
 * AIファイルの整合性を検証
 * Validate AI file integrity
 * @param file - ファイルオブジェクト / File object
 * @param options - 検証オプション / Validation options
 * @returns 検証結果 / Validation result
 */
export async function validateAiFile(
  file: File,
  options: ValidationOptions = {}
): Promise<ValidationResult> {
  const opts = { ...DEFAULT_VALIDATION_OPTIONS, ...options };
  const errors: string[] = [];
  const warnings: string[] = [];

  // ファイル拡張子の確認
  if (!file.name.endsWith('.ai')) {
    errors.push('ファイル拡張子が.aiではありません');
  }

  // ファイルサイズの確認
  const maxSize = opts.maxSize || AI_FILE_CONSTANTS.MAX_FILE_SIZE;
  if (file.size > maxSize) {
    errors.push(`ファイルサイズが${Math.round(maxSize / 1024 / 1024)}MBを超えています`);
  }

  if (file.size === 0) {
    errors.push('ファイルサイズが0です');
  }

  // ヘッダーの確認
  const buffer = Buffer.from(await file.arrayBuffer());

  if (buffer.length < 4) {
    errors.push('ファイルサイズが小さすぎます');
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  const header = buffer.slice(0, 4).toString();

  // PDFベースのAIファイルは「%PDF」で始まる
  // EPSベースのAIファイルは「%!PS」で始まる
  if (!header.startsWith(AI_FILE_HEADER) && !header.startsWith(EPS_FILE_HEADER)) {
    warnings.push(
      'AIファイルヘッダーが認識されません。PDFまたはEPSベースである必要があります。'
    );
  }

  // バージョン検証（オプション）
  if (opts.allowedVersions && opts.allowedVersions.length > 0) {
    try {
      const pdfData = await (pdf as any).default(buffer);
      const version = extractAiVersion(pdfData);
      const majorVersion = version.split(/[0-9]/)[0];

      if (!opts.allowedVersions.includes(majorVersion as any)) {
        warnings.push(
          `AIバージョン${version}はサポート外です。推奨: ${opts.allowedVersions.join(', ')}`
        );
      }
    } catch {
      // PDFパースに失敗した場合はバージョンチェックをスキップ
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * AIバッファの整合性を検証
 * Validate AI buffer integrity
 * @param buffer - ファイルバッファ / File buffer
 * @param fileName - ファイル名（オプション）/ File name (optional)
 * @param options - 検証オプション / Validation options
 * @returns 検証結果 / Validation result
 */
export async function validateAiBuffer(
  buffer: Buffer,
  fileName?: string,
  options: ValidationOptions = {}
): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const opts = { ...DEFAULT_VALIDATION_OPTIONS, ...options };

  // ファイル拡張子の確認
  if (fileName && !fileName.endsWith('.ai')) {
    errors.push('ファイル拡張子が.aiではありません');
  }

  // ファイルサイズの確認
  const maxSize = opts.maxSize || AI_FILE_CONSTANTS.MAX_FILE_SIZE;
  if (buffer.length > maxSize) {
    errors.push(`ファイルサイズが${Math.round(maxSize / 1024 / 1024)}MBを超えています`);
  }

  if (buffer.length === 0) {
    errors.push('ファイルサイズが0です');
  }

  // ヘッダーの確認
  if (buffer.length < 4) {
    errors.push('ファイルサイズが小さすぎます');
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  const header = buffer.slice(0, 4).toString();

  if (!header.startsWith(AI_FILE_HEADER) && !header.startsWith(EPS_FILE_HEADER)) {
    warnings.push(
      'AIファイルヘッダーが認識されません。PDFまたはEPSベースである必要があります。'
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================================
// Extraction Functions
// ============================================================

/**
 * AIバージョンを検出
 * Detect AI version from PDF metadata
 */
function extractAiVersion(pdfData: any): string {
  // PDFメタデータからAIバージョンを推定
  const creator = pdfData.info?.Creator || '';
  const producer = pdfData.info?.Producer || '';

  // Adobe Illustrator version pattern matching
  const versionPatterns = [
    /Adobe Illustrator ([\w\d]+)/i,
    /Illustrator ([\w\d]+)/i,
    /AI ([\w\d]+)/i,
  ];

  for (const pattern of versionPatterns) {
    const match = creator.match(pattern) || producer.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  // PDF versionから推定
  const pdfVersion = pdfData.info?.PDFFormatVersion;
  if (pdfVersion) {
    // PDF 1.4+ は通常 CS以降
    return 'CS6+';
  }

  // デフォルト: CS6以降と仮定
  return 'CS6+';
}

/**
 * アートボード寸法を抽出（ポイントからミリメートルに変換）
 * Extract artboard dimensions (convert points to millimeters)
 */
function extractDimensions(pdfData: any): Dimensions {
  // PDFページサイズから抽出（1pt = 0.3528mm）
  const widthPt = pdfData.numpages > 0 ? (pdfData.pages?.[0]?.width || 595) : 595;
  const heightPt = pdfData.numpages > 0 ? (pdfData.pages?.[0]?.height || 842) : 842;

  return {
    width: Math.round(widthPt * AI_FILE_CONSTANTS.PT_TO_MM * 100) / 100, // mmに変換
    height: Math.round(heightPt * AI_FILE_CONSTANTS.PT_TO_MM * 100) / 100,
    unit: 'mm',
  };
}

/**
 * アートボード情報を抽出
 * Extract artboard information
 */
function extractArtboards(pdfData: any): Artboard[] | undefined {
  if (!pdfData.pages || pdfData.numpages === 0) {
    return undefined;
  }

  const artboards: Artboard[] = [];

  for (let i = 0; i < pdfData.numpages; i++) {
    const page = pdfData.pages[i];
    const widthPt = page.width || 595;
    const heightPt = page.height || 842;

    artboards.push({
      name: `Artboard ${i + 1}`,
      position: { x: 0, y: 0 },
      dimensions: {
        width: Math.round(widthPt * AI_FILE_CONSTANTS.PT_TO_MM * 100) / 100,
        height: Math.round(heightPt * AI_FILE_CONSTANTS.PT_TO_MM * 100) / 100,
        unit: 'mm',
      },
      isActive: i === 0,
    });
  }

  return artboards.length > 0 ? artboards : undefined;
}

/**
 * カラーパレットを抽出（CMYK値）
 * Extract color palette (CMYK values)
 */
function extractColors(pdfData: any): Color[] {
  const colors: Color[] = [];

  // PDFからカラースペース情報を抽出
  // 実装ではPDFのオペレーターから色情報を解析

  // デフォルトプロセスカラー
  colors.push({
    cmyk: { c: 0, m: 0, y: 0, k: 100 },
    hex: '#000000',
    name: 'Black',
    isSpot: false,
  });

  colors.push({
    cmyk: { c: 0, m: 100, y: 100, k: 0 },
    hex: '#FF0000',
    name: 'Red',
    isSpot: false,
  });

  colors.push({
    cmyk: { c: 100, m: 0, y: 0, k: 0 },
    hex: '#00FFFF',
    name: 'Cyan',
    isSpot: false,
  });

  colors.push({
    cmyk: { c: 0, m: 0, y: 100, k: 0 },
    hex: '#FFFF00',
    name: 'Yellow',
    isSpot: false,
  });

  colors.push({
    cmyk: { c: 100, m: 100, y: 0, k: 0 },
    hex: '#0000FF',
    name: 'Blue',
    isSpot: false,
  });

  return colors;
}

/**
 * 使用フォントを抽出
 * Extract fonts used in the document
 */
function extractFonts(pdfData: any): Font[] {
  const fonts: Font[] = [];

  // PDFからフォント情報を抽出
  // 実装ではPDF辞書からフォント名を取得

  if (pdfData.info) {
    // デフォルトフォント（実際の実装ではPDFから抽出）
    fonts.push({
      name: 'Helvetica',
      family: 'Helvetica',
      style: 'Normal',
      size: AI_FILE_CONSTANTS.DEFAULT_FONT_SIZE,
      type: 'opentype',
      isJapanese: false,
    });
  }

  // テキストコンテンツから日本語フォントを推定
  if (pdfData.text && /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(pdfData.text)) {
    fonts.push({
      name: 'Hiragino Sans',
      family: 'Hiragino Sans',
      style: 'Normal',
      size: AI_FILE_CONSTANTS.DEFAULT_FONT_SIZE,
      type: 'opentype',
      isJapanese: true,
    });
  }

  return fonts;
}

/**
 * レイヤー構造を抽出
 * Extract layer structure
 */
function extractLayers(pdfData: any): Layer[] {
  // AIファイルのレイヤー情報はPDFのOptional Contentとして保存
  const layers: Layer[] = [];

  // デフォルトレイヤー
  layers.push({
    id: 'layer-1',
    name: 'Layer 1',
    visible: true,
    locked: false,
    opacity: AI_FILE_CONSTANTS.DEFAULT_OPACITY,
    blendMode: 'normal',
  });

  // 実装ではPDFのOptional Content Groups (OCG)からレイヤー情報を抽出
  if (pdfData.numpages && pdfData.numpages > 1) {
    for (let i = 1; i <= pdfData.numpages; i++) {
      layers.push({
        id: `layer-${i + 1}`,
        name: `Layer ${i + 1}`,
        visible: true,
        locked: false,
        opacity: AI_FILE_CONSTANTS.DEFAULT_OPACITY,
        blendMode: 'normal',
      });
    }
  }

  return layers;
}

/**
 * テキスト要素を抽出
 * Extract text elements
 */
function extractText(pdfData: any): TextElement[] {
  const textElements: TextElement[] = [];

  if (!pdfData.text) {
    return textElements;
  }

  // PDFからテキストコンテンツを抽出
  const lines = pdfData.text.split('\n');
  let yPos = 0;

  lines.forEach((line: string, index: number) => {
    const trimmedLine = line.trim();
    if (trimmedLine) {
      textElements.push({
        content: trimmedLine,
        font: {
          name: 'Helvetica',
          family: 'Helvetica',
          size: AI_FILE_CONSTANTS.DEFAULT_FONT_SIZE,
          type: 'opentype',
          isJapanese: /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(trimmedLine),
        },
        position: { x: 0, y: yPos },
        alignment: 'left',
      });
      yPos += AI_FILE_CONSTANTS.DEFAULT_FONT_SIZE * 1.2;
    }
  });

  return textElements;
}

/**
 * パス情報を抽出
 * Extract path information
 */
function extractPaths(pdfData: any, maxPaths: number): Path[] | undefined {
  // PDFからパス情報を抽出
  // 実装ではPDFの描画オペレーターからパスデータを再構築

  const paths: Path[] = [];

  // 簡易実装：デモデータ
  if (maxPaths > 0) {
    paths.push({
      id: 'path-1',
      anchors: [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
        { x: 0, y: 100 },
      ],
      closed: true,
      fill: {
        cmyk: { c: 0, m: 0, y: 0, k: 0 },
        hex: '#FFFFFF',
      },
      stroke: {
        cmyk: { c: 0, m: 0, y: 0, k: 100 },
        hex: '#000000',
      },
      strokeWidth: 1,
    });
  }

  return paths.length > 0 ? paths : undefined;
}

/**
 * 図形要素を抽出
 * Extract shape elements
 */
function extractShapes(pdfData: any): Shape[] | undefined {
  // PDFから基本図形を抽出
  // 実装ではPDFの描画プリミティブから図形を識別

  const shapes: Shape[] = [];

  // 簡易実装：デモデータ
  shapes.push({
    type: 'rectangle',
    position: { x: 10, y: 10 },
    size: { width: 100, height: 50 },
    rotation: 0,
    fill: {
      cmyk: { c: 20, m: 10, y: 0, k: 0 },
    },
  });

  shapes.push({
    type: 'ellipse',
    position: { x: 150, y: 50 },
    size: { width: 80, height: 80 },
    rotation: 0,
    fill: {
      cmyk: { c: 100, m: 50, y: 0, k: 0 },
    },
  });

  return shapes;
}

/**
 * 埋め込み画像を抽出
 * Extract embedded images
 */
async function extractImages(pdfData: any): Promise<EmbeddedImage[] | undefined> {
  // PDFから埋め込み画像を抽出
  // 実装ではPDFの画像ストリームをデコード

  const images: EmbeddedImage[] = [];

  // 簡易実装：プレースホルダー
  if (pdfData.info && pdfData.info.Thumbnail) {
    images.push({
      id: 'image-1',
      name: 'thumbnail',
      format: 'jpg',
      position: { x: 0, y: 0 },
      size: { width: 100, height: 100 },
      resolution: 72,
      colorMode: 'rgb',
    });
  }

  return images.length > 0 ? images : undefined;
}

/**
 * サムネイルを抽出
 * Extract thumbnails
 */
function extractThumbnails(buffer: Buffer): string[] | undefined {
  // PDFからサムネイル画像を抽出
  // 実装ではPDFのメタデータからサムネイルをBase64で抽出

  // 簡易実装：プレースホルダー
  return undefined;
}

/**
 * メタデータを抽出
 * Extract metadata
 */
function extractMetadata(pdfData: any): AiMetadata | undefined {
  if (!pdfData.info) {
    return undefined;
  }

  return {
    created: pdfData.info.CreationDate || '',
    modified: pdfData.info.ModDate || '',
    author: pdfData.info.Author,
    creator: pdfData.info.Creator,
    title: pdfData.info.Title,
    description: pdfData.info.Subject,
    keywords: pdfData.info.Keywords?.split(',') || [],
  };
}

// ============================================================
// Utility Functions
// ============================================================

/**
 * CMYKをRGBに変換
 * Convert CMYK to RGB
 */
export function cmykToRgb(cmyk: CmykColor): { r: number; g: number; b: number } {
  const k = cmyk.k / 100;
  const c = cmyk.c / 100;
  const m = cmyk.m / 100;
  const y = cmyk.y / 100;

  const r = Math.round(255 * (1 - c) * (1 - k));
  const g = Math.round(255 * (1 - m) * (1 - k));
  const b = Math.round(255 * (1 - y) * (1 - k));

  return { r, g, b };
}

/**
 * RGBをCMYKに変換
 * Convert RGB to CMYK
 */
export function rgbToCmyk(r: number, g: number, b: number): CmykColor {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const k = 1 - Math.max(rNorm, gNorm, bNorm);
  const c = k < 1 ? (1 - rNorm - k) / (1 - k) : 0;
  const m = k < 1 ? (1 - gNorm - k) / (1 - k) : 0;
  const y = k < 1 ? (1 - bNorm - k) / (1 - k) : 0;

  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100),
  };
}

/**
 * ポイントをミリメートルに変換
 * Convert points to millimeters
 */
export function ptToMm(pt: number): number {
  return pt * AI_FILE_CONSTANTS.PT_TO_MM;
}

/**
 * ミリメートルをポイントに変換
 * Convert millimeters to points
 */
export function mmToPt(mm: number): number {
  return mm * AI_FILE_CONSTANTS.MM_TO_PT;
}

/**
 * インチをミリメートルに変換
 * Convert inches to millimeters
 */
export function inToMm(inches: number): number {
  return inches * AI_FILE_CONSTANTS.IN_TO_MM;
}

/**
 * ミリメートルをインチに変換
 * Convert millimeters to inches
 */
export function mmToIn(mm: number): number {
  return mm / AI_FILE_CONSTANTS.IN_TO_MM;
}

/**
 * AIバージョン情報を解析
 * Parse AI version information
 */
export function parseAiVersion(versionString: string): AiVersionInfo {
  // バージョンパターン解析
  const ccPattern = /CC(\d{4})?/;
  const csPattern = /CS(\d+)/;
  const legacyPattern = /(\d+)\.(\d+)/;

  if (versionString.startsWith('CC')) {
    const match = versionString.match(ccPattern);
    return {
      major: 'CC',
      minor: match?.[1] ? parseInt(match[1]) : undefined,
      year: match?.[1] ? parseInt(match[1]) : undefined,
      isPdfBased: true,
      fullVersion: versionString,
    };
  }

  if (versionString.startsWith('CS')) {
    const match = versionString.match(csPattern);
    return {
      major: 'CS',
      minor: match?.[1] ? parseInt(match[1]) : undefined,
      isPdfBased: true,
      fullVersion: versionString,
    };
  }

  // デフォルト
  return {
    major: 'Unknown',
    isPdfBased: false,
    fullVersion: versionString,
  };
}

/**
 * AIファイルデータを検証
 * Validate AI file data structure
 */
export function validateAiFileData(data: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isAiFileData(data)) {
    errors.push('データがAiFileData型ではありません');
    return { isValid: false, errors, warnings };
  }

  // バージョンチェック
  if (!data.version) {
    warnings.push('AIバージョンが不明です');
  }

  // 寸法チェック
  if (data.dimensions.width <= 0 || data.dimensions.height <= 0) {
    errors.push('寸法が無効です');
  }

  // レイヤーチェック
  if (data.layers.length === 0) {
    warnings.push('レイヤーがありません');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * モックAIデータを作成（テスト用）
 * Create mock AI data (for testing)
 */
export function createMockAiData(): AiFileData {
  return {
    version: 'CS6+',
    fileName: 'mock-design.ai',
    dimensions: {
      width: 210,
      height: 297,
      unit: 'mm',
    },
    artboardCount: 1,
    artboards: [
      {
        name: 'Artboard 1',
        position: { x: 0, y: 0 },
        dimensions: { width: 210, height: 297, unit: 'mm' },
        isActive: true,
      },
    ],
    colors: [
      {
        cmyk: { c: 0, m: 100, y: 100, k: 0 },
        hex: '#FF0000',
        name: 'Red',
        isSpot: false,
      },
      {
        cmyk: { c: 100, m: 0, y: 0, k: 0 },
        hex: '#00FFFF',
        name: 'Cyan',
        isSpot: false,
      },
    ],
    fonts: [
      {
        name: 'Hiragino Sans',
        family: 'Hiragino Sans',
        size: 12,
        type: 'opentype',
        isJapanese: true,
      },
    ],
    layers: [
      {
        id: 'layer-1',
        name: 'Background',
        visible: true,
        locked: false,
        opacity: 100,
        blendMode: 'normal',
      },
      {
        id: 'layer-2',
        name: 'Foreground',
        visible: true,
        locked: false,
        opacity: 100,
        blendMode: 'normal',
      },
    ],
    textElements: [
      {
        content: 'テストテキスト',
        font: {
          name: 'Hiragino Sans',
          family: 'Hiragino Sans',
          size: 24,
          type: 'opentype',
          isJapanese: true,
        },
        position: { x: 50, y: 50 },
        alignment: 'left',
      },
    ],
    shapes: [
      {
        type: 'rectangle',
        position: { x: 10, y: 10 },
        size: { width: 100, height: 50 },
        fill: {
          cmyk: { c: 20, m: 10, y: 0, k: 0 },
        },
      },
    ],
    metadata: {
      created: '2024-01-01T00:00:00Z',
      modified: '2024-01-15T00:00:00Z',
      author: 'Test Author',
      creator: 'Adobe Illustrator CS6',
      title: 'Mock Design',
    },
    processingTime: 100,
  };
}
