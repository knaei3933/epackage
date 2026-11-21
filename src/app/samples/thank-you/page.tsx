import { REPLY_TIME_LABEL } from '@/lib/site-facts'
import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Package, Truck, Clock, Phone, Mail } from 'lucide-react'
import { buttonVariants } from '@/components/ui/Button'
import { PageHeader } from '@/components/layout'
import { GoogleAdsConversion } from '@/components/analytics/GoogleAdsConversion'
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd'

export const metadata: Metadata = {
  title: 'サンプルリクエストありがとうございます',
  description: 'サンプルリクエストありがとうございます。在庫確認後、発送のご連絡をいたします。',
  alternates: {
    canonical: '/samples/thank-you',
  },
}

export default function SamplesThankYouPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <BreadcrumbJsonLd pathname="/samples/thank-you" />
      <GoogleAdsConversion />
      <PageHeader
        title="サンプルリクエストありがとうございます"
        lead="Epackage Lab製品サンプルのご請求いただき、誠にありがとうございます"
      />

      <section className="bg-bg-primary py-16 md:py-24">
        <div className="mx-auto max-w-[1120px] px-4 sm:px-6">
          <div className="max-w-3xl">
            <p className="mb-8 leading-[1.8] text-text-primary">
              サンプルリクエスト内容を確認いたしました。
              現在、在庫状況を確認しておりまして、確認次第、担当者より詳細な発送日程のご連絡をいたします。
            </p>

            {/* 発送スケジュール */}
            <div className="mb-8 rounded-container border border-border-medium bg-bg-secondary p-6">
              <h2 className="mb-4 text-xl font-bold text-text-primary">
                発送スケジュール
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div>
                    <Clock className="mb-2 h-8 w-8 text-brand" aria-hidden="true" />
                    <p className="text-sm text-text-secondary">在庫確認</p>
                    <p className="font-bold text-text-primary">2時間以内</p>
                  </div>
                  <div>
                    <Truck className="mb-2 h-8 w-8 text-brand" aria-hidden="true" />
                    <p className="text-sm text-text-secondary">発送準備</p>
                    <p className="font-bold text-text-primary">2-3営業日</p>
                  </div>
                  <div>
                    <Package className="mb-2 h-8 w-8 text-brand" aria-hidden="true" />
                    <p className="text-sm text-text-secondary">お届け</p>
                    <p className="font-bold text-text-primary">発送後1-2日</p>
                  </div>
              </div>
            </div>

            {/* サンプル情報 */}
            <div className="mb-8">
              <h3 className="mb-4 text-lg font-bold text-text-primary">
                サンプルに関する重要事項
              </h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <span className="mr-2 text-brand">•</span>
                  <span className="text-text-primary">送料は弊社負担といたします</span>
                </div>
                <div className="flex items-start">
                  <span className="mr-2 text-brand">•</span>
                  <span className="text-text-primary">発送後は追跡番号をメールにてお知らせいたします</span>
                </div>
                <div className="flex items-start">
                  <span className="mr-2 text-brand">•</span>
                  <span className="text-text-primary">サンプル評価のご感想をお聞かせいただけますと幸いです</span>
                </div>
                <div className="flex items-start">
                  <span className="mr-2 text-brand">•</span>
                  <span className="text-text-primary">技術的なご質問がございましたら、いつでもお気軽にお問い合わせください</span>
                </div>
              </div>
            </div>

            {/* お問い合わせ先情報 */}
            <div className="mb-8 border-t border-border-medium pt-8">
              <h3 className="mb-4 text-lg font-bold text-text-primary">
                サンプル担当ご連絡先
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <h4 className="mb-2 font-medium text-text-primary">メールでのお問い合わせ</h4>
                  <a
                    href="mailto:info@package-lab.com"
                    className="flex min-h-11 items-center text-brand underline underline-offset-4 hover:text-brand-pressed"
                  >
                    <Mail className="mr-2 h-4 w-4" aria-hidden="true" />
                    info@package-lab.com
                  </a>
                </div>
                <div>
                  <h4 className="mb-2 font-medium text-text-primary">お電話でのお問い合わせ</h4>
                  <a
                    href="tel:050-3613-9673"
                    className="flex min-h-11 items-center text-brand underline underline-offset-4 hover:text-brand-pressed"
                  >
                    <Phone className="mr-2 h-4 w-4" aria-hidden="true" />
                    050-3613-9673
                  </a>
                </div>
              </div>
              <p className="mt-4 text-sm text-text-secondary">
                <strong>営業時間:</strong> 平日 9:00-18:00（土日祝日を除く）
              </p>
            </div>

            {/* よくある質問 */}
            <div className="mb-8 border-t border-border-medium pt-8">
              <h3 className="mb-4 text-lg font-bold text-text-primary">
                サンプルに関するよくある質問
              </h3>
              <div className="space-y-4">
                <details className="rounded-container border border-border-medium bg-bg-primary p-4">
                  <summary className="min-h-6 cursor-pointer font-medium text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
                    サンプルは無料ですか？
                  </summary>
                  <p className="mt-2 leading-[1.8] text-text-secondary">
                    はい、サンプルは無料です。送料も弊社負担といたします。
                  </p>
                </details>
                <details className="rounded-container border border-border-medium bg-bg-primary p-4">
                  <summary className="min-h-6 cursor-pointer font-medium text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
                    何個までリクエストできますか？
                  </summary>
                  <p className="mt-2 leading-[1.8] text-text-secondary">
                    1回のリクエストで最大5個までサンプルをご請求いただけます。製品ごとの数量制限は10個までです。
                  </p>
                </details>
                <details className="rounded-container border border-border-medium bg-bg-primary p-4">
                  <summary className="min-h-6 cursor-pointer font-medium text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
                    海外への発送は可能ですか？
                  </summary>
                  <p className="mt-2 leading-[1.8] text-text-secondary">
                    はい、海外への発送も可能です。その場合は別途輸送費と手続きが必要となりますので、お問い合わせください。
                  </p>
                </details>
                <details className="rounded-container border border-border-medium bg-bg-primary p-4">
                  <summary className="min-h-6 cursor-pointer font-medium text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
                    サンプルの評価期間について
                  </summary>
                  <p className="mt-2 leading-[1.8] text-text-secondary">
                    通常2週間程度の評価期間をお勧めしております。評価結果についてご感想をお聞かせいただけますと、今後の製品改善に役立てさせていただきます。
                  </p>
                </details>
              </div>
            </div>

            {/* 次のステップ */}
            <div className="mb-10 rounded-container border border-brand-soft bg-brand-muted p-6">
              <h3 className="mb-4 text-lg font-bold text-on-brand-muted">
                次にすすめること
              </h3>
              <ol className="space-y-2 text-on-brand-muted">
                <li className="flex items-start">
                  <span className="mr-2 font-bold text-brand">1.</span>
                  <span>担当者からのご連絡をお待ちください（{REPLY_TIME_LABEL}）</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 font-bold text-brand">2.</span>
                  <span>発送日程のご確認と配送先住所の最終確認</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 font-bold text-brand">3.</span>
                  <span>サンプルの受け取りと製品評価</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 font-bold text-brand">4.</span>
                  <span>評価結果のご共有と今後の導入検討</span>
                </li>
              </ol>
            </div>

            {/* アクションボタン */}
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-x-8">
              <Link href="/" className={buttonVariants({ variant: 'primary', size: 'md' })}>
                <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                トップページに戻る
              </Link>
              <Link href="/products" className={buttonVariants({ variant: 'outline', size: 'md' })}>
                他の製品を見る
              </Link>
              <Link
                href="/contact"
                className="inline-flex min-h-11 items-center text-base text-brand underline underline-offset-4 hover:text-brand-pressed"
              >
                お問い合わせ
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
