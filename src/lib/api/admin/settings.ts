import { getJson, putJson } from '@/lib/api-fetch';

export async function fetchCustomerMarkup(params?: { page?: number; limit?: number }): Promise<{ success: boolean; data?: unknown[]; pagination?: { total: number; totalPages?: number }; error?: string }> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  const qs = query.toString();
  return getJson(`/api/admin/settings/customer-markup${qs ? `?${qs}` : ''}`);
}

export async function fetchEmailConfig(): Promise<{ success: boolean; data?: unknown; error?: string }> {
  return getJson('/api/admin/settings/email-config');
}

export async function updateEmailConfig(data: unknown): Promise<{ success: boolean; error?: string }> {
  return putJson('/api/admin/settings/email-config', data);
}

export async function updateCustomerMarkup(id: string, data: unknown): Promise<{ success: boolean; data?: { markupRate: number; markupRateNote: string | null }; error?: string }> {
  return putJson(`/api/admin/settings/customer-markup?id=${id}`, data);
}

export async function fetchDesignerEmails(): Promise<{ success: boolean; emails?: string[]; error?: string }> {
  return getJson('/api/admin/settings/designer-emails');
}

export async function updateDesignerEmails(data: unknown): Promise<{ success: boolean; emails?: string[]; error?: string }> {
  return putJson('/api/admin/settings/designer-emails', data);
}


export async function fetchGoogleDriveStatus(): Promise<any> {
  return getJson('/api/admin/google-drive/status');
}
