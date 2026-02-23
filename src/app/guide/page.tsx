'use client'

import { Container } from '@/components/ui/Container'
import { Card } from '@/components/ui/Card'
import { MotionWrapper } from '@/components/ui/MotionWrapper'
import { Button } from '@/components/ui/Button'
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
  Sparkles,
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
    color: 'from-red-500 to-rose-600',
    bgColor: 'bg-red-50 dark:bg-red-950',
    borderColor: 'border-red-200 dark:border-red-800',
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
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    borderColor: 'border-blue-200 dark:border-blue-800',
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
    color: 'from-green-500 to-emerald-600',
    bgColor: 'bg-green-50 dark:bg-green-950',
    borderColor: 'border-green-200 dark:border-green-800',
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
    color: 'from-purple-500 to-violet-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950',
    borderColor: 'border-purple-200 dark:border-purple-800',
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
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
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
          tips: '食品衛生法、薬機法等の法規制に対応した表示が必要です。'
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
      {/* Hero Section - 改善版 */}
      <section className="relative py-24 bg-gradient-to-br from-slate-900 via-navy-800 to-brixa-900 overflow-hidden">
        {/* 背景デコレーション */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-brixa-500 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>

        <Container size="6xl" className="relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <MotionWrapper delay={0.1}>
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm text-white px-5 py-2.5 rounded-full text-sm font-medium mb-6 border border-white/20">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span>デザイン制作ガイド</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
                プロフェッショナルな
                <span className="block bg-gradient-to-r from-brixa-300 to-emerald-300 bg-clip-text text-transparent">
                  パッケージデザイン
                </span>
              </h1>
            </MotionWrapper>

            <MotionWrapper delay={0.2}>
              <p className="text-xl text-gray-300 leading-relaxed">
                Epackage Labの厳格な品質基準で
                <br />
                最高品質のパッケージを作成しましょう
              </p>
            </MotionWrapper>

            {/* 統計情報 */}
            <MotionWrapper delay={0.3}>
              <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span>5つのガイドカテゴリ</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span>詳細な仕様説明</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span>プロフェッショナル対応</span>
                </div>
              </div>
            </MotionWrapper>
          </div>
        </Container>
      </section>

      {/* アコーディオンガイドセクション - 新デザイン */}
      <section className="py-20 bg-white">
        <Container size="6xl">
          <MotionWrapper delay={0.4}>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                デザインガイドカテゴリ
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
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
                  <div className={`border-2 rounded-2xl overflow-hidden transition-all duration-300 ${
                    isExpanded
                      ? `${section.borderColor} ${section.bgColor}`
                      : 'border-gray-200 bg-white hover:shadow-lg'
                  }`}>
                    {/* アコーディオンヘッダー */}
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                          <IconComponent className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <h3 className={`text-xl font-bold ${isExpanded ? section.color.replace('from-', 'text-').split(' ')[0] : 'text-gray-900'}`}>
                            {section.title}
                          </h3>
                          <p className={`text-sm ${isExpanded ? 'text-gray-600' : 'text-gray-500'}`}>
                            {section.description}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${
                        isExpanded ? 'rotate-90' : ''
                      }`} />
                    </button>

                    {/* 展開コンテンツ */}
                    {isExpanded && (
                      <div className="px-6 pb-6">
                        {/* サマリー */}
                        <div className="mb-6 p-4 bg-white/50 rounded-lg border border-gray-200">
                          <div className="flex items-start space-x-3">
                            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {section.content.summary}
                            </p>
                          </div>
                        </div>

                        {/* 詳細カード */}
                        <div className="grid md:grid-cols-2 gap-4">
                          {section.content.details.map((detail, idx) => (
                            <Card key={idx} className="p-5 bg-white border border-gray-200 hover:shadow-md transition-shadow">
                              <div className="flex items-center space-x-3 mb-3">
                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${section.color} flex items-center justify-center flex-shrink-0`}>
                                  <Check className="w-4 h-4 text-white" />
                                </div>
                                <h4 className="font-semibold text-gray-900">{detail.title}</h4>
                              </div>
                              <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                                {detail.description}
                              </p>
                              <div className="flex items-start space-x-2 text-xs bg-blue-50 text-blue-700 px-3 py-2 rounded-lg">
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
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <Container size="6xl">
          <MotionWrapper delay={0.8}>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                クイックリファレンス
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
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
                  <Card className="p-6 border-t-4 border-t-brixa-600 hover:shadow-xl transition-all duration-300 bg-white">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-brixa-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <IconComponent className="w-6 h-6 text-brixa-700" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">{ref.category}</h3>
                    </div>
                    <div className="space-y-2">
                      {ref.items.map((item, idx) => (
                        <div key={idx} className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                          <span className="text-sm text-gray-700">{item}</span>
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

      {/* CTA Section - 改善版 */}
      <section className="py-20 bg-gradient-to-r from-brixa-600 via-navy-700 to-navy-800">
        <Container size="4xl" className="text-center">
          <MotionWrapper delay={1.0}>
            <div className="space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                デザインに関するご相談
              </h2>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                デザインガイドに関するご質問や、専門家によるデザインサポートをご希望の場合は、
                お気軽にお問い合わせください
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="justify-center bg-white text-brixa-700 hover:bg-gray-50 font-medium min-w-[200px] shadow-lg"
                  >
                    <HelpCircle className="mr-2 h-5 w-5" />
                    専門家相談
                  </Button>
                </Link>
                <Link href="/samples">
                  <Button
                    variant="outline"
                    size="lg"
                    className="justify-center border-white text-white hover:bg-white hover:text-brixa-700 font-medium min-w-[200px]"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    テンプレート
                  </Button>
                </Link>
              </div>
            </div>
          </MotionWrapper>
        </Container>
      </section>
    </>
  )
}
