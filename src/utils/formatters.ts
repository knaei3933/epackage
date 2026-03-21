/**
 * 共通フォーマットユーティリティ
 *
 * 価格、日付、日時のフォーマット関数を提供します。
 * これらの関数はアプリケーション全体で一貫したフォーマットを保証するために使用されます。
 */

/**
 * 価格をフォーマットします
 *
 * @param price - フォーマットする価格
 * @returns フォーマットされた価格文字列（小数点を保持）
 *
 * @example
 * formatPrice(1000) // "1,000"
 * formatPrice(1050.5) // "1,050.5"
 */
export function formatPrice(price: number): string {
  if (Number.isInteger(price)) {
    return price.toLocaleString();
  }
  // 小数点以下1桁を表示
  return price.toFixed(1).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * 日付をフォーマットします（YYYY-MM-DD形式）
 *
 * @param date - フォーマットする日付
 * @returns フォーマットされた日付文字列
 *
 * @example
 * formatDate('2024-01-15') // "2024-01-15"
 * formatDate(new Date('2024-01-15')) // "2024-01-15"
 * formatDate(null) // ""
 */
export function formatDate(date: string | Date | null): string {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * 日時をフォーマットします（YYYY-MM-DD HH:MM形式）
 *
 * @param date - フォーマットする日時
 * @returns フォーマットされた日時文字列
 *
 * @example
 * formatDateTime('2024-01-15T14:30:00') // "2024-01-15 14:30"
 * formatDateTime(new Date('2024-01-15T14:30:00')) // "2024-01-15 14:30"
 * formatDateTime(null) // ""
 */
export function formatDateTime(date: string | Date | null): string {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * 日付をフォーマットします（日本語ロケール形式）
 *
 * @param date - フォーマットする日付
 * @returns フォーマットされた日本語日付文字列
 *
 * @example
 * formatDateJa('2024-01-15') // "2024年1月15日"
 * formatDateJa(new Date('2024-01-15')) // "2024年1月15日"
 * formatDateJa(null) // ""
 */
export function formatDateJa(date: string | Date | null): string {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('ja-JP');
}

/**
 * 日時をフォーマットします（日本語ロケール形式）
 *
 * @param date - フォーマットする日時
 * @returns フォーマットされた日本語日時文字列
 *
 * @example
 * formatDateTimeJa('2024-01-15T14:30:00') // "2024年1月15日 14:30:00"
 * formatDateTimeJa(new Date('2024-01-15T14:30:00')) // "2024年1月15日 14:30:00"
 * formatDateTimeJa(null) // ""
 */
export function formatDateTimeJa(date: string | Date | null): string {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString('ja-JP');
}
