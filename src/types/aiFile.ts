/**
 * AI File Types
 *
 * AIファイル関連型定義
 * Type definitions for Adobe Illustrator .ai file parsing and data extraction
 */

// ============================================================
// Dimension Types
// ============================================================

/**
 * 寸法情報
 * Dimension information for AI files
 */
export interface Dimensions {
  /** 幅 / Width in millimeters */
  width: number;
  /** 高さ / Height in millimeters */
  height: number;
  /** 単位 / Unit of measurement */
  unit: 'mm' | 'pt' | 'px' | 'in';
}

/**
 * ポジション情報
 * Position/coordinate information
 */
export interface Position {
  /** X座標 / X coordinate */
  x: number;
  /** Y座標 / Y coordinate */
  y: number;
}

/**
 * サイズ情報
 * Size information (width/height)
 */
export interface AiSize {
  /** 幅 / Width */
  width: number;
  /** 高さ / Height */
  height: number;
}

// ============================================================
// Color Types
// ============================================================

/**
 * CMYKカラー
 * CMYK color representation
 */
export interface CmykColor {
  /** シアン (0-100) / Cyan */
  c: number;
  /** マゼンタ (0-100) / Magenta */
  m: number;
  /** イエロー (0-100) / Yellow */
  y: number;
  /** ブラック (0-100) / Black/Key */
  k: number;
}

/**
 * RGBカラー
 * RGB color representation
 */
export interface RgbColor {
  /** 赤 (0-255) / Red */
  r: number;
  /** 緑 (0-255) / Green */
  g: number;
  /** 青 (0-255) / Blue */
  b: number;
}

/**
 * カラー情報
 * Color information (supports multiple color spaces)
 */
export interface Color {
  /** CMYK値 / CMYK values */
  cmyk?: CmykColor;
  /** RGB値 / RGB values (optional) */
  rgb?: RgbColor;
  /** HEX表現 / HEX representation (optional) */
  hex?: string;
  /** カラー名 / Color name (optional) */
  name?: string;
  /** スポットカラーかどうか / Whether it's a spot color */
  isSpot?: boolean;
}

/**
 * カラーパレット
 * Color palette/group
 */
export interface ColorPalette {
  /** パレット名 / Palette name */
  name: string;
  /** カラーリスト / List of colors */
  colors: Color[];
}

// ============================================================
// Font Types
// ============================================================

/**
 * フォント種別
 * Font type classification
 */
export type FontType = 'opentype' | 'truetype' | 'type1' | 'cid' | 'unknown';

/**
 * フォント情報
 * Font information
 */
export interface Font {
  /** フォント名 / Font name */
  name: string;
  /** フォントファミリー / Font family */
  family?: string;
  /** フォントスタイル / Font style (normal, italic, bold, etc.) */
  style?: string;
  /** サイズ / Size in points */
  size: number;
  /** 種別 / Font type */
  type: FontType;
  /** 日本語フォントかどうか / Whether it's a Japanese font */
  isJapanese?: boolean;
}

// ============================================================
// Layer Types
// ============================================================

/**
 * レイヤー情報
 * Layer information from AI file structure
 */
export interface Layer {
  /** レイヤーID / Layer ID */
  id: string;
  /** レイヤー名 / Layer name */
  name: string;
  /** 表示状態 / Visibility status */
  visible: boolean;
  /** ロック状態 / Lock status */
  locked: boolean;
  /** 不透明度 (0-100) / Opacity */
  opacity: number;
  /** ブレンドモード / Blend mode */
  blendMode?: BlendMode;
  /** 子レイヤー / Child layers (for nested structures) */
  children?: Layer[];
  /** 色分け表示用カラー / Color for layer identification */
  color?: string;
}

/**
 * ブレンドモード
 * Blend mode options
 */
export type BlendMode =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion'
  | 'hue'
  | 'saturation'
  | 'color'
  | 'luminosity';

// ============================================================
// Text Element Types
// ============================================================

/**
 * テキスト要素
 * Text element extracted from AI file
 */
