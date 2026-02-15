/**
 * Order Data Receipt API
 *
 * API endpoint to receive order data from external sources
 * POST /api/orders/receive
 *
 * Features:
 * - API key authentication
 * - Order data validation
 * - Database storage with transaction support
 * - Email notifications
 * - Idempotency support
 * - Rate limiting
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';
import {
  ExternalOrderData,
  OrderReceiptResponse,
  ValidationError,
} from '@/types/payment';
import {
  authenticateRequest,
  validateExternalOrderData,
  calculateConsumptionTax,
} from '@/lib/payment';

// ============================================================
// Rate Limiting (In-memory for simplicity)
// ============================================================

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(apiKey: string, limit: number = 100): boolean {
  const now = Date.now();
  const window = 60 * 1000; // 1 minute window

  const record = rateLimitMap.get(apiKey);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(apiKey, { count: 1, resetTime: now + window });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}

// ============================================================
// Request Schema Validation (Zod)
// ============================================================

const orderItemSchema = z.object({
  product_id: z.string().optional(),
  product_name: z.string().min(1, 'Product name is required'),
  quantity: z.number().positive('Quantity must be positive'),
  unit_price: z.number().nonnegative('Unit price must be non-negative'),
  specifications: z.record(z.any()).optional(),
  notes: z.string().optional(),
});

const addressSchema = z.object({
  postal_code: z.string().min(1, 'Postal code is required'),
  prefecture: z.string().min(1, 'Prefecture is required'),
  city: z.string().min(1, 'City is required'),
  address: z.string().min(1, 'Address is required'),
  building: z.string().optional(),
  contact_person: z.string().optional(),
  phone: z.string().optional(),
});

const externalOrderSchema = z.object({
  // Order identification
  external_order_id: z.string().optional(),
  quotation_id: z.string().uuid().optional(),

  // Customer information
  customer_name: z.string().min(1, 'Customer name is required'),
  customer_email: z.string().email('Invalid email format'),
  customer_phone: z.string().optional(),
  company_name: z.string().optional(),
  company_id: z.string().uuid().optional(),

  // Order details
  items: z.array(orderItemSchema).min(1, 'At least one item is required'),
  subtotal: z.number().nonnegative('Subtotal must be non-negative'),
  tax_amount: z.number().nonnegative('Tax amount must be non-negative'),
  total_amount: z.number().positive('Total amount must be positive'),
  currency: z.string().default('JPY'),

  // Payment information
  payment_method: z.enum([
    'bank_transfer',
    'credit_card',
    'paypal',
    'square',
    'stripe',
    'sb_payment',
    'other',
  ]),
  payment_term: z.enum(['credit', 'advance']),

  // Delivery information
  shipping_address: addressSchema.optional(),
  billing_address: addressSchema.optional(),
  requested_delivery_date: z.string().datetime().optional(),
  delivery_notes: z.string().optional(),

  // Additional information
  notes: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

// ============================================================
// POST: Receive External Order Data
// ============================================================

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // =====================================================
    // Step 1: Authenticate Request
    // =====================================================

    const authResult = authenticateRequest(request.headers);

    if (!authResult.authenticated) {
      return NextResponse.json(
        {
          success: false,
          error: authResult.error || 'Authentication failed',
        } as OrderReceiptResponse,
        { status: 401 }
      );
    }

    const apiKey = request.headers.get('x-api-key') ||
                   request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API key not found' },
        { status: 401 }
      );
    }

    // =====================================================
    // Step 2: Rate Limiting
    // =====================================================

    if (!checkRateLimit(apiKey, 100)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded. Maximum 100 requests per minute.',
        },
        { status: 429 }
      );
    }

    // =====================================================
    // Step 3: Parse and Validate Request Body
    // =====================================================

    const body = await request.json();

    // Zod validation
    const validationResult = externalOrderSchema.safeParse(body);

    if (!validationResult.success) {
      const errors: ValidationError[] = validationResult.error.errors.map(
        (err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        })
      );

      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          errors,
        },
        { status: 400 }
      );
    }

    const orderData: ExternalOrderData = validationResult.data;

    // Additional business logic validation
    const businessValidation = validateExternalOrderData(orderData);
    if (!businessValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Business validation failed',
          errors: businessValidation.errors,
        },
        { status: 400 }
      );
    }

    // =====================================================
    // Step 4: Initialize Database Client
    // =====================================================

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // =====================================================
    // Step 5: Find or Create User
    // =====================================================

    let userId: string;
    let companyId: string | null = null;

    // Try to find existing user by email
    const { data: existingUser, error: userError } = await supabase
      .from('profiles')
      .select('id, company_id')
      .eq('email', orderData.customer_email)
      .single();

    if (existingUser) {
      userId = existingUser.id;
      companyId = existingUser.company_id;
    } else {
      // For external orders, create a guest user account
      // This would typically trigger a registration workflow
      // For now, we'll create a minimal profile
      const { data: newUser, error: createError } = await supabase
        .from('profiles')
        .insert({
          email: orderData.customer_email,
          kanji_last_name: orderData.customer_name.split(' ')[0] || '',
          kanji_first_name: orderData.customer_name.split(' ')[1] || '',
          kana_last_name: '',
          kana_first_name: '',
          business_type: 'CORPORATION',
          company_name: orderData.company_name || null,
          role: 'MEMBER',
          status: 'ACTIVE',
          product_category: 'OTHER',
        })
        .select('id')
        .single();

      if (createError || !newUser) {
        console.error('Error creating user:', createError);
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to create user account',
          },
          { status: 500 }
        );
      }

      userId = newUser.id;
    }

    // =====================================================
    // Step 6: Check for Existing Order (Idempotency)
    // =====================================================

    if (orderData.external_order_id) {
      const { data: existingOrder } = await supabase
        .from('orders')
        .select('id, order_number')
        .eq('order_number', orderData.external_order_id)
        .maybeSingle();

      if (existingOrder) {
        // Return existing order (idempotent response)
        return NextResponse.json(
          {
            success: true,
            order_id: existingOrder.id,
            order_number: existingOrder.order_number,
            message: 'Order already exists (idempotent request)',
          } as OrderReceiptResponse,
          { status: 200 }
        );
      }
    }

    // =====================================================
    // Step 7: Generate Order Number
    // =====================================================

    const orderNumber =
      orderData.external_order_id ||
      `EXT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;

    // =====================================================
    // Step 8: Create Order (Transaction)
    // =====================================================

    // Using RPC function for transaction-safe order creation
    const { data: rpcResult, error: rpcError } = await supabase.rpc(
      'create_external_order',
      {
        p_order_number: orderNumber,
        p_user_id: userId,
        p_company_id: companyId,
        p_quotation_id: orderData.quotation_id || null,
        p_customer_name: orderData.customer_name,
        p_customer_email: orderData.customer_email,
        p_payment_term: orderData.payment_term,
        p_subtotal: orderData.subtotal,
        p_tax_amount: orderData.tax_amount,
        p_total_amount: orderData.total_amount,
        p_shipping_address: orderData.shipping_address || null,
        p_billing_address: orderData.billing_address || null,
        p_requested_delivery_date: orderData.requested_delivery_date || null,
        p_delivery_notes: orderData.delivery_notes || null,
        p_notes: orderData.notes || null,
        p_items: orderData.items.map(item => ({
          product_id: item.product_id || null,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.quantity * item.unit_price,
          specifications: item.specifications || null,
          notes: item.notes || null,
        })),
      }
    );

    if (rpcError || !rpcResult || rpcResult.length === 0) {
      console.error('RPC Error creating order:', rpcError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create order',
        },
        { status: 500 }
      );
    }

    const orderResult = rpcResult[0];

    if (!orderResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: orderResult.error_message || 'Failed to create order',
        },
        { status: 400 }
      );
    }

    const orderId = orderResult.order_id;

    // =====================================================
    // Step 9: Send Confirmation Email
    // =====================================================

    // Send email notification (non-blocking)
    sendOrderConfirmationEmail(orderData, orderNumber, orderId).catch(
      (error) => {
        console.error('Failed to send order confirmation email:', error);
        // Don't fail the request if email fails
      }
    );

    // =====================================================
    // Step 10: Return Success Response
    // =====================================================

    const duration = Date.now() - startTime;
    console.log(`[Order Receipt] Order created in ${duration}ms`, {
      order_id: orderId,
      order_number: orderNumber,
      customer_email: orderData.customer_email,
    });

    return NextResponse.json(
      {
        success: true,
        order_id: orderId,
        order_number: orderNumber,
        message: 'Order received successfully',
        warnings: businessValidation.warnings,
      } as OrderReceiptResponse,
      { status: 201 }
    );

  } catch (error: any) {
    console.error('[Order Receipt] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// ============================================================
// Email Notification (Non-blocking)
// =====================================================

async function sendOrderConfirmationEmail(
  orderData: ExternalOrderData,
  orderNumber: string,
  orderId: string
): Promise<void> {
  // Import email library
  const { sendEmail } = await import('@/lib/email');
  const { renderEmailTemplate, createRecipient } = await import(
    '@/lib/email-templates'
  );

  // Create email content
  const emailData = {
    orderNumber,
    customerName: orderData.customer_name,
    items: orderData.items,
    totalAmount: orderData.total_amount,
    paymentMethod: orderData.payment_method,
    paymentTerm: orderData.payment_term,
  };

  // Render email template
  const htmlContent = `
    <h2>ご注文確認</h2>
    <p>${orderData.customer_name} 様</p>
    <p>この度は、Epackage Labにお申し込みいただきありがとうございます。</p>

    <h3>ご注文内容</h3>
    <p><strong>注文番号:</strong> ${orderNumber}</p>

    <h4>ご注文商品</h4>
    <table border="1" cellpadding="5" cellspacing="0">
      <thead>
        <tr>
          <th>商品名</th>
          <th>数量</th>
          <th>単価</th>
          <th>金額</th>
        </tr>
      </thead>
      <tbody>
        ${orderData.items
          .map(
            (item) => `
          <tr>
            <td>${item.product_name}</td>
            <td>${item.quantity}</td>
            <td>¥${item.unit_price.toLocaleString()}</td>
            <td>¥${(item.quantity * item.unit_price).toLocaleString()}</td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>

    <p><strong>小計:</strong> ¥${orderData.subtotal.toLocaleString()}</p>
    <p><strong>消費税:</strong> ¥${orderData.tax_amount.toLocaleString()}</p>
    <p><strong>合計:</strong> ¥${orderData.total_amount.toLocaleString()}</p>

    <p>お支払い方法: ${orderData.payment_method}</p>
    <p>お支払い条件: ${orderData.payment_term === 'credit' ? '掛け払い' : '前払い'}</p>

    <p>内容を確認の上、入金手続きをお進めください。</p>

    <hr />
    <p style="font-size: 12px; color: #666;">
      このメールはシステムから自動送信されています。ご返信不要です。<br />
      Epackage Lab<br />
      https://epackage-lab.com
    </p>
  `;

  // Send email
  await sendEmail({
    to: orderData.customer_email,
    subject: `【Epackage Lab】ご注文確認 (${orderNumber})`,
    html: htmlContent,
  });
}

// =====================================================
// OPTIONS: Handle CORS preflight
// =====================================================

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
      'Access-Control-Max-Age': '86400',
    },
  });
}
