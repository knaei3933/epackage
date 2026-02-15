/**
 * Admin Order Comments API
 *
 * 管理者注文コメントAPI
 * - GET: 注文コメントリストの取得
 * - POST: 管理者がコメントを追加し、顧客にメール通知を送信
 *
 * @route /api/admin/orders/[id]/comments
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { sendCustomEmail } from '@/lib/email/epack-mailer';
import { createCommentSchema, safeParseRequestBody } from '@/types/api-validation';
import { getAuditLogger } from '@/lib/audit-logger';
import { withAdminAuth } from '@/lib/api-auth';
import { generateOrderCommentEmailHtml } from '@/lib/email-templates/order-comment-notification';

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

interface OrderComment {
  id: string;
  order_id: string;
  content: string;
  comment_type: string;
  author_id: string;
  author_role: 'customer' | 'admin' | 'korean_member' | 'production';
  is_internal: boolean;
  visibility?: 'all' | 'admin_only' | 'korean_only';
  attachments: string[];
  parent_comment_id: string | null;
  created_at: string;
  updated_at: string;
  metadata: Record<string, any>;
  author?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
}

interface CreateCommentRequest {
  content: string;
  comment_type?: 'general' | 'production' | 'shipping' | 'billing' | 'correction' | 'internal';
  parent_comment_id?: string;
  attachments?: string[];
  notify_customer?: boolean;
}

interface CreateCommentResponse {
  success: boolean;
  data?: any;
  error?: string;
  errorEn?: string;
  emailSent?: boolean;
}

interface GetCommentsResponse {
  success: boolean;
  data?: OrderComment[];
  error?: string;
  errorEn?: string;
}

// ============================================================
// GET Handler - List Order Comments (Admin)
// ============================================================

export const GET = withAdminAuth(async (
  request: NextRequest,
  auth
) => {
  const { id: orderId } = await (request as any).params;
  console.log('[Admin Order Comments GET] Order ID:', orderId);
  console.log('[Admin Order Comments GET] Authenticated user:', auth.userId);

  // Use service client to bypass RLS
  const supabase = createServiceClient();

  // Fetch all comments (admin sees everything)
  const { data: comments, error: commentsError } = await supabase
    .from('order_comments')
    .select('*')
    .eq('order_id', orderId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (commentsError) {
    console.error('[Admin Order Comments GET] DB Error:', commentsError);

    // Check if table doesn't exist
    if (commentsError.code === '42P01' || commentsError.message?.includes('does not exist')) {
      console.log('[Admin Order Comments GET] Table does not exist, returning empty array');
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'コメントの取得に失敗しました。',
        errorEn: 'Failed to fetch comments',
        details: commentsError.message,
      },
      { status: 500 }
    );
  }

  // If there are comments, fetch author information
  if (comments && comments.length > 0) {
    const authorIds = Array.from(new Set(comments.map((c: any) => c.author_id)));
    const { data: authors } = await supabase
      .from('profiles')
      .select('id, kanji_last_name, kanji_first_name, kana_last_name, kana_first_name, email, company_name, role')
      .in('id', authorIds);

    const authorMap = new Map((authors || []).map((a: any) => {
      const displayName = a.kanji_last_name && a.kanji_first_name
        ? `${a.kanji_last_name} ${a.kanji_first_name}`
        : a.company_name || a.email || '不明';
      return [a.id, {
        id: a.id,
        full_name: displayName,
        email: a.email,
        avatar_url: null,
        role: a.role
      }];
    }));

    // Attach author info to each comment
    (comments as any[]).forEach((comment) => {
      comment.author = authorMap.get(comment.author_id);
    });
  }

  const response: GetCommentsResponse = {
    success: true,
    data: comments as OrderComment[],
  };

  return NextResponse.json(response, { status: 200 });
});

// ============================================================
// POST Handler - Create Admin Comment with Email Notification
// ============================================================

export const POST = withAdminAuth(async (
  request: NextRequest,
  auth
) => {
  const { id: orderId } = await (request as any).params;
  console.log('[Admin Order Comments POST] Order ID:', orderId);

  // Use service client to bypass RLS
  const supabase = createServiceClient();

  // Get order details for email
  const { data: order, error: orderError } = await supabase
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
    notify_customer = true
  } = validationResult.data as CreateCommentRequest;

  // Verify parent comment exists if provided
  if (parent_comment_id) {
    const { data: parentComment, error: parentError } = await supabase
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

  // Get admin profile for display name
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, kanji_last_name, kanji_first_name, company_name, email')
    .eq('id', auth.userId)
    .single();

  const adminDisplayName = profile?.kanji_last_name && profile?.kanji_first_name
    ? `${profile.kanji_last_name} ${profile.kanji_first_name}`
    : profile?.company_name || '管理者';

  // Create admin comment
  const { data: newComment, error: createError } = await supabase
    .from('order_comments')
    .insert({
      order_id: orderId,
      content: content.trim(),
      comment_type,
      author_id: auth.userId,
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
      user_id: auth.userId,
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
      id: auth.userId,
      full_name: adminDisplayName,
      email: profile?.email || '',
      avatar_url: null,
      role: 'ADMIN'
    };
  }

  // Send email notification to customer if requested
  let emailSent = false;
  if (notify_customer && order.customer_email && comment_type !== 'internal') {
    try {
      // Create email content using template function
      const emailSubject = `注文 #${order.order_number} にコメントが追加されました`;
      const emailHtml = generateOrderCommentEmailHtml({
        orderId,
        orderNumber: order.order_number,
        customerName: order.customer_name,
        adminDisplayName,
        commentContent: content,
        siteUrl: SITE_URL,
      });

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
${SITE_URL}/member/orders/${orderId}
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
    user_id: auth.userId,
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
});

// ============================================================
// OPTIONS - CORS preflight
// ============================================================

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
