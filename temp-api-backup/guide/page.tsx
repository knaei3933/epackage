import { Metadata } from 'next'
import { Container } from '@/components/ui/Container'
import { Card } from '@/components/ui/Card'
import { MotionWrapper } from '@/components/ui/MotionWrapper'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import {
  Palette,
  Ruler,
  Image,
  FileText,
  Leaf,
  BookOpen,
  HelpCircle,
  Download,
  ArrowRight
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'デザインガイド | Epackage Lab - パッケージデザイン制作ガイド',
  description: 'Epackage Labの包括的なパッケージデザイン制作ガイド。色、サイズ、画像、白版、環境表示の基準と仕様について詳しく説明します。',
  keywords: [
    'パッケージデザイン',
    'デザインガイド',
    '制作ガイド',
    '色ガイド',
    'サイズガイド',
    '画像仕様',
    '白版',
    '環境表示',
    'Epackage Lab'
  ],
  openGraph: {
    title: 'デザインガイド | Epackage Lab',
    description: 'プロフェッショナルなパッケージデザイン制作ガイド',
    type: 'website',
  },
}

const guideSections = [
  {
    title: 'カラー',
    description: 'パッケージ印刷の色指定とカラーマッチング',
    href: '/guide/color',
    icon: Palette,
    color: 'from-red-500 to-red-600',
    features: ['CMYK指定', 'PANTONE対応', '色校正', '特殊インク'],
  },
  {
    title: 'サイズ',
    description: 'パッケージサイズと寸法の仕様',
    href: '/guide/size',
    icon: Ruler,
    color: 'from-blue-500 to-blue-600',
    features: ['精密測定', '許容範囲', '拡縮対応', '自動検証'],
  },
  {
    title: '画像',
    description: '画像データの仕様と解像度',
    href: '/guide/image',
    icon: Image,
    color: 'from-green-500 to-green-600',
    features: ['高解像度', 'フォーマット変換', '色変換', '自動最適化'],
  },
  {
    title: '白版',
    description: '白版（しろはん）の作成と用途',
    href: '/guide/shirohan',
    icon: FileText,
    color: 'from-purple-500 to-purple-600',
    features: ['レイアウト作成', '寸法指定', '配置ルール', '印刷対応'],
  },
  {
    title: '環境表示',
    description: '環境ラベルとサステナビリティ表示',
    href: '/guide/environmentaldisplay',
    icon: Leaf,
    color: 'from-emerald-500 to-emerald-600',
    features: ['環境マーク', 'リサイクル表示', '原材料情報', '法規対応'],
  },
]

const designStandards = [
  {
    category: 'ファイル形式',
    items: ['Illustrator CC (.ai)', 'Photoshop CC (.psd)', 'PDF (.pdf)', 'JPEG (.jpg)', 'TIFF (.tiff)'],
    icon: Palette,
  },
  {
    category: '解像度',
    items: ['300dpi以上', '実寸指定', 'アンチエイリアス適用', 'カラーモデル: CMYK'],
    icon: Image,
  },
  {
    category: 'カラーモファイル',
    items: ['CMYKカラープロファイル', 'DICカラー対応', 'スポットカラー', '透明度設定'],
    icon: BookOpen,
  },
  {
    category: 'フォント',
    items: ['アウトラインフォント', '埋め込み必須', '日本語フォント対応', 'フォントサイズ: 6pt以上'],
    icon: FileText,
  },
]

