/**
 * Designer Revisions API
 *
 * デザイナーリビジョン取得API
 * - 注文に関連する教正データリビジョンを取得
 *
 * @route /api/designer/orders/[id]/revisions
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

// =====================================================
// Types
// =====================================================

interface RevisionsResponse {
  success: boolean;
  revisions?: any[];
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
// GET Handler - Get Revisions
// =====================================================

/**
 * GET /api/designer/orders/[id]/revisions
 * Get design revisions for an order
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate and verify designer role
    const authResult = await getAuthenticatedDesigner(request);

    if (!authResult) {
      return NextResponse.json(
        { success: false, error: '認証されていません。', errorEn: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id: orderId } = await params;

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

    // Get revisions AND order items in parallel
    const [revisionsResult, orderItemsResult] = await Promise.all([
      supabaseAdmin
        .from('design_revisions')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false }),
      supabaseAdmin
        .from('order_items')
        .select('id, product_name, quantity, specifications')
        .eq('order_id', orderId),
    ]);

    const { data: revisions, error } = revisionsResult;

    if (error) {
      console.error('[Designer Revisions GET] Error:', error);
      return NextResponse.json(
        { success: false, error: 'リビジョンの取得に失敗しました。', errorEn: 'Failed to fetch revisions' },
        { status: 500 }
      );
    }

    // Create a map of order items for quick lookup
    const orderItemsMap = new Map(
      (orderItemsResult.data || []).map(item => [item.id, item])
    );

    // Add sku_name to each revision
    const transformedRevisions = (revisions || []).map((rev: any) => {
      let skuName = null;
      if (rev.order_item_id) {
        const item = orderItemsMap.get(rev.order_item_id);
        if (item) {
          skuName = `${item.product_name} (${item.quantity}枚)`;
        }
      }
      return {
        ...rev,
        revision_number: rev.revision_number,
        approval_status: rev.approval_status || 'pending',
        sku_name: skuName,
      };
    });

    const response: RevisionsResponse = {
      success: true,
      revisions: transformedRevisions,
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('[Designer Revisions GET] Error:', error);

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
