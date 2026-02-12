/**
 * Admin Reject User API
 *
 * 管理者 - 会員拒否API
 * - POST: PENDING状態の会員をDELETEDに変更
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseSSRClient } from '@/lib/supabase-ssr';
import { getServerClient } from '@/lib/supabase';

// ============================================================
// Types
// ============================================================

interface RejectUserRequestBody {
  userId: string;
  reason?: string;
}

interface RejectUserResponse {
  success: boolean;
  message: string;
  error?: string;
}

// ============================================================
// Helper Functions
// ============================================================

async function sendRejectionEmail(email: string, reason?: string): Promise<void> {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Email Mock] Rejection Email:', {
        to: email,
        reason,
      });
      return;
    }

    const { Resend } = await import('resend');
    const resendClient = new Resend(process.env.RESEND_API_KEY);

    await resendClient.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@epackage-lab.com',
      to: email,
      subject: '[EPACKAGE Lab] B2B会員登録結果について',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Noto Sans JP', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1a1a1a; color: #fff; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; background: #f9f9f9; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>EPACKAGE Lab</h1>
            </div>
            <div class="content">
              <h2>B2B会員登録結果について</h2>
              <p>この度は、EPACKAGE LabのB2B会員登録をお申込みいただき、誠にありがとうございます。</p>
              <p>誠に恐れ入りますが、今回はお申込みを承認いたしかねますこととなりました。</p>
              ${reason ? `<p>理由: ${reason}</p>` : ''}
              <p>ご不明な点がございましたら、お問い合わせください。</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} EPACKAGE Lab. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
  } catch (error) {
    console.error('Rejection email error:', error);
  }
}

// ============================================================
// POST Handler - Reject User
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const body: RejectUserRequestBody = await request.json();

    if (!body.userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' } as RejectUserResponse,
        { status: 400 }
      );
    }

    // Initialize Supabase client with SSR pattern
    const { client: supabase } = await createSupabaseSSRClient($$$ARGS);

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } as RejectUserResponse,
        { status: 401 }
      );
    }

    // Check if admin
    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!adminProfile || adminProfile.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Admin access required' } as RejectUserResponse,
        { status: 403 }
      );
    }

    // Get user to reject
    const { data: targetUser } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', body.userId)
      .single();

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' } as RejectUserResponse,
        { status: 404 }
      );
    }

    // Update user status to DELETED
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        status: 'DELETED',
        updated_at: new Date().toISOString(),
      })
      .eq('id', body.userId);

    if (updateError) {
      console.error('User rejection error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to reject user' } as RejectUserResponse,
        { status: 500 }
      );
    }

    // Send rejection email
    await sendRejectionEmail(targetUser.email, body.reason);

    return NextResponse.json({
      success: true,
      message: 'User rejected successfully',
    } as RejectUserResponse);

  } catch (error) {
    console.error('Reject user error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as RejectUserResponse,
      { status: 500 }
    );
  }
}
