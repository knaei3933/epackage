/**
 * Parsed blog article data structure
 */
export interface ParsedBlogArticle {
  /** Article title (without category prefix) */
  title: string;
  /** Category display name (Japanese) */
  category: string;
  /** Category ID for URL routing (English) */
  categorySlug: string;
  /** Publication date as ISO string */
  date: string;
  /** Array of tag names (without # prefix) */
  tags: string[];
  /** Article body content (markdown) */
  content: string;
}

/**
 * Japanese category to English slug mapping
 */
const CATEGORY_MAP: Record<string, string> = {
  '製品紹介': 'product-intro',
  '印刷知識': 'printing-tech',
  '初心者向け': 'practical-tips',
  '導入事例': 'customer-stories',
  '技術情報': 'technical',
  '業界情報': 'industry',
  '会社情報': 'company',
  'ニュース': 'news',
};

/**
 * Parse a blog article markdown file
 *
 * Expected format:
 * Line 1: # 【category】title
 * Line 2: (empty)
 * Line 3: **YYYY.MM.DD** | #tag1 #tag2
 * Line 4: (empty)
 * Line 5+: ---
 * (content)
 */
export function parseBlogMarkdown(rawContent: string): ParsedBlogArticle {
  const lines = rawContent.split('\n');

  // Parse title and category from line 1
  const titleMatch = lines[0]?.match(/^# 【(.+)】(.+)$/);
  if (!titleMatch) {
    throw new Error('Invalid format: Line 1 must be "# 【category】title"');
  }
  const [, category, title] = titleMatch;

  // Map category to slug
  const categorySlug = CATEGORY_MAP[category] || 'uncategorized';

  // Parse date and tags from line 3
  const metaMatch = lines[2]?.match(/^\*\*(\d{4})\.(\d{2})\.(\d{2})\*\*\s*\|\s*(.*)$/);
  if (!metaMatch) {
    throw new Error('Invalid format: Line 3 must be "**YYYY.MM.DD** | #tag1 #tag2"');
  }
  const [, year, month, day, tagsStr] = metaMatch;

  // Convert date to ISO string
  const date = new Date(`${year}-${month}-${day}`).toISOString();

  // Parse tags
  const tags = tagsStr
    .split(' ')
    .filter((tag) => tag.startsWith('#'))
    .map((tag) => tag.slice(1));

  // Find separator and extract content
  const separatorIndex = lines.findIndex((line) => line.trim() === '---');
  if (separatorIndex === -1) {
    throw new Error('Invalid format: Missing "---" separator');
  }

  const content = lines.slice(separatorIndex + 1).join('\n').trim();

  return {
    title: title.trim(),
    category,
    categorySlug,
    date,
    tags,
    content,
  };
}

/**
 * Generate a URL-safe slug from a Japanese title
 * Converts Japanese text to romanized form and creates a kebab-case slug
 *
 * @param title - The article title
 * @param prefix - Optional prefix to add before the slug (e.g., date)
 * @returns URL-safe slug
 */
export function generateSlugFromTitle(title: string, prefix?: string): string {
  // Basic slugification for Japanese/English titles
  // Remove special characters and replace spaces with hyphens
  let slug = title
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9faf\u3040-\u309f\u30a0-\u30ff\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

  // Add prefix if provided
  if (prefix) {
    slug = `${prefix}-${slug}`;
  }

  return slug;
}
