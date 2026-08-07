/**
 * Member Invoices API (UNIFIED - Using new auth middleware)
 *
 * GET /api/member/invoices - List authenticated member's invoices with filtering
 *
 * SECURITY: Uses unified auth middleware from api-auth.ts
 * SECURITY: Uses unified error handling from api-error-handler.ts
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import type { Database } from '@/types/database';
import { withMemberAuth } from '@/lib/api-auth';
import { withApiHandler } from '@/lib/api-error-handler';
import { escapeIlikePattern, escapePostgrestFilterValue } from '@/lib/sql-helpers';
// NOTE: invoices / invoice_items tables are not present in the generated Database types.
type InvoiceWithItems = Record<string, unknown> & {
  invoice_items?: Record<string, unknown>[];
};

/**
 * GET /api/member/invoices
 * List authenticated member's invoices with filtering
 */
export const GET = withApiHandler(
  withMemberAuth(async (request: NextRequest, auth) => {
    const userId = auth.userId;

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const supabase = createServiceClient();

    // Build query - fetch only authenticated user's invoices
    let query = supabase
      .from('invoices')
      .select(`
        *,
        invoice_items (*)
      `)
      .eq('user_id', userId)
      .order('issue_date', { ascending: false });

    // Apply status filter if provided
    if (status && status !== 'all') {
      query = query.eq('status', status as Database['public']['Enums']['invoice_status']);
    }

    // Apply search filter (invoice_number, customer_name, company_name)
    // IDOR-safe: .or() の各条件に user_id を and() で含め、PostgREST の or 短絡評価
    // (user_id=X) OR (ilike) と展開されて他人の invoice がヒットするのを防ぐ（解A）。
    // 各条件が and(user_id.eq.X, <column>.ilike.X) になるため、外側の .eq('user_id') に
    // 依存せず user_id 制約が or 内で完結する（upload route IDOR commit 3fb98c27 と同種の防御）。
    // エスケープ: ilike ワイルドカード %/_（escapeIlikePattern）と PostgREST 区切り文字
    // ,/./"（escapePostgrestFilterValue で値全体をダブルクォート保護）をリテラル化。
    // inline ローカル関数から Task 1 ヘルパへ統一（admin blog route Task 3 パターンと同一）。
    if (search) {
      const escaped = escapePostgrestFilterValue(`%${escapeIlikePattern(search)}%`);
      // userId も防御的観点でエスケープ（UUID 固定形式で実害ゼロだが、PostgREST 区切り文字
      // ,/./" が万が一含まれた場合の短絡評価を防ぐ・LOW-1）。
      const userIdEscaped = escapePostgrestFilterValue(userId);
      query = query.or(
        `and(user_id.eq.${userIdEscaped},invoice_number.ilike.${escaped}),` +
          `and(user_id.eq.${userIdEscaped},customer_name.ilike.${escaped}),` +
          `and(user_id.eq.${userIdEscaped},company_name.ilike.${escaped})`
      );
    }

    // Apply date range filter
    if (startDate) {
      query = query.gte('issue_date', startDate);
    }
    if (endDate) {
      query = query.lte('issue_date', endDate);
    }

    const { data: invoices, error } = await query;

    if (error) {
      console.error('[Invoices API] Error fetching invoices:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: invoices || [],
    });
  })
);
