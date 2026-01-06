import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

/**
 * ============================================================
 * Member Inquiries API
 * ============================================================
 *
 * GET /api/member/inquiries - Get user's inquiries
 *
 * Uses cookie-based authentication (middleware sets headers)
 */

// ============================================================
// Helper Functions
// ============================================================

/**
 * Get user ID from middleware headers (cookie-based auth or DEV_MODE header)
 */
async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  try {
    const { headers } = await import('next/headers');
    const headersList = await headers();
    const userId = headersList.get('x-user-id');

    // Log DEV_MODE usage for debugging
    const isDevMode = headersList.get('x-dev-mode') === 'true';
    if (isDevMode && userId) {
      console.log('[Inquiries API] DEV_MODE: Using x-user-id header:', userId);
    }

    return userId;
  } catch (error) {
    console.error('[getUserIdFromRequest] Error:', error);
    return null;
  }
}

// ============================================================
// GET Handler - List Inquiries
// ============================================================

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { error: '認証されていません', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
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
      console.error('Inquiries fetch error:', error);
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

    return NextResponse.json({
      success: true,
      data: transformedInquiries,
    });
  } catch (error) {
    console.error('Inquiries API error:', error);
    return NextResponse.json(
      {
        error: 'サーバーエラーが発生しました',
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
