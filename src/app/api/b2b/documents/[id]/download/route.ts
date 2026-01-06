/**
 * B2B 문서 다운로드 API (B2B Document Download API)
 * GET /api/b2b/documents/[id]/download - Download document PDF
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Next.js 16: cookies() now returns a Promise and must be awaited
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { id: documentId } = await context.params;

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }

    // Get document type from query params
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'quotation', 'work_order', 'contract'

    if (!type || !['quotation', 'work_order', 'contract'].includes(type)) {
      return NextResponse.json(
        { error: '유효하지 않은 문서 타입입니다.' },
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
          .from('quotations')
          .select('pdf_url, quotation_number, user_id')
          .eq('id', documentId)
          .single();

        if (!quotation) {
          return NextResponse.json(
            { error: '견적서를 찾을 수 없습니다.' },
            { status: 404 }
          );
        }

        // Check access permission
        const { data: quoteProfile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        const isQuoteAdmin = quoteProfile && ['ADMIN', 'OPERATOR'].includes(quoteProfile.role);
        if (!isQuoteAdmin && quotation.user_id !== user.id) {
          return NextResponse.json(
            { error: '권한이 없습니다.' },
            { status: 403 }
          );
        }

        pdfUrl = quotation.pdf_url;
        filename = `견적서_${quotation.quotation_number}.pdf`;
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
            { error: '작업표준서를 찾을 수 없습니다.' },
            { status: 404 }
          );
        }

        // Check access permission
        const { data: woProfile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        const isWoAdmin = woProfile && ['ADMIN', 'OPERATOR'].includes(woProfile.role);
        const workOrderTyped = workOrder as any;
        if (!isWoAdmin && workOrderTyped.orders?.[0]?.customer_id !== user.id) {
          return NextResponse.json(
            { error: '권한이 없습니다.' },
            { status: 403 }
          );
        }

        pdfUrl = workOrder.pdf_url;
        filename = `작업표준서_${workOrder.work_order_number}.pdf`;
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
            { error: '계약서를 찾을 수 없습니다.' },
            { status: 404 }
          );
        }

        // Check access permission
        const { data: contractProfile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        const isContractAdmin = contractProfile && ['ADMIN', 'OPERATOR'].includes(contractProfile.role);
        const contractTyped = contract as any;
        if (!isContractAdmin && contractTyped.orders?.[0]?.customer_id !== user.id) {
          return NextResponse.json(
            { error: '권한이 없습니다.' },
            { status: 403 }
          );
        }

        pdfUrl = contract.pdf_url;
        filename = `계약서_${contract.contract_number}.pdf`;
        break;
    }

    if (!pdfUrl) {
      return NextResponse.json(
        { error: 'PDF 파일이 아직 준비되지 않았습니다.' },
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
          downloaded_by: user.id,
          downloaded_at: new Date().toISOString()
        },
        changed_by: user.id
      });

    // Redirect to PDF URL
    return NextResponse.redirect(pdfUrl);

  } catch (error) {
    console.error('Document Download API error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
