/**
 * Quote PDF Generation API
 *
 * 見積書PDF生成API
 * API endpoint for generating quotation/quote PDFs using jsPDF
 *
 * ⚠️ DEPRECATED: This endpoint uses browser-only APIs (html2canvas, DOM manipulation)
 * and cannot work server-side. PDF generation must be done client-side.
 *
 * Please use the client-side PDF generator directly:
 * ```typescript
 * const { generateQuotePDF } = await import('@/lib/pdf-generator');
 * const result = await generateQuotePDF(data, options);
 * ```
 *
 * Endpoints:
 * - POST /api/quotes/pdf - ❌ NOT SUPPORTED (browser-only code)
 * - GET /api/quotes/pdf - API information
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// Types
// ============================================================

interface QuotePdfResponse {
  success: boolean;
  error?: string;
  errorEn?: string;
  message?: string;
  solution?: string;
}

interface InfoResponse {
  name: string;
  version: string;
  description: string;
  descriptionJa: string;
  supportedFormats: string[];
  features: string[];
  featuresJa: string[];
  maxFileSize: string;
  fonts: string[];
}

// ============================================================
// Constants
// ============================================================

const API_INFO: InfoResponse = {
  name: 'Quote PDF Generator API (DEPRECATED)',
  version: '2.0.0',
  description: '⚠️ DEPRECATED: This API endpoint is not supported. PDF generation uses browser-only APIs (html2canvas, DOM manipulation) and must be done client-side.',
  descriptionJa: '⚠️ 非推奨: このAPIエンドポイントはサポートされていません。PDF生成はブラウザ専用API（html2canvas、DOM操作）を使用しているため、クライアントサイドでのみ実行可能です。',
  supportedFormats: [],
  features: [
    '⚠️ DEPRECATED - Use client-side PDF generation instead',
    'Import: const { generateQuotePDF } = await import("@/lib/pdf-generator")',
  ],
  featuresJa: [
    '⚠️ 非推奨 - 代わりにクライアントサイドPDF生成を使用してください',
    'インポート: const { generateQuotePDF } = await import("@/lib/pdf-generator")',
  ],
  maxFileSize: 'N/A',
  fonts: [],
};

// ============================================================
// POST Handler - Generate Quote PDF
// ============================================================

/**
 * Generate quote PDF
 *
 * ⚠️ NOT SUPPORTED: This endpoint cannot function server-side.
 * The PDF generator uses browser-only APIs (html2canvas, DOM manipulation).
 *
 * 見積書PDFを生成
 *
 * @param request - NextRequest
 * @returns Error response indicating client-side only operation
 */
export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      error: 'このAPIエンドポイントは使用できません。PDF生成はブラウザでのみ可能です。',
      errorEn: 'This API endpoint is not supported. PDF generation is browser-only.',
      message: 'Please use the client-side PDF generator directly by importing generateQuotePDF from @/lib/pdf-generator',
      solution: 'クライアントサイドで直接PDF生成を使用してください: const { generateQuotePDF } = await import("@/lib/pdf-generator")',
    } as QuotePdfResponse,
    { status: 501 } // 501 Not Implemented
  );
}

// ============================================================
// GET Handler - API Information
// ============================================================

/**
 * Get API information or sample data
 *
 * API情報またはサンプルデータを返却
 *
 * @param request - NextRequest
 * @returns API information or sample quote data
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action') || 'info'; // info, sample

  try {
    switch (action) {
      case 'info':
        return NextResponse.json(API_INFO);

      case 'sample':
        // Return sample quote data structure
        return NextResponse.json({
          success: true,
          data: {
            quoteNumber: 'QT-2025-001',
            issueDate: '2025-01-15',
            expiryDate: '2025-02-14',
            quoteCreator: '山田 太郎',

            // Customer information
            customerName: '株式会社サンプル顧客',
            customerNameKana: 'カブシキガイシャサンプルコキャク',
            companyName: '株式会社サンプル顧客',
            postalCode: '100-0001',
            address: '東京都千代田区千代田1-1',
            contactPerson: '田中 次郎',
            phone: '03-1234-5678',
            email: 'tanaka@example.co.jp',

            // Quote items
            items: [
              {
                id: 'ITEM-001',
                name: 'オーダーメイドスタンドパウチ',
                description: 'PET12/AL7/PE80、W150mm×H200mm×G50mm',
                quantity: 10000,
                unit: '枚',
                unitPrice: 150,
                amount: 1500000,
              },
              {
                id: 'ITEM-002',
                name: '印刷版代',
                description: 'グラビア版 8色',
                quantity: 1,
                unit: '式',
                unitPrice: 150000,
                amount: 150000,
              },
              {
                id: 'ITEM-003',
                name: 'デザイン料',
                description: '基本デザイン作成',
                quantity: 1,
                unit: '式',
                unitPrice: 50000,
                amount: 50000,
              },
            ],

            // Terms and conditions
            paymentTerms: '銀行振込（納品後30日）',
            deliveryDate: '発注から約45日',
            deliveryLocation: '貴社指定住所',
            validityPeriod: '見積日から30日間',
            remarks: '別途消費税がかかります',

            // Optional: Custom supplier info (uses defaults if not provided)
            // supplierInfo: {
            //   name: 'EPACKAGE Lab',
            //   postalCode: '〒673-0846',
            //   address: '兵庫県明石市上ノ丸2-11-21-102',
            //   phone: 'TEL: 080-6942-7235',
            //   email: 'info@epackage-lab.com',
            // },
          },
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error: '無効なアクションです',
            errorEn: 'Invalid action',
            validActions: ['info', 'sample'],
          },
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
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
