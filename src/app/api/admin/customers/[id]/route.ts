/**
 * Individual Customer API Routes
 *
 * 個別顧客APIルート
 * - GET: 顧客詳細取得
 * - PATCH: 顧客情報更新
 * - DELETE: 顧客削除（ソフト削除）
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { unauthorizedResponse, authenticateAdminAction } from '@/lib/auth-helpers';
import type { Database } from '@/types/database';
import { invalidateAdminDashboardCache } from '@/lib/cache-helpers';
import {
  profileEditSchema,
  mapProfileEditToSnakeCase,
  adminEditProfileSchema,
} from '@/lib/validations/profile-edit';
import type {
  Profile,
  CustomerOrder,
  CustomerQuotation,
  CustomerDetailResponse,
  ContactHistory,
} from '@/app/admin/customers/management/parts/types';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

// ============================================================
// GET - Fetch single customer with full details
// ============================================================

export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    // 権限検査: user:read（詳細ページ page.tsx の requireAdminAuth(['user:read']) と認可整合）
    // 従来の verifyAdminAuth（ロール検査のみ）から authenticateAdminAction（権限検査あり）へ移行。
    // ページ側と同じ user:read 基準で認可し、operator/sales が詳細ページを開けるようにする。
    const context = await authenticateAdminAction(['user:read']);
    if (!context) {
      return unauthorizedResponse();
    }

    const supabase = createServiceClient();
    const { id } = await params;

    // Fetch customer from profiles
    const { data: customer, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('[Customer Detail API] Supabase error:', error);
      return NextResponse.json(
        { success: false, error: '顧客データの取得に失敗しました。' },
        { status: 500 }
      );
    }

    if (!customer) {
      return NextResponse.json(
        { success: false, error: '顧客が見つかりません。' },
        { status: 404 }
      );
    }

    // Fetch customer's orders — CustomerOrder 必要フィールドのみ明示 select
    // （quotation_id 含む・Step 8 の注文明細→見積紐付け表示に使用・created_at 降順）
    // limit 解除・全件取得（クライアント側ページネーションのため）
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, order_number, status, total_amount, created_at, quotation_id')
      .eq('user_id', id)
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('[Customer Detail API] Orders query error:', ordersError);
    }

    // Fetch customer's quotations with items
    // 注意: quotation_items.notes 列は実DBに存在しない。select に含めると PostgREST が
    // 42703 (undefined_column) を返し HTTP 400 になり、quotations 全体が取得できなくなる
    // （一覧APIはこの列を参照しないため正常に取得でき、一覧/詳細の乖離が起きていた）。
    // limit 解除・全件取得（クライアント側ページネーションのため）
    const { data: quotations, error: quotationsError } = await supabase
      .from('quotations')
      .select(`
        id,
        quotation_number,
        status,
        customer_name,
        customer_email,
        subtotal_amount,
        tax_amount,
        total_amount,
        valid_until,
        pdf_url,
        created_at,
        updated_at,
        sent_at,
        approved_at,
        rejected_at,
        notes,
        admin_notes,
        items:quotation_items(
          id,
          product_name,
          quantity,
          unit_price,
          total_price,
          specifications
        )
      `)
      .eq('user_id', id)
      .order('created_at', { ascending: false });

    if (quotationsError) {
      console.error('[Customer Detail API] Quotations query error:', quotationsError);
    }

    // Calculate statistics
    const totalOrders = orders?.length || 0;
    const totalSpent = orders?.reduce((sum: number, order: { total_amount: number | null }) => sum + (order.total_amount || 0), 0) || 0;
    const lastOrderDate = orders?.[0]?.created_at || null;
    const totalQuotations = quotations?.length || 0;
    const pendingQuotations = quotations?.filter((q: { status: string }) => q.status === 'QUOTATION_PENDING' || q.status === 'draft' || q.status === 'sent').length || 0;

    // Fetch contact history (if table exists)
    // 注意: customer_contacts テーブルが未作成の場合は PostgREST 404 になる（error を可視化）
    const { data: contactHistory, error: contactHistoryError } = await supabase
      .from('customer_contacts')
      .select('*')
      .eq('customer_id', id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (contactHistoryError) {
      console.error('[Customer Detail API] Contact history query error:', contactHistoryError);
    }

    const response: CustomerDetailResponse = {
      success: true,
      data: {
        // profiles Row（実DB型）→ Profile（UI 共有型）へ最小キャスト。
        // 技術的負債: 実DB Row と Profile（types.ts）の列定義差（product_category enum vs string 等）
        // は構造的部分型で安全。customer_contacts.type は string → ContactHistory.type ('email'|'call'|'note') は変換不要（検証で代替）。
        customer: customer as unknown as Profile,
        statistics: {
          totalOrders,
          totalSpent,
          lastOrderDate,
          totalQuotations,
          pendingQuotations,
        },
        orders: (orders as CustomerOrder[] | null) || [],
        quotations: (quotations as CustomerQuotation[] | null) || [],
        contactHistory: (contactHistory as unknown as ContactHistory[] | null) || [],
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Customer Detail API] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: '予期しないエラーが発生しました。' },
      { status: 500 }
    );
  }
}

// ============================================================
// PATCH - Update customer
// ============================================================

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    // 権限検査: user:write（認証 + ロール[admin/operator/sales] + ACTIVE + 権限を統合検査）
    // 従来の verifyAdminAuth（ロール検査のみ）から authenticateAdminAction（権限検査あり）へ強化。
    // 未保有（member 等）・非ACTIVE・未認証は null → 401 で拒否。
    const context = await authenticateAdminAction(['user:write']);
    if (!context) {
      return unauthorizedResponse();
    }

    const supabase = createServiceClient();
    const { id } = await params;
    const body = await request.json();

    // --- 基本情報（camelCase → snake_case 変換・検証） ---
    // profileEditSchema で基本情報を検証し、mapProfileEditToSnakeCase で profiles UPDATE 用へ変換。
    // ※ email/password/status はスキーマに含まれないため構造的に保護される。
    const basicResult = profileEditSchema.safeParse(body);
    if (!basicResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: '入力内容が不正です。',
          details: basicResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const sanitizedUpdates: Record<string, unknown> = {
      ...mapProfileEditToSnakeCase(basicResult.data),
    };

    // --- mass-assignment 防御（C-12・management/route.ts と統一） ---
    // 認証・権限系フィールド（email/password/status/role 等）を除外。
    // リクエスト偽装による role 昇格・email 乗っ取り・任意 status 変更を防ぐ最終防衛。
    const FORBIDDEN_UPDATE_FIELDS = new Set([
      'id', 'role', 'status', 'email', 'password', 'hashed_password',
      'created_at', 'updated_at', 'auth_id', 'user_id',
    ]);
    for (const forbidden of FORBIDDEN_UPDATE_FIELDS) {
      delete sanitizedUpdates[forbidden];
    }

    // --- 運用項目（status・markup_rate・markup_rate_note） ---
    // status は上記 FORBIDDEN_UPDATE_FIELDS で一旦除外した上で、
    // adminEditProfileSchema が検証・許可した status（INVITED 除く4値）のみ sanitizedUpdates へ再追加する。
    // これで (A) 任意 status の mass-assignment 防止 + (B) 管理者による正当な status 切替 を両立。
    const hasAdminFields =
      body?.status !== undefined ||
      body?.markup_rate !== undefined ||
      body?.markup_rate_note !== undefined;

    if (hasAdminFields) {
      const adminResult = adminEditProfileSchema.safeParse({
        status: body?.status,
        markup_rate: body?.markup_rate,
        markup_rate_note: body?.markup_rate_note,
      });
      if (!adminResult.success) {
        return NextResponse.json(
          {
            success: false,
            error: '運用項目の入力内容が不正です。',
            details: adminResult.error.flatten(),
          },
          { status: 400 }
        );
      }
      // 検証済み status のみ再追加（ホワイトリスト方式・INVITED は弾かれる）
      sanitizedUpdates.status = adminResult.data.status;
      if (adminResult.data.markup_rate !== undefined) {
        sanitizedUpdates.markup_rate = adminResult.data.markup_rate;
      }
      if (adminResult.data.markup_rate_note !== undefined) {
        sanitizedUpdates.markup_rate_note = adminResult.data.markup_rate_note;
      }
    }

    // 更新対象フィールドが無い場合は拒否
    if (Object.keys(sanitizedUpdates).length === 0) {
      return NextResponse.json(
        { success: false, error: '更新可能なフィールドがありません。' },
        { status: 400 }
      );
    }

    // Update customer in profiles
    const { data: updatedCustomer, error } = await supabase
      .from('profiles')
      .update({
        ...sanitizedUpdates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      console.error('[Customer Detail API] Update error:', error);
      return NextResponse.json(
        { success: false, error: '顧客の更新に失敗しました。' },
        { status: 500 }
      );
    }

    if (!updatedCustomer) {
      return NextResponse.json(
        { success: false, error: '顧客が見つかりません。' },
        { status: 404 }
      );
    }

    // ダッシュボード統計の即時反映（C2・Phase 4-3・profiles UPDATE → activeUsers KPI 即時反映）
    invalidateAdminDashboardCache();

    return NextResponse.json({
      success: true,
      data: updatedCustomer,
      message: '顧客情報を更新しました。',
    });
  } catch (error) {
    console.error('[Customer Detail API] Update error:', error);
    return NextResponse.json(
      { success: false, error: '予期しないエラーが発生しました。' },
      { status: 500 }
    );
  }
}

// ============================================================
// DELETE - Delete customer (soft delete)
// ============================================================

export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    // 権限検査: user:delete（認証 + ロール[admin/operator/sales] + ACTIVE + 権限を統合検査）
    // 従来の verifyAdminAuth（ロール検査のみ）から authenticateAdminAction（権限検査あり）へ強化。
    const context = await authenticateAdminAction(['user:delete']);
    if (!context) {
      return unauthorizedResponse();
    }

    const supabase = createServiceClient();
    const { id } = await params;

    // Soft delete by updating status in profiles
    const { data: deletedCustomer, error } = await supabase
      .from('profiles')
      .update({
        status: 'DELETED',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      console.error('[Customer Detail API] Delete error:', error);
      return NextResponse.json(
        { success: false, error: '顧客の削除に失敗しました。' },
        { status: 500 }
      );
    }

    if (!deletedCustomer) {
      return NextResponse.json(
        { success: false, error: '顧客が見つかりません。' },
        { status: 404 }
      );
    }

    // ダッシュボード統計の即時反映（C2・Phase 4-3・profiles.status=DELETED → activeUsers/pendingUsers 直結）
    invalidateAdminDashboardCache();

    return NextResponse.json({
      success: true,
      data: deletedCustomer,
      message: '顧客を削除しました。',
    });
  } catch (error) {
    console.error('[Customer Detail API] Delete error:', error);
    return NextResponse.json(
      { success: false, error: '予期しないエラーが発生しました。' },
      { status: 500 }
    );
  }
}

// ============================================================
// OPTIONS handler for CORS
// ============================================================

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'GET, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
