/**
 * Send Design Data to Korea Partner API
 *
 * デザインデータ韓国送付API
 * - AI抽出データを取得してメール本文に記載
 * - 原本デザインファイルを添付
 * - design@epackage-lab.com → info@package-lab.com
 *
 * 修正履歴:
 * - H-11: インライン認証 → verifyAdminAuth に統一（status === 'ACTIVE' 厳格チェック）
 * - C-6: order_history（本番未存在・メール後に500でデッドルート）→ order_status_history に統一
 * - H-8: current_stage のみ更新 → status + current_stage を同時更新（二重状態矛盾解消）
 * - データアクセスを createServiceClient に統一（RLS バイパス・管理者機能）
 *
 * @route /api/admin/orders/[id]/send-to-korea
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';
import { sendKoreaDataTransferWithAttachments } from '@/lib/email';
import type { OrderStatus } from '@/types/order-status';
import { invalidateAdminDashboardCache } from '@/lib/cache-helpers';
import { mapStatusToCurrentStage } from '@/types/order-status';

export const dynamic = 'force-dynamic';

// =====================================================
// Types
// =====================================================

interface SendToKoreaResponse {
  success: boolean;
  message?: string;
  messageId?: string;
  previewUrl?: string;
  error?: string;
}

// =====================================================
// POST Handler - Send to Korea
// =====================================================

/**
 * POST /api/admin/orders/[id]/send-to-korea
 * Send design data with AI extraction to Korea partner
 *
 * Request Body:
 * - notes: Optional additional notes for Korea partner
 *
 * Success Response (200):
 * {
 *   "success": true,
 *   "message": "Design data sent to Korea",
 *   "messageId": "...",
 *   "previewUrl": "..." // Development only
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // H-11: 認証を verifyAdminAuth に統一（status === 'ACTIVE' 厳格チェック）
    // 旧インライン認証は profile.role !== 'ADMIN' のみで status を見ないため、
    // SUSPENDED/PENDING のアカウントでも通過していた。
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const { id: orderId } = await params;

    // Service client（RLS回避・管理者機能）
    const supabase = createServiceClient();

    // 注文詳細 + ファイルを取得（status を含め、監査ログ from_status 用に使用）
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        customer_name,
        customer_email,
        customer_phone,
        created_at,
        items,
        quotation_id,
        status,
        files (
          id,
          file_type,
          original_filename,
          file_url,
          file_path,
          ai_extraction_data
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: '注文が見つかりません。', errorEn: 'Order not found' },
        { status: 404 }
      );
    }

    // AI抽出データをファイルから集約
    const files = order.files || [];
    const designFiles = files.filter((f: any) =>
      ['AI', 'PDF', 'PSD'].includes(f.file_type)
    );

    if (designFiles.length === 0) {
      return NextResponse.json(
        {
          error: 'デザインファイルが見つかりません。',
          errorEn: 'No design files found',
          hint: 'AI、PDF、PSDファイルを先にアップロードしてください'
        },
        { status: 400 }
      );
    }

    const aiExtractedData = {
      specifications: {} as Record<string, any>,
      printing: {} as Record<string, any>,
      design: {} as Record<string, any>,
    };

    designFiles.forEach((file: any) => {
      if (file.ai_extraction_data) {
        Object.assign(aiExtractedData.specifications, file.ai_extraction_data.specifications);
        Object.assign(aiExtractedData.printing, file.ai_extraction_data.printing);
        Object.assign(aiExtractedData.design, file.ai_extraction_data.design);
      }
    });

    // 注文アイテムから製品詳細を解析
    const items = order.items || [];
    const firstItem = items[0] || {};
    const specs = firstItem.specifications || {};

    // メールデータを構築
    const emailData = {
      orderId: order.id,
      quotationNumber: order.order_number,
      companyName: order.customer_name || 'お客様',
      customerName: order.customer_name || 'お客様',
      customerEmail: order.customer_email || '',
      customerPhone: order.customer_phone || '',
      orderDate: order.created_at,
      aiExtractedData: {
        // Specifications
        bagType: specs.bagTypeId || '-',
        dimensions: specs.dimensions || `${specs.width || 0}×${specs.height || 0}${specs.depth ? `×${specs.depth}` : ''}`,
        material: specs.materialId || '-',
        thickness: specs.thicknessSelection || '-',

        // Printing
        printingType: specs.printingType || '-',
        colorMode: specs.printingColors ? `${specs.printingColors}色` : '-',
        colors: specs.printingColors || 0,

        // Design
        productName: firstItem.productName || '-',
        hasLogo: specs.hasLogo || false,
        hasBarcode: specs.hasBarcode || false,
      },
      notes: '', // リクエストボディから後で設定
    };

    // リクエストボディから notes を取得
    const body = await request.json().catch(() => ({}));
    emailData.notes = body.notes || '';

    // ファイル添付データを準備
    const attachmentData = designFiles.map((file: any) => ({
      filename: file.original_filename,
      href: file.file_url,
    }));

    // 韓国パートナーへメール送信
    const result = await sendKoreaDataTransferWithAttachments(
      emailData as any,
      attachmentData,
      process.env.KOREA_PARTNER_EMAIL || 'info@package-lab.com'
    );

    if (!result.success) {
      return NextResponse.json(
        {
          error: '韓国送付メールの送信に失敗しました。',
          errorEn: 'Failed to send Korea email',
          details: result.error
        },
        { status: 500 }
      );
    }

    // C-6 + H-8: 監査ログを order_status_history に記録し、status + current_stage を同時更新
    // 旧 order_history は本番未存在で、メール送信成功後に insert 例外 → 500 のデッドルートだった。
    // mapStatusToCurrentStage('CORRECTION_IN_PROGRESS') === 'DATA_TO_KR' なので
    // current_stage 値は従来互換。status を更新しない二重状態矛盾（H-8）を解消。
    const previousStatus = order.status;
    const nextStatus: OrderStatus = 'CORRECTION_IN_PROGRESS';

    try {
      await supabase.from('order_status_history').insert({
        order_id: orderId,
        from_status: previousStatus,
        to_status: nextStatus,
        changed_by: auth.userId,
        reason: 'デザインデータを韓国パートナーに送信',
      });
    } catch (historyError) {
      // 監査ログ失敗はメール送信成功を崩さない（旧実装はここで500になっていた）
      console.warn('[Send to Korea] Failed to record status history:', historyError);
    }

    // 注文ステータス + current_stage を同時更新（H-8）
    await supabase
      .from('orders')
      .update({
        status: nextStatus,
        current_stage: mapStatusToCurrentStage(nextStatus),
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    const response: SendToKoreaResponse = {
      success: true,
      message: 'デザインデータを韓国パートナーに送信しました。',
      messageId: result.messageId,
    };

    if (result.previewUrl) {
      response.previewUrl = result.previewUrl;
    }

    // ダッシュボード統計の即時反映（C2・Phase 4-3・orders.status/current_stage 更新 → ordersByStatus 直結）
    invalidateAdminDashboardCache();

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('[Send to Korea] Error:', error);

    return NextResponse.json(
      {
        error: '予期しないエラーが発生しました。',
        errorEn: 'An unexpected error occurred',
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
