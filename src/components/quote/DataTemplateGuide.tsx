'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { MotionWrapper } from '@/components/ui/MotionWrapper'
import {
  Download,
  FileText,
  Info,
  CheckCircle,
  AlertTriangle,
  Eye,
  Settings,
  Upload,
  Image,
  Ruler,
  Palette,
  Printer,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

interface TemplateInfo {
  id: string
  name: string
  nameJa: string
  description: string
  descriptionJa: string
  file: string
  fileSize: string
  format: string
  specs: string[]
  specsJa: string[]
  compatibleWith: string[]
  recommendedUses: string[]
  recommendedUsesJa: string[]
}

const templateData: TemplateInfo[] = [
  {
    id: 'stand_pouch',
    name: 'Stand Pouch Template',
    nameJa: 'スタンドパウチテンプレート',
    description: 'Professional template for stand-up pouch design with gusset allowances',
    descriptionJa: 'マチ部分の余白を含んだスタンドパウチ用のプロフェッショナルテンプレート',
    file: '/images/inbound-data/standpouch.ai',
    fileSize: '2.4 MB',
    format: 'Adobe Illustrator (.ai)',
    specs: [
      'Size: Custom (specify dimensions)',
      'Resolution: 300 DPI',
      'Color: CMYK',
      'Bleed: 3mm on all sides',
      'Safe zone: 5mm from edges',
      'Includes bottom gusset template'
    ],
    specsJa: [
      'サイズ: カスタム（寸法指定）',
      '解像度: 300 DPI',
      'カラー: CMYK',
      '塗り足し: 全周3mm',
      '安全領域: 端から5mm',
      '底マチテンプレート含む'
    ],
    compatibleWith: ['Coffee', 'Snacks', 'Pet food', 'Health supplements', 'Cosmetics'],
    recommendedUses: [
      'Products requiring standing display',
      'Retail packaging with shelf presence',
      'Premium product presentation',
      'Multi-serve packaging'
    ],
    recommendedUsesJa: [
      '自立表示が必要な製品',
      '棚での陳列を考慮した小売包装',
      '高級製品のプレゼンテーション',
      'マルチサーブ包装'
    ]
  },
  {
    id: 'three_seal',
    name: 'Three-Side Seal Pouch Template',
    nameJa: '三方シール平袋テンプレート',
    description: 'Template for flat three-side seal pouches, ideal for single-serve products',
    descriptionJa: 'ワンサーブ製品に最適な三方シール平袋用テンプレート',
    file: '/images/inbound-data/3sealpouch.ai',
    fileSize: '2.3 MB',
    format: 'Adobe Illustrator (.ai)',
    specs: [
      'Size: Custom (specify dimensions)',
      'Resolution: 300 DPI',
      'Color: CMYK',
      'Bleed: 3mm on three sides',
      'Seal area: 10mm from unsealed edge',
      'Flat design template'
    ],
    specsJa: [
      'サイズ: カスタム（寸法指定）',
      '解像度: 300 DPI',
      'カラー: CMYK',
      '塗り足し: 3辺3mm',
      'シール領域: 開放端から10mm',
      'フラットデザインテンプレート'
    ],
    compatibleWith: ['Sample packs', 'Single servings', 'Medical products', 'Spices', 'Powders'],
    recommendedUses: [
      'Sample and trial packaging',
      'Portion control packaging',
      'Medical and pharmaceutical products',
      'Cost-effective solutions'
    ],
    recommendedUsesJa: [
      'サンプル・トライアル包装',
      '分量管理包装',
      '医療・医薬品包装',
      'コスト効率の良いソリューション'
    ]
  },
  {
    id: 'm_seal',
    name: 'M-Seal Pouch Template',
    nameJa: 'Mシールパウチテンプレート',
    description: 'Template for M-seal pouches with secure closure system',
    descriptionJa: '確実なクロージャーシステム付きMシールパウチ用テンプレート',
    file: '/images/inbound-data/Msealpouch.ai',
    fileSize: '2.4 MB',
    format: 'Adobe Illustrator (.ai)',
    specs: [
      'Size: Custom (specify dimensions)',
      'Resolution: 300 DPI',
      'Color: CMYK',
      'Bleed: 3mm on all sides',
      'M-seal area: 15mm from top edge',
      'Resealable closure template'
    ],
    specsJa: [
      'サイズ: カスタム（寸法指定）',
      '解像度: 300 DPI',
      'カラー: CMYK',
      '塗り足し: 全周3mm',
      'Mシール領域: 上端から15mm',
      '再封可能クロージャーテンプレート'
    ],
    compatibleWith: ['Fresh food', 'Frozen products', 'Cheese', 'Bakery items', 'Confectionery'],
    recommendedUses: [
      'Products requiring multiple access',
      'Freshness preservation needs',
      'Consumer convenience focus',
      'Food service packaging'
    ],
    recommendedUsesJa: [
      '複数回アクセスが必要な製品',
      '鮮度保持のニーズ',
      '消費者の利便性重視',
      'フードサービス包装'
    ]
  },
  {
    id: 't_seal',
    name: 'T-Seal Pouch Template',
    nameJa: 'Tシールパウチテンプレート',
    description: 'Template for T-seal pouches with specialized closure design',
    descriptionJa: '特殊なクロージャーデザイン付きTシールパウチ用テンプレート',
    file: '/images/inbound-data/Tseal pouch.ai',
    fileSize: '2.3 MB',
    format: 'Adobe Illustrator (.ai)',
    specs: [
      'Size: Custom (specify dimensions)',
      'Resolution: 300 DPI',
      'Color: CMYK',
      'Bleed: 3mm on all sides',
      'T-seal configuration template',
      'Specialized opening area'
    ],
    specsJa: [
      'サイズ: カスタム（寸法指定）',
      '解像度: 300 DPI',
      'カラー: CMYK',
      '塗り足し: 全周3mm',
      'Tシール構成テンプレート',
      '特殊開口部'
    ],
    compatibleWith: ['Industrial products', 'Bulk packaging', 'Hardware', 'Components', 'Chemicals'],
    recommendedUses: [
      'Heavy-duty applications',
      'Industrial component packaging',
      'Secure containment needs',
      'Specialized product requirements'
    ],
    recommendedUsesJa: [
      'ヘビーデューティーアプリケーション',
      '工業部品包装',
      '安全な封入ニーズ',
      '特殊な製品要件'
    ]
  }
]

interface DataTemplateGuideProps {
  language?: 'en' | 'ja'
  onTemplateSelect?: (template: TemplateInfo) => void
}

export function DataTemplateGuide({
  language = 'ja',
  onTemplateSelect
}: DataTemplateGuideProps) {
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null)
  const [downloadedTemplates, setDownloadedTemplates] = useState<Set<string>>(new Set())

  const handleDownload = (template: TemplateInfo) => {
    // In a real implementation, this would trigger file download
    const link = document.createElement('a')
    link.href = template.file
    link.download = `${template.id}_template.ai`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setDownloadedTemplates(prev => new Set([...prev, template.id]))
  }

  const toggleExpand = (templateId: string) => {
    setExpandedTemplate(prev =>
      prev === templateId ? null : templateId
    )
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <MotionWrapper delay={0.1}>
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 bg-brixa-100 text-brixa-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <FileText className="w-4 h-4" />
            <span>{language === 'ja' ? 'デザインテンプレートガイド' : 'Design Template Guide'}</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {language === 'ja'
              ? 'プロ仕様のデザインテンプレート'
              : 'Professional Design Templates'
            }
          </h2>

          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            {language === 'ja'
              ? '正確な製品仕様を確保するための、Adobe Illustrator形式のデザインテンプレートをダウンロードしてください。各テンプレートには適切な塗り足し、安全領域、製造仕様が含まれています。'
              : 'Download our Adobe Illustrator design templates to ensure accurate product specifications. Each template includes proper bleed, safe zones, and manufacturing specifications.'
            }
          </p>
        </div>
      </MotionWrapper>

      {/* Quick Guide Cards */}
      <MotionWrapper delay={0.2}>
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-navy-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Download className="w-8 h-8 text-navy-700" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              {language === 'ja' ? '1. テンプレートを選択' : '1. Select Template'}
            </h3>
            <p className="text-sm text-gray-600">
              {language === 'ja'
                ? '製品タイプに合ったテンプレートを選択します'
                : 'Choose the template matching your product type'
              }
            </p>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              {language === 'ja' ? '2. デザインを作成' : '2. Create Design'}
            </h3>
            <p className="text-sm text-gray-600">
              {language === 'ja'
                ? 'テンプレートに沿ってデザインを作成します'
                : 'Create your design following the template guidelines'
              }
            </p>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              {language === 'ja' ? '3. データを提出' : '3. Submit Data'}
            </h3>
            <p className="text-sm text-gray-600">
              {language === 'ja'
                ? '完成したデザインデータをご提出ください'
                : 'Submit your completed design files'
              }
            </p>
          </Card>
        </div>
      </MotionWrapper>

      {/* Template Cards */}
      <div className="space-y-4">
        {templateData.map((template, index) => (
          <MotionWrapper key={template.id} delay={0.3 + index * 0.1}>
            <Card className="overflow-hidden border-2 transition-all duration-300 hover:shadow-lg">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-brixa-600 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {language === 'ja' ? template.nameJa : template.name}
                      </CardTitle>
                      <p className="text-sm text-gray-600">
                        {template.format} • {template.fileSize}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {downloadedTemplates.has(template.id) && (
                      <div className="flex items-center space-x-1 text-green-600 bg-green-100 px-2 py-1 rounded-full text-sm">
                        <CheckCircle className="w-4 h-4" />
                        <span>{language === 'ja' ? 'ダウンロード済み' : 'Downloaded'}</span>
                      </div>
                    )}

                    <Button
                      onClick={() => handleDownload(template)}
                      className="flex items-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>{language === 'ja' ? 'ダウンロード' : 'Download'}</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <p className="text-gray-600 mb-4">
                  {language === 'ja' ? template.descriptionJa : template.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {template.compatibleWith.map((product, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-navy-600 text-navy-600 rounded-full text-xs"
                    >
                      {product}
                    </span>
                  ))}
                </div>

                {/* Expandable Details */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleExpand(template.id)}
                  className="w-full flex items-center justify-center space-x-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>
                    {language === 'ja'
                      ? `${expandedTemplate === template.id ? '詳細を非表示' : '詳細を表示'}`
                      : `${expandedTemplate === template.id ? 'Hide Details' : 'Show Details'}`
                    }
                  </span>
                  {expandedTemplate === template.id ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>

                {expandedTemplate === template.id && (
                  <div className="mt-4 space-y-6 border-t pt-6">
                    {/* Technical Specifications */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Ruler className="w-5 h-5 mr-2 text-gray-600" />
                        {language === 'ja' ? '技術仕様' : 'Technical Specifications'}
                      </h4>
                      <ul className="space-y-2">
                        {(language === 'ja' ? template.specsJa : template.specs).map((spec, idx) => (
                          <li key={idx} className="flex items-start space-x-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{spec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Recommended Uses */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Info className="w-5 h-5 mr-2 text-gray-600" />
                        {language === 'ja' ? '推奨用途' : 'Recommended Uses'}
                      </h4>
                      <ul className="space-y-2">
                        {(language === 'ja' ? template.recommendedUsesJa : template.recommendedUses).map((use, idx) => (
                          <li key={idx} className="flex items-start space-x-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-navy-600 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{use}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </MotionWrapper>
        ))}
      </div>

      {/* Important Notes */}
      <MotionWrapper delay={0.8}>
        <Card className="bg-gradient-to-r from-yellow-50 to-brixa-50 border-yellow-200">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600" />
              {language === 'ja' ? '重要な注意事項' : 'Important Notes'}
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-800 flex items-center">
                  <Palette className="w-4 h-4 mr-2 text-navy-700" />
                  {language === 'ja' ? 'カラー設定' : 'Color Settings'}
                </h4>
                <ul className="text-sm text-gray-700 space-y-1 ml-6">
                  <li>• {language === 'ja' ? 'CMYKモードで作成してください' : 'Create in CMYK mode'}</li>
                  <li>• {language === 'ja' ? 'RGBは印刷で色が変わります' : 'RGB will change colors in printing'}</li>
                  <li>• {language === 'ja' ? '特色グラビアは事前にお問い合わせください' : 'Inquire about special gravure colors'}</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-800 flex items-center">
                  <Printer className="w-4 h-4 mr-2 text-green-600" />
                  {language === 'ja' ? '印刷仕様' : 'Print Specifications'}
                </h4>
                <ul className="text-sm text-gray-700 space-y-1 ml-6">
                  <li>• {language === 'ja' ? '解像度は300DPI以上で作成' : 'Create at 300DPI or higher'}</li>
                  <li>• {language === 'ja' ? 'テキストはアウトライン化してください' : 'Convert text to outlines'}</li>
                  <li>• {language === 'ja' ? '画像は埋め込みまたはリンクを含めて' : 'Embed images or include links'}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </MotionWrapper>

      {/* Call to Action */}
      <MotionWrapper delay={0.9}>
        <div className="text-center bg-gradient-to-r from-brixa-600 to-brixa-700 rounded-lg p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">
            {language === 'ja'
              ? '準備ができましたら、お見積りへ'
              : 'Ready to Get Your Quote?'
            }
          </h3>
          <p className="text-lg mb-6 opacity-90">
            {language === 'ja'
              ? 'テンプレートを使用してデザインを準備し、正確なお見積りをご依頼ください'
              : 'Prepare your design using our templates and get an accurate quote'
            }
          </p>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => {
              // Navigate to quote simulator
              window.location.href = '/quote-simulator'
            }}
            className="bg-white text-brixa-700 hover:bg-gray-50"
          >
            {language === 'ja' ? 'お見積りを開始' : 'Get Your Quote'}
          </Button>
        </div>
      </MotionWrapper>
    </div>
  )
}