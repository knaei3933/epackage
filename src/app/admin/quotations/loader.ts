/**
 * Server loader for the initial Admin Quotations list.
 *
 * This mirrors the read path of GET /api/admin/quotations for the page's
 * initial state. The API route remains the source for subsequent client
 * refetches, so its request/response contract is unchanged.
 */

import { createServiceClient } from '@/lib/supabase';
import type { Database } from '@/types/database';
import type { Quotation } from '@/types/quotation';
import { normalizeStatus } from '@/components/admin/quotations/quotation-utils';

type QuotationRow = Database['public']['Tables']['quotations']['Row'];
type UserProfile = Pick<
  Database['public']['Tables']['profiles']['Row'],
  'id' | 'company_name' | 'kanji_last_name' | 'kanji_first_name' | 'corporate_phone' | 'personal_phone'
>;

export interface AdminQuotationsPageData {
  quotations: Quotation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getInitialAdminQuotations({
  status = 'all',
  page = 1,
  limit = 10,
}: {
  status?: string;
  page?: number;
  limit?: number;
} = {}): Promise<AdminQuotationsPageData> {
  const emptyResult: AdminQuotationsPageData = {
    quotations: [],
    pagination: { page, limit, total: 0, totalPages: 0 },
  };

  try {
    const supabase = createServiceClient();
    const offset = (page - 1) * limit;
    let query = supabase
      .from('quotations')
      .select('*, quotation_items(*)', { count: 'exact' });

    if (status !== 'all') {
      query = query.eq(
        'status',
        normalizeStatus(status) as Database['public']['Enums']['quotation_status'],
      );
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: quotations, error, count } = await query;
    if (error) {
      console.error('[AdminQuotationsLoader] Get quotations error:', error);
      return emptyResult;
    }

    const rows = (quotations || []) as Array<
      QuotationRow & {
        quotation_items?: Database['public']['Tables']['quotation_items']['Row'][];
      }
    >;
    const userIds = Array.from(new Set(rows.map((row) => row.user_id).filter(Boolean)));
    const profileMap = new Map<string, UserProfile>();

    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, company_name, kanji_last_name, kanji_first_name, corporate_phone, personal_phone')
        .in('id', userIds);

      for (const profile of (profiles || []) as UserProfile[]) {
        profileMap.set(profile.id, profile);
      }
    }

    const normalizedQuotations = rows.map((quotation) => {
      const quotationItems = quotation.quotation_items || [];
      return {
        ...quotation,
        status: normalizeStatus(quotation.status),
        company_name: profileMap.get(quotation.user_id)?.company_name || null,
        kanji_last_name: profileMap.get(quotation.user_id)?.kanji_last_name || null,
        kanji_first_name: profileMap.get(quotation.user_id)?.kanji_first_name || null,
        corporate_phone: profileMap.get(quotation.user_id)?.corporate_phone || null,
        personal_phone: profileMap.get(quotation.user_id)?.personal_phone || null,
        items: quotationItems.map((item) => {
          const specifications = (item.specifications || {}) as {
            sku_quantities?: number[];
            [key: string]: unknown;
          };
          const quantity = item.quantity;
          const unitPrice = item.unit_price;
          return {
            ...item,
            breakdown: {
              quantity,
              unit_price: unitPrice,
              total_price: item.total_price,
              specifications,
              sku_info: specifications.sku_quantities
                ? {
                    count: specifications.sku_quantities.length,
                    quantities: specifications.sku_quantities,
                    total: specifications.sku_quantities.reduce(
                      (sum: number, currentQuantity: number) => sum + currentQuantity,
                      0,
                    ),
                  }
                : null,
            },
          };
        }),
      };
    });

    const total = count || 0;
    return {
      quotations: normalizedQuotations as unknown as Quotation[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('[AdminQuotationsLoader] Unexpected error:', error);
    return emptyResult;
  }
}
