/**
 * Quotations API Functions
 *
 * 見積依頼API関数
 */

import type { Quotation, QuotationCreateInput } from '@/types/dashboard';

// =====================================================
// API Client Functions
// =====================================================

/**
 * Create a new quotation request
 */
export async function createQuotationRequest(
  data: QuotationCreateInput
): Promise<Quotation> {
  const response = await fetch('/api/member/quotations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '見積依頼の作成に失敗しました');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Fetch quotations for the current member
 */
export async function fetchQuotations(params?: {
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<{ data: Quotation[]; pagination: { total: number } }> {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.set('status', params.status);
  if (params?.limit) queryParams.set('limit', String(params.limit));
  if (params?.offset) queryParams.set('offset', String(params.offset));

  const response = await fetch(`/api/member/quotations?${queryParams.toString()}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '見積依頼の取得に失敗しました');
  }

  return response.json();
}

/**
 * Fetch a single quotation by ID
 */
export async function fetchQuotation(id: string): Promise<Quotation> {
  const response = await fetch(`/api/member/quotations/${id}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '見積依頼の取得に失敗しました');
  }

  const result = await response.json();
  return result.data;
}
