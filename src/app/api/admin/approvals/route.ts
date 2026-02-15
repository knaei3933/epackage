/**
 * Admin Approvals API
 *
 * 管理者用会員承認API
 * - GET: 承認待ちメンバーリスト取得
 * - PATCH: メンバー承認/拒否
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';

// ============================================================
// GET - Fetch pending member approvals
// ============================================================

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const supabase = createServiceClient();
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'PENDING';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Build query for pending members
    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' });

    // Filter by status
    if (status !== 'ALL') {
      query = query.eq('status', status);
    }

    // Apply pagination
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: members, error, count } = await query;

    if (error) {
      console.error('[Admin Approvals API] Supabase error:', error);
      return NextResponse.json(
        { success: false, error: '承認待ちメンバーの取得に失敗しました。' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: members || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('[Admin Approvals API] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: '予期しないエラーが発生しました。' },
      { status: 500 }
    );
  }
}

// ============================================================
// PATCH - Approve or reject member
// ============================================================

export async function PATCH(request: NextRequest) {
  try {
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const supabase = createServiceClient();
    const body = await request.json();

    const { userId, action, reason } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { success: false, error: 'ユーザーIDとアクションは必須です。' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, error: '無効なアクションです。' },
        { status: 400 }
      );
    }

    const newStatus = action === 'approve' ? 'ACTIVE' : 'REJECTED';

    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .update({
        status: newStatus,
        status_reason: reason || null,
        approved_at: action === 'approve' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('[Admin Approvals API] Update error:', error);
      return NextResponse.json(
        { success: false, error: 'ステータスの更新に失敗しました。' },
        { status: 500 }
      );
    }

    // Create audit log
    try {
      await supabase
        .from('audit_logs')
        .insert({
          table_name: 'profiles',
          record_id: userId,
          action: 'UPDATE',
          old_value: { status: 'PENDING' },
          new_value: { status: newStatus, reason },
          changed_by: 'ADMIN',
          reason: `Member ${action}`,
        });
    } catch (auditError) {
      console.warn('[Admin Approvals API] Failed to create audit log:', auditError);
    }

    return NextResponse.json({
      success: true,
      data: updatedProfile,
      message: action === 'approve' ? 'メンバーを承認しました。' : 'メンバーを拒否しました。',
    });
  } catch (error) {
    console.error('[Admin Approvals API] Unexpected error:', error);
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
      'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
