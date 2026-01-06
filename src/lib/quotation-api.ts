/**
 * Quotation API Utility Library
 *
 * Helper functions for quotation API operations
 * Provides type-safe interfaces to the quotation API routes
 */

import type { Database } from '@/types/database';

// ============================================================
// Type Definitions
// ============================================================

export interface QuotationItemInput {
  productName: string;
  quantity: number;
  unitPrice: number;
  specifications?: Record<string, unknown> | null;
}

export interface CreateQuotationInput {
  userId: string;
  quotationNumber: string;
  status?: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';
  totalAmount: number;
  validUntil?: string;
  notes?: string | null;
  items?: QuotationItemInput[];
}

export interface SubmitQuotationInput {
  quotationId: string;
  customerInfo?: {
    name: string;
    email: string;
    phone?: string;
  };
}

export interface UpdateQuotationInput {
  customerInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  notes?: string;
  validUntil?: string;
  status?: Database['public']['Tables']['quotations']['Row']['status'];
}

export interface ConvertToOrderInput {
  notes?: string;
  paymentTerm?: 'credit' | 'advance';
}

export interface Quotation {
  id: string;
  user_id: string;
  company_id: string | null;
  quotation_number: string;
  status: Database['public']['Tables']['quotations']['Row']['status'];
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  subtotal: number;
  subtotal_amount: number;
  tax_amount: number;
  total_amount: number;
  valid_until: string | null;
  notes: string | null;
  pdf_url: string | null;
  admin_notes: string | null;
  sales_rep: string | null;
  estimated_delivery_date: string | null;
  created_at: string;
  updated_at: string;
  sent_at: string | null;
  approved_at: string | null;
  rejected_at: string | null;
  items?: QuotationItem[];
}

export interface QuotationItem {
  id: string;
  quotation_id: string;
  product_id: string | null;
  product_name: string;
  category: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  specifications: Record<string, unknown> | null;
  notes: string | null;
  display_order: number;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  company_id: string | null;
  quotation_id: string | null;
  order_number: string;
  status: Database['public']['Tables']['orders']['Row']['status'];
  total_amount: number;
  subtotal: number;
  tax_amount: number;
  customer_name: string;
  customer_email: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  shipped_at: string | null;
  delivered_at: string | null;
  payment_term: 'credit' | 'advance';
  shipping_address: Record<string, unknown> | null;
  billing_address: Record<string, unknown> | null;
  requested_delivery_date: string | null;
  delivery_notes: string | null;
  estimated_delivery_date: string | null;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  specifications: Record<string, unknown> | null;
  notes: string | null;
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  quotation?: T;
  order?: T;
  message?: string;
  error?: string;
  [key: string]: unknown;
}

// ============================================================
// API Functions
// ============================================================

/**
 * Create a new quotation
 */
export async function createQuotation(input: CreateQuotationInput): Promise<ApiResponse<Quotation>> {
  try {
    const response = await fetch('/api/quotations/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to create quotation' };
    }

    return { success: true, data: data.quotation, quotation: data.quotation, message: data.message };
  } catch (error) {
    console.error('[createQuotation] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get a quotation by ID
 */
export async function getQuotation(quotationId: string): Promise<ApiResponse<Quotation>> {
  try {
    const response = await fetch(`/api/quotations/${quotationId}`);

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to fetch quotation' };
    }

    return { success: true, data: data.quotation, quotation: data.quotation };
  } catch (error) {
    console.error('[getQuotation] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Update a quotation
 */
export async function updateQuotation(
  quotationId: string,
  input: UpdateQuotationInput
): Promise<ApiResponse<Quotation>> {
  try {
    const response = await fetch(`/api/quotations/${quotationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to update quotation' };
    }

    return {
      success: true,
      data: data.quotation,
      quotation: data.quotation,
      message: data.message
    };
  } catch (error) {
    console.error('[updateQuotation] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Submit a quotation for admin review
 */
export async function submitQuotation(input: SubmitQuotationInput): Promise<ApiResponse<Quotation>> {
  try {
    const response = await fetch('/api/quotations/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to submit quotation' };
    }

    return {
      success: true,
      data: data.quotation,
      quotation: data.quotation,
      message: data.message
    };
  } catch (error) {
    console.error('[submitQuotation] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Convert an approved quotation to an order
 */
export async function convertQuotationToOrder(
  quotationId: string,
  input?: ConvertToOrderInput
): Promise<ApiResponse<Order>> {
  try {
    const response = await fetch(`/api/quotations/${quotationId}/convert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input || {}),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to convert quotation' };
    }

    return {
      success: true,
      data: data.order,
      order: data.order,
      quotation: data.quotation,
      message: data.message
    };
  } catch (error) {
    console.error('[convertQuotationToOrder] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Check if a quotation can be converted to an order
 */
export async function checkConversionEligibility(
  quotationId: string
): Promise<ApiResponse<{ canConvert: boolean; isExpired: boolean; hasOrder: boolean; existingOrder?: Order }>> {
  try {
    const response = await fetch(`/api/quotations/${quotationId}/convert`);

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to check conversion eligibility' };
    }

    return { success: true, data: data.data };
  } catch (error) {
    console.error('[checkConversionEligibility] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get all quotations for the current user
 */
export async function getQuotations(filters?: {
  status?: string;
}): Promise<ApiResponse<Quotation[]>> {
  try {
    const queryParams = new URLSearchParams();
    if (filters?.status) {
      queryParams.append('status', filters.status);
    }

    const response = await fetch(`/api/quotations/list?${queryParams.toString()}`);

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to fetch quotations' };
    }

    return { success: true, data: data.quotations };
  } catch (error) {
    console.error('[getQuotations] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * Generate a unique quotation number
 */
export function generateQuotationNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `QT-${year}-${random}`;
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
  }).format(amount);
}

/**
 * Format date for display
 */
export function formatDate(dateString: string | null): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * Get status label in Japanese
 */
export function getQuotationStatusLabel(status: Database['public']['Tables']['quotations']['Row']['status']): string {
  const labels: Record<string, string> = {
    'draft': '下書き',
    'DRAFT': '下書き',
    'sent': '送信済み',
    'SENT': '送信済み',
    'approved': '承認済み',
    'APPROVED': '承認済み',
    'rejected': '却下',
    'REJECTED': '却下',
    'expired': '期限切れ',
    'EXPIRED': '期限切れ',
    'converted': '注文変換済み',
    'CONVERTED': '注文変換済み',
  };
  return labels[status] || status;
}

/**
 * Check if quotation can be submitted
 */
export function canSubmitQuotation(quotation: Quotation): boolean {
  return quotation.status === 'draft' || quotation.status === 'DRAFT';
}

/**
 * Check if quotation can be converted to order
 */
export function canConvertToOrder(quotation: Quotation): boolean {
  if (quotation.status !== 'approved' && quotation.status !== 'APPROVED') {
    return false;
  }

  if (quotation.valid_until && new Date(quotation.valid_until) < new Date()) {
    return false;
  }

  return true;
}
