/**
 * AI File Parser Type Definitions
 * Adobe Illustrator .aiファイルパース用統合タイプ定義
 *
 * This file consolidates both the legacy PDF-based parser types
 * and the new AI vision-based extraction types.
 */

// Re-export from the centralized types file
export * from '@/types/ai-extraction';

// ============= Legacy PDF Parser Types (Kept for compatibility) =============

/** パース可能ファイルタイプ */
export type SupportedFileType = 'ai' | 'pdf' | 'psd';

/** 封筒タイプ (Legacy - compatible with EnvelopeType) */
export type LegacyEnvelopeType =
  | 'stand_pouch'      // スタンドパウチ
  | 'box_pouch'        // ボックスパウチ
  | 'flat_pouch'       // 平面パウチ
  | 'gusset'           // ギャセット封筒
  | 'zipper_bag'       // ジッパーバッグ
  | 'three_side_seal'; // 3方シール

/** 単位 */
export type Unit = 'mm' | 'μm' | 'inch';

// ============= PDF構造関連 (Legacy) =============

/** PDFページ構造 */
export interface PDFStructure {
  pages: PDFPage[];
  metadata: PDFMetadata;
}

/** PDFメタデータ */
export interface PDFMetadata {
  title?: string;
  author?: string;
  creator?: string;
  producer?: string;
  creationDate?: Date;
  modifiedDate?: Date;
  pageSize: {
    width: number;
    height: number;
    unit: Unit;
  };
}

/** PDFページ */
export interface PDFPage {
  width: number;
  height: number;
  unit: Unit;
  texts: TextElement[];
  paths: PathElement[];
  images: ImageElement[];
  layers: Layer[];
}

/** テキスト要素 */
export interface TextElement {
  id: string;
  content: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  fontWeight?: 'normal' | 'bold';
  color: string;
  rotation?: number;
  boundingBox: BoundingBox;
}

/** ベクターパス要素 */
export interface PathElement {
  id: string;
  d: string; // SVG path data
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  transform: number[]; // affine transform matrix [a, b, c, d, e, f]
  boundingBox: BoundingBox;
  layerId?: string;
}

/** 画像要素 */
export interface ImageElement {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  format: 'png' | 'jpg' | 'svg';
  data?: string; // base64 encoded
  boundingBox: BoundingBox;
}

/** レイヤー */
export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  blendMode: string;
}

/** バウンディングボックス */
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

// ============= Legacy Extraction Types (Mapped to new system) =============

/** 抽出された仕様 (Legacy) - @deprecated Use ExtractedProductData instead */
export interface ExtractedSpecs {
  dimensions: Dimensions;
  material: MaterialStructure;
  printing: PrintingInfo;
  processing: ProcessingFeatures;
  confidence: ConfidenceScore;
  metadata: ExtractionMetadata;
}

/** 寸法情報 (Legacy) */
export interface Dimensions {
  envelopeType: LegacyEnvelopeType;
  width: number;
  height: number;
  gusset?: number;
  unit: Unit;
  hasDieLine: boolean;
  notch?: NotchInfo;
  zipper?: ZipperInfo;
  hangingHole?: HangingHoleInfo;
}

/** ノッチ情報 (Legacy) */
export interface NotchInfo {
  type: 'circle' | 'rectangle' | 'v_shape';
  position: { x: number; y: number };
  size: { width: number; height: number };
  confidence: number;
}

/** ジッパー情報 (Legacy) */
export interface ZipperInfo {
  type: 'standard' | 'slider' | 'press_lock';
  position: 'top' | 'side' | 'bottom';
  y: number;
  length: number;
  confidence: number;
}

/** つり穴情報 (Legacy) */
export interface HangingHoleInfo {
  type: 'round' | 'euro_slot';
  diameter?: number;
  position: { x: number; y: number };
  confidence: number;
}

/** 素材構造 (Legacy) */
export interface MaterialStructure {
  layers: MaterialLayer[];
  totalThickness?: number;
  thicknessUnit: Unit;
  source: 'text_label' | 'layer_name' | 'inferred' | 'manual';
  confidence: number;
}

