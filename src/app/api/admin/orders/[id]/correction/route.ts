/**
 * Admin Correction Data Upload API
 *
 * 教正データ保存API
 * - プレビュー画像・原版ファイルをSupabase Storageに保存
 * - design_revisionsテーブルにレコード作成
 * - 顧客に承認依頼メール送信
 *
 * @route /api/admin/orders/[id]/correction
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { sendTemplatedEmail } from '@/lib/email';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const dynamic = 'force-dynamic';

// サービスクライアント (RLSバイパス用)
const getServiceClient = () => createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// =====================================================
// Types
// =====================================================

interface CorrectionUploadResponse {
  success: boolean;
  revision?: {
    id: string;
    revision_number: number;
    preview_image_url: string;
    original_file_url: string;
  };
  error?: string;
  errorEn?: string;
}

// =====================================================
// Helper Functions
// =====================================================

/**
 * Generate storage path for correction files
 */
function generateStoragePath(
  orderId: string,
  revisionNumber: number,
  fileName: string,
  type: 'preview' | 'original'
): string {
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `corrections/${orderId}/rev${revisionNumber}/${type}_${timestamp}_${sanitizedFileName}`;
}

/**
 * Get next revision number for an order
 * Uses revision_number field (integer) - 1, 2, 3, etc.
 */
async function getNextRevisionNumber(supabase: any, orderId: string): Promise<number> {
  // Get the maximum revision_number for this order
  const { data: revisions, error } = await supabase
    .from('design_revisions')
    .select('revision_number')
    .eq('order_id', orderId);

  if (error || !revisions || revisions.length === 0) {
    return 1; // First revision
  }

  // Get the maximum revision_number
  const maxNumber = Math.max(...revisions.map((r: any) => r.revision_number || 0));
  return maxNumber + 1;
}

