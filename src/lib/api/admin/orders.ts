import { getJson, postJson, putJson } from '@/lib/api-fetch';

export async function fetchOrders(params: { page?: number; limit?: number; status?: string }): Promise<{ data: unknown[]; pagination: { total: number } }> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.status) query.set('status', params.status);
  return getJson(`/api/admin/orders?${query.toString()}`);
}

export async function updateOrderStatus(orderId: string, data: unknown): Promise<void> {
  await putJson(`/api/admin/orders/${orderId}/status`, data);
}

export async function addOrderComment(orderId: string, data: unknown): Promise<void> {
  await postJson(`/api/admin/orders/${orderId}/comments`, data);
}

export async function generateWorkOrder(orderId: string, data: unknown): Promise<unknown> {
  return postJson(`/api/admin/orders/${orderId}/work-order`, data);
}
