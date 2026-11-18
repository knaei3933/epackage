'use client'

import Image from 'next/image'
import { MotionWrapper } from '@/components/ui/MotionWrapper'

const manufacturingProcesses = [
  {
    step: '01',
    title: 'デジタル印刷',
    image: '/images/print.webp',
    description: 'HP Indigo 25000を活用した高品質デジタル印刷。小ロットから大量生産まで迅速なリードタイムと正確な色再現を実現します。',
    features: ['HP Indigo 25000', '高鮮明カラー', '迅速リードタイム', 'カスタム印刷'],
  },
  {
    step: '02',
    title: 'ラミネート加工',
    image: '/images/rami.webp',
    description: 'NON-VOC環境配慮型ラミネート工法。有機溶媒を使用しない環境配慮型設備で安全で清潔な包装材を生産します。',
    features: ['NON-VOC工法', '溶剤フリー(Solvent Free)', '環境配慮材料', '安全性確保'],
  },
  {
    step: '03',
    title: 'スリッティング/切断',
    image: '/images/cut.webp',
    description: '精密スリッティング及び切断技術。島打刃を活用しμm単位の精密な加工精度を維持します。',
    features: ['島打刃設備', 'μm単位精度', '自動品質検査', '一貫した規格'],
  },
  {
    step: '04',
    title: 'パウチ加工',
    image: '/images/pouch.webp',
    description: '一貫した生産ラインシステム。印刷、ラミネート、スリッティング、パウチ加工まで一つのシステムで管理し品質の一貫性を保証します。',
    features: ['統合生産ライン', '品質一貫性', '工期短縮', '費用効率性'],
  },
]

const qualityStats = [
  { value: '99.8%', label: '品質合格率' },
  { value: '24時間', label: '生産リードタイム' },
  { value: '15年', label: '平均従業年数' },
  { value: '100社以上', label: '導入実績' },
]

export function ManufacturingProcessShowcase() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-[1120px] px-4 sm:px-6">
        <MotionWrapper delay={0.1}>
        <h2 className="[word-break:keep-all] [overflow-wrap:anywhere] font-[family-name:var(--font-home-heading)] text-2xl sm:text-3xl leading-[1.4] text-[#2F333D] md:text-4xl">
          一貫したパウチ製造サービス
        </h2>
        <p className="mt-2 font-[family-name:var(--font-home-heading)] text-lg leading-[1.6] text-[#2D6C65]">
          印刷、ラミネート、スリッティング、パウチ加工
        </p>
        <p className="mt-4 max-w-[40em] leading-[1.8] text-[#2F333D]">
          印刷、ラミネート、スリッティング、パウチ加工まで一貫して製作しています。
          NON-VOC環境配慮型設備と精密加工技術で高品質包装材を生産します。
        </p>
        </MotionWrapper>

        <ol className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {manufacturingProcesses.map((p, index) => (
            <li key={p.step} className="border-t border-[#5EB6AC] pt-4">
              <MotionWrapper delay={0.2 + index * 0.15}>
              <span className="font-[family-name:var(--font-home-heading)] text-2xl text-[#2D6C65]">{p.step}</span>
              <h3 className="mt-2 [word-break:keep-all] [overflow-wrap:anywhere] font-[family-name:var(--font-home-heading)] text-xl text-[#2F333D]">{p.title}</h3>
              <div className="relative mt-4 aspect-[4/3] overflow-hidden rounded-[4px] bg-[#F4F8F7]">
                <Image
                  src={p.image}
                  alt={p.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              </div>
              <p className="mt-4 text-[15px] leading-[1.8] text-[#2F333D]">{p.description}</p>
              <ul className="mt-3 text-sm leading-[1.8] text-[#2F333D]">
                {p.features.map(f => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              </MotionWrapper>
            </li>
          ))}
        </ol>

        <MotionWrapper delay={0.8}>
        <dl className="mt-16 grid gap-x-6 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          {qualityStats.map(s => (
            <div key={s.label} className="flex flex-col-reverse justify-end border-t border-[#5EB6AC] pt-4">
              <dt className="mt-1 text-sm leading-[1.8] text-[#2F333D]">{s.label}</dt>
              <dd className="font-[family-name:var(--font-home-heading)] text-2xl text-[#2F333D]">{s.value}</dd>
            </div>
          ))}
        </dl>
        </MotionWrapper>
      </div>
    </section>
  )
}
