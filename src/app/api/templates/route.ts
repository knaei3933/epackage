import { NextRequest, NextResponse } from 'next/server'

// Static export configuration
export const dynamic = 'force-static'

// Template data for different industries and purposes
const TEMPLATES = {
  cosmetics: {
    name_ja: '化粧品業界用テンプレート',
    name_en: 'Cosmetics Industry Template',
    description_ja: 'プレミアム化粧品包装のための高級感のあるデザインテンプレート',
    description_en: 'Premium design template for premium cosmetics packaging',
    features: ['高級感', '安全性', '環境配慮'],
    thumbnail: '/images/templates/cosmetics-preview.jpg',
    download_url: '/templates/cosmetics-template.zip'
  },
  food: {
    name_ja: '食品業界用テンプレート',
    name_en: 'Food Industry Template',
    description_ja: '食品安全と鮮度保持を重視した食品包装テンプレート',
    description_en: 'Food safety and freshness-focused food packaging template',
    features: ['安全性', '鮮度保持', 'HACCP対応'],
    thumbnail: '/images/templates/food-preview.jpg',
    download_url: '/templates/food-template.zip'
  },
  electronics: {
    name_ja: '電子部品業界用テンプレート',
    name_en: 'Electronics Industry Template',
    description_ja: 'ESD対策と静電気防止に特化した電子部品包装テンプレート',
    description_en: 'ESD protection and anti-static specialized electronics packaging template',
    features: ['ESD対策', '静電気防止', '衝撃吸収'],
    thumbnail: '/images/templates/electronics-preview.jpg',
    download_url: '/templates/electronics-template.zip'
  },
  pharmaceutical: {
    name_ja: '医薬品業界用テンプレート',
    name_en: 'Pharmaceutical Industry Template',
    description_ja: 'GMP準拠と医薬品機法対応の医薬品包装テンプレート',
    description_en: 'GMP compliant and pharmaceutical law compliant pharmaceutical packaging template',
    features: ['GMP準拠', '薬機法対応', '品質保証'],
    thumbnail: '/images/templates/pharmaceutical-preview.jpg',
    download_url: '/templates/pharmaceutical-template.zip'
  },
  standard: {
    name_ja: '標準テンプレート',
    name_en: 'Standard Template',
    description_ja: '多目的に使用できる基本的な包装デザインテンプレート',
    description_en: 'Basic packaging design template suitable for multiple purposes',
    features: ['多用途', 'コストパフォーマンス', 'シンプルデザイン'],
    thumbnail: '/images/templates/standard-preview.jpg',
    download_url: '/templates/standard-template.zip'
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const industry = searchParams.get('industry')
    const locale = searchParams.get('locale') || 'ja'

    // Filter templates by industry if specified
    let templates = Object.values(TEMPLATES)
    if (industry && industry !== 'all') {
      templates = Object.entries(TEMPLATES)
        .filter(([key]) => key === industry)
        .map(([, template]) => template)
    }

    // Return templates data
    return NextResponse.json({
      success: true,
      data: templates,
      count: templates.length,
      available_industries: Object.keys(TEMPLATES),
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching templates:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'テンプレートの取得に失敗しました',
        message: error instanceof Error ? error.message : '不明なエラー'
      },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    )
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    }
  )
}