import * as React from 'react'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { headingFont } from '@/components/home/fonts'
import { Card } from '@/components/ui'
import { cn } from '@/lib/utils'

/**
 * 認証ページの共通の枠（Epackage UI 基準 v1）。
 * - 背景は Mist（bg-bg-secondary）の単色。カードは細い枠線で影なし。
 * - h1 は、そのページの本当のタイトル。ブランド名は、ホームへの普通のリンク。
 * - ルート layout が <main> を出すので、ここは <div>（<main> を入れ子にしない）。
 */

const TITLE_CLASS =
  '[word-break:keep-all] supports-[word-break:auto-phrase]:[word-break:auto-phrase] [overflow-wrap:anywhere] text-balance font-heading text-[length:clamp(1.375rem,6.4vw,1.75rem)] font-medium leading-[1.4] text-text-primary md:text-4xl'

export interface AuthShellProps {
  /** h1 */
  title: React.ReactNode
  /** タイトルの下の説明 */
  description?: React.ReactNode
  /** 「Epackage Lab」のホームリンクを、タイトルの上に出すか */
  brand?: boolean
  /** narrow = 短いフォーム（max-w-md）、wide = 会員登録（max-w-4xl） */
  width?: 'narrow' | 'wide'
  children: React.ReactNode
}

export function AuthShell({ title, description, brand = true, width = 'narrow', children }: AuthShellProps) {
  return (
    <div
      className={cn(
        headingFont.variable,
        'min-h-screen bg-bg-secondary px-4 py-12 sm:px-6 lg:px-8',
        width === 'narrow' && 'flex items-center justify-center'
      )}
    >
      <div className={cn('w-full', width === 'narrow' ? 'max-w-md' : 'mx-auto max-w-4xl')}>
        <div className="mb-8 text-center">
          {brand && (
            <Link
              href="/"
              className="mb-4 inline-flex min-h-11 items-center rounded-inner font-heading text-xl text-brand hover:text-brand-pressed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              Epackage Lab
            </Link>
          )}
          <h1 className={TITLE_CLASS}>{title}</h1>
          {description ? <p className="mt-3 text-text-secondary">{description}</p> : null}
        </div>
        {children}
      </div>
    </div>
  )
}

type Tone = 'error' | 'warning' | 'info' | 'success' | 'neutral'

// 状態トークン（静的な文字列。動的に組み立てると Tailwind が CSS を作らない）
const TONE_ICON: Record<Tone, string> = {
  error: 'bg-error-muted text-on-error-muted',
  warning: 'bg-warning-muted text-on-warning-muted',
  info: 'bg-info-muted text-on-info-muted',
  success: 'bg-success-muted text-on-success-muted',
  neutral: 'bg-bg-secondary text-text-secondary',
}

const TONE_PANEL: Record<Tone, string> = {
  error: 'bg-error-muted border-error text-on-error-muted',
  warning: 'bg-warning-muted border-warning text-on-warning-muted',
  info: 'bg-info-muted border-info text-on-info-muted',
  success: 'bg-success-muted border-success text-on-success-muted',
  neutral: 'bg-bg-secondary border-border-medium text-text-primary',
}

export interface AuthStatusCardProps {
  tone: Tone
  icon: LucideIcon
  /** h1（状態を言葉で示す） */
  title: React.ReactNode
  /** アイコンを回して見せる（読み込み中だけ） */
  spin?: boolean
  children?: React.ReactNode
}

/** 状態を伝えるカード: 状態色のアイコン + h1（言葉）+ 本文。状態は色だけで伝えない。 */
export function AuthStatusCard({ tone, icon: Icon, title, spin, children }: AuthStatusCardProps) {
  return (
    <div className={cn(headingFont.variable, 'min-h-screen bg-bg-secondary px-4 py-12 sm:px-6 flex items-center justify-center')}>
      <Card className="w-full max-w-md p-6 text-center md:p-8">
        <div className={cn('mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-container', TONE_ICON[tone])}>
          <Icon aria-hidden="true" className={cn('h-7 w-7', spin && 'animate-spin')} />
        </div>
        <h1 className={cn(TITLE_CLASS, 'mb-3 !text-2xl md:!text-[1.75rem]')}>{title}</h1>
        {children}
      </Card>
    </div>
  )
}

/** 本文の囲み（状態色の淡い面 + 細い枠）。左そろえ。 */
export function AuthNotice({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <div className={cn('mb-6 rounded-container border p-4 text-left', TONE_PANEL[tone])}>{children}</div>
  )
}

/** カードの下の、下線つきのテキストリンク（押せる範囲 44px 以上）。 */
export const AUTH_TEXT_LINK =
  'inline-flex min-h-11 items-center rounded-inner text-brand underline underline-offset-4 hover:text-brand-pressed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2'
