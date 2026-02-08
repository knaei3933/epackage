/**
 * Customer Management API Routes
 *
 * 管理者用顧客管理API
 * - GET: 顧客一覧取得（ページネーション、検索、フィルタ）
 * - POST: 新規顧客作成
 * - PATCH: 一括更新
 * - DELETE: ソフト削除
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';
import type { Database } from '@/types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];

// ============================================================
// Types
// ============================================================

interface CustomerWithStats extends Profile {
  totalOrders?: number;
  totalSpent?: number;
  lastOrderDate?: string | null;
}

interface CustomerListResponse {
  success: boolean;
  data?: CustomerWithStats[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
}

// ============================================================
// GET - Fetch customers with filtering and pagination
// ============================================================

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const supabase = createServiceClient();
    const searchParams = request.nextUrl.searchParams;

    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'ALL';
    const period = searchParams.get('period') || 'all';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const offset = (page - 1) * limit;

    // Build query - use profiles table
    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' });

    // Apply status filter
    if (status !== 'ALL') {
      query = query.eq('status', status);
    }

    // Apply search filter
    if (search) {
      query = query.or(`
        email.ilike.%${search}%,
        kanji_last_name.ilike.%${search}%,
        kanji_first_name.ilike.%${search}%,
        kana_last_name.ilike.%${search}%,
        kana_first_name.ilike.%${search}%,
        company_name.ilike.%${search}%,
        corporate_phone.ilike.%${search}%,
        personal_phone.ilike.%${search}%
      `);
    }

    // Apply date period filter
    if (period !== 'all') {
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'quarter':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0);
      }

      query = query.gte('created_at', startDate.toISOString());
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: customers, error, count } = await query;

    if (error) {
      console.error('[Customer Management API] Supabase error:', error);
      return NextResponse.json(
        { success: false, error: '顧客データの取得に失敗しました。' },
        { status: 500 }
      );
    }

    // Fetch order statistics for each customer
    const customerIds = (customers || []).map((c: Profile) => c.id);
    const { data: orderStats } = await supabase
      .from('orders')
      .select('user_id, total_amount, created_at')
      .in('user_id', customerIds);

    // Aggregate statistics by customer
    const statsMap = new Map<string, { totalOrders: number; totalSpent: number; lastOrderDate: string | null }>();
    orderStats?.forEach((order: any) => {
      if (!statsMap.has(order.user_id)) {
        statsMap.set(order.user_id, {
          totalOrders: 0,
          totalSpent: 0,
          lastOrderDate: null,
        });
      }
      const stats = statsMap.get(order.user_id)!;
      stats.totalOrders += 1;
      stats.totalSpent += order.total_amount || 0;
      if (!stats.lastOrderDate || new Date(order.created_at) > new Date(stats.lastOrderDate)) {
        stats.lastOrderDate = order.created_at;
      }
    });

    // Combine customer data with statistics
    const customersWithStats = (customers || []).map((customer: Profile) => ({
      ...customer,
      totalOrders: statsMap.get(customer.id)?.totalOrders || 0,
      totalSpent: statsMap.get(customer.id)?.totalSpent || 0,
      lastOrderDate: statsMap.get(customer.id)?.lastOrderDate || null,
    }));

    const response: CustomerListResponse = {
      success: true,
      data: customersWithStats,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Customer Management API] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: '予期しないエラーが発生しました。' },
      { status: 500 }
    );
  }
}

// ============================================================
// POST - Create new customer (admin only)
// ============================================================

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const supabase = createServiceClient();
    const body = await request.json();

    // Validate required fields
    const { email, password, ...customerData } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'メールアドレスは必須です。' },
        { status: 400 }
      );
    }

    // Check if email already exists in profiles
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingProfile) {
      return NextResponse.json(
        { success: false, error: 'このメールアドレスは既に登録されています。' },
        { status: 409 }
      );
    }

    // Create auth user (using Supabase Auth Admin API would be needed here)
    // For now, we'll create the profile entry only
    const { data: newProfile, error } = await supabase
      .from('profiles')
      .insert({
        email,
        role: 'MEMBER',
        status: 'PENDING',
        kanji_last_name: customerData.kanji_last_name || '',
        kanji_first_name: customerData.kanji_first_name || '',
        kana_last_name: customerData.kana_last_name || '',
        kana_first_name: customerData.kana_first_name || '',
        business_type: customerData.business_type || 'INDIVIDUAL',
        product_category: customerData.product_category || 'OTHER',
        corporate_phone: customerData.corporate_phone || null,
        personal_phone: customerData.personal_phone || null,
        company_name: customerData.company_name || null,
        legal_entity_number: customerData.legal_entity_number || null,
        position: customerData.position || null,
        department: customerData.department || null,
        company_url: customerData.company_url || null,
        acquisition_channel: customerData.acquisition_channel || null,
        postal_code: customerData.postal_code || null,
        prefecture: customerData.prefecture || null,
        city: customerData.city || null,
        street: customerData.street || null,
        building: customerData.building || null,
      })
      .select()
      .single();

    if (error) {
      console.error('[Customer Management API] Create error:', error);
      return NextResponse.json(
        { success: false, error: '顧客の作成に失敗しました。' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: newProfile,
      message: '顧客を作成しました。',
    });
  } catch (error) {
    console.error('[Customer Management API] Create error:', error);
    return NextResponse.json(
      { success: false, error: '予期しないエラーが発生しました。' },
      { status: 500 }
    );
  }
}

// ============================================================
// PATCH - Bulk update customers
// ============================================================

export async function PATCH(request: NextRequest) {
  try {
    // Verify admin authentication
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const supabase = createServiceClient();
    const body = await request.json();

    const { customerIds, updates } = body;

    if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
      return NextResponse.json(
        { success: false, error: '顧客IDが必要です。' },
        { status: 400 }
      );
    }

    if (!updates || Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: '更新内容が必要です。' },
        { status: 400 }
      );
    }

    // Perform bulk update
    const { data: updatedCustomers, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .in('id', customerIds)
      .select();

    if (error) {
      console.error('[Customer Management API] Update error:', error);
      return NextResponse.json(
        { success: false, error: '顧客の更新に失敗しました。' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedCustomers,
      message: `${updatedCustomers.length}件の顧客を更新しました。`,
    });
  } catch (error) {
    console.error('[Customer Management API] Update error:', error);
    return NextResponse.json(
      { success: false, error: '予期しないエラーが発生しました。' },
      { status: 500 }
    );
  }
}

// ============================================================
// DELETE - Bulk delete customers (soft delete)
// ============================================================

export async function DELETE(request: NextRequest) {
  try {
    // Verify admin authentication
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const supabase = createServiceClient();
    const searchParams = request.nextUrl.searchParams;
    const customerIds = searchParams.get('ids')?.split(',');

    if (!customerIds || customerIds.length === 0) {
      return NextResponse.json(
        { success: false, error: '顧客IDが必要です。' },
        { status: 400 }
      );
    }

    // Soft delete by updating status
    const { data: deletedCustomers, error } = await supabase
      .from('profiles')
      .update({
        status: 'DELETED',
        updated_at: new Date().toISOString(),
      })
      .in('id', customerIds)
      .select();

    if (error) {
      console.error('[Customer Management API] Delete error:', error);
      return NextResponse.json(
        { success: false, error: '顧客の削除に失敗しました。' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: deletedCustomers,
      message: `${deletedCustomers.length}件の顧客を削除しました。`,
    });
  } catch (error) {
    console.error('[Customer Management API] Delete error:', error);
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
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
