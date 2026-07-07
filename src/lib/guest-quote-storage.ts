/**
 * Guest Quote Storage
 *
 * 비로그인 사용자가 견적 시뮬레이터에서 받은 견적을
 * sessionStorage에 임시 저장하고, 로그인/회원가입 시
 * 자동으로 DB에 저장되도록 연동하는 유틸리티.
 *
 * 플로우:
 * 1. 비로그인 견적 결과 → sessionStorage에 스냅샷 저장
 * 2. 로그인 성공 → AuthContext가 flushGuestQuotes() 호출
 * 3. DB 저장 성공 → sessionStorage에서 제거
 */

const STORAGE_KEY = 'epackage_pending_guest_quotes';
const MAX_ENTRIES = 5;

export interface GuestQuoteSnapshot {
  /** ISO timestamp of creation */
  savedAt: string;
  /** Total amount (JPY) */
  totalAmount: number;
  /** Quote items array (same shape as /api/member/quotations POST body) */
  items: any[];
  /** Cost breakdown object */
  cost_breakdown?: any;
}

/**
 * Save a guest quote snapshot to sessionStorage.
 * Keeps at most MAX_ENTRIES entries (FIFO eviction).
 */
export function saveGuestQuote(snapshot: GuestQuoteSnapshot): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getGuestQuotes();
    existing.unshift(snapshot);
    // Evict oldest entries beyond the limit
    const trimmed = existing.slice(0, MAX_ENTRIES);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (e) {
    // sessionStorage might be full or disabled; fail silently
    console.warn('[guest-quote-storage] Failed to save guest quote:', e);
  }
}

/**
 * Read all pending guest quotes from sessionStorage.
 */
export function getGuestQuotes(): GuestQuoteSnapshot[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Check if there are any pending guest quotes.
 */
export function hasGuestQuotes(): boolean {
  return getGuestQuotes().length > 0;
}

/**
 * Remove all pending guest quotes (after successful flush to DB).
 */
export function clearGuestQuotes(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/**
 * Remove a single guest quote by index.
 */
export function removeGuestQuote(index: number): void {
  const quotes = getGuestQuotes();
  if (index >= 0 && index < quotes.length) {
    quotes.splice(index, 1);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
      } catch {
        // ignore
      }
    }
  }
}
