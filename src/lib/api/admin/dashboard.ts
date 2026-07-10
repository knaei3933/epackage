import { getJson } from '@/lib/api-fetch';

export async function fetchUnifiedStats(period: number): Promise<{ data: unknown }> {
  return getJson(`/api/admin/dashboard/unified-stats?period=${period}`);
}
