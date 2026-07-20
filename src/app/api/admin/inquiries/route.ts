/**
 * Admin Inquiries List API
 *
 * GET /api/admin/inquiries - お問い合わせ一覧取得（管理者・全文検索 + フィルタ）
 *
 * SECURITY:
 * - withAdminAuth で ADMIN ロール + ACTIVE を必須化（第一防御線）
 * - search_inquiries() RPC は SECURITY DEFINER・管理者 API 経由のみで呼出
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { withAdminAuth } from '@/lib/api-auth';
import { withApiHandler } from '@/lib/api-error-handler';

// ============================================================
// Constants
// ============================================================

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

// inquiries.type の全候補（database.ts の enum と一致）
const VALID_TYPES = new Set([
  'product', 'quotation', 'sample', 'order', 'billing',
  'other', 'general', 'technical', 'sales', 'support',
]);

// inquiries.status の全候補
const VALID_STATUSES = new Set([
  'open', 'responded', 'resolved', 'closed', 'pending', 'in_progress',
]);

// ============================================================
// GET - お問い合わせ一覧（全文検索 + フィルタ）
// ============================================================

// ============================================================
// Helpers
// ============================================================

/**
 * inquiry 行（RPC または fallback SELECT の結果）をクライアント向け shape に変換
 * search_inquiries RPC と fallback SELECT で共用（DRY）
 *
 * orderNumber は inquiries テーブルに存在しないため外部から補完して渡す（AC-API-5）。
 * search_inquiries RPC は SETOF inquiries を返すため order_id は含まれるが
 * order_number は含まれない → fetchOrderNumberMap で orders を別途 JOIN して補完。
 *
 * @param row RPC / SELECT の生行
 * @param orderNumber 補完済みの注文番号（未補完時は null・注文 inquiry 以外は null）
 */
function transformInquiryRow(
  row: Record<string, unknown>,
  orderNumber?: string | null,
) {
  const orderId = (row.order_id as string | null | undefined) ?? null;
  return {
    id: row.id,
    inquiryNumber: row.inquiry_number || row.request_number || null,
    type: row.type,
    status: row.status,
    subject: row.subject,
    message: row.message,
    customerName: row.customer_name,
    customerNameKana: row.customer_name_kana,
    companyName: row.company_name,
    email: row.email,
    phone: row.phone,
    urgency: row.urgency,
    preferredContact: row.preferred_contact,
    userId: row.user_id,
    orderId,
    orderNumber: orderNumber ?? (row.order_number as string | null | undefined) ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    respondedAt: row.responded_at,
  };
}

/**
 * inquiry 行リストから注文 ID を抽出し、orders テーブルを一括 SELECT して
 * order_id → order_number の map を構築（N+1 回避・AC-API-5）。
 *
 * 戻り値が空の inquiry リストや order_id が1件も無い場合は空 Map を返す（SELECT 発行なし）。
 */
async function fetchOrderNumberMap(
  supabase: ReturnType<typeof createServiceClient>,
  rows: Array<Record<string, unknown>>,
): Promise<Map<string, string>> {
  const orderIds = Array.from(
    new Set(
      rows
        .map((r) => r.order_id as string | null | undefined)
        .filter((id): id is string => typeof id === 'string' && id.length > 0),
    ),
  );
  if (orderIds.length === 0) return new Map();

  const { data: orders, error } = await (supabase as any)
    .from('orders')
    .select('id, order_number')
    .in('id', orderIds);

  if (error) {
    console.error('[admin inquiries GET] order_number JOIN error (non-blocking):', error);
    return new Map();
  }

  const map = new Map<string, string>();
  for (const o of (orders || []) as Array<{ id: string; order_number: string }>) {
    map.set(o.id, o.order_number);
  }
  return map;
}

export const GET = withApiHandler(
  withAdminAuth<any>(async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search')?.trim() || null;
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const limitRaw = parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT), 10);
    const limit = Number.isFinite(limitRaw)
      ? Math.min(Math.max(limitRaw, 1), MAX_LIMIT)
      : DEFAULT_LIMIT;

    // バリデーション（不正値は null = フィルタ無視）
    const typeParam = type && type !== 'all' && VALID_TYPES.has(type) ? type : null;
    const statusParam = status && status !== 'all' && VALID_STATUSES.has(status) ? status : null;

    const supabase = createServiceClient();

    // search_inquiries() RPC（全文検索 + フィルタ・SETOF inquiries）
    const { data: inquiries, error } = await supabase.rpc('search_inquiries', {
      search_term: search,
      inquiry_type_param: typeParam,
      status_param: statusParam,
      limit_count: limit,
    });

    if (error) {
      console.error('[admin inquiries GET] RPC error:', error);
      // RPC 未定義等の安全網: エラーマッチを拡張してフォールバック SELECT で代替
      // （search_inquiries RPC 適用済みだが、万が一の未定義/リグレッションに備える）
      const isRpcMissing =
        error.code === '42883' || // PostgreSQL: undefined function
        error.code === 'PGRST202' || // PostgREST: function/procedure not found
        error.code === 'PGRST116' || // PostgREST: function resolution error
        error.message?.includes('does not exist') ||
        error.message?.includes('Could not find the function');

      if (isRpcMissing) {
        // フォールバック: search_term 検索なし・status/type フィルタのみの素の SELECT
        let fallbackQuery = supabase
          .from('inquiries')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);
        if (statusParam) {
          fallbackQuery = fallbackQuery.eq('status', statusParam);
        }
        if (typeParam) {
          fallbackQuery = fallbackQuery.eq('type', typeParam);
        }
        const { data: fallbackRows, error: fallbackError } = await fallbackQuery;

        if (fallbackError) {
          console.error('[admin inquiries GET] Fallback SELECT error:', fallbackError);
          return NextResponse.json(
            { success: false, error: 'お問い合わせ一覧の取得に失敗しました', code: 'FETCH_ERROR' },
            { status: 500 }
          );
        }

        const fallbackList = (fallbackRows || []) as Array<Record<string, unknown>>;
        const fallbackOrderMap = await fetchOrderNumberMap(supabase, fallbackList);
        const fallbackTransformed = fallbackList.map((row) =>
          transformInquiryRow(row, row.order_id ? fallbackOrderMap.get(row.order_id as string) ?? null : null),
        );

        return NextResponse.json({
          success: true,
          data: fallbackTransformed,
          meta: {
            count: fallbackTransformed.length,
            filters: { search, type: typeParam, status: statusParam, limit },
            fallback: true, // RPC 不可のため全文検索なしのフォールバックであることを明示
          },
        });
      }

      return NextResponse.json(
        { success: false, error: 'お問い合わせ一覧の取得に失敗しました', code: 'FETCH_ERROR' },
        { status: 500 }
      );
    }

    const list = (inquiries || []) as Array<Record<string, unknown>>;

    // order_id → order_number の map を構築してクライアント向け shape へ変換
    // （search_inquiries RPC は SETOF inquiries なので order_id は含むが order_number は含まない）
    const orderMap = await fetchOrderNumberMap(supabase, list);
    const transformed = list.map((row) =>
      transformInquiryRow(row, row.order_id ? orderMap.get(row.order_id as string) ?? null : null),
    );

    return NextResponse.json({
      success: true,
      data: transformed,
      meta: {
        count: transformed.length,
        filters: { search, type: typeParam, status: statusParam, limit },
      },
    });
  })
);
