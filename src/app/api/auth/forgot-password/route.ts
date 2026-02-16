/**
 * Forgot Password API Route
 *
 * パスワード再設定メール送信 API
 * - Supabase Auth のパスワードリセット機能を使用
 * - メールで再設定リンクを送信
 * - レート制限付き
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { withRateLimit, createAuthRateLimiter } from '@/lib/rate-limiter';
import { forgotPasswordSchema } from '@/types/auth';

// =====================================================
// Rate Limiter
// =====================================================

const forgotPasswordRateLimiter = createAuthRateLimiter();

// =====================================================
// POST /api/auth/forgot-password
// =====================================================

async function handleForgotPasswordPost(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = forgotPasswordSchema.parse(body);

    console.log('[FORGOT PASSWORD API] Request for:', validatedData.email);

    // =====================================================
    // DEV MODE: Mock forgot password for testing
    // =====================================================
    const isDevMode =
      process.env.NODE_ENV === 'development' &&
      process.env.ENABLE_DEV_MOCK_AUTH === 'true';

    if (isDevMode) {
      console.log('[FORGOT PASSWORD API] DEV MODE - Mock password reset');

      // Simulate delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Create a fake reset link (in real scenario, this would come from Supabase)
      const mockResetLink = `${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.package-lab.com'}/auth/reset-password?token=mock-token-${Date.now()}`;

      console.log('[FORGOT PASSWORD API] Mock reset link:', mockResetLink);

      return NextResponse.json({
        success: true,
        message: 'パスワード再設定用のリンクをメールでお送りしました。',
        // In dev mode, return the link for testing
        ...(process.env.NODE_ENV === 'development' && {
          devModeResetLink: mockResetLink,
        }),
      });
    }

    // =====================================================
    // PRODUCTION: Real Supabase password reset
    // =====================================================
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Generate password reset link
    // Supabase will send an email with the reset link
    const { error } = await supabase.auth.resetPasswordForEmail(
      validatedData.email,
      {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.package-lab.com'}/auth/reset-password`,
      }
    );

    if (error) {
      console.error('[FORGOT PASSWORD API] Supabase error:', error);

      // Security: Don't reveal if email exists or not
      // Always return success to prevent email enumeration
      return NextResponse.json({
        success: true,
        message:
          'もしメールアドレスが登録されている場合、パスワード再設定用のリンクをお送りしました。',
      });
    }

    console.log('[FORGOT PASSWORD API] Password reset email sent successfully');

    // Always return success (security measure to prevent email enumeration)
    return NextResponse.json({
      success: true,
      message: 'パスワード再設定用のリンクをメールでお送りしました。',
    });
  } catch (error) {
    console.error('[FORGOT PASSWORD API] Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: '無効な入力データです',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'パスワードリセット処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

export const POST = withRateLimit(handleForgotPasswordPost, forgotPasswordRateLimiter);
