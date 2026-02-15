/**
 * AI Specification Types
 *
 * AI仕様抽出関連型定義
 * Type definitions for product specification extraction from AI files
 */

import type { Layer } from '@/types/aiFile';

// ============================================================
// Pouch Type Enumeration
// ============================================================

/**
 * パウチタイプ列挙型
 * Pouch type enumeration
 */
export enum PouchType {
  /** スタンドパウチ / Stand pouch */
  STAND_POUCH = 'stand_pouch',
  /** フラットパウチ / Flat pouch */
  FLAT_POUCH = 'flat_pouch',
  /** ジッパーパウチ / Zipper pouch */
  ZIPPER_POUCH = 'zipper_pouch',
  /** ガセットパウチ / Gusset pouch */
  GUSSET_POUCH = 'gusset_pouch',
  /** 三方シール / Three-side seal pouch */
  THREE_SIDE_SEAL = 'three_side_seal',
  /** 未知のタイプ / Unknown type */
  UNKNOWN = 'unknown',
}

// ============================================================
// Dimension Types
// ============================================================

/**
 * 寸法情報（mm単位）
 * Dimension information in millimeters
 */
export interface Dimensions {
  /** 横幅 / Width (W) */
  width: number;
  /** 高さ / Height (H) */
  height: number;
  /** マチ幅 / Gusset width (G) */
  gusset: number;
  /** 許容値 / Tolerance (±mm) */
  tolerance?: number;
}

/**
 * 寸法の詳細情報
 * Detailed dimension information
 */
export interface DimensionDetails {
  /** 基本寸法 / Basic dimensions */
  dimensions: Dimensions;
  /** カットライン有無 / Whether cut line exists */
  hasCutLine: boolean;
  /** セーフティエリア有無 / Whether safe area exists */
  hasSafeArea: boolean;
  /** カットラインからのオフセット / Offset from cut line */
  cutLineOffset?: number;
}

// ============================================================
// Material Types
// ============================================================

/**
 * 材質レイヤー情報
 * Material layer information
 */
export interface MaterialLayer {
  /** レイヤー位置 / Layer position ('outer' | 'middle' | 'inner') */
  layer: 'outer' | 'middle' | 'inner';
  /** 材質種別 / Material type (e.g., 'PET', 'AL', 'PE', 'CPP') */
  material: string;
  /** 厚み（ミクロン）/ Thickness in microns */
  thickness: number;
  /** 材質の詳細 / Material details (optional) */
  description?: string;
}

/**
 * 材質構成
 * Material composition
 */
export interface MaterialComposition {
  /** 材質レイヤーリスト / List of material layers */
  layers: MaterialLayer[];
  /** 総厚み（ミクロン）/ Total thickness in microns */
  totalThickness: number;
  /** 材質の構成比 / Composition ratio */
  compositionRatio?: {
    outer: number; // 外側材質の割合
    middle: number; // 中間材質の割合
    inner: number; // 内側材質の割合
  };
}

// ============================================================
// Processing Feature Types
// ============================================================

/**
 * ノッチ情報
 * Notch information
 */
export interface NotchInfo {
  /** ノッチタイプ / Notch type */
  type: 'round' | 'triangle' | 'square' | 'none';
  /** ノッチ位置 / Notch position */
  position: 'top_left' | 'top_right' | 'top_center' | 'bottom_left' | 'bottom_right' | 'center';
  /** ノッチサイズ / Notch size (mm) */
  size?: number;
}

/**
 * 吊り穴情報
 * Hanging hole information
 */
export interface HangingHoleInfo {
  /** 穴タイプ / Hole type */
  type: 'round' | 'triangle' | 'slot' | 'none';
  /** 穴径 / Hole diameter (mm) */
  diameter: number;
  /** 穴位置 / Hole position */
  position: 'center' | 'offset' | 'top' | 'bottom';
  /** オフセット値（mm）/ Offset value in mm */
  offset?: number;
}

/**
 * 加工仕様
 * Processing features
 */
