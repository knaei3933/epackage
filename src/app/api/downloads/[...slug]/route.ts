import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  try {
    const { slug } = await params
    const slugPath = slug.join('/')

    // Define available download files
    const downloadFiles: Record<string, {
      name: string
      type: string
      size: number
      contentType: string
    }> = {
      'quality-manual': {
        name: '品質マニュアル.pdf',
        type: '品質管理',
        size: 2621440, // 2.5MB
        contentType: 'application/pdf'
      },
      'food-safety': {
        name: '食品安全手順書.pdf',
        type: '食品安全',
        size: 1887436, // 1.8MB
        contentType: 'application/pdf'
      },
      'traceability': {
        name: 'トレーサビリティシステム.pdf',
        type: 'トレーサビリティ',
        size: 3355443, // 3.2MB
        contentType: 'application/pdf'
      },
      'pharma-package': {
        name: '医薬品包装適合証明.pdf',
        type: '医薬品',
        size: 1572864, // 1.5MB
        contentType: 'application/pdf'
      },
      'compliance-overview': {
        name: '法規制準拠概要.pdf',
        type: '法規制',
        size: 4194304, // 4MB
        contentType: 'application/pdf'
      },
      'internal-review': {
        name: '内部審査用資料セット.zip',
        type: '審査資料',
        size: 8388608, // 8MB
        contentType: 'application/zip'
      },
      'proposal-template': {
        name: '稟議書フォーマット.docx',
        type: '提案書',
        size: 524288, // 512KB
        contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      },
      'tech-spec': {
        name: '技術仕様比較表.xlsx',
        type: '技術資料',
        size: 2097152, // 2MB
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    }

    // Check if file exists
    if (!downloadFiles[slugPath]) {
      return NextResponse.json(
        { error: 'ファイルが見つかりません' },
        { status: 404 }
      )
    }

    const fileInfo = downloadFiles[slugPath]

    // In a real implementation, you would serve the actual file
    // For now, we'll create a placeholder PDF
    const pdfBuffer = Buffer.from(
      `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
  /Font <<
    /F1 <<
      /Type /Font
      /Subtype /Type1
      /BaseFont /Helvetica
    >>
  >>
>>
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 24 Tf
100 700 Td
(${fileInfo.name}) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000274 00000 n
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
358
%%EOF`,
      'binary'
    )

    // Set headers for download
    const headers = new Headers()
    headers.set('Content-Type', fileInfo.contentType)
    headers.set('Content-Disposition', `attachment; filename="${fileInfo.name}"`)
    headers.set('Content-Length', fileInfo.size.toString())

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers
    })

  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'ファイルのダウンロードに失敗しました' },
      { status: 500 }
    )
  }
}