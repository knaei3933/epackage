'use client'

import { buttonVariants } from '@/components/ui/Button'
import Link from 'next/link'
import { Calculator, Users } from 'lucide-react'

interface ROISectionProps {
  industry: string
}

/**
 * 業界ごとの効果の数字は、根拠（出典）がないため置かない。
 * 費用は、仕様を入れた見積もりで確かめてもらう。
 */
export function ROISection({ industry }: ROISectionProps) {
  return (
    <div className="space-y-4 text-center" data-industry={industry}>
      <h3 className="text-2xl font-bold text-text-primary">費用を確かめる</h3>
      <p className="text-lg text-text-secondary">
        仕様と数量を入れると、費用の目安がわかります。
        ご相談もお受けします。
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/quote-simulator" className={buttonVariants({ size: 'lg', variant: 'primary' })}>
          <Calculator className="w-5 h-5 mr-2" aria-hidden="true" />
          見積もりで費用を確かめる
        </Link>
        <Link href="/contact" className={buttonVariants({ size: 'lg', variant: 'outline' })}>
          <Users className="w-5 h-5 mr-2" aria-hidden="true" />
          専門家へ相談
        </Link>
      </div>
    </div>
  )
}
