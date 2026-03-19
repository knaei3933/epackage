'use client'

import React from 'react'
import Link from 'next/link'
import { LucideIcon } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { MotionWrapper } from '@/components/ui/MotionWrapper'

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
  /** パンくずリストに表示する現在ページ名 */
  currentPageName: string
  /** Trust Indicators（信頼指標）の配列 */
  trustIndicators: TrustIndicator[]
}

/**
 * QuoteSimulatorHeader コンポーネント
 *
 * 見積もりシミュレーターのページヘッダーセクションを表示
 * タイトル、説明、Trust Indicatorsをpropsとして受け取る
 */
export function QuoteSimulatorHeader({
  title,
  description,
  currentPageName,
  trustIndicators
}: QuoteSimulatorHeaderProps) {
  return (
    <section className="py-8 bg-gradient-to-br from-navy-700 to-navy-900 border-b">
      <Container size="6xl">
        <MotionWrapper delay={0.1}>
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-navy-200 mb-4" aria-label="パンくずリスト">
            <Link href="/" className="hover:text-white transition-colors">
              ホーム
            </Link>
            <span>/</span>
            <span className="text-white font-medium">{currentPageName}</span>
          </nav>

          {/* Page Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            {title}
          </h1>
          <p className="text-navy-100 text-lg mb-4">
            {description}
          </p>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-navy-200">
            {trustIndicators.map((indicator, index) => {
              const Icon = indicator.icon
              return (
                <div key={index} className="flex items-center space-x-2">
                  <Icon className="w-4 h-4 text-green-400" />
                  <span>{indicator.label}</span>
                </div>
              )
            })}
          </div>
        </MotionWrapper>
      </Container>
    </section>
  )
}
