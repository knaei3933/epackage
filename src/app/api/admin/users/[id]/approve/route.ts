/**
 * Admin User Approval API
 *
 * 管理者ユーザー承認API
 * - POST: PENDING状態のユーザーをACTIVEに承認
 * - REJECT: ユーザー登録拒否
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseSSRClient } from '@/lib/supabase-ssr';
import { Database } from '@/types/database';
import { z } from 'zod';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';

// ============================================================
// Types
// ============================================================

interface ApprovalRequestBody {
  action: 'approve' | 'reject';
  reason?: string;
}

interface ApprovalResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    status: string;
    role: string;
  };
  error?: string;
}

// ============================================================
// Validation Schema
// ============================================================

const approvalSchema = z.object({
  action: z.enum(['approve', 'reject']),
  reason: z.string().optional(),
});

// ============================================================
// Helper Functions
// ============================================================

/**
 * Check if current user is admin
 */
async function isAdmin(
  supabase: any,
  userId: string
): Promise<boolean> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  return profile?.role?.toLowerCase() === 'admin';
}

/**
 * Send approval notification email
 */
async function sendApprovalEmail(
  email: string,
  userName: string,
  status: 'approved' | 'rejected',
  reason?: string
): Promise<void> {
  try {
    const appUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.package-lab.com';
    const { sendCustomEmail } = await import('@/lib/email');

    if (status === 'approved') {
      // Import user approved template
      const { subject: subjectUserApproved, plainText: plainTextUserApproved, html: htmlUserApproved } = await import('@/lib/email/templates/user_approved');

      const approvedAt = new Date().toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });

      await sendCustomEmail(
        email,
        subjectUserApproved({
          user_name: userName,
          user_email: email,
          approved_at: approvedAt,
          login_url: `${appUrl}/auth/login`
        }),
        {
          html: htmlUserApproved({
            user_name: userName,
            user_email: email,
            approved_at: approvedAt,
            login_url: `${appUrl}/auth/login`
          }),
          text: plainTextUserApproved({
            user_name: userName,
            user_email: email,
            approved_at: approvedAt,
            login_url: `${appUrl}/auth/login`
          })
        }
      );

      console.log('[User Approval] Approval email sent to:', email);
    } else {
      // Rejection email
      const subject = '[EPackage Lab] 会員登録につきまして';
      const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .info-box { background: white; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>会員登録審査結果</h1>
    </div>
    <div class="content">
      <p>${userName} 様</p>
      <p>この度は、EPackage Labへのご登録ありがとうございます。</p>

      <div class="info-box">
        <h3>審査結果</h3>
        <p>誠に恐れ入りますが、今回のお申し込みは承認を見送らせていただくこととなりました。</p>
        ${reason ? `<p><strong>理由:</strong> ${reason}</p>` : ''}
      </div>

      <p>何卒ご容赦いただきますようお願い申し上げます。</p>
    </div>
    <div class="footer">
      <p>このメールはシステムにより自動送信されています。</p>
      <p>お問い合わせ: support@epackage-lab.com</p>
      <p>© ${new Date().getFullYear()} EPackage Lab. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
      `.trim();

      const text = `
${userName} 様

この度は、EPackage Labへのご登録ありがとうございます。

誠に恐れ入りますが、今回のお申し込みは承認を見送らせていただくこととなりました。
${reason ? `理由: ${reason}` : ''}

何卒ご容赦いただきますようお願い申し上げます。

--------------------
お問い合わせ: support@epackage-lab.com
© ${new Date().getFullYear()} EPackage Lab. All rights reserved.
--------------------
      `.trim();

      await sendCustomEmail(
        email,
        subject,
        { html, text }
      );

      console.log('[User Approval] Rejection email sent to:', email);
    }
  } catch (error) {
    console.error('[User Approval] Email send error:', error);
    // Don't fail the approval if email fails
  }
}

// ============================================================
// POST Handler - Approve or Reject User
// ============================================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ Verify admin authentication first
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const { id: userId } = await params;
const { client: supabase } = await createSupabaseSSRClient(request);
    // Parse and validate request body
    const body: ApprovalRequestBody = await request.json();
    const validatedData = approvalSchema.parse(body);

    // Get target user profile
    const { data: targetUser, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError || !targetUser) {
      return NextResponse.json(
        { error: 'User not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Check if user is in PENDING status
    if (targetUser.status !== 'PENDING') {
      return NextResponse.json(
        {
          error: `User status is ${targetUser.status}. Only PENDING users can be approved/rejected.`,
          code: 'INVALID_STATUS',
        },
        { status: 400 }
      );
    }

    // Process approval or rejection
    let newStatus: 'ACTIVE' | 'DELETED';
    let message: string;

    if (validatedData.action === 'approve') {
      newStatus = 'ACTIVE';
      message = 'User approved successfully';
    } else {
      newStatus = 'DELETED';
      message = 'User registration rejected';
    }

    // Update user status
    const { data: updatedUser, error: updateError } = await supabase
      .from('profiles')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('User status update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update user status', code: 'UPDATE_ERROR' },
        { status: 500 }
      );
    }

    // Send notification email
    await sendApprovalEmail(
      targetUser.email,
      `${targetUser.kanji_last_name} ${targetUser.kanji_first_name}`,
      validatedData.action === 'approve' ? 'approved' : 'rejected',
      validatedData.reason
    );

    const response: ApprovalResponse = {
      success: true,
      message,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        status: updatedUser.status,
        role: updatedUser.role,
      },
    };

    return NextResponse.json(response);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: error.errors,
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    console.error('User approval error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
