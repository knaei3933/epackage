import { getJson, putJson, postJson } from '@/lib/api-fetch';

export async function fetchSettings(): Promise<{ data: unknown }> {
  return getJson('/api/member/settings');
}

export async function updateSettings(data: unknown): Promise<void> {
  await putJson('/api/member/settings', data);
}

export async function deleteAccount(data: unknown): Promise<void> {
  await postJson('/api/member/delete-account', data);
}
