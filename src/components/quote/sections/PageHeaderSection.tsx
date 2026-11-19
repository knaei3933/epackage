'use client'

import React from 'react'
import { Calculator, BarChart3, Target } from 'lucide-react'
import { PageHeader } from '@/components/layout'

/**
 * ページヘッダーセクションコンポーネント
 * 統合見積もりシステムのタイトルと特長（PageHeader。パンくずは共通の BreadcrumbNav が出す）
 */
export function PageHeaderSection() {
  const items = [
    { icon: Calculator, label: '即座に価格算出' },
    { icon: BarChart3, label: '数量で比較検討' },
    { icon: Target, label: '最適数量を提案' },
  ]
  return (
    <PageHeader
      title="統合見積もりシステム"
      lead="AI-poweredでお客様のニーズに合わせた最適な包装ソリューションをご提案します"
    >
      <ul className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-8">
        {items.map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-2 text-sm text-text-primary">
            <Icon className="h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
            <span>{label}</span>
          </li>
        ))}
      </ul>
    </PageHeader>
  )
}
