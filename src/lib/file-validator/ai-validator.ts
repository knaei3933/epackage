/**
 * AI File Validation System
 *
 * Comprehensive validation for AI, PDF, and PSD design files
 * Supports Japanese B2B packaging requirements
 *
 * @module file-validator/ai-validator
 */

// ============================================================
// Type Definitions
// ============================================================

export type FileType = 'AI' | 'PDF' | 'PSD';

export type ValidationCategory = 'format' | 'dimension' | 'color' | 'font' | 'image' | 'structure';

export type IssueType = 'error' | 'warning';

export type IssueSeverity = 'critical' | 'major' | 'minor';

export type ColorMode = 'CMYK' | 'RGB' | 'GRAY';

/**
 * Single validation issue or warning
 */
export interface ValidationIssue {
  type: IssueType;
  category: ValidationCategory;
  message_ja: string;
  message_en: string;
  severity: IssueSeverity;
  field?: string;
  current?: any;
  expected?: any;
}

/**
 * File metadata extracted during validation
 */
export interface FileMetadata {
  dimensions?: { width: number; height: number };
  dpi?: number;
  colorMode?: ColorMode;
  pages?: number;
  fonts?: string[];
  hasFonts?: boolean;
  images?: number;
  hasImages?: boolean;
  aiVersion?: string;
  pdfVersion?: string;
  hasBleed?: boolean;
  bleedSize?: number;
  trimBox?: { width: number; height: number };
  layers?: number;
  hiddenLayers?: number;
}

/**
 * Complete validation result
 */
export interface ValidationResult {
  valid: boolean;
  fileType: FileType;
  fileName: string;
  fileSize: number;
  issues: ValidationIssue[];
  warnings: ValidationIssue[];
  metadata: FileMetadata;
  validatedAt: string;
}

/**
 * Validation options
 */
export interface ValidationOptions {
  maxSize?: number;
  requireBleed?: boolean;
  bleedSize?: number;
  minDPI?: number;
  allowedVersions?: string[];
  strictMode?: boolean;
  checkFonts?: boolean;
  checkImages?: boolean;
}

// ============================================================
// Constants
// ============================================================

const DEFAULT_VALIDATION_OPTIONS: ValidationOptions = {
  maxSize: 10 * 1024 * 1024, // 10MB (Task #72 requirement)
  requireBleed: true,
  bleedSize: 3, // 3mm for Japanese printing
  minDPI: 300,
  allowedVersions: ['CS6', 'CC', 'CC2014', 'CC2015', 'CC2017', 'CC2018', 'CC2019', 'CC2020', 'CC2021', 'CC2022', 'CC2023', 'CC2024'],
  strictMode: false,
  checkFonts: true,
  checkImages: true,
};

// ============================================================
// Japanese Error Messages
// ============================================================

