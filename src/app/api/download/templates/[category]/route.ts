import { NextRequest, NextResponse } from 'next/server'

// Configure for dynamic API routes with dynamic parameters
export const dynamic = 'force-dynamic'  // Force SSR for dynamic routes
// Note: Cannot use 'force-static' with dynamic route parameters [category]

// Generate static params for all possible template categories
export async function generateStaticParams() {
  const categories = [
    'flat_3_side',
    'stand_up',
    'box',
    'box_with_valve',
    'spout_pouch',
    'flat_with_zip',
    'roll_film',
    'gassho'
  ]

  return categories.map((category) => ({
    category: category
  }))
}

interface Template {
  filename: string
  displayName: string
  downloadUrl: string
  fileType: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ category: string }> }
) {
  try {
    const { category } = await params

    // Define templates for each product category
    const templateMap: Record<string, Template[]> = {
      flat_3_side: [
        {
          filename: '三辺シール袋_テンプレート.ai',
          displayName: '三辺シール袋 デザインテンプレート',
          downloadUrl: '/templates/three-side-seal-pouch.ai',
          fileType: 'AI'
        },
        {
          filename: '三辺シール袋_テンプレート.pdf',
          displayName: '三辺シール袋 デザインガイドライン',
          downloadUrl: '/templates/three-side-seal-pouch.pdf',
          fileType: 'PDF'
        }
      ],
      stand_up: [
        {
          filename: 'スタンドパウチ_テンプレート.ai',
          displayName: 'スタンドパウチ デザインテンプレート',
          downloadUrl: '/templates/stand-pouch.ai',
          fileType: 'AI'
        },
        {
          filename: 'スタンドパウチ_テンプレート.eps',
          displayName: 'スタンドパウチ ベクターテンプレート',
          downloadUrl: '/templates/stand-pouch.eps',
          fileType: 'EPS'
        }
      ],
      box: [
        {
          filename: 'ボックス型パウチ_テンプレート.ai',
          displayName: 'ボックス型パウチ デザインテンプレート',
          downloadUrl: '/templates/box-pouch.ai',
          fileType: 'AI'
        },
        {
          filename: 'ボックス型パウチ_テンプレート.pdf',
          displayName: 'ボックス型パウチ デザインガイドライン',
          downloadUrl: '/templates/box-pouch.pdf',
          fileType: 'PDF'
        }
      ],
      box_with_valve: [
        {
          filename: 'ガス抜きバルブ付きBOX型パウチ_テンプレート.ai',
          displayName: 'ガス抜きバルブ付きBOX型パウチ デザインテンプレート',
          downloadUrl: '/templates/box-valve-pouch.ai',
          fileType: 'AI'
        },
        {
          filename: 'ガス抜きバルブ付きBOX型パウチ_テンプレート.pdf',
          displayName: 'ガス抜きバルブ付きBOX型パウチ デザインガイドライン',
          downloadUrl: '/templates/box-valve-pouch.pdf',
          fileType: 'PDF'
        }
      ],
      spout_pouch: [
        {
          filename: 'スパウトパウチ_テンプレート.ai',
          displayName: 'スパウトパウチ デザインテンプレート',
          downloadUrl: '/templates/spout-pouch.ai',
          fileType: 'AI'
        },
        {
          filename: 'スパウトパウチ_テンプレート.pdf',
          displayName: 'スパウトパウチ デザインガイドライン',
          downloadUrl: '/templates/spout-pouch.pdf',
          fileType: 'PDF'
        }
      ],
      flat_with_zip: [
        {
          filename: 'チャック付き平袋_テンプレート.ai',
          displayName: 'チャック付き平袋 デザインテンプレート',
          downloadUrl: '/templates/zip-flat-pouch.ai',
          fileType: 'AI'
        },
        {
          filename: 'チャック付き平袋_テンプレート.eps',
          displayName: 'チャック付き平袋 ベクターテンプレート',
          downloadUrl: '/templates/zip-flat-pouch.eps',
          fileType: 'EPS'
        }
      ],
      roll_film: [
        {
          filename: 'ロールフィルム_テンプレート.ai',
          displayName: 'ロールフィルム デザインテンプレート',
          downloadUrl: '/templates/roll-film.ai',
          fileType: 'AI'
        },
        {
          filename: 'ロールフィルム_テンプレート.pdf',
          displayName: 'ロールフィルム デザインガイドライン',
          downloadUrl: '/templates/roll-film.pdf',
          fileType: 'PDF'
        }
      ],
      gassho: [
        {
          filename: '合掌袋_テンプレート.ai',
          displayName: '合掌袋 デザインテンプレート',
          downloadUrl: '/templates/gassho-bag.ai',
          fileType: 'AI'
        },
        {
          filename: '合掌袋_テンプレート.pdf',
          displayName: '合掌袋 デザインガイドライン',
          downloadUrl: '/templates/gassho-bag.pdf',
          fileType: 'PDF'
        }
      ]
    }

    // Get templates for the requested category
    const templates = templateMap[category] || []

    if (templates.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: '指定されたカテゴリのテンプレートが見つかりませんでした',
          category
        },
        { status: 404 }
      )
    }

    // Return success response with templates
    return NextResponse.json({
      success: true,
      templates,
      category,
      count: templates.length
    })

  } catch (error) {
    console.error('Template download API error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'テンプレートの取得に失敗しました',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Handle GET requests for template information
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ category: string }> }
) {
  try {
    const { category } = await params

    // Return available template information without actual files
    const templateInfo: Record<string, { count: number; types: string[] }> = {
      flat_3_side: { count: 2, types: ['AI', 'PDF'] },
      stand_up: { count: 2, types: ['AI', 'EPS'] },
      box: { count: 2, types: ['AI', 'PDF'] },
      box_with_valve: { count: 2, types: ['AI', 'PDF'] },
      spout_pouch: { count: 2, types: ['AI', 'PDF'] },
      flat_with_zip: { count: 2, types: ['AI', 'EPS'] },
      roll_film: { count: 2, types: ['AI', 'PDF'] },
      gassho: { count: 2, types: ['AI', 'PDF'] }
    }

    const info = templateInfo[category]

    if (!info) {
      return NextResponse.json(
        {
          success: false,
          error: '無効なカテゴリです',
          availableCategories: Object.keys(templateInfo)
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      category,
      availableTemplates: info.count,
      fileTypes: info.types
    })

  } catch (error) {
    console.error('Template info API error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'テンプレート情報の取得に失敗しました'
      },
      { status: 500 }
    )
  }
}