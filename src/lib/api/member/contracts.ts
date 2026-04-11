/**
 * Contracts API Functions
 *
 * 契約API関数
 */

import type { ContractStatus } from '@/types/admin';

export interface Contract {
  id: string;
  contract_number: string;
  status: ContractStatus;
  order_id: string;
  quotation_id: string | null;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  currency: string;
  valid_from: string | null;
  valid_until: string | null;
  customer_signature_url: string | null;
  customer_signed_at: string | null;
  admin_signature_url: string | null;
  admin_signed_at: string | null;
  final_contract_url: string | null;
  sent_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  notes: string | null;
  orders?: {
    id: string;
    order_number: string;
    customer_name: string;
  };
  quotations?: {
    id: string;
    quotation_number: string;
  };
}

// =====================================================
// API Client Functions
// =====================================================

/**
 * Fetch contracts for the current member
 */
export async function fetchContracts(params?: {
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ data: Contract[]; pagination: { total: number } }> {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.set('status', params.status);
  if (params?.search) queryParams.set('search', params.search);
  if (params?.limit) queryParams.set('limit', String(params.limit));
  if (params?.offset) queryParams.set('offset', String(params.offset));

  const response = await fetch(`/api/member/contracts?${queryParams.toString()}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '契約データの取得に失敗しました');
  }

  return response.json();
}

/**
 * Fetch a single contract by ID
 */
export async function fetchContract(id: string): Promise<Contract> {
  const response = await fetch(`/api/member/contracts/${id}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '契約データの取得に失敗しました');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Sign a contract
 */
export async function signContract(id: string): Promise<void> {
  const response = await fetch(`/api/member/contracts/${id}/sign`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '署名に失敗しました');
  }
}
