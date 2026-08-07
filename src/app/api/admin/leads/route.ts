/**
 * Admin Leads API
 *
 * 管理者用リード管理API（DEPRECATED・実DBに leads テーブル不存在）
 *
 * 実DBスキーマ再生成（commit-1）で leads テーブルが存在しないことが確定。
 * 旧実装は 42P01 フォールバックで空配列を返していたが、C2 型厳密化で
 * `.from('leads')` が型エラーとなるため、DB クエリを廃止して安全に無害化。
 * フロント互換のためルート自体は維持し、常に空結果を返す。
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';

// ============================================================
// GET - Fetch leads list（実DBにテーブル不存在のため常に空）
// ============================================================

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // leads テーブルが実DBに存在しないため、常に空のリストを返す
    return NextResponse.json({
      success: true,
      data: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0,
      },
    });
  } catch (error) {
    console.error('[Admin Leads API] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: '予期しないエラーが発生しました。' },
      { status: 500 }
    );
  }
}

// ============================================================
// POST - Create new lead（実DBにテーブル不存在のため未対応）
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    // leads テーブルが実DBに存在しないため、作成は不可
    return NextResponse.json(
      { success: false, error: 'リード機能は現在利用できません。' },
      { status: 501 }
    );
  } catch (error) {
    console.error('[Admin Leads API] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: '予期しないエラーが発生しました。' },
      { status: 500 }
    );
  }
}

// ============================================================
// PATCH - Update lead（実DBにテーブル不存在のため未対応）
// ============================================================

export async function PATCH(request: NextRequest) {
  try {
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    // leads テーブルが実DBに存在しないため、更新は不可
    return NextResponse.json(
      { success: false, error: 'リード機能は現在利用できません。' },
      { status: 501 }
    );
  } catch (error) {
    console.error('[Admin Leads API] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: '予期しないエラーが発生しました。' },
      { status: 500 }
    );
  }
}

// ============================================================
// OPTIONS - CORS preflight
// ============================================================

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
