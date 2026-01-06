/**
 * Account Deletion API Endpoint
 *
 * アカウント削除APIエンドポイント
 * POST /api/member/delete-account
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseWithCookies } from '@/lib/supabase'
import { createServiceClient } from '@/lib/supabase'
import { deleteAccount, getDeletionSummary } from '@/lib/account-deletion'
import { cookies } from 'next/headers'

// =====================================================
// POST Handler
// =====================================================

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user (support both cookie auth and DEV_MODE header)
    const cookieStore = cookies()
    const supabase = await createSupabaseWithCookies(cookieStore as any)

    // Check for DEV_MODE header from middleware
    const devModeUserId = request.headers.get('x-user-id');
    const isDevMode = request.headers.get('x-dev-mode') === 'true';

    let userId: string;
    let userEmail: string | undefined;

    if (isDevMode && devModeUserId) {
      // DEV_MODE: Use header from middleware
      console.log('[Delete Account API] DEV_MODE: Using x-user-id header:', devModeUserId);
      userId = devModeUserId;
      userEmail = 'dev-mode@example.com'; // Mock email for DEV_MODE
    } else {
      // Normal auth: Use cookie-based auth
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return NextResponse.json(
          { error: '認証されていません。再度ログインしてください。' },
          { status: 401 }
        );
      }
      userId = user.id;
      userEmail = user.email;
    }

    // 2. Get deletion summary to check if deletion is allowed
    const summary = await getDeletionSummary(userId)

    if (!summary.canDelete) {
      return NextResponse.json(
        {
          error: 'アカウントを削除できません',
          reason: summary.warning || '不明な理由'
        },
        { status: 400 }
      )
    }

    // 3. Parse request body for additional options
    let body = {}
    try {
      body = await request.json()
    } catch {
      // Empty body is ok
    }

    const options = {
      sendEmail: true,
      retainActiveOrders: true,
      ...body
    }

    // 4. Delete account
    const result = await deleteAccount(userId, userEmail || '', options)

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 500 }
      )
    }

    // 5. Return success response
    return NextResponse.json({
      success: true,
      message: result.message,
      deletedCounts: result.deletedCounts
    })

  } catch (error) {
    console.error('Delete account API error:', error)
    return NextResponse.json(
      { error: 'アカウント削除に失敗しました。時間をおいて再度お試しください。' },
      { status: 500 }
    )
  }
}

// =====================================================
// GET Handler - Get deletion summary
// =====================================================

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user (support both cookie auth and DEV_MODE header)
    const cookieStore = cookies()
    const supabase = await createSupabaseWithCookies(cookieStore as any)

    // Check for DEV_MODE header from middleware
    const devModeUserId = request.headers.get('x-user-id');
    const isDevMode = request.headers.get('x-dev-mode') === 'true';

    let userId: string;

    if (isDevMode && devModeUserId) {
      // DEV_MODE: Use header from middleware
      console.log('[Delete Account API GET] DEV_MODE: Using x-user-id header:', devModeUserId);
      userId = devModeUserId;
    } else {
      // Normal auth: Use cookie-based auth
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return NextResponse.json(
          { error: '認証されていません' },
          { status: 401 }
        );
      }
      userId = user.id;
    }

    // 2. Get deletion summary
    const summary = await getDeletionSummary(userId)

    return NextResponse.json(summary)

  } catch (error) {
    console.error('Get deletion summary API error:', error)
    return NextResponse.json(
      { error: '削除サマリーの取得に失敗しました' },
      { status: 500 }
    )
  }
}
