import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseClient } from '@/lib/supabase';
import { withAdminAuth } from '@/lib/api-auth';
import { handleApiError, ValidationError } from '@/lib/api-error-handler';
import { uuidSchema } from '@/lib/validation-schemas';
import { Resend } from 'resend';
import type { Database } from '@/types/database';

/**
 * POST /api/admin/contracts/send-reminder
 * 契約署名リマインダーメールを送信
 */

// ============================================================
// Validation Schema
// ============================================================

const sendReminderSchema = z.object({
  contractId: uuidSchema,
  message: z.string().min(1, 'Message is required'),
});

export const POST = withAdminAuth(async (request: NextRequest, auth) => {
  try {
    const body = await request.json();
    const validationResult = sendReminderSchema.safeParse(body);

    if (!validationResult.success) {
      throw new ValidationError('Invalid request data', validationResult.error.errors);
    }

    const data = validationResult.data;
    const { contractId, message } = data;

    const supabase = createSupabaseClient();

    // 契約データ取得
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select(`
        *,
        orders!inner(
          customer_name,
          customer_email
        )
      `)
      .eq('id', contractId)
      .single();

    if (contractError || !contract) {
      throw new Error('Contract not found');
    }

    // リマインダー送信可能チェック
    const contractTyped = contract as Database['public']['Tables']['contracts']['Row'] & { orders?: { customer_name: string; customer_email: string } };
    if (!['SENT', 'PENDING_SIGNATURE', 'CUSTOMER_SIGNED'].includes(contractTyped.status)) {
      throw new Error('Contract status does not allow reminder sending');
    }

    // Get customer email from joined orders table
    const customerEmail = contractTyped.orders?.customer_email || '';

    if (!customerEmail) {
      throw new Error('Customer email not found');
    }

    // Resend初期化
    const resend = new Resend(process.env.RESEND_API_KEY);

    // メール送信
    const emailResult = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@epackage-lab.com',
      to: customerEmail,
      subject: `契約書への署名のお願い (${contractTyped.contract_number})`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f8f9fa; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e9ecef; }
            .footer { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px; color: #6c757d; }
            .message { white-space: pre-wrap; line-height: 1.8; }
            .cta-button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>契約書署名のお願い</h1>
            </div>
            <div class="content">
              <p class="message">${message.replace(/\n/g, '<br>')}</p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://epackage-lab.com'}/contracts/${contractTyped.id}" class="cta-button">
                契約書に署名する
              </a>
            </div>
            <div class="footer">
              <p>このメールはシステムより自動送信されています。</p>
              <p>© Epackage Lab. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: message
    });

    if (emailResult.error) {
      console.error('メール送信エラー:', emailResult.error);
      throw new Error('Failed to send email');
    }

    // リマインター送信履歴を記録
    const { error: historyError } = await supabase
      .from('contract_reminder_history')
      .insert({
        contract_id: contractId,
        sent_at: new Date().toISOString(),
        message: message,
        sent_to: customerEmail,
      });

    if (historyError) {
      console.error('リマインダー履歴保存エラー:', historyError);
      // 履歴保存エラーはメイン処理の失敗とはしない
    }

    return NextResponse.json({
      success: true,
      message: 'リマインダーを送信しました',
      emailId: emailResult.data?.id
    });
  } catch (error) {
    return handleApiError(error);
  }
});
