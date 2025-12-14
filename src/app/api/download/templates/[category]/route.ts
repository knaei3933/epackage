import { NextRequest, NextResponse } from 'next/server'

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
  },
  // Add mappings for the category names used in the frontend
  'flat_3_side': {
    files: [
      {
        name: '3sealpouch.ai',
        displayName: '3シールパウチ',
        path: '/images/inbound-data/3sealpouch.ai'
      }
    ]
  },
  'box': {
    files: [
      {
        name: 'Msealpouch.ai',
        displayName: 'BOX型パウチ',
        path: '/images/inbound-data/Msealpouch.ai'
      }
    ]
  },
  'spout_pouch': {
    files: [
      {
        name: 'standpouch.ai',
        displayName: 'スパウトパウチ（汎用テンプレート）',
        path: '/images/inbound-data/standpouch.ai'
      }
    ]
  },
  'roll_film': {
    files: [
      {
        name: '3sealpouch.ai',
        displayName: 'ロールフィルム（汎用テンプレート）',
        path: '/images/inbound-data/3sealpouch.ai'
      }
    ]
  }
}

// Handle POST requests to get available templates for a category
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
        fileType: file.name.split('.').pop()?.toUpperCase() || 'AI'
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