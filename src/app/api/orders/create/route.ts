/**
 * Create Order from Quotation Item API
 *
 * 見積明細から注文を作成するAPI
 *
 * Allows customers to convert individual quotation items (quantity patterns) to orders.
 * POST /api/orders/create
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createServiceClient } from '@/lib/supabase';
import { sendOrderConfirmationEmail } from '@/lib/email-order';

// ============================================================
// Types
// ============================================================

interface CreateOrderFromQuotationItemRequest {
  quotationId: string;
  quotationItemId: string;
  requestedDeliveryDate?: string;
  customerNotes?: string;
}

// ============================================================
// POST: Create Order from Quotation Item
// ============================================================

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user ID using SSR
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Create SSR client to read cookies
    const response = NextResponse.json({ success: false });
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          response.cookies.delete({ name, ...options });
        },
      },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: '認証されていません。', errorEn: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body: CreateOrderFromQuotationItemRequest = await request.json();
    const { quotationId, quotationItemId, requestedDeliveryDate, customerNotes } = body;

    // Validate required fields
    if (!quotationId || !quotationItemId) {
      return NextResponse.json(
        { success: false, error: 'quotationId and quotationItemId are required' },
        { status: 400 }
      );
    }

    // Create service client to bypass RLS
    const supabaseAdmin = createServiceClient();
    const userIdForDb = user.id;

    // Fetch quotation with user info
    const { data: quotation, error: quotationError } = await supabaseAdmin
      .from('quotations')
      .select('id, quotation_number, user_id, status, valid_until, total_amount')
      .eq('id', quotationId)
      .single();

    if (quotationError || !quotation) {
      console.error('[Order Creation] Quotation not found:', quotationError);
      return NextResponse.json(
        { success: false, error: 'Quotation not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (quotation.user_id !== userIdForDb) {
      return NextResponse.json(
        { success: false, error: 'Access denied: This quotation does not belong to you' },
        { status: 403 }
      );
    }

    // Check quotation status (allow DRAFT, SENT, or APPROVED)
    if (!['draft', 'sent', 'approved', 'DRAFT', 'SENT', 'APPROVED'].includes(quotation.status)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid quotation status for order creation',
          currentStatus: quotation.status,
        },
        { status: 400 }
      );
    }

    // Fetch the specific quotation item
    const { data: quotationItem, error: itemError } = await supabaseAdmin
      .from('quotation_items')
      .select('id, product_name, quantity, unit_price, total_price, specifications, order_id')
      .eq('id', quotationItemId)
      .eq('quotation_id', quotationId)
      .single();

    if (itemError || !quotationItem) {
      console.error('[Order Creation] Quotation item not found:', itemError);
      return NextResponse.json(
        { success: false, error: 'Quotation item not found' },
        { status: 404 }
      );
    }

    // Check if item has already been ordered
    if (quotationItem.order_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'This quotation item has already been ordered',
          existingOrderId: quotationItem.order_id,
        },
        { status: 409 }
      );
    }

    // Generate order number (ORD-YYYY-XXXX format)
    const now = new Date();
    const year = now.getFullYear();
    const orderNumberPrefix = `ORD-${year}-`;

    // Get the next order number for this year
    const { data: lastOrder } = await supabaseAdmin
      .from('orders')
      .select('order_number')
      .like('order_number', `${orderNumberPrefix}%`)
      .order('order_number', { ascending: false })
      .limit(1)
      .single();

    let nextSequence = 1;
    if (lastOrder) {
      const lastSequence = parseInt(lastOrder.order_number.replace(orderNumberPrefix, ''), 10);
      nextSequence = lastSequence + 1;
    }

    const orderNumber = `${orderNumberPrefix}${String(nextSequence).padStart(4, '0')}`;

    // Create order
    // Note: quotation_id is stored in quotation_items.order_id, not in orders table
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: userIdForDb,
        order_number: orderNumber,
        status: 'pending',
        total_amount: quotationItem.total_price,
        notes: customerNotes || null,
        // Customer snapshot (can be enhanced later with full profile data)
        customer_name: 'Customer',
        customer_email: user.email || 'customer@example.com',
        customer_phone: null,
        subtotal: quotationItem.total_price,
        tax_amount: 0,
      })
      .select('id, order_number, status, total_amount, created_at')
      .single();

    if (orderError || !order) {
      console.error('[Order Creation] Failed to create order:', orderError);
      return NextResponse.json(
        { success: false, error: 'Failed to create order', details: orderError?.message },
        { status: 500 }
      );
    }

    // Create order item from quotation item
    // Note: total_price is a generated column (quantity * unit_price), cannot be inserted
    console.log('[Order Creation] Creating order item:', {
      order_id: order.id,
      product_name: quotationItem.product_name,
      quantity: quotationItem.quantity,
      unit_price: quotationItem.unit_price,
    });

    const { error: orderItemError } = await supabaseAdmin
      .from('order_items')
      .insert({
        order_id: order.id,
        product_id: null,
        product_name: quotationItem.product_name,
        quantity: quotationItem.quantity,
        unit_price: quotationItem.unit_price,
        // total_price is auto-generated: quantity * unit_price
        specifications: quotationItem.specifications,
      });

    if (orderItemError) {
      console.error('[Order Creation] Failed to create order item:', orderItemError);
      console.error('[Order Creation] Error details:', JSON.stringify(orderItemError, null, 2));
      // Rollback: delete the order if item creation failed
      await supabaseAdmin.from('orders').delete().eq('id', order.id);
      return NextResponse.json(
        { success: false, error: 'Failed to create order item', details: orderItemError.message, fullError: orderItemError },
        { status: 500 }
      );
    }

    // Update quotation item with order_id reference
    const { error: updateError } = await supabaseAdmin
      .from('quotation_items')
      .update({ order_id: order.id })
      .eq('id', quotationItemId);

    if (updateError) {
      console.error('[Order Creation] Failed to update quotation item:', updateError);
      // Don't fail the order creation, just log the error
      console.warn('[Order Creation] Order created but quotation item order_id not updated');
    }

    // Log order creation
    console.log('[Order Creation] Order created from quotation item:', {
      orderId: order.id,
      orderNumber: order.order_number,
      quotationId,
      quotationItemId,
      userId: userIdForDb,
      customerEmail: user.email,
    });

    // Send confirmation email to customer (non-blocking)
    sendOrderConfirmationEmail({
      orderId: order.id,
      orderNumber: order.order_number,
      quotationNumber: quotation.quotation_number,
      customerEmail: user.email || 'customer@example.com',
      customerName: user.email?.split('@')[0] || 'Customer',
      items: [{
        productName: quotationItem.product_name,
        quantity: quotationItem.quantity,
        unitPrice: quotationItem.unit_price,
        totalPrice: quotationItem.total_price,
      }],
      subtotal: quotationItem.total_price,
      taxAmount: 0,
      totalAmount: quotationItem.total_price,
      estimatedDeliveryDate: requestedDeliveryDate || null,
      paymentTerm: 'advance',
      customerNotes: customerNotes,
    }).catch((error) => {
      // Non-blocking: log error but don't fail the request
      console.error('[Order Creation] Failed to send confirmation email:', error);
    });

    // Send admin notification (non-blocking)
    sendOrderConfirmationEmail({
      orderId: order.id,
      orderNumber: order.order_number,
      quotationNumber: quotation.quotation_number,
      customerEmail: user.email || 'customer@example.com',
      customerName: user.email?.split('@')[0] || 'Customer',
      items: [{
        productName: quotationItem.product_name,
        quantity: quotationItem.quantity,
        unitPrice: quotationItem.unit_price,
        totalPrice: quotationItem.total_price,
      }],
      subtotal: quotationItem.total_price,
      taxAmount: 0,
      totalAmount: quotationItem.total_price,
      estimatedDeliveryDate: requestedDeliveryDate || null,
      paymentTerm: 'advance',
      customerNotes: customerNotes,
      isAdmin: true,
    }).catch((error) => {
      // Non-blocking: log error but don't fail the request
      console.error('[Order Creation] Failed to send admin notification:', error);
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.order_number,
        status: order.status,
        totalAmount: order.total_amount,
        createdAt: order.created_at,
      },
      quotation: {
        id: quotation.id,
        quotationNumber: quotation.quotation_number,
      },
      redirectUrl: `/member/orders/${order.id}`,
      message: '注文を作成しました',
    }, { status: 201 });

  } catch (error: any) {
    console.error('[Order Creation] POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
