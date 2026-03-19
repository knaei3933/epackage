'use client'

import React from 'react'
import Link from 'next/link'
import { Calculator, BarChart3, Target } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { MotionWrapper } from '@/components/ui/MotionWrapper'

/**
 * ページヘッダーセクションコンポーネント
 * 統合見積もりシステムのタイトル、パンくずリスト、トラストインジケーターを表示
 */
export function PageHeaderSection() {
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
            <span className="text-white font-medium">統合見積もりシステム</span>
          </nav>

          {/* Page Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            統合見積もりシステム
          </h1>
          <p className="text-navy-100 text-lg mb-4">
            AI-poweredでお客様のニーズに合わせた最適な包装ソリューションをご提案します
          </p>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-navy-200">
            <div className="flex items-center space-x-2">
              <Calculator className="w-4 h-4 text-green-400" />
              <span>即座に価格算出</span>
            </div>
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-green-400" />
              <span>数量で比較検討</span>
            </div>
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-green-400" />
              <span>最適数量を提案</span>
            </div>
          </div>
        </MotionWrapper>
      </Container>
    </section>
  )
}
