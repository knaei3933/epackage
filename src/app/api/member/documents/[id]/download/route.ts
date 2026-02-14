/**
 * Member Document Download API
 *
 * メンバー文書ダウンロードAPI
 * GET /api/member/documents/[id]/download - Download document PDF
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const { id: documentId } = await context.params;

    const response = NextResponse.json({ success: false });
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          response.cookies.delete({ name, ...options });
        },
      },
    });

    // Try to get user from middleware header first (more reliable)
    const userIdFromMiddleware = request.headers.get('x-user-id');
    const isFromMiddleware = request.headers.get('x-auth-from') === 'middleware';

    let userId: string;

    if (userIdFromMiddleware && isFromMiddleware) {
      userId = userIdFromMiddleware;
      console.log('[Document Download] Using user ID from middleware:', userId);
    } else {
      // Fallback to SSR client auth
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return NextResponse.json(
          { error: '認証されていないリクエストです。' },
          { status: 401 }
        );
      }
      userId = user.id;
      console.log('[Document Download] Authenticated user:', userId);
    }

    // Get document type from query params
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'quotation', 'work_order', 'contract'

    if (!type || !['quotation', 'work_order', 'contract'].includes(type)) {
      return NextResponse.json(
        { error: '無効なドキュメントタイプです。' },
        { status: 400 }
      );
    }

    let pdfUrl: string | null = null;
    let filename: string = '';
    let tableName: string = '';

    // Get document based on type
    switch (type) {
      case 'quotation':
        tableName = 'quotations';
        const { data: quotation } = await supabase
          .from('quotation')
          .select('pdf_url, quotation_number, user_id')
          .eq('id', documentId)
          .single();

        if (!quotation) {
          return NextResponse.json(
            { error: '見積書が見つかりません。' },
            { status: 404 }
          );
        }

        // Check access permission
        const { data: quoteProfile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single();

        const isQuoteAdmin = quoteProfile && ['ADMIN', 'OPERATOR'].includes(quoteProfile.role);
        if (!isQuoteAdmin && quotation.user_id !== userId) {
          return NextResponse.json(
            { error: '権限がありません。' },
            { status: 403 }
          );
        }

        pdfUrl = quotation.pdf_url;
        filename = `見積書_${quotation.quotation_number}.pdf`;
        break;

      case 'work_order':
        tableName = 'work_orders';
        const { data: workOrder } = await supabase
          .from('work_orders')
          .select(`
            pdf_url,
            work_order_number,
            orders!inner (
              customer_id
            )
          `)
          .eq('id', documentId)
          .single();

        if (!workOrder) {
          return NextResponse.json(
            { error: '作業標準書が見つかりません。' },
            { status: 404 }
          );
        }

        // Check access permission
        const { data: woProfile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single();

        const isWoAdmin = woProfile && ['ADMIN', 'OPERATOR'].includes(woProfile.role);
        const workOrderTyped = workOrder as any;
        if (!isWoAdmin && workOrderTyped.orders?.[0]?.customer_id !== userId) {
          return NextResponse.json(
            { error: '権限がありません。' },
            { status: 403 }
          );
        }

        pdfUrl = workOrder.pdf_url;
        filename = `作業標準書_${workOrder.work_order_number}.pdf`;
        break;

      case 'contract':
        tableName = 'contracts';
        const { data: contract } = await supabase
          .from('contracts')
          .select(`
            pdf_url,
            contract_number,
            orders!inner (
              customer_id
            )
          `)
          .eq('id', documentId)
          .single();

        if (!contract) {
          return NextResponse.json(
            { error: '契約書が見つかりません。' },
            { status: 404 }
          );
        }

        // Check access permission
        const { data: contractProfile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single();

        const isContractAdmin = contractProfile && ['ADMIN', 'OPERATOR'].includes(contractProfile.role);
        const contractTyped = contract as any;
        if (!isContractAdmin && contractTyped.orders?.[0]?.customer_id !== userId) {
          return NextResponse.json(
            { error: '権限がありません。' },
            { status: 403 }
          );
        }

        pdfUrl = contract.pdf_url;
        filename = `契約書_${contract.contract_number}.pdf`;
        break;
    }

    if (!pdfUrl) {
      return NextResponse.json(
        { error: 'PDFファイルがまだ準備できていません。' },
        { status: 404 }
      );
    }

    // Log download
    await supabase
      .from('order_audit_log')
      .insert({
        table_name: tableName,
        record_id: documentId,
        action: 'DOWNLOAD',
        new_data: {
          downloaded_by: userId,
          downloaded_at: new Date().toISOString()
        },
        changed_by: userId
      });

    // Redirect to PDF URL
    return NextResponse.redirect(pdfUrl);

  } catch (error) {
    console.error('Document Download API error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}
