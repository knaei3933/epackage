'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { heroVariants, statVariants, ctaVariants } from './animations'

function track(label: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'click', { event_category: 'cta_button', event_label: label, value: 1 })
  }
}

const SPECS = [
  { value: '500種以上', label: '製造可能' },
  { value: '28日', label: '平均納期（緊急対応可能）' },
  { value: '100社以上', label: '実績' },
]

export function HeroSection() {
  return (
    <motion.section className="bg-white py-16 md:py-24" variants={heroVariants} initial="hidden" animate="visible">
      <div className="mx-auto max-w-[1120px] px-4 sm:px-6">
        <div className="grid gap-12 md:grid-cols-[1fr_1.15fr] md:items-center">
          <div>
            <motion.div variants={statVariants}>
            <h1 className="[word-break:keep-all] [overflow-wrap:anywhere] font-heading text-[1.75rem] leading-[1.35] text-[#2F333D] md:text-[2.5rem] xl:text-5xl">
              <span className="block whitespace-nowrap">あなたの製品を</span>
              <span className="block whitespace-nowrap">最適な包装で輝かせる</span>
            </h1>
            </motion.div>
            <motion.p variants={statVariants} className="mt-6 max-w-[40em] text-base leading-[1.8] text-[#2F333D]">
              食品や化粧品、電子部品など、あらゆる業界に対応する高品質パウチ包装を。
              あなたの製品価値を最大限に引き出す、カスタマイズされたソリューションをご提案いたします。
            </motion.p>
            <motion.div variants={ctaVariants} className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8">
              <Link
                href="/catalog"
                onClick={() => track('catalog_hero')}
                className="inline-flex min-h-12 items-center rounded-[4px] bg-[#2D6C65] px-8 text-base font-medium text-white hover:bg-[#245a54] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#5EB6AC]"
              >
                製品を見る
              </Link>
              <Link
                href="/samples"
                onClick={() => track('samples')}
                className="rounded-[4px] py-2 text-base font-medium text-[#2D6C65] underline underline-offset-4 hover:text-[#245a54] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#5EB6AC]"
              >
                無料サンプル
              </Link>
              <Link
                href="/quote-simulator"
                onClick={() => track('quote_simulator_hero')}
                className="rounded-[4px] py-2 text-base font-medium text-[#2D6C65] underline underline-offset-4 hover:text-[#245a54] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#5EB6AC]"
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
              className="aspect-[4/3] w-full rounded-[4px] object-cover"
            />
          </motion.div>
        </div>

        <dl className="mt-16 grid gap-x-8 gap-y-6 md:grid-cols-3">
          {SPECS.map(s => (
            <motion.div key={s.value} variants={statVariants} className="flex flex-col-reverse justify-end border-t border-[#5EB6AC] pt-4">
              <dt className="mt-1 text-sm leading-[1.8] text-[#2F333D]">{s.label}</dt>
              <dd className="font-heading text-2xl text-[#2F333D]">{s.value}</dd>
            </motion.div>
          ))}
        </dl>

        <motion.ul variants={ctaVariants} className="mt-10 flex flex-wrap gap-x-8 gap-y-2 text-sm leading-[1.8] text-[#2F333D]">
          {['食品包装対応', '厳格な品質管理', '完全カスタマイズ', '日本語サポート'].map(t => (
            <li key={t}>{t}</li>
          ))}
        </motion.ul>
      </div>
    </motion.section>
  )
}
