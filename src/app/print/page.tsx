import { Metadata } from 'next'
import { Layout } from '@/components/layout/Layout'
import { Container } from '@/components/ui/Container'
import { MotionWrapper } from '@/components/ui/MotionWrapper'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import {
  ArrowRight,
  Award,
  Factory,
  Globe,
  Package,
  Shield,
  Truck,
  Zap,
  CheckCircle,
  Star,
  TrendingUp,
  Users,
  Settings
} from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '印刷技術 | Epackage Lab - 最新設備と技術',
  description: 'Epackage Labの最先端印刷設備と技術力を紹介します。高品質なパッケージ印刷と製造技術で、お客様のニーズにお応えします。',
  keywords: ['印刷技術', 'パッケージ印刷', '製造設備', '品質管理', 'Epackage Lab設備'],
  openGraph: {
    title: '印刷技術 | Epackage Lab',
    description: '最新設備と技術で高品質なパッケージ印刷を提供するEpackage Labを紹介します。',
    type: 'website',
  },
}

// Facility Card Component
function FacilityCard({
  title,
  description,
  features,
  icon: Icon,
  delay,
  specs
}: {
  title: string
  description: string
  features: string[]
  icon: any
  delay: number
  specs?: string[]
}) {
  return (
    <MotionWrapper delay={delay}>
      <Card className="overflow-hidden group hover:shadow-2xl transition-all duration-300 bg-white border-t-4 border-t-navy-600">
        <div className="p-8">
          {/* Icon */}
          <div className="w-20 h-20 bg-gradient-to-br from-navy-600 to-navy-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <Icon className="w-10 h-10 text-navy-700" />
          </div>

          {/* Content */}
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            {title}
          </h3>

          <p className="text-gray-600 mb-6 leading-relaxed text-lg">
            {description}
          </p>

          {/* Features */}
          <div className="space-y-3 mb-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>

          {/* Specifications */}
          {specs && specs.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <h4 className="font-semibold text-gray-900 mb-2">主要仕様</h4>
              {specs.map((spec, index) => (
                <div key={index} className="text-sm text-gray-600">
                  • {spec}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Hover Effect */}
        <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-navy-600 to-navy-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
      </Card>
    </MotionWrapper>
  )
}

// Tech Highlight Component
function TechHighlight({
  title,
  value,
  description,
  icon: Icon,
  delay
}: {
  title: string
  value: string
  description: string
  icon: any
  delay: number
}) {
  return (
    <MotionWrapper delay={delay}>
      <div className="text-center p-6">
        <div className="w-16 h-16 bg-gradient-to-br from-brixa-600 to-brixa-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon className="w-8 h-8 text-brixa-700" />
        </div>
        <h3 className="text-3xl font-bold text-gray-900 mb-2">{value}</h3>
        <p className="text-lg font-semibold text-gray-800 mb-2">{title}</p>
        <p className="text-gray-600">{description}</p>
      </div>
    </MotionWrapper>
  )
}

export default function PrintPage() {
  const facilities = [
    {
      title: '自動印刷システム',
      description: '最新のグラビアおよびフレキソ印刷機により、精密な色再現と高い印刷品質を実現します。',
      icon: Settings,
      features: [
        '8色グラビア印刷機',
        '自動カラーマネジメントシステム',
        '高解像度印刷（400dpi）',
        '環境に優しいインク使用'
      ],
      specs: [
        '最大印刷幅：1,300mm',
        '印刷速度：150m/min',
        '精度：±0.1mm',
        '色再現率：99%以上'
      ]
    },
    {
      title: 'フィルムラミネート設備',
      description: '多層フィルムラミネート技術により、優れた保存性と耐久性を備えた包装材を生産します。',
      icon: Zap,
      features: [
        '5層同時ラミネート可能',
        '電子線架橋システム',
        '接着力最適化',
        'ガスバリア強化'
      ],
      specs: [
        'ラミネート幅：1,200mm',
        '生産速度：200m/min',
        '層間接着力：300g/15mm',
        '酸素透過率：最大0.1cc/m²/day'
      ]
    },
    {
      title: '自動加工ライン',
      description: 'コンピュータ制御システムにより、正確で一貫性のある品質の包装材を大量生産します。',
      icon: Factory,
      features: [
        '自動スリッターシステム',
        '精密ダイカッター',
        '自動検査装置',
        'スマートファクトリーシステム'
      ],
      specs: [
        '加工幅：1,300mm',
        '精度：±0.05mm',
        '不良率：0.1%以下',
        '稼働率：95%以上'
      ]
    },
    {
      title: '品質管理システム',
      description: '体系的な品質管理により、完璧な製品を保証します。',
      icon: Shield,
      features: [
        'リアルタイム品質モニタリング',
        '非破壊検査システム',
        '食品安全認証',
        '環境マネジメントシステム'
      ],
      specs: [
        '検査項目：50+種類',
        '自動検査率：100%',
        '品質保証期間：2年',
        '認証：食品安全規格対応'
      ]
    }
  ]

  const techHighlights = [
    {
      title: '年間生産能力',
      value: '15,000トン',
      description: '大規模生産設備による安定供給',
      icon: TrendingUp
    },
    {
      title: '生産品目',
      value: '500+種類',
      description: '多様な仕様とデザインの包装材',
      icon: Package
    },
    {
      title: '納入実績',
      value: '500+社',
      description: '国内外の著名企業との協力',
      icon: Users
    },
    {
      title: '技術保有',
      value: '30+件',
      description: '独自の特許技術力',
      icon: Award
    }
  ]

  const certifications = [
    {
      name: '食品安全規格',
      description: '日本の食品安全基準に対応',
      icon: Shield
    },
    {
      name: '品質管理',
      description: '体系的な品質管理体制',
      icon: Award
    },
    {
      name: '法規制準拠',
      description: '食品衛生法・薬機法対応',
      icon: CheckCircle
    }
  ]

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-navy-50 via-white to-brixa-50">
        <Container size="6xl">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <MotionWrapper delay={0.1}>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                <span className="block text-navy-700">最先端の生産設備と</span>
                <span className="block text-brixa-700">技術力で信頼を築きます</span>
              </h1>
            </MotionWrapper>

            <MotionWrapper delay={0.2}>
              <p className="text-xl text-gray-600 leading-relaxed">
                EPACKAGE社の最新設備と熟練した技術力により
                <br />
                世界最高水準の包装材を生産します
              </p>
            </MotionWrapper>

            <MotionWrapper delay={0.3}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button
                    variant="primary"
                    size="lg"
                    className="justify-center px-8 py-4 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Factory className="mr-2 h-5 w-5" />
                    生産施設見学
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>

                <Link href="/catalog">
                  <Button
                    variant="outline"
                    size="lg"
                    className="justify-center px-8 py-4 text-lg font-medium border-2 border-navy-700 text-navy-700 hover:bg-navy-700 hover:text-white transition-all duration-300"
                  >
                    <Package className="mr-2 h-5 w-5" />
                    製品一覧を見る
                  </Button>
                </Link>
              </div>
            </MotionWrapper>
          </div>
        </Container>
      </section>

      {/* Tech Highlights */}
      <section className="py-20 bg-white">
        <Container size="6xl">
          <MotionWrapper delay={0.2}>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                EPACKAGE社の技術力
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                数字で証明する生産能力と技術資産
              </p>
            </div>
          </MotionWrapper>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {techHighlights.map((highlight, index) => (
              <TechHighlight
                key={index}
                title={highlight.title}
                value={highlight.value}
                description={highlight.description}
                icon={highlight.icon}
                delay={0.3 + index * 0.1}
              />
            ))}
          </div>

          {/* Quote Section */}
          <MotionWrapper delay={0.7}>
            <div className="bg-gradient-to-r from-navy-700 to-navy-600 rounded-2xl p-12 text-center">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                30年のノウハウが詰まった生産技術
              </h3>
              <p className="text-navy-600 text-lg mb-8 max-w-3xl mx-auto">
                継続的な技術開発と設備投資により、お客様の期待を超える
                最高の包装材を作り続けています
              </p>
              <div className="flex justify-center space-x-6">
                <div className="flex items-center space-x-2 text-yellow-400">
                  <Star className="w-6 h-6 fill-current" />
                  <Star className="w-6 h-6 fill-current" />
                  <Star className="w-6 h-6 fill-current" />
                  <Star className="w-6 h-6 fill-current" />
                  <Star className="w-6 h-6 fill-current" />
                </div>
                <span className="text-white font-medium">顧客満足度 98%</span>
              </div>
            </div>
          </MotionWrapper>
        </Container>
      </section>

      {/* Facilities Section */}
      <section className="py-20 bg-gray-50">
        <Container size="6xl">
          <MotionWrapper delay={0.4}>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                最先端の生産設備
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                最新技術と自動化システムによる高品質包装材の生産
              </p>
            </div>
          </MotionWrapper>

          <div className="grid md:grid-cols-2 gap-8">
            {facilities.map((facility, index) => (
              <FacilityCard
                key={index}
                title={facility.title}
                description={facility.description}
                features={facility.features}
                icon={facility.icon}
                delay={0.5 + index * 0.1}
                specs={facility.specs}
              />
            ))}
          </div>
        </Container>
      </section>

      {/* Certifications Section */}
      <section className="py-20 bg-white">
        <Container size="6xl">
          <MotionWrapper delay={0.9}>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                国際品質認証
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                グローバル基準に適合した品質と安全を保証します
              </p>
            </div>
          </MotionWrapper>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {certifications.map((cert, index) => (
              <MotionWrapper key={index} delay={1.0 + index * 0.1}>
                <Card className="text-center p-6 hover:shadow-xl transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <cert.icon className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {cert.name}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {cert.description}
                  </p>
                </Card>
              </MotionWrapper>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-navy-700 to-brixa-700">
        <Container size="4xl" className="text-center">
          <MotionWrapper delay={1.4}>
            <div className="space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                生産施設を直接ご確認ください
              </h2>
              <p className="text-lg text-white/90 max-w-2xl mx-auto">
                最先端設備と生産工程を直接見学し
                <br />
                高品質包装材製造の全工程をご確認ください
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="justify-center bg-white text-navy-700 hover:bg-gray-50 font-medium"
                  >
                    <Truck className="mr-2 h-5 w-5" />
                    施設見学お申し込み
                  </Button>
                </Link>
                <Link href="/samples">
                  <Button
                    variant="outline"
                    size="lg"
                    className="justify-center border-white text-white hover:bg-white hover:text-navy-700 font-medium"
                  >
                    <Package className="mr-2 h-5 w-5" />
                    サンプル請求
                  </Button>
                </Link>
              </div>
            </div>
          </MotionWrapper>
        </Container>
      </section>
    </Layout>
  )
}