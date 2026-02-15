import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

// Configure for static export compatibility
export const dynamic = 'force-static'
export const revalidate = 3600 // Revalidate every hour

/**
 * GET /api/download/templates/pdf
 * Returns the PDF quotation template file for download
 * Note: Currently returns a placeholder response as PDF template is generated dynamically
 */
export async function GET(request: NextRequest) {
  try {
    // For PDF templates, we generate them dynamically using pdf-generator.ts
    // This endpoint provides information about PDF template generation
    const templateInfo = {
      filename: 'quotation-template.pdf',
      displayName: 'Epackage Lab 見積書 PDF テンプレート',
      downloadUrl: '/api/download/templates/pdf',
      fileType: 'PDF',
      description: 'PDF形式の見積書テンプレート（動的生成）',
      note: 'PDFテンプレートは見積作成機能から動的に生成されます',
      generatorUrl: '/quote-simulator',
    }

    return NextResponse.json({
      success: true,
      template: templateInfo,
      message: 'PDFテンプレートは見積作成機能から生成されます',
    })

  } catch (error) {
    console.error('PDF template info error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'PDFテンプレート情報の取得に失敗しました',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/download/templates/pdf
 * Returns template information without downloading the file
 */
export async function POST(request: NextRequest) {
  try {
    const templateInfo = {
      filename: 'quotation-template.pdf',
      displayName: 'Epackage Lab 見積書 PDF テンプレート',
      downloadUrl: '/api/download/templates/pdf',
      fileType: 'PDF',
      description: 'PDF形式の見積書テンプレート（動的生成）',
      size: 'Generated on demand',
      lastUpdated: '2024-12-31',
      features: [
        '日本語対応',
        'A4 サイズ',
        'Noto Sans JP フォント',
        '会社ロゴ対応',
        'デジタル署名対応',
      ],
      generatorUrl: '/quote-simulator',
    }

    return NextResponse.json({
      success: true,
      template: templateInfo,
    })

  } catch (error) {
    console.error('PDF template info error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'テンプレート情報の取得に失敗しました',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