/** 素材レイヤー (Legacy) */
export interface MaterialLayer {
  material: string; // PET, AL, PE, NY, PP, etc.
  thickness?: number; // μm
  function?: 'barrier' | 'sealing' | 'strength' | 'printable';
}

/** 印刷情報 (Legacy) */
export interface PrintingInfo {
  colors: ColorInfo;
  logos: LogoInfo[];
  printArea: PrintArea;
  textContent: string[];
}

/** 色情報 (Legacy) */
export interface ColorInfo {
  type: 'cmyk' | 'spot' | 'hybrid';
  colors: string[]; // hex codes or Pantone codes
  pantoneCodes?: string[];
  cmykValues?: CMYKValue[];
  count: number;
  confidence: number;
}

/** CMYK値 (Legacy) */
export interface CMYKValue {
  c: number; // 0-100
  m: number; // 0-100
  y: number; // 0-100
  k: number; // 0-100
}

/** ロゴ情報 (Legacy) */
export interface LogoInfo {
  type: 'text' | 'vector' | 'raster';
  position: { x: number; y: number };
  size: number; // approximate font size or width
  text?: string;
  confidence: number;
}

/** 印刷領域 (Legacy) */
export interface PrintArea {
  x: number;
  y: number;
  width: number;
  height: number;
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

/** 加工機能 (Legacy) */
export interface ProcessingFeatures {
  zipper?: ZipperInfo;
  notch?: NotchInfo;
  hangingHole?: HangingHoleInfo;
  cornerRounding?: CornerRoundingInfo;
  euroSlot?: EuroSlotInfo;
  tearNotch?: TearNotchInfo;
  valve?: ValveInfo;
}

/** 角丸め (Legacy) */
export interface CornerRoundingInfo {
  radius: number;
  corners: number; // 1, 2, or 4
  type: 'rounded' | 'sharp';
  confidence: number;
}

/** ユーロスロット (Legacy) */
export interface EuroSlotInfo {
  type: 'euro_slot';
  position: { x: number; y: number };
  size: { width: number; height: number };
  confidence: number;
}

/** テアノッチ (Legacy) */
export interface TearNotchInfo {
  type: 'v_notch' | 'circle';
  position: BoundingBox;
  confidence: number;
}

/** バルブ (Legacy) */
export interface ValveInfo {
  type: 'degassing' | 'aroma';
  position: BoundingBox;
  confidence: number;
}

// ============= 信頼度 (Legacy) =============

/** 信頼度スコア (Legacy) */
export interface ConfidenceScore {
  overall: number; // 0-100
  dimensions: number; // 0-100
  material: number; // 0-100
  printing: number; // 0-100
  processing: number; // 0-100
  breakdown: ConfidenceBreakdown;
  flags: ValidationFlag[];
}

/** 信頼度詳細 (Legacy) */
export interface ConfidenceBreakdown {
  envelopeType: number;
  size: number;
  gusset: number;
  zipper: number;
  notch: number;
  materialStructure: number;
  thickness: number;
  colors: number;
  logo: number;
}

/** 検証フラグ (Legacy) */
export interface ValidationFlag {
  type: 'error' | 'warning' | 'info';
  field: string;
  message: string;
  suggestion: string;
  autoCorrect?: boolean;
}

// ============= 抽出メタデータ (Legacy) =============

/** 抽出メタデータ (Legacy) */
export interface ExtractionMetadata {
  extractedAt: Date;
  extractionMethod: ExtractionMethod;
  processingTimeMs: number;
  fileSize: number;
  fileName: string;
  parserVersion: string;
}

/** 抽出方法 (Legacy) */
export type ExtractionMethod =
  | 'pdf_parse'
  | 'ocr_fallback'
  | 'path_only'
  | 'manual'
  | 'hybrid'
  | 'ai_vision'; // Added for new system

// ============= パース結果 (Legacy) =============

/** パース結果 (Legacy) - @deprecated Use ExtractionResult instead */
export interface ParseResult {
  success: boolean;
  specs?: ExtractedSpecs;
  confidence?: number;
  errors?: ParseError[];
  warnings?: string[];
  recoveryMethod?: RecoveryMethod;
}

/** パースエラー (Legacy) */
export interface ParseError {
  type: ParseErrorType;
  message: string;
  recoverable: boolean;
  stage: ParseStage;
}

/** パースエラータイプ (Legacy) */
export enum ParseErrorType {
  INVALID_FILE_FORMAT = 'INVALID_FILE_FORMAT',
  CORRUPTED_PDF = 'CORRUPTED_PDF',
  MISSING_DIE_LINE = 'MISSING_DIE_LINE',
  NO_TEXT_CONTENT = 'NO_TEXT_CONTENT',
  PATH_PARSE_FAILED = 'PATH_PARSE_FAILED',
  OCR_FAILED = 'OCR_FAILED',
}

/** パース段階 (Legacy) */
export enum ParseStage {
  FILE_UPLOAD = 'FILE_UPLOAD',
  PDF_CONVERSION = 'PDF_CONVERSION',
  STRUCTURE_PARSE = 'STRUCTURE_PARSE',
  DIMENSION_EXTRACT = 'DIMENSION_EXTRACT',
  MATERIAL_EXTRACT = 'MATERIAL_EXTRACT',
  PRINTING_EXTRACT = 'PRINTING_EXTRACT',
  PROCESSING_EXTRACT = 'PROCESSING_EXTRACT',
  CONFIDENCE_CALC = 'CONFIDENCE_CALC',
}

/** 復元方法 (Legacy) */
export type RecoveryMethod =
  | 'pdf_recovery'
  | 'image_ocr_fallback'
  | 'label_based_estimation'
  | 'standard_size_matching'
  | 'ocr_retry'
  | 'path_only_analysis'
  | 'manual_input_required';

// ============= API関連 (Legacy) =============

/** ファイルアップロードリクエスト (Legacy) */
export interface UploadRequest {
  file: File;
  userId?: string;
  priority?: 'fast' | 'detailed';
}

/** ファイルアップロードレスポンス (Legacy) */
export interface UploadResponse {
  success: boolean;
  uploadId: string;
  filePath: string;
  fileSize: number;
  estimatedTime: number; // seconds
}

/** 抽出状態 (Legacy) */
export interface ExtractionStatus {
  uploadId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  stage: ParseStage;
  progress: number; // 0-100
  estimatedTimeRemaining?: number; // seconds
  result?: ParseResult;
}

// ============= 性能モニタリング =============

/** 性能メトリクス */
export interface PerformanceMetric {
  stage: string;
  duration: number; // ms
  memoryUsed: number; // bytes
  success: boolean;
  error?: string;
}

/** 性能レポート */
export interface PerformanceReport {
  totalDuration: number;
  memoryUsage: number;
  successRate: number;
  bottlenecks: Bottleneck[];
  recommendations: string[];
}

/** ボトルネック */
export interface Bottleneck {
  stage: string;
  duration: number;
  impact: number; // percentage
  suggestion: string;
}

// ============= データベース (Legacy) =============

/** AIアップロードDBレコード (Legacy) */
export interface AIUploadRecord {
  id: string;
  user_id?: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: SupportedFileType;
  uploaded_at: Date;
}

/** AI仕様DBレコード (Legacy) */
export interface AISpecRecord {
  id: string;
  upload_id: string;
  envelope_type: LegacyEnvelopeType;
  width_mm: number;
  height_mm: number;
  gusset_mm?: number;
  material_structure: MaterialLayer[];
  total_thickness_um?: number;
  color_type: ColorInfo['type'];
  colors: string[];
  has_zipper: boolean;
  zipper_info?: ZipperInfo;
  has_notch: boolean;
  notch_info?: NotchInfo;
  has_hanging_hole: boolean;
  hanging_hole_info?: HangingHoleInfo;
  confidence_score: number;
  validation_flags: ValidationFlag[];
  extracted_at: Date;
  extraction_method: ExtractionMethod;
  processing_time_ms: number;
  status: 'pending' | 'verified' | 'approved';
}
