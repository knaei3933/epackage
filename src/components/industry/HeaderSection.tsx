import { Fragment } from 'react'
import type { LucideIcon } from 'lucide-react'
import { ArrowRight, Check, Star } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/Button'
import { PageHeader, FactList } from '@/components/layout'

/**
 * 長いカタカナ語の前に、改行してよい位置（<wbr>）を置く。
 * ブラウザの文節の判定は、カタカナの複合語（パッケージングソリューション）の中を見分けられず、
 * 375px 幅で「パッケージ／ング」のように語の途中で切れる。表示される文字は変えない。
 */
function breakBeforeLongWords(text: string) {
  return text.split(/(?=パッケージング|ソリューション)/).map((part, i) => (
    <Fragment key={i}>
      {i > 0 && <wbr />}
      {part}
    </Fragment>
  ))
}

interface HeaderSectionProps {
  title: string
  subtitle: string
  icon: LucideIcon
  features: string[]
  stats: {
    satisfaction: string
    roi: string
    delivery: string
    cases: string
  }
}

export function HeaderSection({ title, subtitle, icon: Icon, features, stats }: HeaderSectionProps) {
  return (
    <PageHeader
      title={
        <>
          <Icon className="mr-3 inline-block h-7 w-7 align-[-0.1em] text-brand" aria-hidden="true" />
          {breakBeforeLongWords(title)}
        </>
      }
      lead={subtitle}
      actions={
        <>
          <Link href="/catalog" className={buttonVariants({ size: 'lg', variant: 'primary' })}>
            導入資料ダウンロード
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>
          <Link href="/contact" className={buttonVariants({ size: 'lg', variant: 'outline' })}>
            無料相談を予約
          </Link>
        </>
      }
    >
      <div className="space-y-10">
        <div>
          <h2 className="mb-3 text-lg font-bold text-text-primary">主要特長</h2>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-text-primary">
                <Check className="h-5 w-5 flex-shrink-0 text-brand" aria-hidden="true" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <FactList
          items={[
            { value: stats.roi, label: 'ROI改善率' },
            { value: stats.cases, label: '導入事例' },
            { value: stats.satisfaction, label: '満足度' },
            { value: stats.delivery, label: '最短納期' },
          ]}
        />

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-text-secondary">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-brand" aria-hidden="true" />
            <span>4.9/5.0 ({stats.satisfaction} 満足度)</span>
          </div>
          <div>{stats.cases}社の導入実績</div>
        </div>
      </div>
    </PageHeader>
  )
}
