/**
 * Quotation PDF API
 *
 * 見積書PDF生成API
 * - POST: Excel見積もりデータからPDFを生成
 * - GET: PDFテンプレート情報を返却
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { generatePdfBuffer, validatePdfData } from '@/lib/excel/pdfConverter';
import type { QuotationData } from '@/lib/excel/excelQuotationTypes';

// ============================================================
// Types
// ============================================================

interface PdfRequestBody {
  data: QuotationData;
  options?: {
    filename?: string;
    returnBase64?: boolean;
  };
}

interface PdfResponseBody {
  success: boolean;
  pdfBuffer?: string; // base64 encoded
  filename?: string;
  size?: number;
  error?: string;
  validationErrors?: string[];
}

interface InfoResponseBody {
  name: string;
  version: string;
  description: string;
  supportedFormats: string[];
  features: string[];
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

    // Validate PDF data
    const validation = validatePdfData(body.data);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'データの検証に失敗しました',
          validationErrors: validation.errors,
        } as PdfResponseBody,
        { status: 400 }
      );
    }

    // Generate PDF
    const pdfBuffer = await generatePdfBuffer(body.data);

    // Check if client wants base64 or raw buffer
    if (body.options?.returnBase64) {
      // Return as base64 JSON response
      const base64 = Buffer.from(pdfBuffer).toString('base64');
      const filename = body.options?.filename || `${body.data.metadata.quotationNumber}.pdf`;

      return NextResponse.json({
        success: true,
        pdfBuffer: base64,
        filename,
        size: pdfBuffer.byteLength,
      } as PdfResponseBody);
    } else {
      // Return as downloadable PDF file
      const filename = body.options?.filename || `${body.data.metadata.quotationNumber}.pdf`;

      return new NextResponse(Buffer.from(pdfBuffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
          'Content-Length': pdfBuffer.byteLength.toString(),
        },
      });
    }
  } catch (error) {
    console.error('PDF generation error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    return NextResponse.json(
      {
        success: false,
        error: 'PDF生成エラー',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
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
  const action = searchParams.get('action') || 'info'; // info, sample

  try {
    switch (action) {
      case 'info':
        return NextResponse.json({
          name: 'Quotation PDF Generator API',
          version: '1.0.0',
          description: 'Excel見積もりデータから日本語PDFを生成するAPI',
          supportedFormats: ['application/pdf'],
          features: [
            '日本語フォント対応 (Noto Sans JP)',
            'A4縦サイズ',
            '日本のビジネス見積書フォーマット',
            'ウォーターマーク対応',
            '複数ページ対応',
          ],
          maxFileSize: '500KB',
          fonts: ['Noto Sans JP (Regular, Bold)'],
          sampleRequest: {
            data: {
              clientInfo: {
                company: '株式会社サンプル',
                postalCode: '100-0001',
                address: '東京都千代田区...',
                contact: '担当者名',
              },
              supplierInfo: {
                company: 'EPACKAGE Lab',
                postalCode: '673-0846',
                address: '兵庫県明石市...',
                phone: 'TEL: 080-6942-7235',
                email: 'info@epackage-lab.com',
              },
              paymentTerms: {
                quotationNumber: 'QT-2024-001',
                quotationDate: '令和6年4月1日',
                quotationExpiry: '見積日から30日間',
                paymentMethod: '先払い',
                constructionPeriod: '校了から約1か月',
                deliveryLocation: '御指定場所',
              },
              specifications: {
                'パウチタイプ': 'スタンドパウチ',
                '寸法': 'W150mm × H200mm × G50mm',
                '材質': 'PET12/AL7/PE80',
              },
              orderItems: [
                {
                  name: 'オーダーメイドバッグ',
                  quantity: 1000,
                  unit: '枚',
                  unitPrice: '¥150',
                  amount: '¥150,000',
                },
              ],
              processing_options: {
                'ノッチ': true,
                '吊り穴': false,
              },
            },
          },
        } as InfoResponseBody);

      case 'sample':
        // Return sample quotation data structure
        return NextResponse.json({
          success: true,
          data: {
            clientInfo: {
              company: '株式会社サンプル',
              postalCode: '100-0001',
              address: '東京都千代田区千代田1-1',
              contact: '山田 太郎',
            },
            supplierInfo: {
              company: 'EPACKAGE Lab',
              subBrand: 'by kanei-trade',
              companyName: '金井貿易株式会社',
              postalCode: '〒673-0846',
              address: '兵庫県明石市上ノ丸2-11-21',
              phone: 'TEL: 050-1793-6500',
              email: 'info@package-lab.com',
              description: 'オーダーメイドバッグ印刷専門',
            },
            paymentTerms: {
              quotationNumber: 'QT-2024-001',
              quotationDate: '令和6年4月1日',
              quotationExpiry: '見積日から30日間',
              paymentMethod: '先払い',
              submissionDeadline: '指定なし',
              proofDeadline: '指定なし',
              paymentDeadline: '校了前',
              constructionPeriod: '校了から約1か月',
              deliveryLocation: '御指定場所',
              deliveryDate: '校了から約1か月',
              bankInfo: 'PayPay銀行 ビジネス営業部支店(005)普通 5630235',
            },
            specifications: {
              'パウチタイプ': 'スタンドパウチ',
              '寸法': 'W150mm × H200mm × G50mm',
              '材質': 'PET12/AL7/PE80',
            },
            orderItems: [
              {
                name: 'オーダーメイドスタンドパウチ',
                quantity: 1000,
                unit: '枚',
                unitPrice: '¥150',
                amount: '¥150,000',
              },
            ],
            processing_options: {
              'ノッチ': true,
              '吊り穴': true,
              'ジッパー': false,
            },
          },
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error: '無効なアクション',
            validActions: ['info', 'sample'],
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
