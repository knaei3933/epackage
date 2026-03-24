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
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';
import type { Database } from '@/types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

interface QuotationWithItems {
  id: string;
  quotation_number: string;
  status: string;
  customer_name: string;
  customer_email: string;
  subtotal_amount: number;
  tax_amount: number;
  total_amount: number;
  valid_until: string | null;
  pdf_url: string | null;
  created_at: string;
  updated_at: string;
  sent_at: string | null;
  approved_at: string | null;
  rejected_at: string | null;
  notes: string | null;
  admin_notes: string | null;
  items?: Array<{
    id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    specifications: any;
    notes: string | null;
  }>;
}

interface CustomerDetailResponse {
  success: boolean;
  data?: {
    customer: Profile;
    statistics: {
      totalOrders: number;
      totalSpent: number;
      lastOrderDate: string | null;
      totalQuotations: number;
      pendingQuotations: number;
    };
    recentOrders: any[];
    quotations: QuotationWithItems[];
    contactHistory: any[];
  };
  error?: string;
}

// ============================================================
// GET - Fetch single customer with full details
// ============================================================

export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    // Verify admin authentication
    const auth = await verifyAdminAuth(request);
    if (!auth) {
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

    // Fetch customer's orders
    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .limit(10);

    // Fetch customer's quotations with items
    const { data: quotations } = await supabase
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
          specifications,
          notes
        )
      `)
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .limit(20);

    // Calculate statistics
    const totalOrders = orders?.length || 0;
    const totalSpent = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
    const lastOrderDate = orders?.[0]?.created_at || null;
    const totalQuotations = quotations?.length || 0;
    const pendingQuotations = quotations?.filter(q => q.status === 'QUOTATION_PENDING' || q.status === 'draft' || q.status === 'sent').length || 0;

    // Fetch contact history (if table exists)
    const { data: contactHistory } = await supabase
      .from('customer_contacts')
      .select('*')
      .eq('customer_id', id)
      .order('created_at', { ascending: false })
      .limit(20);

    const response: CustomerDetailResponse = {
      success: true,
      data: {
        customer,
        statistics: {
          totalOrders,
          totalSpent,
          lastOrderDate,
          totalQuotations,
          pendingQuotations,
        },
        recentOrders: orders || [],
        quotations: (quotations as any) || [],
        contactHistory: contactHistory || [],
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
    // Verify admin authentication
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const supabase = createServiceClient();
    const { id } = await params;
    const body = await request.json();

    // Remove fields that shouldn't be updated directly
    const { id: _, role: __, created_at: ___, updated_at: ____, ...updates } = body;

    // Update customer in profiles
    const { data: updatedCustomer, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
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
    // Verify admin authentication
    const auth = await verifyAdminAuth(request);
    if (!auth) {
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
