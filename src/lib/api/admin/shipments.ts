import { getJson, postJson, putJson } from '@/lib/api-fetch';

export async function fetchShipments(params: { page?: number; limit?: number; status?: string; tracking?: string }): Promise<{ data: unknown[]; pagination: { total: number } }> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.status) query.set('status', params.status);
  if (params.tracking) query.set('tracking', params.tracking);
  return getJson(`/api/shipments?${query.toString()}`);
}

export async function fetchShipmentById(id: string): Promise<{ data: unknown }> {
  return getJson(`/api/shipments/${id}`);
}

export async function createShipment(data: unknown): Promise<unknown> {
  return postJson('/api/shipments/create', data);
}

export async function trackShipment(id: string, data: unknown): Promise<unknown> {
  return postJson(`/api/shipments/${id}/track`, data);
}

export async function updateShipment(id: string, data: unknown): Promise<void> {
  await putJson(`/api/shipments/${id}`, data);
}

export async function fetchShipmentLabel(id: string): Promise<Blob> {
  const response = await fetch(`/api/shipments/${id}/label`, { credentials: 'include' });
  if (!response.ok) throw new Error('Failed to fetch label');
  return response.blob();
}


export async function fetchReadyOrders(): Promise<{ success: boolean; orders: unknown[] }> {
  return getJson('/api/shipments/create');
}

export async function fetchShipmentLabelJson(id: string): Promise<{ success: boolean; label_data?: string }> {
  return getJson(`/api/shipments/${id}/label`);
}