export default function GuidePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-brixa-50 via-white to-navy-50">
        <Container size="6xl">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <MotionWrapper delay={0.1}>
              <div className="inline-flex items-center space-x-2 bg-brixa-100 text-brixa-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <BookOpen className="w-4 h-4" />
                <span>デザイン制作ガイド</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                <span className="block text-brixa-600">プロフェッショナルな</span>
                <span className="block text-navy-600">パッケージデザイン</span>
              </h1>
            </MotionWrapper>

            <MotionWrapper delay={0.2}>
              <p className="text-xl text-gray-600 leading-relaxed">
                Epackage Labの厳格な品質基準で
                <br />
                最高品質のパッケージを作成しましょう
              </p>
            </MotionWrapper>

            <MotionWrapper delay={0.3}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button
                    variant="primary"
                    size="lg"
                    className="justify-center px-8 py-4 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 min-w-[200px]"
                  >
                    <HelpCircle className="mr-2 h-5 w-5" />
                    デザイン相談
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>

                <Link href="/samples">
                  <Button
                    variant="outline"
                    size="lg"
                    className="justify-center px-8 py-4 text-lg font-medium border-2 border-brixa-600 text-brixa-600 hover:bg-brixa-50 transition-all duration-300 min-w-[200px]"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    テンプレート
                  </Button>
                </Link>
              </div>
            </MotionWrapper>
          </div>
        </Container>
      </section>

      {/* Guide Sections Grid */}
      <section className="py-20 bg-white">
        <Container size="6xl">
          <MotionWrapper delay={0.4}>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                デザインガイド一覧
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                各種類の制作ガイドで、プロフェッショナルなパッケージデザインを学びましょう
              </p>
            </div>
          </MotionWrapper>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {guideSections.map((section, index) => {
              const IconComponent = section.icon
              return (
                <MotionWrapper key={index} delay={0.5 + index * 0.1}>
                  <Link href={section.href}>
                    <Card className="overflow-hidden group hover:shadow-2xl transition-all duration-300 border-t-4 border-t-transparent bg-white hover:border-t-brixa-600">
                      <div className={`bg-gradient-to-br ${section.color} p-1`}>
                        <div className="p-8">
                          {/* Icon */}
                          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <IconComponent className="w-10 h-10 text-gray-700" />
                          </div>

                          {/* Content */}
                          <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-brixa-600 transition-colors">
                            {section.title}
                          </h3>

                          <p className="text-gray-600 mb-4 leading-relaxed">
                            {section.description}
                          </p>

                          {/* Features */}
                          <div className="flex flex-wrap gap-2">
                            {section.features.map((feature, idx) => (
                              <span
                                key={idx}
                                className="inline-block px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Hover Effect */}
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-brixa-600 to-navy-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                    </Card>
                  </Link>
                </MotionWrapper>
              )
            })}
          </div>
        </Container>
      </section>

      {/* Design Standards */}
      <section className="py-20 bg-gray-50">
        <Container size="6xl">
          <MotionWrapper delay={0.7}>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                デザイン制作基準
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                品質の高いパッケージ制作のための基本仕様と要件
              </p>
            </div>
          </MotionWrapper>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {designStandards.map((standard, index) => {
              const IconComponent = standard.icon
              return (
                <MotionWrapper key={index} delay={0.8 + index * 0.1}>
                  <Card className="p-6 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-brixa-100 rounded-lg flex items-center justify-center">
                        <IconComponent className="w-6 h-6 text-brixa-700" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {standard.category}
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {standard.items.map((item, idx) => (
                        <div key={idx} className="flex items-center space-x-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          <span className="text-gray-700">{item}</span>
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

      {/* Support Section */}
      <section className="py-20 bg-gradient-to-r from-brixa-600 to-navy-600">
        <Container size="4xl" className="text-center">
          <MotionWrapper delay={1.0}>
            <div className="space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                デザインに関するご相談
              </h2>
              <p className="text-lg text-white/90 max-w-2xl mx-auto">
                デザインガイドに関するご質問や、専門家によるデザインサポートをご希望の場合は、
                お気軽にお問い合わせください
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="justify-center bg-white text-brixa-600 hover:bg-gray-50 font-medium min-w-[200px]"
                  >
                    <HelpCircle className="mr-2 h-5 w-5" />
                    専門家相談
                  </Button>
                </Link>

                <Link href="/guide">
                  <Button
                    variant="outline"
                    size="lg"
                    className="justify-center border-white text-white hover:bg-white hover:text-brixa-600 font-medium min-w-[200px]"
                  >
                    <BookOpen className="mr-2 h-5 w-5" />
                    ガイド詳細
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