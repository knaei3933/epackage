/**
 * Admin Designer Notification API
 *
 * デザイナー通知API（韓国人デザイナー向け）
 * - 校正データの却下時にデザイナーへメール通知
 * - revision_notificationsテーブルに通知履歴を保存
 *
 * @route /api/admin/orders/[id]/notify-designer-rejection
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendCustomEmail } from '@/lib/email/epack-mailer';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// ============================================================
// Type Definitions
// ============================================================

interface NotifyDesignerRequest {
  revisionId: string;
  rejectionReason: string;
  notifyDesigner: boolean;
}

interface NotifyDesignerResponse {
  success: boolean;
  notification?: {
    id: string;
    sent_at: string;
    recipient_email: string;
    message_id?: string;
  };
  error?: string;
}

// ============================================================
// POST Handler - Send Designer Notification
// ============================================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    console.log('[Designer Notification] Starting notification process...');

    const { id: orderId } = await params;
    const body: NotifyDesignerRequest = await request.json();

    // Validate request
    if (!body.revisionId || !body.rejectionReason) {
      return NextResponse.json(
        {
          success: false,
          error: '必須パラメータが不足しています。',
        } as NotifyDesignerResponse,
        { status: 400 }
      );
    }

    // Get revision data
    const { data: revision, error: revisionError } = await supabase
      .from('design_revisions')
      .select(`
        id,
        revision_number,
        order_id
      `)
      .eq('id', body.revisionId)
      .single();

    if (revisionError || !revision) {
      console.error('[Designer Notification] Revision fetch error:', revisionError);
      return NextResponse.json(
        {
          success: false,
          error: '校正データが見つかりません。',
        } as NotifyDesignerResponse,
        { status: 404 }
      );
    }

    // Get order data
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('order_number')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('[Designer Notification] Order fetch error:', orderError);
      return NextResponse.json(
        {
          success: false,
          error: '注文が見つかりません。',
        } as NotifyDesignerResponse,
        { status: 404 }
      );
    }

    // Get customer file info (latest submission)
    const { data: customerFile, error: fileError } = await supabase
      .from('customer_file_submissions')
      .select('designer_name, designer_email')
      .eq('order_id', orderId)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fileError) {
      console.error('[Designer Notification] Customer file fetch error:', fileError);
    }

    // Extract designer info
    const designerName = customerFile?.designer_name || 'Designer';
    const designerEmail = customerFile?.designer_email;

    if (!designerEmail) {
      return NextResponse.json(
        {
          success: false,
          error: 'デザイナーのメールアドレスが見つかりません。',
        } as NotifyDesignerResponse,
        { status: 400 }
      );
    }

    const orderNumber = order.order_number;

    // Prepare email content in Korean
    const uploadUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/orders/${orderId}/correction`;

    const emailSubject = `[Epackage Lab] 교정 데이터가 반려되었습니다 - ${orderNumber}`;
    const emailHtml = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .info-box { background: white; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .reason-box { background: #fef2f2; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 3px solid #ef4444; }
    .button { display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>교정 데이터 반려 알림</h1>
    </div>
    <div class="content">
      <p>${designerName} 님께,</p>
      <p>교정하신 데이터가 검토 후 반려되었습니다.</p>

      <div class="info-box">
        <h3 style="margin-top: 0;">반려 정보</h3>
        <p><strong>주문 번호:</strong> ${orderNumber}</p>
      </div>

      <div class="reason-box">
        <strong>반려 사유:</strong><br>
        ${body.rejectionReason}
      </div>

      <p style="text-align: center; margin-top: 30px;">반려 사유를 확인하시고 수정하여 다시 업로드해 주세요.</p>

      <div style="text-align: center;">
        <a href="${uploadUrl}" class="button">다시 업로드하기</a>
      </div>
    </div>
    <div class="footer">
      <p>본 메일은 시스템에 의해 자동 발송됩니다.</p>
      <p>문의: support@epackage-lab.com</p>
      <p>© ${new Date().getFullYear()} Epackage Lab. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    const emailText = `
${designerName} 님께,

교정하신 데이터가 검토 후 반려되었습니다.

====================
반려 정보
====================

주문 번호: ${orderNumber}
반려 사유: ${body.rejectionReason}

--------------------
반려 사유를 확인하시고 수정하여 다시 업로드해 주세요.

다시 업로드하기:
${uploadUrl}

--------------------
Epackage Lab B2B 시스템
본 메일은 시스템에 의해 자동 발송됩니다.
문의: support@epackage-lab.com
--------------------
    `.trim();

    // Send email if notifyDesigner is true
    let messageId: string | undefined;
    let emailError: string | undefined;

    if (body.notifyDesigner) {
      const emailResult = await sendCustomEmail(
        designerEmail,
        emailSubject,
        { html: emailHtml, text: emailText }
      );

      if (!emailResult.success) {
        emailError = emailResult.error;
        console.error('[Designer Notification] Email send error:', emailError);
      } else {
        messageId = emailResult.messageId;
        console.log('[Designer Notification] Email sent successfully:', messageId);
      }
    }

    // Store notification record in database
    const now = new Date().toISOString();
    const { data: notification, error: notificationError } = await supabase
      .from('revision_notifications')
      .insert({
        revision_id: body.revisionId,
        notification_type: 'rejected',
        recipient_email: designerEmail,
        recipient_role: 'designer',
        status: emailError ? 'failed' : (body.notifyDesigner ? 'sent' : 'pending'),
        sent_at: body.notifyDesigner && !emailError ? now : null,
        error_message: emailError || null,
        subject: emailSubject,
        body_html: emailHtml,
      })
      .select()
      .single();

    if (notificationError) {
      console.error('[Designer Notification] Database insert error:', notificationError);
      return NextResponse.json(
        {
          success: false,
          error: '通知記録の保存に失敗しました。',
        } as NotifyDesignerResponse,
        { status: 500 }
      );
    }

    console.log('[Designer Notification] Notification record created:', notification.id);

    return NextResponse.json({
      success: true,
      notification: {
        id: notification.id,
        sent_at: notification.sent_at || now,
        recipient_email: notification.recipient_email,
        message_id: messageId,
      },
    } as NotifyDesignerResponse);

  } catch (error) {
    console.error('[Designer Notification] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: '予期しないエラーが発生しました。',
      } as NotifyDesignerResponse,
      { status: 500 }
    );
  }
}

// ============================================================
// GET Handler - Fetch Notification History
// ============================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { id: orderId } = await params;
    const { searchParams } = new URL(request.url);
    const revisionId = searchParams.get('revisionId');

    if (!revisionId) {
      return NextResponse.json(
        { success: false, error: 'revisionIdパラメータが必要です。' },
        { status: 400 }
      );
    }

    // Fetch notification history for this revision
    const { data: notifications, error } = await supabase
      .from('revision_notifications')
      .select('*')
      .eq('revision_id', revisionId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Designer Notification] Fetch error:', error);
      return NextResponse.json(
        { success: false, error: '通知履歴の取得に失敗しました。' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      notifications: notifications || [],
    });

  } catch (error) {
    console.error('[Designer Notification] GET Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: '予期しないエラーが発生しました。',
      },
      { status: 500 }
    );
  }
}

// ============================================================
// OPTIONS Handler for CORS
// ============================================================

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
