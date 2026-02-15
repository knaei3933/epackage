/**
 * AI Extraction System Types
 *
 * Types for AI-powered product specification extraction from Adobe Illustrator .ai files
 * Part of the B2B Order Management System
 */

// ============================================================================
// Core Extraction Types
// ============================================================================

/**
 * Extraction method used to extract data from design files
 */
export type ExtractionMethod = 'adobe_api' | 'ai_vision' | 'manual';

/**
 * Processing status for AI extraction
 */
export type ExtractionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'needs_revision';

/**
 * Data type for production data entries
 */
export type ProductionDataType =
  | 'design_file'
  | 'specification'
  | 'approval'
  | 'material_data'
  | 'layout_data'
  | 'color_data'
  | 'other';

/**
 * Validation status for extracted data
 */
export type ValidationStatus = 'pending' | 'valid' | 'invalid' | 'needs_revision';

// ============================================================================
// Dimension Specifications
// ============================================================================

/**
 * Product dimensions in millimeters
 */
export interface ProductDimensions {
  /** Width in millimeters (30-500mm) */
  width_mm: number;
  /** Height in millimeters (30-500mm) */
  height_mm: number;
  /** Bottom gusset in millimeters (0-200mm, optional) */
  gusset_mm?: number;
}

/**
 * Dimension validation result
 */
export interface DimensionValidation {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
  normalized_values?: ProductDimensions;
}

// ============================================================================
// Material Specifications
// ============================================================================

/**
 * Material layer structure
 */
export interface AIExtractionMaterialLayer {
  /** Material type (PET, AL, CPP, PE, NY, PAPER) */
  type: 'PET' | 'AL' | 'CPP' | 'PE' | 'NY' | 'PAPER' | 'OTHER';
  /** Thickness in micrometers */
  thickness_microns: number;
  /** Position in layer stack (1 = outermost) */
  position: number;
}

/**
 * Material specification
 */
export interface MaterialSpecification {
  /** Raw material string (e.g., "PET12μ+AL7μ+PET12μ+LLDPE60μ") */
  raw: string;
  /** Parsed material layers */
  layers: AIExtractionMaterialLayer[];
  /** Total thickness in micrometers */
  total_thickness_microns: number;
}

/**
 * Material validation result
 */
export interface MaterialValidation {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
  suggested_materials?: string[];
}

// ============================================================================
// Product Options
// ============================================================================

/**
 * Notch type for opening
 */
export type NotchType = 'V' | 'U' | 'round' | 'none';

/**
 * Corner round specification
 */
export type CornerRound = `R${number}` | 'none';

/**
 * Product options
 */
export interface ProductOptions {
  /** Zipper/closure presence */
  zipper: boolean;
  /** Zipper type if applicable */
  zipper_type?: 'standard' | 'rezip' | 'child_resistant';
  /** Notch type for opening */
  notch: NotchType;
  /** Corner round radius */
  corner_round: CornerRound;
  /** Hang hole presence */
  hang_hole: boolean;
  /** Hang hole type if applicable */
  hang_hole_type?: 'round' | 'oval' | 'euro';
  /** Valve for degassing (optional) */
  valve?: boolean;
}

// ============================================================================
// Color Specifications
// ============================================================================

/**
 * Color representation
 */
export interface ColorSpec {
  /** Color name (e.g., "PANTONE 185 C") */
  name: string;
  /** CMYK values [C, M, Y, K] (0-100) */
  cmyk: [number, number, number, number];
  /** Spot color reference (optional) */
  spot_color?: string;
  /** Hex color code (optional, for reference) */
  hex?: string;
}

/**
 * Print color mode
 */
export type ColorMode = 'CMYK' | 'PANTONE' | 'SPOT_COLOR' | 'HYBRID';

/**
 * Color specifications for printing
 */
export interface ColorSpecifications {
  /** Color mode */
  mode: ColorMode;
  /** Front side colors */
  front_colors: ColorSpec[];
  /** Back side colors (optional) */
  back_colors?: ColorSpec[];
  /** Number of color stations */
  color_stations: number;
  /** Varnish/coating (optional) */
  varnish?: {
    type: 'matte' | 'gloss' | 'spot_uv' | 'soft_touch';
    location: 'full' | 'partial' | 'none';
  };
}

// ============================================================================
// Design Elements
// ============================================================================

/**
 * Position on the package
 */
export type ElementPosition =
  | 'top-center'
  | 'top-left'
  | 'top-right'
  | 'center'
  | 'bottom-center'
  | 'bottom-left'
  | 'bottom-right';

/**
 * Logo specification
 */
export interface LogoElement {
  position: ElementPosition;
  size: string; // e.g., "30mm x 20mm"
  file_reference?: string;
}

/**
 * Text element
 */
