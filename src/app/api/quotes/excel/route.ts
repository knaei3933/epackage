/**
 * Quote Excel Generation API
 *
 * 견적서 Excel 생성 API
 * API endpoint for generating quotation Excel files using ExcelJS
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  generateQuoteExcel,
  type ExcelGenerationOptions,
  type ExcelGenerationResult,
  QuoteData,
} from '../../../../lib/excel-generator';

// ============================================================
// Types
// ============================================================

interface QuoteExcelRequest {
  data: QuoteData;
  options?: ExcelGenerationOptions;
}

interface QuoteExcelResponse extends ExcelGenerationResult {
  filename?: string;
}

interface InfoResponse {
  name: string;
  version: string;
  description: string;
  descriptionJa: string;
  supportedFormats: string[];
  features: string[];
  featuresJa: string[];
}

// ============================================================
// Constants
// ============================================================

const API_INFO: InfoResponse = {
  name: 'Quote Excel Generator API',
  version: '1.0.0',
  description: 'Generate Japanese quotation Excel files using template-based approach',
  descriptionJa: 'Excelテンプレートを使用した日本語見積書生成API',
  supportedFormats: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  features: [
    'Japanese quote Excel generation (見積書)',
    'Template-based formatting',
    'Japanese era date formatting (和暦)',
    'Multi-line item support',
    'Customizable supplier information',
    'Product specifications mapping',
    'Optional processing indicators',
  ],
  featuresJa: [
    '日本語見積書Excel生成（見積書）',
    'テンプレートベースのフォーマット',
    '和暦日付フォーマット',
    '複数明細対応',
    '発行者情報カスタマイズ可能',
    '製品仕様マッピング',
    'オプション加工表示',
  ],
};

// ============================================================
// POST Handler - Generate Quote Excel
// ============================================================

/**
 * Generate quote Excel file
 *
 * 견적서 Excel 파일 생성
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as QuoteExcelRequest;

    // Validate request body
    if (!body.data) {
      return NextResponse.json(
        {
          success: false,
          error: '見積データが必要です',
          errorEn: 'Quote data is required',
        } as QuoteExcelResponse,
        { status: 400 }
      );
    }

    // Validate quote data structure
    if (!body.data.quoteNumber) {
      return NextResponse.json(
        {
          success: false,
          error: '見積番号が必要です',
          errorEn: 'Quote number is required',
        } as QuoteExcelResponse,
        { status: 400 }
      );
    }

    if (!body.data.customerName) {
      return NextResponse.json(
        {
          success: false,
          error: '顧客名が必要です',
          errorEn: 'Customer name is required',
        } as QuoteExcelResponse,
        { status: 400 }
      );
    }

    if (!body.data.items || body.data.items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: '見積明細が必要です',
          errorEn: 'Quote items are required',
        } as QuoteExcelResponse,
        { status: 400 }
      );
    }

    // Validate each item has required fields
    for (const item of body.data.items) {
      if (!item.name || item.quantity === undefined || !item.unitPrice) {
        return NextResponse.json(
          {
            success: false,
            error: '明細の品名、数量、単価が必要です',
            errorEn: 'Item name, quantity, and unit price are required',
          } as QuoteExcelResponse,
          { status: 400 }
        );
      }
    }

    // Generate Excel
    const result = await generateQuoteExcel(body.data, body.options || {});

    // Check if generation failed
    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    // Return as downloadable Excel file
    if (result.buffer) {
      const filename = result.filename || `${body.data.quoteNumber}.xlsx`;

      return new NextResponse(new Uint8Array(result.buffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
          'Content-Length': result.buffer.length.toString(),
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    }

    // Should not reach here, but just in case
    return NextResponse.json(
      {
        success: false,
        error: 'Excel生成に失敗しました',
        errorEn: 'Excel generation failed',
      } as QuoteExcelResponse,
      { status: 500 }
    );
  } catch (error) {
    console.error('Quote Excel generation error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Excel生成エラーが発生しました',
        errorEn: error instanceof Error ? error.message : 'Excel generation error occurred',
      } as QuoteExcelResponse,
      { status: 500 }
    );
  }
}

// ============================================================
// GET Handler - API Information
// ============================================================

/**
 * Get API information
 *
 * API情報返却
 */
export async function GET() {
  return NextResponse.json(API_INFO);
}

// ============================================================
// OPTIONS Handler - CORS preflight
// ============================================================

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