// =====================================================
// GET Handler - List Revisions
// =====================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getServiceClient();

    console.log('[Correction GET] Fetching revisions...');

    const { id: orderId } = await params;

    // Get revisions
    const { data: revisions, error } = await supabase
      .from('design_revisions')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Correction GET] Error:', error);
      return NextResponse.json(
        { success: false, error: '教正データの取得に失敗しました。' },
        { status: 500 }
      );
    }

    console.log('[Correction GET] Success:', revisions?.length || 0, 'revisions');

    // Transform data to match expected format
    const transformedRevisions = (revisions || []).map((rev: any) => ({
      ...rev,
      // Use actual database columns
      revision_number: rev.revision_number,
      approval_status: rev.approval_status || 'pending',
    }));

    return NextResponse.json({
      success: true,
      revisions: transformedRevisions,
    });

  } catch (error) {
    console.error('[Correction GET] Error:', error);

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
// POST Handler - Upload Correction Data
// =====================================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // SSR Client for authentication
    const cookieStore = await cookies();
    const supabaseAuth = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
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
      console.error('[Correction POST] Auth error:', authError);
      return NextResponse.json(
        { success: false, error: '認証されていません' },
        { status: 401 }
      );
    }

    // Service client for database and storage operations
    const supabase = getServiceClient();
    console.log('[Correction POST] Starting upload...');

    const { id: orderId } = await params;

    // Verify order exists
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, order_number, customer_name, customer_email')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, error: '注文が見つかりません。' },
        { status: 404 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const previewImage = formData.get('preview_image') as File;
    const originalFile = formData.get('original_file') as File;
    const partnerComment = formData.get('partner_comment') as string;
    const notifyCustomer = formData.get('notify_customer') === 'true';
    const revisionNumberParam = formData.get('revision_number');

    if (!previewImage || !originalFile) {
      return NextResponse.json(
        {
          success: false,
          error: 'プレビュー画像と原版ファイルの両方が必須です。',
        },
        { status: 400 }
      );
    }

    // Get revision number
    let revisionNumber: number;
    if (revisionNumberParam) {
      revisionNumber = parseInt(revisionNumberParam as string);
    } else {
      revisionNumber = await getNextRevisionNumber(supabase, orderId);
    }

    // Upload files to Supabase Storage
    const previewPath = generateStoragePath(orderId, revisionNumber, previewImage.name, 'preview');
    const originalPath = generateStoragePath(orderId, revisionNumber, originalFile.name, 'original');

    const previewBuffer = Buffer.from(await previewImage.arrayBuffer());
    const originalBuffer = Buffer.from(await originalFile.arrayBuffer());

    const [previewUpload, originalUpload] = await Promise.all([
      supabase.storage
        .from('correction-files')
        .upload(previewPath, previewBuffer, {
          contentType: previewImage.type,
          upsert: false,
        }),
      supabase.storage
        .from('correction-files')
        .upload(originalPath, originalBuffer, {
          contentType: originalFile.type,
          upsert: false,
        }),
    ]);

    if (previewUpload.error || originalUpload.error) {
      console.error('[Correction Upload] Storage error:', {
        preview: previewUpload.error,
        original: originalUpload.error,
      });
      return NextResponse.json(
        { success: false, error: 'ファイルアップロードに失敗しました。' },
        { status: 500 }
      );
    }

    // Get public URLs
    const { data: previewUrlData } = supabase.storage
      .from('correction-files')
      .getPublicUrl(previewPath);

    const { data: originalUrlData } = supabase.storage
      .from('correction-files')
      .getPublicUrl(originalPath);

    // Create design revision record - using actual database schema
    const { data: revision, error: dbError } = await supabase
      .from('design_revisions')
      .insert({
        order_id: orderId,
        revision_number: revisionNumber,
        revision_name: `Revision ${revisionNumber}`,
        approval_status: 'pending',
        partner_comment: partnerComment || null,
        preview_image_url: previewUrlData.publicUrl,
        original_file_url: originalUrlData.publicUrl,
      })
      .select()
      .single();

    if (dbError) {
      console.error('[Correction Upload] DB error:', dbError);
      // Cleanup uploaded files
      await Promise.all([
        supabase.storage.from('correction-files').remove([previewPath]),
        supabase.storage.from('correction-files').remove([originalPath]),
      ]);
      return NextResponse.json(
        { success: false, error: 'データベース保存に失敗しました: ' + dbError.message },
        { status: 500 }
      );
    }

    // ============================================================
    // Auto-transition: CORRECTION_IN_PROGRESS → CUSTOMER_APPROVAL_PENDING
    // 新しいワークフロー: デザイナーが教正データをアップロードすると、顧客承認待ちへ
    // ※ 通知送信の有無に関わらず常に実行
    // ============================================================
    try {
      console.log('[Correction Upload] Auto-transition: CORRECTION_IN_PROGRESS → CUSTOMER_APPROVAL_PENDING');

      // 現在のステータスを取得
      const { data: currentOrder } = await supabase
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .single();

      const currentStatus = currentOrder?.status;

      // 顧客承認待ちに遷移（現在のステータスがCORRECTION_IN_PROGRESSの場合のみ）
      if (currentStatus === 'CORRECTION_IN_PROGRESS') {
        const { error: statusError } = await supabase
          .from('orders')
          .update({
            status: 'CUSTOMER_APPROVAL_PENDING',
            updated_at: new Date().toISOString(),
          })
          .eq('id', orderId);

        if (statusError) {
          console.error('[Correction Upload] Status update error (CUSTOMER_APPROVAL_PENDING):', statusError);
          console.warn('[Correction Upload] Status update failed, but revision was saved. Manual update required.');
        } else {
          console.log('[Correction Upload] Auto-transition completed to CUSTOMER_APPROVAL_PENDING');

          // 履歴を記録
          await supabase
            .from('order_status_history')
            .insert({
              order_id: orderId,
              from_status: currentStatus,
              to_status: 'CUSTOMER_APPROVAL_PENDING',
              changed_by: 'ADMIN',
              changed_at: new Date().toISOString(),
              reason: `教正データアップロード (リビジョン${revisionNumber})`,
            })
            .then(() => console.log('[Correction Upload] Status history logged'))
            .catch((err) => console.error('[Correction Upload] History logging error:', err));
        }
      } else {
        console.log('[Correction Upload] Skipping auto-transition, current status:', currentStatus);
      }
    } catch (statusUpdateError) {
      console.error('[Correction Upload] Status update exception:', statusUpdateError);
      // Don't fail the upload if status update fails
    }

    // 顧客に通知を送信（通知オプションがオンの場合のみ）
    if (notifyCustomer && order.customer_email) {
      try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        await sendTemplatedEmail(
          'correction_ready_for_review',
          {
            orderNumber: order.order_number,
            revisionNumber,
            previewImageUrl: revision.preview_image_url,
            reviewUrl: `${appUrl}/member/orders/${orderId}`,
            recipient: {
              name: order.customer_name,
              email: order.customer_email,
            },
          },
          {
            name: order.customer_name,
            email: order.customer_email,
          }
        );

        console.log('[Correction Upload] Customer notification sent');
      } catch (emailError) {
        console.error('[Correction Upload] Email error:', emailError);
        // Don't fail the upload if email fails
      }
    }

    const response: CorrectionUploadResponse = {
      success: true,
      revision: {
        id: revision.id,
        revision_number: revisionNumber,
        preview_image_url: revision.preview_image_url,
        original_file_url: revision.original_file_url,
      },
    };

    console.log('[Correction POST] Upload successful:', revision.id);

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('[Correction Upload] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: '予期しないエラーが発生しました。',
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
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
