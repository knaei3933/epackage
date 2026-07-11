/**
 * Build a standardized quote PDF filename.
 *
 * Format: 見積書_{companyName}_Epackage-lab_{date}.pdf
 *
 * Falls back gracefully when company name is unavailable.
 */

const FORBIDDEN_CHARS = /[\\/:*?"<>|]/g;

function sanitizeFilenameComponent(value?: string | null): string {
  if (!value) return '';
  return value.replace(FORBIDDEN_CHARS, '').trim();
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Build a quote PDF filename from company name and optional date.
 *
 * @param companyName - Customer's company name (from profile / user metadata)
 * @param date - ISO date string (YYYY-MM-DD). Defaults to today.
 * @returns Filename string like `見積書_株式会社〇〇_Epackage-lab_2026-07-11.pdf`
 */
export function buildQuoteFilename(
  companyName?: string | null,
  date?: string | null,
): string {
  const safeCompany = sanitizeFilenameComponent(companyName) || 'お客様';
  const dateStr = date || todayStr();
  return `見積書_${safeCompany}_Epackage-lab_${dateStr}.pdf`;
}
