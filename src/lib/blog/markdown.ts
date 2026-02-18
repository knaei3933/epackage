/**
 * Markdown Parser Configuration
 * Converts markdown to HTML with syntax highlighting and sanitization
 */

import DOMPurify from 'dompurify';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

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
// Configure marked
// =====================================================

marked.setOptions({
  gfm: true,
  breaks: true,
  headerIds: true,
  mangle: false,
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

  // Configure marked options
  marked.setOptions({
    gfm,
    breaks,
    headerIds: true,
    mangle: false,
  });

  // Parse markdown to HTML
  let html = await marked.parse(markdown);

  // Sanitize HTML if needed
  if (sanitize) {
    html = sanitizeHtml(html, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat([
        'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'pre', 'code', 'blockquote', 'dl', 'dt', 'dd',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
      ]),
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        'img': ['src', 'alt', 'title', 'width', 'height'],
        'a': ['href', 'title', 'target'],
        'code': ['class'],
        'pre': ['class'],
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
  const excerpt = generateExcerpt(markdown);

  // Calculate word count and reading time
  const wordCount = countWords(markdown);
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
  let text = markdown
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

/**
 * Generate slug from text
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/[\s_-]+/g, '-') // Replace spaces/underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
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
