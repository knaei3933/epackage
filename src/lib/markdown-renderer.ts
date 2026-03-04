/**
 * Lightweight Markdown to HTML converter for chatbot
 * Uses existing unified pipeline from blog content system
 */

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import { loggers } from '@/lib/logger';

const logger = loggers.app().withContext({ module: 'markdown-renderer' });

let processor: any = null;

// Simple HTML sanitizer for server-side (avoids jsdom dependency issues)
function simpleSanitize(html: string): string {
  // Remove dangerous tags
  html = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<link\b[^>]*>/gi, '')
    .replace(/<meta\b[^>]*>/gi, '');

  // Remove event handlers
  html = html.replace(/on\w+="[^"]*"/gi, '');
  html = html.replace(/on\w+='[^']*'/gi, '');

  // Remove javascript: protocol
  html = html.replace(/javascript:/gi, '');

  // Remove data: attributes (except data-safe-*)
  html = html.replace(/data-(?!safe-)[^"']*(?==)/gi, '');

  return html;
}

function getProcessor() {
  if (!processor) {
    processor = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeStringify, { allowDangerousHtml: true });
  }
  return processor;
}

/**
 * Convert markdown to sanitized HTML
 * @param markdown - Markdown string
 * @returns Sanitized HTML string
 */
export async function markdownToHtml(markdown: string): Promise<string> {
  if (!markdown) return '';

  try {
    const proc = getProcessor();
    const vfile = await proc.process(markdown);
    const html = String(vfile);

    // Sanitize HTML to prevent XSS (using simple sanitizer to avoid jsdom issues)
    let cleanHtml = simpleSanitize(html);

    // Additional filtering: only allow safe tags and attributes
    // Remove unsafe tags but preserve safe ones
    const unsafeTagPattern = /<(?!\/?(p|br|strong|em|u|a\s|\/a|ul|ol|li|code|pre|blockquote|h[1-6]|div|span)\b)[^>]*>/gi;
    cleanHtml = cleanHtml.replace(unsafeTagPattern, '');

    // Ensure href attributes only have safe URLs (http, https, mailto)
    cleanHtml = cleanHtml.replace(/href=["'](javascript:|data:)([^"']*)["']/gi, 'href="#"');

    return cleanHtml;
  } catch (error) {
    logger.error('Markdown conversion error', { error });
    // Fallback: escape HTML and preserve line breaks
    return markdown
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');
  }
}
