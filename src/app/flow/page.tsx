import { Metadata } from 'next'
import { Layout } from '@/components/layout/Layout'
import { PageHeader } from '@/components/layout'
import { ManufacturingProcessShowcase } from '@/components/home/ManufacturingProcessShowcase'
import { Container } from '@/components/ui/Container'
import { MotionWrapper } from '@/components/ui/MotionWrapper'
import { buttonVariants } from '@/components/ui/Button'
import { ArrowRight, FileText, Package } from 'lucide-react'
import Link from 'next/link'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { headingFont } from '@/components/home/fonts'

export const metadata: Metadata = {
  title: '製造工程 - デジタル印刷・環境配慮型包装材製造',
  description: 'Epackage Labの先進製造工程。HP Indigoデジタル印刷、NON-VOC対応製造、KARLVILLE高精度加工、一貫生産システムで30日間納品。',
  alternates: {
    canonical: 'https://www.package-lab.com/flow',
  },
  openGraph: {
    title: '製造工程',
    description: '最新技術による包装材製造工程。デジタル印刷から精密加工まで完全内製化。',
    type: 'website',
  },
}


export default function FlowPage() {
  return (
    <Layout showFooter={false}>
      <BreadcrumbJsonLd pathname="/flow" />
      {/* Hero Section */}
      <PageHeader
        title={
          <>
            最新技術で製造
            <br />
            高品質包装材
          </>
        }
        lead={
          <>
            デジタル印刷から精密加工まで、一貫生産で
            <br />
            最短30日で最高品質の包装材を納品
          </>
        }
        actions={
          <>
            <Link href="/contact" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
              <FileText className="h-5 w-5 shrink-0" aria-hidden="true" />
              ご相談申し込み
              <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" />
            </Link>
            <Link href="/quote-simulator" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
              <Package className="h-5 w-5 shrink-0" aria-hidden="true" />
              お見積りシミュレーター
            </Link>
          </>
        }
      />

      {/* Manufacturing Process Showcase */}
      <ManufacturingProcessShowcase />

      {/* CTA Section */}
      <section className={`${headingFont.variable} bg-bg-inverted py-16 text-text-inverse md:py-24`}>
        <Container size="4xl">
          <MotionWrapper delay={0.8}>
            <div className="space-y-6">
              <h2 className="font-heading text-2xl leading-[1.4] [word-break:keep-all] [overflow-wrap:anywhere] md:text-[2rem]">
                今すぐ始めましょう
              </h2>
              <p className="max-w-[40em] leading-[1.8]">
                専門家との相談で最適な包装材ソリューションを見つけましょう
              </p>
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-x-8">
                <Link href="/contact" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
                  ご相談申し込み
                </Link>
                <Link href="/catalog" className="inline-flex min-h-11 items-center text-base underline underline-offset-4 hover:text-brand-soft">
                  製品一覧を見る
                </Link>
              </div>
            </div>
          </MotionWrapper>
        </Container>
      </section>
    </Layout>
  )
}
