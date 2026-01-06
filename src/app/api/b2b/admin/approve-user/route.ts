/**
 * B2B Admin Approve User API
 *
 * B2B 관리자 - 회원 승인 API
 * - POST: PENDING 상태의 회원을 ACTIVE로 변경
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/database';

// ============================================================
// Types
// ============================================================

interface ApproveUserRequestBody {
  userId: string;
}

interface ApproveUserResponse {
  success: boolean;
  message: string;
  error?: string;
}

// ============================================================
// Helper Functions
// ============================================================

async function sendApprovalEmail(email: string, companyName: string): Promise<void> {
  try {
    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/b2b/login`;

    if (process.env.NODE_ENV === 'development') {
      console.log('[Email Mock] Approval Email:', {
        to: email,
        companyName,
        loginUrl,
      });
      return;
    }

    const { Resend } = await import('resend');
    const resendClient = new Resend(process.env.RESEND_API_KEY);

    await resendClient.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@epackage-lab.com',
      to: email,
      subject: '[EPACKAGE Lab] B2B会員登録承認完了',
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
            .button { display: inline-block; padding: 12px 30px; background: #c9a961; color: #fff; text-decoration: none; border-radius: 4px; margin: 20px 0; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>EPACKAGE Lab</h1>
            </div>
            <div class="content">
              <h2>B2B会員登録が承認されました</h2>
              <p>${companyName}様</p>
              <p>この度は、EPACKAGE LabのB2B会員登録を承認いたしました。</p>
              <p>以下のボタンからログインして、サービスをご利用いただけます。</p>
              <a href="${loginUrl}" class="button">ログインする</a>
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
    console.error('Approval email error:', error);
  }
}

// ============================================================
// POST Handler - Approve User
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const body: ApproveUserRequestBody = await request.json();

    if (!body.userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' } as ApproveUserResponse,
        { status: 400 }
      );
    }

    // Next.js 16: cookies() now returns a Promise and must be awaited
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } as ApproveUserResponse,
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
        { success: false, error: 'Forbidden: Admin access required' } as ApproveUserResponse,
        { status: 403 }
      );
    }

    // Get user to approve
    const { data: targetUser } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', body.userId)
      .single();

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' } as ApproveUserResponse,
        { status: 404 }
      );
    }

    // Update user status to ACTIVE
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        status: 'ACTIVE',
        updated_at: new Date().toISOString(),
      })
      .eq('id', body.userId);

    if (updateError) {
      console.error('User approval error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to approve user' } as ApproveUserResponse,
        { status: 500 }
      );
    }

    // Send approval email
    await sendApprovalEmail(targetUser.email, targetUser.company_name || 'お客様');

    return NextResponse.json({
      success: true,
      message: 'User approved successfully',
    } as ApproveUserResponse);

  } catch (error) {
    console.error('Approve user error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as ApproveUserResponse,
      { status: 500 }
    );
  }
}
