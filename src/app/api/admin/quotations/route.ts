/**
 * Admin Quotations Management API
 *
 * 관리자 견적 관리 API
 * - GET: 모든 견적 조회 (검색, 필터, 정렬)
 * - PATCH: 견적 정보 수정
 * - DELETE: 견적 삭제
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
  status?: 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string | null;
  notes?: string | null;
  admin_notes?: string | null;
  pdf_url?: string | null;
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

    // Build query with quotation_items
    let query = supabase
      .from('quotations')
      .select(`
        id,
        quotation_number,
        status,
        user_id,
        customer_name,
        customer_email,
        customer_phone,
        subtotal_amount,
        tax_amount,
        total_amount,
        valid_until,
        notes,
        admin_notes,
        pdf_url,
        sent_at,
        approved_at,
        created_at,
        updated_at,
        quotation_items (
          id,
          product_id,
          product_name,
          quantity,
          unit_price,
          total_price,
          specifications
        )
      `, { count: 'exact' });

    // Apply filters
    if (status) {
      query = query.eq('status', status.toUpperCase());
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
        { error: ' 견적 목록 조회에 실패했습니다.', details: error.message },
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
      { error: '예기치 못한 오류가 발생했습니다.', details: error instanceof Error ? error.message : String(error) },
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
        { error: '견적 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // Create service client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update quotation
    const { data: quotation, error } = await supabase
      .from('quotations')
      .update({
        ...(body.status && { status: body.status }),
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
        { error: '견적 수정에 실패했습니다.', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      quotation,
      message: '견적이 수정되었습니다.',
    });
  } catch (error) {
    console.error('[Admin Quotations API] Unexpected error:', error);
    return NextResponse.json(
      { error: '예기치 못한 오류가 발생했습니다.', details: error instanceof Error ? error.message : String(error) },
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
        { error: '견적 ID가 필요합니다.' },
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
        { error: '견적 삭제에 실패했습니다.', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '견적이 삭제되었습니다.',
    });
  } catch (error) {
    console.error('[Admin Quotations API] Unexpected error:', error);
    return NextResponse.json(
      { error: '예기치 못한 오류가 발생했습니다.', details: error instanceof Error ? error.message : String(error) },
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
