/**
 * B2B Invitation Acceptance API
 *
 * B2B 초대 수락 API
 * - GET: 초대 토큰 확인
 * - POST: 초대 수락 및 회원가입 처리
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// ============================================================
// Types
// ============================================================

interface InvitationVerifyResponse {
  success: boolean;
  valid: boolean;
  invitation?: {
    id: string;
    email: string;
    companyName: string;
    role: string;
    inviterName: string;
    message?: string;
    expiresAt: string;
  };
  error?: string;
  code?: string;
}

interface AcceptInvitationRequestBody {
  token: string;
  password: string;
  kanjiLastName: string;
  kanjiFirstName: string;
  kanaLastName: string;
  kanaFirstName: string;
  corporatePhone?: string;
}

interface AcceptInvitationResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
  };
  error?: string;
  code?: string;
}

// ============================================================
// Validation Schema
// ============================================================

const acceptInvitationSchema = z.object({
  token: z.string().min(1, '招待トークンが必要です。'),
  password: z
    .string()
    .min(8, 'パスワードは最低8文字以上である必要があります。')
    .regex(/[A-Z]/, 'パスワードには少なくとも1つの大文字を含める必要があります。')
    .regex(/[a-z]/, 'パスワードには少なくとも1つの小文字を含める必要があります。')
    .regex(/[0-9]/, 'パスワードには少なくとも1つの数字を含める必要があります。'),
  kanjiLastName: z
    .string()
    .min(1, '姓（漢字）を入力してください。')
    .regex(/^[\u4E00-\u9FFF\s]+$/, '漢字のみ入力可能です。'),
  kanjiFirstName: z
    .string()
    .min(1, '名（漢字）を入力してください。')
    .regex(/^[\u4E00-\u9FFF\s]+$/, '漢字のみ入力可能です。'),
  kanaLastName: z
    .string()
    .min(1, '姓（ひらがな）を入力してください。')
    .regex(/^[\u3040-\u309F\s]+$/, 'ひらがなのみ入力可能です。'),
  kanaFirstName: z
    .string()
    .min(1, '名（ひらがな）を入力してください。')
    .regex(/^[\u3040-\u309F\s]+$/, 'ひらがなのみ入力可能です。'),
  corporatePhone: z
    .string()
    .regex(/^\d{2,4}-?\d{2,4}-?\d{3,4}$/, '有効な電話番号の形式ではありません。')
    .optional()
    .or(z.literal('')),
});

// ============================================================
// Helper Functions
// ============================================================

/**
 * Verify invitation token and get invitation details
 */
async function verifyInvitation(
  supabase: ReturnType<typeof createClient>,
  token: string
): Promise<{ valid: boolean; invitation?: Record<string, unknown>; error?: string }> {
  const { data: invitation, error } = await supabase
    .from('company_invitations')
    .select(`
      *,
      inviter:profiles!invited_by(*)
    `)
    .eq('token', token)
    .eq('status', 'PENDING')
    .single();

  if (error || !invitation) {
    return { valid: false, error: 'Invalid or expired invitation' };
  }

  const invitationTyped = invitation as any;

  // Check expiration
  if (new Date(invitationTyped.expires_at) < new Date()) {
    return { valid: false, error: 'Invitation has expired' };
  }

  return { valid: true, invitation };
}

// ============================================================
// GET Handler - Verify Invitation Token
// ============================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required', code: 'MISSING_TOKEN' },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { valid, invitation, error } = await verifyInvitation(supabase as any, token);

    if (!valid || !invitation) {
      const response: InvitationVerifyResponse = {
        success: false,
        valid: false,
        error: error || 'Invalid invitation',
      };
      return NextResponse.json(response, { status: 400 });
    }

    const invitationTyped = invitation as any;
    const response: InvitationVerifyResponse = {
      success: true,
      valid: true,
      invitation: {
        id: invitationTyped.id,
        email: invitationTyped.email,
        companyName: invitationTyped.company_id,
        role: invitationTyped.role,
        inviterName: `${invitationTyped.inviter.kanji_last_name} ${invitationTyped.inviter.kanji_first_name}`,
        message: invitationTyped.message || undefined,
        expiresAt: invitationTyped.expires_at,
      },
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Invitation verification error:', error);
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
// POST Handler - Accept Invitation and Register
// ============================================================

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body: AcceptInvitationRequestBody = await request.json();
    const validatedData = acceptInvitationSchema.parse(body);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Verify invitation
    const { valid, invitation, error: inviteError } = await verifyInvitation(
      supabase as any,
      validatedData.token
    );

    if (!valid || !invitation) {
      return NextResponse.json(
        {
          error: inviteError || 'Invalid invitation',
          code: 'INVALID_INVITATION',
        },
        { status: 400 }
      );
    }

    const invitationTyped = invitation as any;

    // Step 1: Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: invitationTyped.email,
      password: validatedData.password,
      options: {
        data: {
          kanji_last_name: validatedData.kanjiLastName,
          kanji_first_name: validatedData.kanjiFirstName,
          kana_last_name: validatedData.kanaLastName,
          kana_first_name: validatedData.kanaFirstName,
        },
      },
    });

    if (authError) {
      console.error('Auth user creation error:', authError);
      return NextResponse.json(
        { error: '認証ユーザーの作成に失敗しました。', code: 'AUTH_ERROR' },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: '認証ユーザーの作成に失敗しました。', code: 'AUTH_FAILED' },
        { status: 500 }
      );
    }

    const userId = authData.user.id;

    // Step 2: Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: invitation.email,
        kanji_last_name: validatedData.kanjiLastName,
        kanji_first_name: validatedData.kanjiFirstName,
        kana_last_name: validatedData.kanaLastName,
        kana_first_name: validatedData.kanaFirstName,
        corporate_phone: validatedData.corporatePhone || null,
        company_name: invitation.company_id,
        role: invitation.role,
        status: 'ACTIVE', // Auto-activate invited users
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      return NextResponse.json(
        { error: 'プロフィールの作成に失敗しました。', code: 'PROFILE_ERROR' },
        { status: 500 }
      );
    }

    // Step 3: Update invitation status
    await supabase
      .from('company_invitations')
      .update({
        status: 'ACCEPTED',
        accepted_by: userId,
        accepted_at: new Date().toISOString(),
      })
      .eq('id', invitation.id);

    const response: AcceptInvitationResponse = {
      success: true,
      message: '会員登録が完了しました。',
      user: {
        id: userId,
        email: invitationTyped.email,
      },
    };

    return NextResponse.json(response);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: '入力データの検証に失敗しました。',
          details: error.errors,
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    console.error('Invitation acceptance error:', error);
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
