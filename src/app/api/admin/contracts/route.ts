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
      query = query.eq('customer_id', customerId);
    }

    if (search) {
      query = query.or(`
        contract_number.ilike.%${search}%,
        title.ilike.%${search}%
      `);
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

    const { data: newContract, error } = await supabase
      .from('contracts')
      .insert({
        contract_number: contractNumber,
        customer_id,
        title,
        contract_type: contract_type || 'STANDARD',
        start_date: start_date || null,
        end_date: end_date || null,
        value: value || null,
        terms: terms || null,
        notes: notes || null,
        status: 'DRAFT',
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

    // Create audit log
    try {
      await supabase
        .from('audit_logs')
        .insert({
          table_name: 'contracts',
          record_id: newContract.id,
          action: 'CREATE',
          old_value: null,
          new_value: newContract,
          changed_by: 'ADMIN',
          reason: 'Contract created',
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
