/**
 * Customer Documents API
 * GET /api/customer/documents - List customer's downloadable documents
 * POST /api/customer/documents/[id]/log-access - Log document access
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { DownloadableDocument, DocumentType } from '@/types/portal';

// GET /api/customer/documents - List documents
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

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '認証されていません。', error_code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as DocumentType | null;
    const orderId = searchParams.get('order_id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // N+1 FIX: First get user's company_id, then fetch all docs in parallel
    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single();

    const companyId = profile?.company_id;

    // Parallel fetch all document types (much better than sequential N+1)
    const [quotes, contracts, files] = await Promise.all([
      // Quotations - directly by user_id
      (async () => {
        let q = supabase
          .from('quotations')
          .select('id, quotation_number, pdf_url, total_amount, created_at, order_id')
          .eq('user_id', user.id)
          .not('pdf_url', 'is', null)
          .order('created_at', { ascending: false });
        if (orderId) q = q.eq('order_id', orderId);
        const { data } = await q.range(offset, offset + limit - 1);
        return data || [];
      })(),
      // Contracts - by company_id
      (async () => {
        if (!companyId) return [];
        let q = supabase
          .from('contracts')
          .select('id, contract_number, pdf_url, total_amount, created_at, order_id')
          .eq('company_id', companyId)
          .not('pdf_url', 'is', null)
          .order('created_at', { ascending: false });
        if (orderId) q = q.eq('order_id', orderId);
        const { data } = await q.range(offset, offset + limit - 1);
        return data || [];
      })(),
      // Files - get user's order_ids first, then files
      (async () => {
        const { data: userOrders } = await supabase
          .from('orders')
          .select('id')
          .eq('user_id', user.id);

        if (!userOrders || userOrders.length === 0) return [];

        const orderIds = userOrders.map((o: any) => o.id);
        let q = supabase
          .from('files')
          .select('id, file_name, file_url, file_size, created_at, order_id')
          .in('order_id', orderIds)
          .eq('file_type', 'AI')
          .order('created_at', { ascending: false });
        if (orderId) q = q.eq('order_id', orderId);
        const { data } = await q.range(offset, offset + limit - 1);
        return data || [];
      })()
    ]);

    // Format all documents
    const documents: DownloadableDocument[] = [];

    for (const quote of quotes || []) {
      documents.push({
        id: `quote-${quote.id}`,
        type: 'quote',
        name: `見積書 ${quote.quotation_number}`,
        name_ja: `見積書 ${quote.quotation_number}`,
        file_url: quote.pdf_url,
        file_size: null,
        created_at: quote.created_at,
        order_id: quote.order_id || undefined,
        quotation_id: quote.id,
        is_available: true,
      });
    }

    for (const contract of contracts || []) {
      documents.push({
        id: `contract-${contract.id}`,
        type: 'contract',
        name: `契約書 ${contract.contract_number}`,
        name_ja: `契約書 ${contract.contract_number}`,
        file_url: contract.pdf_url,
        file_size: null,
        created_at: contract.created_at,
        order_id: contract.order_id || undefined,
        is_available: true,
      });
    }

    for (const file of files || []) {
      documents.push({
        id: `design-${file.id}`,
        type: 'design',
        name: `デザインデータ: ${file.file_name}`,
        name_ja: `デザインデータ: ${file.file_name}`,
        file_url: file.file_url,
        file_size: file.file_size,
        created_at: file.created_at,
        order_id: file.order_id || undefined,
        is_available: true,
      });
    }

    // Spec sheets are complex due to nested relationships - skip for now or optimize separately

    // Filter by type if specified
    const filteredDocuments = type
      ? documents.filter((doc) => doc.type === type)
      : documents;

    // Sort by created date
    filteredDocuments.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Apply pagination
    const paginatedDocuments = filteredDocuments.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: {
        documents: paginatedDocuments,
        total: filteredDocuments.length,
      },
      pagination: {
        limit,
        offset,
        total: filteredDocuments.length,
        hasMore: filteredDocuments.length > offset + limit,
      },
    });

  } catch (error) {
    console.error('Customer Documents API error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。', error_code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}

// POST /api/customer/documents/[id]/log - Log document access
export async function POST(request: NextRequest) {
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

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '認証されていません。', error_code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { document_type, document_id, order_id, quotation_id, action } = body;

    if (!document_type || !document_id) {
      return NextResponse.json(
        { error: 'ドキュメントタイプとIDは必須です。', error_code: 'MISSING_PARAMS' },
        { status: 400 }
      );
    }

    // Get request metadata
    const headers = request.headers;
    const ipAddress = headers.get('x-forwarded-for') ||
                      headers.get('x-real-ip') ||
                      request.headers.get('cf-connecting-ip') ||
                      null;
    const userAgent = headers.get('user-agent') || null;

    // Log the access
    const { error: logError } = await supabase.rpc('log_document_access', {
      user_uuid: user.id,
      doc_type: document_type,
      doc_id: document_id,
      order_uuid: order_id || null,
      quotation_uuid: quotation_id || null,
      access_action: action || 'viewed',
      access_ip: ipAddress,
      access_user_agent: userAgent,
    });

    if (logError) {
      console.error('Error logging document access:', logError);
      // Don't fail the request if logging fails
    }

    return NextResponse.json({
      success: true,
      message: 'アクセスを記録しました。',
    });

  } catch (error) {
    console.error('Document Access Log API error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。', error_code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}
