/**
 * Addresses API Functions
 *
 * 住所API関数
 */

import type { DeliveryAddress, BillingAddress, DeliveryAddressFormData, BillingAddressFormData } from '@/types/dashboard';

// =====================================================
// API Client Functions
// =====================================================

/**
 * Fetch delivery addresses for the current member
 */
export async function fetchDeliveryAddresses(): Promise<DeliveryAddress[]> {
  const response = await fetch('/api/member/addresses/delivery', {
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: '住所の取得に失敗しました' }));
    throw new Error(error.error || '住所の取得に失敗しました');
  }

  const result = await response.json();
  return result.data || [];
}

/**
 * Create a new delivery address
 */
export async function createDeliveryAddress(data: DeliveryAddressFormData): Promise<DeliveryAddress> {
  const response = await fetch('/api/member/addresses/delivery', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '住所の作成に失敗しました');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Update a delivery address
 */
export async function updateDeliveryAddress(id: string, data: Partial<DeliveryAddressFormData>): Promise<DeliveryAddress> {
  const response = await fetch(`/api/member/addresses/delivery/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '住所の更新に失敗しました');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Delete a delivery address
 */
export async function deleteDeliveryAddress(id: string): Promise<void> {
  const response = await fetch(`/api/member/addresses/delivery/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '住所の削除に失敗しました');
  }
}

/**
 * Set default delivery address
 */
export async function setDefaultDeliveryAddress(id: string): Promise<void> {
  const response = await fetch(`/api/member/addresses/delivery/${id}/set-default`, {
    method: 'PATCH',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'デフォルト設定の更新に失敗しました');
  }
}

/**
 * Fetch billing addresses for the current member
 */
export async function fetchBillingAddresses(): Promise<BillingAddress[]> {
  const response = await fetch('/api/member/addresses/billing', {
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: '住所の取得に失敗しました' }));
    throw new Error(error.error || '住所の取得に失敗しました');
  }

  const result = await response.json();
  return result.data || [];
}

/**
 * Create a new billing address
 */
export async function createBillingAddress(data: BillingAddressFormData): Promise<BillingAddress> {
  const response = await fetch('/api/member/addresses/billing', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '住所の作成に失敗しました');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Update a billing address
 */
export async function updateBillingAddress(id: string, data: Partial<BillingAddressFormData>): Promise<BillingAddress> {
  const response = await fetch(`/api/member/addresses/billing/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '住所の更新に失敗しました');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Delete a billing address
 */
export async function deleteBillingAddress(id: string): Promise<void> {
  const response = await fetch(`/api/member/addresses/billing/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '住所の削除に失敗しました');
  }
}

/**
 * Set default billing address
 */
export async function setDefaultBillingAddress(id: string): Promise<void> {
  const response = await fetch(`/api/member/addresses/billing/${id}/set-default`, {
    method: 'PATCH',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'デフォルト設定の更新に失敗しました');
  }
}
