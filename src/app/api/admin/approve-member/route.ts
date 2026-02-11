/**
 * Unified Admin Member Approval API
 *
 * Unified admin approval system for member registrations
 * - GET: List pending member registrations
 * - POST: Approve member registration
 * - PATCH: Update member registration details
 * - DELETE: Reject member registration
 *
 * Security:
 * - Admin role verification required
 * - CSRF token validation
 * - Audit logging for all actions
 * - IP address tracking
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { withAdminAuth } from '@/lib/api-auth';
import { handleApiError, ValidationError } from '@/lib/api-error-handler';
import { uuidSchema } from '@/lib/validation-schemas';
import { Database } from '@/types/database';
import { headers } from 'next/headers';
import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';

// @ts-nocheck - Supabase type inference issues with complex update payloads

// ============================================================
// Types
// ============================================================

interface PendingMember {
  id: string;
  email: string;
  user_type: 'B2C' | 'B2B' | null;
  business_type: 'INDIVIDUAL' | 'CORPORATION' | 'SOLE_PROPRIETOR' | null;
  company_name: string | null;
  legal_entity_number: string | null;
  kanji_last_name: string;
  kanji_first_name: string;
  kana_last_name: string;
  kana_first_name: string;
  corporate_phone: string | null;
  personal_phone: string | null;
  postal_code: string | null;
  prefecture: string | null;
  city: string | null;
  street: string | null;
  business_document_path: string | null;
  position: string | null;
  department: string | null;
  company_url: string | null;
  product_category: string | null;
  acquisition_channel: string | null;
  representative_name: string | null;
  founded_year: string | null;
  capital: string | null;
  created_at: string;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DELETED';
}

// ============================================================
// Validation Schemas
// ============================================================

const approvalSchema = z.object({
  userId: uuidSchema,
  action: z.enum(['approve', 'reject']),
  reason: z.string().optional(),
});

const updateSchema = z.object({
  userId: uuidSchema,
  updates: z.object({
    company_name: z.string().optional(),
    corporate_number: z.string().optional(),
    position: z.string().optional(),
    department: z.string().optional(),
  }),
});

interface ApprovalRequestBody {
  userId: string;
  action: 'approve' | 'reject';
  reason?: string;
}

interface UpdateRequestBody {
  userId: string;
  updates: Partial<{
    company_name: string;
    corporate_number: string;
    position: string;
    department: string;
  }>;
}

interface ListPendingMembersResponse {
  success: boolean;
  data?: PendingMember[];
  error?: string;
}

interface ApprovalResponse {
  success: boolean;
  message: string;
  error?: string;
}

interface UpdateResponse {
  success: boolean;
  message: string;
  data?: PendingMember;
  error?: string;
}

// ============================================================
// Constants
// ============================================================

const AUDIT_LOG_RETENTION_DAYS = 7 * 365; // 7 years for Japanese e-Signature Law

// ============================================================
// Helper Functions
// ============================================================

/**
 * Log admin action to audit_logs table
 */
