export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { getCurrentUserId } from '@/lib/dashboard';

/**
 * ============================================================
 * Member Inquiries API
 * ============================================================
 *
 * GET /api/member/inquiries - Get user's inquiries
 *
 * Uses getCurrentUserId() for authentication with RBAC fallback
 */

// ============================================================
// GET Handler - List Inquiries
// ============================================================

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = await getCurrentUserId();

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

    return NextResponse.json({
      success: true,
      data: transformedInquiries,
    });
  } catch (error) {
    console.error('[inquiries API] Unexpected error:', error);
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
