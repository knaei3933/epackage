import { getJson, postJson } from '@/lib/api-fetch';

export async function fetchApprovals(params: { page?: number; limit?: number; status?: string }): Promise<{ data: unknown[]; pagination: { total: number } }> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.status) query.set('status', params.status);
  return getJson(`/api/admin/approve-member?${query.toString()}`);
}

export async function approveMember(id: string, data: Record<string, unknown>): Promise<void> {
  await postJson('/api/admin/approve-member', { id, ...data, action: 'approve' });
}

export async function rejectMember(id: string, data: Record<string, unknown>): Promise<void> {
  await postJson('/api/admin/approve-member', { id, ...data, action: 'reject' });
}
