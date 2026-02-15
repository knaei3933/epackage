/**
 * Admin Leads API
 *
 * 管理者用リード管理API
 * - GET: リード一覧取得
 * - POST: 新規リード作成
 * - PATCH: リード更新
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';

// ============================================================
// GET - Fetch leads list
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
    const source = searchParams.get('source') || 'ALL';
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Check if leads table exists
    let query = supabase
      .from('leads')
      .select('*', { count: 'exact' });

    // Apply filters
    if (status !== 'ALL') {
      query = query.eq('status', status);
    }

    if (source !== 'ALL') {
      query = query.eq('source', source);
    }

    if (search) {
      query = query.or(`
        company_name.ilike.%${search}%,
        contact_name.ilike.%${search}%,
        email.ilike.%${search}%
      `);
    }

    // Apply pagination
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: leads, error, count } = await query;

    if (error) {
      console.error('[Admin Leads API] Supabase error:', error);

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
        { success: false, error: 'リードの取得に失敗しました。' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: leads || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('[Admin Leads API] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: '予期しないエラーが発生しました。' },
      { status: 500 }
    );
  }
}

// ============================================================
// POST - Create new lead
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
      company_name,
      contact_name,
      email,
      phone,
      source,
      notes,
      estimated_value,
    } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'メールアドレスは必須です。' },
        { status: 400 }
      );
    }

    const { data: newLead, error } = await supabase
      .from('leads')
      .insert({
        company_name: company_name || null,
        contact_name: contact_name || null,
        email,
        phone: phone || null,
        source: source || 'MANUAL',
        notes: notes || null,
        estimated_value: estimated_value || null,
        status: 'NEW',
      })
      .select()
      .single();

    if (error) {
      console.error('[Admin Leads API] Create error:', error);

      // If table doesn't exist
      if (error.code === '42P01') {
        return NextResponse.json(
          { success: false, error: 'リードテーブルが存在しません。' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { success: false, error: 'リードの作成に失敗しました。' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: newLead,
      message: 'リードを作成しました。',
    }, { status: 201 });
  } catch (error) {
    console.error('[Admin Leads API] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: '予期しないエラーが発生しました。' },
      { status: 500 }
    );
  }
}

// ============================================================
// PATCH - Update lead
// ============================================================

export async function PATCH(request: NextRequest) {
  try {
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const supabase = createServiceClient();
    const body = await request.json();

    const { leadId, updates } = body;

    if (!leadId || !updates) {
      return NextResponse.json(
        { success: false, error: 'リードIDと更新内容は必須です。' },
        { status: 400 }
      );
    }

    const { data: updatedLead, error } = await supabase
      .from('leads')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', leadId)
      .select()
      .single();

    if (error) {
      console.error('[Admin Leads API] Update error:', error);
      return NextResponse.json(
        { success: false, error: 'リードの更新に失敗しました。' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedLead,
      message: 'リードを更新しました。',
    });
  } catch (error) {
    console.error('[Admin Leads API] Unexpected error:', error);
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
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
