/**
 * About Page
 *
 * 会社概要ページ
 * - 会社情報
 * - ビジョン・ミッション
 * - 会社沿革
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { Target, Lightbulb, Sprout, Zap, Handshake, Check } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { buttonVariants } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { headingFont } from '@/components/home/fonts';
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd';

export const metadata: Metadata = {
  title: '会社概要',
  description: 'Epackage Labの会社情報、ビジョン、ミッションをご紹介します。革新的な包装ソリューションで、お客様のビジネスを次のステージへ。小ロット500枚から大ロット大量生産まで対応するパッケージ製造のリーディングカンパニー。最短28日納品。化粧品・食品・医薬品業界向け最適な包装資材をご提供。',
  alternates: {
    canonical: 'https://www.package-lab.com/about',
  },
  openGraph: {
    title: '会社概要',
    description: 'Epackage Labの会社情報、ビジョン、ミッションをご紹介します。革新的な包装ソリューションで、お客様のビジネスを次のステージへ。',
    type: 'website',
    url: 'https://www.package-lab.com/about',
    images: [
      {
        url: 'https://www.package-lab.com/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Epackage Lab 会社概要',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '会社概要',
    description: 'Epackage Labの会社情報、ビジョン、ミッションをご紹介します。',
    images: ['https://www.package-lab.com/images/og-image.jpg'],
  },
};

const SECTION = 'py-16 md:py-24';
const INNER = 'mx-auto max-w-[1120px] px-4 sm:px-6';
const H2 = 'font-heading text-2xl md:text-[2rem] leading-[1.4] text-text-primary [word-break:keep-all] [overflow-wrap:anywhere]';

const companyLeft = [
  { dt: '会社名', dd: <>金井貿易株式会社</> },
  { dt: '設立', dd: <>2020年4月</> },
  { dt: '資本金', dd: <>1,000万円</> },
  { dt: '所在地', dd: <>〒673-0892 兵庫県明石市本町2-1-29 みなとメゾン明石本町2F</> },
];
const companyRight = [
  { dt: '代表取締役', dd: <>金　乾雄</> },
  { dt: '従業員数', dd: <>50名</> },
  { dt: '事業内容', dd: <>包装資材の製造・販売<br />包装設計・コンサルティング</> },
  { dt: '取引銀行', dd: <>三菱UFJ銀行<br />みずほ銀行</> },
];

export default function AboutPage() {
  return (
    <div className={`${headingFont.variable} min-h-screen bg-bg-primary`}>
      <BreadcrumbJsonLd pathname="/about" />
      <PageHeader
        title="会社概要"
        lead={
          <>
            革新的な包装ソリューションで、
            <br />
            お客様のビジネスを次のステージへ
          </>
        }
      />

      {/* Company Overview */}
      <section className={SECTION}>
        <div className={INNER}>
          <h2 className={H2}>会社情報</h2>

          <Card className="mt-8 grid gap-x-8 gap-y-6 p-6 md:grid-cols-2 md:p-8">
            {[companyLeft, companyRight].map((rows, i) => (
              <dl key={i} className="space-y-4">
                {rows.map(row => (
                  <div key={row.dt}>
                    <dt className="text-sm font-medium text-text-muted">{row.dt}</dt>
                    <dd className="text-base leading-[1.8] text-text-primary">{row.dd}</dd>
                  </div>
                ))}
              </dl>
            ))}
          </Card>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className={`${SECTION} bg-bg-secondary`}>
        <div className={INNER}>
          <h2 className={H2}>ビジョン・ミッション</h2>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Card className="p-6 md:p-8">
              <Target className="mb-4 h-8 w-8 text-brand" aria-hidden="true" />
              <h3 className="mb-4 text-xl font-bold text-text-primary">ビジョン</h3>
              <p className="leading-[1.8] text-text-secondary">
                包装の可能性を広げ、持続可能な未来を創造する。
                お客様のニーズに合わせた最適な包装ソリューションを提供し、
                業界のリーディングカンパニーとして、
                社会に貢献します。
              </p>
            </Card>

            <Card className="p-6 md:p-8">
              <Lightbulb className="mb-4 h-8 w-8 text-brand" aria-hidden="true" />
              <h3 className="mb-4 text-xl font-bold text-text-primary">ミッション</h3>
              <ul className="space-y-3 text-text-secondary">
                {['高品質な包装資材の提供', '環境に配慮した持続可能な包装', 'お客様満足度の最大化', '技術革新への挑戦'].map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Company Values */}
      <section className={SECTION}>
        <div className={INNER}>
          <h2 className={H2}>企業理念</h2>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <Card className="p-6">
              <Sprout className="mb-4 h-8 w-8 text-brand" aria-hidden="true" />
              <h3 className="mb-3 text-lg font-bold text-text-primary">環境配慮</h3>
              <p className="text-text-secondary">
                地球環境を守るため、
                環境に優しい素材と
                製造プロセスを採用しています。
              </p>
            </Card>

            <Card className="p-6">
              <Zap className="mb-4 h-8 w-8 text-brand" aria-hidden="true" />
              <h3 className="mb-3 text-lg font-bold text-text-primary">スピード対応</h3>
              <p className="text-text-secondary">
                お客様のニーズに
                迅速に対応するため、
                効率的な体制を整えています。
              </p>
            </Card>

            <Card className="p-6">
              <Handshake className="mb-4 h-8 w-8 text-brand" aria-hidden="true" />
              <h3 className="mb-3 text-lg font-bold text-text-primary">パートナーシップ</h3>
              <p className="text-text-secondary">
                お客様との長期的な
                パートナーシップを重視し、
                共に成長します。
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-bg-inverted py-16 text-text-inverse md:py-24">
        <div className={INNER}>
          <h2 className="font-heading text-2xl leading-[1.4] [word-break:keep-all] [overflow-wrap:anywhere] md:text-[2rem]">
            お問い合わせ・お見積もり
          </h2>
          <p className="mt-4 max-w-[40em] leading-[1.8]">
            包装ソリューションについて、
            お気軽にご相談ください
          </p>
          <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-x-8">
            <Link href="/contact" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
              お問い合わせ
            </Link>
            <Link href="/quote-simulator" className="inline-flex min-h-11 items-center text-base underline underline-offset-4 hover:text-brand-soft">
              見積もる
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
