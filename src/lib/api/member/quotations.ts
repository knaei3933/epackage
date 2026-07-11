/**
 * Quotations API Functions
 *
 * 見積依頼API関数
 */

import type { Quotation, QuotationCreateInput } from '@/types/dashboard';
import { getJson, postJson, apiDelete } from '@/lib/api-fetch';

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
  return result.quotation;
}

/**
 * Fetch quotations for the current member
 */
export async function fetchQuotations(params?: {
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<{ success: boolean; quotations: Quotation[]; pagination: { limit: number; offset: number; total: number } }> {
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
  return result.quotation;
}


/**
 * Fetch download statistics for a quotation
 */
export async function fetchDocumentHistory(quotationId: string): Promise<{ data: { statistics: { downloadCount: number; lastDownloadedAt: string | null } } }> {
  return getJson(`/api/member/documents/history?quotation_id=${quotationId}`);
}

/**
 * Log a document action (e.g. download)
 */
export async function logDocumentAction(data: {
  document_type: string;
  document_id: string;
  quotation_id: string;
  action: string;
}): Promise<void> {
  await postJson('/api/member/documents', data);
}

/**
 * Delete a quotation
 */
export async function deleteQuotation(quotationId: string): Promise<void> {
  const response = await apiDelete(`/api/member/quotations?id=${quotationId}`);
  if (!response.ok) throw new Error('削除に失敗しました');
}

/**
 * Convert a quotation to an order
 */
export async function convertQuotationToOrder(quotationId: string, selectedItemIds?: string[]): Promise<{ success: boolean; data?: { id: string }; alreadyExists?: boolean; error?: string }> {
  return postJson(`/api/member/quotations/${quotationId}/convert`, selectedItemIds && selectedItemIds.length > 0 ? { selectedItemIds } : {});
}

/**
 * Download PDF from a URL and return as Blob
 */
export async function downloadPdfBlob(pdfUrl: string): Promise<Blob> {
  const response = await fetch(pdfUrl);
  if (!response.ok) throw new Error('PDFの取得に失敗しました');
  return response.blob();
}


/**
 * Delete a quotation by ID (path-based)
 */
export async function deleteQuotationById(id: string): Promise<void> {
  const response = await apiDelete(`/api/member/quotations/${id}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete quotation');
  }
}

/**
 * Convert a quotation to an order with notes
 */
export async function convertQuotationToOrderWithNotes(
  quotationId: string,
  data: { notes?: string; selectedItemIds?: string[] }
): Promise<{ success: boolean; data?: { id: string }; alreadyExists?: boolean; error?: string }> {
  return postJson(`/api/member/quotations/${quotationId}/convert`, data);
}
