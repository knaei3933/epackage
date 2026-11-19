'use client'

import React from 'react'
import { LucideIcon } from 'lucide-react'
import { PageHeader } from '@/components/layout'

/**
 * Trust Indicator プロパティ
 */
export interface TrustIndicator {
  icon: LucideIcon
  label: string
}

/**
 * QuoteSimulatorHeader プロパティ
 */
export interface QuoteSimulatorHeaderProps {
  /** ページタイトル */
  title: string
  /** ページ説明 */
  description: string
  /** パンくずリストに表示する現在ページ名（パンくずは全ページ共通の BreadcrumbNav が出すため、現在は未使用） */
  currentPageName?: string
  /** Trust Indicators（信頼指標）の配列 */
  trustIndicators: TrustIndicator[]
}

/**
 * QuoteSimulatorHeader コンポーネント
 *
 * 見積もりシミュレーターのページの頭（Epackage UI 基準 v1 の PageHeader）。
 * 特長はアイコンつきの短いリストとして導入文の下に置く。
 */
export function QuoteSimulatorHeader({
  title,
  description,
  trustIndicators
}: QuoteSimulatorHeaderProps) {
  return (
    <PageHeader title={title} lead={description}>
      <ul className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-8">
        {trustIndicators.map((indicator, index) => {
          const Icon = indicator.icon
          return (
            <li key={index} className="flex items-center gap-2 text-sm text-text-primary">
              <Icon className="h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
              <span>{indicator.label}</span>
            </li>
          )
        })}
      </ul>
    </PageHeader>
  )
}
