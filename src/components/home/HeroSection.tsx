'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { heroVariants, statVariants, ctaVariants } from './animations'

const LAYERS = [
  { name: 'PET', y: 0, h: 60, fill: '#5EB6AC', opacity: 0.55 },
  { name: '接着層', y: 60, h: 16, fill: '#2D6C65', opacity: 0.35 },
  { name: 'アルミ箔', y: 76, h: 28, fill: '#C0C0C0', opacity: 1 },
  { name: '接着層', y: 104, h: 16, fill: '#2D6C65', opacity: 0.35 },
  { name: 'PEシーラント', y: 120, h: 88, fill: '#5EB6AC', opacity: 0.3 },
]

// 1回だけ層が滑り込む演出。CSS で行うため、サーバーとクライアントの出力が一致する。
const LAYER_CSS = `
@keyframes home-layer-in { from { transform: translateX(-340px); } to { transform: none; } }
.home-layer { animation: home-layer-in 0.7s cubic-bezier(0.22, 1, 0.36, 1) both; }
@media (prefers-reduced-motion: reduce) { .home-layer { animation: none; } }
`

function track(label: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'click', { event_category: 'cta_button', event_label: label, value: 1 })
  }
}

const ALT = 'パウチ素材の層構造の断面図。PET、接着層、アルミ箔、接着層、PEシーラントの順に重なっている'

function Layers({ width }: { width: number }) {
  return (
    <>
      {LAYERS.map((l, i) => (
        <rect
          key={i}
          className="home-layer"
          x={0}
          y={l.y}
          width={width}
          height={l.h}
          fill={l.fill}
          fillOpacity={l.opacity}
          style={{ animationDelay: `${0.15 * i}s` }}
        />
      ))}
    </>
  )
}

function LayerCrossSection() {
  return (
    <div>
      <style>{LAYER_CSS}</style>
      {/* lg 以上: 図の横にラベルを置く（14px 以上） */}
      <svg viewBox="0 0 440 208" role="img" aria-label={ALT} className="hidden h-auto w-full lg:block">
        <Layers width={290} />
        {LAYERS.map((l, i) => (
          <g key={i}>
            <line x1={296} x2={314} y1={l.y + l.h / 2} y2={l.y + l.h / 2} stroke="#5EB6AC" strokeWidth={1} />
            <text
              x={320}
              y={l.y + l.h / 2 + 6}
              fontSize={17}
              fill="#2F333D"
              fontFamily="var(--font-home-body), sans-serif"
            >
              {l.name}
            </text>
          </g>
        ))}
      </svg>
      {/* lg 未満: 図は全幅、ラベルは下の凡例（SVG 内ラベルは lg 以上のみ） */}
      <svg viewBox="0 0 300 208" role="img" aria-label={ALT} className="h-auto w-full lg:hidden">
        <Layers width={300} />
      </svg>
      <ol className="mt-4 space-y-1 text-sm leading-[1.8] text-[#2F333D] lg:hidden">
        {LAYERS.map((l, i) => (
          <li key={i} className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="inline-block h-3 w-6 shrink-0 rounded-[2px]"
              style={{ backgroundColor: l.fill, opacity: Math.max(l.opacity, 0.5) }}
            />
            {l.name}
          </li>
        ))}
      </ol>
      <p className="mt-3 text-sm leading-[1.8] text-[#2F333D]">積層構造の概念図（寸法は製品により異なります）</p>
    </div>
  )
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
            <h1 className="[word-break:keep-all] [overflow-wrap:anywhere] font-[family-name:var(--font-home-heading)] text-[1.75rem] leading-[1.35] text-[#2F333D] md:text-[2.5rem] xl:text-5xl">
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
          <motion.div variants={statVariants} className="rounded-[4px] bg-[#F4F8F7] p-4 sm:p-6">
            <LayerCrossSection />
          </motion.div>
        </div>

        <dl className="mt-16 grid gap-x-8 gap-y-6 md:grid-cols-3">
          {SPECS.map(s => (
            <motion.div key={s.value} variants={statVariants} className="flex flex-col-reverse justify-end border-t border-[#5EB6AC] pt-4">
              <dt className="mt-1 text-sm leading-[1.8] text-[#2F333D]">{s.label}</dt>
              <dd className="font-[family-name:var(--font-home-heading)] text-2xl text-[#2F333D]">{s.value}</dd>
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
