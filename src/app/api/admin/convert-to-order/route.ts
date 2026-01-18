/**
 * Quote to Order Conversion API
 *
 * 見積書から注文への自動変換システム
 * - POST: 承認された見積書を注文に変換
 * - トランザクション処理でデータ整合性を保証
 * - 顧客および管理者への通知
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase';
import { sendOrderConfirmationEmail } from '@/lib/email-order';
import { Database } from '@/types/database';
import { withAdminAuth } from '@/lib/api-auth';
import { handleApiError, ValidationError, fromZodError } from '@/lib/api-error-handler';
import { uuidSchema, dateSchema, prefectureSchema, postalCodeSchema, phoneSchema, emailSchema } from '@/lib/validation-schemas';

// =====================================================
// Types
// =====================================================

// ConversionResult and OrderConversionData interfaces are now implicitly handled
// through the Zod schema below, reducing type duplication

// =====================================================
// Validation Schema
// =====================================================

const convertToOrderSchema = z.object({
  quotationId: uuidSchema,
  paymentTerm: z.enum(['credit', 'advance']).optional(),
  shippingAddress: z.object({
    postalCode: postalCodeSchema,
    prefecture: prefectureSchema,
    city: z.string().min(1, 'City is required'),
    addressLine1: z.string().min(1, 'Address line 1 is required'),
    addressLine2: z.string().optional(),
    company: z.string().min(1, 'Company name is required'),
    contactName: z.string().min(1, 'Contact name is required'),
    phone: phoneSchema,
  }).optional(),
  billingAddress: z.object({
    postalCode: postalCodeSchema,
    prefecture: prefectureSchema,
    city: z.string().min(1, 'City is required'),
    address: z.string().min(1, 'Address is required'),
    building: z.string().optional(),
    companyName: z.string().min(1, 'Company name is required'),
    email: emailSchema.optional(),
    phone: phoneSchema.optional(),
    taxNumber: z.string().optional(),
  }).optional(),
  requestedDeliveryDate: dateSchema.optional(),
  deliveryNotes: z.string().optional(),
  customerNotes: z.string().optional(),
});

// =====================================================
// Helper Functions
// =====================================================

/**
 * Generate order number (ORD-YYYY-NNNN format)
 */
async function generateOrderNumber(supabase: ReturnType<typeof import('@/lib/supabase').createServiceClient>): Promise<string> {
  const year = new Date().getFullYear();

  // Get the last order number for this year
  const { data: lastOrderRaw } = await supabase
    .from('orders')
    .select('order_number')
    .like('order_number', `ORD-${year}-%`)
    .order('order_number', { ascending: false })
    .limit(1)
    .maybeSingle();

  let sequence = 1;
  if (lastOrderRaw) {
    const lastOrder = lastOrderRaw as { order_number: string } | null;
    const match = lastOrder.order_number.match(/ORD-\d+-(\d{4})/);
    if (match) {
      sequence = parseInt(match[1], 10) + 1;
    }
  }

  return `ORD-${year}-${String(sequence).padStart(4, '0')}`;
}

/**
 * Validate quotation can be converted to order
 */
async function validateQuotationForConversion(
  supabase: ReturnType<typeof import('@/lib/supabase').createServiceClient>,
  quotationId: string
): Promise<{
  valid: boolean;
  quotation?: Database['public']['Tables']['quotations']['Row'];
  items?: Database['public']['Tables']['quotation_items']['Row'][];
  error?: string;
}> {
  // Check if quotation exists
  const { data: quotationRaw, error: quoteError } = await supabase
    .from('quotations')
    .select('*')
    .eq('id', quotationId)
    .single();

  if (quoteError || !quotationRaw) {
    return { valid: false, error: 'Quotation not found' };
  }

  // Type assertion for quotation - Supabase type inference needs help
  const quotation = quotationRaw as Database['public']['Tables']['quotations']['Row'];

  // Check quotation status
  if (quotation.status !== 'APPROVED') {
    return {
      valid: false,
      error: `Quotation must be in APPROVED status to convert. Current status: ${quotation.status}`,
    };
  }

  // Check if quotation has already been converted
  const { data: existingOrder } = await supabase
    .from('orders')
    .select('id')
    .eq('quotation_id', quotationId)
    .maybeSingle();

  if (existingOrder) {
    return {
      valid: false,
      error: 'This quotation has already been converted to an order',
    };
  }

  // Check validity period
  if (quotation.valid_until) {
    const validUntil = new Date(quotation.valid_until);
    if (validUntil < new Date()) {
      return {
        valid: false,
        error: 'Quotation has expired. Please request a new quotation.',
      };
    }
  }

  // Get quotation items
  const { data: items, error: itemsError } = await supabase
    .from('quotation_items')
    .select('*')
    .eq('quotation_id', quotationId)
    .order('display_order', { ascending: true });

  if (itemsError || !items || items.length === 0) {
    return { valid: false, error: 'No items found in quotation' };
  }

  return { valid: true, quotation, items };
}

