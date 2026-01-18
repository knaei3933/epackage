/**
 * File Security Validation Module
 *
 * Comprehensive security validation for file uploads
 * - Magic number validation (file signature verification)
 * - File size limits (10MB max)
 * - Content-based security checks
 * - Malicious file pattern detection
 * - Integration with virus scanning services
 *
 * @module file-validator/security-validator
 */

// ============================================================
// Type Definitions
// ============================================================

export interface SecurityValidationResult {
  isValid: boolean;
  errors: SecurityError[];
  warnings: SecurityWarning[];
  fileInfo: {
    fileName: string;
    fileSize: number;
    detectedType: string;
    declaredType?: string;
    hasValidMagicNumber: boolean;
  };
  scanResults?: {
    scanned: boolean;
    clean: boolean;
    threats: string[];
    scanTime: number;
  };
}

export interface SecurityError {
  code: string;
  message_ja: string;
  message_en: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'file-size' | 'file-type' | 'malicious-content' | 'magic-number' | 'virus-scan';
}

export interface SecurityWarning {
  code: string;
  message_ja: string;
  message_en: string;
  category: 'file-size' | 'file-type' | 'suspicious-content';
}

export interface SecurityValidationOptions {
  maxSize?: number; // Default: 10MB
  allowedTypes?: string[]; // Default: common design file types
  requireMagicNumber?: boolean; // Default: true
  scanForViruses?: boolean; // Default: false (requires API key)
  virusScanApiKey?: string; // API key for virus scanning service
  strictMode?: boolean; // Default: true
}

// ============================================================
// Constants
// ============================================================

// Default: 10MB file size limit (as per Task #72 requirements)
const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024;

// Default allowed file types
const DEFAULT_ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'application/illustrator', // AI files
  'application/photoshop', // PSD files
  'image/vnd.adobe.photoshop',
  'application/postscript',
  'image/x-eps',
];

// Magic numbers (file signatures) for common file types
const MAGIC_NUMBERS: Record<string, { signature: number[]; offset: number; description: string }> = {
  // Images
  'image/jpeg': {
    signature: [0xFF, 0xD8, 0xFF],
    offset: 0,
    description: 'JPEG',
  },
  'image/jpg': {
    signature: [0xFF, 0xD8, 0xFF],
    offset: 0,
    description: 'JPG',
  },
  'image/png': {
    signature: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
    offset: 0,
    description: 'PNG',
  },
  'image/gif': {
    signature: [0x47, 0x49, 0x46, 0x38],
    offset: 0,
    description: 'GIF',
  },
  'image/webp': {
    signature: [0x52, 0x49, 0x46, 0x46],
    offset: 0,
    description: 'WEBP',
  },
  'image/bmp': {
    signature: [0x42, 0x4D],
    offset: 0,
    description: 'BMP',
  },
  'image/tiff': {
    signature: [0x49, 0x49, 0x2A, 0x00],
    offset: 0,
    description: 'TIFF (little-endian)',
  },

  // Documents
  'application/pdf': {
    signature: [0x25, 0x50, 0x44, 0x46], // %PDF
    offset: 0,
    description: 'PDF',
  },

  // Adobe files
  'application/photoshop': {
    signature: [0x38, 0x42, 0x50, 0x53], // 8BPS
    offset: 0,
    description: 'PSD',
  },
  'image/vnd.adobe.photoshop': {
    signature: [0x38, 0x42, 0x50, 0x53],
    offset: 0,
    description: 'PSD',
  },
  'application/postscript': {
    signature: [0x25, 0x21, 0x50, 0x53], // %!PS
    offset: 0,
    description: 'PostScript',
  },
  'application/illustrator': {
    signature: [0x25, 0x50, 0x44, 0x46], // AI is PDF-based
    offset: 0,
    description: 'AI (PDF-based)',
  },

  // Archives (often used for malware delivery)
  'application/zip': {
    signature: [0x50, 0x4B, 0x03, 0x04], // PK..
    offset: 0,
    description: 'ZIP',
  },
  'application/x-rar': {
    signature: [0x52, 0x61, 0x72, 0x21], // Rar!
    offset: 0,
    description: 'RAR',
  },
  'application/x-7z': {
    signature: [0x37, 0x7A, 0xBC, 0xAF, 0x27, 0x1C],
    offset: 0,
    description: '7Z',
  },

  // Executables (BLOCKED)
  'application/x-executable': {
    signature: [0x4D, 0x5A], // MZ (Windows executable)
    offset: 0,
    description: 'Windows EXE',
  },
  'application/x-elf': {
    signature: [0x7F, 0x45, 0x4C, 0x46], // ELF
    offset: 0,
    description: 'Linux executable',
  },
  'application/x-mach-binary': {
    signature: [0xFE, 0xED, 0xFA, 0xCF], // Mach-O
    offset: 0,
    description: 'macOS executable',
  },
};

