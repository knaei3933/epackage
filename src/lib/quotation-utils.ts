/**
 * 見積（quotation）の有効期限・注文可否の共通ヘルパー
 *
 * 有効期間内の再注文を許容する仕様（CONVERTED で注文を止めない）に対応するため、
 * valid_until が未設定（NULL）の場合は created_at + 30日 でフォールバック計算する。
 * API（snake_case）とフロント（camelCase）の両方から呼べるよう両プロパティを受け取る。
 */

interface QuotationLike {
  // API（PostgREST の snake_case）
  valid_until?: string | null;
  created_at?: string;
  status?: string;
  // フロント（camelCase）
  validUntil?: string | null;
  createdAt?: string;
}

/**
 * 見積の有効期限（実効値）を返す。
 * valid_until（または validUntil）が設定されていればそれを使い、
 * 未設定なら作成日 + 30日 でフォールバックする。
 */
export function getEffectiveValidUntil(quotation: QuotationLike): Date {
  const rawValidUntil = quotation.valid_until ?? quotation.validUntil;
  if (rawValidUntil) {
    return new Date(rawValidUntil);
  }
  const created = new Date(quotation.created_at || quotation.createdAt || Date.now());
  created.setDate(created.getDate() + 30);
  return created;
}

/**
 * 見积が有効期間内か（キャンセルされておらず・期限切れでない）を返す。
 * canConvert 判定の共通ロジック。CONVERTED ステータスは影響しない
 * （有効期間内なら何度でも再注文可能）。
 */
export function isQuotationActive(quotation: QuotationLike): boolean {
  const status = (quotation.status || '').toLowerCase();
  if (status === 'cancelled') return false;
  return getEffectiveValidUntil(quotation) >= new Date();
}

/**
 * 見積が期限切れか（キャンセルは含まず、純粋に有効期限の経過のみ）。
 */
export function isQuotationExpired(quotation: QuotationLike): boolean {
  return getEffectiveValidUntil(quotation) < new Date();
}
