import { Metadata } from 'next'
import { Layout } from '@/components/layout/Layout'
import { Container } from '@/components/ui/Container'
import { MotionWrapper } from '@/components/ui/MotionWrapper'
import { buttonVariants } from '@/components/ui/Button'
import { PageHeader } from '@/components/layout'
import { Card } from '@/components/ui/Card'
import {
  ArrowLeft,
  Download,
  Settings,
  Upload,
  Phone,
  Mail,
  HelpCircle
} from 'lucide-react'
import Link from 'next/link'
import { DataTemplateGuide } from '@/components/quote/shared/DataTemplateGuide'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'

export const metadata: Metadata = {
  title: 'デザインテンプレート - プロ仕様の包装材デザイン',
  description: 'Epackage Labのプロ仕様デザインテンプレートをダウンロード。Adobe Illustrator形式で、正確な製造仕様に対応します。',
  openGraph: {
    title: 'デザインテンプレート',
    description: 'プロ仕様の包装材デザインテンプレートを無料ダウンロード',
    type: 'website',
  },
  alternates: {
    canonical: '/data-templates',
  },
}

export default function DataTemplatesPage() {
  return (
    <Layout>
      <BreadcrumbJsonLd pathname="/data-templates" />
      <div className="min-h-screen">
        <PageHeader
          title={<>包装材の<wbr />デザインテンプレート</>}
          lead={
            <>
              Adobe Illustrator形式のプロ仕様テンプレートで、
              <br />
              正確な製品仕様と最高品質の印刷を実現します
            </>
          }
          actions={
            <>
              <Link href="/quote-simulator" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
                <Settings className="mr-2 h-5 w-5" aria-hidden="true" />
                お見積りを開始
              </Link>
              <Link href="/contact" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
                <HelpCircle className="mr-2 h-5 w-5" aria-hidden="true" />
                デザインサポート
              </Link>
            </>
          }
        />

        {/* Template Guide */}
        <section className="bg-bg-primary py-16 md:py-24">
          <Container size="6xl">
            <DataTemplateGuide language="ja" />
          </Container>
        </section>

        {/* Support Section */}
        <section className="bg-bg-secondary py-16 md:py-24">
          <Container size="6xl">
            <MotionWrapper delay={0.5}>
              <div className="mb-12">
                <h2 className="font-heading text-2xl leading-[1.4] text-text-primary [word-break:keep-all] supports-[word-break:auto-phrase]:[word-break:auto-phrase] [overflow-wrap:anywhere] text-balance md:text-[2rem]">
                  デザインサポートをご利用ください
                </h2>
                <p className="mt-4 max-w-[40em] leading-[1.8] text-text-secondary">
                  テンプレートの使用方法からデザインの完成まで、
                  専門スタッフが丁寧にサポートいたします
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <Card className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-brand-muted text-brand">
                    <Phone className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-text-primary">
                    電話でご相談
                  </h3>
                  <p className="mb-4 leading-[1.8] text-text-secondary">
                    テンプレートの使用方法や
                    デザインに関するご質問
                  </p>
                  <a
                    href="tel:+815036139673"
                    className="inline-flex min-h-11 items-center font-medium text-brand underline underline-offset-4 hover:text-brand-pressed"
                  >
                    050-3613-9673
                  </a>
                </Card>

                <Card className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-brand-muted text-brand">
                    <Mail className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-text-primary">
                    メールでご相談
                  </h3>
                  <p className="mb-4 leading-[1.8] text-text-secondary">
                    デザインデータの確認や
                    技術的なご質問にお答えします
                  </p>
                  <a
                    href="mailto:info@package-lab.com"
                    className="inline-flex min-h-11 items-center break-all font-medium text-brand underline underline-offset-4 hover:text-brand-pressed"
                  >
                    info@package-lab.com
                  </a>
                </Card>

                <Card className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-brand-muted text-brand">
                    <Upload className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-text-primary">
                    デザインサービス
                  </h3>
                  <p className="mb-4 leading-[1.8] text-text-secondary">
                    プロのデザイナーが
                    完成したデザインデータを作成します
                  </p>
                  <Link href="/contact" className={buttonVariants({ variant: 'outline', size: 'sm' }) + ' max-sm:h-11'}>
                    詳細を見る
                  </Link>
                </Card>
              </div>
            </MotionWrapper>
          </Container>
        </section>

        {/* FAQ Section */}
        <section className="bg-bg-primary py-16 md:py-24">
          <Container size="4xl">
            <MotionWrapper delay={0.6}>
              <div className="mb-12">
                <h2 className="font-heading text-2xl leading-[1.4] text-text-primary [word-break:keep-all] supports-[word-break:auto-phrase]:[word-break:auto-phrase] [overflow-wrap:anywhere] text-balance md:text-[2rem]">
                  よくあるご質問
                </h2>
                <p className="mt-4 leading-[1.8] text-text-secondary">
                  テンプレート使用に関するよくある質問にお答えします
                </p>
              </div>

              <div className="space-y-6">
                {[
                  {
                    q: "どのソフトウェアでテンプレートを開けますか？",
                    a: "Adobe Illustrator（CS6以降）で開くことをお勧めします。他のソフトウェアでも開ける場合がありますが、正確な仕様を維持するためIllustratorのご使用をお勧めします。"
                  },
                  {
                    q: "テンプレートのサイズを変更できますか？",
                    a: "はい、テンプレートはカスタムサイズに対応しています。ただし、塗り足しや安全領域の仕様を維持するため、比例拡大・縮小でご対応ください。"
                  },
                  {
                    q: "特色印刷は対応していますか？",
                    a: "はい、特色グラビア印刷に対応しています。デザイン段階で特色の指定がある場合は、お見積りの際にお知らせください。"
                  },
                  {
                    q: "完成したデザインデータの提出方法は？",
                    a: "お見積りフォームからAIファイルを直接アップロードいただくか、メールでお送りください。ファイルサイズが大きい場合は、WeTransferなどのファイル転送サービスをご利用ください。"
                  }
                ].map((faq, index) => (
                  <Card key={index} className="p-6">
                    <h3 className="mb-3 font-bold text-text-primary [word-break:keep-all] supports-[word-break:auto-phrase]:[word-break:auto-phrase] [overflow-wrap:anywhere] text-balance">
                      Q. {faq.q}
                    </h3>
                    <p className="leading-[1.8] text-text-primary">
                      A. {faq.a}
                    </p>
                  </Card>
                ))}
              </div>
            </MotionWrapper>
          </Container>
        </section>
      </div>
    </Layout>
  )
}
