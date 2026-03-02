/**
 * Lightweight Markdown to HTML converter for chatbot
 * Uses existing unified pipeline from blog content system
 */

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
// Removed isomorphic-dompurify to avoid jsdom dependency issues

let processor: any = null;

// Simple HTML sanitizer for server-side (avoids jsdom dependency issues)
function simpleSanitize(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '');
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
    // Additional filtering: only allow safe tags
    cleanHtml = cleanHtml.replace(/<(?!\/?(p|br|strong|em|u|a|ul|ol|li|code|pre|blockquote|h[1-6])\b)[^>]*>/gi, '');

    return cleanHtml;
  } catch (error) {
    console.error('Markdown conversion error:', error);
    // Fallback: escape HTML and preserve line breaks
    return markdown
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');
  }
}
