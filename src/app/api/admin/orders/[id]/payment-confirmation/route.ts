/**
 * Admin Payment Confirmation API
 *
 * 管理者入金確認API
 * - 入金額と日時を記録
 * - payment_confirmed_at, payment_amount, payment_methodを更新
 * - 顧客に入金完了通知メール送信
 *
 * @route /api/admin/orders/[id]/payment-confirmation
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { sendTemplatedEmail } from '@/lib/email';

// =====================================================
// Environment Variables
// =====================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// =====================================================
// Helper: Get authenticated admin
// =====================================================

async function getAuthenticatedAdmin(request: NextRequest) {
  // Normal auth: Use cookie-based auth
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
    },
  });

  const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();

  if (userError || !authUser?.id) {
    return null;
  }

  const userId = authUser.id;
  const user = authUser;

  // Verify admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (!profile || profile.role !== 'admin') {
    return null;
  }

  return { userId, user };
}

// =====================================================
// Types
// =====================================================

interface PaymentConfirmationResponse {
  success: boolean;
  payment?: {
    payment_confirmed_at: string;
    payment_amount: number;
    payment_method: string;
  };
  message?: string;
  error?: string;
  errorEn?: string;
}

// =====================================================
// POST Handler - Confirm Payment
// =====================================================

/**
 * POST /api/admin/orders/[id]/payment-confirmation
 * Confirm customer payment
 *
 * Request Body:
 * - paymentAmount: number
 * - paymentDate: string (ISO date)
 * - paymentMethod: string
 *
 * Success Response (200):
 * {
 *   "success": true,
 *   "payment": { ... }
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authenticate and verify admin role
    const authResult = await getAuthenticatedAdmin(request);

    if (!authResult) {
      return NextResponse.json(
        { success: false, error: '認証されていません。', errorEn: 'Authentication required' },
        { status: 401 }
      );
    }

    const { userId, user } = authResult;
    const { id: orderId } = await params;

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
      },
    });

    // 2. Verify order exists
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, order_number, customer_name, customer_email, total_amount, current_stage, skip_contract')
      .eq('id', orderId)
      .maybeSingle();

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, error: '注文が見つかりません。', errorEn: 'Order not found' },
        { status: 404 }
      );
    }

    // 3. Parse request body
    const body = await request.json();
    const { paymentAmount, paymentDate, paymentMethod } = body;

    if (!paymentAmount || paymentAmount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: '有効な入金額を入力してください。',
          errorEn: 'Please enter a valid payment amount'
        },
        { status: 400 }
      );
    }

    if (!paymentDate) {
      return NextResponse.json(
        {
          success: false,
          error: '入金日を入力してください。',
          errorEn: 'Please enter payment date'
        },
        { status: 400 }
      );
    }

    // 4. Update order with payment confirmation
    const confirmedAt = new Date(paymentDate + 'T00:00:00').toISOString();

    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        payment_confirmed_at: confirmedAt,
        payment_amount: paymentAmount,
        payment_method: paymentMethod || 'bank_transfer',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select('payment_confirmed_at, payment_amount, payment_method')
      .maybeSingle();

    if (updateError) {
      console.error('[Payment Confirmation] Update error:', updateError);
      return NextResponse.json(
        { success: false, error: '入金確認の更新に失敗しました。', errorEn: 'Failed to update payment' },
        { status: 500 }
      );
    }

    // 5. Log to order history
    await supabase
      .from('order_history')
      .insert({
        order_id: orderId,
        action: 'payment_confirmed',
        description: `入金確認: ¥${paymentAmount.toLocaleString()}`,
        performed_by: userId,
        metadata: {
          paymentAmount,
          paymentDate: confirmedAt,
          paymentMethod,
        }
      });

    // 6. Send notification to customer
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
          },
          {
            name: order.customer_name,
            email: order.customer_email,
          }
        );
      } catch (emailError) {
        console.error('[Payment Confirmation] Email error:', emailError);
        // Don't fail the confirmation if email fails
      }
    }

    // 7. 新しいワークフロー: 契約スキップ注文の場合、韓国デザイナーに通知
    if (order.skip_contract) {
      try {
        // データベースからデザイナーメール取得
        const { data: setting } = await supabase
          .from('notification_settings')
          .select('value')
          .eq('key', 'korea_designer_emails')
          .maybeSingle();

        const designerEmails: string[] = setting?.value || [];

        if (designerEmails.length > 0) {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

          // 各デザイナーにメール送信
          for (const email of designerEmails) {
            await sendTemplatedEmail(
              'korea_designer_data_notification',
              {
                orderNumber: order.order_number,
                customerName: order.customer_name,
                customerEmail: order.customer_email || '',
                dataUploadUrl: `${appUrl}/member/orders/${orderId}/data-receipt`,
                correctionUploadUrl: `${appUrl}/admin/orders/${orderId}/correction`,
              },
              {
                name: '韓国デザイナー',
                email,
              }
            );
          }

          console.log('[Payment Confirmation] Korea designer notification sent to:', designerEmails);

          // 注文ステータスを更新: データ入稿待ちに
          await supabase
            .from('orders')
            .update({
              current_stage: 'AWAITING_DATA',
              updated_at: new Date().toISOString(),
            })
            .eq('id', orderId);
        }
      } catch (designerEmailError) {
        console.error('[Payment Confirmation] Korea designer notification error:', designerEmailError);
        // Don't fail the confirmation if designer email fails
      }
    }

    const response: PaymentConfirmationResponse = {
      success: true,
      payment: updatedOrder,
      message: '入金を確認しました。',
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('[Payment Confirmation] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: '予期しないエラーが発生しました。',
        errorEn: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// =====================================================
// GET Handler - Get Payment Info
// =====================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate
    const authResult = await getAuthenticatedAdmin(request);

    if (!authResult) {
      return NextResponse.json(
        { success: false, error: '認証されていません。', errorEn: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id: orderId } = await params;

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
      },
    });

    // Get payment info
    const { data: order } = await supabase
      .from('orders')
      .select('payment_confirmed_at, payment_amount, payment_method')
      .eq('id', orderId)
      .maybeSingle();

    if (!order) {
      return NextResponse.json(
        { success: false, error: '注文が見つかりません。', errorEn: 'Order not found' },
        { status: 404 }
      );
    }

    const payment = (order.payment_confirmed_at) ? {
      payment_confirmed_at: order.payment_confirmed_at,
      payment_amount: order.payment_amount,
      payment_method: order.payment_method,
    } : null;

    return NextResponse.json({
      success: true,
      payment,
    });

  } catch (error) {
    console.error('[Payment Confirmation GET] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: '予期しないエラーが発生しました。',
        errorEn: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

// =====================================================
// OPTIONS Handler for CORS
// =====================================================

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
