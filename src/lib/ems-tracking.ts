/**
 * EMS Tracking Number Generator
 *
 * EMS 追跡番号生成システム
 *
 * Generates valid EMS tracking numbers for Korea Post
 * Format: EZ + 2 digits (service code) + 8 digits (serial) + 1 digit (check digit)
 * Example: EZ123456789KR
 */

// ============================================================
// Configuration
// ============================================================

/**
 * EMS service codes for Korea Post
 */
export const EMS_SERVICE_CODES = {
  INTERNATIONAL: 'EZ',    // International EMS
  CHINA: 'EC',            // China EMS
};

/**
 * Country codes for Korean EMS
 */
export const COUNTRY_CODE = 'KR';

/**
 * Serial number prefix by year (for tracking purposes)
 */
export const YEAR_PREFIX = {
  '2024': '24',
  '2025': '25',
  '2026': '26',
  '2027': '27',
  '2028': '28',
};

// ============================================================
// Main Functions
// ============================================================

/**
 * Generate a new EMS tracking number
 * @param options - Generation options
 * @returns EMS tracking number
 */
export function generateEMSTrackingNumber(options?: {
  year?: string;
  customSerial?: string;
}): string {
  const year = options?.year || new Date().getFullYear().toString();
  const prefix = YEAR_PREFIX[year as keyof typeof YEAR_PREFIX] || '25';

  // Generate serial number (8 digits)
  const serial = options?.customSerial || generateSerialNumber(prefix);

  // Calculate check digit
  const checkDigit = calculateCheckDigit(`EZ${serial}`);

  // Combine: EZ + serial + check digit + KR
  return `EZ${serial}${checkDigit}${COUNTRY_CODE}`;
}

/**
 * Validate EMS tracking number
 * @param trackingNumber - Tracking number to validate
 * @returns true if valid
 */
export function validateEMSTrackingNumber(trackingNumber: string): boolean {
  // Check format: EZ + 13 characters total
  const emsPattern = /^EZ(\d{13})KR$/;
  if (!emsPattern.test(trackingNumber)) {
    return false;
  }

  // Extract digits without check digit
  const digits = trackingNumber.substring(2, 14); // EZ + 13 digits (excluding KR)

  // Validate check digit
  const providedCheckDigit = digits[12];
  const calculatedCheckDigit = calculateCheckDigit(`EZ${digits.substring(0, 12)}`);

  return providedCheckDigit === calculatedCheckDigit;
}

/**
 * Generate multiple EMS tracking numbers
 * @param count - Number of tracking numbers to generate
 * @param options - Generation options
 * @returns Array of EMS tracking numbers
 */
export function generateBatchEMSTrackingNumbers(
  count: number,
  options?: { year?: string }
): string[] {
  const trackingNumbers: string[] = [];
  const year = options?.year || new Date().getFullYear().toString();
  const prefix = YEAR_PREFIX[year as keyof typeof YEAR_PREFIX] || '25';

  for (let i = 0; i < count; i++) {
    trackingNumbers.push(generateEMSTrackingNumber({ year }));
  }

  return trackingNumbers;
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * Generate serial number (8 digits)
 * Format: YY + 6 random digits
 */
function generateSerialNumber(yearPrefix: string): string {
  // First 2 digits: year prefix
  // Last 6 digits: sequential or random number
  const randomPart = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, '0');

  return `${yearPrefix}${randomPart}`;
}

/**
 * Calculate check digit for EMS tracking number
 * Uses modulo 10 algorithm
 * @param baseNumber - Base number without check digit
 * @returns Check digit (0-9)
 */
function calculateCheckDigit(baseNumber: string): string {
  // Extract digits from base number (after EZ)
  const digits = baseNumber.substring(2).split('').map(Number);

  // Calculate weighted sum
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    // Weight: alternate between 1 and 3
    const weight = (i % 2 === 0) ? 1 : 3;
    sum += digits[i] * weight;
  }

  // Calculate check digit
  const checkDigit = (10 - (sum % 10)) % 10;

  return checkDigit.toString();
}

/**
 * Format tracking number for display (add spaces)
 * @param trackingNumber - Raw tracking number
 * @returns Formatted tracking number
 */
export function formatTrackingNumber(trackingNumber: string): string {
  if (trackingNumber.length !== 15) {
    return trackingNumber; // Return as-is if invalid format
  }

  // EZ 1234 5678 9012 KR
  return `${trackingNumber.substring(0, 2)} ${trackingNumber.substring(2, 6)} ${trackingNumber.substring(6, 10)} ${trackingNumber.substring(10, 14)} ${trackingNumber.substring(14)}`;
}

/**
 * Get tracking number info
 * @param trackingNumber - EMS tracking number
 * @returns Parsed info
 */
export function parseTrackingNumber(trackingNumber: string): {
  valid: boolean;
  service?: string;
  serial?: string;
  checkDigit?: string;
  country?: string;
} | null {
  if (!validateEMSTrackingNumber(trackingNumber)) {
    return { valid: false };
  }

  return {
    valid: true,
    service: trackingNumber.substring(0, 2),    // EZ
    serial: trackingNumber.substring(2, 13),   // 11 digits (serial + check)
    checkDigit: trackingNumber.substring(13, 14), // Check digit
    country: trackingNumber.substring(14),       // KR
  };
}

// ============================================================
// Korea Post EMS Tracking URL
// ============================================================

/**
 * Get Korea Post EMS tracking URL
 * @param trackingNumber - EMS tracking number
 * @returns Tracking page URL
 */
export function getEMSTrackingURL(trackingNumber: string): string {
  // Korea Post EMS tracking page
  // URL: https://www.koreapost.go.kr/kpo/trace/traceEmsPage.jsp?ems_no={trackingNumber}
  return `https://www.koreapost.go.kr/kpo/trace/traceEmsPage.jsp?ems_no=${trackingNumber}`;
}

/**
 * Get Japan Post tracking URL (for incoming mail)
 * @param trackingNumber - EMS tracking number
 * @returns Japan Post tracking page URL
 */
export function getJapanPostTrackingURL(trackingNumber: string): string {
  // Japan Post EMS tracking page
  // URL: https://www.post.japanpost.jp/service/fukubishi_tracking/index_en.html
  return `https://tracking.post.japanpost.jp/services/english/trace.html?searchStr=${trackingNumber}`;
}

// ============================================================
// Export
// ============================================================

export const emsTracking = {
  // Generation
  generateEMSTrackingNumber,
  generateBatchEMSTrackingNumbers,

  // Validation
  validateEMSTrackingNumber,

  // Formatting
  formatTrackingNumber,
  parseTrackingNumber,

  // URLs
  getEMSTrackingURL,
  getJapanPostTrackingURL,

  // Constants
  EMS_SERVICE_CODES,
  COUNTRY_CODE,
  YEAR_PREFIX,
};

export default emsTracking;
