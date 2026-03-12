/**
 * Lightweight Markdown to HTML converter for chatbot
 * Uses existing unified pipeline from blog content system
 */

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import DOMPurify from 'isomorphic-dompurify';
import { loggers } from '@/lib/logger';

const logger = loggers.app().withContext({ module: 'markdown-renderer' });

let processor: any = null;

function getProcessor() {
  if (!processor) {
    processor = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype, { allowDangerousHtml: false })
      .use(rehypeStringify, { allowDangerousHtml: false });
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

    // Sanitize HTML with DOMPurify to prevent XSS
    const cleanHtml = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'code', 'pre', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'span'],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
      ALLOW_DATA_ATTR: false
    });

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
