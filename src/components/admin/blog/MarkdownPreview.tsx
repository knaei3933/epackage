/**
 * Markdown Preview Component
 *
 * Renders markdown to styled HTML
 * Uses DOMPurify for security (sanitizes HTML)
 * Custom styling for common markdown elements
 */

'use client';

import React, { useMemo } from 'react';
import DOMPurify from 'dompurify';

// ============================================================
// Types
// ============================================================

export interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

// ============================================================
// Markdown Parser (Simple implementation)
// ============================================================

function parseMarkdown(markdown: string): string {
  if (!markdown) return '';

  let html = markdown;

  // Escape HTML tags first (security)
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Code blocks (must be before other processing)
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    return `<pre class="markdown-code-block"><code class="language-${lang || 'text'}">${code.trim()}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="markdown-inline-code">$1</code>');

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Bold and Italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/___(.+?)___/g, '<strong><em>$1</em></strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy" />');

  // Blockquotes
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');

  // Unordered lists
  html = html.replace(/^\* (.+)$/gm, '<li>$1</li>');
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => {
    // Only wrap if not already wrapped by unordered list regex
    if (!match.startsWith('<ul>')) {
      return `<ol>${match}</ol>`;
    }
    return match;
  });

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr />');
  html = html.replace(/^\*\*\*$/gm, '<hr />');

  // Line breaks and paragraphs
  html = html.replace(/\n\n/g, '</p><p>');
  html = html.replace(/\n/g, '<br />');

  // Wrap in paragraph
  html = `<p>${html}</p>`;

  // Clean up empty paragraphs
  html = html.replace(/<p><\/p>/g, '');
  html = html.replace(/<p>(<h[1-6]>)/g, '$1');
  html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1');
  html = html.replace(/<p>(<ul>)/g, '$1');
  html = html.replace(/(<\/ul>)<\/p>/g, '$1');
  html = html.replace(/<p>(<ol>)/g, '$1');
  html = html.replace(/(<\/ol>)<\/p>/g, '$1');
  html = html.replace(/<p>(<blockquote>)/g, '$1');
  html = html.replace(/(<\/blockquote>)<\/p>/g, '$1');
  html = html.replace(/<p>(<pre>)/g, '$1');
  html = html.replace(/(<\/pre>)<\/p>/g, '$1');
  html = html.replace(/<p>(<hr \/>)<\/p>/g, '$1');

  return html;
}

// ============================================================
// Main Component
// ============================================================

export function MarkdownPreview({ content, className = '' }: MarkdownPreviewProps) {
  // Parse and sanitize markdown
  const html = useMemo(() => {
    const parsed = parseMarkdown(content);
    return DOMPurify.sanitize(parsed, {
      ALLOWED_TAGS: [
        'p', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'strong', 'em', 'u', 's', 'sub', 'sup',
        'a', 'img',
        'ul', 'ol', 'li',
        'blockquote', 'hr',
        'code', 'pre',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
      ],
      ALLOWED_ATTR: [
        'href', 'target', 'rel', 'src', 'alt', 'title', 'loading',
        'class', 'id',
      ],
      ALLOW_DATA_ATTR: false,
    });
  }, [content]);

  return (
    <div
      className={`markdown-preview ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// ============================================================
// CSS Styles (should be included in globals.css)
// ============================================================

export const MARKDOWN_PREVIEW_STYLES = `
.markdown-preview {
  line-height: 1.7;
  color: var(--text-primary);
}

.markdown-preview h1,
.markdown-preview h2,
.markdown-preview h3,
.markdown-preview h4,
.markdown-preview h5,
.markdown-preview h6 {
  font-weight: 700;
  line-height: 1.3;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}

.markdown-preview h1 {
  font-size: 2em;
  border-bottom: 1px solid var(--border-light);
  padding-bottom: 0.3em;
}

.markdown-preview h2 {
  font-size: 1.5em;
  border-bottom: 1px solid var(--border-light);
  padding-bottom: 0.3em;
}

.markdown-preview h3 {
  font-size: 1.25em;
}

.markdown-preview h4 {
  font-size: 1.1em;
}

.markdown-preview p {
  margin: 1em 0;
}

.markdown-preview a {
  color: var(--brixa-primary-600);
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 2px;
  transition: color 0.2s;
}

.markdown-preview a:hover {
  color: var(--brixa-primary-700);
}

.markdown-preview strong {
  font-weight: 700;
}

.markdown-preview em {
  font-style: italic;
}

.markdown-preview code {
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
  font-size: 0.875em;
  background: var(--bg-secondary);
  padding: 0.125em 0.375em;
  border-radius: 0.25em;
}

.markdown-preview pre {
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: 0.5em;
  padding: 1em;
  overflow-x: auto;
  margin: 1em 0;
}

.markdown-preview pre code {
  background: transparent;
  padding: 0;
  font-size: 0.875em;
  line-height: 1.5;
}

.markdown-preview img {
  max-width: 100%;
  height: auto;
  border-radius: 0.5em;
  margin: 1em 0;
}

.markdown-preview blockquote {
  border-left: 4px solid var(--brixa-primary-300);
  padding-left: 1em;
  margin: 1em 0;
  color: var(--text-secondary);
  font-style: italic;
}

.markdown-preview blockquote p {
  margin: 0;
}

.markdown-preview hr {
  border: none;
  border-top: 1px solid var(--border-light);
  margin: 2em 0;
}

.markdown-preview ul,
.markdown-preview ol {
  padding-left: 1.5em;
  margin: 1em 0;
}

.markdown-preview li {
  margin: 0.5em 0;
}

.markdown-preview ul li {
  list-style-type: disc;
}

.markdown-preview ol li {
  list-style-type: decimal;
}

.markdown-preview ul ul,
.markdown-preview ol ul {
  margin-top: 0;
  margin-bottom: 0;
}

.markdown-preview table {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
}

.markdown-preview th,
.markdown-preview td {
  border: 1px solid var(--border-light);
  padding: 0.5em 0.75em;
}

.markdown-preview th {
  background: var(--bg-secondary);
  font-weight: 600;
}

.markdown-preview tr:nth-child(even) {
  background: var(--bg-accent);
}
`;
