/**
 * Designer Orders API
 *
 * デザイナー注文一覧取得API
 * - 割り当てられた注文を取得
 * - ステータスフィルタリング対応
 *
 * @route /api/designer/orders
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

// =====================================================
// Types
// =====================================================

interface DesignerOrdersResponse {
  success: boolean;
  orders?: any[];
  error?: string;
  errorEn?: string;
}

// =====================================================
// Helper: Get authenticated designer
// =====================================================

async function getAuthenticatedDesigner(request: NextRequest) {
  const cookieStore = await cookies();
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

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user?.email) {
    return null;
  }

  // 韓国デザイナーメールアドレスリストを取得
  const { data: setting } = await supabase
    .from('notification_settings')
    .select('value')
    .eq('key', 'korea_designer_emails')
    .maybeSingle();

  const designerEmails = (setting?.value as string[]) || [];

  if (!designerEmails.includes(user.email)) {
    return null;
  }

  return { user, email: user.email };
}

// =====================================================
// GET Handler - Get Designer Orders
// =====================================================

/**
 * GET /api/designer/orders
 * Get orders assigned to the designer
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate and verify designer role
    const authResult = await getAuthenticatedDesigner(request);

    if (!authResult) {
      return NextResponse.json(
        { success: false, error: '認証されていません。', errorEn: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');

    const cookieStore = await cookies();
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

    // サービスロールクライアントではRLSをバイパス
    const supabaseAdmin = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get: (name) => cookieStore.get(name)?.value,
          set: () => {},
          remove: () => {},
        },
      }
    );

    // CORRECTION_IN_PROGRESSまたはCUSTOMER_APPROVAL_PENDINGステータスの注文を取得
    let query = supabaseAdmin
      .from('orders')
      .select(`
        id,
        order_number,
        customer_name,
        customer_email,
        status,
        total_amount,
        created_at,
        items:order_items(id, product_name, quantity)
      `)
      .in('status', ['CORRECTION_IN_PROGRESS', 'CUSTOMER_APPROVAL_PENDING']);

    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data: orders, error: ordersError } = await query
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('[Designer Orders GET] Error:', ordersError);
      return NextResponse.json(
        { success: false, error: '注文の取得に失敗しました。', errorEn: 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    const response: DesignerOrdersResponse = {
      success: true,
      orders: orders || [],
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('[Designer Orders GET] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: '予期しないエラーが発生しました。',
        errorEn: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// =====================================================
// OPTIONS Handler for CORS
// =====================================================

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
