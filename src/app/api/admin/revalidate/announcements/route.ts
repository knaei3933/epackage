/**
 * Revalidate Announcements Cache API Route
 *
 * お知らせキャッシュ無効化 API エンドポイント
 * - announcements テーブルの更新後にキャッシュをクリア
 * - 管理者がSupabase等でお知らせを変更した後に呼び出し
 */

import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

export const dynamic = 'force-dynamic';

// =====================================================
// POST /api/admin/revalidate/announcements
// =====================================================

export async function POST() {
  try {
    // キャッシュタグで無効化
    revalidateTag('announcements');

    return NextResponse.json({
      success: true,
      message: 'お知らせキャッシュを無効化しました',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Revalidate Announcements] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'キャッシュの無効化に失敗しました',
      },
      { status: 500 }
    );
  }
}

// =====================================================
// OPTIONS Handler - CORS preflight
// =====================================================

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
