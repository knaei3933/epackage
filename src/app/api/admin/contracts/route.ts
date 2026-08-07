/**
 * Admin Contracts API
 *
 * 管理者用契約管理API
 * - GET: 契約一覧取得
 * - POST: 新規契約作成
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';
import { escapeIlikePattern, escapePostgrestFilterValue } from '@/lib/sql-helpers';

// ============================================================
// GET - Fetch contracts list
// ============================================================

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const supabase = createServiceClient();
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'ALL';
    const customerId = searchParams.get('customerId');
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('contracts')
      .select('*', { count: 'exact' });

    // Apply filters
    if (status !== 'ALL') {
      query = query.eq('status', status);
    }

    if (customerId) {
      // 注: contracts テーブルに customer_id 列は存在しないため user_id で代替
      query = query.eq('user_id', customerId);
    }

    if (search) {
      // search は自由テキスト（query param）→ %/_ リテラル化 + 区切り文字保護
      const contractPattern = escapePostgrestFilterValue(`%${escapeIlikePattern(search)}%`);
      query = query.or(`contract_number.ilike.${contractPattern},title.ilike.${contractPattern}`);
    }

    // Apply pagination
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: contracts, error, count } = await query;

    if (error) {
      console.error('[Admin Contracts API] Supabase error:', error);

      // If table doesn't exist, return empty array
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return NextResponse.json({
          success: true,
          data: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
          },
        });
      }

      return NextResponse.json(
        { success: false, error: '契約の取得に失敗しました。' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: contracts || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('[Admin Contracts API] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: '予期しないエラーが発生しました。' },
      { status: 500 }
    );
  }
}

// ============================================================
// POST - Create new contract
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const supabase = createServiceClient();
    const body = await request.json();

    const {
      customer_id,
      title,
      contract_type,
      start_date,
      end_date,
      value,
      terms,
      notes,
    } = body;

    if (!customer_id || !title) {
      return NextResponse.json(
        { success: false, error: '顧客IDとタイトルは必須です。' },
        { status: 400 }
      );
    }

    // Generate contract number
    const timestamp = Date.now().toString(36).toUpperCase();
    const contractNumber = `CTR-${timestamp}`;

    // 注: contracts テーブルの実DBカラムに合わせて挿入。
    // customer_id → user_id, start_date → valid_from, end_date → valid_until, value → total_amount
    const { data: newContract, error } = await supabase
      .from('contracts')
      .insert({
        contract_number: contractNumber,
        user_id: customer_id,
        contract_type: contract_type || 'STANDARD',
        valid_from: start_date || null,
        valid_until: end_date || null,
        total_amount: value || 0,
        terms: terms || null,
        notes: notes || null,
        status: 'DRAFT',
        customer_name: '',
        customer_email: '',
        order_id: '', // 必須カラム（空文字で仮投入・運用フローで更新）
        currency: 'JPY',
        contract_data: {},
      })
      .select()
      .single();

    if (error) {
      console.error('[Admin Contracts API] Create error:', error);

      // If table doesn't exist
      if (error.code === '42P01') {
        return NextResponse.json(
          { success: false, error: '契約テーブルが存在しません。' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { success: false, error: '契約の作成に失敗しました。' },
        { status: 500 }
      );
    }

    // 監査ログ（系Bスキーマ: event_type/resource_type/details）
    try {
      await supabase
        .from('audit_logs')
        .insert({
          timestamp: new Date().toISOString(),
          event_type: 'contract_created',
          resource_type: 'contract',
          resource_id: newContract.id,
          user_id: auth.userId,
          outcome: 'success',
          details: {
            before: null,
            after: newContract,
            reason: 'Contract created',
            actor_role: 'admin',
          },
        });
    } catch (auditError) {
      console.warn('[Admin Contracts API] Failed to create audit log:', auditError);
    }

    return NextResponse.json({
      success: true,
      data: newContract,
      message: '契約を作成しました。',
    }, { status: 201 });
  } catch (error) {
    console.error('[Admin Contracts API] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: '予期しないエラーが発生しました。' },
      { status: 500 }
    );
  }
}

// ============================================================
// OPTIONS - CORS preflight
// ============================================================

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