async function logAdminAction(
  supabase: SupabaseClient,
  action: 'approve' | 'reject' | 'update' | 'list',
  adminId: string,
  targetUserId: string,
  ipAddress: string,
  userAgent: string,
  outcome: 'success' | 'failure',
  details?: Record<string, unknown>,
  errorMessage?: string
): Promise<void> {
  try {
    await supabase.from('audit_logs').insert({
      timestamp: new Date().toISOString(),
      event_type: 'admin_action',
      resource_type: 'user',
      resource_id: targetUserId,
      user_id: adminId,
      ip_address: ipAddress,
      user_agent: userAgent,
      outcome,
      details: {
        action,
        admin_action: `member_${action}`,
        ...details,
      },
      error_message: errorMessage,
      jurisdiction: 'JP',
      retention_period_days: AUDIT_LOG_RETENTION_DAYS,
      scheduled_deletion_at: new Date(Date.now() + AUDIT_LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch (error) {
    console.error('Audit log error:', error);
  }
}

/**
 * Send approval email to user
 */
async function sendApprovalEmail(
  email: string,
  userName: string,
  companyName?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login`;

    if (process.env.NODE_ENV === 'development') {
      console.log('[Email Mock] Approval Email:', {
        to: email,
        userName,
        companyName,
        loginUrl,
      });
      return { success: true };
    }

    const { Resend } = await import('resend');
    const resendClient = new Resend(process.env.RESEND_API_KEY);

    await resendClient.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@epackage-lab.com',
      to: email,
      subject: '[EPACKAGE Lab] 会員登録承認完了',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Noto Sans JP', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1a1a1a; color: #fff; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; background: #f9f9f9; }
            .button { display: inline-block; padding: 12px 30px; background: #c9a961; color: #fff; text-decoration: none; border-radius: 4px; margin: 20px 0; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>EPACKAGE Lab</h1>
            </div>
            <div class="content">
              <h2>会員登録が承認されました</h2>
              <p>${userName}様</p>
              ${companyName ? `<p>${companyName}</p>` : ''}
              <p>この度は、EPACKAGE Labの会員登録を承認いたしました。</p>
              <p>以下のボタンからログインして、サービスをご利用いただけます。</p>
              <a href="${loginUrl}" class="button">ログインする</a>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} EPACKAGE Lab. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return { success: true };
  } catch (error: unknown) {
    console.error('Approval email error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send rejection email to user
 */
async function sendRejectionEmail(
  email: string,
  userName: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Email Mock] Rejection Email:', {
        to: email,
        userName,
        reason,
      });
      return { success: true };
    }

const { Resend } = await import('resend');
    const resendClient = new Resend(process.env.RESEND_API_KEY);

    await resendClient.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@epackage-lab.com',
      to: email,
      subject: '[EPACKAGE Lab] 会員登録結果について',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Noto Sans JP', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1a1a1a; color: #fff; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; background: #f9f9f9; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>EPACKAGE Lab</h1>
            </div>
            <div class="content">
              <h2>会員登録結果について</h2>
              <p>${userName}様</p>
              <p>この度は、EPACKAGE Labの会員登録をお申込みいただき、誠にありがとうございます。</p>
              <p>誠に恐れ入りますが、今回はお申込みを承認いたしかねますこととなりました。</p>
              ${reason ? `<p>理由: ${reason}</p>` : ''}
              <p>ご不明な点がございましたら、お問い合わせください。</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} EPACKAGE Lab. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return { success: true };
  } catch (error: unknown) {
    console.error('Rejection email error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get client IP address
 */
async function getClientIp(request: NextRequest): Promise<string> {
  const headersList = await headers();

  // Check various headers for IP address
  const forwardedFor = headersList.get('x-forwarded-for');
  const realIp = headersList.get('x-real-ip');
  const cfConnectingIp = headersList.get('cf-connecting-ip');

  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  if (realIp) {
    return realIp;
  }
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  return 'unknown';
}

// ============================================================
// GET Handler - List Pending Members
// ============================================================

export const GET = withAdminAuth(async (request: NextRequest, auth) => {
  const clientIp = await getClientIp(request);
  const userAgent = request.headers.get('user-agent') || 'unknown';

  const supabase = createServiceClient();

  try {
    // Get pending members (both B2B and B2C with PENDING status)
    const { data: members, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('status', 'PENDING')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Pending members query error:', error);
      await logAdminAction(
        supabase,
        'list',
        auth.userId,
        'N/A',
        clientIp,
        userAgent,
        'failure',
        { query_error: error.message }
      );
      throw new Error('Failed to fetch pending members');
    }

    // Log successful list action
    await logAdminAction(
      supabase,
      'list',
      auth.userId,
      'N/A',
      clientIp,
      userAgent,
      'success',
      { count: members?.length || 0 }
    );

    return NextResponse.json({
      success: true,
      data: (members || []) as PendingMember[],
    } as ListPendingMembersResponse);

  } catch (error) {
    return handleApiError(error);
  }
});

// ============================================================
// POST Handler - Approve/Reject Member
// ============================================================

export const POST = withAdminAuth(async (request: NextRequest, auth) => {
  const clientIp = await getClientIp(request);
  const userAgent = request.headers.get('user-agent') || 'unknown';

  const supabase = createServiceClient();

  try {
    const body = await request.json();
    const validationResult = approvalSchema.safeParse(body);

    if (!validationResult.success) {
      throw new ValidationError('Invalid request data', validationResult.error.errors);
    }

    const data = validationResult.data;

    // Get target user
    const { data: targetUser } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.userId)
      .single();

    if (!targetUser) {
      await logAdminAction(
        supabase,
        data.action,
        auth.userId,
        data.userId,
        clientIp,
        userAgent,
        'failure',
        { user_not_found: true }
      );
      throw new Error('User not found');
    }

    // Process approve or reject
    if (data.action === 'approve') {
      // Update user status to ACTIVE
      const { error: updateError } = (await supabase
        .from('profiles')
        .update({
          status: 'ACTIVE',
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.userId));

      if (updateError) {
        console.error('User approval error:', updateError);
        await logAdminAction(
          supabase,
          'approve',
          auth.userId,
          data.userId,
          clientIp,
          userAgent,
          'failure',
          { update_error: updateError.message }
        );
        throw new Error('Failed to approve user');
      }

      // Send approval email
      const userName = `${targetUser.kanji_last_name} ${targetUser.kanji_first_name}`;
      await sendApprovalEmail(targetUser.email, userName, targetUser.company_name || undefined);

      // Log approval
      await logAdminAction(
        supabase,
        'approve',
        auth.userId,
        data.userId,
        clientIp,
        userAgent,
        'success',
        {
          user_email: targetUser.email,
          user_type: targetUser.user_type,
          company_name: targetUser.company_name,
        }
      );

      return NextResponse.json({
        success: true,
        message: 'User approved successfully',
      } as ApprovalResponse);

    } else {
      // Reject - Update user status to DELETED
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          status: 'DELETED',
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.userId);

      if (updateError) {
        console.error('User rejection error:', updateError);
        await logAdminAction(
          supabase,
          'reject',
          auth.userId,
          data.userId,
          clientIp,
          userAgent,
          'failure',
          { update_error: updateError.message }
        );
        throw new Error('Failed to reject user');
      }

      // Send rejection email
      const userName = `${targetUser.kanji_last_name} ${targetUser.kanji_first_name}`;
      await sendRejectionEmail(targetUser.email, userName, data.reason);

      // Log rejection
      await logAdminAction(
        supabase,
        'reject',
        auth.userId,
        data.userId,
        clientIp,
        userAgent,
        'success',
        {
          user_email: targetUser.email,
          user_type: targetUser.user_type,
          company_name: targetUser.company_name,
          reason: data.reason,
        }
      );

      return NextResponse.json({
        success: true,
        message: 'User rejected successfully',
      } as ApprovalResponse);
    }

  } catch (error) {
    return handleApiError(error);
  }
});

// ============================================================
// PATCH Handler - Update Member Details
// ============================================================

export const PATCH = withAdminAuth(async (request: NextRequest, auth) => {
  const clientIp = await getClientIp(request);
  const userAgent = request.headers.get('user-agent') || 'unknown';

  const supabase = createServiceClient();

  try {
    const body = await request.json();
    const validationResult = updateSchema.safeParse(body);

    if (!validationResult.success) {
      throw new ValidationError('Invalid request data', validationResult.error.errors);
    }

    const data = validationResult.data;

    // Get target user first
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.userId)
      .single();

    if (!existingUser) {
      await logAdminAction(
        supabase,
        'update',
        auth.userId,
        data.userId,
        clientIp,
        userAgent,
        'failure',
        { user_not_found: true }
      );
      throw new Error('User not found');
    }

    // Update user
    const { data: updatedUser, error: updateError } = await supabase
      .from('profiles')
      .update({
        ...data.updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', data.userId)
      .select()
      .single();

    if (updateError) {
      console.error('User update error:', updateError);
      await logAdminAction(
        supabase,
        'update',
        auth.userId,
        data.userId,
        clientIp,
        userAgent,
        'failure',
        { update_error: updateError.message, updates: data.updates }
      );
      throw new Error('Failed to update user');
    }

    // Log update
    await logAdminAction(
      supabase,
      'update',
      auth.userId,
      data.userId,
      clientIp,
      userAgent,
      'success',
      {
        user_email: existingUser.email,
        updated_fields: Object.keys(data.updates),
        changes: data.updates,
      }
    );

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser as PendingMember,
    } as UpdateResponse);

  } catch (error) {
    return handleApiError(error);
  }
});

// ============================================================
// DELETE Handler - Alias for Reject (alternative to POST)
// ============================================================

export const DELETE = withAdminAuth(async (request: NextRequest, auth) => {
  const clientIp = await getClientIp(request);
  const userAgent = request.headers.get('user-agent') || 'unknown';

  const supabase = createServiceClient();

  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      throw new ValidationError('userId query parameter is required');
    }

    // Validate UUID
    const uuidValidation = uuidSchema.safeParse(userId);
    if (!uuidValidation.success) {
      throw new ValidationError('Invalid userId format');
    }

    // Get target user
    const { data: targetUser } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!targetUser) {
      await logAdminAction(
        supabase,
        'reject',
        auth.userId,
        userId,
        clientIp,
        userAgent,
        'failure',
        { user_not_found: true }
      );
      throw new Error('User not found');
    }

    // Update user status to DELETED
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        status: 'DELETED',
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      console.error('User rejection error:', updateError);
      await logAdminAction(
        supabase,
        'reject',
        auth.userId,
        userId,
        clientIp,
        userAgent,
        'failure',
        { update_error: updateError.message }
      );
      throw new Error('Failed to reject user');
    }

    // Send rejection email
    const userName = `${targetUser.kanji_last_name} ${targetUser.kanji_first_name}`;
    const reason = url.searchParams.get('reason') || undefined;
    await sendRejectionEmail(targetUser.email, userName, reason);

    // Log rejection
    await logAdminAction(
      supabase,
      'reject',
      auth.userId,
      userId,
      clientIp,
      userAgent,
      'success',
      {
        user_email: targetUser.email,
        user_type: targetUser.user_type,
        company_name: targetUser.company_name,
        reason,
      }
    );

    return NextResponse.json({
      success: true,
      message: 'User rejected successfully',
    } as ApprovalResponse);

  } catch (error) {
    return handleApiError(error);
  }
});