export const ERROR_MESSAGES = {
  // Format errors
  invalidAIFormat: {
    ja: '有効なAdobe Illustratorファイルではありません',
    en: 'Not a valid Adobe Illustrator file',
  },
  invalidPDFFormat: {
    ja: '有効なPDFファイルではありません',
    en: 'Not a valid PDF file',
  },
  invalidPSDFormat: {
    ja: '有効なPhotoshopファイルではありません',
    en: 'Not a valid Photoshop file',
  },
  unsupportedVersion: {
    ja: '対応していないバージョンです: {version}',
    en: 'Unsupported version: {version}',
  },
  fileSizeTooLarge: {
    ja: 'ファイルサイズが大きすぎます（現在: {size}MB、最大: {max}MB）',
    en: 'File size too large (Current: {size}MB, Maximum: {max}MB)',
  },

  // Dimension errors
  invalidDimensions: {
    ja: '無効な寸法です: {width}x{height}',
    en: 'Invalid dimensions: {width}x{height}',
  },
  dimensionsTooSmall: {
    ja: '寸法が小さすぎます（最小: 10x10mm）',
    en: 'Dimensions too small (minimum: 10x10mm)',
  },
  noBleed: {
    ja: '塗り足し（{size}mm）が設定されていません',
    en: 'No bleed area set ({size}mm required)',
  },
  insufficientBleed: {
    ja: '塗り足しが不足しています（現在: {current}mm、必要: {required}mm）',
    en: 'Insufficient bleed (Current: {current}mm, Required: {required}mm)',
  },
  invalidTrimBox: {
    ja: 'トリムボックスが正しく設定されていません',
    en: 'Trim box not properly set',
  },

  // Color errors
  colorModeNotCMYK: {
    ja: 'カラーモードがCMYKではありません（現在: {mode}）',
    en: 'Color mode is not CMYK (Current: {mode})',
  },
  rgbColorDetected: {
    ja: 'RGBカラーが検出されました。印刷用にCMYKに変換してください',
    en: 'RGB color detected. Please convert to CMYK for printing',
  },
  spotColorWarning: {
    ja: 'スポットカラーが使用されています。印刷方法を確認してください',
    en: 'Spot color detected. Please verify printing method',
  },

  // Font errors
  missingFonts: {
    ja: 'フォントが見つかりません: {fonts}',
    en: 'Missing fonts: {fonts}',
  },
  fontNotEmbedded: {
    ja: 'フォントが埋め込まれていません: {fonts}',
    en: 'Fonts not embedded: {fonts}',
  },
  outlinedTextRequired: {
    ja: 'テキストをアウトライン化してください',
    en: 'Please outline text',
  },
  nonJapaneseFont: {
    ja: '日本語フォントではありません: {fonts}',
    en: 'Non-Japanese font detected: {fonts}',
  },

  // Image errors
  lowResolution: {
    ja: '画像解像度が不足しています（現在: {dpi} DPI、必要: {min} DPI）',
    en: 'Image resolution insufficient (Current: {dpi} DPI, Required: {min} DPI)',
  },
  embeddedImagesWarning: {
    ja: '埋め込み画像が{count}個検出されました。リンク画像推奨',
    en: '{count} embedded images detected. Linked images recommended',
  },
  rgbImages: {
    ja: 'RGBモードの画像が{count}個あります',
    en: '{count} images in RGB mode',
  },

  // Structure errors
  noLayers: {
    ja: 'レイヤーが見つかりません',
    en: 'No layers found',
  },
  hiddenLayersDetected: {
    ja: '非表示レイヤーが{count}個あります',
    en: '{count} hidden layers detected',
  },
  lockedLayers: {
    ja: 'ロックされたレイヤーが{count}個あります',
    en: '{count} locked layers detected',
  },
  noArtboards: {
    ja: 'アートボードが見つかりません',
    en: 'No artboards found',
  },
  multipleArtboards: {
    ja: '複数のアートボードがあります（{count}個）',
    en: 'Multiple artboards detected ({count} count)',
  },
};

// ============================================================
// Helper Functions
// ============================================================

/**
 * Create a validation issue
 */
function createIssue(
  type: IssueType,
  category: ValidationCategory,
  messageKey: keyof typeof ERROR_MESSAGES,
  severity: IssueSeverity,
  replacements?: Record<string, any>
): ValidationIssue {
  const message = ERROR_MESSAGES[messageKey];
  let message_ja = message.ja;
  let message_en = message.en;

  // Replace placeholders
  if (replacements) {
    Object.keys(replacements).forEach(key => {
      const placeholder = `{${key}}`;
      const value = replacements[key];
      message_ja = message_ja.replace(placeholder, String(value));
      message_en = message_en.replace(placeholder, String(value));
    });
  }

  return {
    type,
    category,
    message_ja,
    message_en,
    severity,
  };
}

/**
 * Detect file type from buffer
 */
