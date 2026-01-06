import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';
import type { Database } from '@/types/database';

/**
 * GET /api/admin/contracts/workflow
 * 契約ワークフロー一覧を取得
 */
export async function GET(request: NextRequest) {
  try {
    // ✅ Verify admin authentication first
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const supabase = createSupabaseClient();

    // URL 파라미터에서 필터링 조건 추출
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // 쿼리 빌드
    let query = supabase
      .from('contracts')
      .select(`
        *,
        orders!inner(
          id,
          order_number,
          customer_name,
          customer_email
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // 상태 필터링
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: contracts, error } = await query;

    if (error) {
      console.error('契約データ取得エラー:', error);
      return NextResponse.json(
        { error: '契約データの取得に失敗しました' },
        { status: 500 }
      );
    }

    // 데이터 변환
    const transformedContracts = contracts?.map((contract: ContractRow) => ({
      id: contract.id,
      contractNumber: contract.contract_number,
      orderId: contract.orders?.order_number || contract.order_id,
      customerName: contract.orders?.customer_name || contract.customer_name,
      customerEmail: contract.orders?.customer_email || contract.customer_email,
      status: contract.status,
      sentAt: contract.sent_at,
      customerSignedAt: contract.customer_signed_at,
      adminSignedAt: contract.admin_signed_at,
      expiresAt: contract.expires_at,
      createdAt: contract.created_at,
      updatedAt: contract.updated_at
    })) || [];

    return NextResponse.json(transformedContracts);
  } catch (error) {
    console.error('API エラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