export interface TextElement {
  /** コンテンツ / Text content */
  content: string;
  /** フォント / Font information */
  font: Font;
  /** 位置 / Position on canvas */
  position: Position;
  /** カラー / Text color */
  color?: Color;
  /** サイズ / Text box size */
  size?: AiSize;
  /** 配置 / Text alignment */
  alignment?: 'left' | 'center' | 'right' | 'justify';
  /** 行間 / Line spacing */
  lineHeight?: number;
  /** 文字間 / Letter spacing */
  letterSpacing?: number;
}

// ============================================================
// Path and Shape Types
// ============================================================

/**
 * アンカーポイント
 * Anchor point for paths
 */
export interface AnchorPoint {
  /** 位置 / Position */
  x: number;
  y: number;
  /** 制御点1（入り） / Incoming control point */
  in?: Position;
  /** 制御点2（出） / Outgoing control point */
  out?: Position;
}

/**
 * パス情報
 * Path information for vector shapes
 */
export interface Path {
  /** パスID / Path ID */
  id: string;
  /** アンカーポイント配列 / Array of anchor points */
  anchors: AnchorPoint[];
  /** 閉じたパスかどうか / Whether path is closed */
  closed: boolean;
  /** 塗りカラー / Fill color */
  fill?: Color;
  /** 線カラー / Stroke color */
  stroke?: Color;
  /** 線幅 / Stroke width */
  strokeWidth?: number;
}

/**
 * 図形要素
 * Shape element (rectangle, ellipse, etc.)
 */
export interface Shape {
  /** 図形種別 / Shape type */
  type: 'rectangle' | 'ellipse' | 'polygon' | 'star' | 'line';
  /** 位置 / Position */
  position: Position;
  /** サイズ / Size */
  size: AiSize;
  /** 回転角度 / Rotation angle in degrees */
  rotation?: number;
  /** 塗りカラー / Fill color */
  fill?: Color;
  /** 線カラー / Stroke color */
  stroke?: Color;
  /** 角丸（矩形の場合） / Corner radius (for rectangles) */
  cornerRadius?: number;
}

// ============================================================
// Artboard Types
// ============================================================

/**
 * アートボード情報
 * Artboard information
 */
export interface Artboard {
  /** アートボード名 / Artboard name */
  name: string;
  /** 位置 / Position */
  position: Position;
  /** 寸法 / Dimensions */
  dimensions: Dimensions;
  /** 是否为アクティブなアートボード / Whether it's the active artboard */
  isActive?: boolean;
}

// ============================================================
// Image Types
// ============================================================

/**
 * 埋め込み画像情報
 * Embedded image information
 */
export interface EmbeddedImage {
  /** 画像ID / Image ID */
  id: string;
  /** ファイル名 / File name */
  name: string;
  /** フォーマット / Image format */
  format: 'jpg' | 'png' | 'tiff' | 'psd' | 'unknown';
  /** 位置 / Position */
  position: Position;
  /** サイズ / Size */
  size: AiSize;
  /** 解像度 (DPI) / Resolution */
  resolution?: number;
  /** カラーモード / Color mode */
  colorMode?: 'cmyk' | 'rgb' | 'grayscale';
  /** Base64エンコードされた画像データ / Base64 encoded image data */
  data?: string;
}

// ============================================================
// Metadata Types
// ============================================================

/**
 * AIファイルメタデータ
 * AI file metadata
 */
export interface AiMetadata {
  /** 作成日時 / Creation date */
  created: string;
  /** 更新日時 / Modification date */
  modified: string;
  /** 作成者 / Author */
  author?: string;
  /** アプリケーション / Application that created the file */
  creator?: string;
  /** タイトル / Title */
  title?: string;
  /** 説明 / Description */
  description?: string;
  /** キーワード / Keywords */
  keywords?: string[];
  /** 著作権 / Copyright */
  copyright?: string;
}

// ============================================================
// Main AI File Data Structure
// ============================================================

/**
 * AIファイルデータ構造
 * Complete AI file data structure
 */
export interface AiFileData {
  // ============================================================
  // Basic Information
  // ============================================================
  /** AIバージョン / AI version (e.g., "CS6", "CC2020") */
  version: string;
  /** ファイル名 / File name */
  fileName?: string;
  /** アートボード数 / Number of artboards */
  artboardCount?: number;

