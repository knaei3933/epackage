'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import { Suspense } from 'react'

interface IndustryNavigationProps {
  activeIndustry: string
}

function IndustryNavigationContent({ activeIndustry }: IndustryNavigationProps) {
  const pathname = usePathname()

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
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">📦</span>
            <span className="font-bold text-xl">Epackage Lab</span>
          </Link>

          {/* Industry Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {industries.map((industry) => (
              <Link
                key={industry.key}
                href={industry.href}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeIndustry === industry.key
                    ? 'bg-navy-600 text-navy-600 font-medium'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span className="text-lg">{industry.icon}</span>
                <span>{industry.name}</span>
                {activeIndustry === industry.key && (
                  <CheckCircle className="w-4 h-4" />
                )}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Toggle */}
          <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Industry Navigation */}
        <div className="lg:hidden border-t py-2">
          <div className="grid grid-cols-2 gap-2">
            {industries.map((industry) => (
              <Link
                key={industry.key}
                href={industry.href}
                className={`flex items-center space-x-2 p-3 rounded-lg transition-all duration-200 ${
                  activeIndustry === industry.key
                    ? 'bg-navy-600 text-navy-600 font-medium'
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
  )
}

export default function IndustryNavigation(props: IndustryNavigationProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <IndustryNavigationContent {...props} />
    </Suspense>
  );
}
