import * as React from 'react'
import { headingFont } from '@/components/home/fonts'
import { cn } from '@/lib/utils'

/**
 * 公開ページの「ページの頭」（Epackage UI 基準 v1、src/styles/DESIGN_STANDARD.md「ページの型」）。
 * 単色の面 + 左そろえのタイトル。グラデーション・写真の重ね・ガラス風・丸いラベルは使わない。
 * タイトル（h1）は 1 ページに 1 つ。操作は 2 つまで（主ボタンは 1 つ）。
 *
 * `--font-heading`（明朝）は、この部品の中でだけ有効（headingFont.variable を自分につけるため）。
 */
export interface PageHeaderProps {
  /** h1 */
  title: React.ReactNode
  /** 導入文。全角 40 字ほどの幅に収まる長さにする */
  lead?: React.ReactNode
  /** 操作（`Button` か、下線つきのテキストリンク）。主ボタンは 1 つだけ */
  actions?: React.ReactNode
  /** タイトルの下に置く内容（`FactList` など） */
  children?: React.ReactNode
  /** 面の色。既定は Mist（`muted`）。白にしたいときは `plain` */
  tone?: 'muted' | 'plain'
  className?: string
  id?: string
}

export function PageHeader({ title, lead, actions, children, tone = 'muted', className, id }: PageHeaderProps) {
  return (
    <section
      id={id}
      className={cn(
        headingFont.variable,
        'border-b border-border-medium py-12 md:py-16',
        tone === 'muted' ? 'bg-bg-secondary' : 'bg-bg-primary',
        className
      )}
    >
      <div className="mx-auto max-w-[1120px] px-4 sm:px-6">
        <h1 className="[word-break:keep-all] [overflow-wrap:anywhere] font-heading text-[1.75rem] leading-[1.4] text-text-primary md:text-4xl">
          {title}
        </h1>
        {lead ? <p className="mt-4 max-w-[40em] text-base leading-[1.8] text-text-secondary">{lead}</p> : null}
        {actions ? (
          <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8">
            {actions}
          </div>
        ) : null}
        {children ? <div className="mt-10">{children}</div> : null}
      </div>
    </section>
  )
}

/**
 * 数字や事実の行（トップのヒーローと同じ見た目）。値を上、項目名を下に見せる。
 * 読み上げの順序（項目名 → 値）を守るため、DOM は dt → dd のままにして、見た目だけ逆にしている。
 */
export interface FactListProps {
  items: ReadonlyArray<{ value: string; label: string }>
  className?: string
}

export function FactList({ items, className }: FactListProps) {
  return (
    <dl className={cn('grid gap-x-8 gap-y-6 sm:grid-cols-2 md:grid-cols-4', className)}>
      {items.map(item => (
        <div key={item.label} className="flex flex-col-reverse justify-end border-t border-brand-soft pt-4">
          <dt className="mt-1 text-sm leading-[1.8] text-text-primary">{item.label}</dt>
          <dd className="font-heading text-2xl text-text-primary">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}
