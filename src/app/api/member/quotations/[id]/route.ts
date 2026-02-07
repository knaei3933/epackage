/**
 * Member Quotation Detail API
 *
 * GET /api/member/quotations/[id]
 * Get quotation detail by ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

/**
 * GET /api/member/quotations/[id]
 * Get quotation detail by ID
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const quotationId = params.id;

    const cookieStore = await cookies();
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // Normal auth: Use cookie-based auth with getUser()
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user?.id) {
      return NextResponse.json(
        { error: '認証されていません。', errorEn: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = user.id;

    // Fetch quotation with items
    const { data: quotation, error } = await supabase
      .from('quotations')
      .select(`
        id,
        quotation_number,
        customer_name,
        customer_email,
        customer_phone,
        subtotal_amount,
        tax_amount,
        total_amount,
        created_at,
        updated_at,
        valid_until,
        sent_at,
        status,
        user_id,
        quotation_items (
          id,
          product_id,
          product_name,
          quantity,
          unit_price,
          total_price,
          specifications
        )
      `)
      .eq('id', quotationId)
      .single();

    if (error || !quotation) {
      console.error('[Quotation Detail API] Error:', error);
      if (error?.code === 'PGRST116') {
        return NextResponse.json(
          { error: '見積が見つかりません。', errorEn: 'Quotation not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: '見積の取得に失敗しました。', errorEn: 'Failed to fetch quotation' },
        { status: 500 }
      );
    }

    // Authorization check
    if (quotation.user_id !== userId) {
      return NextResponse.json(
        { error: 'この見積にアクセスする権限がありません。', errorEn: 'Access denied' },
        { status: 403 }
      );
    }

    // Transform data
    const transformedQuotation = {
      id: quotation.id,
      quotationNumber: quotation.quotation_number,
      customerName: quotation.customer_name,
      customerEmail: quotation.customer_email,
      customerPhone: quotation.customer_phone,
      subtotal: quotation.subtotal_amount,
      taxAmount: quotation.tax_amount,
      totalAmount: quotation.total_amount,
      subtotal_amount: quotation.subtotal_amount,
      tax_amount: quotation.tax_amount,
      total_amount: quotation.total_amount,
      createdAt: quotation.created_at,
      updatedAt: quotation.updated_at,
      validUntil: quotation.valid_until,
      sentAt: quotation.sent_at,
      status: quotation.status,
      userId: quotation.user_id,
      items: (quotation.quotation_items || []).map((item: any) => ({
        id: item.id,
        productId: item.product_id,
        productName: item.product_name,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        totalPrice: item.total_price,
        specifications: item.specifications,
      })),
    };

    return NextResponse.json({
      quotation: transformedQuotation,
    });
  } catch (error) {
    console.error('[Quotation Detail API] Error:', error);
    return NextResponse.json(
      {
        error: '予期しないエラーが発生しました。',
        errorEn: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/member/quotations/[id]
 * Delete quotation (DRAFT status only)
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const quotationId = params.id;

    const cookieStore = await cookies();
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // Normal auth: Use cookie-based auth with getUser()
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user?.id) {
      return NextResponse.json(
        { error: '認証されていません。' },
        { status: 401 }
      );
    }

    const userId = user.id;

    // Check quotation exists and belongs to user
    const { data: quotation, error: fetchError } = await supabase
      .from('quotations')
      .select('id, status, user_id')
      .eq('id', quotationId)
      .single();

    if (fetchError || !quotation) {
      return NextResponse.json(
        { error: '見積が見つかりません。' },
        { status: 404 }
      );
    }

    if (quotation.user_id !== userId) {
      return NextResponse.json(
        { error: 'アクセス権限がありません。' },
        { status: 403 }
      );
    }

    if (quotation.status !== 'draft') {
      return NextResponse.json(
        { error: 'ドラフト状態の見積のみ削除できます。' },
        { status: 400 }
      );
    }

    // Delete quotation items first
    await supabase
      .from('quotation_items')
      .delete()
      .eq('quotation_id', quotationId);

    // Delete quotation
    const { error: deleteError } = await supabase
      .from('quotations')
      .delete()
      .eq('id', quotationId);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({
      success: true,
      message: '見積を削除しました。',
    });
  } catch (error) {
    console.error('[Quotation Detail API] DELETE Error:', error);
    return NextResponse.json(
      { error: '見積の削除に失敗しました。' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
