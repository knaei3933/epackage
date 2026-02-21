/**
 * Manual Designer Notification Trigger API
 *
 * デザイナーへのデータ入稿通知を手動送信するAPI（テスト用）
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { sendDesignerDataUploadNotification, sendDesignerDataUploadNotificationBatch } from '@/lib/email/designer-emails';
import { generateUploadToken } from '@/lib/designer-tokens';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    const supabase = createServiceClient();

    // Get order details
    const { data: order } = await supabase
      .from('orders')
      .select('id, order_number, customer_name')
      .eq('id', orderId)
      .single();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Get or create task assignment for this order
    // 注文のタスクアサインメントを取得または作成
    let taskAssignment = await supabase
      .from('designer_task_assignments')
      .select('id, access_token_hash, access_token_expires_at')
      .eq('order_id', orderId)
      .maybeSingle();

    // Generate new access token if no assignment exists or token has expired
    // アサインメントがないかトークンが期限切れの場合、新しいアクセストークンを生成
    let accessToken: string | undefined;
    let needsTokenUpdate = false;

    if (!taskAssignment.data) {
      // No assignment exists - create one (we need a designer_id for this)
      // アサインメントが存在しない - 作成する（designer_idが必要）
      // For now, we'll skip token generation if no assignment exists
      // 今のところ、アサインメントがない場合はトークン生成をスキップ
      console.warn('[Designer Notify] No task assignment found for order:', orderId);
    } else if (
      !taskAssignment.data.access_token_hash ||
      new Date(taskAssignment.data.access_token_expires_at || 0) < new Date()
    ) {
      // No valid token exists - generate new one
      // 有効なトークンがない - 新しいトークンを生成
      const { rawToken, tokenHash, expiresAt } = generateUploadToken(30);

      const { error: updateError } = await supabase
        .from('designer_task_assignments')
        .update({
          access_token_hash: tokenHash,
          access_token_expires_at: expiresAt.toISOString(),
        })
        .eq('id', taskAssignment.data.id);

      if (!updateError) {
        accessToken = rawToken;
        needsTokenUpdate = true;
        console.log('[Designer Notify] Generated new access token for order:', orderId);
      } else {
        console.error('[Designer Notify] Failed to update access token:', updateError);
      }
    }

    // If assignment has valid token, we still need the raw token
    // Unfortunately, we can't retrieve the raw token from the hash
    // So we need to generate a new one each time or store it somewhere
    // For now, let's generate a new token each time we send a notification
    // アサインメントに有効なトークンがある場合、生トークンが必要
    // 残念ながらハッシュから生トークンを取得することはできない
    // そのため、通知を送信するたびに新しいトークンを生成する必要がある
    if (!accessToken) {
      const { rawToken, tokenHash, expiresAt } = generateUploadToken(30);

      // Update the assignment with the new token
      // アサインメントを新しいトークンで更新
      if (taskAssignment.data) {
        await supabase
          .from('designer_task_assignments')
          .update({
            access_token_hash: tokenHash,
            access_token_expires_at: expiresAt.toISOString(),
          })
          .eq('id', taskAssignment.data.id);
      }

      accessToken = rawToken;
      console.log('[Designer Notify] Generated fresh access token for notification');
    }

    // Get uploaded files
    const { data: files } = await supabase
      .from('files')
      .select('original_filename, file_type, uploaded_at')
      .eq('order_id', orderId)
      .order('uploaded_at', { ascending: false });

    // Get order items with specifications
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('id, product_name, specifications')
      .eq('order_id', orderId);

    // Get designer emails
    const { data: designerSettings } = await supabase
      .from('notification_settings')
      .select('value')
      .eq('key', 'korea_designer_emails')
      .maybeSingle();

    const designerEmails: string[] = designerSettings?.value || [];

    if (designerEmails.length === 0) {
      return NextResponse.json({ error: 'No designer emails configured' }, { status: 400 });
    }

    // Send notifications to all designers
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://package-lab.com';
    const results = [];

    // Get specifications from first order item (or combine all)
    const specs = orderItems && orderItems.length > 0 ? orderItems[0].specifications : undefined;

    // Translate specifications to Korean
    const translateSpecs = (specs: any) => {
      if (!specs) return undefined;
      return {
        dimensions: specs.dimensions,
        bagType: specs.bagTypeId === 'stand_up' ? '스탠드 파우치' :
                 specs.bagTypeId === 'flat_pouch' ? '플랫 파우치' : specs.bagTypeId,
        material: specs.materialId === 'pet_al' ? 'PET/AL (알루미늄 박 라미네이트)' :
                  specs.materialId === 'pet' ? 'PET' : specs.materialId,
        materialDetail: specs.materialId === 'pet_al' ? 'PET 12μ + AL 7μ + PET 12μ + LLDPE 80μ' : undefined,
        weight: specs.thicknessSelection === 'medium' ? '~500g' :
                 specs.thicknessSelection === 'light' ? '~300g' :
                 specs.thicknessSelection === 'heavy' ? '~1kg' : undefined,
        thickness: specs.thicknessSelection === 'medium' ? '표준 타입 (~500g)' :
                    specs.thicknessSelection === 'light' ? '경량 (~300g)' :
                    specs.thicknessSelection === 'heavy' ? '중량 (~1kg)' : undefined,
        thicknessDetail: specs.materialId === 'pet_al' ? 'PET 12μ + AL 7μ + PET 12μ + LLDPE 80μ' : undefined,
        printingType: specs.printingType === 'digital' ? '디지털 인쇄' :
                      specs.printingType === 'gravure' ? '그라비아 인쇄' : specs.printingType,
        colors: specs.printingColors === 1 ? '1색' :
                specs.printingColors === 2 ? '2색' :
                specs.printingColors === 4 ? '4색' : '풀 컬러',
        urgency: specs.urgency === 'standard' ? '표준' :
                  specs.urgency === 'urgent' ? '긴급' :
                  specs.urgency === 'express' ? '특급' : specs.urgency,
        deliveryLocation: specs.deliveryLocation === 'domestic' ? '국내' :
                          specs.deliveryLocation === 'international' ? '해외' : specs.deliveryLocation,
        postProcessing: specs.postProcessingOptions?.map((opt: string) => {
          const map: Record<string, string> = {
            'corner-round': '모서리 둥글게',
            'glossy': '광택 처리',
            'matte': '무광 처리',
            'hang-hole-6mm': '걸이 구멍 6mm',
            'hang-hole-4mm': '걸이 구멍 4mm',
            'machi-printing-yes': '마치 인쇄 있음',
            'machi-printing-no': '마치 인쇄 없음',
            'notch-yes': 'V 노치',
            'notch-no': 'V 노치 없음',
            'sealing-width-5mm': '밀봉폭 5mm',
            'sealing-width-8mm': '밀봉폭 8mm',
            'sealing-width-10mm': '밀봉폭 10mm',
            'top-open': '상단 개봉',
            'bottom-open': '하단 개봉',
            'side-open': '측면 개봉',
            'valve-yes': '밸브 있음',
            'valve-no': '밸브 없음',
            'zipper-yes': '지퍼 있음',
            'zipper-no': '지퍼 없음',
          };
          return map[opt] || opt;
        }),
      };
    };

    const translatedSpecs = specs ? translateSpecs(specs) : undefined;

    for (const designerEmail of designerEmails) {
      // Send notification for each file
      for (const file of files || []) {
        const result = await sendDesignerDataUploadNotification({
          to: designerEmail,
          orderNumber: order.order_number,
          customerName: order.customer_name || 'お客様',
          fileName: file.original_filename,
          uploadUrl: `${baseUrl}/designer/orders/${orderId}`, // Fallback URL
          uploadedAt: file.uploaded_at,
          fileType: file.file_type,
          productName: orderItems && orderItems.length > 0 ? orderItems[0].product_name : undefined,
          specifications: translatedSpecs,
          // Use token-based URL for Korean designers
          // 韓国人デザイナーにはトークンベースURLを使用
          useTokenUrl: !!accessToken,
          accessToken: accessToken,
        });

        results.push({
          email: designerEmail,
          file: file.original_filename,
          success: result.success,
          error: result.error,
        });
      }
    }

    return NextResponse.json({
      success: true,
      order: order.order_number,
      results,
      message: `Sent ${results.length} notifications to ${designerEmails.length} designers`,
    });

  } catch (error) {
    console.error('[Designer Notify] Error:', error);
    return NextResponse.json(
      { error: 'Failed to send notifications', details: String(error) },
      { status: 500 }
    );
  }
}