/**
 * Create order status history entry
 */
async function createOrderStatusHistory(
  supabase: ReturnType<typeof import('@/lib/supabase').createServiceClient>,
  orderId: string,
  toStatus: string,
  changedBy: string,
  reason?: string
): Promise<void> {
  // @ts-expect-error - Supabase JSONB columns need explicit type handling
  await supabase.from('order_status_history').insert({
    order_id: orderId,
    from_status: null, // Initial status
    to_status: toStatus,
    changed_by: changedBy,
    changed_at: new Date().toISOString(),
    reason: reason || 'Order created from approved quotation',
    metadata: null,
  });
}

/**
 * Create audit log entry
 */
async function createAuditLog(
  supabase: ReturnType<typeof import('@/lib/supabase').createServiceClient>,
  tableName: string,
  recordId: string,
  action: 'INSERT' | 'UPDATE' | 'DELETE',
  newData: Record<string, unknown>,
  changedBy: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  // @ts-expect-error - Supabase JSONB columns need explicit type handling
  await supabase.from('order_audit_log').insert({
    table_name: tableName,
    record_id: recordId,
    action,
    old_data: null,
    new_data: newData,
    changed_fields: null,
    changed_by: changedBy,
    changed_at: new Date().toISOString(),
    ip_address: ipAddress || null,
    user_agent: userAgent || null,
  });
}

// =====================================================
// Main API Handler
// =====================================================

