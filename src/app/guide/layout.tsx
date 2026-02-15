import { Metadata } from 'next'
import { Container } from '@/components/ui/Container'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { ArrowLeft, Palette, Ruler, Image, FileText, Leaf } from 'lucide-react'

export const metadata: Metadata = {
  title: 'デザインガイド - パッケージデザイン制作ガイド | Epackage Lab',
  description: 'パッケージデザイン制作のための包括的なガイド。色、サイズ、画像、白版、環境表示の基準と仕様について詳しく説明します。',
  keywords: ['パッケージデザイン', 'デザインガイド', '制作ガイド', '色ガイド', 'サイズガイド', '画像仕様', '白版', '環境表示'],
  openGraph: {
    title: 'デザインガイド - Epackage Lab',
    description: 'プロフェッショナルなパッケージデザイン制作ガイド',
  },
}

interface GuideLayoutProps {
  children: React.ReactNode
}

const guideSections = [
  {
    title: 'カラー',
    description: 'パッケージ印刷の色指定とカラーマッチング',
    href: '/guide/color',
    icon: Palette,
    color: 'text-red-600',
  },
  {
    title: 'サイズ',
    description: 'パッケージサイズと寸法の仕様',
    href: '/guide/size',
    icon: Ruler,
    color: 'text-blue-600',
  },
  {
    title: '画像',
    description: '画像データの仕様と解像度',
    href: '/guide/image',
    icon: Image,
    color: 'text-green-600',
  },
  {
    title: '白版',
    description: '白版（しろはん）の作成と用途',
    href: '/guide/shirohan',
    icon: FileText,
    color: 'text-purple-600',
  },
  {
    title: '環境表示',
    description: '環境ラベルとサステナビリティ表示',
    href: '/guide/environmentaldisplay',
    icon: Leaf,
    color: 'text-emerald-600',
  },
]

export default function GuideLayout({ children }: GuideLayoutProps) {
  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header Breadcrumb */}
      <div className="border-b border-border-medium bg-bg-secondary">
        <Container size="6xl" className="py-4">
          <div className="flex items-center space-x-2">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-text-secondary hover:text-text-primary">
                <ArrowLeft className="h-4 w-4 mr-2" />
                ホームに戻る
              </Button>
            </Link>
          </div>
        </Container>
      </div>

      <Container size="6xl" className="py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <h2 className="text-lg font-semibold text-text-primary mb-6">
                デザインガイド
              </h2>
              <nav className="space-y-2">
                {guideSections.map((section) => {
                  const IconComponent = section.icon
                  return (
                    <Link
                      key={section.href}
                      href={section.href}
                      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-bg-secondary transition-colors duration-200 group"
                    >
                      <div className={`p-2 rounded-md bg-bg-primary ${section.color} group-hover:scale-110 transition-transform duration-200`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-text-primary group-hover:text-brixa-600 transition-colors">
                          {section.title}
                        </h3>
                        <p className="text-xs text-text-secondary mt-1">
                          {section.description}
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </nav>

              {/* Contact Support */}
              <div className="mt-8 p-4 bg-bg-secondary rounded-lg border border-border-medium">
                <h3 className="text-sm font-semibold text-text-primary mb-2">
                  デザインに関するご相談
                </h3>
                <p className="text-xs text-text-secondary mb-4">
                  デザインガイドに関するご質問や、専門家によるデザインサポートをご希望の場合は、お気軽にお問い合わせください。
                </p>
                <Link href="/contact">
                  <Button variant="primary" size="sm" fullWidth>
                    お問い合わせ
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-bg-primary rounded-xl border border-border-medium shadow-sm p-8">
              {children}
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}