/**
 * Inquiries API Functions
 *
 * お問い合わせAPI関数
 */

import type { Inquiry, InquiryStatus, InquiryType } from '@/types/dashboard';

// =====================================================
// API Client Functions
// =====================================================

/**
 * Fetch inquiries for the current member
 */
export async function fetchInquiries(params?: {
  status?: string;
  type?: string;
}): Promise<Inquiry[]> {
  const queryParams = new URLSearchParams();
  if (params?.status && params.status !== 'all') {
    queryParams.set('status', params.status);
  }
  if (params?.type && params.type !== 'all') {
    queryParams.set('type', params.type);
  }

  const response = await fetch(`/api/member/inquiries?${queryParams.toString()}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'お問い合わせの取得に失敗しました');
  }

  const result = await response.json();
  return result.data || [];
}

/**
 * Fetch a single inquiry by ID
 */
export async function fetchInquiry(id: string): Promise<Inquiry> {
  const response = await fetch(`/api/member/inquiries/${id}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'お問い合わせの取得に失敗しました');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Create a new inquiry
 */
export async function createInquiry(data: {
  type: InquiryType;
  subject: string;
  message: string;
  orderId?: string;
  quotationId?: string;
}): Promise<Inquiry> {
  const response = await fetch('/api/member/inquiries', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'お問い合わせの作成に失敗しました');
  }

  const result = await response.json();
  return result.data;
}
