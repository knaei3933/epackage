/**
 * Admin Designer Emails Settings API
 *
 * 管理者用デザイナーメール設定管理API
 * - GET: デザイナーメールアドレス一覧取得
 * - PUT: デザイナーメールアドレス更新
 *
 * @route /api/admin/settings/designer-emails
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseSSRClient } from '@/lib/supabase-ssr';

// =====================================================
// Environment Variables
// =====================================================

// =====================================================
// Types
// =====================================================

interface DesignerEmailsResponse {
  success: boolean;
  emails?: string[];
  error?: string;
  errorEn?: string;
}

// =====================================================
// Helper: Get authenticated admin
// =====================================================

async function getAuthenticatedAdmin(request: NextRequest) {
  const { client: supabase } = await createSupabaseSSRClient($$$ARGS);
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

  if (authError || !authUser?.id) {
    return null;
  }

  const userId = authUser.id;

  // Verify admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (!profile || profile.role !== 'admin') {
    return null;
  }

  return { userId, user: authUser };
}

// =====================================================
// GET Handler - Get Designer Emails
// =====================================================

/**
 * GET /api/admin/settings/designer-emails
 * Get Korea designer email addresses
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate and verify admin role
    const authResult = await getAuthenticatedAdmin(request);

    if (!authResult) {
      return NextResponse.json(
        { success: false, error: '認証されていません。', errorEn: 'Authentication required' },
        { status: 401 }
      );
    }

    const { client: supabase } = await createSupabaseSSRClient($$$ARGS);

    // Get notification settings
    const { data: setting, error } = await supabase
      .from('notification_settings')
      .select('value')
      .eq('key', 'korea_designer_emails')
      .maybeSingle();

    if (error) {
      console.error('[Designer Emails GET] Error:', error);
      return NextResponse.json(
        { success: false, error: '設定の取得に失敗しました。', errorEn: 'Failed to fetch settings' },
        { status: 500 }
      );
    }

    const emails: string[] = setting?.value || [];

    const response: DesignerEmailsResponse = {
      success: true,
      emails,
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('[Designer Emails GET] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: '予期しないエラーが発生しました。',
        errorEn: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// =====================================================
// PUT Handler - Update Designer Emails
// =====================================================

/**
 * PUT /api/admin/settings/designer-emails
 * Update Korea designer email addresses
 *
 * Request Body:
 * - emails: string[] - Array of email addresses
 *
 * Success Response (200):
 * {
 *   "success": true,
 *   "emails": string[]
 * }
 */
export async function PUT(request: NextRequest) {
  try {
    // Authenticate and verify admin role
    const authResult = await getAuthenticatedAdmin(request);

    if (!authResult) {
      return NextResponse.json(
        { success: false, error: '認証されていません。', errorEn: 'Authentication required' },
        { status: 401 }
      );
    }

    const { client: supabase } = await createSupabaseSSRClient($$$ARGS);

    // Parse request body
    const body = await request.json();
    const { emails } = body;

    // Validate emails
    if (!Array.isArray(emails)) {
      return NextResponse.json(
        {
          success: false,
          error: 'メールアドレスは配列で指定してください。',
          errorEn: 'Emails must be an array'
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = emails.filter((email: string) => !emailRegex.test(email));

    if (invalidEmails.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `無効なメールアドレスが含まれています: ${invalidEmails.join(', ')}`,
          errorEn: `Invalid email addresses: ${invalidEmails.join(', ')}`
        },
        { status: 400 }
      );
    }

    // Update notification settings
    const { data, error } = await supabase
      .from('notification_settings')
      .upsert({
        key: 'korea_designer_emails',
        value: emails,
        description: '韓国デザイナーのメールアドレスリスト',
        updated_at: new Date().toISOString(),
      })
      .select('value')
      .single();

    if (error) {
      console.error('[Designer Emails PUT] Error:', error);
      return NextResponse.json(
        { success: false, error: '設定の更新に失敗しました。', errorEn: 'Failed to update settings' },
        { status: 500 }
      );
    }

    const response: DesignerEmailsResponse = {
      success: true,
      emails: data?.value || [],
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('[Designer Emails PUT] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: '予期しないエラーが発生しました。',
        errorEn: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : String(error),
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
      'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
