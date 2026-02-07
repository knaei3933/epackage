/**
 * Admin Quotations Management API
 *
 * 管理者見積管理API
 * - GET: すべての見積を取得（検索、フィルタ、ソート）
 * - PATCH: 見積情報を更新
 * - DELETE: 見積を削除
 */

import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/types/database';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

// ============================================================
// Types
// ============================================================

interface QuotationListQuery {
  page?: string;
  limit?: string;
  status?: string;
  userId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface UpdateQuotationRequestBody {
  status?: 'QUOTATION_PENDING' | 'QUOTATION_APPROVED' | 'REJECTED' | 'EXPIRED' | 'CONVERTED';
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string | null;
  notes?: string | null;
  admin_notes?: string | null;
  pdf_url?: string | null;
}

// ステータス値を正規化（10段階ワークフロー用UPPERCASE）
function normalizeStatus(status: string): string {
  if (!status) return 'QUOTATION_PENDING';
  // Map legacy values to new 10-step workflow statuses
  const legacyMap: Record<string, string> = {
    'draft': 'QUOTATION_PENDING',
    'sent': 'QUOTATION_PENDING',
    'pending': 'QUOTATION_PENDING',
    'approved': 'QUOTATION_APPROVED',
    'rejected': 'REJECTED',
    'expired': 'EXPIRED',
    'converted': 'CONVERTED',
  };
  return legacyMap[status.toLowerCase()] || status.toUpperCase();
}

// ============================================================
// GET /api/admin/quotations - Get all quotations (admin only)
// ============================================================

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    // Create service client (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = (page - 1) * limit;
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    // Build query - simple select without quotation_items relation
    let query = supabase
      .from('quotations')
      .select('*', { count: 'exact' });

    // Apply filters - use normalized status for 10-step workflow
    if (status) {
      query = query.eq('status', normalizeStatus(status));
    }
    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (search) {
      query = query.or(`quotation_number.ilike.%${search}%,customer_name.ilike.%${search}%,customer_email.ilike.%${search}%`);
    }

    // Apply sorting and pagination
    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    const { data: quotations, error, count } = await query;

    if (error) {
      console.error('[Admin Quotations API] Get quotations error:', error);
      return NextResponse.json(
        { error: '見積リストの取得に失敗しました。', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      quotations: quotations || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('[Admin Quotations API] Unexpected error:', error);
    return NextResponse.json(
      { error: '予期しないエラーが発生しました。', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// ============================================================
// PATCH /api/admin/quotations - Update quotation (admin only)
// ============================================================

export async function PATCH(request: NextRequest) {
  try {
    // Verify admin authentication
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const body: UpdateQuotationRequestBody = await request.json();
    const { searchParams } = new URL(request.url);
    const quotationId = searchParams.get('id');

    if (!quotationId) {
      return NextResponse.json(
        { error: '見積IDが必要です。' },
        { status: 400 }
      );
    }

    // Create service client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update quotation - use normalized status for 10-step workflow
    const { data: quotation, error } = await supabase
      .from('quotations')
      .update({
        ...(body.status && { status: normalizeStatus(body.status) }),
        ...(body.customer_name && { customer_name: body.customer_name }),
        ...(body.customer_email && { customer_email: body.customer_email }),
        ...(body.customer_phone !== undefined && { customer_phone: body.customer_phone }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.admin_notes !== undefined && { admin_notes: body.admin_notes }),
        ...(body.pdf_url !== undefined && { pdf_url: body.pdf_url }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', quotationId)
      .select()
      .single();

    if (error) {
      console.error('[Admin Quotations API] Update quotation error:', error);
      return NextResponse.json(
        { error: '見積の更新に失敗しました。', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      quotation,
      message: '見積が更新されました。',
    });
  } catch (error) {
    console.error('[Admin Quotations API] Unexpected error:', error);
    return NextResponse.json(
      { error: '予期しないエラーが発生しました。', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// ============================================================
// DELETE /api/admin/quotations - Delete quotation (admin only)
// ============================================================

export async function DELETE(request: NextRequest) {
  try {
    // Verify admin authentication
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const quotationId = searchParams.get('id');

    if (!quotationId) {
      return NextResponse.json(
        { error: '見積IDが必要です。' },
        { status: 400 }
      );
    }

    // Create service client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Delete quotation (cascade will delete quotation_items)
    const { error } = await supabase
      .from('quotations')
      .delete()
      .eq('id', quotationId);

    if (error) {
      console.error('[Admin Quotations API] Delete quotation error:', error);
      return NextResponse.json(
        { error: '見積の削除に失敗しました。', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '見積が削除されました。',
    });
  } catch (error) {
    console.error('[Admin Quotations API] Unexpected error:', error);
    return NextResponse.json(
      { error: '予期しないエラーが発生しました。', details: error instanceof Error ? error.message : String(error) },
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