  // ============================================================
  // Canvas and Dimensions
  // ============================================================
  /** キャンバス寸法 / Canvas dimensions */
  dimensions: Dimensions;
  /** アートボードリスト / List of artboards */
  artboards?: Artboard[];

  // ============================================================
  // Design Elements
  // ============================================================
  /** カラーパレット / Color palette */
  colors: Color[];
  /** 使用フォントリスト / List of fonts used */
  fonts: Font[];
  /** レイヤー構造 / Layer structure */
  layers: Layer[];
  /** テキスト要素 / Text elements */
  textElements: TextElement[];
  /** パス情報 / Path information */
  paths?: Path[];
  /** 図形要素 / Shape elements */
  shapes?: Shape[];
  /** 埋め込み画像 / Embedded images */
  images?: EmbeddedImage[];

  // ============================================================
  // Thumbnails and Previews
  // ============================================================
  /** サムネイル / Base64 encoded thumbnails */
  thumbnails?: string[];

  // ============================================================
  // Metadata
  // ============================================================
  /** メタデータ / File metadata */
  metadata?: AiMetadata;

  // ============================================================
  // Processing Information
  // ============================================================
  /** 処理時間 / Processing time in milliseconds */
  processingTime?: number;
  /** 抽出元ファイルパス / Source file path (if applicable) */
  sourcePath?: string;
}

// ============================================================
// Validation Types
// ============================================================

/**
 * 検証結果
 * Validation result for AI files
 */
export interface ValidationResult {
  /** 有効フラグ / Valid flag */
  isValid: boolean;
  /** エラーリスト / List of errors */
  errors: string[];
  /** 警告リスト / List of warnings */
  warnings: string[];
}

/**
 * AIファイル検証オプション
 * AI file validation options
 */
export interface ValidationOptions {
  /** 最大ファイルサイズ（バイト）/ Maximum file size in bytes */
  maxSize?: number;
  /** 許可されるバージョン / Allowed versions */
  allowedVersions?: string[];
  /** 厳密な検証 / Strict validation */
  strict?: boolean;
}

// ============================================================
// Parsing Options
// ============================================================

/**
 * パースオプション
 * Options for AI file parsing
 */
export interface ParseOptions {
  /** サムネイルを抽出するかどうか / Whether to extract thumbnails */
  extractThumbnails?: boolean;
  /** 埋め込み画像を抽出するかどうか / Whether to extract embedded images */
  extractImages?: boolean;
  /** テキストのみ抽出 / Extract text only */
  textOnly?: boolean;
  /** 最大パス数 / Maximum number of paths to extract */
  maxPaths?: number;
  /** パースの深さ / Parsing depth for nested structures */
  depth?: number;
}

/**
 * パース結果
 * Result of AI file parsing
 */
export interface ParseResult {
  /** 成功フラグ / Success flag */
  success: boolean;
  /** AIデータ / Parsed AI data */
  data?: AiFileData;
  /** エラーメッセージ / Error message */
  error?: string;
  /** 処理時間 / Processing time in milliseconds */
  processingTime?: number;
}

// ============================================================
// AI Version Detection
// ============================================================

/**
 * AIバージョン情報
 * AI version information
 */
export interface AiVersionInfo {
  /** メジャーバージョン / Major version (e.g., "CS6", "CC") */
  major: string;
  /** マイナーバージョン / Minor version (e.g., "2020", "2023") */
  minor?: number;
  /** 年式 / Year (for CC versions) */
  year?: number;
  /** PDFベースかどうか / Whether it's PDF-based */
  isPdfBased: boolean;
  /** 完全バージョン文字列 / Full version string */
  fullVersion: string;
}

/**
 * サポートされているAIバージョン
 * Supported AI versions
 */
export type SupportedAiVersion =
  | 'CS3'
  | 'CS4'
  | 'CS5'
  | 'CS6'
  | 'CC'
  | 'CC2014'
  | 'CC2015'
  | 'CC2017'
  | 'CC2018'
  | 'CC2019'
  | 'CC2020'
  | 'CC2021'
  | 'CC2022'
  | 'CC2023'
  | 'CC2024';

