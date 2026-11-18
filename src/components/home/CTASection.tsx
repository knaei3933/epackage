'use client'

import Link from 'next/link'
import { MotionWrapper } from '@/components/ui/MotionWrapper'

const options = [
  { href: '/catalog', title: '製品カタログ', text: '製品を詳しく確認。仕様と価格を比較できます。' },
  { href: '/pricing', title: '価格計算', text: '製造価格を計算し、仕様調整で最適コストを見つけられます。' },
  { href: '/samples', title: '無料サンプル', text: '実際の製品品質を確認し、サンプルを発送' },
  { href: '/contact', title: 'お問合せ', text: '手軽にご要望を送信し、迅速な見積りをご案内' },
]

export function CTASection() {
  return (
    <section className="bg-[#2F333D] py-16 text-white md:py-24">
      <MotionWrapper delay={0.4}>
      <div className="mx-auto max-w-[1120px] px-4 sm:px-6">
        <h2 className="[word-break:keep-all] [overflow-wrap:anywhere] font-heading text-2xl sm:text-3xl leading-[1.4] md:text-4xl">
          今なら30秒で申し込み完了
        </h2>
        <p className="mt-4 max-w-[40em] leading-[1.8]">3営業日以内にサンプル発送、1週間でお手元に届きます。</p>
        <p className="mt-2 max-w-[40em] leading-[1.8] text-white/80">
          製品確認から価格計算、専門家相談まで、お気軽にご相談ください。
        </p>

        <div className="mt-8">
          <Link
            href="/samples"
            className="inline-flex min-h-12 items-center rounded-[4px] bg-[#5EB6AC] px-8 font-medium text-[#2F333D] hover:bg-[#74c4bb] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white"
          >
            無料サンプル
          </Link>
        </div>

        <ul className="mt-12 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
          {options.map(o => (
            <li key={o.href} className="border-t border-[#5EB6AC]/60 py-4">
              <Link
                href={o.href}
                className="block rounded-[4px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#5EB6AC]"
              >
                <span className="font-heading text-lg underline underline-offset-4">{o.title}</span>
                <span className="mt-2 block text-sm leading-[1.8] text-white/80">{o.text}</span>
              </Link>
            </li>
          ))}
        </ul>

        <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-2 text-sm leading-[1.8] text-white/80">
          {['24時間対応', '無料相談', '100社以上実績', '専門スタッフ'].map(t => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>
      </MotionWrapper>
    </section>
  )
}
