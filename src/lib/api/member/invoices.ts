import { getJson } from '@/lib/api-fetch';

export async function fetchInvoices(params?: { page?: number; limit?: number; status?: string }): Promise<{ data: unknown[]; pagination: { total: number } }> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.status) query.set('status', params.status);
  const qs = query.toString();
  return getJson(`/api/member/invoices${qs ? `?${qs}` : ''}`);
}

export async function downloadInvoice(invoiceId: string): Promise<Blob> {
  const response = await fetch(`/api/member/invoices/${invoiceId}/download`, { credentials: 'include' });
  if (!response.ok) throw new Error('Failed to download invoice');
  return response.blob();
}
