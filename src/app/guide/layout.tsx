import { Metadata } from 'next'
import { Container } from '@/components/ui/Container'
import { Card } from '@/components/ui/Card'
import { buttonVariants } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { GuideSidebarNav } from './GuideSidebarNav'

export const metadata: Metadata = {
  title: {
    default: 'デザインガイド - パッケージデザイン制作ガイド',
    template: '%s | Epackage Lab',
  },
  description: 'パッケージデザイン制作のための包括的なガイド。色、サイズ、画像、白版、環境表示の基準と仕様について詳しく説明します。',
  openGraph: {
    title: 'デザインガイド - Epackage Lab',
    description: 'プロフェッショナルなパッケージデザイン制作ガイド',
  },
  alternates: {
    canonical: '/guide',
  },
}

interface GuideLayoutProps {
  children: React.ReactNode
}

export default function GuideLayout({ children }: GuideLayoutProps) {
  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header Breadcrumb */}
      <div className="border-b border-border-medium bg-bg-secondary">
        <Container size="6xl" className="py-4">
          <div className="flex items-center space-x-2">
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'sm' }),
                'text-text-secondary hover:text-text-primary max-sm:h-11'
              )}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              ホームに戻る
            </Link>
          </div>
        </Container>
      </div>

      <Container size="6xl" className="py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <h2 className="mb-6 text-lg font-bold text-text-primary">
                デザインガイド
              </h2>
              <GuideSidebarNav />

              {/* Contact Support */}
              <div className="mt-8 p-4 bg-bg-secondary rounded-container border border-border-medium">
                <h3 className="text-sm font-semibold text-text-primary mb-2">
                  デザインに関するご相談
                </h3>
                <p className="text-xs text-text-secondary mb-4">
                  デザインガイドに関するご質問や、専門家によるデザインサポートをご希望の場合は、お気軽にお問い合わせください。
                </p>
                <Link
                  href="/contact"
                  className={cn(buttonVariants({ variant: 'primary', size: 'sm', fullWidth: true }), 'max-sm:h-11')}
                >
                  お問い合わせ
                </Link>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-bg-primary rounded-container border border-border-medium p-4 sm:p-8">
              {children}
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}