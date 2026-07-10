/**
 * PDF HTML Sanitization
 *
 * DOMPurify-based XSS prevention for PDF rendering.
 */

import DOMPurify from 'dompurify';

/**
 * Sanitize HTML before assigning to innerHTML for PDF rendering.
 *
 * 全PDF生成（見積書・複数数量見積書・請求書）で DOM へ注入する直前に
 * ユーザー入力由来の値（顧客名・担当者・会社名・備考 等）を無害化する。
 * DOMPurify で許可タグ・属性を制限し、<script> / イベントハンドラ /
 * javascript: 等を除去する（ADV-E2E-006 stored XSS 対策）。
 */
const PDF_SANITIZE_OPTIONS = {
  ALLOWED_TAGS: [
    'div', 'span', 'p', 'br', 'strong', 'em', 'b', 'i', 'u',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
    'ul', 'ol', 'li',
    'a', 'img',
    'hr', 'blockquote', 'pre', 'code',
    'svg', 'path', 'rect', 'circle', 'line', 'text', 'g',
  ],
  ALLOWED_ATTR: [
    'class', 'style', 'id', 'href', 'src', 'alt', 'title', 'target',
    'colspan', 'rowspan', 'width', 'height', 'viewBox', 'd', 'fill',
    'stroke', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'cx', 'cy', 'r',
  ],
  ALLOW_DATA_ATTR: false,
  ALLOW_UNKNOWN_PROTOCOLS: false,
};

export function sanitizePdfHtml(html: string): string {
  // <style> ブロックは固定CSS（extractQuotePdfCss 由来・quoteData 非依存・ユーザー入力を
  // 含まない）のため DOMPurify の対象外とし保護する。DOMPurify は body フラグメント
  // モードでは ALLOWED_TAGS に 'style' を指定しても <style> 要素を許可せず除去して
  // しまうため、<style> を正規表現で抽出 → 本文のみ sanitize → 結合して戻す。
  // ユーザー入力（顧客名・担当者・備考 等）は本文の <td> 等に埋め込まれるため、本文の
  // sanitize で XSS 対策（ADV-E2E-006）は維持される。
  const styleBlocks: string[] = [];
  const htmlWithoutStyle = html.replace(
    /<style[^>]*>[\s\S]*?<\/style>/gi,
    (m) => {
      styleBlocks.push(m);
      return '';
    }
  );
  const sanitizedBody = DOMPurify.sanitize(htmlWithoutStyle, PDF_SANITIZE_OPTIONS);
  return styleBlocks.join('') + sanitizedBody;
}

