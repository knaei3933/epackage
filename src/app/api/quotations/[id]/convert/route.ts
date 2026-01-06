/**
 * POST /api/quotations/[id]/convert
 *
 * Convert an approved quotation to an order
 * Creates a new order and updates quotation status to 'converted'
 *
 * This is a simplified version that uses direct SQL operations
 * instead of the complex RPC function
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import type { Database } from '@/types/database';

interface ConvertRequestBody {
  notes?: string;
  paymentTerm?: 'credit' | 'advance';
}

// ============================================================
// POST: Convert quotation to order
// ============================================================

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const quotationId = params.id;
    const body = await request.json() as ConvertRequestBody;

    const supabase = createServiceClient();

    // Step 1: Fetch quotation with items
    const { data: quotation, error: quotationError } = await supabase
      .from('quotations')
      .select(`
        *,
        quotation_items (*)
      `)
      .eq('id', quotationId)
      .single();

    if (quotationError || !quotation) {
      console.error('Error fetching quotation:', quotationError);
      return NextResponse.json(
        { error: 'Quotation not found' },
        { status: 404 }
      );
    }

    // Step 2: Validate quotation status
    if (quotation.status !== 'approved') {
      return NextResponse.json(
        {
          error: 'Only approved quotations can be converted to orders',
          currentStatus: quotation.status,
        },
        { status: 400 }
      );
    }

    // Step 3: Check if quotation is expired
    if (quotation.valid_until && new Date(quotation.valid_until) < new Date()) {
      return NextResponse.json(
        { error: 'Cannot convert expired quotation' },
        { status: 400 }
      );
    }

    // Step 4: Check if order already exists
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id, order_number')
      .eq('quotation_id', quotationId)
      .maybeSingle();

    if (existingOrder) {
      return NextResponse.json(
        {
          success: true,
          order: existingOrder,
          message: 'Order already exists for this quotation',
          alreadyExists: true,
        },
        { status: 200 }
      );
    }

    // Step 5: Generate order number
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const orderNumber = `ORD-${year}-${random}`;

    // Step 6: Create order with items in a transaction-like operation
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: quotation.user_id,
        company_id: quotation.company_id,
        quotation_id: quotation.id,
        order_number: orderNumber,
        status: 'QUOTATION',
        total_amount: quotation.total_amount,
        subtotal: quotation.subtotal_amount || quotation.subtotal,
        tax_amount: quotation.tax_amount,
        customer_name: quotation.customer_name,
        customer_email: quotation.customer_email,
        notes: body.notes || quotation.notes,
        payment_term: body.paymentTerm || 'credit',
        shipping_address: null,
        billing_address: null,
        requested_delivery_date: quotation.estimated_delivery_date,
        delivery_notes: null,
        estimated_delivery_date: quotation.estimated_delivery_date,
        current_state: 'quotation',
        state_metadata: null,
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error('Error creating order:', orderError);
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    // Step 7: Copy quotation items to order items
    if (quotation.quotation_items && quotation.quotation_items.length > 0) {
      const orderItems = quotation.quotation_items.map((item: any) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        specifications: item.specifications,
        notes: item.notes,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        // Rollback: delete the order
        await supabase.from('orders').delete().eq('id', order.id);
        return NextResponse.json(
          { error: 'Failed to create order items' },
          { status: 500 }
        );
      }
    }

    // Step 8: Update quotation status to 'converted'
    const { error: updateError } = await supabase
      .from('quotations')
      .update({
        status: 'converted',
      })
      .eq('id', quotationId);

    if (updateError) {
      console.error('Error updating quotation status:', updateError);
      // Don't fail the operation, just log it
    }

    // Step 9: Fetch complete order with items
    const { data: completeOrder, error: fetchError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('id', order.id)
      .single();

    console.log('[API /quotations/[id]/convert] Order created successfully:', {
      orderId: order.id,
      orderNumber: order.order_number,
      quotationId,
    });

    return NextResponse.json(
      {
        success: true,
        order: completeOrder || order,
        quotation: {
          id: quotation.id,
          quotation_number: quotation.quotation_number,
          status: 'converted',
        },
        message: '注文を作成しました。'
      },
      { status: 201 }
    );

  } catch (error: unknown) {
    console.error('Error in POST /api/quotations/[id]/convert:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// ============================================================
// GET: Check if quotation can be converted to order
// ============================================================

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const quotationId = params.id;

    const supabase = createServiceClient();

    // Fetch quotation
    const { data: quotation, error } = await supabase
      .from('quotations')
      .select('*')
      .eq('id', quotationId)
      .single();

    if (error || !quotation) {
      return NextResponse.json(
        { error: 'Quotation not found' },
        { status: 404 }
      );
    }

    // Check if order exists
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id, order_number, created_at')
      .eq('quotation_id', quotationId)
      .maybeSingle();

    // Check conversion eligibility
    const canConvert = quotation.status === 'approved';
    const isExpired =
      quotation.valid_until && new Date(quotation.valid_until) < new Date();
    const hasOrder = !!existingOrder;

    return NextResponse.json({
      success: true,
      data: {
        quotation: {
          id: quotation.id,
          quotation_number: quotation.quotation_number,
          status: quotation.status,
          total_amount: quotation.total_amount,
          valid_until: quotation.valid_until,
        },
        conversionStatus: {
          canConvert: canConvert && !hasOrder && !isExpired,
          isExpired,
          hasOrder,
          existingOrder,
          reason: !canConvert
            ? 'Only approved quotations can be converted'
            : hasOrder
            ? 'Order already exists for this quotation'
            : isExpired
            ? 'Quotation has expired'
            : null,
        },
      },
    });
  } catch (error: unknown) {
    console.error('Error in GET /api/quotations/[id]/convert:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