export interface ProcessingFeatures {
  /** ヒールシール幅 / Heat seal width (mm) */
  sealWidth?: number;
  /** シール位置 / Seal position */
  sealPosition?: 'top' | 'bottom' | 'top_bottom' | 'side' | 'all_around';
  /** ノッチ情報 / Notch information */
  notch?: NotchInfo;
  /** 吊り穴情報 / Hanging hole information */
  hangingHole?: HangingHoleInfo;
  /** ジッパー位置 / Zipper position */
  zipperPosition?: 'top' | 'middle' | 'bottom';
  /** ジッパータイプ / Zipper type */
  zipperType?: 'standard' | 'double_track' | 'waterproof';
  /** 角処理（R角）/ Corner radius */
  cornerRadius?: number;
  /** 封入方向 / Filling direction */
  fillingDirection?: 'top' | 'side' | 'bottom';
  /** ガセット深さ / Gusset depth */
  gussetDepth?: number;
  /** スリット / Slit */
  hasSlit?: boolean;
  /** ダイカット / Die cut */
  hasDieCut?: boolean;
  /** パンチ穴 / Punch hole */
  hasPunchHole?: boolean;
  /** エンボス / Embossing */
  hasEmbossing?: boolean;
  /** 箔押し / Hot stamping */
  hasHotStamping?: boolean;
}

// ============================================================
// Confidence Score Types
// ============================================================

/**
 * 信頼度スコア
 * Confidence score for extraction
 */
export interface ConfidenceScore {
  /** 総合信頼度 (0-1) / Overall confidence score */
  overall: number;
  /** 内訳スコア / Breakdown scores */
  breakdown: {
    /** パウチタイプ信頼度 / Pouch type confidence */
    pouchType: number;
    /** 寸法信頼度 / Dimensions confidence */
    dimensions: number;
    /** 材質信頼度 / Materials confidence */
    materials: number;
    /** 加工仕様信頼度 / Processing features confidence */
    processing: number;
  };
  /** 懸念箇所フラグ / Flagged issues */
  flags: string[];
  /** 信頼度レベル / Confidence level */
  level: 'high' | 'medium' | 'low';
}

/**
 * 信頼度レベル定義
 * Confidence level definitions
 */
export const CONFIDENCE_LEVELS = {
  HIGH: { min: 0.8, label: 'high' as const, description: '手動レビュー不要' },
  MEDIUM: { min: 0.5, label: 'medium' as const, description: '一部レビュー推奨' },
  LOW: { min: 0.0, label: 'low' as const, description: '完全レビュー必要' },
} as const;

/**
 * 信頼度レベルを取得
 * Get confidence level from score
 */
export function getConfidenceLevel(score: number): 'high' | 'medium' | 'low' {
  if (score >= CONFIDENCE_LEVELS.HIGH.min) return 'high';
  if (score >= CONFIDENCE_LEVELS.MEDIUM.min) return 'medium';
  return 'low';
}

// ============================================================
// Main Product Specifications
// ============================================================

/**
 * 製品仕様書
 * Complete product specifications extracted from AI file
 */
export interface ProductSpecifications {
  /** パウチタイプ / Pouch type */
  pouchType: PouchType;
  /** 寸法情報 / Dimension information */
  dimensions: Dimensions;
  /** 寸法詳細 / Detailed dimension information */
  dimensionDetails?: DimensionDetails;
  /** 材質構成 / Material composition */
  materials: MaterialLayer[];
  /** 加工仕様 / Processing features */
  processing: ProcessingFeatures;
  /** 信頼度スコア / Confidence score */
  confidence: ConfidenceScore;
  /** 抽出日時 / Extraction timestamp */
  extractedAt: Date;
  /** ソースファイル名 / Source file name */
  sourceFile: string;
  /** 抽出者ID / Extractor ID (optional) */
  extractorId?: string;
  /** 抽出メタデータ / Extraction metadata */
  metadata?: {
    /** 使用AIバージョン / AI version used */
    aiVersion: string;
    /** 抽出メソッド / Extraction method */
    method: 'automated' | 'assisted' | 'manual';
    /** 処理時間（ミリ秒）/ Processing time in ms */
    processingTime?: number;
  };
}

// ============================================================
// Validation Types
// ============================================================

/**
 * 仕様書検証結果
 * Specification validation result
 */
export interface ValidationResult {
  /** 有効フラグ / Valid flag */
  isValid: boolean;
  /** エラーリスト / Error list */
  errors: string[];
  /** 警告リスト / Warning list */
  warnings: string[];
}

/**
 * 仕様書照合結果
 * Cross-check result with quotation data
 */
export interface CrossCheckResult {
  /** 有効フラグ / Valid flag */
  isValid: boolean;
  /** 不一致リスト / List of discrepancies */
  discrepancies: string[];
  /** 一致度スコア (0-1) / Agreement score */
  agreementScore: number;
}

// ============================================================
// Review Workflow Types
// ============================================================

/**
 * レビュータスク
 * Review task for low-confidence extractions
 */
