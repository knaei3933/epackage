/**
 * Reset Password API Route
 *
 * パスワード再設定 API
 * - Supabase Auth のパスワード更新機能を使用
 * - トークン検証付き
 * - レート制限付き
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { withRateLimit, createAuthRateLimiter } from '@/lib/rate-limiter';

// =====================================================
// Rate Limiter
// =====================================================

const resetPasswordRateLimiter = createAuthRateLimiter();

// =====================================================
// Schema
// =====================================================

const resetPasswordApiSchema = z
  .object({
    password: z
      .string()
      .min(8, 'パスワードは最低8文字以上である必要があります。')
      .regex(/[A-Z]/, 'パスワードには少なくとも1つの大文字を含める必要があります。')
      .regex(/[a-z]/, 'パスワードには少なくとも1つの小文字を含める必要があります。')
      .regex(/[0-9]/, 'パスワードには少なくとも1つの数字を含める必要があります。'),
    passwordConfirm: z.string().min(1, 'パスワード確認を入力してください。'),
    token: z.string().min(1, 'トークンが無効です。'),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'パスワードが一致しません。',
    path: ['passwordConfirm'],
  });

// =====================================================
// POST /api/auth/reset-password
// =====================================================

async function handleResetPasswordPost(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = resetPasswordApiSchema.parse(body);

    console.log('[RESET PASSWORD API] Password reset request with token');

    // =====================================================
    // DEV MODE: Mock password reset for testing
    // =====================================================
    const isDevMode =
      process.env.NODE_ENV === 'development' &&
      process.env.ENABLE_DEV_MOCK_AUTH === 'true';

    if (isDevMode) {
      console.log('[RESET PASSWORD API] DEV MODE - Mock password reset');

      // Simulate delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log('[RESET PASSWORD API] Mock password reset successful');

      return NextResponse.json({
        success: true,
        message: 'パスワードを再設定しました。',
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

    // Update user password using the token from the reset link
    // The token is automatically extracted from the session by Supabase
    // when the user clicks the link in the email
    const { error } = await supabase.auth.updateUser({
      password: validatedData.password,
    });

    if (error) {
      console.error('[RESET PASSWORD API] Supabase error:', error);

      // Handle specific error cases
      if (error.message.includes('Invalid token')) {
        return NextResponse.json(
          {
            error: '無効または期限切れのリンクです。再度パスワード再設定をやり直してください。',
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: 'パスワードの再設定に失敗しました。' },
        { status: 400 }
      );
    }

    console.log('[RESET PASSWORD API] Password reset successful');

    return NextResponse.json({
      success: true,
      message: 'パスワードを再設定しました。',
    });
  } catch (error) {
    console.error('[RESET PASSWORD API] Error:', error);

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
      { error: 'パスワード再設定処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

export const POST = withRateLimit(handleResetPasswordPost, resetPasswordRateLimiter);
