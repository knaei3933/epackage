/**
 * B2B Login API
 *
 * B2B 로그인 API
 * - POST: 이메일/비밀번호 로그인 처리
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/database';
import { z } from 'zod';

// ============================================================
// Types
// ============================================================

interface LoginRequestBody {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
    status: string;
  };
  error?: string;
  code?: string;
}

// ============================================================
// Validation Schema
// ============================================================

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// ============================================================
// POST Handler - Login
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequestBody = await request.json();
    const validatedData = loginSchema.parse(body);

    // Next.js 16: cookies() now returns a Promise and must be awaited
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });

    // Step 1: Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        {
          success: false,
          error: 'メールアドレスまたはパスワードが正しくありません。',
          code: 'INVALID_CREDENTIALS',
        } as LoginResponse,
        { status: 401 }
      );
    }

    // Step 2: Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        {
          success: false,
          error: 'プロフィールが見つかりません。',
          code: 'PROFILE_NOT_FOUND',
        } as LoginResponse,
        { status: 404 }
      );
    }

    // Step 3: Check if B2B user
    if (profile.user_type !== 'B2B') {
      return NextResponse.json(
        {
          success: false,
          error: 'B2B会員のみログイン可能です。通常の会員ログインをご利用ください。',
          code: 'NOT_B2B_USER',
        } as LoginResponse,
        { status: 403 }
      );
    }

    // Step 4: Check email verification
    if (profile.verification_token) {
      return NextResponse.json(
        {
          success: false,
          error: 'メールアドレス認証が完了していません。認証メールを確認してください。',
          code: 'EMAIL_NOT_VERIFIED',
        } as LoginResponse,
        { status: 403 }
      );
    }

    // Step 5: Check account status
    if (profile.status === 'PENDING') {
      return NextResponse.json(
        {
          success: false,
          error: '会員登録はまだ承認されていません。管理者の承認をお待ちください。',
          code: 'PENDING_APPROVAL',
        } as LoginResponse,
        { status: 403 }
      );
    }

    if (profile.status === 'SUSPENDED') {
      return NextResponse.json(
        {
          success: false,
          error: 'このアカウントは停止されています。お問い合わせください。',
          code: 'ACCOUNT_SUSPENDED',
        } as LoginResponse,
        { status: 403 }
      );
    }

    if (profile.status === 'DELETED') {
      return NextResponse.json(
        {
          success: false,
          error: 'このアカウントは削除されています。',
          code: 'ACCOUNT_DELETED',
        } as LoginResponse,
        { status: 403 }
      );
    }

    // Step 6: Update last login
    await supabase
      .from('profiles')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', profile.id);

    const response: LoginResponse = {
      success: true,
      message: 'ログインしました。',
      user: {
        id: profile.id,
        email: profile.email,
        name: `${profile.kanji_last_name} ${profile.kanji_first_name}`,
        role: profile.role,
        status: profile.status,
      },
    };

    return NextResponse.json(response);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: '입력 데이터가 올바르지 않습니다.',
          code: 'VALIDATION_ERROR',
        } as LoginResponse,
        { status: 400 }
      );
    }

    console.error('B2B login error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'ログインに失敗しました。',
        code: 'INTERNAL_ERROR',
      } as LoginResponse,
      { status: 500 }
    );
  }
}