export interface ReviewTask {
  /** タスクID / Task ID */
  id: string;
  /** 抽出された仕様書 / Extracted specifications */
  specs: ProductSpecifications;
  /** ステータス / Status */
  status: 'pending' | 'approved' | 'rejected' | 'modified';
  /** レビュー者ID / Reviewer ID */
  reviewer?: string;
  /** レビューコメント / Reviewer comments */
  comments?: string;
  /** 修正された仕様書 / Modified specifications */
  modifiedSpecs?: ProductSpecifications;
  /** 作成日時 / Created at */
  createdAt: Date;
  /** 更新日時 / Updated at */
  updatedAt: Date;
}

/**
 * レビュー決定
 * Review decision type
 */
export type ReviewDecision = 'approve' | 'reject' | 'modify';

/**
 * レビーログ
 * Review log entry
 */
export interface ReviewLog {
  /** ログID / Log ID */
  id: string;
  /** タスクID / Task ID */
  taskId: string;
  /** アクション / Action */
  action: 'created' | 'approved' | 'rejected' | 'modified' | 'commented';
  /** アクター / Actor (user ID) */
  actor: string;
  /** タイムスタンプ / Timestamp */
  timestamp: Date;
  /** コメント / Comment */
  comment?: string;
}

// ============================================================
// Extraction Log Types
// ============================================================

/**
 * 抽出ログエントリー
 * Extraction log entry
 */
export interface ExtractionLog {
  /** ログID / Log ID */
  id: string;
  /** タイムスタンプ / Timestamp */
  timestamp: Date;
  /** ソースファイル名 / Source file name */
  sourceFile: string;
  /** 信頼度 / Confidence score */
  confidence: number;
  /** フラグ / Flags */
  flags: string[];
  /** レビュー者ID / Reviewer ID */
  reviewer?: string;
  /** ステータス / Status */
  status: 'pending_review' | 'approved' | 'rejected' | 'modified';
  /** 処理時間（ミリ秒）/ Processing time in ms */
  processingTime?: number;
}

// ============================================================
// Error Types
// ============================================================

/**
 * 抽出エラー
 * Extraction error
 */
export class ExtractionError extends Error {
  /** エラーコード / Error code */
  code: string;
  /** 詳細情報 / Error details */
  details?: unknown;

  constructor(
    message: string,
    code: string,
    details?: unknown
  ) {
    super(message);
    this.name = 'ExtractionError';
    this.code = code;
    this.details = details;
  }
}

/**
 * 抽出結果
 * Extraction result with error handling
 */
export interface ExtractionResult {
  /** 成功フラグ / Success flag */
  success: boolean;
  /** 仕様書データ / Specification data */
  specs?: ProductSpecifications;
  /** エラーメッセージ / Error message */
  error?: string;
  /** エラーコード / Error code */
  errorCode?: string;
}

// ============================================================
// Type Guards
// ============================================================

/**
 * 製品仕様書かどうかチェック
 * Check if data is valid ProductSpecifications
 */
export function isProductSpecifications(data: unknown): data is ProductSpecifications {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const specs = data as Partial<ProductSpecifications>;

  return (
    typeof specs.pouchType === 'string' &&
    typeof specs.dimensions === 'object' &&
    typeof specs.dimensions.width === 'number' &&
    typeof specs.dimensions.height === 'number' &&
    Array.isArray(specs.materials) &&
    typeof specs.processing === 'object' &&
    typeof specs.confidence === 'object' &&
    specs.extractedAt instanceof Date
  );
}

/**
 * レビュータスクかどうかチェック
 * Check if data is valid ReviewTask
 */
export function isReviewTask(data: unknown): data is ReviewTask {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const task = data as Partial<ReviewTask>;

  return (
    typeof task.id === 'string' &&
    typeof task.specs === 'object' &&
    typeof task.status === 'string' &&
    (task.createdAt instanceof Date || typeof task.createdAt === 'string')
  );
}

/**
 * 材質レイヤーかどうかチェック
 * Check if data is valid MaterialLayer
 */
export function isMaterialLayer(data: unknown): data is MaterialLayer {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const layer = data as Partial<MaterialLayer>;

  return (
    (layer.layer === 'outer' || layer.layer === 'middle' || layer.layer === 'inner') &&
    typeof layer.material === 'string' &&
    typeof layer.thickness === 'number'
  );
}

// ============================================================
// Utility Functions
// ============================================================

/**
 * パウチタイプを日本語に変換
 * Convert pouch type to Japanese
 */
