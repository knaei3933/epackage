/**
 * AI File Parser Type Definitions
 * Adobe Illustrator .ai 파일 파싱을 위한 통합 타입 정의
 *
 * This file consolidates both the legacy PDF-based parser types
 * and the new AI vision-based extraction types.
 */

// Re-export from the centralized types file
export * from '@/types/ai-extraction';

// ============= Legacy PDF Parser Types (Kept for compatibility) =============

/** 파싱 가능한 파일 타입 */
export type SupportedFileType = 'ai' | 'pdf' | 'psd';

/** 봉투 타입 (Legacy - compatible with EnvelopeType) */
export type LegacyEnvelopeType =
  | 'stand_pouch'      // 스탠드 파우치
  | 'box_pouch'        // 박스 파우치
  | 'flat_pouch'       // 평면 파우치
  | 'gusset'           // 갓셋 봉투
  | 'zipper_bag'       // 지퍼백
  | 'three_side_seal'; // 3면 시일

/** 단위 */
export type Unit = 'mm' | 'μm' | 'inch';

// ============= PDF 구조 관련 (Legacy) =============

/** PDF 페이지 구조 */
export interface PDFStructure {
  pages: PDFPage[];
  metadata: PDFMetadata;
}

/** PDF 메타데이터 */
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

/** PDF 페이지 */
export interface PDFPage {
  width: number;
  height: number;
  unit: Unit;
  texts: TextElement[];
  paths: PathElement[];
  images: ImageElement[];
  layers: Layer[];
}

/** 텍스트 요소 */
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

/** 백터 경로 요소 */
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

/** 이미지 요소 */
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

/** 레이어 */
export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  blendMode: string;
}

/** 바운딩 박스 */
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

// ============= Legacy Extraction Types (Mapped to new system) =============

/** 추출된 사양 (Legacy) - @deprecated Use ExtractedProductData instead */
export interface ExtractedSpecs {
  dimensions: Dimensions;
  material: MaterialStructure;
  printing: PrintingInfo;
  processing: ProcessingFeatures;
  confidence: ConfidenceScore;
  metadata: ExtractionMetadata;
}

/** 치수 정보 (Legacy) */
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

/** 노치 정보 (Legacy) */
export interface NotchInfo {
  type: 'circle' | 'rectangle' | 'v_shape';
  position: { x: number; y: number };
  size: { width: number; height: number };
  confidence: number;
}

/** 지퍼 정보 (Legacy) */
export interface ZipperInfo {
  type: 'standard' | 'slider' | 'press_lock';
  position: 'top' | 'side' | 'bottom';
  y: number;
  length: number;
  confidence: number;
}

/** 걸이 구멍 정보 (Legacy) */
export interface HangingHoleInfo {
  type: 'round' | 'euro_slot';
  diameter?: number;
  position: { x: number; y: number };
  confidence: number;
}

/** 소재 구조 (Legacy) */
export interface MaterialStructure {
  layers: MaterialLayer[];
  totalThickness?: number;
  thicknessUnit: Unit;
  source: 'text_label' | 'layer_name' | 'inferred' | 'manual';
  confidence: number;
}

/** 소재 레이어 (Legacy) */
export interface MaterialLayer {
  material: string; // PET, AL, PE, NY, PP, etc.
  thickness?: number; // μm
  function?: 'barrier' | 'sealing' | 'strength' | 'printable';
}

/** 인쇄 정보 (Legacy) */
export interface PrintingInfo {
  colors: ColorInfo;
  logos: LogoInfo[];
  printArea: PrintArea;
  textContent: string[];
}

/** 색상 정보 (Legacy) */
export interface ColorInfo {
  type: 'cmyk' | 'spot' | 'hybrid';
  colors: string[]; // hex codes or Pantone codes
  pantoneCodes?: string[];
  cmykValues?: CMYKValue[];
  count: number;
  confidence: number;
}

/** CMYK 값 (Legacy) */
export interface CMYKValue {
  c: number; // 0-100
  m: number; // 0-100
  y: number; // 0-100
  k: number; // 0-100
}

/** 로고 정보 (Legacy) */
export interface LogoInfo {
  type: 'text' | 'vector' | 'raster';
  position: { x: number; y: number };
  size: number; // approximate font size or width
  text?: string;
  confidence: number;
}

/** 인쇄 영역 (Legacy) */
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

/** 가공 기능 (Legacy) */
export interface ProcessingFeatures {
  zipper?: ZipperInfo;
  notch?: NotchInfo;
  hangingHole?: HangingHoleInfo;
  cornerRounding?: CornerRoundingInfo;
  euroSlot?: EuroSlotInfo;
  tearNotch?: TearNotchInfo;
  valve?: ValveInfo;
}

