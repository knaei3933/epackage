/**
 * B2B 견적 API (B2B Quotation API)
 * POST /api/b2b/quotations - Create new quotation request
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getPerformanceMonitor } from '@/lib/performance-monitor';

// Initialize performance monitor
const perfMonitor = getPerformanceMonitor({
  slowQueryThreshold: 1000, // Log queries slower than 1 second
  enableLogging: true,
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    // Initialize Supabase client
    // Next.js 16: cookies() now returns a Promise and must be awaited
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      company_id,
      items,
      notes,
      status = 'DRAFT'
    } = body;

    // Validate required fields
    if (!company_id) {
      return NextResponse.json(
        { error: '회사 ID는 필수 항목입니다.' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: '견적 항목은 최소 1개 이상이어야 합니다.' },
        { status: 400 }
      );
    }

    // Validate items
    for (const item of items) {
      if (!item.product_name || !item.product_name.trim()) {
        return NextResponse.json(
          { error: '모든 항목의 제품명은 필수입니다.' },
          { status: 400 }
        );
      }
      if (!item.quantity || item.quantity <= 0) {
        return NextResponse.json(
          { error: '수량은 0보다 커야 합니다.' },
          { status: 400 }
        );
      }
    }

    // Get user profile data for customer snapshot
    const { data: profile } = await supabase
      .from('profiles')
      .select('kanji_last_name, kanji_first_name, email, corporate_phone')
      .eq('id', user.id)
      .single();

    const customerName = profile
      ? `${profile.kanji_last_name} ${profile.kanji_first_name}`
      : user.email?.split('@')[0] || '미등록';
    const customerEmail = user.email || '';

    // Create quotation
    const { data: quotation, error: quotationError } = await supabase
      .from('quotations')
      .insert({
        user_id: user.id,
        company_id,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: profile?.corporate_phone || null,
        status: status.toUpperCase(),
        notes: notes || null,
        subtotal_amount: 0, // Will be calculated by trigger
        tax_amount: 0,
        total_amount: 0
      })
      .select()
      .single();

    if (quotationError) {
      console.error('Error creating quotation:', quotationError);
      return NextResponse.json(
        { error: '견적 생성 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    // Create quotation items
    const itemsToInsert = items.map((item: any, index: number) => ({
      quotation_id: quotation.id,
      product_name: item.product_name,
      category: item.category || null,
      quantity: item.quantity,
      unit_price: item.unit_price || 0,
      specifications: item.specifications || {},
      notes: item.notes || null,
      display_order: index
    }));

    const { error: itemsError } = await supabase
      .from('quotation_items')
      .insert(itemsToInsert);

    if (itemsError) {
      console.error('Error creating quotation items:', itemsError);
      // Rollback quotation creation
      await supabase.from('quotations').delete().eq('id', quotation.id);
      return NextResponse.json(
        { error: '견적 항목 생성 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    // Fetch complete quotation with calculated totals
    const { data: completeQuotation } = await supabase
      .from('quotations')
      .select(`
        *,
        quotation_items (*)
      `)
      .eq('id', quotation.id)
      .single();

    return NextResponse.json({
      success: true,
      data: completeQuotation,
      message: status === 'SENT'
        ? '견적 요청이 접수되었습니다.'
        : '견적이 임시 저장되었습니다.'
    });

  } catch (error) {
    console.error('Quotation API error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    // Track total API execution time
    const duration = Date.now() - startTime;
    perfMonitor.trackQuery(`POST /api/b2b/quotations`, duration);
  }
}

// GET /api/b2b/quotations - List user's quotations
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  try {
    // Next.js 16: cookies() now returns a Promise and must be awaited
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // ✅ N+1 Query Fix: Use RPC function to fetch all data in single query
    // This reduces 41 queries (1 for quotations + 20 for companies + 20 for items) to 1 query
    const { data: quotations, error } = await supabase.rpc('get_quotations_with_relations', {
      p_user_id: user.id,
      p_limit: limit,
      p_offset: offset,
      p_status: status?.toUpperCase() || null
    });

    // Get total count separately (still efficient with composite index)
    let countQuery = supabase
      .from('quotations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (status) {
      countQuery = countQuery.eq('status', status.toUpperCase());
    }

    const { count } = await countQuery;

    if (error) {
      console.error('Error fetching quotations:', error);
      return NextResponse.json(
        { error: '견적 목록을 불러오는 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        quotations: quotations || [],
        total: count || 0
      },
      pagination: {
        limit,
        offset,
        count: quotations?.length || 0
      }
    });

  } catch (error) {
    console.error('Quotation API error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    // Track GET API execution time
    const duration = Date.now() - startTime;
    perfMonitor.trackQuery(`GET /api/b2b/quotations`, duration);
  }
}
