'use client'

import Link from 'next/link'
import { Apple, Check, Cpu, Pill, Sparkles } from 'lucide-react'
import { Suspense } from 'react'

interface IndustryNavigationProps {
  activeIndustry: string
}

function IndustryNavigationInner({ activeIndustry }: IndustryNavigationProps) {
  // Don't use hooks at module level - defer to render time
  // This prevents usePathname Suspense errors during build

  const industries = [
    {
      key: 'food-manufacturing',
      name: '食品製造業',
      href: '/industry/food-manufacturing',
      icon: Apple,
      description: '厳格な品質管理・コスト削減'
    },
    {
      key: 'cosmetics',
      name: '化粧品業界',
      href: '/industry/cosmetics',
      icon: Sparkles,
      description: 'プレミアム包装・ブランド価値向上'
    },
    {
      key: 'pharmaceutical',
      name: '医薬品業界',
      href: '/industry/pharmaceutical',
      icon: Pill,
      description: 'GMP準拠・安全包装'
    },
    {
      key: 'electronics',
      name: '電子部品業界',
      href: '/industry/electronics',
      icon: Cpu,
      description: 'ESD防止・精密保護'
    }
  ]

  return (
    // 業界の切り替えは、デスクトップ幅だけに出す（HEAD と同じ。スマホでは出さない）。
    // ブランド名のリンクは、全ページ共通のヘッダーにあるので、ここには置かない。
    <nav aria-label="業界別ソリューション" className="hidden border-b border-border-medium bg-bg-primary lg:block">
      <div className="mx-auto max-w-[1120px] px-4 sm:px-6">
        <div className="flex items-center gap-2 py-3">
          {industries.map((industry) => {
            const Icon = industry.icon
            const isActive = activeIndustry === industry.key
            return (
              <Link
                key={industry.key}
                href={industry.href}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-2 rounded-md px-4 py-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                  isActive
                    ? 'bg-brand-muted font-medium text-on-brand-muted'
                    : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                <div className="text-left">
                  <div className="font-medium">{industry.name}</div>
                  <div className={`text-xs ${isActive ? 'text-on-brand-muted' : 'text-text-muted'}`}>{industry.description}</div>
                </div>
                {isActive && <Check className="ml-auto h-4 w-4" aria-hidden="true" />}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  );
}

// Wrapper component with Suspense boundary for usePathname
export function IndustryNavigation(props: IndustryNavigationProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <IndustryNavigationInner {...props} />
    </Suspense>
  );
}

export default IndustryNavigation;
