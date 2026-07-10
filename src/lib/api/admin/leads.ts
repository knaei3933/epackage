import { getJson } from '@/lib/api-fetch';

export async function fetchLeads(): Promise<{ data: unknown[] }> {
  return getJson('/api/admin/leads');
}
