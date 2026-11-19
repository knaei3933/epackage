'use client'

import { Container } from '@/components/ui/Container'
import { Card } from '@/components/ui/Card'
import { MotionWrapper } from '@/components/ui/MotionWrapper'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/layout'
import Link from 'next/link'
import {
  Palette,
  Ruler,
  Image as ImageIcon,
  FileText,
  Leaf,
  BookOpen,
  HelpCircle,
  Download,
  ArrowRight,
  ChevronRight,
  Check,
  Info
} from 'lucide-react'
import { useState } from 'react'

// アコーディオンセクションデータ
const accordionSections = [
  {
    id: 'color',
    title: 'カラー',
    description: 'パッケージ印刷の色指定とカラーマッチング',
    icon: Palette,
    content: {
      summary: 'CMYK指定、PANTONE対応、色校正、特殊インクによる精密な色再現',
      details: [
        {
          title: 'CMYK指定',
          description: 'プロセスカラー（4色分解）で指定。シアン、マゼンタ、イエロー、ブラックの4色を組み合わせて表現します。',
          tips: '特色はCMYKで指定してください。RGB指定は色味が変わる可能性があります。'
        },
        {
          title: 'PANTONE対応',
          description: 'ブランドカラーが必要な場合、PANTONEカラーも対応可能。別料金がかかります。',
          tips: '特色の色（金色、銀色など）はスポットカラーとして処理します。'
        },
        {
          title: '色校正',
          'description': '本印刷前に色校正紙を出力し、色味を確認します。',
          tips: '色校正は1回無料。2回目以降は別料金となります。'
        },
        {
          title: '特殊インク',
          description: 'ニス、蛍光インク、箔押しなどの特殊加工も対応可能。',
          tips: '商品によっては特殊インクが使用できない場合があります。'
        }
      ]
    }
  },
  {
    id: 'size',
    title: 'サイズ',
    description: 'パッケージサイズと寸法の仕様',
    icon: Ruler,
    content: {
      summary: '精密測定、許容範囲、拡縮対応、自動検証システムによる正確なサイズ管理',
      details: [
        {
          title: '精密測定',
          description: 'μm単位（ミクロン）の精度で測定可能。高精度なスリッター・切断機で正確なカットを実現。',
          tips: '±0.05mmの許容範囲内での製造が可能です。'
        },
        {
          title: '許容範囲',
          description: 'JIS規格に基づいた許容範囲を設定。サイズ変更のリクエストに柔軟に対応。',
          tips: '極端に厳しい公差が必要な場合は事前にご相談ください。'
        },
        {
          title: '拡縮対応',
          description: '熱収縮を考慮した設計。実際の使用条件に合わせた寸法調整が可能。',
          tips: '内容物のサイズに合わせてパウチのサイズも調整可能です。'
        },
        {
          title: '自動検証',
          description: 'AI画像認識システムで、製造時にサイズを自動検証し、不適合品を除外。',
          tips: '全数検査により、不良品の出荷を防いでいます。'
        }
      ]
    }
  },
  {
    id: 'image',
    title: '画像',
    description: '画像データの仕様と解像度',
    icon: ImageIcon,
    content: {
      summary: '高解像度、フォーマット変換、色変換、自動最適化による品質保証',
      details: [
        {
          title: '高解像度',
          description: '300dpi以上の解像度を推奨。印刷品質を保つため、低解像度の画像は避けてください。',
          tips: 'Web用の72dpi画像は印刷には不向きです。'
        },
        {
          title: 'フォーマット変換',
          description: 'AI、PSD、PDF、JPG、TIFFなど主要フォーマットに対応。自動で最適化処理を行います。',
          tips: 'PDF形式を推奨。レイヤー構造が保持されるため、編集が容易です。'
        },
        {
          title: '色変換',
          description: 'RGBからCMYKへの自動変換機能搭載。色味の変化を最小限に抑えます。',
          tips: '微妙なグラデーションは、変換後に色校正で確認することをお勧めします。'
        },
        {
          title: '自動最適化',
          description: 'アップロードされた画像を自動で解析し、最適な設定に調整。',
          tips: '解像度不足の画像は自動的に警告が表示されます。'
        }
      ]
    }
  },
  {
    id: 'shirohan',
    title: '白版',
    description: '白版（しろはん）の作成と用途',
    icon: FileText,
    content: {
      summary: 'レイアウト作成、寸法指定、配置ルール、印刷対応による白版作成支援',
      details: [
        {
          title: 'レイアウト作成',
          description: 'デザインソフトで作成した白版データをそのまま使用可能。印刷会社への共有もスムーズ。',
          tips: '文字やロゴを配置する際、印刷可能エリアを考慮してください。'
        },
        {
          title: '寸法指定',
          description: '実寸データでの作成を推奨。スケールを含まない実寸指定で正確なサイズを保証。',
          tips: '完成品のサイズでの作成を推奨します。'
        },
        {
          title: '配置ルール',
          description: '断ち切り位置やトンボ・フィルムのセーフティエリアを考慮した配置が必要。',
          tips: '断ち切り位置から3mm以上内側に文字やロゴを配置してください。'
        },
        {
          title: '印刷対応',
          description: '各種印刷方式（フレキソ、グラビア、デジタル）に対応した白版作成。',
          tips: '特殊印刷の場合、対応可能な印刷方法が異なる場合があります。'
        }
      ]
    }
  },
  {
    id: 'environmentaldisplay',
    title: '環境表示',
    description: '環境ラベルとサステナビリティ表示',
    icon: Leaf,
    content: {
      summary: '環境マーク、リサイクル表示、原材料情報、法規対応の徹底',
      details: [
        {
          title: '環境マーク',
          description: 'リサイクルマーク、グリーン購入法に対応した環境表示の作成支援。',
          tips: '環境表示の誤りは法律違反となる可能性があります。専門家にご相談ください。'
        },
        {
          title: 'リサイクル表示',
          description: 'プラスチック素材の種別マーク表示。容器包装リサイクル法に準拠。',
          tips: '製品素材に応じた正しいマークを使用してください。'
        },
        {
          title: '原材料情報',
          description: '製品に含まれる原材料の表示義務に対応。法的基準に準拠した記載。',
          tips: '各種法規制に対応した表示が必要です。'
        },
        {
          title: '法規対応',
          description: '最新の法規制に準拠した環境表示。随時アップデート。',
          tips: '法改正に対応するため、定期的な確認をお勧めします。'
        }
      ]
    }
  }
]

