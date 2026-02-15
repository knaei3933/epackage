'use client'

import { usePathname } from 'next/navigation'
import { Home } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  name: string
  href: string
  current?: boolean
}

export function BreadcrumbList() {
  const pathname = usePathname()

  // Generate breadcrumb items based on current path
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [
      { name: 'ホーム', href: '/', current: pathname === '/' },
    ]

    if (pathname === '/') return items

    // Remove language prefix if present
    const pathWithoutLang = pathname.startsWith('/ja')
      ? pathname.slice(3)
      : pathname.startsWith('/en')
      ? pathname.slice(3)
      : pathname

    const pathSegments = pathWithoutLang.split('/').filter(Boolean)

    let currentHref = ''
    pathSegments.forEach((segment, index) => {
      currentHref += `/${segment}`
      const isLast = index === pathSegments.length - 1

      // Convert segment to readable name
      let name = segment
        .replace(/-/g, ' ')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase())

      // Special cases for Japanese
      if (pathname.startsWith('/ja')) {
        const segmentMap: Record<string, string> = {
          'about': '会社概要',
          'catalog': '製品カタログ',
          'contact': 'お問い合わせ',
          'service': 'サービス',
          'services': 'サービス',
          'flow': '製造工程',
          'print': '印刷技術',
          'guide': '品質管理',
          'archives': '導入事例',
          'industry': '業界別ソリューション',
          'food-manufacturing': '食品製造',
          'cosmetics': '化粧品',
          'pharmaceutical': '医薬品',
          'electronics': '電子機器',
          'quote-simulator': '見積りシミュレーター',
          'samples': 'サンプル',
        }
        name = segmentMap[segment] || name
      }

      items.push({
        name,
        href: currentHref,
        current: isLast
      })
    })

    return items
  }

  const breadcrumbs = generateBreadcrumbs()

  if (breadcrumbs.length === 1) return null

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center space-x-2 text-sm py-4"
      role="navigation"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": breadcrumbs.map((item, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "name": item.name,
              "item": `https://epackage-lab.com${item.href}`
            }))
          })
        }}
      />
      {breadcrumbs.map((item, index) => (
        <div key={item.href} className="flex items-center space-x-2">
          {index > 0 && (
            <span className="text-gray-400" aria-hidden="true">/</span>
          )}
          {item.current ? (
            <span className="text-brixa-600 font-medium" aria-current="page">
              {item.name}
            </span>
          ) : (
            <Link
              href={item.href}
              className={cn(
                "text-text-secondary hover:text-brixa-600 transition-colors",
                "flex items-center space-x-1"
              )}
            >
              {index === 0 && <Home className="w-4 h-4" />}
              <span>{item.name}</span>
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}