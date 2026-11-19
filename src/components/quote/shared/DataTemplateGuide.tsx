'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
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
        <div>
          <h2 className="font-heading text-2xl leading-[1.4] text-text-primary [word-break:keep-all] supports-[word-break:auto-phrase]:[word-break:auto-phrase] [overflow-wrap:anywhere] text-balance md:text-[2rem] mb-4">
            {language === 'ja'
              ? <>プロ仕様の<wbr />デザイン<wbr />テンプレート</>
              : 'Professional Design Templates'
            }
          </h2>

          <p className="max-w-[40em] leading-[1.8] text-text-secondary mb-8">
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
          <Card className="text-center p-6">
            <div className="w-14 h-14 bg-brand-muted rounded-container flex items-center justify-center mx-auto mb-4">
              <Download className="w-7 h-7 text-brand" />
            </div>
            <h3 className="font-bold text-text-primary mb-2">
              {language === 'ja' ? '1. テンプレートを選択' : '1. Select Template'}
            </h3>
            <p className="text-sm text-text-secondary">
              {language === 'ja'
                ? '製品タイプに合ったテンプレートを選択します'
                : 'Choose the template matching your product type'
              }
            </p>
          </Card>

          <Card className="text-center p-6">
            <div className="w-14 h-14 bg-brand-muted rounded-container flex items-center justify-center mx-auto mb-4">
              <Settings className="w-7 h-7 text-brand" />
            </div>
            <h3 className="font-bold text-text-primary mb-2">
              {language === 'ja' ? '2. デザインを作成' : '2. Create Design'}
            </h3>
            <p className="text-sm text-text-secondary">
              {language === 'ja'
                ? 'テンプレートに沿ってデザインを作成します'
                : 'Create your design following the template guidelines'
              }
            </p>
          </Card>

          <Card className="text-center p-6">
            <div className="w-14 h-14 bg-brand-muted rounded-container flex items-center justify-center mx-auto mb-4">
              <Upload className="w-7 h-7 text-brand" />
            </div>
            <h3 className="font-bold text-text-primary mb-2">
              {language === 'ja' ? '3. データを提出' : '3. Submit Data'}
            </h3>
            <p className="text-sm text-text-secondary">
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
            <Card className="overflow-hidden">
              <CardHeader className="bg-bg-secondary">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-brand rounded-container flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-on-brand" aria-hidden="true" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {language === 'ja' ? template.nameJa : template.name}
                      </CardTitle>
                      <p className="text-sm text-text-secondary">
                        {template.format} • {template.fileSize}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {downloadedTemplates.has(template.id) && (
                      <Badge variant="success" size="lg" className="gap-1">
                        <CheckCircle className="w-4 h-4" aria-hidden="true" />
                        <span>{language === 'ja' ? 'ダウンロード済み' : 'Downloaded'}</span>
                      </Badge>
                    )}

                    <Button
                      onClick={() => handleDownload(template)}
                      icon={<Download className="w-4 h-4" aria-hidden="true" />}
                    >
                      <span>{language === 'ja' ? 'ダウンロード' : 'Download'}</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <p className="text-text-secondary mb-4">
                  {language === 'ja' ? template.descriptionJa : template.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {template.compatibleWith.map((product, idx) => (
                    <Badge key={idx} variant="secondary">
                      {product}
                    </Badge>
                  ))}
                </div>

                {/* Expandable Details */}
                <Button
                  variant="outline"
                  onClick={() => toggleExpand(template.id)}
                  className="w-full"
                  aria-expanded={expandedTemplate === template.id}
                  icon={<Eye className="w-4 h-4" aria-hidden="true" />}
                >
                  <span>
                    {language === 'ja'
                      ? `${expandedTemplate === template.id ? '詳細を非表示' : '詳細を表示'}`
                      : `${expandedTemplate === template.id ? 'Hide Details' : 'Show Details'}`
                    }
                  </span>
                  {expandedTemplate === template.id ? (
                    <ChevronUp className="ml-2 w-4 h-4" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="ml-2 w-4 h-4" aria-hidden="true" />
                  )}
                </Button>

                {expandedTemplate === template.id && (
                  <div className="mt-4 space-y-6 border-t border-border-medium pt-6">
                    {/* Technical Specifications */}
                    <div>
                      <h4 className="font-bold text-text-primary mb-3 flex items-center">
                        <Ruler className="w-5 h-5 mr-2 text-brand" />
                        {language === 'ja' ? '技術仕様' : 'Technical Specifications'}
                      </h4>
                      <ul className="space-y-2">
                        {(language === 'ja' ? template.specsJa : template.specs).map((spec, idx) => (
                          <li key={idx} className="flex items-start space-x-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
                            <span className="text-text-secondary">{spec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Recommended Uses */}
                    <div>
                      <h4 className="font-bold text-text-primary mb-3 flex items-center">
                        <Info className="w-5 h-5 mr-2 text-brand" />
                        {language === 'ja' ? '推奨用途' : 'Recommended Uses'}
                      </h4>
                      <ul className="space-y-2">
                        {(language === 'ja' ? template.recommendedUsesJa : template.recommendedUses).map((use, idx) => (
                          <li key={idx} className="flex items-start space-x-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
                            <span className="text-text-secondary">{use}</span>
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
        <Card className="bg-warning-muted border-warning">
          <CardContent className="p-6">
            <h3 className="font-bold text-on-warning-muted mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-warning" />
              {language === 'ja' ? '重要な注意事項' : 'Important Notes'}
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-on-warning-muted flex items-center">
                  <Palette className="w-4 h-4 mr-2 text-warning" />
                  {language === 'ja' ? 'カラー設定' : 'Color Settings'}
                </h4>
                <ul className="text-sm text-on-warning-muted space-y-1 ml-6">
                  <li>• {language === 'ja' ? 'CMYKモードで作成してください' : 'Create in CMYK mode'}</li>
                  <li>• {language === 'ja' ? 'RGBは印刷で色が変わります' : 'RGB will change colors in printing'}</li>
                  <li>• {language === 'ja' ? '特色グラビアは事前にお問い合わせください' : 'Inquire about special gravure colors'}</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-on-warning-muted flex items-center">
                  <Printer className="w-4 h-4 mr-2 text-warning" />
                  {language === 'ja' ? '印刷仕様' : 'Print Specifications'}
                </h4>
                <ul className="text-sm text-on-warning-muted space-y-1 ml-6">
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
        <div className="rounded-container border border-border-medium bg-bg-secondary p-8 text-center">
          <h3 className="font-heading text-xl leading-[1.4] text-text-primary mb-4 [word-break:keep-all] supports-[word-break:auto-phrase]:[word-break:auto-phrase] [overflow-wrap:anywhere] text-balance md:text-2xl">
            {language === 'ja'
              ? '準備ができましたら、お見積りへ'
              : 'Ready to Get Your Quote?'
            }
          </h3>
          <p className="mx-auto mb-6 max-w-[40em] leading-[1.8] text-text-secondary">
            {language === 'ja'
              ? 'テンプレートを使用してデザインを準備し、正確なお見積りをご依頼ください'
              : 'Prepare your design using our templates and get an accurate quote'
            }
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => {
              // Navigate to quote simulator
              window.location.href = '/quote-simulator'
            }}
          >
            {language === 'ja' ? 'お見積りを開始' : 'Get Your Quote'}
          </Button>
        </div>
      </MotionWrapper>
    </div>
  )
}