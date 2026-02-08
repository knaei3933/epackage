/**
 * Admin Order Comments API
 *
 * 管理者注文コメントAPI
 * - POST: 管理者がコメントを追加し、顧客にメール通知を送信
 *
 * @route /api/admin/orders/[id]/comments
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseSSRClient } from '@/lib/supabase-ssr';
import { createServiceClient } from '@/lib/supabase';
import { sendCustomEmail } from '@/lib/email/epack-mailer';
import { createCommentSchema, safeParseRequestBody } from '@/types/api-validation';
import { getAuditLogger } from '@/lib/audit-logger';

// ============================================================
// Constants
// ============================================================

// Admin roles that can access this endpoint
const ADMIN_ROLES = ['ADMIN', 'OPERATOR', 'SALES', 'ACCOUNTING'];

// Email configuration
const FROM_EMAIL = process.env.FROM_EMAIL || 'info@package-lab.com';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://package-lab.com';

// ============================================================
// Types
// ============================================================

interface CreateCommentRequest {
  content: string;
  comment_type?: 'general' | 'production' | 'shipping' | 'billing' | 'correction' | 'internal';
  parent_comment_id?: string;
  attachments?: string[];
  notify_customer?: boolean; // 顧客にメール通知するかどうか
}

interface CreateCommentResponse {
  success: boolean;
  data?: any;
  error?: string;
  errorEn?: string;
  emailSent?: boolean;
}

// ============================================================
// POST Handler - Create Admin Comment with Email Notification
// ============================================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('[Admin Order Comments POST] ===== START =====');

  try {
    const { id: orderId } = await params;
    console.log('[Admin Order Comments POST] Order ID:', orderId);

    const { client: supabase } = createSupabaseSSRClient(request);

    // Get current user
    console.log('[Admin Order Comments POST] Getting user...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: '認証されていません。', errorEn: 'Not authenticated' },
        { status: 401 }
      );
    }

    const userId = user.id;

    // Get user profile to check role
    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('role, kanji_last_name, kanji_first_name, kana_last_name, kana_first_name, company_name, email')
      .eq('id', userId)
      .single();

    // Check if user has admin role
    const isAdmin = profile && profile.role && ADMIN_ROLES.includes(profile.role);

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: '管理者権限が必要です。', errorEn: 'Admin access required' },
        { status: 403 }
      );
    }

    // Use service role client to bypass RLS
    const dataClient = createServiceClient();

    // Get order details for email
    const { data: order, error: orderError } = await dataClient
      .from('orders')
      .select('id, order_number, user_id, customer_name, customer_email, status')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, error: '注文が見つかりません。', errorEn: 'Order not found' },
        { status: 404 }
      );
    }

    // Parse and validate request body using Zod
    const body = await request.json();
    const validationResult = safeParseRequestBody(createCommentSchema, body);

    if (validationResult.error) {
      return NextResponse.json(validationResult.error, { status: 400 });
    }

    const {
      content,
      comment_type = 'general',
      parent_comment_id,
      attachments = [],
      notify_customer = true // デフォルトで通知を送信
    } = validationResult.data as CreateCommentRequest;

    // Verify parent comment exists if provided
    if (parent_comment_id) {
      const { data: parentComment, error: parentError } = await dataClient
        .from('order_comments')
        .select('id')
        .eq('id', parent_comment_id)
        .single();

      if (parentError || !parentComment) {
        return NextResponse.json(
          { success: false, error: '親コメントが見つかりません。', errorEn: 'Parent comment not found' },
          { status: 404 }
        );
      }
    }

    // Create admin comment
    const adminDisplayName = profile.kanji_last_name && profile.kanji_first_name
      ? `${profile.kanji_last_name} ${profile.kanji_first_name}`
      : profile.company_name || '管理者';

    const { data: newComment, error: createError } = await dataClient
      .from('order_comments')
      .insert({
        order_id: orderId,
        content: content.trim(),
        comment_type,
        author_id: userId,
        author_role: 'admin',
        is_internal: comment_type === 'internal',
        attachments,
        parent_comment_id: parent_comment_id || null,
        metadata: {},
      })
      .select('*')
      .single();

    if (createError) {
      console.error('[Admin Order Comments POST] Error:', createError);

      const auditLogger = getAuditLogger();
      await auditLogger.log({
        event_type: 'error_occurred',
        resource_type: 'other',
        resource_id: orderId,
        user_id: userId,
        ip_address: request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
                   request.headers.get('x-real-ip') || undefined,
        user_agent: request.headers.get('user-agent') || undefined,
        outcome: 'failure',
        error_message: createError.message,
        details: {
          action: 'create_admin_comment',
          order_id: orderId,
          comment_type,
        },
      }).catch(err => console.error('[Audit Log] Failed to log error:', err));

      return NextResponse.json(
        { success: false, error: 'コメントの作成に失敗しました。', errorEn: 'Failed to create comment' },
        { status: 500 }
      );
    }

    // Attach author info to response
    if (newComment) {
      (newComment as any).author = {
        id: profile.id,
        full_name: adminDisplayName,
        email: profile.email,
        avatar_url: null,
        role: profile.role
      };
    }

    // Send email notification to customer if requested
    let emailSent = false;
    if (notify_customer && order.customer_email && comment_type !== 'internal') {
      try {
        const orderDetailUrl = `${SITE_URL}/member/orders/${orderId}`;

        // Create email content
        const emailSubject = `注文 #${order.order_number} にコメントが追加されました`;

        const emailHtml = `
          <!DOCTYPE html>
          <html lang="ja">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>注文コメント通知</title>
            <style>
              body {
                font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f5f5f5;
                margin: 0;
                padding: 20px;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background: white;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              }
              .header {
                background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%);
                color: white;
                padding: 30px 20px;
                text-align: center;
              }
              .header h1 {
                margin: 0;
                font-size: 24px;
                font-weight: bold;
              }
              .content {
                padding: 30px 20px;
              }
              .order-info {
                background: #f7fafc;
                border-left: 4px solid #2c5282;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
              }
              .order-info p {
                margin: 5px 0;
                font-size: 14px;
              }
              .order-info strong {
                color: #2d3748;
              }
              .comment-box {
                background: #fffbeb;
                border: 1px solid #fcd34d;
                border-radius: 6px;
                padding: 15px;
                margin: 20px 0;
              }
              .comment-box .label {
                font-size: 12px;
                color: #92400e;
                font-weight: bold;
                margin-bottom: 8px;
              }
              .comment-box .content {
                background: white;
                padding: 12px;
                border-radius: 4px;
                font-size: 14px;
                line-height: 1.6;
                white-space: pre-wrap;
              }
              .button-container {
                text-align: center;
                margin: 30px 0;
              }
              .button {
                display: inline-block;
                background: #2c5282;
                color: white;
                text-decoration: none;
                padding: 12px 30px;
                border-radius: 6px;
                font-weight: bold;
                transition: background 0.3s;
              }
              .button:hover {
                background: #2a4365;
              }
              .footer {
                background: #f7fafc;
                padding: 20px;
                text-align: center;
                font-size: 12px;
                color: #718096;
                border-top: 1px solid #e2e8f0;
              }
              .footer a {
                color: #4299e1;
                text-decoration: none;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>注文コメント通知</h1>
              </div>
              <div class="content">
                <p style="font-size: 16px; margin: 0 0 20px 0;">
                  ${order.customer_name || 'お客様'}様
                </p>
                <p style="font-size: 14px; line-height: 1.8; margin: 0 0 20px 0;">
                  ご注文のコメント欄に、新しいコメントが追加されました。<br>
                  内容をご確認ください。
                </p>

                <div class="order-info">
                  <p><strong>注文番号:</strong> ${order.order_number}</p>
                  <p><strong>コメント担当者:</strong> ${adminDisplayName}</p>
                  <p><strong>投稿日時:</strong> ${new Date().toLocaleString('ja-JP')}</p>
                </div>

                <div class="comment-box">
                  <div class="label">コメント内容</div>
                  <div class="content">${content.replace(/\n/g, '<br>')}</div>
                </div>

                <div class="button-container">
                  <a href="${orderDetailUrl}" class="button">注文詳細を確認する</a>
                </div>

                <p style="font-size: 12px; color: #718096; text-align: center; margin: 30px 0 0 0;">
                  このメールはシステムから自動送信されています。<br>
                  ご質問がある場合は、注文詳細ページからコメントをお願いいたします。
                </p>
              </div>
              <div class="footer">
                <p style="margin: 0 0 10px 0;">
                  <a href="${SITE_URL}">イーパックラボ (EPackage Lab)</a>
                </p>
                <p style="margin: 0;">
                  &copy; ${new Date().getFullYear()} EPackage Lab. All rights reserved.
                </p>
              </div>
            </div>
          </body>
          </html>
        `;

        const emailText = `
================================================================
注文コメント通知
================================================================

${order.customer_name || 'お客様'}様

ご注文のコメント欄に、新しいコメントが追加されました。

------------------------------------------------
注文番号: ${order.order_number}
コメント担当者: ${adminDisplayName}
投稿日時: ${new Date().toLocaleString('ja-JP')}
------------------------------------------------

【コメント内容】
${content}

------------------------------------------------
注文詳細を確認:
${orderDetailUrl}
------------------------------------------------

このメールはシステムから自動送信されています。
ご質問がある場合は、注文詳細ページからコメントをお願いいたします。

================================================================
イーパックラボ (EPackage Lab)
${SITE_URL}
Copyright (c) ${new Date().getFullYear()} EPackage Lab. All rights reserved.
================================================================
        `;

        // Send email using epack-mailer
        const emailResult = await sendCustomEmail(
          { email: order.customer_email, name: order.customer_name || undefined },
          emailSubject,
          { html: emailHtml, text: emailText }
        );

        emailSent = emailResult.success;

        if (emailResult.success) {
          console.log('[Admin Order Comments POST] Email notification sent successfully to:', order.customer_email);
        } else {
          console.error('[Admin Order Comments POST] Failed to send email notification:', emailResult.error);
        }
      } catch (emailError) {
        console.error('[Admin Order Comments POST] Email error:', emailError);
        // Email failure should not fail the entire request
      }
    }

    // Log audit for successful comment creation
    const auditLogger = getAuditLogger();
    await auditLogger.log({
      event_type: 'data_modification',
      resource_type: 'other',
      resource_id: newComment?.id,
      user_id: userId,
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
                 request.headers.get('x-real-ip') || undefined,
      user_agent: request.headers.get('user-agent') || undefined,
      outcome: 'success',
      details: {
        action: 'create_admin_comment',
        order_id: orderId,
        comment_type,
        author_role: 'admin',
        email_notification_sent: emailSent,
        has_parent_comment: !!parent_comment_id,
        has_attachments: attachments && attachments.length > 0,
      },
    }).catch(err => console.error('[Audit Log] Failed to log success:', err));

    const response: CreateCommentResponse = {
      success: true,
      data: newComment,
      emailSent,
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('[Admin Order Comments POST] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: '予期しないエラーが発生しました。', errorEn: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS - CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
