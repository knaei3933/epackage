/**
 * Update Password API Route
 *
 * ログイン中ユーザーのパスワードを変更します。
 * セキュリティのため現在のパスワードで再認証（re-authentication）してから
 * 新しいパスワードに更新します。
 *
 * - POST: { currentPassword, newPassword } を受け取りパスワードを変更
 * - cookie 取得パターンは /api/profile/route.ts と完全に同一
 * - newPassword のバリデーションは SettingsClient の validatePassword
 *   （8文字以上）と完全に同一のルール（クライアント・サーバー間でルール分裂防止）
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { cookies } from 'next/headers';

// =====================================================
// Zod Schema（クライアント validatePassword と同一ルール）
// =====================================================
// .strict() により許可2項目以外を含むリクエストは 400 拒否（strip ではなく）。
// newPassword の複雑性ルールは SettingsClient.tsx の validatePassword が
// 「8文字以上」のみであるため、サーバーも min(8) で完全一致させる。
// 将来クライアント側で大文字・小文字・数字等のルールを追加する場合は
// このスキーマも同時に更新すること（ルール分裂防止）。

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, '現在のパスワードを入力してください'),
  newPassword: z.string().min(8, 'パスワードは8文字以上で入力してください'),
}).strict();

// =====================================================
// POST: パスワード変更
// =====================================================

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Supabase environment variables not configured' },
        { status: 500 }
      );
    }

    // cookie 取得パターンは /api/profile/route.ts と完全に同一
    const cookieStore = await cookies();
    const { createServerClient } = await import('@supabase/ssr');
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: () => {},
        remove: () => {},
      },
    });

    // 認証チェック
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: '認証されていません。', error_code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // リクエストボディ検証（.strict()）
    const body = await request.json();
    const validationResult = updatePasswordSchema.safeParse(body);

    if (!validationResult.success) {
      // .strict() の unrecognized keys（許可外の項目）は flatten().fieldErrors に入らず
      // formErrors に分類されるため空になってしまう。issues から全件を項目別に組み立て、
      // クライアントに「どの項目が問題か」を正確に伝える。
      const details: Record<string, string[]> = {};
      for (const issue of validationResult.error.issues) {
        const key = issue.path.length > 0 ? issue.path.join('.') : '_form';
        (details[key] ??= []).push(issue.message);
      }
      return NextResponse.json(
        {
          error: '入力値が正しくありません。',
          error_code: 'VALIDATION_ERROR',
          details,
        },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = validationResult.data;

    // 現在のパスワードで再認証（re-authentication）
    // パスワード変更の前に本人確認を行う。メールアドレスは取得済みの user.email を使用。
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    });

    if (signInError) {
      return NextResponse.json(
        { error: '現在のパスワードが正しくありません。' },
        { status: 400 }
      );
    }

    // パスワード更新
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      console.error('Password update error:', updateError);
      return NextResponse.json(
        { error: 'パスワードの変更に失敗しました。', error_code: 'UPDATE_ERROR' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'パスワードを変更しました。',
    });
  } catch (error) {
    console.error('Update password POST error:', error);

    return NextResponse.json(
      {
        error: 'パスワード変更中にエラーが発生しました。',
        error_code: 'SERVER_ERROR',
      },
      { status: 500 }
    );
  }
}

// =====================================================
// OPTIONSメソッド - CORS preflightリクエスト処理
// （/api/profile/route.ts と同様）
// =====================================================

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
