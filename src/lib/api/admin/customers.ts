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

export async function fetchCustomerById(id: string): Promise<{ data: unknown }> {
  return getJson(`/api/admin/customers/${id}`);
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
