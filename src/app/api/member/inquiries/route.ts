export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

/**
 * ============================================================
 * Member Inquiries API
 * ============================================================
 *
 * GET /api/member/inquiries - Get user's inquiries
 *
 * Uses direct Supabase auth for reliable authentication
 */

// ============================================================
// Helper Functions
// ============================================================

/**
 * Get user ID from Supabase auth cookies (most reliable method)
 */
async function getAuthenticatedUserId(): Promise<string | null> {
  try {
    // Dynamic import to avoid build-time issues
    const { createServerClient } = await import('@supabase/ssr');
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('[inquiries API] Missing Supabase environment variables');
      return null;
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: () => {}, // Read-only in Server Components
        remove: () => {}, // Read-only
      },
    });

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.log('[inquiries API] Auth error:', error.message);
      return null;
    }

    if (!user) {
      console.log('[inquiries API] No user found in session');
      return null;
    }

    console.log('[inquiries API] Found user:', user.id);
    return user.id;
  } catch (error) {
    console.error('[inquiries API] Error getting authenticated user:', error);
    return null;
  }
}

// ============================================================
// GET Handler - List Inquiries
// ============================================================

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = await getAuthenticatedUserId();

    // 未認証の場合は空の配列を返す（UIを壊さないため）
    if (!userId) {
      console.log('[inquiries API] No authenticated user, returning empty array');
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    const supabase = createServiceClient();

    let query = supabase
      .from('inquiries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (type && type !== 'all') {
      query = query.eq('type', type);
    }

    const { data: inquiries, error } = await query;

    if (error) {
      console.error('[inquiries API] Database error:', error);
      // テーブルが存在しない等の場合も空配列を返す
      if (error.code === '42P01') { // relation does not exist
        return NextResponse.json({
          success: true,
          data: [],
        });
      }
      return NextResponse.json(
        { error: 'お問い合わせの取得に失敗しました', code: 'FETCH_ERROR' },
        { status: 500 }
      );
    }

    // Transform to frontend format
    const transformedInquiries = inquiries?.map(inquiry => ({
      id: inquiry.id,
      userId: inquiry.user_id,
      inquiryNumber: inquiry.inquiry_number || inquiry.request_number || `INQ-${String(inquiry.id).padStart(6, '0')}`,
      type: inquiry.type || 'other',
      subject: inquiry.subject || 'お問い合わせ',
      message: inquiry.message || '',
      status: inquiry.status as 'open' | 'responded' | 'resolved' | 'closed',
      response: inquiry.response,
      createdAt: inquiry.created_at,
      respondedAt: inquiry.responded_at,
    })) || [];

    console.log('[inquiries API] Returning', transformedInquiries.length, 'inquiries');
    return NextResponse.json({
      success: true,
      data: transformedInquiries,
    });
  } catch (error) {
    console.error('[inquiries API] Unexpected error:', error);
    // 予期しないエラーでもUIを壊さないよう空配列を返す
    return NextResponse.json({
      success: true,
      data: [],
    });
  }
}
