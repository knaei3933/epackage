import { getJson } from '@/lib/api-fetch';

export async function fetchQuotations(params: { page?: number; limit?: number; status?: string; search?: string }): Promise<{ data: unknown[]; pagination: { total: number } }> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.status) query.set('status', params.status);
  if (params.search) query.set('search', params.search);
  return getJson(`/api/admin/quotations?${query.toString()}`);
}
