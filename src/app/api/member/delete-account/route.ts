/**
 * Account Deletion API Endpoint
 *
 * アカウント削除APIエンドポイント
 * POST /api/member/delete-account
 * GET  /api/member/delete-account（削除サマリー取得）
 *
 * セキュリティ（M4 堅牢化・update-password route と対称）:
 * - currentPassword で再認証（re-authentication・なりすまし/CSRF 防衛）
 * - Zod .strict() で許可項目のみ受入（mass assignment 防衛）
 * - confirmation: 'DELETE' をサーバー側で厳格に検証（クライアントUI確認の保証）
 * 再認証パターン（createServerClient + signInWithPassword）は
 * /api/auth/update-password/route.ts と完全に同一。
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { cookies } from 'next/headers';
import type { SupabaseClient } from '@supabase/supabase-js';
import { deleteAccount, getDeletionSummary } from '@/lib/account-deletion';

// =====================================================
// Zod Schema（再認証 + 確認 + 許可オプション）
// =====================================================
// .strict() により許可項目以外を含むリクエストは 400 拒否（mass assignment 防衛・strip ではなく）。
// confirmation は 'DELETE' リテラルで厳格検証（クライアントUI確認のサーバー側保証）。
// currentPassword は再認証用（signInWithPassword で本人確認）。
// sendEmail / retainActiveOrders は削除オプション（任意・デフォルトは true）。
const deleteAccountSchema = z.object({
  confirmation: z.literal('DELETE'),
  currentPassword: z.string().min(1, '現在のパスワードを入力してください'),
  sendEmail: z.boolean().optional(),
  retainActiveOrders: z.boolean().optional(),
}).strict();

// cookie から認証用クライアントを作るヘルパ（set/remove 空関数＝再認証を検証専用とする・
// session 更新の副作用を回避。update-password route と同一パターン）。
async function createAuthClient(): Promise<{ client: SupabaseClient | null; error: string | null }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return { client: null, error: 'Supabase environment variables not configured' };
  }

  const cookieStore = await cookies();
  const { createServerClient } = await import('@supabase/ssr');
  const client = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get: (name: string) => cookieStore.get(name)?.value,
      set: () => {},
      remove: () => {},
    },
  });

  return { client, error: null };
}

// =====================================================
// POST Handler
// =====================================================

export async function POST(request: NextRequest) {
  try {
    const { client: supabase, error: configError } = await createAuthClient();

    if (!supabase || configError) {
      return NextResponse.json(
        { error: configError },
        { status: 500 }
      );
    }

    // 1. 認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '認証されていません。再度ログインしてください。', error_code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const userId = user.id;
    const userEmail = user.email;

    // 2. リクエストボディ検証（.strict()・mass assignment 防衛）
    const body = await request.json();
    const validationResult = deleteAccountSchema.safeParse(body);

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

    const { currentPassword, sendEmail, retainActiveOrders } = validationResult.data;

    // 3. 現在のパスワードで再認証（re-authentication・なりすまし/CSRF 防衛）
    // パスワード変更と同様、破壊的操作の前に本人確認。session 更新は無視（set/remove 空関数）。
    // ※ canDelete チェックより先に実行し、削除可否（ユーザー属性）をパスワード再確認なしに
    //    開示しない（セッションハイジャック下での情報漏洩防止）。
    // ※ 副作用: signIn は Supabase の last_sign_in_at を更新し、認証レートリミットの
    //    カウンタを進める。検証専用だがトレードオフとして許容（update-password と同一）。
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: userEmail!,
      password: currentPassword,
    });

    if (signInError) {
      return NextResponse.json(
        { error: '現在のパスワードが正しくありません。', error_code: 'INVALID_PASSWORD' },
        { status: 400 }
      );
    }

    // 4. 削除可否チェック（有効な契約等の確認）
    const summary = await getDeletionSummary(userId);

    if (!summary.canDelete) {
      return NextResponse.json(
        {
          error: 'アカウントを削除できません',
          reason: summary.warning || '不明な理由',
        },
        { status: 400 }
      );
    }

    // 5. 削除実行（検証済みオプションのみ・mass assignment 防衛）
    // 旧実装の `...body` スプレッドは廃止。スキーマ検証済みの値のみ渡す。
    const options = {
      sendEmail: sendEmail ?? true,
      retainActiveOrders: retainActiveOrders ?? true,
    };

    const result = await deleteAccount(userId, userEmail || '', options);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 500 }
      );
    }

    // 6. 成功レスポンス
    return NextResponse.json({
      success: true,
      message: result.message,
      deletedCounts: result.deletedCounts,
    });
  } catch (error) {
    console.error('Delete account API error:', error);
    return NextResponse.json(
      { error: 'アカウント削除に失敗しました。時間をおいて再度お試しください。' },
      { status: 500 }
    );
  }
}

// =====================================================
// GET Handler - Get deletion summary
// =====================================================

export async function GET(request: NextRequest) {
  try {
    const { client: supabase, error: configError } = await createAuthClient();

    if (!supabase || configError) {
      return NextResponse.json(
        { error: configError },
        { status: 500 }
      );
    }

    // 1. 認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '認証されていません', error_code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const userId = user.id;

    // 2. 削除サマリー取得
    const summary = await getDeletionSummary(userId);

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Get deletion summary API error:', error);
    return NextResponse.json(
      { error: '削除サマリーの取得に失敗しました' },
      { status: 500 }
    );
  }
}
