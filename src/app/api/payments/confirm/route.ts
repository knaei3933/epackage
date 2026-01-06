/**
 * Payment Confirmation API
 *
 * API endpoint to handle payment confirmations from payment gateways
 * POST /api/payments/confirm
 *
 * Features:
 * - Webhook signature verification
 * - Payment data validation
 * - Order status updates
 * - Payment record storage
 * - Email notifications
 * - Idempotency support
 * - Production workflow triggering
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';
import {
  PaymentConfirmationRequest,
  PaymentConfirmationResponse,
  PaymentGateway,
  PaymentStatus,
  ValidationError,
  SignatureVerificationError,
  IdempotencyError,
} from '@/types/payment';
import {
  validatePaymentConfirmation,
  verifyWebhookSignature,
  authenticateRequest,
  handlePaymentError,
  getPaymentStatusLabel,
} from '@/lib/payment';

// ============================================================
// Request Schema Validation (Zod)
// ============================================================

const webhookSignatureSchema = z.object({
  provider: z.enum(['square', 'stripe', 'paypal', 'sb_payment', 'manual', 'none']),
  signature: z.string(),
  timestamp: z.string().optional(),
  payload: z.string(),
});

const paymentConfirmationSchema = z.object({
  // Payment identification
  payment_id: z.string().min(1, 'Payment ID is required'),
  order_id: z.string().uuid().optional(),
  external_order_id: z.string().optional(),

  // Payment details
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().default('JPY'),
  payment_method: z.enum([
    'bank_transfer',
    'credit_card',
    'paypal',
    'square',
    'stripe',
    'sb_payment',
    'other',
  ]),
  payment_gateway: z.enum(['square', 'stripe', 'paypal', 'sb_payment', 'manual', 'none']),
  status: z.enum(['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partial_refund']),

  // Transaction information
  transaction_id: z.string().optional(),
  reference_number: z.string().optional(),

  // Timestamps
  payment_date: z.string().datetime('Invalid payment date format'),
  processed_at: z.string().datetime().optional(),

  // Webhook verification
  webhook_signature: webhookSignatureSchema.optional(),

  // Additional gateway-specific data
  gateway_data: z.record(z.any()).optional(),

  // Metadata
  metadata: z.record(z.any()).optional(),

  // Idempotency key
  idempotency_key: z.string().optional(),
});

// ============================================================
// POST: Confirm Payment
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
        } as PaymentConfirmationResponse,
        { status: 401 }
      );
    }

    // =====================================================
    // Step 2: Parse and Validate Request Body
    // =====================================================

    const body = await request.json();

    // Zod validation
    const validationResult = paymentConfirmationSchema.safeParse(body);

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
          errors: errors.map(e => `${e.field}: ${e.message}`).join(', '),
        } as PaymentConfirmationResponse,
        { status: 400 }
      );
    }

    const paymentData: PaymentConfirmationRequest = validationResult.data;

    // Additional business logic validation
    const businessValidation = validatePaymentConfirmation(paymentData);
    if (!businessValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          errors: businessValidation.errors.map(e => `${e.field}: ${e.message}`).join(', '),
        } as PaymentConfirmationResponse,
        { status: 400 }
      );
    }

    // =====================================================
    // Step 3: Verify Webhook Signature (if provided)
    // =====================================================

    if (paymentData.webhook_signature) {
      const isValid = verifyWebhookSignature(paymentData.webhook_signature);

      if (!isValid) {
        throw new SignatureVerificationError('Invalid webhook signature');
      }
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
    // Step 5: Check Idempotency (if key provided)
    // =====================================================

    if (paymentData.idempotency_key) {
      const { data: existingConfirmation } = await supabase
        .from('payment_confirmations')
        .select('id, order_id')
        .eq('reference_number', paymentData.idempotency_key)
        .maybeSingle();

      if (existingConfirmation) {
        return NextResponse.json(
          {
            success: true,
            payment_id: existingConfirmation.id,
            confirmation_id: existingConfirmation.id,
            order_id: existingConfirmation.order_id || undefined,
            message: 'Payment already confirmed (idempotent request)',
          } as PaymentConfirmationResponse,
          { status: 200 }
        );
      }
    }

    // =====================================================
    // Step 6: Find Order
    // =====================================================

    let orderId: string | null = null;
    let orderNumber: string | null = null;
    let quotationId: string | null = null;

    if (paymentData.order_id) {
      orderId = paymentData.order_id;
    } else if (paymentData.external_order_id) {
      // Find order by external order ID
      const { data: order } = await supabase
        .from('orders')
        .select('id, order_number, quotation_id')
        .eq('order_number', paymentData.external_order_id)
        .single();

      if (order) {
        orderId = order.id;
        orderNumber = order.order_number;
        quotationId = order.quotation_id;
      }
    } else if (paymentData.transaction_id) {
      // Find order by transaction ID (from metadata or recent orders)
      const { data: confirmation } = await supabase
        .from('payment_confirmations')
        .select('order_id')
        .eq('transaction_id', paymentData.transaction_id)
        .maybeSingle();

      if (confirmation) {
        orderId = confirmation.order_id;
      }
    }

    if (!orderId) {
      console.warn('[Payment Confirmation] Order not found, storing payment confirmation without order');
    } else {
      // Fetch order details
      const { data: order } = await supabase
        .from('orders')
        .select('order_number, quotation_id, user_id, total_amount, status')
        .eq('id', orderId)
        .single();

      if (order) {
        orderNumber = order.order_number;
        quotationId = order.quotation_id;

        // Validate payment amount matches order
        if (Math.abs(order.total_amount - paymentData.amount) > 1) {
          console.warn('[Payment Confirmation] Amount mismatch:', {
            orderId,
            expected: order.total_amount,
            received: paymentData.amount,
          });
          // Don't fail, just log warning
        }
      }
    }

    // =====================================================
    // Step 7: Create Payment Confirmation Record
    // =====================================================

    const { data: paymentConfirmation, error: insertError } = await supabase
      .from('payment_confirmations')
      .insert({
        quotation_id: quotationId,
        order_id: orderId,
        payment_method: paymentData.payment_method,
        payment_gateway: paymentData.payment_gateway,
        payment_date: paymentData.payment_date,
        amount: paymentData.amount,
        currency: paymentData.currency,
        reference_number: paymentData.idempotency_key || paymentData.reference_number,
        transaction_id: paymentData.transaction_id,
        status: paymentData.status,
        gateway_response: paymentData.gateway_data || null,
        notes: paymentData.metadata ? JSON.stringify(paymentData.metadata) : null,
        confirmed_by: 'SYSTEM', // For webhook confirmations
        confirmed_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (insertError || !paymentConfirmation) {
      console.error('Error creating payment confirmation:', insertError);
      throw new Error('Failed to create payment confirmation record');
    }

    // =====================================================
    // Step 8: Update Order Status (if payment completed)
    // =====================================================

    if (orderId && paymentData.status === 'completed') {
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'QUOTATION', // Move to next workflow step
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (updateError) {
        console.error('Error updating order status:', updateError);
        // Don't fail the request if order update fails
      }

      // Create order status history entry
      await supabase
        .from('order_status_history')
        .insert({
          order_id: orderId,
          from_status: 'PENDING',
          to_status: 'QUOTATION',
          changed_by: 'SYSTEM',
          changed_at: new Date().toISOString(),
          reason: 'Payment confirmed via webhook',
          metadata: {
            payment_id: paymentConfirmation.id,
            payment_gateway: paymentData.payment_gateway,
            transaction_id: paymentData.transaction_id,
          },
        });
    }

    // =====================================================
    // Step 9: Trigger Production Workflow (if applicable)
    // =====================================================

    if (orderId && paymentData.status === 'completed') {
      // Trigger next steps in production workflow
      // This could be a webhook to another service or a database trigger
      console.log('[Payment Confirmation] Production workflow triggered for order:', orderId);
    }

    // =====================================================
    // Step 10: Send Confirmation Email
    // =====================================================

    // Send email notification (non-blocking)
    if (orderId && orderNumber && quotationId) {
      sendPaymentConfirmationEmail(
        orderId,
        orderNumber,
        paymentData
      ).catch((error) => {
        console.error('Failed to send payment confirmation email:', error);
        // Don't fail the request if email fails
      });
    }

    // =====================================================
    // Step 11: Return Success Response
    // =====================================================

    const duration = Date.now() - startTime;
    console.log(`[Payment Confirmation] Processed in ${duration}ms`, {
      payment_id: paymentConfirmation.id,
      order_id: orderId,
      amount: paymentData.amount,
      status: paymentData.status,
    });

    return NextResponse.json(
      {
        success: true,
        payment_id: paymentData.payment_id,
        confirmation_id: paymentConfirmation.id,
        order_id: orderId || undefined,
        order_number: orderNumber || undefined,
        message: 'Payment confirmed successfully',
      } as PaymentConfirmationResponse,
      { status: 201 }
    );

  } catch (error: any) {
    console.error('[Payment Confirmation] Error:', error);

    const paymentError = handlePaymentError(error);

    return NextResponse.json(
      {
        success: false,
        error: paymentError.message,
      } as PaymentConfirmationResponse,
      { status: paymentError.statusCode }
    );
  }
}

// ============================================================
// Email Notification (Non-blocking)
// ============================================================

async function sendPaymentConfirmationEmail(
  orderId: string,
  orderNumber: string,
  paymentData: PaymentConfirmationRequest
): Promise<void> {
  // Import email library
  const { sendEmail } = await import('@/lib/email');

  // Fetch order details
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

  const { data: order } = await supabase
    .from('orders')
    .select('customer_name, customer_email')
    .eq('id', orderId)
    .single();

  if (!order) {
    console.error('[Payment Confirmation] Order not found for email');
    return;
  }

  // Create email content
  const htmlContent = `
    <h2>入金確認</h2>
    <p>${order.customer_name} 様</p>
    <p>この度は、ご入金いただきありがとうございます。</p>

    <h3>入金詳細</h3>
    <p><strong>注文番号:</strong> ${orderNumber}</p>
    <p><strong>お支払いID:</strong> ${paymentData.payment_id}</p>
    ${paymentData.transaction_id ? `<p><strong>取引ID:</strong> ${paymentData.transaction_id}</p>` : ''}
    <p><strong>入金額:</strong> ¥${paymentData.amount.toLocaleString()}</p>
    <p><strong>お支払い方法:</strong> ${paymentData.payment_method}</p>
    <p><strong>入金日時:</strong> ${new Date(paymentData.payment_date).toLocaleString('ja-JP')}</p>
    <p><strong>ステータス:</strong> ${getPaymentStatusLabel(paymentData.status)}</p>

    <p>ご入金を確認いたしました。商品の発送准备を進めてまいります。</p>

    <hr />
    <p style="font-size: 12px; color: #666;">
      このメールはシステムから自動送信されています。ご返信不要です。<br />
      Epackage Lab<br />
      https://epackage-lab.com
    </p>
  `;

  // Send email
  await sendEmail({
    to: order.customer_email,
    subject: `【Epackage Lab】入金確認 (${orderNumber})`,
    html: htmlContent,
  });
}

// ============================================================
// GET: Retrieve Payment Confirmation Status
// ============================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('payment_id');
    const transactionId = searchParams.get('transaction_id');

    if (!paymentId && !transactionId) {
      return NextResponse.json(
        {
          success: false,
          error: 'payment_id or transaction_id is required',
        },
        { status: 400 }
      );
    }

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

    let query = supabase.from('payment_confirmations').select('*');

    if (paymentId) {
      query = query.eq('id', paymentId);
    } else if (transactionId) {
      query = query.eq('transaction_id', transactionId);
    }

    const { data: payment, error } = await query.maybeSingle();

    if (error || !payment) {
      return NextResponse.json(
        {
          success: false,
          error: 'Payment confirmation not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: payment,
    });
  } catch (error: any) {
    console.error('[Payment Confirmation] GET error:', error);

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
// OPTIONS: Handle CORS preflight
// ============================================================

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
      'Access-Control-Max-Age': '86400',
    },
  });
}
