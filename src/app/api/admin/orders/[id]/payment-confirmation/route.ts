/**
 * Admin Payment Confirmation API
 *
 * 管理者入金確認API
 * - payment_confirmations テーブルに入金記録を保存
 * - 顧客に入金完了通知メール送信
 *
 * @route /api/admin/orders/[id]/payment-confirmation
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';
import { sendTemplatedEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

// =====================================================
// Types
// =====================================================

interface PaymentConfirmationResponse {
  success: boolean;
  payment?: {
    confirmed_at: string;
    payment_date: string;
    payment_method: string;
  } | null;
  message?: string;
  error?: string;
  errorEn?: string;
}

// =====================================================
// POST Handler - Confirm Payment
// =====================================================

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const params = await context.params;
    const { id: orderId } = params;

    const serviceClient = createServiceClient();

    // Get order to find quotation_id
    const { data: order, error: orderError } = await serviceClient
      .from('orders')
      .select('id, order_number, quotation_id, customer_name, customer_email, total_amount')
      .eq('id', orderId)
      .maybeSingle();

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, error: '注文が見つかりません。', errorEn: 'Order not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { paymentAmount, paymentDate, paymentMethod } = body;

    if (!paymentAmount || paymentAmount <= 0) {
      return NextResponse.json(
        { success: false, error: '有効な入金額を入力してください。', errorEn: 'Please enter a valid payment amount' },
        { status: 400 }
      );
    }

    if (!paymentDate) {
      return NextResponse.json(
        { success: false, error: '入金日を入力してください。', errorEn: 'Please enter payment date' },
        { status: 400 }
      );
    }

    const confirmedAt = new Date(paymentDate + 'T00:00:00').toISOString();

    // Check if payment confirmation already exists for this quotation
    const { data: existingPayment } = await serviceClient
      .from('payment_confirmations')
      .select('id')
      .eq('quotation_id', order.quotation_id)
      .maybeSingle();

    // Insert or update payment confirmation record (manual upsert to avoid
    // missing unique-constraint limitation on payment_confirmations)
    let paymentRecord: { confirmed_at: string; payment_date: string; payment_method: string; amount: number } | null = null;
    let paymentError: { message: string } | null = null;

    if (existingPayment) {
      const { data: updated, error: updateErr } = await serviceClient
        .from('payment_confirmations')
        .update({
          amount: paymentAmount,
          payment_date: paymentDate,
          payment_method: paymentMethod || 'bank_transfer',
          confirmed_at: confirmedAt,
          confirmed_by: auth.userId,
        })
        .eq('id', existingPayment.id)
        .select('confirmed_at, payment_date, payment_method, amount')
        .maybeSingle();
      paymentRecord = updated;
      paymentError = updateErr;
    } else {
      const { data: inserted, error: insertErr } = await serviceClient
        .from('payment_confirmations')
        .insert({
          quotation_id: order.quotation_id,
          amount: paymentAmount,
          payment_date: paymentDate,
          payment_method: paymentMethod || 'bank_transfer',
          confirmed_at: confirmedAt,
          confirmed_by: auth.userId,
        })
        .select('confirmed_at, payment_date, payment_method, amount')
        .maybeSingle();
      paymentRecord = inserted;
      paymentError = insertErr;
    }

    if (paymentError) {
      console.error('[Payment Confirmation] Upsert error:', paymentError);
      return NextResponse.json(
        { success: false, error: '入金確認の更新に失敗しました。', errorEn: 'Failed to update payment' },
        { status: 500 }
      );
    }

    // Send notification to customer
    if (order.customer_email) {
      try {
        await sendTemplatedEmail(
          'payment_confirmation',
          {
            orderNumber: order.order_number,
            customerName: order.customer_name,
            paymentAmount,
            paymentDate: confirmedAt,
            totalAmount: order.total_amount,
          } as any,
          { name: order.customer_name, email: order.customer_email }
        );
      } catch (emailError) {
        console.error('[Payment Confirmation] Email error:', emailError);
      }
    }

    const response: PaymentConfirmationResponse = {
      success: true,
      payment: paymentRecord,
      message: '入金を確認しました。',
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('[Payment Confirmation] Error:', error);
    return NextResponse.json(
      { success: false, error: '予期しないエラーが発生しました。', errorEn: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// =====================================================
// GET Handler - Get Payment Info
// =====================================================

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const params = await context.params;
    const { id: orderId } = params;

    const serviceClient = createServiceClient();

    const { data: order } = await serviceClient
      .from('orders')
      .select('quotation_id')
      .eq('id', orderId)
      .maybeSingle();

    if (!order) {
      return NextResponse.json(
        { success: false, error: '注文が見つかりません。', errorEn: 'Order not found' },
        { status: 404 }
      );
    }

    const { data: payment } = await serviceClient
      .from('payment_confirmations')
      .select('confirmed_at, payment_date, payment_method')
      .eq('quotation_id', order.quotation_id)
      .maybeSingle();

    return NextResponse.json({
      success: true,
      payment,
    });

  } catch (error) {
    console.error('[Payment Confirmation GET] Error:', error);
    return NextResponse.json(
      { success: false, error: '予期しないエラーが発生しました。', errorEn: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
