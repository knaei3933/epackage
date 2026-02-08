/**
 * Quotations Data Loader
 *
 * Server Component用データローダー
 * - 認証済みユーザーの見積一覧を取得
 * - Server Componentから呼び出し、データをpropsとして渡す
 */

import { createServiceClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/dashboard';

export interface QuotationItem {
  id: string;
  quotation_id: string;
  product_id: string | null;
  product_name: string;
  category: string | null;
  quantity: number;
  unit_price: number;
  specifications: Record<string, unknown> | null;
  notes: string | null;
  display_order: number;
  order_id: string | null;
}

export interface Quotation {
  id: string;
  quotation_number: string;
  status: string;
  customer_name: string;
  customer_email: string;
  subtotal_amount: number;
  tax_amount: number;
  total_amount: number;
  valid_until: string | null;
  sent_at: string | null;
  approved_at: string | null;
  created_at: string;
  pdf_url: string | null;  // 保存されたPDFのURL
  quotation_items: QuotationItem[];
}

export interface QuotationsData {
  quotations: Quotation[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

/**
 * Fetch quotations for the authenticated user
 */
export async function fetchQuotationsServerSide(
  status?: string,
  limit: number = 20,
  offset: number = 0
): Promise<QuotationsData> {
  // Get authenticated user (from headers set by middleware)
  const authUser = await getCurrentUser();

  if (!authUser) {
    return {
      quotations: [],
      pagination: {
        limit,
        offset,
        total: 0,
      },
    };
  }

  // Create service client for database operations
  const serviceClient = createServiceClient();

  // Build query - countを取得するため、まずheadを使って総数を取得
  const { count: totalCount } = await serviceClient
    .from('quotations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', authUser.id);

  // Apply status filter for count if specified
  let countQuery = serviceClient
    .from('quotations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', authUser.id);

  if (status && status !== 'all') {
    const statusLower = status.toLowerCase();
    const statusUpper = status.toUpperCase();

    const isWorkflowStatus = ['QUOTATION_PENDING', 'QUOTATION_APPROVED', 'DATA_UPLOAD_PENDING',
                              'DATA_UPLOADED', 'CORRECTION_IN_PROGRESS', 'CORRECTION_COMPLETED',
                              'CUSTOMER_APPROVAL_PENDING', 'PRODUCTION', 'READY_TO_SHIP',
                              'SHIPPED', 'CANCELLED'].includes(statusUpper);

    if (isWorkflowStatus) {
      countQuery = countQuery.eq('status', statusUpper);
    } else {
      countQuery = countQuery.or(`status.eq.${statusLower},status.eq.${statusUpper}`);
    }
  }

  const { count: filteredCount } = await countQuery;

  // Build main query for data
  let query = serviceClient
    .from('quotations')
    .select(`
      *,
      quotation_items (*)
    `)
    .eq('user_id', authUser.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  // Apply status filter if specified (check lowercase, uppercase, and 10-step workflow statuses)
  if (status && status !== 'all') {
    const statusLower = status.toLowerCase();
    const statusUpper = status.toUpperCase();

    // For legacy statuses: check both lowercase and uppercase
    // For 10-step workflow: use exact match (they're already uppercase)
    const isWorkflowStatus = ['QUOTATION_PENDING', 'QUOTATION_APPROVED', 'DATA_UPLOAD_PENDING',
                              'DATA_UPLOADED', 'CORRECTION_IN_PROGRESS', 'CORRECTION_COMPLETED',
                              'CUSTOMER_APPROVAL_PENDING', 'PRODUCTION', 'READY_TO_SHIP',
                              'SHIPPED', 'CANCELLED'].includes(statusUpper);

    if (isWorkflowStatus) {
      // Exact match for workflow statuses
      query = query.eq('status', statusUpper);
    } else {
      // Check both lowercase and uppercase for legacy statuses
      query = query.or(`status.eq.${statusLower},status.eq.${statusUpper}`);
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error('[Loader] Fetch quotations error:', error);
    return {
      quotations: [],
      pagination: {
        limit,
        offset,
        total: 0,
      },
    };
  }

  // quotation_items를 items로 변환하여 dashboard.ts 타입과 일치시키기
  const quotations = (data || []).map((q: any) => ({
    ...q,
    quotationNumber: q.quotation_number,
    totalAmount: q.total_amount,
    validUntil: q.valid_until,
    items: (q.quotation_items || []).map((item: any) => ({
      ...item,
      productName: item.product_name,
      unitPrice: item.unit_price,
      totalPrice: item.total_price,
      orderId: item.order_id,
    })),
    createdAt: q.created_at,
    updatedAt: q.updated_at,
    sentAt: q.sent_at,
    approvedAt: q.approved_at,
    pdfUrl: q.pdf_url,  // 保存されたPDFのURL
  }));

  return {
    quotations,
    pagination: {
      limit,
      offset,
      total: filteredCount || 0,
    },
  };
}
