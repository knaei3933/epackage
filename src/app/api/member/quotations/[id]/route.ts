/**
 * Member Quotation Detail API
 *
 * GET /api/member/quotations/[id]
 * Get quotation detail by ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/supabase-ssr';

export const dynamic = 'force-dynamic';

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
    const { id: quotationId } = params;

    // Get authenticated user using unified authentication
    const authUser = await getAuthenticatedUser(request);
    if (!authUser) {
      return NextResponse.json(
        { error: '認証されていません。', errorEn: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id: userId, supabase } = authUser;

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
        notes,
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
      remarks: quotation.notes,
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
    const { id: quotationId } = params;

    // Get authenticated user using unified authentication
    const authUser = await getAuthenticatedUser(request);
    if (!authUser) {
      return NextResponse.json(
        { error: '認証されていません。' },
        { status: 401 }
      );
    }

    const { id: userId, supabase } = authUser;

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

    if (quotation.status !== 'DRAFT') {
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

/**
 * PUT /api/member/quotations/[id]
 * Update quotation (DRAFT status only)
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id: quotationId } = params;

    // Get authenticated user using unified authentication
    const authUser = await getAuthenticatedUser(request);
    if (!authUser) {
      return NextResponse.json(
        { error: '認証されていません。', errorEn: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id: userId } = authUser;

    // Import service client for RLS bypass
    const { createServiceClient } = await import('@/lib/supabase');
    const serviceClient = createServiceClient();

    // Parse request body
    const body = await request.json();

    // Verify quotation exists and belongs to user
    const { data: existingQuotation, error: fetchError } = await serviceClient
      .from('quotations')
      .select('*')
      .eq('id', quotationId)
      .single();

    if (fetchError || !existingQuotation) {
      console.error('[Quotation Detail API] PUT - Quotation not found:', fetchError);
      return NextResponse.json(
        { error: '見積が見つかりません。', errorEn: 'Quotation not found' },
        { status: 404 }
      );
    }

    if (existingQuotation.user_id !== userId) {
      return NextResponse.json(
        { error: 'この見積にアクセスする権限がありません。', errorEn: 'Access denied' },
        { status: 403 }
      );
    }

    // Only allow updating DRAFT status quotations
    if (existingQuotation.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'ドラフト状態の見積のみ更新できます。', errorEn: 'Only draft quotations can be updated' },
        { status: 400 }
      );
    }

    // Update quotation
    // Build update object dynamically
    const updateData: any = {
      customer_name: body.customer_name,
      customer_email: body.customer_email,
      customer_phone: body.customer_phone || null,
      subtotal_amount: body.subtotal_amount,
      tax_amount: body.tax_amount,
      total_amount: body.total_amount,
      notes: body.notes || null,
      valid_until: body.valid_until || null,
      updated_at: new Date().toISOString(),
    };

    // Handle coupon fields - allow both setting and clearing
    // Use 'included in body' check rather than truthy check to support zero/null values
    if ('coupon_id' in body) {
      updateData.coupon_id = body.coupon_id;
    }
    if ('discount_amount' in body) {
      updateData.discount_amount = body.discount_amount;
    }
    if ('discount_type' in body) {
      updateData.discount_type = body.discount_type;
    }
    if (body.total_cost_breakdown) {
      updateData.total_cost_breakdown = body.total_cost_breakdown;
    }

    const { data: updatedQuotation, error: updateError } = await serviceClient
      .from('quotations')
      .update(updateData)
      .eq('id', quotationId)
      .select()
      .single();

    if (updateError) {
      console.error('[Quotation Detail API] PUT - Update error:', updateError);
      return NextResponse.json(
        { error: '見積の更新に失敗しました。', errorEn: 'Failed to update quotation', details: updateError.message },
        { status: 500 }
      );
    }

    // Update items if provided
    if (body.items && Array.isArray(body.items)) {
      // Delete existing items
      await serviceClient
        .from('quotation_items')
        .delete()
        .eq('quotation_id', quotationId);

      // Insert new items
      const itemsToInsert = body.items.map((item: any) => ({
        quotation_id: quotationId,
        product_id: item.product_id || null,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        specifications: item.specifications || null,
        cost_breakdown: item.cost_breakdown || {},
      }));

      const { error: itemsError } = await serviceClient
        .from('quotation_items')
        .insert(itemsToInsert);

      if (itemsError) {
        console.error('[Quotation Detail API] PUT - Items update error:', itemsError);
        return NextResponse.json(
          { error: '見積項目の更新に失敗しました。', errorEn: 'Failed to update quotation items', details: itemsError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      quotation: updatedQuotation,
      message: '見積を更新しました。',
      messageEn: 'Quotation updated successfully.',
    });
  } catch (error) {
    console.error('[Quotation Detail API] PUT Error:', error);
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

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
