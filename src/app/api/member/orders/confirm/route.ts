/**
 * Order Confirmation API (UNIFIED - Using new auth middleware)
 *
 * Task 110: Order Confirmation Flow
 * - POST: Convert an APPROVED quotation to an order
 * - GET: Check if quotation can be confirmed
 *
 * SECURITY: Uses unified auth middleware from api-auth.ts
 * SECURITY: Uses unified error handling from api-error-handler.ts
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { OrderStatus } from '@/types/order-status';
import { withAuth } from '@/lib/api-auth';
import { withApiHandler } from '@/lib/api-error-handler';
import { validateRequestBody } from '@/lib/validation-schemas';
import { z } from 'zod';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

/**
 * Request validation schema
 */
const confirmOrderSchema = z.object({
  quotationId: z.string().uuid('Invalid quotation ID format'),
});

/**
 * POST /api/member/orders/confirm
 * Confirm order from an APPROVED quotation
 */
export const POST = withApiHandler(
  withAuth(async (request: NextRequest, auth) => {
    const userId = auth.userId;

    // Parse and validate request body
    const bodyResult = await validateRequestBody(confirmOrderSchema, request);
    if (!bodyResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: '無効なリクエスト形式です',
          errorEn: 'Invalid request format',
          details: bodyResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { quotationId } = bodyResult.data;

    // Create Supabase client with cookies
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: {
          getItem: (key: string) => {
            const cookie = request.cookies.get(key);
            return cookie?.value ?? null;
          },
          setItem: (key: string, value: string) => {
            // Not needed for this operation
          },
          removeItem: (key: string) => {
            // Not needed for this operation
          },
        },
      },
    });

    // Fetch quotation with validation
    const { data: quotation, error: quotationError } = await supabase
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
        notes,
        estimated_delivery_date,
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
      .eq('user_id', userId)
      .single();

    if (quotationError || !quotation) {
      return NextResponse.json(
        {
          success: false,
          error: '見積が見つかりません。',
          errorEn: 'Quotation not found',
          details: quotationError?.message
        },
        { status: 404 }
      );
    }

    // Validate quotation status
    if (quotation.status !== 'approved' && quotation.status !== 'APPROVED') {
      return NextResponse.json(
        {
          success: false,
          error: `注文を作成できるのは承認済みの見積のみです。現在のステータス: ${quotation.status}`,
          errorEn: `Only approved quotations can be converted to orders. Current status: ${quotation.status}`
        },
        { status: 400 }
      );
    }

    // Check if quotation has items
    if (!quotation.quotation_items || quotation.quotation_items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: '見積に項目が含まれていません。',
          errorEn: 'Quotation has no items'
        },
        { status: 400 }
      );
    }

    // Create order from quotation
    const orderData = {
      user_id: userId,
      status: 'QUOTATION' as OrderStatus,
      total_amount: quotation.total_amount,
      subtotal: quotation.subtotal_amount || Number(quotation.total_amount) * 0.909,
      tax_amount: quotation.tax_amount || Number(quotation.total_amount) * 0.091,
      customer_name: quotation.customer_name,
      customer_email: quotation.customer_email,
      customer_phone: quotation.customer_phone,
      notes: quotation.notes,
    };

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (orderError || !order) {
      console.error('[Order Confirm API] Order creation error:', orderError);
      throw orderError;
    }

    // Copy quotation items to order items
    const orderItemsToInsert = quotation.quotation_items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      specifications: item.specifications,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsToInsert);

    if (itemsError) {
      console.error('[Order Confirm API] Order items creation error:', itemsError);
      // Rollback: delete order if items insertion fails
      await supabase.from('orders').delete().eq('id', order.id);
      throw itemsError;
    }

    // Update quotation items with order_id reference
    await supabase
      .from('quotation_items')
      .update({ order_id: order.id })
      .eq('quotation_id', quotation.id);

    return NextResponse.json(
      {
        success: true,
        orderId: order.id,
        orderNumber: order.order_number,
        message: `注文を作成しました。注文番号: ${order.order_number}`,
        messageEn: `Order created successfully. Order number: ${order.order_number}`,
      },
      { status: 201 }
    );
  })
);

/**
 * GET /api/member/orders/confirm
 * Check if quotation can be confirmed (converted to order)
 */
export const GET = withApiHandler(
  withAuth(async (request: NextRequest, auth) => {
    const searchParams = request.nextUrl.searchParams;
    const quotationId = searchParams.get('quotationId');

    if (!quotationId) {
      return NextResponse.json(
        { error: '見積IDは必須です', errorEn: 'quotationId is required' },
        { status: 400 }
      );
    }

    // Create Supabase client with cookies
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: {
          getItem: (key: string) => {
            const cookie = request.cookies.get(key);
            return cookie?.value ?? null;
          },
          setItem: () => {},
          removeItem: () => {},
        },
      },
    });

    // Check if quotation has been ordered
    const { data: order } = await supabase
      .from('orders')
      .select('id, order_number, status, created_at')
      .eq('quotation_id', quotationId)
      .maybeSingle();

    if (!order) {
      return NextResponse.json(
        {
          canConfirm: true,
          message: '注文可能です',
          messageEn: 'Order can be created'
        }
      );
    }

    return NextResponse.json(
      {
        canConfirm: false,
        order: {
          id: order.id,
          orderNumber: order.order_number,
          status: order.status,
          createdAt: order.created_at,
        },
        message: 'この見積は既に注文されています',
        messageEn: 'This quotation has already been ordered'
      }
    );
  })
);