// ============================================================
// Type Guards
// ============================================================

/**
 * AIファイルデータかどうかチェック
 * Check if data is valid AiFileData
 */
export function isAiFileData(data: unknown): data is AiFileData {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const aiData = data as Partial<AiFileData>;

  return (
    typeof aiData.version === 'string' &&
    typeof aiData.dimensions === 'object' &&
    typeof aiData.dimensions?.width === 'number' &&
    typeof aiData.dimensions?.height === 'number' &&
    Array.isArray(aiData.colors) &&
    Array.isArray(aiData.fonts) &&
    Array.isArray(aiData.layers)
  );
}

/**
 * カラー情報かどうかチェック
 * Check if data is valid Color
 */
export function isColor(data: unknown): data is Color {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const color = data as Partial<Color>;

  // At least one color space should be present
  const hasCmyk = !!(
    color.cmyk &&
    typeof color.cmyk.c === 'number' &&
    typeof color.cmyk.m === 'number' &&
    typeof color.cmyk.y === 'number' &&
    typeof color.cmyk.k === 'number'
  );

  const hasRgb = !!(
    color.rgb &&
    typeof color.rgb.r === 'number' &&
    typeof color.rgb.g === 'number' &&
    typeof color.rgb.b === 'number'
  );

  return hasCmyk || hasRgb;
}

/**
 * レイヤー情報かどうかチェック
 * Check if data is valid Layer
 */
export function isLayer(data: unknown): data is Layer {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const layer = data as Partial<Layer>;

  return (
    typeof layer.id === 'string' &&
    typeof layer.name === 'string' &&
    typeof layer.visible === 'boolean' &&
    typeof layer.locked === 'boolean' &&
    typeof layer.opacity === 'number'
  );
}

// ============================================================
// Constants
// ============================================================

/**
 * AIファイル定数
 * AI file constants
 */
export const AI_FILE_CONSTANTS = {
  /** 最大ファイルサイズ（デフォルト: 100MB）/ Maximum file size */
  MAX_FILE_SIZE: 100 * 1024 * 1024,

  /** デフォルト寸法（A4: 210x297mm）/ Default dimensions (A4) */
  DEFAULT_DIMENSIONS: {
    width: 210,
    height: 297,
    unit: 'mm' as const,
  },

  /** サポートされる最小AIバージョン / Minimum supported AI version */
  MIN_AI_VERSION: 'CS3',

  /** PDFベースAIファイルの開始バージョン / PDF-based AI file start version */
  PDF_BASED_START_VERSION: 'CS',

  /** ポイントからミリメートルへの変換係数 / Point to millimeter conversion factor */
  PT_TO_MM: 0.3528,

  /** ミリメートルからポイントへの変換係数 / Millimeter to point conversion factor */
  MM_TO_PT: 2.8346,

  /** インチからミリメートルへの変換係数 / Inch to millimeter conversion factor */
  IN_TO_MM: 25.4,

  /** デフォルトフォントサイズ / Default font size */
  DEFAULT_FONT_SIZE: 12,

  /** デフォルト不透明度 / Default opacity */
  DEFAULT_OPACITY: 100,
} as const;

/**
 * 日本の標準用紙サイズ
 * Japanese standard paper sizes (JIS)
 */
export const JIS_PAPER_SIZES = {
  A4: { width: 210, height: 297, unit: 'mm' as const },
  A3: { width: 297, height: 420, unit: 'mm' as const },
  A5: { width: 148, height: 210, unit: 'mm' as const },
  B4: { width: 257, height: 364, unit: 'mm' as const },
  B5: { width: 182, height: 257, unit: 'mm' as const },
} as const;

/**
 * よく使われる日本語フォント
 * Common Japanese fonts
 */
export const COMMON_JAPANESE_FONTS = [
  'Hiragino Sans',
  'Hiragino Kaku Gothic Pro',
  'Hiragino Mincho Pro',
  'Noto Sans JP',
  'Noto Serif JP',
  'Yu Gothic',
  'Yu Mincho',
  'MS Gothic',
  'MS Mincho',
  'Meiryo',
  'Tsukushi A Round Gothic',
  'Tsukushi B Round Gothic',
] as const;
