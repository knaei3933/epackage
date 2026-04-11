/**
 * Markdown Parser Configuration
 * Converts markdown to HTML with syntax highlighting and sanitization
 */

import DOMPurify from 'dompurify';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';
import matter from 'gray-matter';

// =====================================================
// Utility Functions
// =====================================================

/**
 * Generate slug from text (supports Japanese text)
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[^\w\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\s-]/g, '') // Keep CJK, alphanumeric, spaces, hyphens
    .replace(/[\s_-]+/g, '-') // Replace spaces/underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .substring(0, 50); // Limit length
}

// =====================================================
// Type Definitions
// =====================================================

export interface MarkdownOptions {
  allowHtml?: boolean;
  sanitize?: boolean;
  gfm?: boolean; // GitHub Flavored Markdown
  breaks?: boolean;
}

export interface ParsedContent {
  html: string;
  excerpt: string;
  headings: Heading[];
  wordCount: number;
  readingTime: number;
}

export interface Heading {
  id: string;
  text: string;
  level: number;
  children?: Heading[];
}

// =====================================================
// Image Optimization Configuration
// =====================================================

type ImageType = 'hero' | 'product' | 'thumb' | 'section' | 'comparison' | 'default';

const IMAGE_DIMENSIONS: Record<ImageType, { width: number; height: number }> = {
  hero: { width: 1200, height: 630 },
  product: { width: 800, height: 600 },
  thumb: { width: 400, height: 300 },
  section: { width: 1000, height: 500 },
  comparison: { width: 800, height: 600 },
  default: { width: 800, height: 600 },
};

function detectImageType(filename: string): ImageType {
  const lowerName = filename.toLowerCase();
  if (lowerName.includes('hero')) return 'hero';
  if (lowerName.includes('product')) return 'product';
  if (lowerName.includes('thumb')) return 'thumb';
  if (lowerName.includes('section')) return 'section';
  if (lowerName.includes('comparison')) return 'comparison';
  return 'default';
}

function getWebPPath(originalPath: string): string {
  return originalPath.replace(/\.(png|jpg|jpeg)$/i, '.webp');
}

// =====================================================
// Configure marked
// =====================================================

marked.setOptions({
  gfm: true,
  breaks: true,
});

// Custom renderer for image optimization and heading IDs
class CustomRenderer extends marked.Renderer {
  heading(token: any) {
    const text = this.parser.parseInline(token.tokens);
    const plainText = text.replace(/<[^>]*>/g, '');
    const id = slugify(plainText);
    return `<h${token.depth} id="${id}">${text}</h${token.depth}>\n`;
  }

  image(href: string, title: string | null, text: string) {
    if (!href) return '';
    const webpSrc = getWebPPath(href);
    const imageType = detectImageType(href);
    const dims = IMAGE_DIMENSIONS[imageType];
    const altText = (text || title || '').replace(/"/g, '&quot;');
    const titleAttr = title ? ` title="${title.replace(/"/g, '&quot;')}"` : '';

    return `<picture>
  <source srcset="${webpSrc}" type="image/webp">
  <img src="${href}" alt="${altText}"${titleAttr} loading="lazy" width="${dims.width}" height="${dims.height}" style="max-width: 100%; height: auto;">
</picture>`;
  }
}

marked.setOptions({
  renderer: new CustomRenderer(),
});

// =====================================================
// Main Parser Function
// =====================================================

export async function parseMarkdown(
  markdown: string,
  options: MarkdownOptions = {}
): Promise<ParsedContent> {
  const {
    allowHtml = false,
    sanitize = true,
    gfm = true,
    breaks = true,
  } = options;

  // Remove frontmatter if present
  let cleanMarkdown = markdown;
  try {
    const { content } = matter(markdown);
    cleanMarkdown = content;
  } catch {
    // If frontmatter parsing fails, try custom regex removal
    // Remove lines with **meta_title**: "..." and **meta_description**: "..."
    cleanMarkdown = markdown.replace(/^\*\*meta_title\*\*:\s*"[^"]*"\s*\n?/gm, '');
    cleanMarkdown = cleanMarkdown.replace(/^\*\*meta_description\*\*:\s*"[^"]*"\s*\n?/gm, '');
    // Also remove standalone --- lines
    cleanMarkdown = cleanMarkdown.replace(/^---\s*\n?/gm, '');
  }

  // Configure marked options
  marked.setOptions({
    gfm,
    breaks,
    mangle: false,
  });

  // Parse markdown to HTML
  let html = await marked.parse(cleanMarkdown);

  // Sanitize HTML if needed
  if (sanitize) {
    html = sanitizeHtml(html, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat([
        'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'pre', 'code', 'blockquote', 'dl', 'dt', 'dd',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'picture', 'source',
      ]),
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        'img': ['src', 'alt', 'title', 'width', 'height', 'loading', 'style'],
        'source': ['srcset', 'type'],
        'a': ['href', 'title', 'target'],
        'code': ['class'],
        'pre': ['class'],
        'h1': ['id'],
        'h2': ['id'],
        'h3': ['id'],
        'h4': ['id'],
        'h5': ['id'],
        'h6': ['id'],
      },
      allowedClasses: {
        'code': ['language-*', 'hljs'],
        'pre': ['hljs'],
      },
    });
  }

  // Extract headings for table of contents
  const headings = extractHeadings(html);

  // Generate excerpt
  const excerpt = generateExcerpt(cleanMarkdown);

  // Calculate word count and reading time
  const wordCount = countWords(cleanMarkdown);
  const readingTime = calculateReadingTime(wordCount);

  return {
    html,
    excerpt,
    headings,
    wordCount,
    readingTime,
  };
}

// =====================================================
// Helper Functions
// =====================================================

/**
 * Extract headings from HTML for table of contents
 */