/** 모서리 라운딩 (Legacy) */
export interface CornerRoundingInfo {
  radius: number;
  corners: number; // 1, 2, or 4
  type: 'rounded' | 'sharp';
  confidence: number;
}

/** 유로 슬롯 (Legacy) */
export interface EuroSlotInfo {
  type: 'euro_slot';
  position: { x: number; y: number };
  size: { width: number; height: number };
  confidence: number;
}

/** 찢림 노치 (Legacy) */
export interface TearNotchInfo {
  type: 'v_notch' | 'circle';
  position: BoundingBox;
  confidence: number;
}

/** 밸브 (Legacy) */
export interface ValveInfo {
  type: 'degassing' | 'aroma';
  position: BoundingBox;
  confidence: number;
}

// ============= 신뢰도 (Legacy) =============

/** 신뢰도 점수 (Legacy) */
export interface ConfidenceScore {
  overall: number; // 0-100
  dimensions: number; // 0-100
  material: number; // 0-100
  printing: number; // 0-100
  processing: number; // 0-100
  breakdown: ConfidenceBreakdown;
  flags: ValidationFlag[];
}

/** 신뢰도 세부사항 (Legacy) */
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

/** 검증 플래그 (Legacy) */
export interface ValidationFlag {
  type: 'error' | 'warning' | 'info';
  field: string;
  message: string;
  suggestion: string;
  autoCorrect?: boolean;
}

// ============= 추출 메타데이터 (Legacy) =============

/** 추출 메타데이터 (Legacy) */
export interface ExtractionMetadata {
  extractedAt: Date;
  extractionMethod: ExtractionMethod;
  processingTimeMs: number;
  fileSize: number;
  fileName: string;
  parserVersion: string;
}

/** 추출 방법 (Legacy) */
export type ExtractionMethod =
  | 'pdf_parse'
  | 'ocr_fallback'
  | 'path_only'
  | 'manual'
  | 'hybrid'
  | 'ai_vision'; // Added for new system

// ============= 파싱 결과 (Legacy) =============

/** 파싱 결과 (Legacy) - @deprecated Use ExtractionResult instead */
export interface ParseResult {
  success: boolean;
  specs?: ExtractedSpecs;
  confidence?: number;
  errors?: ParseError[];
  warnings?: string[];
  recoveryMethod?: RecoveryMethod;
}

/** 파싱 에러 (Legacy) */
export interface ParseError {
  type: ParseErrorType;
  message: string;
  recoverable: boolean;
  stage: ParseStage;
}

/** 파싱 에러 타입 (Legacy) */
export enum ParseErrorType {
  INVALID_FILE_FORMAT = 'INVALID_FILE_FORMAT',
  CORRUPTED_PDF = 'CORRUPTED_PDF',
  MISSING_DIE_LINE = 'MISSING_DIE_LINE',
  NO_TEXT_CONTENT = 'NO_TEXT_CONTENT',
  PATH_PARSE_FAILED = 'PATH_PARSE_FAILED',
  OCR_FAILED = 'OCR_FAILED',
}

/** 파싱 단계 (Legacy) */
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

/** 복구 방법 (Legacy) */
export type RecoveryMethod =
  | 'pdf_recovery'
  | 'image_ocr_fallback'
  | 'label_based_estimation'
  | 'standard_size_matching'
  | 'ocr_retry'
  | 'path_only_analysis'
  | 'manual_input_required';

// ============= API 관련 (Legacy) =============

/** 파일 업로드 요청 (Legacy) */
export interface UploadRequest {
  file: File;
  userId?: string;
  priority?: 'fast' | 'detailed';
}

/** 파일 업로드 응답 (Legacy) */
export interface UploadResponse {
  success: boolean;
  uploadId: string;
  filePath: string;
  fileSize: number;
  estimatedTime: number; // seconds
}

/** 추출 상태 (Legacy) */
export interface ExtractionStatus {
  uploadId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  stage: ParseStage;
  progress: number; // 0-100
  estimatedTimeRemaining?: number; // seconds
  result?: ParseResult;
}

// ============= 성능 모니터링 =============

/** 성능 메트릭 */
export interface PerformanceMetric {
  stage: string;
  duration: number; // ms
  memoryUsed: number; // bytes
  success: boolean;
  error?: string;
}

/** 성능 보고서 */
export interface PerformanceReport {
  totalDuration: number;
  memoryUsage: number;
  successRate: number;
  bottlenecks: Bottleneck[];
  recommendations: string[];
}

/** 병목 지점 */
export interface Bottleneck {
  stage: string;
  duration: number;
  impact: number; // percentage
  suggestion: string;
}

// ============= 데이터베이스 (Legacy) =============

/** AI 업로드 DB 레코드 (Legacy) */
export interface AIUploadRecord {
  id: string;
  user_id?: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: SupportedFileType;
  uploaded_at: Date;
}

/** AI 사양 DB 레코드 (Legacy) */
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
