import { Metadata } from 'next'
import { Layout } from '@/components/layout/Layout'
import { Container } from '@/components/ui/Container'
import { MotionWrapper } from '@/components/ui/MotionWrapper'
import { buttonVariants } from '@/components/ui/Button'
import { PageHeader } from '@/components/layout'
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
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'

export const metadata: Metadata = {
  title: '印刷技術 - 最新設備と技術',
  description: 'Epackage Labの最先端印刷設備と技術力を紹介します。高品質なパッケージ印刷と製造技術で、お客様のニーズにお応えします。',
  alternates: {
    canonical: 'https://www.package-lab.com/print',
  },
  openGraph: {
    title: '印刷技術',
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
    <MotionWrapper delay={delay} className="h-full">
      <Card className="h-full overflow-hidden">
        <div className="p-6 md:p-8">
          {/* Icon */}
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-md bg-brand-muted text-brand">
            <Icon className="h-7 w-7" aria-hidden="true" />
          </div>

          {/* Content */}
          <h3 className="mb-4 text-xl font-bold text-text-primary">
            {title}
          </h3>

          <p className="mb-6 leading-[1.8] text-text-secondary">
            {description}
          </p>

          {/* Features */}
          <ul className="mb-6 space-y-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
                <span className="text-text-primary">{feature}</span>
              </li>
            ))}
          </ul>

          {/* Specifications */}
          {specs && specs.length > 0 && (
            <div className="space-y-2 rounded-inner bg-bg-secondary p-4">
              <h4 className="mb-2 font-bold text-text-primary">主要仕様</h4>
              {specs.map((spec, index) => (
                <div key={index} className="text-sm text-text-secondary">
                  • {spec}
                </div>
              ))}
            </div>
          )}
        </div>
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
      <div className="border-t border-brand-soft pt-4">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-brand-muted text-brand">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
        <h3 className="mb-2 font-heading text-2xl text-text-primary">{value}</h3>
        <p className="mb-2 text-base font-bold text-text-primary">{title}</p>
        <p className="text-sm leading-[1.8] text-text-secondary">{description}</p>
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
        '品質保証システム',
        '環境マネジメントシステム'
      ],
      specs: [
        '検査項目：50+種類',
        '自動検査率：100%',
        '品質保証期間：2年',
        '認証：品質管理システム対応'
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
      name: '品質管理',
      description: '厳格な品質管理体制',
      icon: Shield
    },
    {
      name: '品質管理',
      description: '体系的な品質管理体制',
      icon: Award
    },
    {
      name: '法規制準拠',
      description: '厳格な品質管理対応',
      icon: CheckCircle
    }
  ]

  return (
    <Layout>
      <BreadcrumbJsonLd pathname="/print" />
      <PageHeader
        title={
          <>
            最先端の生産設備と
            <wbr />
            技術力で信頼を築きます
          </>
        }
        lead={
          <>
            EPACKAGE社の最新設備と熟練した技術力により
            <br />
            世界最高水準の包装材を生産します
          </>
        }
        actions={
          <>
            <Link href="/contact" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
              <Factory className="mr-2 h-5 w-5" aria-hidden="true" />
              生産施設見学
              <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
            </Link>
            <Link href="/catalog" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
              <Package className="mr-2 h-5 w-5" aria-hidden="true" />
              製品一覧を見る
            </Link>
          </>
        }
      />

      {/* Tech Highlights */}
      <section className="bg-bg-primary py-16 md:py-24">
        <Container size="6xl">
          <MotionWrapper delay={0.2}>
            <div className="mb-12">
              <h2 className="font-heading text-2xl leading-[1.4] text-text-primary [word-break:keep-all] supports-[word-break:auto-phrase]:[word-break:auto-phrase] [overflow-wrap:anywhere] text-balance md:text-[2rem]">
                EPACKAGE社の技術力
              </h2>
              <p className="mt-4 max-w-[40em] leading-[1.8] text-text-secondary">
                数字で証明する生産能力と技術資産
              </p>
            </div>
          </MotionWrapper>

          <div className="mb-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
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
            <div className="rounded-container border border-border-medium bg-bg-secondary p-8 md:p-12">
              <h3 className="mb-4 font-heading text-xl leading-[1.4] text-text-primary [word-break:keep-all] supports-[word-break:auto-phrase]:[word-break:auto-phrase] [overflow-wrap:anywhere] text-balance md:text-2xl">
                30年のノウハウが詰まった生産技術
              </h3>
              <p className="mb-8 max-w-[40em] leading-[1.8] text-text-secondary">
                継続的な技術開発と設備投資により、お客様の期待を超える
                最高の包装材を作り続けています
              </p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <div className="flex items-center gap-1 text-brand" aria-hidden="true">
                  <Star className="h-6 w-6 fill-current" />
                  <Star className="h-6 w-6 fill-current" />
                  <Star className="h-6 w-6 fill-current" />
                  <Star className="h-6 w-6 fill-current" />
                  <Star className="h-6 w-6 fill-current" />
                </div>
                <span className="font-medium text-text-primary">顧客満足度 98%</span>
              </div>
            </div>
          </MotionWrapper>
        </Container>
      </section>

      {/* Facilities Section */}
      <section className="bg-bg-secondary py-16 md:py-24">
        <Container size="6xl">
          <MotionWrapper delay={0.4}>
            <div className="mb-12">
              <h2 className="font-heading text-2xl leading-[1.4] text-text-primary [word-break:keep-all] supports-[word-break:auto-phrase]:[word-break:auto-phrase] [overflow-wrap:anywhere] text-balance md:text-[2rem]">
                最先端の生産設備
              </h2>
              <p className="mt-4 max-w-[40em] leading-[1.8] text-text-secondary">
                最新技術と自動化システムによる高品質包装材の生産
              </p>
            </div>
          </MotionWrapper>

          <div className="grid gap-6 md:grid-cols-2">
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
      <section className="bg-bg-primary py-16 md:py-24">
        <Container size="6xl">
          <MotionWrapper delay={0.9}>
            <div className="mb-12">
              <h2 className="font-heading text-2xl leading-[1.4] text-text-primary [word-break:keep-all] supports-[word-break:auto-phrase]:[word-break:auto-phrase] [overflow-wrap:anywhere] text-balance md:text-[2rem]">
                国際品質認証
              </h2>
              <p className="mt-4 max-w-[40em] leading-[1.8] text-text-secondary">
                グローバル基準に適合した品質と安全を保証します
              </p>
            </div>
          </MotionWrapper>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {certifications.map((cert, index) => (
              <MotionWrapper key={index} delay={1.0 + index * 0.1} className="h-full">
                <Card className="h-full p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-brand-muted text-brand">
                    <cert.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-text-primary">
                    {cert.name}
                  </h3>
                  <p className="text-sm leading-[1.8] text-text-secondary">
                    {cert.description}
                  </p>
                </Card>
              </MotionWrapper>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="bg-bg-primary pb-16 md:pb-24">
        <Container size="6xl">
          <MotionWrapper delay={1.4}>
            <div className="rounded-container bg-bg-inverted p-6 text-text-inverse sm:p-8 md:p-12">
              <h2 className="font-heading text-2xl leading-[1.4] [word-break:keep-all] supports-[word-break:auto-phrase]:[word-break:auto-phrase] [overflow-wrap:anywhere] text-balance md:text-[2rem]">
                生産施設を直接ご確認ください
              </h2>
              <p className="mt-4 max-w-[40em] leading-[1.8]">
                最先端設備と生産工程を直接見学し
                <br />
                高品質包装材製造の全工程をご確認ください
              </p>
              <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-x-8">
                <Link href="/contact" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
                  <Truck className="mr-2 h-5 w-5" aria-hidden="true" />
                  施設見学お申し込み
                </Link>
                <Link
                  href="/samples"
                  className="inline-flex min-h-11 items-center text-base underline underline-offset-4 hover:text-brand-soft"
                >
                  サンプル請求
                </Link>
              </div>
            </div>
          </MotionWrapper>
        </Container>
      </section>
    </Layout>
  )
}
