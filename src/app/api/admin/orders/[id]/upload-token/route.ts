/**
 * Admin Upload Token Generation API Route
 *
 * 管理者用アップロードトークン生成 API
 * - POST: トークン生成 (管理者専用)
 * - 30日間有効なトークンを生成してデザイナーにメール送信
 *
 * Features:
 * - Generate secure 256-bit upload tokens
 * - 30-day token expiration
 * - Optional email notification to designer (Korean)
 * - Link to designer_task_assignments
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createAuthenticatedServiceClient } from '@/lib/supabase-authenticated';
import { verifyAdminAuth } from '@/lib/auth-helpers';
import { generateUploadToken } from '@/lib/designer-tokens';
import { sendTemplatedEmail, createRecipient } from '@/lib/email';
import type { DesignerTokenUploadEmailData } from '@/lib/email-templates';

// ============================================================
// Types
// ============================================================

interface CreateTokenRequest {
  designer_id?: string;        // Optional: specific designer
  expires_in_days?: number;    // Default: 30 (changed from 7)
  send_email?: boolean;        // Default: true
  designer_email?: string;     // Required if send_email is true
  designer_name?: string;      // For email personalization
}

interface CreateTokenResponse {
  success: true;
  token: {
    id: string;
    token_prefix: string;
    expires_at: string;
    upload_url: string;
  };
  email_sent?: boolean;
}

// ============================================================
// POST: アップロードトークン生成（管理者専用）
// ============================================================

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // 管理者認証チェック
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return NextResponse.json(
        { error: '管理者権限が必要です。' },
        { status: 401 }
      );
    }

    const params = await context.params;
    const { id: orderId } = params;

    console.log('[Admin Upload Token] ========================================');
    console.log('[Admin Upload Token] POST request received');
    console.log('[Admin Upload Token] Order ID:', orderId);
    console.log('[Admin Upload Token] Admin User ID:', auth.userId);

    // Parse request body
    const body = await request.json() as CreateTokenRequest;
    const {
      designer_id,
      expires_in_days = 30,
      send_email = true,
      designer_email = process.env.DEFAULT_DESIGNER_EMAIL || 'arwg22@gmail.com',
      designer_name = process.env.DEFAULT_DESIGNER_NAME || 'Korean Designer',
    } = body;

    // Validate: if send_email is true, designer_email is required
    if (send_email && !designer_email) {
      return NextResponse.json(
        { error: 'designer_emailは必須です（send_emailがtrueの場合）' },
        { status: 400 }
      );
    }

    // Validate expires_in_days
    if (expires_in_days < 1 || expires_in_days > 365) {
      return NextResponse.json(
        { error: 'expires_in_daysは1〜365日の範囲で指定してください' },
        { status: 400 }
      );
    }

    // Service clientを使用（RLS回避、監査ログ付き）
    const supabase = createAuthenticatedServiceClient({
      operation: 'generate_upload_token',
      userId: auth.userId,
      route: '/api/admin/orders/[id]/upload-token',
    });
    console.log('[Admin Upload Token] Authenticated service client created');

    // Verify order exists
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, order_number, user_id')
      .eq('id', orderId)
      .single();

    console.log('[Admin Upload Token] Order query result:', {
      found: !!order,
      orderNumber: order?.order_number,
      error: orderError?.message
    });

    if (orderError || !order) {
      console.error('[Admin Upload Token] Order not found:', orderError);
      return NextResponse.json(
        { error: '注文が見つかりませんでした。' },
        { status: 404 }
      );
    }

    // Get customer name for email
    let customerName = 'お客様';
    if (order.customer_id) {
      const { data: customer } = await supabase
        .from('profiles')
        .select('kanji_last_name, kanji_first_name')
        .eq('id', order.customer_id)
        .single();
      if (customer) {
        customerName = `${customer.kanji_last_name} ${customer.kanji_first_name}`;
      }
    }

    // Generate token using utility function
    const { rawToken, tokenHash, tokenPrefix, expiresAt } = generateUploadToken(expires_in_days);

    console.log('[Admin Upload Token] Token generated:', {
      prefix: tokenPrefix,
      expiresAt: expiresAt.toISOString(),
      expiresInDays: expires_in_days
    });

    // Build upload URL
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://package-lab.com';
    const uploadUrl = `${siteUrl}/upload/${rawToken}`;

    // Insert token record into database
    const tokenRecord = {
      token_hash: tokenHash,
      token_prefix: tokenPrefix,
      order_id: orderId,
      designer_id: designer_id || null,
      designer_name: designer_name || null,
      designer_email: designer_email || null,
      expires_at: expiresAt.toISOString(),
      created_by: auth.userId, // Use authenticated admin user ID
    };

    const { data: insertedToken, error: insertError } = await supabase
      .from('designer_upload_tokens')
      .insert(tokenRecord)
      .select('id, token_prefix, expires_at')
      .single();

    if (insertError || !insertedToken) {
      console.error('[Admin Upload Token] Failed to insert token:', insertError);
      // 開発環境では詳細なエラー情報を返す
      const errorResponse: any = { error: 'トークンの保存に失敗しました。' };
      if (process.env.NODE_ENV === 'development') {
        errorResponse.details = insertError;
        errorResponse.code = insertError?.code;
        errorResponse.message = insertError?.message;
        errorResponse.hint = insertError?.hint;
      }
      return NextResponse.json(errorResponse, { status: 500 });
    }

    console.log('[Admin Upload Token] Token saved:', {
      id: insertedToken.id,
      prefix: insertedToken.token_prefix
    });

    // Send email if requested
    let emailSent = false;
    if (send_email && designer_email) {
      try {
        const recipient = createRecipient(
          designer_name || 'Designer',
          designer_email
        );

        const emailData: DesignerTokenUploadEmailData = {
          recipient,
          uploadUrl,
          orderNumber: order.order_number,
          customerName,
          expiresAt: expiresAt.toISOString(),
          expiresInDays: expires_in_days,
          designerName: designer_name || recipient.name,
        };

        const emailResult = await sendTemplatedEmail('designer_token_upload', emailData, recipient);

        if (emailResult.success) {
          emailSent = true;
          console.log('[Admin Upload Token] Email sent successfully:', {
            to: designer_email,
            messageId: emailResult.messageId
          });
        } else {
          console.warn('[Admin Upload Token] Email send failed:', emailResult.error);
        }
      } catch (emailError: any) {
        console.error('[Admin Upload Token] Email error:', emailError.message);
        // Don't fail the request if email fails
      }
    }

    const response: CreateTokenResponse = {
      success: true,
      token: {
        id: insertedToken.id,
        token_prefix: insertedToken.token_prefix,
        expires_at: insertedToken.expires_at,
        upload_url: uploadUrl,
      },
      email_sent: emailSent,
    };

    console.log('[Admin Upload Token] Token created successfully:', {
      tokenId: insertedToken.id,
      tokenPrefix: insertedToken.token_prefix,
      emailSent
    });

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('[Admin Upload Token] POST error:', error);

    return NextResponse.json(
      {
        error: 'トークンの生成に失敗しました。',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================
// OPTIONS: CORS preflight
// ============================================================

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// ============================================================
// Helper: System user ID for token creation
// ============================================================

/**
 * Get or create system user ID for audit trail
 * In production, this should reference a real system user
 */
function systemUserId(): string {
  // For now, use a placeholder UUID
  // In production, you should either:
  // 1. Create a dedicated system user in the profiles table
  // 2. Pass the actual admin user ID from the request headers
  const SYSTEM_USER_ID = process.env.SYSTEM_USER_ID || '00000000-0000-0000-0000-000000000000';
  return SYSTEM_USER_ID;
}
