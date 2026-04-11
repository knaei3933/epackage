/**
 * Member Samples API Functions
 *
 * サンプル依頼API関数
 */

import type { DashboardSampleRequest, DashboardSampleRequestStatus } from '@/types/dashboard';

// =====================================================
// API Client Functions
// =====================================================

/**
 * Fetch sample requests for the current member
 */
export async function fetchSampleRequests(
  status?: DashboardSampleRequestStatus
): Promise<DashboardSampleRequest[]> {
  const params = new URLSearchParams();
  if (status) params.set('status', status);

  const response = await fetch(`/api/member/samples?${params.toString()}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'サンプル依頼の取得に失敗しました');
  }

  const result = await response.json();
  return result.data || [];
}

/**
 * Fetch a single sample request by ID
 */
export async function fetchSampleRequest(id: string): Promise<DashboardSampleRequest> {
  const response = await fetch(`/api/member/samples/${id}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'サンプル依頼の取得に失敗しました');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Create a new sample request
 */
export async function createSampleRequest(
  data: {
    samples: Array<{
      productId: string;
      quantity: number;
    }>;
    deliveryAddressId?: string;
    notes?: string;
  }
): Promise<DashboardSampleRequest> {
  const response = await fetch('/api/member/samples', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'サンプル依頼の作成に失敗しました');
  }

  const result = await response.json();
  return result.data;
}
