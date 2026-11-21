'use client'

import { CLIENT_COUNT_LABEL, REPLY_TIME_LABEL } from '@/lib/site-facts'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/Button'
import { MotionWrapper } from '@/components/ui/MotionWrapper'
import { cn } from '@/lib/utils'

const options = [
  { href: '/catalog', title: '製品カタログ', text: '製品を詳しく確認。仕様と価格を比較できます。' },
  { href: '/pricing', title: '価格計算', text: '製造価格を計算し、仕様調整で最適コストを見つけられます。' },
  { href: '/samples', title: '無料サンプル', text: '実際の製品品質を確認し、サンプルを発送' },
  { href: '/contact', title: 'お問合せ', text: '手軽にご要望を送信し、迅速な見積りをご案内' },
]

export function CTASection() {
  return (
    // ページ末尾の紺の帯（前回までの見た目を維持）。文字は白（12.64:1）、主ボタンは基準色の bg-brand（白文字 4.51:1）。
    <section className="bg-bg-inverted py-16 text-text-inverse md:py-24">
      <MotionWrapper delay={0.4}>
      <div className="mx-auto max-w-[1120px] px-4 sm:px-6">
        <h2 className="[word-break:keep-all] [overflow-wrap:anywhere] font-heading text-2xl sm:text-3xl leading-[1.4] md:text-4xl">
          今なら30秒で申し込み完了
        </h2>
        <p className="mt-4 max-w-[40em] leading-[1.8]">3営業日以内にサンプル発送、1週間でお手元に届きます。</p>
        <p className="mt-2 max-w-[40em] leading-[1.8] opacity-80">
          製品確認から価格計算、専門家相談まで、お気軽にご相談ください。
        </p>

        <div className="mt-8">
          <Link
            href="/samples"
            className={cn(buttonVariants({ variant: 'primary', size: 'lg' }), 'focus-visible:ring-brand-soft')}
          >
            無料サンプル
          </Link>
        </div>

        <ul className="mt-12 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
          {options.map(o => (
            <li key={o.href} className="border-t border-brand-soft py-4">
              <Link
                href={o.href}
                className="block min-h-11 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-soft"
              >
                <span className="font-heading text-lg underline underline-offset-4">{o.title}</span>
                <span className="mt-2 block text-sm leading-[1.8] opacity-80">{o.text}</span>
              </Link>
            </li>
          ))}
        </ul>

        <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-2 text-sm leading-[1.8] opacity-80">
          {[`${REPLY_TIME_LABEL}に回答`, '無料相談', `${CLIENT_COUNT_LABEL}の実績`, '専門スタッフ'].map(t => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>
      </MotionWrapper>
    </section>
  )
}
