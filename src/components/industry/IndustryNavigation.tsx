'use client'

import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
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
      icon: '🍎',
      description: '食品衛生法対応・コスト削減'
    },
    {
      key: 'cosmetics',
      name: '化粧品業界',
      href: '/industry/cosmetics',
      icon: '💄',
      description: 'プレミアム包装・ブランド価値向上'
    },
    {
      key: 'pharmaceutical',
      name: '医薬品業界',
      href: '/industry/pharmaceutical',
      icon: '💊',
      description: 'GMP準拠・安全包装'
    },
    {
      key: 'electronics',
      name: '電子部品業界',
      href: '/industry/electronics',
      icon: '🔌',
      description: 'ESD防止・精密保護'
    }
  ]

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="inline-block mb-6">
            <h1 className="text-3xl font-bold text-brixa-600 dark:text-brixa-400">
              Epackage Lab
            </h1>
          </Link>
        </div>
        <div className="flex-1">
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {industries.map((industry) => (
              <Link
                key={industry.key}
                href={industry.href}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeIndustry === industry.key
                    ? 'bg-brixa-600 text-brixa-600 font-medium'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span className="text-lg">{industry.icon}</span>
                <div className="text-left">
                  <div className="font-medium">{industry.name}</div>
                  <div className="text-xs text-gray-500">{industry.description}</div>
                </div>
                {activeIndustry === industry.key && (
                  <CheckCircle className="w-4 h-4 ml-auto" />
                )}
              </Link>
            ))}
          </div>
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
