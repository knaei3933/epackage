/**
 * Quotations Data Loader
 *
 * Server Component用データローダー
 * - 認証済みユーザーの見積一覧を取得
 * - Server Componentから呼び出し、データをpropsとして渡す
 */

import { createServiceClient } from '@/lib/supabase';
import { getMaterialSpecification } from '@/lib/unified-pricing-engine';
import type { Database } from '@/types/database';

// quotations.status の実DB enum 型（quotation_status）。string 値をキャストして型安全化。
type QuotationStatus = Database['public']['Tables']['quotations']['Row']['status'];

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

  // camelCase エイリアス（fetchQuotationsServerSide が実行時に提供）
  // task #8 型拡張方針: 実行時ロジック不変・TS型エラー解消のみ。snake_case が正。
  productName?: string;
  unitPrice?: number;
  totalPrice?: number;
  orderId?: string | null;
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

  // camelCase エイリアス（fetchQuotationsServerSide が実行時に提供）
  // task #8 型拡張方針: 実行時ロジック不変・TS型エラー解消のみ。snake_case が正。
  quotationNumber?: string;
  totalAmount?: number;
  validUntil?: string | null;
  createdAt?: string;
  updatedAt?: string;
  sentAt?: string | null;
  approvedAt?: string | null;
  pdfUrl?: string | null;
}

export interface QuotationsData {
  quotations: Quotation[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

const WORKFLOW_STATUSES = [
  'QUOTATION_PENDING',
  'QUOTATION_APPROVED',
  'DATA_UPLOAD_PENDING',
  'DATA_UPLOADED',
  'CORRECTION_IN_PROGRESS',
  'CORRECTION_COMPLETED',
  'CUSTOMER_APPROVAL_PENDING',
  'PRODUCTION',
  'READY_TO_SHIP',
  'SHIPPED',
  'CANCELLED',
] as const;

// Keep the payload bounded to the quotation/item fields consumed by the list UI
// and the transformation contract instead of selecting every wide table column.
const QUOTATIONS_SELECT = `
  id,
  quotation_number,
  status,
  customer_name,
  customer_email,
  subtotal_amount,
  tax_amount,
  total_amount,
  valid_until,
  sent_at,
  approved_at,
  created_at,
  updated_at,
  pdf_url,
  quotation_items (
    id,
    quotation_id,
    product_id,
    product_name,
    quantity,
    unit_price,
    total_price,
    specifications,
    order_id
  )
`;

/**
 * Fetch quotations for the authenticated user
 */
export async function fetchQuotationsServerSide(
  userId: string,
  status?: string,
  limit: number = 20,
  offset: number = 0
): Promise<QuotationsData> {
  if (!userId) {
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

  // One round trip returns the filtered page and the exact pagination total.
  let query = serviceClient
    .from('quotations')
    .select(QUOTATIONS_SELECT, { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  // Apply status filter once (check lowercase, uppercase, and workflow statuses)
  if (status && status !== 'all') {
    const statusLower = status.toLowerCase();
    const statusUpper = status.toUpperCase();

    const isWorkflowStatus = (WORKFLOW_STATUSES as readonly string[]).includes(statusUpper);

    if (isWorkflowStatus) {
      // Exact match for workflow statuses
      query = query.eq('status', statusUpper as QuotationStatus);
    } else {
      // IDOR-safe: .or() を .in() で回避（外側の .eq('user_id') と AND 結合・or 短絡リスクなし）
      query = query.in('status', [statusLower, statusUpper] as QuotationStatus[]);
    }
  }

  const { data, count, error } = await query;

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
    items: (q.quotation_items || []).map((item: any) => {
      const specs = item.specifications || {};

      // material_specificationフィールドを追加（管理者ページと同じように表示するため）
      if (specs.materialId && !specs.material_specification) {
        // thicknessSelectionがあればそれを使用、なければデフォルト仕様を使用
        const thicknessSpec = getMaterialSpecification(specs.materialId, specs.thicknessSelection || specs.printingType);
        if (thicknessSpec !== '-') {
          specs.material_specification = thicknessSpec;
        }
      }

      return {
        ...item,
        productName: item.product_name,
        unitPrice: item.unit_price,
        totalPrice: item.total_price,
        orderId: item.order_id,
        // 管理者ページと同じbreakdown構造を構築
        breakdown: {
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          specifications: specs,
          sku_info: specs.sku_quantities ? {
            count: specs.sku_quantities.length,
            quantities: specs.sku_quantities,
            total: specs.sku_quantities.reduce((sum: number, q: number) => sum + q, 0),
          } : null,
        },
      };
    }),
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
      total: count || 0,
    },
  };
}
