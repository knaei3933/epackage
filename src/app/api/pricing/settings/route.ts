/**
 * Public Pricing Settings API
 * 公開価格設定API - 認証なしでアクセス可能
 *
 * GET /api/pricing/settings - 価格計算に使用する公開設定を取得
 *
 * このAPIは一般ユーザー（顧客）が見積もり計算時に使用する
 * 価格設定を返します。機密情報は含めません。
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

/**
 * 公開設定カテゴリ - これらのカテゴリのみ一般ユーザーに公開
 */
const PUBLIC_CATEGORIES = [
  'film_material',  // 素材価格（PET, AL, LLDPE等）
  'printing',       // 印刷料金
  'lamination',     // ラミネート料金
  'slitter',        // スリッター料金
  'exchange_rate',  // 為替レート
  'duty_rate',      // 関税率
  'delivery',       // 配送料
  'production',     // 生産設定
] as const;

/**
 * GET - 公開価格設定を取得
 *
 * Query Parameters:
 * - category: オプション - 特定カテゴリの設定のみ取得
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    // カテゴリが指定されている場合、公開カテゴリかチェック
    if (category && !PUBLIC_CATEGORIES.includes(category as any)) {
      return NextResponse.json(
        { error: '指定されたカテゴリは公開されていません', category },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // 公開カテゴリの設定のみ取得
    let query = supabase
      .from('system_settings')
      .select('*')
      .in('category', PUBLIC_CATEGORIES)
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('key', { ascending: true });

    // カテゴリフィルター
    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Pricing settings fetch error:', error);
      return NextResponse.json(
        { error: '価格設定の取得に失敗しました', details: error.message },
        { status: 500 }
      );
    }

    // Key-Value形式に変換（フラットなマップ）
    const settings: Record<string, any> = {};
    data?.forEach(setting => {
      const fullKey = `${setting.category}.${setting.key}`;
      settings[fullKey] = setting.value;
    });

    // レスポンスにキャッシュ制御ヘッダーを追加（30秒キャッシュ - 設定変更を素早く反映）
    return NextResponse.json({
      success: true,
      data: settings,
      count: data?.length || 0,
      cachedUntil: new Date(Date.now() + 30 * 1000).toISOString()
    }, {
      headers: {
        'Cache-Control': 'public, max-age=30, stale-while-revalidate=10',
        'CDN-Cache-Control': 'public, max-age=30'
      }
    });

  } catch (error) {
    console.error('Pricing settings API error:', error);
    return NextResponse.json(
      {
        error: '価格設定の取得に失敗しました',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