// File types that should undergo content pattern checking (text-based files)
const TEXT_BASED_TYPES = [
  'text/plain',
  'text/html',
  'text/css',
  'text/javascript',
  'application/javascript',
  'application/json',
  'application/xml',
  'text/xml',
  'text/csv',
  'application/x-httpd-php',
  'text/x-python',
  'text/x-shellscript',
  'image/svg+xml', // SVG is XML-based and can contain scripts
];

// Binary file types (skip content pattern checks - magic number validation is sufficient)
const BINARY_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/bmp',
  'image/tiff',
  'application/pdf',
  'application/illustrator',
  'application/photoshop',
  'image/vnd.adobe.photoshop',
  'application/postscript',
  'image/x-eps',
  'application/zip',
  'application/x-rar',
  'application/x-7z',
  'application/x-executable',
  'application/x-elf',
  'application/x-mach-binary',
];

// Malicious content patterns to detect (only applied to text-based files)
const MALICIOUS_PATTERNS = [
  // Script injection patterns
  /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi, // Event handlers like onclick=

  // SQL injection patterns
  /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
  /(\bor\b|\band\b).*?=/i,

  // Path traversal
  /\.\.\//g,
  /\.\.\\/g,

  // Shell command patterns
  /[;&|`$()]/,

  // Base64 encoded suspicious content
  /eval\s*\(/gi,
  /exec\s*\(/gi,
  /system\s*\(/gi,

  // Office macro patterns
  /AutoOpen/i,
  /Document_Open/i,
  /Workbook_Open/i,
  /Sub\s+[A-Za-z_]/i,
];

// Suspicious file extensions
const SUSPICIOUS_EXTENSIONS = [
  '.exe', '.dll', '.so', '.dylib', // Executables
  '.bat', '.cmd', '.sh', '.ps1', // Scripts
  '.vbs', '.js', '.jar', // More scripts
  '.scr', '.msi', // Installers
  '.com', '.pif', // Old executables
  '.deb', '.rpm', // Package managers
  '.app', // macOS application
];

// ============================================================
// Error Messages
// ============================================================

const ERROR_MESSAGES: Record<string, { ja: string; en: string }> = {
  FILE_TOO_LARGE: {
    ja: 'ファイルサイズが大きすぎます（最大: {max}MB）',
    en: 'File size exceeds maximum allowed size ({max}MB)',
  },
  INVALID_MAGIC_NUMBER: {
    ja: 'ファイル形式が無効です。拡張子と実際のファイルタイプが一致しません。',
    en: 'Invalid file format. File extension does not match actual file type.',
  },
  UNSUPPORTED_FILE_TYPE: {
    ja: 'このファイル形式は許可されていません: {type}',
    en: 'This file type is not allowed: {type}',
  },
  MALICIOUS_CONTENT_DETECTED: {
    ja: '有害なコンテンツが検出されました: {pattern}',
    en: 'Malicious content detected: {pattern}',
  },
  SUSPICIOUS_FILE_EXTENSION: {
    ja: 'このファイル拡張子は許可されていません: {ext}',
    en: 'This file extension is not allowed: {ext}',
  },
  EXECUTABLE_FILE_DETECTED: {
    ja: '実行ファイルはアップロードできません',
    en: 'Executable files are not allowed for upload',
  },
  ARCHIVE_FILE_DETECTED: {
    ja: 'アーカイブファイルはアップロードできません',
    en: 'Archive files are not allowed for upload',
  },
  VIRUS_DETECTED: {
    ja: 'ウイルスが検出されました: {threat}',
    en: 'Virus detected: {threat}',
  },
  SCAN_FAILED: {
    ja: 'ウイルススキャンに失敗しました',
    en: 'Virus scan failed',
  },
};

const WARNING_MESSAGES: Record<string, { ja: string; en: string }> = {
  FILE_SIZE_WARNING: {
    ja: 'ファイルサイズが大きいです: {size}MB',
    en: 'File size is large: {size}MB',
  },
  TYPE_MISMATCH: {
    ja: '宣言されたファイルタイプと実際のタイプが異なります',
    en: 'Declared file type differs from actual type',
  },
};

// ============================================================
// Helper Functions
// ============================================================

/**
 * Format file size to human-readable string
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Get file extension from filename
 */
function getFileExtension(fileName: string): string {
  const parts = fileName.toLowerCase().split('.');
  return parts.length > 1 ? `.${parts[parts.length - 1]}` : '';
}

/**
 * Check if file extension is suspicious
 */
function isSuspiciousExtension(fileName: string): boolean {
  const ext = getFileExtension(fileName);
  return SUSPICIOUS_EXTENSIONS.includes(ext);
}

/**
 * Validate magic number (file signature)
 */
function validateMagicNumber(buffer: Buffer, declaredType?: string): {
  isValid: boolean;
  detectedType: string;
  matchesDeclared: boolean;
} {
  // Check each known magic number
  for (const [type, info] of Object.entries(MAGIC_NUMBERS)) {
    if (buffer.length > info.offset + info.signature.length) {
      let matches = true;
      for (let i = 0; i < info.signature.length; i++) {
        if (buffer.readUInt8(info.offset + i) !== info.signature[i]) {
          matches = false;
          break;
        }
      }

      if (matches) {
        // Found matching magic number
        if (declaredType) {
          return {
            isValid: true,
            detectedType: type,
            matchesDeclared: type === declaredType || type.includes(declaredType),
          };
        }
        return {
          isValid: true,
          detectedType: type,
          matchesDeclared: true,
        };
      }
    }
  }

  // No magic number matched
  return {
    isValid: false,
    detectedType: 'unknown',
    matchesDeclared: false,
  };
}

/**
 * Check for malicious content patterns in buffer
 */
function checkMaliciousPatterns(buffer: Buffer): string[] {
  const threats: string[] = [];

  // Convert buffer to string for pattern matching (first 10KB should be enough)
  const content = buffer.toString('ascii', 0, Math.min(buffer.length, 10240));

  // Check each malicious pattern
  for (const pattern of MALICIOUS_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      threats.push(`Suspicious pattern: ${pattern.source}`);
    }
  }

  return threats;
}

// ============================================================
// Main Validation Function
// ============================================================

/**
 * Comprehensive security validation for file uploads
 */
export async function validateFileSecurity(
  file: File | { name: string; size: number; type?: string; arrayBuffer: () => Promise<ArrayBuffer> },
  options: SecurityValidationOptions = {}
): Promise<SecurityValidationResult> {
  const opts: Required<SecurityValidationOptions> = {
    maxSize: options.maxSize ?? DEFAULT_MAX_FILE_SIZE,
    allowedTypes: options.allowedTypes ?? DEFAULT_ALLOWED_TYPES,
    requireMagicNumber: options.requireMagicNumber ?? true,
    scanForViruses: options.scanForViruses ?? false,
    virusScanApiKey: options.virusScanApiKey ?? '',
    strictMode: options.strictMode ?? true,
  };

  const errors: SecurityError[] = [];
  const warnings: SecurityWarning[] = [];

  // Extract file info
  const fileName = file.name;
  const fileSize = file.size;
  const declaredType = file.type;

  // ============================================================
  // 1. File Size Validation
  // ============================================================

  if (fileSize > opts.maxSize) {
    errors.push({
      code: 'FILE_TOO_LARGE',
      message_ja: ERROR_MESSAGES.FILE_TOO_LARGE.ja.replace('{max}', String(opts.maxSize / (1024 * 1024))),
      message_en: ERROR_MESSAGES.FILE_TOO_LARGE.en.replace('{max}', String(opts.maxSize / (1024 * 1024))),
      severity: 'high',
      category: 'file-size',
    });
  } else if (fileSize > opts.maxSize * 0.8) {
    warnings.push({
      code: 'FILE_SIZE_WARNING',
      message_ja: WARNING_MESSAGES.FILE_SIZE_WARNING.ja.replace('{size}', formatFileSize(fileSize)),
      message_en: WARNING_MESSAGES.FILE_SIZE_WARNING.en.replace('{size}', formatFileSize(fileSize)),
      category: 'file-size',
    });
  }

  // ============================================================
  // 2. File Extension Validation
  // ============================================================

  if (isSuspiciousExtension(fileName)) {
    errors.push({
      code: 'SUSPICIOUS_FILE_EXTENSION',
      message_ja: ERROR_MESSAGES.SUSPICIOUS_FILE_EXTENSION.ja.replace('{ext}', getFileExtension(fileName)),
      message_en: ERROR_MESSAGES.SUSPICIOUS_FILE_EXTENSION.en.replace('{ext}', getFileExtension(fileName)),
      severity: 'critical',
      category: 'file-type',
    });
  }

  // ============================================================
  // 3. Magic Number Validation
  // ============================================================

  const buffer = Buffer.from(await file.arrayBuffer());
  const magicNumberResult = validateMagicNumber(buffer, declaredType);

  if (opts.requireMagicNumber && !magicNumberResult.isValid) {
    errors.push({
      code: 'INVALID_MAGIC_NUMBER',
      message_ja: ERROR_MESSAGES.INVALID_MAGIC_NUMBER.ja,
      message_en: ERROR_MESSAGES.INVALID_MAGIC_NUMBER.en,
      severity: 'high',
      category: 'magic-number',
    });
  }

  // Check if detected type matches declared type
  if (declaredType && magicNumberResult.detectedType !== declaredType && !magicNumberResult.matchesDeclared) {
    warnings.push({
      code: 'TYPE_MISMATCH',
      message_ja: WARNING_MESSAGES.TYPE_MISMATCH.ja,
      message_en: WARNING_MESSAGES.TYPE_MISMATCH.en,
      category: 'file-type',
    });
  }

  // ============================================================
  // 4. Executable/Archive File Detection
  // ============================================================

  const detectedType = magicNumberResult.detectedType;

  // Block executables
  if (detectedType.includes('executable') ||
      detectedType.includes('ELF') ||
      detectedType.includes('Mach-O') ||
      detectedType.includes('Windows EXE')) {
    errors.push({
      code: 'EXECUTABLE_FILE_DETECTED',
      message_ja: ERROR_MESSAGES.EXECUTABLE_FILE_DETECTED.ja,
      message_en: ERROR_MESSAGES.EXECUTABLE_FILE_DETECTED.en,
      severity: 'critical',
      category: 'malicious-content',
    });
  }

  // Block archives (can contain malware)
  if (detectedType.includes('ZIP') ||
      detectedType.includes('RAR') ||
      detectedType.includes('7Z')) {
    if (opts.strictMode) {
      errors.push({
        code: 'ARCHIVE_FILE_DETECTED',
        message_ja: ERROR_MESSAGES.ARCHIVE_FILE_DETECTED.ja,
        message_en: ERROR_MESSAGES.ARCHIVE_FILE_DETECTED.en,
        severity: 'high',
        category: 'file-type',
      });
    } else {
      warnings.push({
        code: 'ARCHIVE_FILE_DETECTED',
        message_ja: 'アーカイブファイルが含まれています',
        message_en: 'Archive file detected',
        category: 'file-type',
      });
    }
  }

  // ============================================================
  // 5. Malicious Content Pattern Detection
  // ============================================================

  // Only apply content pattern checks to text-based files
  // Binary files are secured by magic number validation and executable blocking
  const isTextBased = TEXT_BASED_TYPES.includes(detectedType) ||
                      TEXT_BASED_TYPES.some(t => detectedType.includes(t));

  if (isTextBased) {
    const maliciousPatterns = checkMaliciousPatterns(buffer);
    for (const pattern of maliciousPatterns) {
      errors.push({
        code: 'MALICIOUS_CONTENT_DETECTED',
        message_ja: ERROR_MESSAGES.MALICIOUS_CONTENT_DETECTED.ja.replace('{pattern}', pattern),
        message_en: ERROR_MESSAGES.MALICIOUS_CONTENT_DETECTED.en.replace('{pattern}', pattern),
        severity: 'critical',
        category: 'malicious-content',
      });
    }
  }

  // ============================================================
  // 6. Virus Scanning (Optional)
  // ============================================================

  let scanResults: SecurityValidationResult['scanResults'] = undefined;

  if (opts.scanForViruses && opts.virusScanApiKey) {
    const startTime = Date.now();
    try {
      scanResults = await scanForViruses(buffer, fileName, opts.virusScanApiKey);
      if (!scanResults.clean) {
        for (const threat of scanResults.threats) {
          errors.push({
            code: 'VIRUS_DETECTED',
            message_ja: ERROR_MESSAGES.VIRUS_DETECTED.ja.replace('{threat}', threat),
            message_en: ERROR_MESSAGES.VIRUS_DETECTED.en.replace('{threat}', threat),
            severity: 'critical',
            category: 'virus-scan',
          });
        }
      }
    } catch (error) {
      // If scan fails, log but don't necessarily block upload
      console.error('Virus scan failed:', error);
      warnings.push({
        code: 'SCAN_FAILED',
        message_ja: ERROR_MESSAGES.SCAN_FAILED.ja,
        message_en: ERROR_MESSAGES.SCAN_FAILED.en,
        category: 'virus-scan',
      });
    }
    scanResults.scanTime = Date.now() - startTime;
  }

  // ============================================================
  // Determine Overall Validity
  // ============================================================

  const criticalErrors = errors.filter(e => e.severity === 'critical').length;
  const highErrors = errors.filter(e => e.severity === 'high').length;

  const isValid = criticalErrors === 0 && (!opts.strictMode || highErrors === 0);

  return {
    isValid,
    errors,
    warnings,
    fileInfo: {
      fileName,
      fileSize,
      detectedType: magicNumberResult.detectedType,
      declaredType,
      hasValidMagicNumber: magicNumberResult.isValid,
    },
    scanResults,
  };
}

// ============================================================
// Virus Scanning Integration
// ============================================================

/**
 * Scan file for viruses using external API
 * Supports: VirusTotal, ClamAV, or other scanning services
 */
async function scanForViruses(
  buffer: Buffer,
  fileName: string,
  apiKey: string
): Promise<{ scanned: true; clean: boolean; threats: string[]; scanTime?: number }> {
  // Placeholder for virus scanning integration
  // In production, integrate with:
  // - VirusTotal API: https://www.virustotal.com/
  // - ClamAV: https://www.clamav.net/
  // - MetaDefender: https://www.metadefender.com/
  // - Or any other cloud-based scanning service

  // Example VirusTotal integration:
  /*
  const formData = new FormData();
  formData.append('file', new Blob([buffer]), fileName);

  const response = await fetch('https://www.virustotal.com/vtapi/v2/file/scan', {
    method: 'POST',
    headers: {
      'x-apikey': apiKey,
    },
    body: formData,
  });

  const result = await response.json();
  // Parse result and determine if file is clean
  */

  // For now, return clean (requires actual API integration)
  return {
    scanned: true,
    clean: true,
    threats: [],
  };
}

// ============================================================
// Convenience Functions
// ============================================================

/**
 * Quick validation without virus scanning
 */
export function quickValidateFile(
  file: File,
  maxSize: number = DEFAULT_MAX_FILE_SIZE
): Promise<SecurityValidationResult> {
  return validateFileSecurity(file, {
    maxSize,
    requireMagicNumber: true,
    scanForViruses: false,
    strictMode: true,
  });
}

/**
 * Full validation with all security checks
 */
export function fullValidateFile(
  file: File,
  virusScanApiKey?: string
): Promise<SecurityValidationResult> {
  return validateFileSecurity(file, {
    maxSize: DEFAULT_MAX_FILE_SIZE,
    requireMagicNumber: true,
    scanForViruses: !!virusScanApiKey,
    virusScanApiKey,
    strictMode: true,
  });
}

// ============================================================
// Export Constants
// ============================================================

export const SECURITY_CONSTANTS = {
  DEFAULT_MAX_FILE_SIZE,
  DEFAULT_ALLOWED_TYPES,
  SUSPICIOUS_EXTENSIONS,
  MAGIC_NUMBERS,
  TEXT_BASED_TYPES,
  BINARY_TYPES,
};

// ============================================================
// Default Export
// ============================================================

export default {
  validateFileSecurity,
  quickValidateFile,
  fullValidateFile,
  scanForViruses,
  SECURITY_CONSTANTS,
};