export function detectFileType(buffer: Buffer): FileType | null {
  const header = buffer.slice(0, 12).toString('ascii');

  // AI files (PDF-based)
  if (header.startsWith('%PDF-')) {
    // Further check for AI-specific markers
    const content = buffer.toString('ascii', 0, Math.min(buffer.length, 1000));
    if (content.includes('Adobe Illustrator') || content.includes('AI')) {
      return 'AI';
    }
    return 'PDF';
  }

  // AI files (legacy EPS-based)
  if (header.includes('%!PS-Adobe')) {
    const content = buffer.toString('ascii', 0, Math.min(buffer.length, 1000));
    if (content.includes('Adobe Illustrator')) {
      return 'AI';
    }
  }

  // PSD files
  if (buffer.readUInt8(0) === 0x38 && buffer.readUInt8(1) === 0x42 &&
      buffer.readUInt8(2) === 0x50 && buffer.readUInt8(3) === 0x53) {
    return 'PSD';
  }

  return null;
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

// ============================================================
// AI File Validation (Client-side)
// ============================================================

/**
 * Validate AI file structure
 */
async function validateAIFileStructure(
  buffer: Buffer,
  options: ValidationOptions
): Promise<{ metadata: FileMetadata; issues: ValidationIssue[]; warnings: ValidationIssue[] }> {
  const issues: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  const metadata: FileMetadata = {};

  const content = buffer.toString('ascii', 0, Math.min(buffer.length, 5000));

  // Check AI version
  const versionMatch = content.match(/Adobe Illustrator ([\d.]+)/);
  if (versionMatch) {
    metadata.aiVersion = versionMatch[1];
    if (options.allowedVersions && !options.allowedVersions.includes(metadata.aiVersion)) {
      issues.push(createIssue(
        'error',
        'format',
        'unsupportedVersion',
        'critical',
        { version: metadata.aiVersion }
      ));
    }
  }

  // Check for PDF-based AI
  metadata.pdfVersion = content.match(/PDF-(\d+\.\d+)/)?.[1] || undefined;

  // Extract dimensions (basic client-side detection)
  const widthMatch = content.match(/Width\s*(\d+)/);
  const heightMatch = content.match(/Height\s*(\d+)/);
  if (widthMatch && heightMatch) {
    metadata.dimensions = {
      width: parseInt(widthMatch[1], 10),
      height: parseInt(heightMatch[1], 10),
    };
  }

  // Check for artboards
  const artboardMatch = content.match(/<artboard>/gi);
  if (artboardMatch) {
    metadata.pages = artboardMatch.length;
    if (artboardMatch.length > 1) {
      warnings.push(createIssue(
        'warning',
        'structure',
        'multipleArtboards',
        'minor',
        { count: artboardMatch.length }
      ));
    }
  } else {
    issues.push(createIssue('error', 'structure', 'noArtboards', 'critical'));
  }

  // Check for embedded images
  const imageMatches = content.match(/<image>/gi);
  if (imageMatches) {
    metadata.images = imageMatches.length;
    if (metadata.images > 0) {
      warnings.push(createIssue(
        'warning',
        'image',
        'embeddedImagesWarning',
        'minor',
        { count: metadata.images }
      ));
    }
  }

  // Client-side limitations note
  warnings.push(createIssue('warning', 'format', 'invalidPDFFormat', 'minor'));

  return { metadata, issues, warnings };
}

/**
 * Validate AI file (client-side)
 */
export async function validateAIFile(
  buffer: Buffer,
  fileName: string,
  options: ValidationOptions = {}
): Promise<ValidationResult> {
  const opts = { ...DEFAULT_VALIDATION_OPTIONS, ...options };
  const issues: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  // File size check
  if (opts.maxSize && buffer.length > opts.maxSize) {
    issues.push(createIssue(
      'error',
      'format',
      'fileSizeTooLarge',
      'critical',
      { size: formatFileSize(buffer.length), max: formatFileSize(opts.maxSize!) }
    ));
  }

  // Detect file type
  const fileType = detectFileType(buffer);
  if (fileType !== 'AI') {
    issues.push(createIssue('error', 'format', 'invalidAIFormat', 'critical'));
  }

  // Validate structure
  const { metadata, issues: structureIssues, warnings: structureWarnings } =
    await validateAIFileStructure(buffer, opts);
  issues.push(...structureIssues);
  warnings.push(...structureWarnings);

  // Determine overall validity
  const criticalErrors = issues.filter(i => i.severity === 'critical').length;
  const valid = criticalErrors === 0;

  return {
    valid,
    fileType: 'AI',
    fileName,
    fileSize: buffer.length,
    issues,
    warnings,
    metadata,
    validatedAt: new Date().toISOString(),
  };
}

// ============================================================
// PDF File Validation (Client-side)
// ============================================================

/**
 * Validate PDF file structure
 */
async function validatePDFFileStructure(
  buffer: Buffer,
  options: ValidationOptions
): Promise<{ metadata: FileMetadata; issues: ValidationIssue[]; warnings: ValidationIssue[] }> {
  const issues: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  const metadata: FileMetadata = {};

  const content = buffer.toString('ascii', 0, Math.min(buffer.length, 5000));

  // Extract PDF version
  const versionMatch = content.match(/PDF-(\d+\.\d+)/);
  if (versionMatch) {
    metadata.pdfVersion = versionMatch[1];
    const [major] = metadata.pdfVersion.split('.').map(Number);
    if (major < 1) {
      issues.push(createIssue('error', 'format', 'unsupportedVersion', 'critical', {
        version: metadata.pdfVersion,
      }));
    }
  }

  // Check for page count (basic)
  const pageMatches = content.match(/\/Type\s*\/Page[^s]/g);
  if (pageMatches) {
    metadata.pages = pageMatches.length;
  }

  // Check for trim box
  if (content.includes('/TrimBox')) {
    const trimMatch = content.match(/\/TrimBox\s*\[([\d\s.]+)\]/);
    if (trimMatch) {
      const coords = trimMatch[1].trim().split(/\s+/).map(Number);
      if (coords.length === 4) {
        metadata.trimBox = {
          width: coords[2] - coords[0],
          height: coords[3] - coords[1],
        };
      }
    }
  }

  // Check for bleed
  if (content.includes('/BleedBox')) {
    metadata.hasBleed = true;
    const bleedMatch = content.match(/\/BleedBox\s*\[([\d\s.]+)\]/);
    if (bleedMatch) {
      const coords = bleedMatch[1].trim().split(/\s+/).map(Number);
      if (coords.length === 4) {
        const trimMatch = content.match(/\/TrimBox\s*\[([\d\s.]+)\]/);
        if (trimMatch) {
          const trimCoords = trimMatch[1].trim().split(/\s+/).map(Number);
          metadata.bleedSize = Math.min(
            coords[0] - trimCoords[0],
            coords[1] - trimCoords[1]
          );
        }
      }
    }
  } else if (options.requireBleed) {
    issues.push(createIssue('error', 'dimension', 'noBleed', 'major', {
      size: options.bleedSize,
    }));
  }

  // Check for color mode (basic detection)
  if (content.includes('/DeviceRGB')) {
    warnings.push(createIssue('warning', 'color', 'rgbColorDetected', 'major'));
  }
  if (content.includes('/DeviceCMYK')) {
    metadata.colorMode = 'CMYK';
  }

  return { metadata, issues, warnings };
}

/**
 * Validate PDF file (client-side)
 */
export async function validatePDFFile(
  buffer: Buffer,
  fileName: string,
  options: ValidationOptions = {}
): Promise<ValidationResult> {
  const opts = { ...DEFAULT_VALIDATION_OPTIONS, ...options };
  const issues: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  // File size check
  if (opts.maxSize && buffer.length > opts.maxSize) {
    issues.push(createIssue(
      'error',
      'format',
      'fileSizeTooLarge',
      'critical',
      { size: formatFileSize(buffer.length), max: formatFileSize(opts.maxSize!) }
    ));
  }

  // Detect file type
  const fileType = detectFileType(buffer);
  if (fileType !== 'PDF') {
    issues.push(createIssue('error', 'format', 'invalidPDFFormat', 'critical'));
  }

  // Validate structure
  const { metadata, issues: structureIssues, warnings: structureWarnings } =
    await validatePDFFileStructure(buffer, opts);
  issues.push(...structureIssues);
  warnings.push(...structureWarnings);

  // Determine overall validity
  const criticalErrors = issues.filter(i => i.severity === 'critical').length;
  const valid = criticalErrors === 0;

  return {
    valid,
    fileType: 'PDF',
    fileName,
    fileSize: buffer.length,
    issues,
    warnings,
    metadata,
    validatedAt: new Date().toISOString(),
  };
}

// ============================================================
// PSD File Validation (Client-side)
// ============================================================

/**
 * Validate PSD file structure
 */
async function validatePSDFileStructure(
  buffer: Buffer,
  options: ValidationOptions
): Promise<{ metadata: FileMetadata; issues: ValidationIssue[]; warnings: ValidationIssue[] }> {
  const opts = { ...DEFAULT_VALIDATION_OPTIONS, ...options };
  const issues: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  const metadata: FileMetadata = {};

  // PSD header structure
  // Signature: 8BPS (bytes 0-3)
  // Version: 1 (bytes 4-5)
  // Reserved: 6 bytes (6-11)
  // Channels: 2 bytes (12-13)
  // Height: 4 bytes (14-17)
  // Width: 4 bytes (18-21)
  // Depth: 2 bytes (22-23)
  // Color Mode: 2 bytes (24-25)

  if (buffer.length < 26) {
    issues.push(createIssue('error', 'format', 'invalidPSDFormat', 'critical'));
    return { metadata, issues, warnings };
  }

  // Read dimensions
  const height = buffer.readUInt32BE(14);
  const width = buffer.readUInt32BE(18);
  metadata.dimensions = { width, height };

  // Read bit depth
  const depth = buffer.readUInt16BE(22);
  metadata.dpi = depth;

  if (depth < 8) {
    issues.push(createIssue('error', 'format', 'invalidDimensions', 'critical', {
      width,
      height,
    }));
  }

  // Read color mode
  const colorMode = buffer.readUInt16BE(24);
  switch (colorMode) {
    case 3: // RGB
      metadata.colorMode = 'RGB';
      warnings.push(createIssue('warning', 'color', 'rgbColorDetected', 'major'));
      break;
    case 4: // CMYK
      metadata.colorMode = 'CMYK';
      break;
    case 1: // Bitmap
    case 2: // Grayscale
    case 5: // HSL
    case 6: // HSB
    case 7: // Multichannel
    case 8: // Duotone
    case 9: // Lab
      metadata.colorMode = 'GRAY';
      break;
  }

  // Check for layers (basic detection)
  // Layer info section starts after color mode data and image resources
  let offset = 26;
  const colorModeDataLength = buffer.readUInt32BE(offset);
  offset += 4 + colorModeDataLength;
  const resourceLength = buffer.readUInt32BE(offset);
  offset += 4 + resourceLength;
  const layerAndMaskInfoLength = buffer.readUInt32BE(offset);

  if (layerAndMaskInfoLength > 0) {
    metadata.layers = 1; // At least one layer
  }

  // Resolution check (PSD usually 72 DPI, need to check metadata)
  if (metadata.dpi && opts.minDPI && metadata.dpi < opts.minDPI) {
    issues.push(createIssue('error', 'image', 'lowResolution', 'critical', {
      dpi: metadata.dpi,
      min: opts.minDPI,
    }));
  }

  return { metadata, issues, warnings };
}

/**
 * Validate PSD file (client-side)
 */
export async function validatePSDFile(
  buffer: Buffer,
  fileName: string,
  options: ValidationOptions = {}
): Promise<ValidationResult> {
  const opts = { ...DEFAULT_VALIDATION_OPTIONS, ...options };
  const issues: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  // File size check
  if (opts.maxSize && buffer.length > opts.maxSize) {
    issues.push(createIssue(
      'error',
      'format',
      'fileSizeTooLarge',
      'critical',
      { size: formatFileSize(buffer.length), max: formatFileSize(opts.maxSize!) }
    ));
  }

  // Detect file type
  const fileType = detectFileType(buffer);
  if (fileType !== 'PSD') {
    issues.push(createIssue('error', 'format', 'invalidPSDFormat', 'critical'));
  }

  // Validate structure
  const { metadata, issues: structureIssues, warnings: structureWarnings } =
    await validatePSDFileStructure(buffer, opts);
  issues.push(...structureIssues);
  warnings.push(...structureWarnings);

  // Determine overall validity
  const criticalErrors = issues.filter(i => i.severity === 'critical').length;
  const valid = criticalErrors === 0;

  return {
    valid,
    fileType: 'PSD',
    fileName,
    fileSize: buffer.length,
    issues,
    warnings,
    metadata,
    validatedAt: new Date().toISOString(),
  };
}

// ============================================================
// Main Validation Function
// ============================================================

/**
 * Validate any design file
 */
export async function validateDesignFile(
  file: File,
  options: ValidationOptions = {}
): Promise<ValidationResult> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const fileType = detectFileType(buffer);

  if (!fileType) {
    return {
      valid: false,
      fileType: 'AI',
      fileName: file.name,
      fileSize: buffer.length,
      issues: [createIssue('error', 'format', 'invalidAIFormat', 'critical')],
      warnings: [],
      metadata: {},
      validatedAt: new Date().toISOString(),
    };
  }

  switch (fileType) {
    case 'AI':
      return validateAIFile(buffer, file.name, options);
    case 'PDF':
      return validatePDFFile(buffer, file.name, options);
    case 'PSD':
      return validatePSDFile(buffer, file.name, options);
    default:
      return {
        valid: false,
        fileType: 'AI',
        fileName: file.name,
        fileSize: buffer.length,
        issues: [createIssue('error', 'format', 'invalidAIFormat', 'critical')],
        warnings: [],
        metadata: {},
        validatedAt: new Date().toISOString(),
      };
  }
}

// ============================================================
// Exports
// ============================================================

export default {
  validateAIFile,
  validatePDFFile,
  validatePSDFile,
  validateDesignFile,
  detectFileType,
  formatFileSize,
  ERROR_MESSAGES,
};
