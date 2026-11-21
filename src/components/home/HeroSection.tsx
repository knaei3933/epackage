'use client'

import { CLIENT_COUNT_LABEL, LEAD_TIME_LABEL } from '@/lib/site-facts'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { heroVariants, statVariants, ctaVariants } from './animations'
import { buttonVariants } from '@/components/ui/Button'

function track(label: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'click', { event_category: 'cta_button', event_label: label, value: 1 })
  }
}

const SPECS = [
  { value: '500種以上', label: '製造可能' },
  { value: LEAD_TIME_LABEL, label: '納期の目安' },
  { value: CLIENT_COUNT_LABEL, label: '実績' },
]

export function HeroSection() {
  return (
    <motion.section className="bg-bg-primary py-16 md:py-24" variants={heroVariants} initial="hidden" animate="visible">
      <div className="mx-auto max-w-[1120px] px-4 sm:px-6">
        <div className="grid gap-12 md:grid-cols-[1fr_1.15fr] md:items-center">
          <div>
            <motion.div variants={statVariants}>
            <h1 className="[word-break:keep-all] [overflow-wrap:anywhere] font-heading text-[1.75rem] leading-[1.35] text-text-primary md:text-[2.5rem] xl:text-5xl">
              <span className="block whitespace-nowrap">あなたの製品を</span>
              <span className="block whitespace-nowrap">最適な包装で輝かせる</span>
            </h1>
            </motion.div>
            <motion.p variants={statVariants} className="mt-6 max-w-[40em] text-base leading-[1.8] text-text-primary">
              食品や化粧品、電子部品など、あらゆる業界に対応する高品質パウチ包装を。
              あなたの製品価値を最大限に引き出す、カスタマイズされたソリューションをご提案いたします。
            </motion.p>
            <motion.div variants={ctaVariants} className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8">
              <Link
                href="/catalog"
                onClick={() => track('catalog_hero')}
                className={buttonVariants({ variant: 'primary', size: 'lg' })}
              >
                製品を見る
              </Link>
              <Link
                href="/samples"
                onClick={() => track('samples')}
                className="inline-flex min-h-11 items-center rounded-md text-base font-medium text-brand underline underline-offset-4 hover:text-brand-pressed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              >
                無料サンプル
              </Link>
              <Link
                href="/quote-simulator"
                onClick={() => track('quote_simulator_hero')}
                className="inline-flex min-h-11 items-center rounded-md text-base font-medium text-brand underline underline-offset-4 hover:text-brand-pressed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              >
                即時見積もり
              </Link>
            </motion.div>
          </div>
          <motion.div variants={statVariants}>
            <Image
              src="/images/main/main15.png"
              alt="スタンドパウチ、スパウトパウチ、クラフトパウチなど、包装材の例"
              width={1408}
              height={768}
              priority
              fetchPriority="high"
              sizes="(min-width: 1152px) 600px, (min-width: 768px) 52vw, 100vw"
              className="aspect-[4/3] w-full rounded-inner object-cover"
            />
          </motion.div>
        </div>

        <dl className="mt-16 grid gap-x-8 gap-y-6 md:grid-cols-3">
          {SPECS.map(s => (
            <motion.div key={s.value} variants={statVariants} className="flex flex-col-reverse justify-end border-t border-brand-soft pt-4">
              <dt className="mt-1 text-sm leading-[1.8] text-text-primary">{s.label}</dt>
              <dd className="font-heading text-2xl text-text-primary">{s.value}</dd>
            </motion.div>
          ))}
        </dl>

        <motion.ul variants={ctaVariants} className="mt-10 flex flex-wrap gap-x-8 gap-y-2 text-sm leading-[1.8] text-text-primary">
          {['食品包装対応', '厳格な品質管理', '完全カスタマイズ', '日本語サポート'].map(t => (
            <li key={t}>{t}</li>
          ))}
        </motion.ul>
      </div>
    </motion.section>
  )
}
