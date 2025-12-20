import { NextRequest, NextResponse } from 'next/server'
import path from 'path'

// Available design templates mapping
const DESIGN_TEMPLATES = {
  'soft_pouch': {
    files: [
      {
        name: '3sealpouch.ai',
        displayName: '3シールパウチ',
        path: '/images/inbound-data/3sealpouch.ai'
      }
    ]
  },
  'stand_up': {
    files: [
      {
        name: 'standpouch.ai',
        displayName: 'スタンドパウチ',
        path: '/images/inbound-data/standpouch.ai'
      }
    ]
  },
  'three_side_seal': {
    files: [
      {
        name: '3sealpouch.ai',
        displayName: '3シールパウチ',
        path: '/images/inbound-data/3sealpouch.ai'
      },
      {
        name: 'Tseal pouch.ai',
        displayName: '3シールパウチ（別デザイン）',
        path: '/images/inbound-data/Tseal pouch.ai'
      }
    ]
  },
  'gusset': {
    files: [
      {
        name: 'Msealpouch.ai',
        displayName: '4シールガゼットパウチ',
        path: '/images/inbound-data/Msealpouch.ai'
      }
    ]
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ category: string; filename: string }> }
) {
  try {
    const { category, filename } = await params

    // Validate category
    if (!DESIGN_TEMPLATES[category as keyof typeof DESIGN_TEMPLATES]) {
      return NextResponse.json(
        { error: 'Invalid product category' },
        { status: 400 }
      )
    }

    // Validate filename
    const templates = DESIGN_TEMPLATES[category as keyof typeof DESIGN_TEMPLATES]
    const template = templates.files.find(f => f.name === filename)

    if (!template) {
      return NextResponse.json(
        { error: 'Template file not found' },
        { status: 404 }
      )
    }

    // Construct file path
    const filePath = path.join(
      process.cwd(),
      'public',
      template.path
    )

    // Get file stats
    const fs = require('fs')
    const fileStats = await fs.promises.stat(filePath)

    if (!fileStats.isFile()) {
      return NextResponse.json(
        { error: 'Template file not found' },
        { status: 404 }
      )
    }

    // Read file
    const fileBuffer = await fs.promises.readFile(filePath)

    // Determine content type
    const ext = path.extname(filename).toLowerCase()
    let contentType = 'application/octet-stream'

    switch (ext) {
      case '.ai':
        contentType = 'application/illustrator'
        break
      case '.eps':
        contentType = 'application/postscript'
        break
      case '.pdf':
        contentType = 'application/pdf'
        break
      case '.png':
        contentType = 'image/png'
        break
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg'
        break
    }

    // Return file with appropriate headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'public, max-age=86400', // 1 day cache
      },
    })

  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'Failed to download template' },
      { status: 500 }
    )
  }
}

// Get available templates for a category
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ category: string }> }
) {
  try {
    const { category } = await params

    // Validate category
    if (!DESIGN_TEMPLATES[category as keyof typeof DESIGN_TEMPLATES]) {
      return NextResponse.json(
        { error: 'Invalid product category' },
        { status: 400 }
      )
    }

    const templates = DESIGN_TEMPLATES[category as keyof typeof DESIGN_TEMPLATES]

    return NextResponse.json({
      success: true,
      templates: templates.files.map(file => ({
        filename: file.name,
        displayName: file.displayName,
        downloadUrl: `/api/download/templates/${category}/${file.name}`,
        fileType: path.extname(file.name).slice(1).toUpperCase()
      }))
    })

  } catch (error) {
    console.error('Templates fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}