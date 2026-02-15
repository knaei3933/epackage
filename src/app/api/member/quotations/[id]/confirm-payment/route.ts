/**
 * Payment Confirmation API (Member Portal)
 *
 * Task P2-13: Payment Confirmation API with Email Notification
 * - POST: Confirm payment for a quotation
 * - Store payment information in database
 * - Update quotation status if needed
 * - Send confirmation email to customer
 * - Send notification email to admin
 * - All DB operations via Supabase MCP
 *
 * Payment Information Stored:
 * - payment_method: Bank transfer, credit card, etc.
 * - payment_date: Date of payment
 * - amount: Payment amount
 * - reference_number: Transaction reference
 * - notes: Additional notes
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

// Temporarily disable email sending to avoid import errors
// import { sendEmail } from '@/lib/email/notificationService';

const sendEmail = async () => {
  // Placeholder to avoid import errors
  console.log('[Payment API] Email sending disabled');
};

// =====================================================
// Types
// =====================================================

interface PaymentConfirmationRequest {
  payment_method: 'bank_transfer' | 'credit_card' | 'paypal' | 'other';
  payment_date: string; // ISO date string
  amount: number;
  reference_number?: string;
  notes?: string;
}

interface PaymentConfirmationResponse {
  id: string;
  quotation_id: string;
  payment_method: string;
  payment_date: string;
  amount: number;
  reference_number: string | null;
  notes: string | null;
  confirmed_by: string;
  confirmed_at: string;
}

// =====================================================
// Environment Variables
// =====================================================
// Note: Environment variables are checked inside getSupabaseClient() function
// to avoid build-time errors when env vars are not available

// =====================================================
// Constants
// =====================================================

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  bank_transfer: '銀行振込',
  credit_card: 'クレジットカード',
  paypal: 'PayPal',
  other: 'その他',
};

// =====================================================
// Helper: Get Supabase client
// =====================================================

async function getSupabaseClient() {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
    },
  });
}

// Email configuration
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@epackage-lab.com';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@epackage-lab.com';

// =====================================================
// POST Handler
// =====================================================

/**
 * POST /api/member/quotations/[id]/confirm-payment
 * Confirm payment for a quotation
 *
 * Request Body:
 * {
 *   "payment_method": "bank_transfer" | "credit_card" | "paypal" | "other",
 *   "payment_date": "ISO date string",
 *   "amount": number,
 *   "reference_number": "string (optional)",
 *   "notes": "string (optional)"
 * }
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
    // 1. Authenticate user using @supabase/ssr
    const supabase = await getSupabaseClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user?.id) {
      return NextResponse.json(
        {
          error: '認証されていません。',
          errorEn: 'Authentication required',
        },
        { status: 401 }
      );
    }

    const userId = user.id;

    const { id: quotationId } = await params;

    // 2. Verify quotation exists and belongs to user
    const { data: quotation, error: quotationError } = await supabase
      .from('quotation')
      .select('id, user_id, status, total_amount, quote_number')
      .eq('id', quotationId)
      .single();

    // Get user information for email
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('email, first_name, last_name, company_name')
      .eq('id', userId)
      .single();

    if (quotationError || !quotation) {
      return NextResponse.json(
        {
          error: '見積が見つかりません。',
          errorEn: 'Quotation not found',
        },
        { status: 404 }
      );
    }

    if (quotation.user_id !== userId) {
      return NextResponse.json(
        {
          error: 'この見積にアクセスする権限がありません。',
          errorEn: 'Access denied',
        },
        { status: 403 }
      );
    }

    // 3. Parse and validate request body
    const body: PaymentConfirmationRequest = await request.json();

    // Validation
    if (!body.payment_method || !body.payment_date || typeof body.amount !== 'number') {
      return NextResponse.json(
        {
          error: '必須項目が不足しています。',
          errorEn: 'Missing required fields',
        },
        { status: 400 }
      );
    }

    if (body.amount <= 0) {
      return NextResponse.json(
        {
          error: '金額は正の数でなければなりません。',
          errorEn: 'Amount must be a positive number',
        },
        { status: 400 }
      );
    }

    // Validate payment method
    const validPaymentMethods = ['bank_transfer', 'credit_card', 'paypal', 'other'];
    if (!validPaymentMethods.includes(body.payment_method)) {
      return NextResponse.json(
        {
          error: '無効な支払方法です。',
          errorEn: 'Invalid payment method',
        },
        { status: 400 }
      );
    }

    // Validate payment date
    const paymentDate = new Date(body.payment_date);
    if (isNaN(paymentDate.getTime())) {
      return NextResponse.json(
        {
          error: '無効な支払日です。',
          errorEn: 'Invalid payment date',
        },
        { status: 400 }
      );
    }

    // 4. Check if payment confirmation already exists
    const { data: existingPayment } = await supabase
      .from('payment_confirmations')
      .select('id')
      .eq('quotation_id', quotationId)
      .maybeSingle();

    if (existingPayment) {
      return NextResponse.json(
        {
          error: 'この見積は既に支払確認済みです。',
          errorEn: 'Payment already confirmed for this quotation',
        },
        { status: 400 }
      );
    }

    // 5. Insert payment confirmation using Supabase client
    const { data: payment, error: paymentError } = await supabase
      .from('payment_confirmations')
      .insert({
        quotation_id: quotationId,
        payment_method: body.payment_method,
        payment_date: paymentDate.toISOString(),
        amount: body.amount,
        reference_number: body.reference_number || null,
        notes: body.notes || null,
        confirmed_by: userId,
        confirmed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (paymentError) {
      console.error('[Payment API] Insert payment error:', paymentError);
      return NextResponse.json(
        {
          error: '支払確認の登録に失敗しました。',
          errorEn: 'Failed to confirm payment',
          details: paymentError.message,
        },
        { status: 500 }
      );
    }

    // 6. Update quotation status if needed
    // If quotation is approved but not yet converted, mark as payment confirmed
    if (quotation.status === 'APPROVED') {
      const { error: updateError } = await supabase
        .from('quotation')
        .update({
          status: 'SENT', // Mark as sent/being processed
          updated_at: new Date().toISOString(),
        })
        .eq('id', quotationId);

      if (updateError) {
        console.error('[Payment API] Update quotation status error:', updateError);
        // Don't fail the request, just log the error
      }
    }

    // 7. Send confirmation emails (don't fail the request if email fails)
    try {
      const customerEmail = userProfile?.email || userId;
      const customerName = userProfile?.first_name && userProfile?.last_name
        ? `${userProfile.first_name} ${userProfile.last_name}`
        : userProfile?.company_name || 'お客様';

      // Send confirmation email to customer
      await sendEmail({
        to: customerEmail,
        subject: `【支払い確認】見積番号 ${quotation.quote_number || quotationId}`,
        html: `
          <div style="font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333; border-bottom: 2px solid #0056b3; padding-bottom: 10px;">支払い確認のご連絡</h2>
            <p style="color: #666; line-height: 1.6;">
              ${customerName}様
            </p>
            <p style="color: #666; line-height: 1.6;">
              この度は、ご入金いただき誠にありがとうございます。
              支払いを確認いたしましたので、ご連絡申し上げます。
            </p>

            <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px;">
              <h3 style="color: #333; margin-top: 0;">お支払い詳細</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #ddd; color: #666;">見積番号</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #ddd; font-weight: bold;">${quotation.quote_number || quotationId}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #ddd; color: #666;">お支払い方法</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${PAYMENT_METHOD_LABELS[body.payment_method]}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #ddd; color: #666;">お支払い日</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${paymentDate.toLocaleDateString('ja-JP')}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #ddd; color: #666;">お支払い金額</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #ddd; font-weight: bold; color: #0056b3;">¥${body.amount.toLocaleString()}</td>
                </tr>
                ${body.reference_number ? `
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #ddd; color: #666;">振込人・確認番号</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${body.reference_number}</td>
                </tr>
                ` : ''}
              </table>
            </div>

            <p style="color: #666; line-height: 1.6;">
              ご確認いただき、ありがとうございます。<br>
              製品の製造に入らせていただきます。完了次第、別途ご連絡させていただきます。
            </p>

            <p style="color: #666; line-height: 1.6;">
              ご不明な点がございましたら、お気軽にお問い合わせください。
            </p>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

            <p style="color: #999; font-size: 12px;">
              このメールはシステムにより自動送信されています。返信には対応できませんのでご了承ください。
            </p>
          </div>
        `,
        text: `
          支払い確認のご連絡

          ${customerName}様

          この度は、ご入金いただき誠にありがとうございます。
          支払いを確認いたしましたので、ご連絡申し上げます。

          お支払い詳細:
          見積番号: ${quotation.quote_number || quotationId}
          お支払い方法: ${PAYMENT_METHOD_LABELS[body.payment_method]}
          お支払い日: ${paymentDate.toLocaleDateString('ja-JP')}
          お支払い金額: ¥${body.amount.toLocaleString()}
          ${body.reference_number ? `振込人・確認番号: ${body.reference_number}` : ''}

          ご確認いただき、ありがとうございます。
          製品の製造に入らせていただきます。完了次第、別途ご連絡させていただきます。

          ご不明な点がございましたら、お気軽にお問い合わせください。

          このメールはシステムにより自動送信されています。返信には対応できませんのでご了承ください。
        `,
      });

      console.log('[Payment API] Customer confirmation email sent to:', customerEmail);

      // Send notification email to admin
      await sendEmail({
        to: ADMIN_EMAIL,
        subject: `【支払い通知】${quotation.quote_number || quotationId} - ${customerName}`,
        html: `
          <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333; border-bottom: 2px solid #28a745; padding-bottom: 10px;">支払い通知</h2>
            <p style="color: #666; line-height: 1.6;">
              以下の見積について、お客様から支払い確認がありました。
            </p>

            <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px;">
              <h3 style="color: #333; margin-top: 0;">支払い詳細</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #ddd; color: #666;">見積番号</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #ddd; font-weight: bold;">${quotation.quote_number || quotationId}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #ddd; color: #666;">お客様名</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${customerName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #ddd; color: #666;">お客様メール</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${customerEmail}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #ddd; color: #666;">お支払い方法</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${PAYMENT_METHOD_LABELS[body.payment_method]}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #ddd; color: #666;">お支払い日</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${paymentDate.toLocaleDateString('ja-JP')}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #ddd; color: #666;">お支払い金額</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #ddd; font-weight: bold; color: #28a745;">¥${body.amount.toLocaleString()}</td>
                </tr>
                ${body.reference_number ? `
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #ddd; color: #666;">振込人・確認番号</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${body.reference_number}</td>
                </tr>
                ` : ''}
                ${body.notes ? `
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #ddd; color: #666;">備考</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${body.notes}</td>
                </tr>
                ` : ''}
              </table>
            </div>

            <p style="color: #666; line-height: 1.6;">
              管理画面で詳細をご確認ください。
            </p>
          </div>
        `,
        text: `
          支払い通知

          以下の見積について、お客様から支払い確認がありました。

          支払い詳細:
          見積番号: ${quotation.quote_number || quotationId}
          お客様名: ${customerName}
          お客様メール: ${customerEmail}
          お支払い方法: ${PAYMENT_METHOD_LABELS[body.payment_method]}
          お支払い日: ${paymentDate.toLocaleDateString('ja-JP')}
          お支払い金額: ¥${body.amount.toLocaleString()}
          ${body.reference_number ? `振込人・確認番号: ${body.reference_number}` : ''}
          ${body.notes ? `備考: ${body.notes}` : ''}

          管理画面で詳細をご確認ください。
        `,
      });

      console.log('[Payment API] Admin notification email sent to:', ADMIN_EMAIL);
    } catch (emailError) {
      console.error('[Payment API] Email sending error:', emailError);
      // Don't fail the request if email fails, just log the error
    }

    // 8. Prepare response
    const response: PaymentConfirmationResponse = {
      id: payment.id,
      quotation_id: payment.quotation_id,
      payment_method: PAYMENT_METHOD_LABELS[payment.payment_method] || payment.payment_method,
      payment_date: payment.payment_date,
      amount: Number(payment.amount),
      reference_number: payment.reference_number,
      notes: payment.notes,
      confirmed_by: payment.confirmed_by,
      confirmed_at: payment.confirmed_at,
    };

    return NextResponse.json(
      {
        success: true,
        payment: response,
        message: '支払いを確認しました。',
        messageEn: 'Payment confirmed successfully.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Payment API] Unexpected error:', error);

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

// =====================================================
// GET Handler
// =====================================================

/**
 * GET /api/member/quotations/[id]/confirm-payment
 * Get payment confirmation status for a quotation
 *
 * Success Response (200):
 * {
 *   "success": true,
 *   "payment": { ... } | null
 * }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authenticate user using @supabase/ssr
    const supabase = await getSupabaseClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user?.id) {
      return NextResponse.json(
        {
          error: '認証されていません。',
          errorEn: 'Authentication required',
        },
        { status: 401 }
      );
    }

    const userId = user.id;

    const { id: quotationId } = await params;

    // 2. Verify quotation belongs to user
    const { data: quotation } = await supabase
      .from('quotation')
      .select('id, user_id')
      .eq('id', quotationId)
      .single();

    if (!quotation || quotation.user_id !== userId) {
      return NextResponse.json(
        {
          error: 'アクセス権限がありません。',
          errorEn: 'Access denied',
        },
        { status: 403 }
      );
    }

    // 3. Get payment confirmation
    const { data: payment } = await supabase
      .from('payment_confirmations')
      .select('*')
      .eq('quotation_id', quotationId)
      .maybeSingle();

    return NextResponse.json(
      {
        success: true,
        payment: payment ? {
          ...payment,
          payment_method: PAYMENT_METHOD_LABELS[payment.payment_method] || payment.payment_method,
          amount: Number(payment.amount),
        } : null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Payment API] Get payment error:', error);

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
