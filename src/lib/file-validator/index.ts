/**
 * File Validator Module Index
 *
 * Exports all file validation functionality
 */

// Type exports
export type {
  FileType,
  ValidationCategory,
  IssueType,
  IssueSeverity,
  ColorMode,
  ValidationIssue,
  FileMetadata,
  ValidationResult,
  ValidationOptions,
} from './ai-validator';

export type {
  PDFMetadata,
  ImageMetadata,
} from './server-validator';

export type {
  IngestionResult,
  IngestionOptions,
  StoredFileRecord,
} from './file-ingestion';

export type {
  SecurityValidationResult,
  SecurityError,
  SecurityWarning,
  SecurityValidationOptions,
} from './security-validator';

// Client-side validation
export {
  validateAIFile,
  validatePDFFile,
  validatePSDFile,
  validateDesignFile,
  detectFileType,
  formatFileSize,
  ERROR_MESSAGES,
} from './ai-validator';

// Server-side validation
export {
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
} from './server-validator';

// File ingestion
export {
  ingestDesignFile,
  ingestMultipleFiles,
  revalidateFile,
  getFile,
  listFiles,
  deleteFile,
} from './file-ingestion';

// Security validation
export {
  validateFileSecurity,
  quickValidateFile,
  fullValidateFile,
  scanForViruses,
  SECURITY_CONSTANTS,
} from './security-validator';

// Default export
import fileValidator from './ai-validator';
import serverValidator from './server-validator';
import fileIngestion from './file-ingestion';
import securityValidator from './security-validator';

export default {
  ...fileValidator,
  ...serverValidator,
  ...fileIngestion,
  ...securityValidator,
};
