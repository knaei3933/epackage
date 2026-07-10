import { getJson, postJson, putJson, deleteJson, patchJson } from '@/lib/api-fetch';

export async function fetchNotifications(page: number, limit: number): Promise<{ data: unknown[]; pagination: { total: number } }> {
  return getJson(`/api/admin/notifications?limit=${limit}&page=${page}`);
}

export async function createNotification(data: unknown): Promise<void> {
  await postJson('/api/admin/notifications/create', data);
}

export async function updateNotification(id: string, data: unknown): Promise<void> {
  await putJson(`/api/admin/notifications/${id}`, data);
}

export async function deleteNotification(id: string): Promise<void> {
  await deleteJson(`/api/admin/notifications/${id}`);
}

export async function markNotificationRead(id: string): Promise<void> {
  await patchJson(`/api/admin/notifications/${id}/read`);
}