export function pouchTypeToJapanese(type: PouchType): string {
  const map: Record<PouchType, string> = {
    [PouchType.STAND_POUCH]: 'スタンドパウチ',
    [PouchType.FLAT_POUCH]: 'フラットパウチ',
    [PouchType.ZIPPER_POUCH]: 'ジッパーパウチ',
    [PouchType.GUSSET_POUCH]: 'ガセットパウチ',
    [PouchType.THREE_SIDE_SEAL]: '三方シール',
    [PouchType.UNKNOWN]: '不明',
  };
  return map[type] || '不明';
}

/**
 * パウチタイプを英語に変換
 * Convert pouch type to English
 */
export function pouchTypeToEnglish(type: PouchType): string {
  const map: Record<PouchType, string> = {
    [PouchType.STAND_POUCH]: 'Stand Pouch',
    [PouchType.FLAT_POUCH]: 'Flat Pouch',
    [PouchType.ZIPPER_POUCH]: 'Zipper Pouch',
    [PouchType.GUSSET_POUCH]: 'Gusset Pouch',
    [PouchType.THREE_SIDE_SEAL]: 'Three Side Seal',
    [PouchType.UNKNOWN]: 'Unknown',
  };
  return map[type] || 'Unknown';
}

/**
 * 材質略語を正式名称に変換
 * Convert material abbreviation to full name
 */
export function materialToFullName(abbr: string): string {
  const map: Record<string, string> = {
    'PET': 'Polyethylene Terephthalate',
    'AL': 'Aluminum',
    'PE': 'Polyethylene',
    'CPP': 'Cast Polypropylene',
    'OPP': 'Oriented Polypropylene',
    'PA': 'Polyamide (Nylon)',
    'EVOH': 'Ethylene Vinyl Alcohol',
    'MET': 'Metallized',
  };
  return map[abbr.toUpperCase()] || abbr;
}

/**
 * 寸法をフォーマット（文字列表現）
 * Format dimensions as string
 */
export function formatDimensions(dimensions: Dimensions): string {
  return `W: ${dimensions.width}mm × H: ${dimensions.height}mm × G: ${dimensions.gusset}mm`;
}

/**
 * 材質構成をフォーマット（文字列表現）
 * Format material composition as string
 */
export function formatMaterials(materials: MaterialLayer[]): string {
  return materials
    .map(m => `${m.material}${m.thickness}`)
    .join('/');
}

/**
 * 信頼度スコアをパーセンテートでフォーマット
 * Format confidence score as percentage
 */
export function formatConfidence(score: number): string {
  return `${Math.round(score * 100)}%`;
}

/**
 * 信頼度レベルの説明を取得
 * Get description for confidence level
 */
export function getConfidenceLevelDescription(level: 'high' | 'medium' | 'low'): string {
  const descriptions = {
    high: '高信頼度：自動処理で問題なし',
    medium: '中信頼度：一部確認推奨',
    low: '低信頼度：完全なレビュー必要',
  };
  return descriptions[level];
}

/**
 * 既定の材質構成
 * Common material combinations
 */
export const COMMON_MATERIAL_COMBINATIONS = {
  /** 標準的なスタンドパウチ / Standard stand pouch */
  STANDARD_STAND: [
    { layer: 'outer' as const, material: 'PET', thickness: 12 },
    { layer: 'middle' as const, material: 'AL', thickness: 7 },
    { layer: 'inner' as const, material: 'PE', thickness: 80 },
  ],
  /** 高バリア性 / High barrier */
  HIGH_BARRIER: [
    { layer: 'outer' as const, material: 'PET', thickness: 12 },
    { layer: 'middle' as const, material: 'AL', thickness: 9 },
    { layer: 'inner' as const, material: 'PE', thickness: 70 },
    { layer: 'extra' as const, material: 'EVOH', thickness: 5 },
  ],
  /** 透明パウチ / Clear pouch */
  CLEAR_POUCH: [
    { layer: 'outer' as const, material: 'PET', thickness: 12 },
    { layer: 'inner' as const, material: 'PE', thickness: 50 },
  ],
  /** ラミネート用 / For lamination */
  LAMINATION_READY: [
    { layer: 'outer' as const, material: 'PET', thickness: 12 },
    { layer: 'middle' as const, material: 'AL', thickness: 7 },
    { layer: 'inner' as const, material: 'CPP', thickness: 50 },
  ],
} as const;

/**
 * 既定の寸法許容値
 * Common dimension tolerances by pouch type
 */
export const COMMON_TOLERANCES = {
  [PouchType.STAND_POUCH]: 2,
  [PouchType.FLAT_POUCH]: 3,
  [PouchType.ZIPPER_POUCH]: 2,
  [PouchType.GUSSET_POUCH]: 3,
  [PouchType.THREE_SIDE_SEAL]: 2,
  [PouchType.UNKNOWN]: 5,
} as const;
