/**
 * Reading Time Calculator
 * Estimates reading time for blog posts
 */

// =====================================================
// Constants
// =====================================================

const WORDS_PER_MINUTE = 200; // Average reading speed
const CJK_CHARS_PER_MINUTE = 400; // CJK characters per minute
const MIN_READING_TIME = 1; // Minimum 1 minute

// =====================================================
// Main Function
// =====================================================

/**
 * Calculate reading time for markdown content
 */
export function calculateReadingTime(
  content: string,
  options: {
    wordsPerMinute?: number;
    cjkCharsPerMinute?: number;
    minTime?: number;
  } = {}
): number {
  const {
    wordsPerMinute = WORDS_PER_MINUTE,
    cjkCharsPerMinute = CJK_CHARS_PER_MINUTE,
    minTime = MIN_READING_TIME,
  } = options;

  // Remove code blocks (don't count code in reading time)
  let text = content.replace(/```[\s\S]*?```/g, '');

  // Extract inline code separately
  const inlineCodeMatches = text.match(/`[^`]+`/g) || [];
  text = text.replace(/`[^`]+`/g, '');

  // Count CJK characters
  const cjkRegex = /[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/g;
  const cjkMatches = text.match(cjkRegex);
  const cjkCount = cjkMatches ? cjkMatches.length : 0;

  // Remove CJK for word counting
  text = text.replace(cjkRegex, ' ');

  // Count remaining words
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;

  // Calculate reading time
  const wordTime = wordCount / wordsPerMinute;
  const cjkTime = cjkCount / cjkCharsPerMinute;
  const totalTime = wordTime + cjkTime;

  // Round up to nearest minute, with minimum
  return Math.max(minTime, Math.ceil(totalTime));
}

/**
 * Calculate reading time with detailed breakdown
 */
export function calculateReadingTimeDetailed(
  content: string
): {
  minutes: number;
  wordCount: number;
  cjkCharCount: number;
  codeBlockCount: number;
} {
  // Remove and count code blocks
  const codeBlockRegex = /```[\s\S]*?```/g;
  const codeBlocks = content.match(codeBlockRegex) || [];
  const codeBlockCount = codeBlocks.length;

  let text = content.replace(codeBlockRegex, '');

  // Count inline code
  const inlineCodeMatches = text.match(/`[^`]+`/g) || [];
  text = text.replace(/`[^`]+`/g, '');

  // Count CJK characters
  const cjkRegex = /[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/g;
  const cjkMatches = text.match(cjkRegex);
  const cjkCharCount = cjkMatches ? cjkMatches.length : 0;

  // Remove CJK for word counting
  text = text.replace(cjkRegex, ' ');

  // Count remaining words
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;

  // Calculate reading time
  const wordTime = wordCount / WORDS_PER_MINUTE;
  const cjkTime = cjkCharCount / CJK_CHARS_PER_MINUTE;
  const minutes = Math.max(MIN_READING_TIME, Math.ceil(wordTime + cjkTime));

  return {
    minutes,
    wordCount,
    cjkCharCount,
    codeBlockCount,
  };
}

/**
 * Format reading time for display
 */
export function formatReadingTime(minutes: number, locale = 'ja'): string {
  if (locale === 'ja') {
    return `${minutes}分で読めます`;
  }
  return `${minutes} min read`;
}

/**
 * Get reading time badge color
 */
export function getReadingTimeColor(minutes: number): string {
  if (minutes <= 3) return 'text-green-600';
  if (minutes <= 7) return 'text-yellow-600';
  return 'text-red-600';
}

// =====================================================
// Export utilities
// =====================================================

export const readingTimeUtils = {
  calculateReadingTime,
  calculateReadingTimeDetailed,
  formatReadingTime,
  getReadingTimeColor,
};
