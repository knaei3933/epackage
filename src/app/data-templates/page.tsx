import { Metadata } from 'next'
import { Layout } from '@/components/layout/Layout'
import { Container } from '@/components/ui/Container'
import { MotionWrapper } from '@/components/ui/MotionWrapper'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import {
  ArrowLeft,
  Download,
  FileText,
  Settings,
  Upload,
  Phone,
  Mail,
  HelpCircle
} from 'lucide-react'
import Link from 'next/link'
import { DataTemplateGuide } from '@/components/quote/shared/DataTemplateGuide'

export const metadata: Metadata = {
  title: 'デザインテンプレート | Epackage Lab - プロ仕様の包装材デザイン',
  description: 'Epackage Labのプロ仕様デザインテンプレートをダウンロード。Adobe Illustrator形式で、正確な製造仕様に対応します。',
  keywords: ['デザインテンプレート', '包装材デザイン', 'Adobe Illustrator', '製造仕様', 'データ入稿'],
  openGraph: {
    title: 'デザインテンプレート | Epackage Lab',
    description: 'プロ仕様の包装材デザインテンプレートを無料ダウンロード',
    type: 'website',
  },
}

export default function DataTemplatesPage() {
  return (
    <Layout>
      <div className="min-h-screen">
        {/* Breadcrumb */}
        <section className="py-8 bg-white border-b">
          <Container size="6xl">
            <MotionWrapper delay={0.1}>
              <nav className="flex items-center space-x-2 text-sm text-gray-600">
                <Link href="/" className="hover:text-brixa-600 transition-colors">
                  ホーム
                </Link>
                <span>/</span>
                <Link href="/quote-simulator" className="hover:text-brixa-600 transition-colors">
                  お見積り
                </Link>
                <span>/</span>
                <span className="text-gray-900 font-medium">デザインテンプレート</span>
              </nav>
            </MotionWrapper>
          </Container>
        </section>

        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-br from-brixa-50 to-white">
          <Container size="6xl">
            <MotionWrapper delay={0.1}>
              <div className="text-center max-w-4xl mx-auto">
                <div className="inline-flex items-center space-x-2 bg-brixa-100 text-brixa-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <FileText className="w-4 h-4" />
                  <span>プロ仕様テンプレート</span>
                </div>

                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  包装材の
                  <span className="text-brixa-600"> デザインテンプレート</span>
                </h1>

                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Adobe Illustrator形式のプロ仕様テンプレートで、
                  <br />
                  正確な製品仕様と最高品質の印刷を実現します
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/quote-simulator">
                    <Button
                      variant="primary"
                      size="lg"
                      className="justify-center px-8 py-4 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Settings className="mr-2 h-5 w-5" />
                      お見積りを開始
                    </Button>
                  </Link>

                  <Link href="/contact">
                    <Button
                      variant="outline"
                      size="lg"
                      className="justify-center px-8 py-4 text-lg font-medium border-2 border-brixa-600 text-brixa-600 hover:bg-brixa-50 transition-all duration-300"
                    >
                      <HelpCircle className="mr-2 h-5 w-5" />
                      デザインサポート
                    </Button>
                  </Link>
                </div>
              </div>
            </MotionWrapper>
          </Container>
        </section>

        {/* Template Guide */}
        <section className="py-16 bg-white">
          <Container size="6xl">
            <DataTemplateGuide language="ja" />
          </Container>
        </section>

        {/* Support Section */}
        <section className="py-16 bg-gray-50">
          <Container size="6xl">
            <MotionWrapper delay={0.5}>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  デザインサポートをご利用ください
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  テンプレートの使用方法からデザインの完成まで、
                  専門スタッフが丁寧にサポートいたします
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <Card className="text-center p-6 hover:shadow-lg transition-all duration-300">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    電話でご相談
                  </h3>
                  <p className="text-gray-600 mb-4">
                    テンプレートの使用方法や
                    デザインに関するご質問
                  </p>
                  <a
                    href="tel:03-1234-5678"
                    className="text-brixa-600 font-medium hover:text-brixa-700"
                  >
                    03-1234-5678
                  </a>
                </Card>

                <Card className="text-center p-6 hover:shadow-lg transition-all duration-300">
                  <div className="w-16 h-16 bg-navy-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-navy-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    メールでご相談
                  </h3>
                  <p className="text-gray-600 mb-4">
                    デザインデータの確認や
                    技術的なご質問にお答えします
                  </p>
                  <a
                    href="mailto:design@epackage-lab.com"
                    className="text-brixa-600 font-medium hover:text-brixa-700"
                  >
                    design@epackage-lab.com
                  </a>
                </Card>

                <Card className="text-center p-6 hover:shadow-lg transition-all duration-300">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    デザインサービス
                  </h3>
                  <p className="text-gray-600 mb-4">
                    プロのデザイナーが
                    完成したデザインデータを作成します
                  </p>
                  <Link href="/contact">
                    <Button variant="outline" size="sm">
                      詳細を見る
                    </Button>
                  </Link>
                </Card>
              </div>
            </MotionWrapper>
          </Container>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-white">
          <Container size="4xl">
            <MotionWrapper delay={0.6}>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  よくあるご質問
                </h2>
                <p className="text-gray-600">
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
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Q. {faq.q}
                    </h3>
                    <p className="text-gray-700">
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