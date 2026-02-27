/**
 * CTA Injection Module
 *
 * 記事HTMLにCTAプレースホルダーを挿入する機能を提供
 * markdown.tsとは独立したモジュールとして管理
 */

// =====================================================
// Types
// =====================================================

export interface CTAConfig {
  midPosition?: number; // 中盤の位置（0.0-1.0、デフォルト0.5）
  enabled?: boolean;
}

export interface CTASplitResult {
  beforeMid: string;
  afterMid: string;
  hasMidCTA: boolean;
}

// =====================================================
// CTA Placeholder Constants
// =====================================================

export const CTA_PLACEHOLDERS = {
  MID: '<!-- CTA:mid-article -->',
  END: '<!-- CTA:end-article -->',
} as const;

// =====================================================
// CTA Injection Functions
// =====================================================

/**
 * 記事HTMLにCTAプレースホルダーを挿入する
 * @param html - 処理対象のHTML文字列
 * @param config - CTA設定（中盤位置、有効/無効）
 * @returns CTAプレースホルダーが挿入されたHTML
 */
export function insertCTAPlaceholders(
  html: string,
  config: CTAConfig = {}
): string {
  const { midPosition = 0.5, enabled = true } = config;

  if (!enabled) return html;

  // 見出し（h2, h3）の位置を取得
  const headingMatches = Array.from(html.matchAll(/<h[23][^>]*>/gi));
  const totalHeadings = headingMatches.length;

  if (totalHeadings < 2) {
    // 見出しが少ない場合は末尾のみ
    return `${html}${CTA_PLACEHOLDERS.END}`;
  }

  // 中盤の位置を計算
  const midIndex = Math.floor(totalHeadings * midPosition);
  const midHeadingMatch = headingMatches[midIndex];

  if (!midHeadingMatch) {
    return `${html}${CTA_PLACEHOLDERS.END}`;
  }

  // 中盤の見出しの前にCTAプレースホルダーを挿入
  const insertPosition = midHeadingMatch.index!;
  const htmlWithMidCTA =
    html.slice(0, insertPosition) +
    CTA_PLACEHOLDERS.MID +
    html.slice(insertPosition);

  // 末尾にもCTAを追加
  return `${htmlWithMidCTA}${CTA_PLACEHOLDERS.END}`;
}

/**
 * CTAプレースホルダーでコンテンツを分割する
 * @param html - CTAプレースホルダーを含むHTML
 * @returns 中盤CTA前後のコンテンツ
 */
export function splitContentByCTA(html: string): CTASplitResult {
  const midMatch = html.match(new RegExp(escapeRegex(CTA_PLACEHOLDERS.MID)));

  if (midMatch && midMatch.index !== undefined) {
    return {
      beforeMid: html.slice(0, midMatch.index),
      afterMid: html.slice(midMatch.index),
      hasMidCTA: true,
    };
  }

  return {
    beforeMid: html,
    afterMid: '',
    hasMidCTA: false,
  };
}

/**
 * HTMLにCTAプレースホルダーが含まれているかチェック
 * @param html - チェック対象のHTML
 * @returns CTAプレースホルダーが含まれている場合true
 */
export function hasCTAPlaceholders(html: string): boolean {
  return (
    html.includes(CTA_PLACEHOLDERS.MID) ||
    html.includes(CTA_PLACEHOLDERS.END)
  );
}

// =====================================================
// Helper Functions
// =====================================================

/**
 * 正規表現の特殊文字をエスケープする
 * @param string - エスケープ対象の文字列
 * @returns エスケープされた文字列
 */
function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
