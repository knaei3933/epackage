/**
 * Admin Orders API
 *
 * 管理者用注文一覧取得API
 * - Supabase SSR認証対応
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Supabase SSR Clientを作成
    const cookieStore = await cookies();

    // デバッグ: Cookieをログ出力
    const allCookies = cookieStore.getAll();
    console.log('[Admin Orders API] All cookies:', allCookies.map(c => ({ name: c.name, hasValue: !!c.value })));

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name) => cookieStore.get(name)?.value,
          set: () => {},
          remove: () => {},
        },
      }
    );

    // 認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Admin Orders API: Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // サービスロールクライアントを作成（RLSバイパス）
    const { createClient: createServiceClient } = await import('@supabase/supabase-js');
    const supabaseService = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // ユーザーロールを確認
    const { data: profile } = await supabaseService
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    const adminRoles = ['ADMIN', 'OPERATOR', 'SALES', 'ACCOUNTING'];
    if (!profile || !adminRoles.includes(profile.role)) {
      console.error('Admin Orders API: Forbidden for user:', user.id, 'Role:', profile?.role);
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // クエリパラメータを取得
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const quotationId = searchParams.get('quotation_id');

    // 注文を取得
    let query = supabaseService
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // 見積もりIDでフィルタリング
    if (quotationId) {
      query = query.eq('quotation_id', quotationId);
      console.log('[Admin Orders API] Filtering by quotation_id:', quotationId);
    }

    const { data, error } = await query;

    console.log('[Admin Orders API] Orders count:', data?.length || 0);
    console.log('[Admin Orders API] Orders:', data?.map(o => ({ id: o.id, order_number: o.order_number, status: o.status })) || []);

    if (error) {
      console.error('注文取得エラー:', error);
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error('Admin Orders API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
