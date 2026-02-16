/**
 * Member Resend Verification Email API
 *
 * メール認証再送API
 * - POST: 認証メールの再送
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';

// ============================================================
// Types
// ============================================================

interface ResendRequestBody {
  email: string;
}

interface ResendResponse {
  success: boolean;
  message: string;
  error?: string;
}

// ============================================================
// Helper Functions
// ============================================================

function generateVerificationToken(): string {
  return randomBytes(32).toString('hex');
}

function generateVerificationUrl(email: string, token: string): string {
  const appUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.package-lab.com';
  return `${appUrl}/member/register/verify?email=${encodeURIComponent(email)}&token=${token}`;
}

async function sendVerificationEmail(
  email: string,
  token: string,
  companyName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const verifyUrl = generateVerificationUrl(email, token);

    if (process.env.NODE_ENV === 'development') {
      console.log('[Email Mock] Verification Email:', {
        to: email,
        companyName,
        verifyUrl,
      });
      return { success: true };
    }

    const { Resend } = await import('resend');
    const resendClient = new Resend(process.env.RESEND_API_KEY);

    await resendClient.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@epackage-lab.com',
      to: email,
      subject: '[EPACKAGE Lab] メールアドレス認証',
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
              <h2>メールアドレス認証</h2>
              <p>${companyName}様</p>
              <p>以下のボタンをクリックして、メールアドレスを認証してください。</p>
              <a href="${verifyUrl}" class="button">メールアドレスを認証する</a>
              <p>※このリンクの有効期限は24時間です。</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} EPACKAGE Lab. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================
// POST Handler - Resend Verification Email
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const body: ResendRequestBody = await request.json();

    if (!body.email) {
      return NextResponse.json(
        {
          success: false,
          error: 'メールアドレスが必要です。',
        } as ResendResponse,
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Get user profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', body.email)
      .single();

    if (error || !profile) {
      return NextResponse.json(
        {
          success: false,
          error: 'ユーザーが見つかりません。',
        } as ResendResponse,
        { status: 404 }
      );
    }

    // Check if already verified
    if (!profile.verification_token) {
      return NextResponse.json(
        {
          success: false,
          error: '既に認証が完了しています。',
        } as ResendResponse,
        { status: 400 }
      );
    }

    // Generate new token
    const newToken = generateVerificationToken();
    const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update profile
    await supabase
      .from('profiles')
      .update({
        verification_token: newToken,
        verification_expires_at: verificationExpiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id);

    // Send email
    const emailResult = await sendVerificationEmail(
      body.email,
      newToken,
      profile.company_name || 'お客様'
    );

    if (!emailResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'メール送信に失敗しました。',
        } as ResendResponse,
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '認証メールを再送信しました。',
    } as ResendResponse);

  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'エラーが発生しました。',
      } as ResendResponse,
      { status: 500 }
    );
  }
}
