import { Metadata } from 'next'
import { Layout } from '@/components/layout/Layout'
import { ManufacturingProcessShowcase } from '@/components/home/ManufacturingProcessShowcase'
import { Container } from '@/components/ui/Container'
import { MotionWrapper } from '@/components/ui/MotionWrapper'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import Image from 'next/image'
import {
  ArrowRight,
  CheckCircle,
  Clock,
  FileText,
  Package,
  Truck,
  Users,
  Shield,
  Zap
} from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '製造工程 | Epackage Lab - デジタル印刷・環境配慮型包装材製造',
  description: 'Epackage Labの先進製造工程。HP Indigoデジタル印刷、NON-VOC対応製造、KARLVILLE高精度加工、一貫生産システムで30日間納品。',
  keywords: ['製造工程', 'デジタル印刷', '環境配慮型製造', '高精度加工', '一貫生産', '包装材製造', 'HP Indigo'],
  openGraph: {
    title: '製造工程 | Epackage Lab',
    description: '最新技術による包装材製造工程。デジタル印刷から精密加工まで完全内製化。',
    type: 'website',
  },
}


export default function FlowPage() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-brixa-50 via-white to-navy-50">
        <Container size="6xl">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <MotionWrapper delay={0.1}>
              <div className="inline-flex items-center space-x-2 bg-brixa-100 text-brixa-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Zap className="w-4 h-4" />
                <span>製造工程ご案内</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                <span className="block text-brixa-600">最新技術で製造</span>
                <span className="block text-navy-600">高品質包装材</span>
              </h1>
            </MotionWrapper>

            <MotionWrapper delay={0.2}>
              <p className="text-xl text-gray-600 leading-relaxed">
                デジタル印刷から精密加工まで、一貫生産で
                <br />
                最短30日で最高品質の包装材を納品
              </p>
            </MotionWrapper>

            <MotionWrapper delay={0.3}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button
                    variant="primary"
                    size="lg"
                    className="justify-center px-8 py-4 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 min-w-[320px] whitespace-nowrap"
                  >
                    <FileText className="mr-2 h-5 w-5 flex-shrink-0" />
                    ご相談申し込み
                    <ArrowRight className="ml-2 h-5 w-5 flex-shrink-0" />
                  </Button>
                </Link>

                <Link href="/quote-simulator">
                  <Button
                    variant="outline"
                    size="lg"
                    className="justify-center px-8 py-4 text-lg font-medium border-2 border-brixa-600 text-brixa-600 hover:bg-brixa-50 transition-all duration-300"
                  >
                    <Package className="mr-2 h-5 w-5" />
                    お見積りシミュレーター
                  </Button>
                </Link>
              </div>
            </MotionWrapper>
          </div>
        </Container>
      </section>

      {/* Manufacturing Process Showcase */}
      <ManufacturingProcessShowcase />

  
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-brixa-600 to-navy-600">
        <Container size="4xl" className="text-center">
          <MotionWrapper delay={0.8}>
            <div className="space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                今すぐ始めましょう
              </h2>
              <p className="text-lg text-white/90 max-w-2xl mx-auto">
                専門家との相談で最適な包装材ソリューションを見つけましょう
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="justify-center bg-white text-brixa-600 hover:bg-gray-50 font-medium min-w-[320px] whitespace-nowrap"
                  >
                    ご相談申し込み
                  </Button>
                </Link>
                <Link href="/catalog">
                  <Button
                    variant="outline"
                    size="lg"
                    className="justify-center border-white text-white hover:bg-white hover:text-brixa-600 font-medium"
                  >
                    製品一覧を見る
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