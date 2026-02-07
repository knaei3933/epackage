/**
 * Document Download History API (Integrated from /api/customer/documents/history)
 * GET /api/member/documents/history?quotation_id={id}
 * Returns download history for a specific document
 *
 * Provides complete document download history for:
 * - Member pages
 * - Portal pages (migrated to /admin/customers)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // Get authenticated user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '認証されていません。', error_code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const userId = user.id;

    const { searchParams } = new URL(request.url);
    const quotationId = searchParams.get('quotation_id');

    if (!quotationId) {
      return NextResponse.json(
        { error: 'quotation_idパラメータが必要です。', error_code: 'MISSING_PARAMS' },
        { status: 400 }
      );
    }

    // Fetch download history for this quotation
    const { data: history, error } = await supabase
      .from('document_access_log')
      .select('*')
      .eq('quotation_id', quotationId)
      .eq('action', 'downloaded')
      .order('accessed_at', { ascending: false });

    if (error) {
      console.error('Error fetching download history:', error);
      return NextResponse.json(
        { error: '履歴の取得に失敗しました。', error_code: 'FETCH_ERROR' },
        { status: 500 }
      );
    }

    // Get download statistics
    const downloadCount = history?.length || 0;
    const lastDownloadedAt = history && history.length > 0 ? history[0].accessed_at : null;

    return NextResponse.json({
      success: true,
      data: {
        history: history || [],
        statistics: {
          downloadCount,
          lastDownloadedAt,
        },
      },
    });

  } catch (error) {
    console.error('Download History API error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。', error_code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}
