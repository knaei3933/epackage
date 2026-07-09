/**
 * Email Template Utility Functions
 *
 * メールテンプレート共通ユーティリティ
 */

import sanitizeHtml from 'sanitize-html';

/**
 * Sanitize user input to prevent XSS attacks in HTML content
 * - Strips all HTML tags
 * - Converts newlines to <br>
 */
export function sanitizeContent(content: string): string {
  const clean = sanitizeHtml(content, {
    allowedTags: [],
    allowedAttributes: {},
  });
  return clean.replace(/\n/g, '<br>');
}

/**
 * Sanitize text content for plain text/subject lines
 * - Strips all HTML tags
 * - Preserves newlines for plain text
 * - Prevents XSS in email subjects and plain text bodies
 */
export function sanitizeText(content: string): string {
  return sanitizeHtml(content, {
    allowedTags: [],
    allowedAttributes: {},
  });
}

/**
 * Format Japanese date
 */
export function formatDateJP(dateStr: string): string {
  const date = new Date(dateStr);
  const era = date.getFullYear() > 2019 ? '令和' : '平成';
  const year = date.getFullYear() - (date.getFullYear() > 2019 ? 2019 : 1989);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return `${era}${year}年${month}月${day}日`;
}

/**
 * Format currency in Japanese style
 */
export function formatCurrencyJP(amount: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
  }).format(amount);
}

/**
 * Generate common Japanese email header
 * - Sanitizes inputs to prevent XSS attacks
 */
export function getJapaneseEmailHeader(
  recipientName: string,
  recipientCompany?: string
): string {
  const sanitizedName = sanitizeText(recipientName);
  const sanitizedCompany = recipientCompany ? sanitizeText(recipientCompany) : undefined;

  if (sanitizedCompany) {
    return `${sanitizedCompany}\n${sanitizedName} 様`;
  }
  return `${sanitizedName} 様`;
}

/**
 * Generate common Japanese email footer
 */
export function getJapaneseEmailFooter(companyName = 'Epackage Lab'): string {
  const currentDate = new Date();
  return `
================================
${companyName}
兵庫県加古郡稲美町六分一486
電話: 050-1793-6500
Email: info@package-lab.com
https://epackage-lab.com

================================
${formatDateJP(currentDate.toISOString())}
  `.trim();
}
