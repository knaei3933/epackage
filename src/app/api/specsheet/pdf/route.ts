/**
 * Specification Sheet PDF API
 *
 * 仕様書PDF生成API
 * - POST: 仕様書データからPDFを生成
 * - GET: API情報を返却
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  generateSpecSheetPdf,
  generateSpecSheetPdfBase64,
  validateSpecSheetData,
  createMockSpecSheetData,
} from '@/lib/pdf/specSheetPdfGenerator';
import type { SpecSheetData, SpecSheetPdfOptions } from '@/types/specsheet';

// ============================================================
// Types
// ============================================================

interface PdfRequestBody {
  data: SpecSheetData;
  options?: SpecSheetPdfOptions & {
    filename?: string;
    returnBase64?: boolean;
  };
}

interface PdfResponseBody {
  success: boolean;
  pdfBuffer?: string; // base64 encoded
  filename?: string;
  size?: number;
  specNumber?: string;
  revision?: string;
  error?: string;
  validationErrors?: string[];
}

interface InfoResponseBody {
  name: string;
  version: string;
  description: string;
  supportedFormats: string[];
  features: string[];
  templates: string[];
  maxFileSize: string;
  fonts: string[];
}

// ============================================================
// POST Handler - Generate PDF
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as PdfRequestBody;

    // Validate request body
    if (!body.data) {
      return NextResponse.json(
        {
          success: false,
          error: 'dataパラメータが必要です',
        } as PdfResponseBody,
        { status: 400 }
      );
    }

    // Validate spec sheet data
    const validation = validateSpecSheetData(body.data);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: '仕様書データの検証に失敗しました',
          validationErrors: validation.errors,
        } as PdfResponseBody,
        { status: 400 }
      );
    }

    // Generate PDF
    const pdfResult = await generateSpecSheetPdf(body.data, body.options);

    if (!pdfResult.success || !pdfResult.buffer) {
      return NextResponse.json(
        {
          success: false,
          error: pdfResult.error || 'PDF生成に失敗しました',
        } as PdfResponseBody,
        { status: 500 }
      );
    }

    // Check if client wants base64 or raw buffer
    if (body.options?.returnBase64) {
      // Return as base64 JSON response
      const base64 = pdfResult.buffer.toString('base64');
      const filename = body.options?.filename || `${body.data.specNumber}.pdf`;

      return NextResponse.json({
        success: true,
        pdfBuffer: base64,
        filename,
        size: pdfResult.buffer.length,
        specNumber: pdfResult.metadata?.specNumber,
        revision: pdfResult.metadata?.revision,
      } as PdfResponseBody);
    } else {
      // Return as downloadable PDF file
      const filename = body.options?.filename || `${body.data.specNumber}.pdf`;

      return new NextResponse(pdfResult.buffer as unknown as BodyInit, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
          'Content-Length': pdfResult.buffer.length.toString(),
        },
      });
    }
  } catch (error) {
    console.error('Spec sheet PDF generation error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'PDF生成エラー',
        details: error instanceof Error ? error.message : 'Unknown error',
      } as PdfResponseBody,
      { status: 500 }
    );
  }
}

// ============================================================
// GET Handler - API Info
// ============================================================

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action') || 'info'; // info, sample, validate

  try {
    switch (action) {
      case 'info':
        return NextResponse.json({
          name: 'Specification Sheet PDF Generator API',
          version: '1.0.0',
          description: 'B2B作業標準書(仕様書)データから日本語PDFを生成するAPI',
          supportedFormats: ['application/pdf'],
          features: [
            '日本語フォント対応 (Noto Sans JP)',
            'A4縦サイズ対応',
            'A3横サイズ対応',
            '日本の技術ドキュメントフォーマット',
            '多層材質構成表示',
            '性能基準表対応',
            '規格準拠情報表示',
            '承認欄対応（オプション）',
            '価格情報対応（オプション）',
          ],
          templates: ['standard', 'detailed', 'simple'],
          maxFileSize: '1MB',
          fonts: ['Noto Sans JP (Regular, Bold)'],
          endpoints: {
            generate: 'POST /api/specsheet/pdf',
            info: 'GET /api/specsheet/pdf?action=info',
            sample: 'GET /api/specsheet/pdf?action=sample',
            validate: 'POST /api/specsheet/pdf?action=validate',
          },
        } as InfoResponseBody);

      case 'sample':
        // Return sample spec sheet data structure
        const sampleData = createMockSpecSheetData();
        return NextResponse.json({
          success: true,
          data: sampleData,
        });

      case 'validate':
        // For validation via GET, return validation schema
        return NextResponse.json({
          success: true,
          schema: {
            required: [
              'specNumber',
              'revision',
              'issueDate',
              'customer.name',
              'customer.contactPerson',
              'product.name',
              'product.productCode',
              'product.dimensions',
              'product.materials',
              'production.method',
              'production.delivery.leadTime',
            ],
            optional: [
              'title',
              'description',
              'category',
              'status',
              'customer.department',
              'customer.contact',
              'product.design',
              'product.pricing',
              'product.approvals',
              'remarks',
            ],
          },
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error: '無効なアクション',
            validActions: ['info', 'sample', 'validate'],
          },
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