// クイックリファレンスデータ
const quickReferences = [
  { category: 'ファイル形式', items: ['Illustrator CC (.ai)', 'Photoshop CC (.psd)', 'PDF (.pdf)', 'JPEG (.jpg)', 'TIFF (.tiff)'] },
  { category: '解像度', items: ['300dpi以上推奨', '実寸指定', 'アンチエイリアス適用', 'カラーモデル: CMYK'] },
  { category: 'カラーファイル', items: ['CMYKプロファイル', 'PANTONEカラー対応', 'スポットカラー', '透明度設定'] },
  { category: 'フォント', items: ['アウトラインフォント推奨', '埋め込み必須', '日本語フォント対応', '最小サイズ: 6pt以上'] },
]

export default function GuidePage() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id)
  }

  return (
    <>
      {/* ページの頭（基準書「ページの型」） */}
      <MotionWrapper delay={0.1}>
        <PageHeader
          title="プロフェッショナルなパッケージデザイン"
          lead={
            <>
              Epackage Labの厳格な品質基準で
              <br />
              最高品質のパッケージを作成しましょう
            </>
          }
        >
          <ul className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-text-secondary">
            {['5つのガイドカテゴリ', '詳細な仕様説明', 'プロフェッショナル対応'].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-brand" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </PageHeader>
      </MotionWrapper>

      {/* アコーディオンガイドセクション - 新デザイン */}
      <section className="py-16 md:py-24 bg-bg-primary">
        <Container size="6xl">
          <MotionWrapper delay={0.4}>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                デザインガイドカテゴリ
              </h2>
              <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                各カテゴリーを展開して詳細なガイドを確認してください
              </p>
            </div>
          </MotionWrapper>

          <div className="space-y-4 max-w-4xl mx-auto">
            {accordionSections.map((section, index) => {
              const IconComponent = section.icon
              const isExpanded = expandedSection === section.id

              return (
                <MotionWrapper key={section.id} delay={0.5 + index * 0.1}>
                  <div className={`border rounded-container overflow-hidden transition-colors duration-300 ${
                    isExpanded
                      ? 'border-brand bg-brand-subtle'
                      : 'border-border-medium bg-bg-primary hover:shadow-low'
                  }`}>
                    {/* アコーディオンヘッダー */}
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-14 h-14 rounded-md bg-brand-muted flex items-center justify-center flex-shrink-0`}>
                          <IconComponent className="w-7 h-7 text-brand" aria-hidden="true" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-text-primary">
                            {section.title}
                          </h3>
                          <p className="text-sm text-text-secondary">
                            {section.description}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className={`w-6 h-6 text-text-muted transition-transform duration-300 ${
                        isExpanded ? 'rotate-90' : ''
                      }`} />
                    </button>

                    {/* 展開コンテンツ */}
                    {isExpanded && (
                      <div className="px-6 pb-6">
                        {/* サマリー */}
                        <div className="mb-6 p-4 bg-bg-primary rounded-md border border-border-medium">
                          <div className="flex items-start space-x-3">
                            <Info className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" aria-hidden="true" />
                            <p className="text-sm text-text-secondary leading-relaxed">
                              {section.content.summary}
                            </p>
                          </div>
                        </div>

                        {/* 詳細カード */}
                        <div className="grid md:grid-cols-2 gap-4">
                          {section.content.details.map((detail, idx) => (
                            <Card key={idx} className="p-5">
                              <div className="flex items-center space-x-3 mb-3">
                                <div className={`w-8 h-8 rounded-inner bg-brand flex items-center justify-center flex-shrink-0`}>
                                  <Check className="w-4 h-4 text-on-brand" aria-hidden="true" />
                                </div>
                                <h4 className="font-semibold text-text-primary">{detail.title}</h4>
                              </div>
                              <p className="text-sm text-text-secondary mb-3 leading-relaxed">
                                {detail.description}
                              </p>
                              <div className="flex items-start space-x-2 text-xs bg-brand-muted text-on-brand-muted px-3 py-2 rounded-md">
                                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                <span className="font-medium">{detail.tips}</span>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </MotionWrapper>
              )
            })}
          </div>
        </Container>
      </section>

      {/* クイックリファレンス - カード形式で改善 */}
      <section className="py-16 md:py-24 bg-bg-secondary">
        <Container size="6xl">
          <MotionWrapper delay={0.8}>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                クイックリファレンス
              </h2>
              <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                よく使う基本仕様の早見表
              </p>
            </div>
          </MotionWrapper>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {quickReferences.map((ref, index) => {
              const icons = [Palette, ImageIcon, BookOpen, FileText][index]
              const IconComponent = icons

              return (
                <MotionWrapper key={index} delay={0.9 + index * 0.1}>
                  <Card className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-brand-muted rounded-md flex items-center justify-center flex-shrink-0">
                        <IconComponent className="w-6 h-6 text-brand" aria-hidden="true" />
                      </div>
                      <h3 className="text-lg font-bold text-text-primary">{ref.category}</h3>
                    </div>
                    <div className="space-y-2">
                      {ref.items.map((item, idx) => (
                        <div key={idx} className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-brand rounded-full flex-shrink-0"></div>
                          <span className="text-sm text-text-secondary">{item}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </MotionWrapper>
              )
            })}
          </div>
        </Container>
      </section>

      {/* CTA Section（ページ末尾の紺の帯） */}
      <section className="py-16 md:py-24 bg-bg-inverted">
        <Container size="4xl" className="text-center">
          <MotionWrapper delay={1.0}>
            <div className="space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold text-text-inverse">
                デザインに関するご相談
              </h2>
              <p className="text-lg text-text-inverse max-w-2xl mx-auto">
                デザインガイドに関するご質問や、専門家によるデザインサポートをご希望の場合は、
                お気軽にお問い合わせください
              </p>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 items-center justify-center">
                <Link href="/contact">
                  <Button
                    variant="primary"
                    size="lg"
                    className="justify-center min-w-[200px]"
                  >
                    <HelpCircle className="mr-2 h-5 w-5" aria-hidden="true" />
                    専門家相談
                  </Button>
                </Link>
                <Link
                  href="/samples"
                  className="inline-flex min-h-[44px] items-center font-medium text-text-inverse underline underline-offset-4 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  <Download className="mr-2 h-5 w-5" aria-hidden="true" />
                  テンプレート
                </Link>
              </div>
            </div>
          </MotionWrapper>
        </Container>
      </section>
    </>
  )
}
