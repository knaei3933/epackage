/**
 * Breadcrumb UI Navigation (Client Component).
 *
 * 6-C 方針: UI ナビはクライアント境界に維持（動的レンダリング回避）。
 * 'use client' 維持・usePathname 維持。
 * JSON-LD は BreadcrumbJsonLd (サーバー) に分離済み。本コンポーネントは UI のみ。
 * generateBreadcrumbs は lib/seo/breadcrumbs.ts から import して SSOT 維持。
 */

'use client'

import { usePathname } from 'next/navigation'
import { Home } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { generateBreadcrumbs } from '@/lib/seo/breadcrumbs'

export function BreadcrumbNav() {
  const pathname = usePathname()
  const breadcrumbs = generateBreadcrumbs(pathname)

  // ホームのみの場合は breadcrumb ナビ非表示
  if (breadcrumbs.length === 1) return null

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center space-x-2 text-sm py-4"
      role="navigation"
    >
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
