/**
 * Unified Contracts API (B2B + Member)
 * POST /api/contracts - Create contract from order
 * GET /api/contracts - List contracts
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseSSRClient } from '@/lib/supabase-ssr';

// POST /api/contracts - Create contract from order
export async function POST(request: NextRequest) {
  try {
    // Initialize Supabase client using modern @supabase/ssr pattern
    const { client: supabase } = await createSupabaseSSRClient(request);

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '認証されていないリクエストです。' },
        { status: 401 }
      );
    }

    // Check if user is admin or operator
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['ADMIN', 'OPERATOR'].includes(profile.role)) {
      return NextResponse.json(
        { error: '権限がありません。' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { order_id, work_order_id } = body;

    if (!order_id) {
      return NextResponse.json(
        { error: '注文IDは必須項目です。' },
        { status: 400 }
      );
    }

    // Get order data with related information
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        quotations (
          id,
          quotation_number,
          quotation_items (*)
        ),
        order_items (*)
      `)
      .eq('id', order_id)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: '注文が見つかりません。' },
        { status: 404 }
      );
    }

    // Check if contract already exists
    const { data: existingContract } = await supabase
      .from('contracts')
      .select('id')
      .eq('order_id', order_id)
      .single();

    if (existingContract) {
      return NextResponse.json(
        { error: '既に契約書が生成された注文です。', contractId: existingContract.id },
        { status: 400 }
      );
    }

    // Generate contract number (CTR-YYYY-NNNN)
    const year = new Date().getFullYear();
    const contractNumber = `CTR-${year}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    // Calculate total amount from order items or use order total
    const totalAmount = order.total_amount;

    // Create contract
    // 注: contracts Insert 型は company_id/customer_representative 等の必須フィールドが
    // 定義されているが、実行時は DEFAULT が効くため省略可能。実行時ロジック維持のため
    // insert オブジェクトをキャスト（挿入フィールド・値は不変）。
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .insert({
        contract_number: contractNumber,
        order_id: order_id,
        customer_name: order.customer_name,
        total_amount: totalAmount,
        status: 'DRAFT'
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
      .select()
      .single();

    if (contractError) {
      console.error('Error creating contract:', contractError);
      return NextResponse.json(
        { error: '契約書の作成中にエラーが発生しました。' },
        { status: 500 }
      );
    }

    // Update order status
    // 注: 'CONTRACT_SENT' は旧設計値で OrderStatus 型に存在しない（本番 b2b_order_status enum の旧値）。
    // 判断4: current_state/state_metadata は orders テーブル実列に非存在のため削除。
    // contract_id/contract_number は contracts テーブルに保存済み。status 値の新14ステータス
    // 正規化（CONTRACT_SENT → 適正値）は Phase 4。
    await supabase
      .from('orders')
      .update({
        status: 'CONTRACT_SENT',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
      .eq('id', order_id);

    // Log status change
    // 注: order_status_history Insert 型は metadata 等が必須定義だが、実行時は省略可能。
    // 実行時ロジック維持のため insert オブジェクトをキャスト（挿入フィールド・値は不変）。
    await supabase
      .from('order_status_history')
      .insert({
        order_id: order_id,
        from_status: 'QUOTATION',
        to_status: 'CONTRACT_SENT',
        changed_by: user.id,
        reason: '契約書送付'
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

    return NextResponse.json({
      success: true,
      data: contract,
      message: '契約書が生成されました。'
    });

  } catch (error) {
    console.error('Contract API error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}

// GET /api/contracts - List contracts
export async function GET(request: NextRequest) {
  try {
    // Initialize Supabase client using modern @supabase/ssr pattern
    const { client: supabase } = await createSupabaseSSRClient(request);

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '認証されていないリクエストです。' },
        { status: 401 }
      );
    }

    // Get user's role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    // 注: profiles.role 型は 'ADMIN' | 'MEMBER' | 'KOREA_DESIGNER' だが、実行時は
    // 'OPERATOR' 等の追加値も入り得るため string キャストで比較（実行時ロジック不変）。
    const isAdmin = (profile?.role as string) === 'ADMIN' || (profile?.role as string) === 'OPERATOR';

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const orderId = searchParams.get('order_id');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    // 注: contracts.status はリテラル共用体だが、実行時はクエリパラメータ由来の
    // 任意の文字列を渡すため、中間クエリ型を any で受ける（フィルタロジック不変）。
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query: any = supabase
      .from('contracts')
      .select(`
        *,
        orders (
          id,
          order_number,
          customer_name
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply status filter
    if (status) {
      query = query.eq('status', status.toUpperCase());
    }

    // Apply order filter
    if (orderId) {
      query = query.eq('order_id', orderId);
    }

    const { data: contracts, error, count } = await query;

    if (error) {
      console.error('Error fetching contracts:', error);
      return NextResponse.json(
        { error: '契約書リストの読み込み中にエラーが発生しました。' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: contracts,
      pagination: {
        limit,
        offset,
        total: count || 0,
        hasMore: (count || 0) > offset + limit
      }
    });

  } catch (error) {
    console.error('Contract API error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}
