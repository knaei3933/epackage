/**
 * Shared spec helpers for PDF generation
 *
 * normalizeMaterialSpec, resolveMaterialSpec, QUOTE_DEFAULT_REMARKS
 * Used by both quote-html.ts and multi-quantity-pdf.ts
 */

export function normalizeMaterialSpec(text: string | undefined | null): string {
  if (!text) return '';
  return text
    .replace(/\s*μ\s*/g, ' ')
    .replace(/\s+\/\s+/g, ' ')
    .replace(/\s*\+\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function resolveMaterialSpec(
  material: string | undefined | null,
  thicknessType: string | undefined | null
): string {
  const t = thicknessType && thicknessType !== '指定なし' ? normalizeMaterialSpec(thicknessType) : '';
  if (t) return t;
  return material || '指定なし';
}

/**
 * 見積書デフォルト備考（従来 generateQuoteHTML の defaultRemarks と同一内容）
 */
export const QUOTE_DEFAULT_REMARKS = `※製造工程上の都合により、実際の納品数量はご注文数量に対し最大10％程度の過不足が生じる場合がございます。
数量の完全保証はいたしかねますので、あらかじめご了承ください。
※不足分につきましては、実際に納品した数量に基づきご請求いたします。
前払いにてお支払いいただいた場合は、差額分を返金いたします。
※原材料価格の変動等により、見積有効期限経過後は価格が変更となる場合がございます。
再見積の際は、あらかじめご了承くださいますようお願いいたします。
※本見積金額には郵送費を含んでおります。
※お客様によるご確認の遅れ、その他やむを得ない事情により、納期が前後する場合がございます。
※年末年始等の長期休暇期間を挟む場合、通常より納期が延びる可能性がございます。
※天候不良、事故、交通事情等の影響により、やむを得ず納期が遅延する場合がございますので、あらかじめご了承ください。`;