export const POST = withAdminAuth(async (request: NextRequest, auth) => {
  try {
    const supabase = createServiceClient();

    // Parse and validate request body
    const body = await request.json();
    const validationResult = convertToOrderSchema.safeParse(body);

    if (!validationResult.success) {
      throw fromZodError(validationResult.error);
    }

    const data = validationResult.data;
    const adminUserId = auth.userId;

    // Validate quotation
    const validation = await validateQuotationForConversion(supabase, data.quotationId);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { quotation, items } = validation;

    // Start transaction: Convert quotation to order
    const orderNumber = await generateOrderNumber(supabase);

    // Prepare order data
    const q = quotation as Database['public']['Tables']['quotations']['Row'];
    const orderData: Database['public']['Tables']['orders']['Insert'] = {
      user_id: q.user_id,
      company_id: q.company_id,
      quotation_id: q.id,
      order_number: orderNumber,
      current_state: 'DATA_RECEIVED',
      status: 'DATA_RECEIVED',
      payment_term: data.paymentTerm || 'credit',
      total_amount: q.total_amount,
      subtotal: q.subtotal_amount || q.subtotal,
      tax_amount: q.tax_amount,
      customer_name: q.customer_name,
      customer_email: q.customer_email,
      shipping_address: data.shippingAddress || null,
      billing_address: data.billingAddress || null,
      requested_delivery_date: data.requestedDeliveryDate || q.estimated_delivery_date || null,
      delivery_notes: data.deliveryNotes || null,
      estimated_delivery_date: q.estimated_delivery_date || null,
      notes: null,
      shipped_at: null,
      delivered_at: null,
      state_metadata: {
        converted_from_quotation: true,
        quotation_number: q.quotation_number,
        conversion_date: new Date().toISOString(),
        converted_by: adminUserId,
      },
    };

    // Insert order
    const { data: orderRaw, error: orderError } = await supabase
      .from('orders')
      // @ts-expect-error - Supabase JSONB columns need explicit type handling
      .insert(orderData)
      .select('*')
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    // Type assertion for order - Supabase type inference needs help
    const order = orderRaw as Database['public']['Tables']['orders']['Row'];

    // Copy quotation items to order items
    const orderItemsData = (items || []).map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
      specifications: item.specifications,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      // @ts-expect-error - Supabase insert type inference issue
      .insert(orderItemsData);

    if (itemsError) {
      console.error('Order items creation error:', itemsError);
      // Rollback: delete order
      await supabase.from('orders').delete().eq('id', order.id);
      throw new Error(`Failed to create order items: ${itemsError.message}`);
    }

    // Update quotation status to CONVERTED
    const { error: updateQuoteError } = await supabase
      .from('quotations')
      // @ts-expect-error - Supabase update type inference issue
      .update({ status: 'CONVERTED' })
      .eq('id', q.id);

    if (updateQuoteError) {
      console.error('Quotation update error:', updateQuoteError);
      // Rollback: delete order and items
      await supabase.from('order_items').delete().eq('order_id', order.id);
      await supabase.from('orders').delete().eq('id', order.id);
      throw new Error(`Failed to update quotation status: ${updateQuoteError.message}`);
    }

    // Create status history
    await createOrderStatusHistory(
      supabase,
      order.id,
      'DATA_RECEIVED',
      adminUserId,
      'Order created from approved quotation'
    );

    // Create audit log for order
    await createAuditLog(
      supabase,
      'orders',
      order.id,
      'INSERT',
      orderData,
      adminUserId,
      request.headers.get('x-forwarded-for') || undefined,
      request.headers.get('user-agent') || undefined
    );

    // Create audit log for quotation status change
    await createAuditLog(
      supabase,
      'quotations',
      q.id,
      'UPDATE',
      { old_status: 'APPROVED', new_status: 'CONVERTED' },
      adminUserId,
      request.headers.get('x-forwarded-for') || undefined,
      request.headers.get('user-agent') || undefined
    );

    // Send confirmation emails (non-blocking)
    const emailPromises = [
      sendOrderConfirmationEmail({
        orderId: order.id,
        orderNumber: order.order_number,
        quotationNumber: q.quotation_number,
        customerEmail: order.customer_email,
        customerName: order.customer_name,
        items: (items || []).map((item) => ({
          productName: item.product_name,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          totalPrice: item.total_price,
        })),
        subtotal: order.subtotal,
        taxAmount: order.tax_amount,
        totalAmount: order.total_amount,
        estimatedDeliveryDate: order.estimated_delivery_date,
        paymentTerm: order.payment_term,
        shippingAddress: data.shippingAddress,
        deliveryNotes: data.deliveryNotes,
        customerNotes: data.customerNotes,
      }).catch((error) => {
        console.error('Failed to send customer confirmation email:', error);
        return { success: false, error: error.message };
      }),
    ];

    // Send admin notification
    emailPromises.push(
      sendOrderConfirmationEmail({
        orderId: order.id,
        orderNumber: order.order_number,
        quotationNumber: q.quotation_number,
        customerEmail: order.customer_email,
        customerName: order.customer_name,
        items: (items || []).map((item) => ({
          productName: item.product_name,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          totalPrice: item.total_price,
        })),
        subtotal: order.subtotal,
        taxAmount: order.tax_amount,
        totalAmount: order.total_amount,
        estimatedDeliveryDate: order.estimated_delivery_date,
        paymentTerm: order.payment_term,
        isAdmin: true,
      }).catch((error) => {
        console.error('Failed to send admin notification email:', error);
        return { success: false, error: error.message };
      })
    );

    // Wait for emails but don't fail the request if they fail
    Promise.all(emailPromises).catch((error) => {
      console.error('Email sending errors:', error);
    });

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Quotation successfully converted to order',
        order: {
          id: order.id,
          order_number: order.order_number,
          status: order.status,
          current_state: order.current_state,
          total_amount: order.total_amount,
          customer_name: order.customer_name,
          customer_email: order.customer_email,
          created_at: order.created_at,
        },
        quotation: {
          id: q.id,
          quotation_number: q.quotation_number,
          status: 'CONVERTED',
        },
        items: orderItemsData.map((item, index) => ({
          id: `temp-${index}`,
          product_name: (items || [])[index].product_name,
          quantity: (items || [])[index].quantity,
          unit_price: (items || [])[index].unit_price,
          total_price: (items || [])[index].total_price,
        })),
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
});

/**
 * GET: Check if quotation can be converted to order
 */
export const GET = withAdminAuth(async (request: NextRequest, auth) => {
  const supabase = createServiceClient();

  try {
    const { searchParams } = new URL(request.url);
    const quotationId = searchParams.get('quotationId');

    if (!quotationId) {
      throw new ValidationError('quotationId parameter is required');
    }

    // Validate quotation
    const validation = await validateQuotationForConversion(supabase, quotationId);

    if (!validation.valid) {
      return NextResponse.json(
        {
          canConvert: false,
          error: validation.error,
        },
        { status: 200 }
      );
    }

    const { quotation, items } = validation;
    const q = quotation as Database['public']['Tables']['quotations']['Row'];

    return NextResponse.json(
      {
        canConvert: true,
        quotation: {
          id: q.id,
          quotation_number: q.quotation_number,
          customer_name: q.customer_name,
          customer_email: q.customer_email,
          total_amount: q.total_amount,
          subtotal_amount: q.subtotal_amount,
          tax_amount: q.tax_amount,
          valid_until: q.valid_until,
          estimated_delivery_date: q.estimated_delivery_date,
          status: q.status,
        },
        itemCount: items?.length || 0,
        itemsSummary: items?.map((item) => ({
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
        })) || [],
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
});
