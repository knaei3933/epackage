"use strict";
/**
 * File Naming Utility
 *
 * Handles parsing and generation of customer submission filenames
 * for the design revision workflow v2.
 *
 * Format: {language}_入稿データ_{order-number}_{date}
 * Example: 中国語_入稿データ_ORD-2026-MLU0AQIY_20260220
 *
 * @module lib/file-naming
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCustomerFilename = parseCustomerFilename;
exports.generateCorrectionFilename = generateCorrectionFilename;
exports.extractLanguage = extractLanguage;
exports.getLanguageCode = getLanguageCode;
exports.isValidFilename = isValidFilename;
exports.getCurrentDateForFilename = getCurrentDateForFilename;
exports.generateSubmissionFilename = generateSubmissionFilename;
exports.compareRevisionFilenames = compareRevisionFilenames;
// =====================================================
// Constants
// =====================================================
const SUBMISSION_MARKER = '入稿データ';
const CORRECTION_MARKER = '校正データ';
const REVISION_PREFIX = 'R';
const LANGUAGE_PATTERNS = {
    '日本語': /^日本語_/,
    '韓国語': /^韓国語_/,
    '中国語': /^中国語/,
    'English': /^English_/,
};
const LANGUAGE_CODES = {
    '日本語': 'ja',
    '韓国語': 'ko',
    '中国語': 'zh',
    'English': 'en',
};
const FILENAME_PATTERN = /^([^_]+)_入稿データ_([A-Z0-9\-]+)_(\d{8})(?:_R(\d+))?$/;
// =====================================================
// Public API Functions
// =====================================================
/**
 * Parse customer filename to extract components
 *
 * Supports format: {language}_入稿データ_{order-number}_{date}[_R{revision}]
 *
 * Examples:
 * - 中国語_入稿データ_ORD-2026-MLU0AQIY_20260220
 * - 韓国語_入稿データ_ORD-2026-XYZ_20260220_R1
 *
 * @param filename - The filename to parse (with or without extension)
 * @returns Parsed filename components or null if invalid format
 */
function parseCustomerFilename(filename) {
    if (!filename || typeof filename !== 'string') {
        return null;
    }
    // Remove file extension if present
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
    // Try standard pattern first
    const match = nameWithoutExt.match(FILENAME_PATTERN);
    if (match) {
        const [, language, orderNumber, date, revisionStr] = match;
        return {
            language,
            orderNumber,
            date,
            type: revisionStr ? 'correction' : 'submission',
            revision: revisionStr ? parseInt(revisionStr, 10) : undefined,
            originalFilename: filename,
        };
    }
    // Fallback: Try to extract order number from non-standard format
    const fallbackMatch = nameWithoutExt.match(/([A-Z0-9\-]{10,})/);
    if (fallbackMatch) {
        return {
            language: '',
            orderNumber: fallbackMatch[1],
            date: extractDateFromFilename(nameWithoutExt),
            type: 'submission',
            originalFilename: filename,
        };
    }
    return null;
}
/**
 * Generate correction filename from original customer filename
 *
 * Converts: 入稿データ -> 校正データ
 * Appends: _R{revision}
 *
 * Examples:
 * - Input: 中国語_入稿データ_ORD-2026-MLU0AQIY_20260220
 * - Output (R1): 中国語_校正データ_ORD-2026-MLU0AQIY_20260220_R1
 *
 * @param originalFilename - The original submission filename
 * @param revisionNumber - The revision number (1, 2, 3, etc.)
 * @param orderNumber - Optional order number for fallback format
 * @returns Generated correction filename
 */
function generateCorrectionFilename(originalFilename, revisionNumber, orderNumber) {
    if (!originalFilename || revisionNumber < 1) {
        throw new Error('Invalid parameters: originalFilename required and revisionNumber must be >= 1');
    }
    // Remove file extension if present
    const nameWithoutExt = originalFilename.replace(/\.[^.]+$/, '');
    // Check if it's a standard format filename
    const parsed = parseCustomerFilename(originalFilename);
    if (parsed && parsed.language) {
        // Standard format: Convert 入稿データ to 校正データ and add revision
        const baseFilename = nameWithoutExt
            .replace(SUBMISSION_MARKER, CORRECTION_MARKER)
            .replace(/_R\d+$/, ''); // Remove existing revision if present
        return `${baseFilename}_R${revisionNumber}`;
    }
    // Fallback format for non-standard filenames
    const fallbackOrderNumber = orderNumber || (parsed === null || parsed === void 0 ? void 0 : parsed.orderNumber) || 'unknown';
    const date = extractDateFromFilename(nameWithoutExt);
    return `${fallbackOrderNumber}_校正データ_R${revisionNumber}_${date}`;
}
/**
 * Extract language from filename
 *
 * Supports: 日本語, 韓国語, 中国語, English
 *
 * @param filename - The filename to extract language from
 * @returns Extracted language or empty string if not found
 */
function extractLanguage(filename) {
    if (!filename || typeof filename !== 'string') {
        return '';
    }
    // Remove file extension if present
    const nameWithoutExt = filename.replace(/\.[^.]+$/, '');
    // Try each language pattern
    for (const [language, pattern] of Object.entries(LANGUAGE_PATTERNS)) {
        if (pattern.test(nameWithoutExt)) {
            return language;
        }
    }
    return '';
}
/**
 * Get language code from language name
 *
 * @param language - Full language name (日本語, 韓国語, etc.)
 * @returns ISO 639-1 language code or empty string
 */
function getLanguageCode(language) {
    return LANGUAGE_CODES[language] || '';
}
/**
 * Validate if a filename matches the expected format
 *
 * @param filename - The filename to validate
 * @returns True if filename is valid format
 */
function isValidFilename(filename) {
    return parseCustomerFilename(filename) !== null;
}
/**
 * Get current date in YYYYMMDD format for filenames
 *
 * @returns Current date formatted as YYYYMMDD
 */
function getCurrentDateForFilename() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}
/**
 * Extract date from filename in various formats
 *
 * @param filename - The filename to extract date from
 * @returns Date string in YYYYMMDD format or current date
 */
function extractDateFromFilename(filename) {
    // Try YYYYMMDD pattern first
    const dateMatch = filename.match(/(\d{4})(\d{2})(\d{2})/);
    if (dateMatch) {
        return `${dateMatch[1]}${dateMatch[2]}${dateMatch[3]}`;
    }
    // Fallback to current date
    return getCurrentDateForFilename();
}
/**
 * Generate a new submission filename
 *
 * @param language - Language name (日本語, 韓国語, etc.)
 * @param orderNumber - Order number
 * @param date - Optional date (defaults to current date)
 * @returns Generated submission filename
 */
function generateSubmissionFilename(language, orderNumber, date) {
    const effectiveDate = date || getCurrentDateForFilename();
    return `${language}_入稿データ_${orderNumber}_${effectiveDate}`;
}
/**
 * Compare two revision filenames to determine which is newer
 *
 * @param filename1 - First filename
 * @param filename2 - Second filename
 * @returns 1 if filename2 is newer, -1 if filename1 is newer, 0 if equal
 */
function compareRevisionFilenames(filename1, filename2) {
    const parsed1 = parseCustomerFilename(filename1);
    const parsed2 = parseCustomerFilename(filename2);
    if (!parsed1 || !parsed2) {
        return 0;
    }
    // Compare revision numbers
    const rev1 = parsed1.revision || 0;
    const rev2 = parsed2.revision || 0;
    if (rev1 < rev2)
        return -1; // filename2 is newer
    if (rev1 > rev2)
        return 1; // filename1 is newer
    return 0;
}