function extractHeadings(html: string): Heading[] {
  const headingRegex = /<h([2-3])[^>]*id="([^"]+)"[^>]*>(.*?)<\/h\1>/gi;
  const headings: Heading[] = [];
  const stack: Heading[] = [];

  let match;
  while ((match = headingRegex.exec(html)) !== null) {
    const level = parseInt(match[1]);
    const id = match[2];
    const text = match[3].replace(/<[^>]*>/g, ''); // Strip inner HTML

    const heading: Heading = { id, text, level };

    // Build hierarchy
    while (stack.length > 0 && stack[stack.length - 1].level >= level) {
      stack.pop();
    }

    if (stack.length > 0) {
      const parent = stack[stack.length - 1];
      if (!parent.children) parent.children = [];
      parent.children.push(heading);
    } else {
      headings.push(heading);
    }

    stack.push(heading);
  }

  return headings;
}

/**
 * Generate excerpt from markdown content
 */
function generateExcerpt(markdown: string, maxLength = 160): string {
  // Remove markdown syntax
  const text = markdown
    .replace(/^#+\s+/gm, '') // Remove headers
    .replace(/\*\*/g, '') // Remove bold
    .replace(/\*/g, '') // Remove italic
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '') // Remove images
    .replace(/`{1,3}/g, '') // Remove code blocks
    .replace(/^\s*[-*+]\s+/gm, '') // Remove list items
    .replace(/^\s*\d+\.\s+/gm, '') // Remove numbered lists
    .replace(/\n\s*\n/g, '\n') // Remove multiple newlines
    .trim();

  // Get first paragraph or first few lines
  const firstParagraph = text.split('\n\n')[0];

  // Truncate if too long
  if (firstParagraph.length > maxLength) {
    return firstParagraph.substring(0, maxLength - 3) + '...';
  }

  return firstParagraph;
}

/**
 * Count words in markdown text
 */
function countWords(markdown: string): number {
  // Remove code blocks
  let text = markdown.replace(/```[\s\S]*?```/g, '');

  // Remove inline code
  text = text.replace(/`[^`]+`/g, '');

  // Remove URLs
  text = text.replace(/https?:\/\/[^\s]+/g, '');

  // Split into words (handles CJK characters)
  const cjkRegex = /[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff]/g;
  const cjkMatches = text.match(cjkRegex);
  const cjkCount = cjkMatches ? cjkMatches.length : 0;

  // Remove CJK for word counting
  text = text.replace(cjkRegex, ' ');

  // Count remaining words
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;

  // CJK characters are counted as words
  return wordCount + cjkCount;
}

/**
 * Calculate reading time in minutes
 */
function calculateReadingTime(wordCount: number): number {
  const wordsPerMinute = 200;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}


// =====================================================
// Export utilities
// =====================================================

export const markdownUtils = {
  parse: parseMarkdown,
  extractHeadings,
  generateExcerpt,
  countWords,
  calculateReadingTime,
  slugify,
};
