/**
 * Server-Side File Validation System
 *
 * Uses Sharp, pdf-parse, and other server-side libraries
 * for comprehensive file validation
 *
 * @module file-validator/server-validator
 */

import sharp from 'sharp';

// Type imports from ai-validator
import type {
  ValidationResult,
  FileMetadata,
  ValidationOptions,
  ValidationIssue,
  ColorMode,
} from './ai-validator';

// ============================================================
// PDF Metadata Extraction
// ============================================================

/**
 * PDF metadata structure
 */
export interface PDFMetadata {
  version: string;
  pages: number;
  dimensions?: { width: number; height: number };
  colorMode?: ColorMode;
  hasFonts: boolean;
  fonts: string[];
  hasImages: boolean;
  imageCount: number;
  hasBleed: boolean;
  bleedSize?: number;
  trimBox?: { width: number; height: number };
  dpi?: number;
}

/**
 * Extract metadata from PDF buffer
 * Note: This is a simplified implementation. For production,
 * consider using pdf2json or pdf-lib for comprehensive parsing
 */
export async function extractPDFMetadata(buffer: Buffer): Promise<PDFMetadata> {
  const content = buffer.toString('ascii', 0, Math.min(buffer.length, 10000));
  const metadata: PDFMetadata = {
    version: '1.4',
    pages: 1,
    hasFonts: false,
    fonts: [],
    hasImages: false,
    imageCount: 0,
    hasBleed: false,
  };

  // Extract PDF version
  const versionMatch = content.match(/PDF-(\d+\.\d+)/);
  if (versionMatch) {
    metadata.version = versionMatch[1];
  }

  // Count pages
  const pageMatches = content.match(/\/Type\s*\/Page[^s]/g);
  if (pageMatches) {
    metadata.pages = pageMatches.length;
  }

  // Extract dimensions from MediaBox
  const mediaBoxMatch = content.match(/\/MediaBox\s*\[([\d\s.]+)\]/);
  if (mediaBoxMatch) {
    const coords = mediaBoxMatch[1].trim().split(/\s+/).map(Number);
    if (coords.length === 4) {
      metadata.dimensions = {
        width: Math.round(coords[2] - coords[0]),
        height: Math.round(coords[3] - coords[1]),
      };
    }
  }

  // Extract TrimBox
  const trimBoxMatch = content.match(/\/TrimBox\s*\[([\d\s.]+)\]/);
  if (trimBoxMatch) {
    const coords = trimBoxMatch[1].trim().split(/\s+/).map(Number);
    if (coords.length === 4) {
      metadata.trimBox = {
        width: Math.round(coords[2] - coords[0]),
        height: Math.round(coords[3] - coords[1]),
      };
    }
  }

  // Extract BleedBox
  const bleedBoxMatch = content.match(/\/BleedBox\s*\[([\d\s.]+)\]/);
  if (bleedBoxMatch) {
    const coords = bleedBoxMatch[1].trim().split(/\s+/).map(Number);
    if (coords.length === 4) {
      metadata.hasBleed = true;
      if (metadata.trimBox) {
        metadata.bleedSize = Math.min(
          coords[0] - metadata.trimBox.width,
          coords[1] - metadata.trimBox.height
        );
      }
    }
  }

  // Detect color spaces
  if (content.includes('/DeviceCMYK') || content.includes('/Separation')) {
    metadata.colorMode = 'CMYK';
  } else if (content.includes('/DeviceRGB')) {
    metadata.colorMode = 'RGB';
  } else if (content.includes('/DeviceGray')) {
    metadata.colorMode = 'GRAY';
  }

  // Detect fonts
  const fontMatches = content.match(/\/BaseFont\s*\/(\S+)/g);
  if (fontMatches) {
    metadata.hasFonts = true;
    metadata.fonts = [...new Set(fontMatches.map(m => m.replace(/\/BaseFont\s*\//, '')))];
  }

  // Detect images
  const imageMatches = content.match(/\/Subtype\s*\/Image/g);
  if (imageMatches) {
    metadata.hasImages = true;
    metadata.imageCount = imageMatches.length;
  }

  return metadata;
}

// ============================================================
// Image Validation with Sharp
// ============================================================

/**
 * Image metadata from Sharp
 */
export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  colorSpace: string;
  channels: number;
  dpi?: number;
  hasAlpha: boolean;
}

/**
 * Validate image resolution using Sharp
 */
export async function validateImageResolution(buffer: Buffer): Promise<number> {
  try {
    const metadata = await sharp(buffer).metadata();
    return metadata.density || 72; // Default to 72 DPI if not specified
  } catch (error) {
    console.error('Error reading image resolution:', error);
    return 72;
  }
}

/**
 * Extract comprehensive image metadata
 */
export async function extractImageMetadata(buffer: Buffer): Promise<ImageMetadata> {
  const metadata = await sharp(buffer).metadata();

  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
    format: metadata.format || 'unknown',
    colorSpace: metadata.space || 'srgb',
    channels: metadata.channels || 3,
    dpi: metadata.density,
    hasAlpha: (metadata.channels || 3) === 4,
  };
}

/**
 * Check if image is CMYK color mode
 */
export async function checkColorSpace(buffer: Buffer): Promise<ColorMode> {
  try {
    const metadata = await sharp(buffer).metadata();
    const space = metadata.space?.toLowerCase();

    if (space === 'cmyk') {
      return 'CMYK';
    } else if (space === 'rgb' || space === 'srgb') {
      return 'RGB';
    } else {
      return 'GRAY';
    }
  } catch (error) {
    console.error('Error checking color space:', error);
    return 'RGB';
  }
}

/**
 * Generate thumbnail from image
 */
export async function generateThumbnail(
  buffer: Buffer,
  maxWidth: number = 300,
  maxHeight: number = 300,
  quality: number = 80
): Promise<Buffer> {
  return sharp(buffer)
    .resize(maxWidth, maxHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({ quality })
    .toBuffer();
}

/**
 * Generate preview image (larger than thumbnail)
 */
export async function generatePreview(
  buffer: Buffer,
  maxWidth: number = 1200,
  maxHeight: number = 1200,
  quality: number = 85
): Promise<Buffer> {
  return sharp(buffer)
    .resize(maxWidth, maxHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({ quality })
    .toBuffer();
}

// ============================================================
// Server-Side Comprehensive Validation
// ============================================================

/**
 * Comprehensive server-side validation for AI files
 */
export async function validateAIFileServer(
  buffer: Buffer,
  fileName: string,
  options: ValidationOptions = {}
): Promise<ValidationResult> {
  // Import client-side validator
  const { validateAIFile } = await import('./ai-validator');

  // Run client-side validation first
  const clientResult = await validateAIFile(buffer, fileName, options);

  // Enhanced server-side checks
  const issues: typeof clientResult.issues = [...clientResult.issues];
  const warnings: typeof clientResult.warnings = [...clientResult.warnings];
  const metadata: FileMetadata = { ...clientResult.metadata };

  // Check for embedded images and validate their resolution
  if (options.checkImages && metadata.images && metadata.images > 0) {
    // Note: Actual image extraction from AI files requires additional libraries
    // This is a placeholder for server-side image validation
    warnings.push({
      type: 'warning',
      category: 'image',
      message_ja: '埋め込み画像の解像度チェックには追加処理が必要です',
      message_en: 'Embedded image resolution check requires additional processing',
      severity: 'minor',
    });
  }

  return {
    ...clientResult,
    issues,
    warnings,
    metadata,
  };
}

/**
 * Comprehensive server-side validation for PDF files
 */
export async function validatePDFFileServer(
  buffer: Buffer,
  fileName: string,
  options: ValidationOptions = {}
): Promise<ValidationResult> {
  // Import client-side validator and messages
  const { validatePDFFile, ERROR_MESSAGES } = await import('./ai-validator');
  const opts = {
    maxSize: 10 * 1024 * 1024, // 10MB (Task #72 requirement)
    requireBleed: true,
    bleedSize: 3,
    minDPI: 300,
    ...options,
  };

  // Run client-side validation first
  const clientResult = await validatePDFFile(buffer, fileName, opts);

  // Extract PDF metadata
  const pdfMetadata = await extractPDFMetadata(buffer);
  const metadata: FileMetadata = {
    ...clientResult.metadata,
    ...pdfMetadata,
  };

  const issues: typeof clientResult.issues = [...clientResult.issues];
  const warnings: typeof clientResult.warnings = [...clientResult.warnings];

  // Enhanced color mode validation
  if (metadata.colorMode && metadata.colorMode !== 'CMYK') {
    issues.push({
      type: 'error',
      category: 'color',
      message_ja: ERROR_MESSAGES.colorModeNotCMYK.ja.replace('{mode}', metadata.colorMode),
      message_en: ERROR_MESSAGES.colorModeNotCMYK.en.replace('{mode}', metadata.colorMode),
      severity: 'major',
      current: metadata.colorMode,
      expected: 'CMYK',
    });
  }

  // Enhanced bleed validation
  if (opts.requireBleed && !metadata.hasBleed) {
    issues.push({
      type: 'error',
      category: 'dimension',
      message_ja: ERROR_MESSAGES.noBleed.ja.replace('{size}', String(opts.bleedSize)),
      message_en: ERROR_MESSAGES.noBleed.en.replace('{size}', String(opts.bleedSize)),
      severity: 'major',
      expected: `${opts.bleedSize}mm`,
    });
  } else if (
    metadata.bleedSize &&
    opts.bleedSize &&
    metadata.bleedSize < opts.bleedSize
  ) {
    issues.push({
      type: 'error',
      category: 'dimension',
      message_ja: ERROR_MESSAGES.insufficientBleed.ja
        .replace('{current}', String(metadata.bleedSize))
        .replace('{required}', String(opts.bleedSize)),
      message_en: ERROR_MESSAGES.insufficientBleed.en
        .replace('{current}', String(metadata.bleedSize))
        .replace('{required}', String(opts.bleedSize)),
      severity: 'major',
      current: metadata.bleedSize,
      expected: opts.bleedSize,
    });
  }

  // Validate dimensions
  if (metadata.dimensions) {
    const { width, height } = metadata.dimensions;
    if (width < 10 || height < 10) {
      issues.push({
        type: 'error',
        category: 'dimension',
        message_ja: ERROR_MESSAGES.dimensionsTooSmall.ja,
        message_en: ERROR_MESSAGES.dimensionsTooSmall.en,
        severity: 'critical',
      });
    }
  }

  // Check for embedded fonts
  if (opts.checkFonts && metadata.hasFonts && metadata.fonts && metadata.fonts.length > 0) {
    // In a real implementation, you would check if fonts are embedded
    // This is a placeholder
    warnings.push({
      type: 'warning',
      category: 'font',
      message_ja: `フォントが${metadata.fonts.length}種類検出されました。埋め込みを確認してください`,
      message_en: `${metadata.fonts.length} font(s) detected. Please verify they are embedded`,
      severity: 'minor',
    });
  }

  // Validate image resolution
  if (opts.checkImages && metadata.hasImages) {
    const imageCount = metadata.images ?? 0;
    warnings.push({
      type: 'warning',
      category: 'image',
      message_ja: `画像が${imageCount}個含まれています。解像度を確認してください`,
      message_en: `${imageCount} image(s) included. Please verify resolution`,
      severity: 'minor',
    });
  }

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

/**
 * Comprehensive server-side validation for PSD files
 */
export async function validatePSDFileServer(
  buffer: Buffer,
  fileName: string,
  options: ValidationOptions = {}
): Promise<ValidationResult> {
  // Import client-side validator
  const { validatePSDFile } = await import('./ai-validator');

  // Run client-side validation first
  const clientResult = await validatePSDFile(buffer, fileName, options);

  // Enhanced server-side checks
  const issues: typeof clientResult.issues = [...clientResult.issues];
  const warnings: typeof clientResult.warnings = [...clientResult.warnings];
  const metadata: FileMetadata = { ...clientResult.metadata };

  // Additional server-side validations could go here
  // For example, checking for hidden layers, smart objects, etc.

  return {
    ...clientResult,
    issues,
    warnings,
    metadata,
  };
}

// ============================================================
// File Thumbnail/Preview Generation
// ============================================================

/**
 * Generate thumbnail and preview for any supported file
 */
export async function generateFilePreviews(
  buffer: Buffer,
  fileType: 'AI' | 'PDF' | 'PSD'
): Promise<{
  thumbnail?: Buffer;
  preview?: Buffer;
}> {
  try {
    switch (fileType) {
      case 'AI':
      case 'PDF':
        // For AI/PDF, we would need to convert to image first
        // This requires additional libraries like ghostscript or pdf-img-convert
        // Placeholder implementation
        return {
          thumbnail: undefined,
          preview: undefined,
        };

      case 'PSD':
        // PSD can be directly processed by Sharp
        try {
          const thumbnail = await generateThumbnail(buffer);
          const preview = await generatePreview(buffer);
          return { thumbnail, preview };
        } catch (error) {
          console.error('Error processing PSD:', error);
          return {
            thumbnail: undefined,
            preview: undefined,
          };
        }

      default:
        return {
          thumbnail: undefined,
          preview: undefined,
        };
    }
  } catch (error) {
    console.error('Error generating previews:', error);
    return {
      thumbnail: undefined,
      preview: undefined,
    };
  }
}

// ============================================================
// Main Server-Side Validation Function
// ============================================================

/**
 * Validate any design file with server-side enhancements
 */
export async function validateFileServer(
  buffer: Buffer,
  fileName: string,
  options: ValidationOptions = {}
): Promise<ValidationResult> {
  // Import detectFileType
  const { detectFileType } = await import('./ai-validator');

  const fileType = detectFileType(buffer);

  if (!fileType) {
    return {
      valid: false,
      fileType: 'AI',
      fileName,
      fileSize: buffer.length,
      issues: [{
        type: 'error',
        category: 'format',
        message_ja: '対応していないファイル形式です',
        message_en: 'Unsupported file format',
        severity: 'critical',
      }],
      warnings: [],
      metadata: {},
      validatedAt: new Date().toISOString(),
    };
  }

  switch (fileType) {
    case 'AI':
      return validateAIFileServer(buffer, fileName, options);
    case 'PDF':
      return validatePDFFileServer(buffer, fileName, options);
    case 'PSD':
      return validatePSDFileServer(buffer, fileName, options);
    default:
      return {
        valid: false,
        fileType: 'AI',
        fileName,
        fileSize: buffer.length,
        issues: [{
          type: 'error',
          category: 'format',
          message_ja: '対応していないファイル形式です',
          message_en: 'Unsupported file format',
          severity: 'critical',
        }],
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
  validateAIFileServer,
  validatePDFFileServer,
  validatePSDFileServer,
  validateFileServer,
  extractPDFMetadata,
  validateImageResolution,
  extractImageMetadata,
  checkColorSpace,
  generateThumbnail,
  generatePreview,
  generateFilePreviews,
};
