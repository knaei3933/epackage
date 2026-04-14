/**
 * Announcements API Route
 *
 * お知らせ情報を提供するAPIエンドポイント
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * GET /api/announcements
 * お知らせ情報を取得
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient();

    // 公開済みのお知らせを取得（最新の5件）
    const { data: announcements, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('published', true)
      .order('published_at', { ascending: false, nullsFirst: false })
      .limit(5);

    if (error) {
      console.error('[Announcements API] Error fetching announcements:', error);
      return NextResponse.json({
        success: false,
        announcements: []
      }, { status: 200 }); // エラーでも空配列を返す
    }

    return NextResponse.json({
      success: true,
      announcements: announcements || []
    });

  } catch (error) {
    console.error('[Announcements API] Unexpected error:', error);

    // エラーが発生しても空配列を返す
    return NextResponse.json({
      success: true,
      announcements: []
    }, { status: 200 });
  }
}
