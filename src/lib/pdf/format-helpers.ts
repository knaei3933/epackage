/**
 * PDF Generator Format Helpers
 *
 * Date/currency formatting and compatibility validators.
 */

import type { QuoteItem, InvoiceItem } from './types';
import type { ContractItem } from '../../types/contract';

import { JAPANESE_CONSTANTS } from './constants';
export { JAPANESE_CONSTANTS } from './constants';

/**
 * Format date to Japanese era format (令和6年12月25日)
 *
 * 日付を和暦フォーマットに変換
 */
export function formatJapaneseDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  // Check for invalid date
  if (isNaN(d.getTime())) {
    return '';
  }

  // Japanese eras (Japanese eras)
  const eras = [
    { name: '明治', start: new Date(1868, 8, 8), end: new Date(1912, 6, 29) },
    { name: '大正', start: new Date(1912, 7, 29), end: new Date(1926, 11, 24) },
    { name: '昭和', start: new Date(1926, 11, 24), end: new Date(1989, 0, 7) },
    { name: '平成', start: new Date(1989, 0, 8), end: new Date(2019, 3, 30) },
    { name: '令和', start: new Date(2019, 4, 1), end: new Date(2030, 11, 31) },
  ];

  const era = eras.find((e) => d >= e.start && d <= e.end);

  if (!era) {
    // Fallback to Western calendar if era not found
    return d.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  const year = d.getFullYear() - era.start.getFullYear() + 1;
  const month = d.getMonth() + 1;
  const day = d.getDate();

  return `${era.name}${year}年${month}月${day}日`;
}

/**
 * Format date to Western format (2025年12月25日)
 *
 * 日付を西暦フォーマットに変換
 */
export function formatWesternDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) {
    return '';
  }

  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();

  return `${year}年${month}月${day}日`;
}

/**
 * Format currency to Japanese yen format (¥1,000,000)
 *
 * 金額を日本円フォーマットに変換
 */
export function formatYen(amount: number): string {
  const rounded = Math.round(amount * 10) / 10;
  return `¥${rounded.toLocaleString('ja-JP', { minimumFractionDigits: 0, maximumFractionDigits: 1 })}`;
}

/**
 * Calculate subtotal, tax, and total from items
 *
 * 小計、消費税、合計を計算
 */
export function calculateTotals(
  items: (QuoteItem | InvoiceItem | ContractItem)[]
): { subtotal: number; tax: number; total: number } {
  const subtotal = items.reduce((sum, item) => {
    const amount = item.amount || item.quantity * item.unitPrice;
    return sum + amount;
  }, 0);

  const tax = Math.round(subtotal * JAPANESE_CONSTANTS.CONSUMPTION_TAX_RATE);
  const total = subtotal + tax;

  return { subtotal, tax, total };
}

/**
 * Convert number to Japanese kanji (for amount in words)
 *
 * 数字を漢数字に変換（金額表記用）
 */
export function convertNumberToJapaneseKanji(amount: number): string {
  const units = ['', '千', '万', '億'];
  const digits = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  let result = '';
  let unitIndex = 0;

  while (amount > 0) {
    const chunk = amount % 10000;
    if (chunk > 0) {
      let chunkStr = '';
      if (chunk >= 1000) chunkStr += digits[Math.floor(chunk / 1000)] + '千';
      if (chunk % 1000 >= 100)
        chunkStr += digits[Math.floor((chunk % 1000) / 100)] + '百';
      if (chunk % 100 >= 10)
        chunkStr += digits[Math.floor((chunk % 100) / 10)] + '十';
      if (chunk % 10 >= 1) chunkStr += digits[chunk % 10];
      result = chunkStr + units[unitIndex] + result;
    }
    amount = Math.floor(amount / 10000);
    unitIndex++;
  }

  return result || '零';
}

/**
 * Check if zipper is incompatible with bag type
 * 合掌袋、ガゼットパウチ、スパウトパウチはジッパー非対応
 */
export function isZipperIncompatible(bagType: string): boolean {
  const incompatibleTypes = ['box', 'lap_seal', 'spout_pouch', 'spout', '合掌袋', 'ガゼットパウチ', 'ボックス袋', 'スパウトパウチ'];
  return incompatibleTypes.some(type => bagType?.includes(type));
}

/**
 * Check if corner processing is incompatible with bag type
 * 合掌袋、ガゼットパウチ、スパウトパウチは角加工非対応
 */
export function isCornerIncompatible(bagType: string): boolean {
  const incompatibleTypes = ['box', 'lap_seal', 'spout_pouch', 'spout', '合掌袋', 'ガゼットパウチ', 'ボックス袋', 'スパウトパウチ'];
  return incompatibleTypes.some(type => bagType?.includes(type));
}

/**
 * Check if option is incompatible for spout pouch
 * スパウトパウチで選択できないオプションをチェック
 */
export function isSpoutPouchIncompatible(bagType: string): boolean {
  const spoutTypes = ['spout_pouch', 'spout', 'スパウトパウチ'];
  return spoutTypes.some(type => bagType?.includes(type));
}

