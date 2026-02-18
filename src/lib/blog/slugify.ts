/**
 * Slug Generator
 * Creates URL-friendly slugs from text
 */

// =====================================================
// Main Function
// =====================================================

/**
 * Generate URL-friendly slug from text
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Replace Japanese/Chinese characters with simplified version
    .replace(/[\u3000-\u303f]/g, '-') // Replace Japanese punctuation
    .replace(/[\u3040-\u309f]/g, (match) => {
      // Hiragana to romaji (basic mapping)
      const map: Record<string, string> = {
        'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o',
        'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
        'さ': 'sa', 'し': 'shi', 'す': 'su', 'せ': 'se', 'そ': 'so',
        'た': 'ta', 'ち': 'chi', 'つ': 'tsu', 'て': 'te', 'と': 'to',
        'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no',
        'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho',
        'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo',
        'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',
        'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro',
        'わ': 'wa', 'を': 'wo', 'ん': 'n',
      };
      return map[match] || '-';
    })
    .replace(/[\u30a0-\u30ff]/g, (match) => {
      // Katakana to romaji (basic mapping)
      const map: Record<string, string> = {
        'ア': 'a', 'イ': 'i', 'ウ': 'u', 'エ': 'e', 'オ': 'o',
        'カ': 'ka', 'キ': 'ki', 'ク': 'ku', 'ケ': 'ke', 'コ': 'ko',
        'サ': 'sa', 'シ': 'shi', 'ス': 'su', 'セ': 'se', 'ソ': 'so',
        'タ': 'ta', 'チ': 'chi', 'ツ': 'tsu', 'テ': 'te', 'ト': 'to',
        'ナ': 'na', 'ニ': 'ni', 'ヌ': 'nu', 'ネ': 'ne', 'ノ': 'no',
        'ハ': 'ha', 'ヒ': 'hi', 'フ': 'fu', 'ヘ': 'he', 'ホ': 'ho',
        'マ': 'ma', 'ミ': 'mi', 'ム': 'mu', 'メ': 'me', 'モ': 'mo',
        'ヤ': 'ya', 'ユ': 'yu', 'ヨ': 'yo',
        'ラ': 'ra', 'リ': 'ri', 'ル': 'ru', 'レ': 're', 'ロ': 'ro',
        'ワ': 'wa', 'ヲ': 'wo', 'ン': 'n',
      };
      return map[match] || '-';
    })
    // Remove special characters
    .replace(/[^\w\s-]/g, '')
    // Replace spaces and underscores with hyphens
    .replace(/[\s_]+/g, '-')
    // Remove multiple consecutive hyphens
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');
}

/**
 * Generate unique slug by appending suffix if needed
 */
export function generateUniqueSlug(
  baseText: string,
  existingSlugs: string[],
  suffix?: number
): string {
  const base = slugify(baseText);
  const slug = suffix ? `${base}-${suffix}` : base;

  if (existingSlugs.includes(slug)) {
    return generateUniqueSlug(baseText, existingSlugs, (suffix || 1) + 1);
  }

  return slug;
}

/**
 * Validate slug format
 */
export function isValidSlug(slug: string): boolean {
  // Slug should contain only lowercase letters, numbers, and hyphens
  // Should not start or end with hyphen
  // Should not have consecutive hyphens
  const slugRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
}

/**
 * Normalize slug for comparison
 */
export function normalizeSlug(slug: string): string {
  return slug.toLowerCase().trim();
}

// =====================================================
// Export utilities
// =====================================================

export const slugifyUtils = {
  slugify,
  generateUniqueSlug,
  isValidSlug,
  normalizeSlug,
};
