/**
 * Guest Quote Flush
 *
 * ログイン成功時にsessionStorageに溜まったゲスト見積を
 * DB（/api/member/quotations）に保存する。
 * 保存成功後はsessionStorageから該当エントリを削除。
 */

import { getGuestQuotes, removeGuestQuote, GuestQuoteSnapshot } from './guest-quote-storage';

interface AuthUser {
  id: string;
  email?: string;
  kanjiLastName?: string | null;
  kanjiFirstName?: string | null;
  corporatePhone?: string | null;
}

/**
 * Flush all pending guest quotes to the database.
 * Called after successful login or registration.
 */
export async function flushGuestQuotes(user: AuthUser): Promise<void> {
  const quotes = getGuestQuotes();
  if (quotes.length === 0) return;

  console.log(`[flushGuestQuotes] Flushing ${quotes.length} pending guest quote(s) for user ${user.id}`);

  const customerName = user.kanjiLastName && user.kanjiFirstName
    ? `${user.kanjiLastName} ${user.kanjiFirstName}`
    : user.email?.split('@')[0] || 'User';

  // Process in reverse so indices stay valid after removal
  for (let i = quotes.length - 1; i >= 0; i--) {
    const quote = quotes[i] as GuestQuoteSnapshot;
    try {
      const response = await fetch('/api/member/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          customer_name: customerName,
          customer_email: user.email || '',
          customer_phone: user.corporatePhone || null,
          status: 'DRAFT',
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'ゲスト見積から自動保存',
          cost_breakdown: quote.cost_breakdown || {},
          items: quote.items,
        }),
      });

      if (response.ok) {
        console.log(`[flushGuestQuotes] Quote ${i + 1}/${quotes.length} flushed successfully`);
        removeGuestQuote(i);
      } else {
        console.warn(`[flushGuestQuotes] Quote ${i + 1} flush failed:`, response.status);
      }
    } catch (e) {
      console.warn(`[flushGuestQuotes] Quote ${i + 1} flush error:`, e);
    }
  }
}
