import { getJson, postJson, putJson } from '@/lib/api-fetch';
import type { Order } from '@/types/dashboard';

export async function fetchOrders(params?: { status?: string; page?: number; limit?: number }): Promise<{ data: Order[]; pagination: { total: number; page: number; limit: number } }> {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  const qs = query.toString();
  return getJson(`/api/member/orders${qs ? `?${qs}` : ''}`);
}

export async function fetchOrderById(id: string): Promise<{ data: Order }> {
  return getJson(`/api/member/orders/${id}`);
}

export async function updateOrderStatus(id: string, status: string): Promise<void> {
  await putJson(`/api/member/orders/${id}/status`, { status });
}

export async function resubmitFile(orderId: string, fileId: string, data: unknown): Promise<unknown> {
  return postJson(`/api/member/orders/${orderId}/resubmit-file`, data);
}

export async function submitSpecificationChange(orderId: string, data: unknown): Promise<unknown> {
  return postJson(`/api/member/orders/${orderId}/specification-change`, data);
}
