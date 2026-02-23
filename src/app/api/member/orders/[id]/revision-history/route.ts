/**
 * Member Revision History API
 *
 * 会員用リビジョン履歴API
 * - GET: 注文のデザインリビジョン履歴取得（含む顧客ファイル提出、承認/拒否情報）
 *
 * @route /api/member/orders/[id]/revision-history
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Env vars checked at runtime in handler function
const supabaseUrl = () => process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = () => process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const dynamic = 'force-dynamic';

// サービスクライアント (RLSバイパス用)
const getServiceClient = () => createClient(supabaseUrl(), supabaseServiceKey(), {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// =====================================================
// Types
// =====================================================

interface RevisionHistoryEntry {
  revision: {
    id: string;
    revision_number: number;
    approval_status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    original_customer_filename: string | null;
    generated_correction_filename: string | null;
    preview_image_url: string | null;
    original_file_url: string | null;
    partner_comment: string | null;
    comment_ko: string | null;
    comment_ja: string | null;
    translation_status: string | null;
    customer_comment: string | null;
  };
  submission: {
    id: string | null;
    original_filename: string | null;
    submission_number: number | null;
    file_url: string | null;  // 入稿ファイルのURL
  } | null;
  rejection: {
    reason: string | null;
    rejected_at: string | null;
    rejected_by_name: string | null;
  } | null;
  approval: {
    approved_at: string | null;
    approved_by_name: string | null;
  } | null;
}

// =====================================================
// GET Handler - List Revision History
// =====================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // SSR Client for authentication
    const cookieStore = await cookies();
    const supabaseAuth = createServerClient(
      supabaseUrl(),
      supabaseAnonKey(),
      {
        cookies: {
          get: (name) => cookieStore.get(name)?.value,
          set: () => {},
          remove: () => {},
        },
      }
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: '認証されていません' },
        { status: 401 }
      );
    }

    const supabase = getServiceClient();
    const { id: orderId } = await params;

    // Verify order belongs to user
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, user_id, order_number')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, error: '注文が見つかりません。' },
        { status: 404 }
      );
    }

    if (order.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'アクセス権限がありません。' },
        { status: 403 }
      );
    }

    // Get design revisions with submission data
    const { data: revisions, error: revisionsError } = await supabase
      .from('design_revisions')
      .select(`
        id,
        revision_number,
        approval_status,
        created_at,
        original_customer_filename,
        generated_correction_filename,
        preview_image_url,
        original_file_url,
        partner_comment,
        comment_ko,
        comment_ja,
        translation_status,
        customer_comment,
        customer_submission_id,
        rejected_at,
        rejected_by,
        approved_by,
        approved_at
      `)
      .eq('order_id', orderId)
      .order('revision_number', { ascending: true });

    if (revisionsError) {
      console.error('[Revision History GET] Revisions error:', revisionsError);
      return NextResponse.json(
        { success: false, error: 'リビジョン履歴の取得に失敗しました。' },
        { status: 500 }
      );
    }

    // Get customer submissions data (include file_url for download)
    const submissionIds = (revisions || [])
      .map(r => r.customer_submission_id)
      .filter(Boolean) as string[];

    let submissionsMap = new Map<string, any>();
    if (submissionIds.length > 0) {
      const { data: submissions } = await supabase
        .from('customer_file_submissions')
        .select('id, original_filename, submission_number, file_url')
        .in('id', submissionIds);

      if (submissions) {
        submissionsMap = new Map(submissions.map(s => [s.id, s]));
      }
    }

    // Get user names for rejection and approval
    const userIds = [
      ...(revisions || []).map(r => r.rejected_by).filter(Boolean),
      ...(revisions || []).map(r => r.approved_by).filter(Boolean),
    ] as string[];

    let userNamesMap = new Map<string, string>();
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);

      if (profiles) {
        userNamesMap = new Map(profiles.map((p: any) => [p.id, p.full_name || p.email || 'Unknown']));
      }
    }

    // Build history entries
    const history: RevisionHistoryEntry[] = (revisions || []).map(revision => {
      const submission = revision.customer_submission_id
        ? submissionsMap.get(revision.customer_submission_id)
        : null;

      const rejectionEntry = revision.approval_status === 'rejected' ? {
        reason: revision.partner_comment || null,
        rejected_at: revision.rejected_at || null,
        rejected_by_name: revision.rejected_by ? userNamesMap.get(revision.rejected_by) || null : null,
      } : null;

      const approvalEntry = revision.approval_status === 'approved' ? {
        approved_at: revision.approved_at || null,
        approved_by_name: revision.approved_by ? userNamesMap.get(revision.approved_by) || null : null,
      } : null;

      return {
        revision: {
          id: revision.id,
          revision_number: revision.revision_number,
          approval_status: revision.approval_status,
          created_at: revision.created_at,
          original_customer_filename: revision.original_customer_filename,
          generated_correction_filename: revision.generated_correction_filename,
          preview_image_url: revision.preview_image_url,
          original_file_url: revision.original_file_url,
          partner_comment: revision.partner_comment,
          comment_ko: revision.comment_ko,
          comment_ja: revision.comment_ja,
          translation_status: revision.translation_status,
          customer_comment: revision.customer_comment,
        },
        submission: submission ? {
          id: submission.id,
          original_filename: submission.original_filename,
          submission_number: submission.submission_number,
          file_url: submission.file_url,
        } : null,
        rejection: rejectionEntry,
        approval: approvalEntry,
      };
    });

    console.log('[Revision History GET] Success:', history.length, 'entries');

    return NextResponse.json({
      success: true,
      history,
    });

  } catch (error) {
    console.error('[Revision History GET] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: '予期しないエラーが発生しました。',
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
