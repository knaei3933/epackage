import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, Clock } from 'lucide-react'
import { GoogleAdsConversion } from '@/components/analytics/GoogleAdsConversion'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'
import { PageHeader } from '@/components/layout'
import { Card } from '@/components/ui/Card'
import { buttonVariants } from '@/components/ui/Button'
import { headingFont } from '@/components/home/fonts'

export const metadata: Metadata = {
  title: 'お問い合わせありがとうございます',
  description: 'お問い合わせありがとうございます。担当者よりご連絡いたします。',
  alternates: {
    canonical: '/contact/thank-you',
  },
}

export default function ContactThankYouPage() {
  return (
    <div className={`${headingFont.variable} min-h-screen bg-bg-primary`}>
      <BreadcrumbJsonLd pathname="/contact/thank-you" />
      <GoogleAdsConversion />
      <PageHeader
        title="お問い合わせありがとうございます"
        lead="Epackage Labへお問い合わせいただき、誠にありがとうございます"
      />

      <div className="mx-auto max-w-[1120px] px-4 py-16 sm:px-6 md:py-24">
        <div className="max-w-3xl space-y-12">
          {/* メインコンテンツ */}
          <div>
            <p className="max-w-[40em] text-base leading-[1.8] text-text-primary">
              お問い合わせ内容を確認次第、担当者よりご登録いただいたメールアドレスにてご連絡いたします。
            </p>
            <Card className="mt-6 bg-brand-muted p-6">
              <h2 className="mb-4 text-xl font-semibold text-on-brand-muted">
                今後の対応について
              </h2>
              <div className="grid gap-6 sm:grid-cols-3">
                <div>
                  <Clock className="mb-2 h-6 w-6 text-brand" aria-hidden="true" />
                  <p className="text-sm text-text-secondary">対応時間</p>
                  <p className="font-semibold text-text-primary">24時間以内</p>
                </div>
                <div>
                  <Mail className="mb-2 h-6 w-6 text-brand" aria-hidden="true" />
                  <p className="text-sm text-text-secondary">連絡方法</p>
                  <p className="font-semibold text-text-primary">メール</p>
                </div>
                <div>
                  <Phone className="mb-2 h-6 w-6 text-brand" aria-hidden="true" />
                  <p className="text-sm text-text-secondary">お急ぎの場合</p>
                  <p className="font-semibold text-text-primary">お電話ください</p>
                </div>
              </div>
            </Card>
          </div>

          {/* お問い合わせ先情報 */}
          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-text-primary">
              お問い合わせ先
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-2 font-medium text-text-secondary">メールでのお問い合わせ</h3>
                <a
                  href="mailto:info@package-lab.com"
                  className="inline-flex min-h-11 items-center text-brand underline underline-offset-4 hover:text-brand-pressed"
                >
                  <Mail className="mr-2 h-4 w-4" aria-hidden="true" />
                  info@package-lab.com
                </a>
              </div>
              <div>
                <h3 className="mb-2 font-medium text-text-secondary">お電話でのお問い合わせ</h3>
                <a
                  href="tel:050-3613-9673"
                  className="inline-flex min-h-11 items-center text-brand underline underline-offset-4 hover:text-brand-pressed"
                >
                  <Phone className="mr-2 h-4 w-4" aria-hidden="true" />
                  050-3613-9673
                </a>
              </div>
            </div>
            <div className="mt-4 border-t border-border-medium pt-4">
              <p className="text-sm text-text-secondary">
                <strong>営業時間:</strong> 平日 9:00-18:00（土日祝日を除く）
              </p>
            </div>
          </Card>

          {/* よくある質問 */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-text-primary">
              よくある質問
            </h2>
            <div className="space-y-4">
                <details className="rounded-container border border-border-medium bg-bg-primary p-4">
                  <summary className="cursor-pointer py-3 font-medium text-text-primary">
                    どのくらいで返信がありますか？
                  </summary>
                  <p className="mt-2 text-text-secondary">
                    通常、24時間以内に担当者よりご連絡いたします。お急ぎの場合はお電話にてお問い合わせください。
                  </p>
                </details>
                <details className="rounded-container border border-border-medium bg-bg-primary p-4">
                  <summary className="cursor-pointer py-3 font-medium text-text-primary">
                    営業時間外のお問い合わせはどうなりますか？
                  </summary>
                  <p className="mt-2 text-text-secondary">
                    営業時間外のお問い合わせは、翌営業日に対応させていただきます。緊急のお問い合わせの場合は、メールにてその旨をお知らせください。
                  </p>
                </details>
                <details className="rounded-container border border-border-medium bg-bg-primary p-4">
                  <summary className="cursor-pointer py-3 font-medium text-text-primary">
                    技術的な問い合わせについて
                  </summary>
                  <p className="mt-2 text-text-secondary">
                    技術的なご質問については、専門の技術担当者が丁寧に対応いたします。製品の仕様や導入方法など、詳しいご相談も可能です。
                  </p>
                </details>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-x-8">
            <Link href="/" className={buttonVariants({ variant: 'primary', size: 'md' })}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              トップページに戻る
            </Link>
            <Link href="/products" className="inline-flex min-h-11 items-center text-base text-brand underline underline-offset-4 hover:text-brand-pressed">
              製品情報を見る
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
