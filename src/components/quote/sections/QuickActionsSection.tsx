'use client'

import React from 'react'
import Link from 'next/link'
import { Calculator, FileText, Phone } from 'lucide-react'
import { MotionWrapper } from '@/components/ui/MotionWrapper'
import { Card } from '@/components/ui/Card'
import { trackPhoneClick } from '@/lib/analytics'

/**
 * Quick Actions Section Component
 *
 * Displays quick action cards for users to access different services:
 * - Integrated Quote Tool (AI instant quote)
 * - Detailed Quote (expert consultation)
 * - Immediate Consultation (phone)
 *
 * Epackage UI 基準 v1: 操作できる Card（interactive）3 枚。色分けはせず、アイコンは text-brand。
 */
const CARD_LINK =
  'group block rounded-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2'

export function QuickActionsSection() {
  return (
    <section className="py-16 md:py-24 bg-bg-secondary">
      <div className="mx-auto max-w-[1120px] px-4 sm:px-6">
        <MotionWrapper delay={0.4}>
          <div className="mb-12 max-w-[40em]">
            <h2 className="font-heading text-2xl md:text-[2rem] leading-[1.4] text-text-primary [word-break:keep-all] [overflow-wrap:anywhere]">
              その他のご案内
            </h2>
            <p className="mt-4 text-text-secondary">
              お見積もり以外のご要望にお応えします
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {/* Integrated Quote Tool Card */}
            <Link href="/quote-simulator" className={CARD_LINK}>
              <Card variant="interactive" className="h-full p-6">
                <div className="mb-4 flex items-start gap-4">
                  <Calculator className="h-7 w-7 shrink-0 text-brand" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <h3 className="mb-1 text-base font-bold text-text-primary sm:text-lg">
                      見積もりシミュレーター
                    </h3>
                    <p className="text-sm text-text-secondary">AI即時見積もり</p>
                  </div>
                </div>
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <span className="text-sm text-text-secondary">複数数量で比較</span>
                  <span className="text-sm font-medium text-brand">現在地で利用中 →</span>
                </div>
              </Card>
            </Link>

            {/* Detailed Quote Card */}
            <Link href="/contact" className={CARD_LINK}>
              <Card variant="interactive" className="h-full p-6">
                <div className="mb-4 flex items-start gap-4">
                  <FileText className="h-7 w-7 shrink-0 text-brand" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <h3 className="mb-1 text-base font-bold text-text-primary sm:text-lg">
                      詳細見積もり
                    </h3>
                    <p className="text-sm text-text-secondary">専門家相談</p>
                  </div>
                </div>
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <span className="text-sm text-text-secondary">詳細仕様対応</span>
                  <span className="text-sm font-medium text-brand">お問い合わせ →</span>
                </div>
              </Card>
            </Link>

            {/* Immediate Consultation Card */}
            <a
              href="tel:050-3613-9673"
              onClick={() => trackPhoneClick('050-3613-9673', 'cta')}
              className={CARD_LINK}
            >
              <Card variant="interactive" className="h-full p-6">
                <div className="mb-4 flex items-start gap-4">
                  <Phone className="h-7 w-7 shrink-0 text-brand" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <h3 className="mb-1 text-base font-bold text-text-primary sm:text-lg">
                      即時相談
                    </h3>
                    <p className="text-sm text-text-secondary">電話でご相談</p>
                  </div>
                </div>
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <span className="text-sm text-text-secondary">即時対応</span>
                  <span className="text-sm font-medium text-brand">発信 →</span>
                </div>
                <div className="mt-3 rounded-inner border border-border-medium bg-bg-secondary px-4 py-2.5 text-center text-sm font-medium text-text-primary">
                  050-3613-9673
                </div>
              </Card>
            </a>
          </div>
        </MotionWrapper>
      </div>
    </section>
  )
}
