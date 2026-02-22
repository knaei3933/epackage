/**
 * Designer Correction Upload API
 *
 * デザイナー教正データアップロードAPI
 * - プレビュー画像・原版ファイルをGoogle Driveに保存
 * - design_revisionsテーブルにレコード作成
 * - 顧客に承認依頼メール送信
 *
 * @route /api/designer/orders/[id]/correction
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendTemplatedEmail } from '@/lib/email';
import { translateKoreanToJapanese } from '@/lib/translation';
import {
  getAdminAccessTokenForUpload,
  uploadFileToDrive,
  getCorrectionFolderId
} from '@/lib/google-drive';
import { getAuthenticatedDesignerOrToken } from '@/lib/designer-auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const dynamic = 'force-dynamic';

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
 * Get next revision number for an order
 */
async function getNextRevisionNumber(supabase: any, orderId: string): Promise<number> {
  const { data: revisions, error } = await supabase
    .from('design_revisions')
    .select('revision_number')
    .eq('order_id', orderId);

  if (error || !revisions || revisions.length === 0) {
    return 1;
  }

  const maxNumber = Math.max(...revisions.map((r: any) => r.revision_number || 0));
  return maxNumber + 1;
}

// =====================================================
// POST Handler - Upload Correction Data
// =====================================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('[Designer Correction POST] Starting upload...');

    const { id: orderId } = await params;

    // Parse form data first to extract token
    const formData = await request.formData();
    const token = formData.get('token') as string | null;

    // Authenticate using middleware OR token
    const authResult = await getAuthenticatedDesignerOrToken(request, orderId, token || undefined);

    if (!authResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: authResult.errorKo || authResult.error || 'Authentication required',
          errorEn: authResult.error || 'Authentication required',
        },
        { status: 401 }
      );
    }

    // Service client for database and storage operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Verify order exists
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, order_number, customer_name, customer_email')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, error: '注文が見つかりません。', errorEn: 'Order not found' },
        { status: 404 }
      );
    }

    // Get designer email for logging and notifications
    const { data: designerProfile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', authResult.designerId!)
      .single();
    const designerEmail = designerProfile?.email || 'Unknown';

    const previewImage = formData.get('preview_image') as File;
    const originalFile = formData.get('original_file') as File;
    const partnerComment = formData.get('partner_comment') as string;
    const commentKo = formData.get('comment_ko') as string; // Korean comment (new field)
    const orderItemId = formData.get('order_item_id') as string | null;

    if (!previewImage || !originalFile) {
      return NextResponse.json(
        {
          success: false,
          error: 'プレビュー画像と原版ファイルの両方が必須です。',
          errorEn: 'Both preview image and original file are required.',
        },
        { status: 400 }
      );
    }

    // Get product name from order item
    let productName = '';
    if (orderItemId) {
      const { data: orderItem } = await supabase
        .from('order_items')
        .select('product_name')
        .eq('id', orderItemId)
        .single();
      productName = orderItem?.product_name || '';
    } else {
      const { data: firstItem } = await supabase
        .from('order_items')
        .select('product_name')
        .eq('order_id', orderId)
        .limit(1)
        .single();
      productName = firstItem?.product_name || '';
    }

    if (!productName) {
      return NextResponse.json(
        {
          success: false,
          error: '製品情報が見つかりません。',
          errorEn: 'Product information not found.',
        },
        { status: 400 }
      );
    }

    // Get revision number
    const revisionNumber = await getNextRevisionNumber(supabase, orderId);

    // ============================================================
    // Upload files to Google Drive
    // ============================================================
    const correctionFolderId = getCorrectionFolderId();

    if (!correctionFolderId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Google Driveフォルダが設定されていません。',
          errorEn: 'Google Drive folder not configured.',
        },
        { status: 500 }
      );
    }

    // Get admin access token for Google Drive
    const accessToken = await getAdminAccessTokenForUpload();

    // Generate file names
    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const sanitizedProductName = productName.trim().replace(/[^a-zA-Z0-9-_가-힣]/g, '_');

    const previewExt = previewImage.name.substring(previewImage.name.lastIndexOf('.'));
    const originalExt = originalFile.name.substring(originalFile.name.lastIndexOf('.'));

    const previewFileName = `${sanitizedProductName}_校正データ_${order.order_number}_${dateStr}${previewExt}`;
    const originalFileName = `${sanitizedProductName}_校正データ_${order.order_number}_${dateStr}${originalExt}`;

    console.log('[Designer Correction Upload] Uploading to Google Drive:', {
      preview: previewFileName,
      original: originalFileName,
      folder: correctionFolderId,
    });

    // Upload both files to Google Drive
    const [previewDriveFile, originalDriveFile] = await Promise.all([
      uploadFileToDrive(previewImage, previewFileName, previewImage.type, correctionFolderId, accessToken),
      uploadFileToDrive(originalFile, originalFileName, originalFile.type, correctionFolderId, accessToken),
    ]);

    const previewImageDriveUrl = previewDriveFile.webViewLink;
    const originalFileUrl = originalDriveFile.webViewLink;

    console.log('[Designer Correction Upload] Google Drive upload successful:', {
      preview: previewDriveFile.id,
      original: originalDriveFile.id,
    });

    // ============================================================
    // Translate Korean comment to Japanese (async)
    // ============================================================
    let commentJa: string | null = null;
    let translationStatus: string = 'pending';

    if (commentKo && commentKo.trim()) {
      try {
        console.log('[Designer Correction Upload] Translating Korean comment to Japanese...');
        const translationResult = await translateKoreanToJapanese(commentKo);
        commentJa = translationResult.translatedText;
        translationStatus = translationResult.cached ? 'translated' : 'translated';
        console.log('[Designer Correction Upload] Translation successful');
      } catch (translationError) {
        console.error('[Designer Correction Upload] Translation failed:', translationError);
        translationStatus = 'failed';
        // Continue without translation - admin can manually translate later
      }
    }

    // Create design revision record with bilingual support
    const { data: revision, error: dbError } = await supabase
      .from('design_revisions')
      .insert({
        order_id: orderId,
        order_item_id: orderItemId || null,
        revision_number: revisionNumber,
        revision_name: `Revision ${revisionNumber}`,
        approval_status: 'pending',
        partner_comment: partnerComment || null,
        comment_ko: commentKo || null,
        comment_ja: commentJa,
        translation_status: translationStatus,
        preview_image_url: previewImageDriveUrl,
        original_file_url: originalFileUrl,
        uploaded_by_type: 'korea_designer',
        uploaded_by_id: authResult.designerId!,
      })
      .select()
      .single();

    if (dbError) {
      console.error('[Designer Correction Upload] DB error:', dbError);
      return NextResponse.json(
        {
          success: false,
          error: 'データベース保存に失敗しました: ' + dbError.message,
          errorEn: 'Failed to save to database: ' + dbError.message,
        },
        { status: 500 }
      );
    }

    // Update preview_image_url to use proxy URL
    const appUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const previewProxyUrl = `${appUrl}/api/designer/orders/${orderId}/correction/${revision.id}/preview`;

    await supabase
      .from('design_revisions')
      .update({ preview_image_url: previewProxyUrl })
      .eq('id', revision.id);

    console.log('[Designer Correction Upload] Preview proxy URL:', previewProxyUrl);

    // ============================================================
    // Auto-transition: CORRECTION_IN_PROGRESS → CUSTOMER_APPROVAL_PENDING
    // ============================================================
    // Auto-transition: CORRECTION_IN_PROGRESS → CORRECTION_COMPLETED → CUSTOMER_APPROVAL_PENDING
    // 2段階遷移: デザイナーが教正データをアップロードすると、校正完了→顧客承認待ちへ
    // ============================================================
    try {
      console.log('[Designer Correction Upload] Auto-transition: TWO-STEP process');

      const { data: currentOrder } = await supabase
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .single();

      const currentStatus = currentOrder?.status;

      if (currentStatus === 'CORRECTION_IN_PROGRESS') {
        // Step 1: CORRECTION_IN_PROGRESS → CORRECTION_COMPLETED
        const { error: step1Error } = await supabase
          .from('orders')
          .update({
            status: 'CORRECTION_COMPLETED',
            updated_at: new Date().toISOString(),
          })
          .eq('id', orderId);

        if (step1Error) {
          console.error('[Designer Correction Upload] Step 1 error (CORRECTION_COMPLETED):', step1Error);
        } else {
          console.log('[Designer Correction Upload] Step 1 completed: CORRECTION_IN_PROGRESS → CORRECTION_COMPLETED');

          // 履歴を記録 (Step 1)
          await supabase
            .from('order_status_history')
            .insert({
              order_id: orderId,
              from_status: 'CORRECTION_IN_PROGRESS',
              to_status: 'CORRECTION_COMPLETED',
              changed_by: designerEmail,
              changed_at: new Date().toISOString(),
              reason: `教正データアップロード (リビジョン${revisionNumber}) - Step 1`,
            })
            .then(() => console.log('[Designer Correction Upload] Step 1 history logged'))
            .catch((err) => console.error('[Designer Correction Upload] Step 1 history error:', err));

          // Step 2: CORRECTION_COMPLETED → CUSTOMER_APPROVAL_PENDING
          const { error: step2Error } = await supabase
            .from('orders')
            .update({
              status: 'CUSTOMER_APPROVAL_PENDING',
              updated_at: new Date().toISOString(),
            })
            .eq('id', orderId);

          if (step2Error) {
            console.error('[Designer Correction Upload] Step 2 error (CUSTOMER_APPROVAL_PENDING):', step2Error);
          } else {
            console.log('[Designer Correction Upload] Step 2 completed: CORRECTION_COMPLETED → CUSTOMER_APPROVAL_PENDING');

            // 履歴を記録 (Step 2)
            await supabase
              .from('order_status_history')
              .insert({
                order_id: orderId,
                from_status: 'CORRECTION_COMPLETED',
                to_status: 'CUSTOMER_APPROVAL_PENDING',
                changed_by: designerEmail,
                changed_at: new Date().toISOString(),
                reason: `教正データアップロード完了、顧客承認待ち (リビジョン${revisionNumber}) - Step 2`,
              })
              .then(() => console.log('[Designer Correction Upload] Step 2 history logged'))
              .catch((err) => console.error('[Designer Correction Upload] Step 2 history error:', err));
          }
        }
      }
    } catch (statusUpdateError) {
      console.error('[Designer Correction Upload] Status update exception:', statusUpdateError);
    }

    // ============================================================
    // Update assignment status to 'completed'
    // ============================================================
    try {
      const { error: assignmentUpdateError } = await supabase
        .from('designer_task_assignments')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('designer_id', authResult.designerId!)
        .eq('order_id', orderId);

      if (assignmentUpdateError) {
        console.warn('[Designer Correction Upload] Assignment update error (may not exist):', assignmentUpdateError);
      } else {
        console.log('[Designer Correction Upload] Assignment status updated to completed');
      }
    } catch (assignmentError) {
      console.warn('[Designer Correction Upload] Assignment update exception (may not exist):', assignmentError);
    }

    // Send notification to customer
    if (order.customer_email) {
      try {
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

        console.log('[Designer Correction Upload] Customer notification sent');
      } catch (emailError) {
        console.error('[Designer Correction Upload] Email error:', emailError);
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

    console.log('[Designer Correction POST] Upload successful:', revision.id);

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('[Designer Correction Upload] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: '予期しないエラーが発生しました。',
        errorEn: 'An unexpected error occurred.',
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
