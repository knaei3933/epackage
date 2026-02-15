/**
 * Member Approval Requests API Routes (Integrated from /api/customer/orders/[id]/approvals)
 *
 * 会員承認リクエストAPI
 * - GET: 注文別承認リクエストリストの取得
 *
 * @route /api/member/orders/[id]/approvals
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseSSRClient } from '@/lib/supabase-ssr';
import { createApiRateLimiter, checkRateLimit, createRateLimitResponse, addRateLimitHeaders } from '@/lib/rate-limiter';

// ============================================================
// Types
// ============================================================

interface ApprovalRequestFile {
  id: string;
  file_name: string;
  file_type: string;
  file_url: string;
  file_size_bytes: number;
  file_category: string;
  uploaded_at: string;
}

interface ApprovalRequestComment {
  id: string;
  content: string;
  author_id: string;
  author_role: string;
  created_at: string;
  author?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

interface ApprovalRequest {
  id: string;
  order_id: string;
  korea_correction_id: string | null;
  title: string;
  description: string;
  approval_type: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  response_notes: string | null;
  responded_at: string | null;
  responded_by: string | null;
  expires_at: string;
  requested_by: string;
  requested_at: string;
  created_at: string;
  metadata: Record<string, any>;
  files?: ApprovalRequestFile[];
  comments?: ApprovalRequestComment[];
}

interface GetApprovalsResponse {
  success: boolean;
  data?: ApprovalRequest[];
  error?: string;
  errorEn?: string;
}

// ============================================================
// Rate Limiter
// ============================================================

const approvalsRateLimiter = createApiRateLimiter();

// ============================================================
// GET Handler - List Approval Requests
// ============================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Check rate limit
  const rateLimitResult = checkRateLimit(request, approvalsRateLimiter);
  if (!rateLimitResult.allowed) {
    return createRateLimitResponse(rateLimitResult);
  }

  try {
    const { id: orderId } = await params;
    const { client: supabase } = await createSupabaseSSRClient(request);

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: '認証されていません。', errorEn: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get user profile to check role
    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = profile && profile.role === 'ADMIN';

    // Verify user has access to this order
    const { data: order, error: orderError } = await (supabase as any)
      .from('orders')
      .select('user_id')
      .eq('id', orderId)
      .single();

    if (orderError || !order || !order.user_id) {
      return NextResponse.json(
        { success: false, error: '注文が見つかりません。', errorEn: 'Order not found' },
        { status: 404 }
      );
    }

    // Check access: admin or order owner
    if (!isAdmin && order.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'アクセス権限がありません。', errorEn: 'Access denied' },
        { status: 403 }
      );
    }

    // Fetch approval requests with files and comments (simplified query)
    const { data: approvals, error: approvalsError } = await (supabase as any)
      .from('customer_approval_requests')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });

    if (approvalsError) {
      console.error('[Member Approvals GET] DB Error:', JSON.stringify(approvalsError, null, 2));
      console.error('[Member Approvals GET] Error Code:', approvalsError.code);
      console.error('[Member Approvals GET] Error Message:', approvalsError.message);

      // Check if table doesn't exist - return empty array instead of error
      if (approvalsError.code === '42P01' || approvalsError.message?.includes('does not exist')) {
        console.log('[Member Approvals GET] Table does not exist, returning empty array');
        return NextResponse.json({
          success: true,
          data: [],
        });
      }

      return NextResponse.json(
        {
          success: false,
          error: '承認リクエストの取得に失敗しました。',
          errorEn: 'Failed to fetch approval requests',
          details: approvalsError.message
        },
        { status: 500 }
      );
    }

    const response: GetApprovalsResponse = {
      success: true,
      data: approvals as ApprovalRequest[],
    };

    const nextResponse = NextResponse.json(response, { status: 200 });
    return addRateLimitHeaders(nextResponse, rateLimitResult);

  } catch (error: any) {
    console.error('[Member Approvals GET] Unexpected error:', error);
    console.error('[Member Approvals GET] Error stack:', error?.stack);

    // Check if it's a "table does not exist" error
    if (error?.code === '42P01' || error?.message?.includes('does not exist')) {
      console.log('[Member Approvals GET] Table does not exist (caught), returning empty array');
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: '予期しないエラーが発生しました。',
        errorEn: 'An unexpected error occurred',
        details: error?.message
      },
      { status: 500 }
    );
  }
}
