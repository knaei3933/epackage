import { getJson, postJson, putJson, deleteJson } from '@/lib/api-fetch';

export async function fetchCoupons(page: number, pageSize: number): Promise<{ data: unknown[]; pagination: { total: number } }> {
  return getJson(`/api/admin/coupons?page=${page}&page_size=${pageSize}`);
}

export async function deleteCoupon(id: string): Promise<void> {
  await deleteJson(`/api/admin/coupons/${id}`);
}

export async function upsertCoupon(data: unknown, id?: string): Promise<unknown> {
  if (id) return putJson(`/api/admin/coupons/${id}`, data);
  return postJson('/api/admin/coupons', data);
}
