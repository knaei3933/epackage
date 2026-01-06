import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

// Configure for static export compatibility
export const dynamic = 'force-static'
export const revalidate = 3600 // Revalidate every hour

/**
 * GET /api/download/templates/excel
 * Returns the Excel quotation template file for download
 */
export async function GET(request: NextRequest) {
  try {
    // Path to the Excel template file
    const templatePath = join(process.cwd(), 'public', 'templates', 'quotation-epackage-lab.xlsx')

    // Read the file
    const fileBuffer = await readFile(templatePath)

    // Create response with proper headers for Excel file download
    const response = new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="quotation-epackage-lab.xlsx"',
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'public, max-age=3600, immutable',
      },
    })

    return response

  } catch (error) {
    console.error('Excel template download error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Excelテンプレートの取得に失敗しました',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/download/templates/excel
 * Returns template information without downloading the file
 */
export async function POST(request: NextRequest) {
  try {
    const templateInfo = {
      filename: 'quotation-epackage-lab.xlsx',
      displayName: 'Epackage Lab 見積書 Excel テンプレート',
      downloadUrl: '/api/download/templates/excel',
      fileType: 'XLSX',
      description: 'Excel形式の見積書テンプレート',
      size: '89KB',
      lastUpdated: '2024-12-31',
    }

    return NextResponse.json({
      success: true,
      template: templateInfo,
    })

  } catch (error) {
    console.error('Excel template info error:', error)

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
