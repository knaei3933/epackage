import { getJson, postJson } from '@/lib/api-fetch';
import type { Profile } from '@/lib/supabase';

export async function fetchCustomers(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  period?: string;
}): Promise<{ data: Profile[]; pagination: { total: number; page: number; limit: number } }> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.search) query.set('search', params.search);
  if (params.status) query.set('status', params.status);
  if (params.period) query.set('period', params.period);
  return getJson(`/api/admin/customers/management?${query.toString()}`);
}

export interface CustomerDetailParams {
  qPage?: number;
  qLimit?: number;
  qStatus?: string;
  oPage?: number;
  oLimit?: number;
}

export async function fetchCustomerById(
  id: string,
  params?: CustomerDetailParams
): Promise<{ data: unknown }> {
  const query = new URLSearchParams();
  if (params?.qPage) query.set('qPage', String(params.qPage));
  if (params?.qLimit) query.set('qLimit', String(params.qLimit));
  if (params?.qStatus && params.qStatus !== 'ALL') query.set('qStatus', params.qStatus);
  if (params?.oPage) query.set('oPage', String(params.oPage));
  if (params?.oLimit) query.set('oLimit', String(params.oLimit));
  const qs = query.toString();
  return getJson(`/api/admin/customers/${id}${qs ? `?${qs}` : ''}`);
}

export async function exportCustomers(params: { format?: string; search?: string; status?: string }): Promise<Blob> {
  const query = new URLSearchParams();
  if (params.format) query.set('format', params.format);
  if (params.search) query.set('search', params.search);
  if (params.status) query.set('status', params.status);
  const response = await fetch(`/api/admin/customers/management/export?${query.toString()}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) throw new Error('Export failed');
  return response.blob();
}
