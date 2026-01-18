/**
 * Member Email Verification API
 *
 * メール認証API
 * - POST: トークン検証およびメール認証処理
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ============================================================
// Types
// ============================================================

interface VerifyEmailRequestBody {
  email: string;
  token: string;
}

interface VerifyEmailResponse {
  success: boolean;
  message: string;
  error?: string;
  code?: string;
}

// ============================================================
// POST Handler - Verify Email
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const body: VerifyEmailRequestBody = await request.json();

    if (!body.email || !body.token) {
      return NextResponse.json(
        {
          success: false,
          error: 'メールアドレスとトークンが必要です。',
          code: 'MISSING_PARAMS',
        } as VerifyEmailResponse,
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
          code: 'USER_NOT_FOUND',
        } as VerifyEmailResponse,
        { status: 404 }
      );
    }

    // Check token
    if (profile.verification_token !== body.token) {
      return NextResponse.json(
        {
          success: false,
          error: '無効なトークンです。',
          code: 'INVALID_TOKEN',
        } as VerifyEmailResponse,
        { status: 400 }
      );
    }

    // Check expiration
    if (profile.verification_expires_at) {
      const expiresAt = new Date(profile.verification_expires_at);
      if (expiresAt < new Date()) {
        return NextResponse.json(
          {
            success: false,
            error: 'トークンの有効期限が切れています。',
            code: 'TOKEN_EXPIRED',
          } as VerifyEmailResponse,
          { status: 400 }
        );
      }
    }

    // Update profile - clear token and keep PENDING status (admin approval still needed)
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        verification_token: null,
        verification_expires_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id);

    if (updateError) {
      console.error('Profile update error:', updateError);
      return NextResponse.json(
        {
          success: false,
          error: '認証処理に失敗しました。',
          code: 'UPDATE_ERROR',
        } as VerifyEmailResponse,
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'メールアドレス認証が完了しました。管理者の承認をお待ちください。',
    } as VerifyEmailResponse);

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      {
        success: false,
        error: ' Internal server error',
        code: 'INTERNAL_ERROR',
      } as VerifyEmailResponse,
      { status: 500 }
    );
  }
}