export interface AIExtractionTextElement {
  content: string;
  font: string;
  size: string; // e.g., "12pt"
  weight?: string; // e.g., "bold", "normal"
  position?: ElementPosition;
}

/**
 * Graphic element
 */
export interface GraphicElement {
  type: 'icon' | 'pattern' | 'illustration' | 'barcode' | 'qr_code';
  description: string;
  position?: ElementPosition;
  size?: string;
}

/**
 * Design elements collection
 */
export interface DesignElements {
  /** Logo(s) */
  logos: LogoElement[];
  /** Text elements */
  text: AIExtractionTextElement[];
  /** Graphics */
  graphics: GraphicElement[];
}

// ============================================================================
// Print Specifications
// ============================================================================

/**
 * Print specifications
 */
export interface PrintSpecifications {
  /** Resolution in DPI */
  resolution_dpi: number;
  /** Color mode */
  color_mode: ColorMode;
  /** Bleed in millimeters */
  bleed_mm: number;
  /** Print type */
  print_type: 'flexographic' | 'rotogravure' | 'digital';
  /** Plate/screen information */
  plate_info?: {
    lpi?: number; // Lines per inch
    screen_angle?: number;
  };
}

// ============================================================================
// Extracted Data Structure
// ============================================================================

/**
 * Confidence score for extraction results
 */
export interface ConfidenceScore {
  /** Overall confidence (0-1) */
  overall: number;
  /** Field-level confidence */
  fields: {
    dimensions?: number;
    materials?: number;
    options?: number;
    colors?: number;
    design_elements?: number;
    print_specs?: number;
  };
  /** Extraction method confidence */
  method_confidence: number;
}

/**
 * Validation result for extracted data
 */
export interface AIExtractionValidationResult {
  /** Overall validation status */
  status: ValidationStatus;
  /** Confidence score */
  confidence: ConfidenceScore;
  /** Missing required fields */
  missing_fields: string[];
  /** Validation errors */
  errors: AIExtractionValidationError[];
  /** Warnings (non-critical issues) */
  warnings: AIExtractionValidationWarning[];
  /** Suggestions for improvement */
  suggestions: Suggestion[];
}

/**
 * Validation error
 */
export interface AIExtractionValidationError {
  field: string;
  message: string;
  severity: 'error' | 'critical';
  current_value: unknown;
  expected_value?: unknown;
}

/**
 * Validation warning
 */
export interface AIExtractionValidationWarning {
  field: string;
  message: string;
  severity: 'warning' | 'info';
  recommendation?: string;
}

/**
 * Improvement suggestion
 */
export interface Suggestion {
  field: string;
  message: string;
  suggested_value?: unknown;
  reason: string;
}

/**
 * Extraction metadata
 */
export interface ExtractionMetadata {
  /** When extraction was performed */
  extracted_at: string;
  /** Extraction method used */
  extraction_method: ExtractionMethod;
  /** AI model used (if applicable) */
  ai_model?: string;
  /** Processing time in milliseconds */
  processing_time_ms: number;
  /** API costs (if applicable) */
  api_cost_usd?: number;
  /** Retry count */
  retry_count: number;
}

/**
 * Main extracted product specification data
 */
export interface ExtractedProductData {
  /** Product dimensions */
  dimensions: ProductDimensions;
  /** Material specification */
  materials: MaterialSpecification;
  /** Product options */
  options: ProductOptions;
  /** Color specifications */
  colors: ColorSpecifications;
  /** Design elements */
  design_elements: DesignElements;
  /** Print specifications */
  print_specifications: PrintSpecifications;
  /** Additional notes */
  notes?: string;
}

/**
 * Complete extraction result
 */
export interface ExtractionResult {
  /** Extraction ID */
  id: string;
  /** Associated file ID */
  file_id: string;
  /** Associated order ID */
  order_id: string;
  /** Extraction status */
  status: ExtractionStatus;
  /** Extracted data */
  data: ExtractedProductData | null;
  /** Validation result */
  validation: AIExtractionValidationResult;
  /** Metadata */
  metadata: ExtractionMetadata;
  /** Processing error (if failed) */
  error?: ExtractionError;
}

/**
 * Extraction error
 */
