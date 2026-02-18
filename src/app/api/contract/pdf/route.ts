/**
 * Contract PDF Generation API
 *
 * 契約書PDF生成API
 * - POST: 契約書データからPDFを生成
 * - @react-pdf/renderer使用（Playwright削除）
 * - unstable_cacheによるキャッシュ機能
 * - 日本語契約書フォーマット対応
 */

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // 1 hour cache

import { NextRequest, NextResponse } from 'next/server';
import { getCachedContractPdf } from '@/lib/pdf/contractPdfGenerator';
import type { ContractData, PdfGenerationResult } from '@/types/contract';

// ============================================================
// Types
// ============================================================

interface GeneratePdfRequest {
  data: ContractData;
  options?: {
    returnBase64?: boolean;
    filename?: string;
  };
}

interface GeneratePdfResponse extends PdfGenerationResult {
  filename?: string;
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * Generate filename from contract data
 */
function generateFilename(data: ContractData): string {
  const contractNumber = data.contractNumber || 'contract';
  const date = new Date().toISOString().split('T')[0];
  return `contract_${contractNumber}_${date}.pdf`;
}

// ============================================================
// POST Handler - Generate PDF
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GeneratePdfRequest;

    if (!body.data) {
      return NextResponse.json(
        {
          success: false,
          error: '契約データが必要です',
        } as PdfGenerationResult,
        { status: 400 }
      );
    }

    // Generate PDF using cached generator
    const pdfBuffer = await getCachedContractPdf(body.data);

    // Check if returnBase64 is requested
    const returnBase64 = body.options?.returnBase64 || false;
    const filename = body.options?.filename || generateFilename(body.data);

    if (returnBase64) {
      // Return base64 encoded PDF
      const base64 = pdfBuffer.toString('base64');

      return NextResponse.json({
        success: true,
        filename,
        base64,
        size: pdfBuffer.length,
      } as GeneratePdfResponse);
    }

    // Return PDF as downloadable file
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
        'Cache-Control': 'public, max-age=3600, immutable',
      },
    });

  } catch (error) {
    console.error('[Contract PDF] Error generating PDF:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'PDF生成に失敗しました',
      } as PdfGenerationResult,
      { status: 500 }
    );
  }
}

// ============================================================
// GET Handler - Health Check
// ============================================================

export async function GET() {
  return NextResponse.json({
    service: 'Contract PDF Generator',
    version: '2.0.0',
    engine: '@react-pdf/renderer',
    cache: 'unstable_cache (1 hour)',
    status: 'healthy',
  });
}
