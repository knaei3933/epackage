/**
 * Member Company Invitation API
 *
 * 会社メンバー招待API
 * - POST: 会社内の新しいメンバー招待（メール送信）
 * - GET: 招待リスト取得
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseSSRClient } from '@/lib/supabase-ssr';
import { Database } from '@/types/database';
import { Resend } from 'resend';
import { z } from 'zod';
import { randomBytes } from 'crypto';

// ============================================================
// Types
// ============================================================

interface InviteRequestBody {
  email: string;
  role?: 'ADMIN' | 'MEMBER';
  message?: string;
}

interface InviteResponse {
  success: boolean;
  message: string;
  invitation?: {
    id: string;
    email: string;
    role: string;
    expiresAt: string;
  };
  error?: string;
  code?: string;
}

// ============================================================
// Validation Schema
// ============================================================

const inviteSchema = z.object({
  email: z
    .string()
    .min(1, 'メールアドレスを入力してください。')
    .email('有効なメールアドレスを入力してください。'),
  role: z.enum(['ADMIN', 'MEMBER']).optional(),
  message: z.string().max(500).optional(),
});

// ============================================================
// Helper Functions
// ============================================================

/**
 * Generate invitation token
 */
function generateInviteToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Calculate expiration date (7 days from now)
 */
function calculateExpirationDate(): string {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  return expiresAt.toISOString();
}

/**
 * Send invitation email
 */
async function sendInvitationEmail(
  email: string,
  token: string,
  inviterName: string,
  companyName: string,
  role: string,
  message?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const appUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.package-lab.com';
    const inviteUrl = `${appUrl}/member/invites/accept?token=${token}`;

    // Development mode: log email details
    if (process.env.NODE_ENV === 'development') {
      console.log('[Email Mock] Invitation Email:', {
        to: email,
        inviterName,
        companyName,
        role,
        inviteUrl,
        message,
      });
      return { success: true };
    }

    // Production: Use Resend
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@epackage-lab.com',
      to: email,
      subject: `${companyName}への参加招待`,
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
              <h2>${companyName}へのご招待</h2>
              <p>${inviterName}様より、${companyName}のB2Bプラットフォームへのご招待が届いています。</p>
              <p>役職: ${role === 'ADMIN' ? '管理者' : 'メンバー'}</p>
              ${message ? `<p><strong>メッセージ:</strong><br>${message}</p>` : ''}
              <a href="${inviteUrl}" class="button">招待を承認する</a>
              <p>※この招待リンクの有効期限は7日間です。</p>
            </div>
            <div class="footer">
              <p>このメールはシステムより自動送信されています。返信しないようお願いいたします。</p>
              <p>&copy; ${new Date().getFullYear()} EPACKAGE Lab. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error('Invitation email error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================
// POST Handler - Create and Send Invitation
// ============================================================

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body: InviteRequestBody = await request.json();
    const validatedData = inviteSchema.parse(body);

    // Initialize Supabase client with SSR pattern
    const { client: supabase } = await createSupabaseSSRClient(request);

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Get inviter profile
    const { data: inviter } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!inviter) {
      return NextResponse.json(
        { error: 'Inviter profile not found', code: 'PROFILE_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Check if inviter is active
    if (inviter.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Your account is not active', code: 'ACCOUNT_INACTIVE' },
        { status: 403 }
      );
    }

    // Only admins can invite
    if (inviter.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only admins can send invitations', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', validatedData.email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists', code: 'USER_EXISTS' },
        { status: 400 }
      );
    }

    // Check for pending invitation
    const { data: pendingInvite } = await supabase
      .from('company_invitations')
      .select('*')
      .eq('email', validatedData.email)
      .eq('company_id', inviter.company_name || inviter.id)
      .eq('status', 'PENDING')
      .single();

    if (pendingInvite) {
      return NextResponse.json(
        {
          error: 'Pending invitation already exists for this email',
          code: 'PENDING_INVITE_EXISTS',
        },
        { status: 400 }
      );
    }

    // Generate invitation
    const token = generateInviteToken();
    const expiresAt = calculateExpirationDate();
    const role = validatedData.role || 'MEMBER';

    // Create invitation record
    const { data: invitation, error: inviteError } = await supabase
      .from('company_invitations')
      .insert({
        email: validatedData.email,
        company_id: inviter.company_name || inviter.id,
        invited_by: user.id,
        role: role,
        token: token,
        status: 'PENDING',
        expires_at: expiresAt,
        message: validatedData.message || null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (inviteError) {
      console.error('Invitation creation error:', inviteError);
      return NextResponse.json(
        { error: 'Failed to create invitation', code: 'CREATE_ERROR' },
        { status: 500 }
      );
    }

    // Send invitation email
    const emailResult = await sendInvitationEmail(
      validatedData.email,
      token,
      `${inviter.kanji_last_name} ${inviter.kanji_first_name}`,
      inviter.company_name || 'EPACKAGE Lab',
      role,
      validatedData.message
    );

    if (!emailResult.success) {
      console.error('Failed to send invitation email:', emailResult.error);
      // Don't fail the request, just log it
    }

    const response: InviteResponse = {
      success: true,
      message: 'Invitation sent successfully',
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expires_at,
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

    console.error('Invitation creation error:', error);
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

// ============================================================
// GET Handler - List Invitations
// ============================================================

export async function GET(request: NextRequest) {
  try {
    // Initialize Supabase client with SSR pattern
    const { client: supabase } = await createSupabaseSSRClient(request);

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Get invitations for company
    const companyId = profile.company_name || profile.id;
    const { data: invitations, error } = await supabase
      .from('company_invitations')
      .select(`
        *,
        inviter:profiles!invited_by(kanji_last_name, kanji_first_name, email)
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Invitation list error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch invitations', code: 'QUERY_ERROR' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        invitations: invitations || [],
      },
    });

  } catch (error) {
    console.error('Invitation list error:', error);
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