export interface ExtractionError {
  code: string;
  message: string;
  stage: 'upload' | 'conversion' | 'extraction' | 'validation';
  details?: Record<string, unknown>;
  retryable: boolean;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

/**
 * File upload request
 */
export interface FileUploadRequest {
  file: File;
  order_id: string;
  data_type?: ProductionDataType;
}

/**
 * File upload response
 */
export interface FileUploadResponse {
  success: boolean;
  data?: {
    file_id: string;
    status: ExtractionStatus;
    uploaded_at: string;
    estimated_completion?: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Extraction status response
 */
export interface ExtractionStatusResponse {
  success: boolean;
  data?: {
    file_id: string;
    status: ExtractionStatus;
    progress: number;
    current_step?: string;
    estimated_completion?: string;
    extracted_data?: ExtractedProductData;
    validation_errors?: AIExtractionValidationError[];
    warnings?: AIExtractionValidationWarning[];
  };
}

/**
 * Validation request
 */
export interface ValidationRequest {
  file_id: string;
  manual_data?: Partial<ExtractedProductData>;
  corrections?: FieldCorrection[];
}

/**
 * Field correction
 */
export interface FieldCorrection {
  field: string;
  original_value: unknown;
  corrected_value: unknown;
  reason: string;
}

/**
 * Validation response
 */
export interface ValidationResponse {
  success: boolean;
  data?: {
    validation_status: ValidationStatus;
    confidence_score: number;
    missing_fields: string[];
    suggestions: Suggestion[];
  };
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Approval request
 */
export interface AIExtractionApprovalRequest {
  file_id: string;
  approved_data: ExtractedProductData;
  create_work_order?: boolean;
  notes?: string;
}

/**
 * Approval response
 */
export interface ApprovalResponse {
  success: boolean;
  data?: {
    production_data_id: string;
    work_order_id?: string;
    status: string;
    approved_at: string;
    approved_by: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Reprocessing request
 */
export interface ReprocessRequest {
  file_ids: string[];
  reason: string;
  force_reextract?: boolean;
}

/**
 * Batch processing response
 */
export interface BatchProcessingResponse {
  success: boolean;
  data?: {
    batch_id: string;
    status: string;
    total_files: number;
    estimated_completion?: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

// ============================================================================
// AI Model Configuration
// ============================================================================

/**
 * AI model provider
 */
export type AIModelProvider = 'openai' | 'anthropic' | 'google' | 'azure';

/**
 * AI model configuration
 */
export interface AIModelConfig {
  provider: AIModelProvider;
  model: string;
  api_key: string;
  max_tokens: number;
  temperature: number;
  timeout_ms: number;
}

/**
 * Extraction pipeline configuration
 */
export interface ExtractionPipelineConfig {
  /** File conversion settings */
  conversion: {
    target_format: 'pdf' | 'png' | 'jpeg';
    dpi: number;
    quality: number;
  };
  /** AI model settings */
  ai_models: {
    primary: AIModelConfig;
    fallback?: AIModelConfig;
    ensemble?: AIModelConfig[];
  };
  /** Validation settings */
  validation: {
    confidence_threshold: number;
    strict_mode: boolean;
    auto_correct: boolean;
  };
  /** Retry settings */
  retry: {
    max_attempts: number;
    backoff_ms: number;
  };
}

// ============================================================================
// Database Integration Types
// ============================================================================

/**
 * File record with AI extraction data
 */
export interface FileWithExtraction {
  id: string;
  order_id: string | null;
  file_type: string;
  file_name: string;
  file_url: string;
  file_size: number;
  version: number;

  // AI extraction fields
  ai_extraction_status: ExtractionStatus;
  ai_extraction_data: ExtractedProductData | null;
  ai_confidence_score: number;
  ai_extraction_method: ExtractionMethod | null;
  ai_extracted_at: string | null;
  ai_validation_errors: AIExtractionValidationError[] | null;

  created_at: string;
}

/**
 * Production data with extraction reference
 */
export interface ProductionDataWithExtraction {
  id: string;
  order_id: string;
  data_type: ProductionDataType;
  title: string;
  version: string;
  file_id: string | null;
  file_url: string | null;
  validation_status: ValidationStatus;
  specifications: Record<string, unknown>;

  // AI extraction reference
  ai_extraction_id?: string;

  approved_for_production: boolean;
  created_at: string;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Deep partial type (recursive Partial)
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object
    ? DeepPartial<T[P]>
    : T[P];
};

/**
 * Field path for nested objects
 */
export type FieldPath = string;

/**
 * Extraction progress callback
 */
export type ExtractionProgressCallback = (progress: {
  status: ExtractionStatus;
  progress: number;
  current_step: string;
  error?: string;
}) => void;

/**
 * Error types
 */
export class ExtractionError extends Error {
  constructor(
    public code: string,
    public stage: 'upload' | 'conversion' | 'extraction' | 'validation',
    message: string,
    public retryable: boolean = true
  ) {
    super(message);
    this.name = 'ExtractionError';
  }
}

/**
 * Validation error class
 */
export class AIExtractionValidationError extends Error {
  constructor(
    public field: string,
    message: string,
    public current_value: unknown,
    public expected_value?: unknown
  ) {
    super(message);
    this.name = 'AIExtractionValidationError';
  }
}
