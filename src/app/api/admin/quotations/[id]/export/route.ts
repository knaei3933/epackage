/**
 * Admin Quotation Export API
 *
 * 管理者用見積もり書エクスポートAPIエンドポイント
 * - GET: 見積もりデータをJSON形式で返す
 * - POST: PDFファイルを生成
 *
 * 管理者はすべてのユーザーの見積もりデータにアクセス可能
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';
import { createServiceClient } from '@/lib/supabase';
import { mapDatabaseQuotationToExcel } from '@/lib/excel/excelDataMapper';
import { generatePdfBuffer, validatePdfData } from '@/lib/excel/pdfConverter';

// ============================================================
// Types
// ============================================================

interface ExportRequestBody {
  format?: 'excel' | 'pdf';
}

interface ExportResponse {
  success: boolean;
  data?: {
    quotation: any;
    items: any[];
    userProfile: any;
  };
  error?: string;
}

// ============================================================
// GET Handler - Return quotation data as JSON
// ============================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const auth = await verifyAdminAuth(request);
    if (!auth) return unauthorizedResponse();

    const { id: quotationId } = await params;
    const supabase = createServiceClient();

    // Fetch quotation with items (admin can access any quotation)
    const { data: quotation, error: quotationError } = await supabase
      .from('quotations')
      .select(`
        *,
        quotation_items (*)
      `)
      .eq('id', quotationId)
      .single();

    if (quotationError || !quotation) {
      return NextResponse.json(
        { error: 'Quotation not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Fetch user profile
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', quotation.user_id)
      .single();

    // Return quotation data as JSON
    return NextResponse.json({
      success: true,
      data: {
        quotation,
        userProfile,
        items: quotation.quotation_items,
      },
    });

  } catch (error) {
    console.error('[Admin Quotation Export] GET error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============================================================
// POST Handler - Generate PDF file
// ============================================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const auth = await verifyAdminAuth(request);
    if (!auth) return unauthorizedResponse();

    const { id: quotationId } = await params;
    const body: ExportRequestBody = await request.json().catch(() => ({}));
    const format = body.format || 'pdf';

    const supabase = createServiceClient();

    // Fetch quotation with items
    const { data: quotation, error: quotationError } = await supabase
      .from('quotations')
      .select(`
        *,
        quotation_items (*)
      `)
      .eq('id', quotationId)
      .single();

    if (quotationError || !quotation) {
      return NextResponse.json(
        { error: 'Quotation not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Fetch user profile
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', quotation.user_id)
      .single();

    const quotationData = {
      quotation,
      userProfile,
      items: quotation.quotation_items || [],
    };

    if (format === 'excel') {
      // Excel format - return JSON data for client-side processing
      return NextResponse.json({
        success: true,
        data: quotationData,
      });
    }

    // PDF format - generate PDF
    try {
      // Map database quotation to Excel/PDF format
      const excelData = await mapDatabaseQuotationToExcel(
        quotation,
        quotation.quotation_items || [],
        userProfile || undefined
      );

      console.log('[Admin PDF Export] excelData mapped successfully');

      // Validate PDF data
      const validation = validatePdfData(excelData);
      console.log('[Admin PDF Export] validation result:', validation);

      if (!validation.isValid) {
        console.warn('[Admin PDF Export] Validation failed:', validation.errors);
      }

      // Generate PDF using server-side compatible function
      const pdfBuffer = await generatePdfBuffer(excelData);

      if (!pdfBuffer) {
        throw new Error('PDF生成に失敗しました');
      }

      console.log('[Admin PDF Export] PDF generated successfully, size:', pdfBuffer.length);

      // Return PDF as downloadable file
      const fileName = `${quotation.quotation_number}.pdf`;

      return new NextResponse(Buffer.from(pdfBuffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
          'Content-Length': pdfBuffer.byteLength.toString(),
          'X-Quotation-Number': quotation.quotation_number,
        },
      });

    } catch (pdfError) {
      console.error('[Admin PDF Export] PDF generation error:', pdfError);
      return NextResponse.json(
        {
          error: 'PDF generation failed',
          code: 'PDF_ERROR',
          message: pdfError instanceof Error ? pdfError.message : 'Unknown error',
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('[Admin Quotation Export] POST error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: {
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }});
}
