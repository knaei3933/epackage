/**
 * BreadcrumbList JSON-LD (Server Component).
 *
 * 6-C 方針: JSON-LD はサーバーコンポーネントで SSR 出力する。
 * 'use client' なし・usePathname なし・headers() なし（動的レンダリング回避）。
 * pathname は各 page.tsx から props で受け取る。
 */

import { generateBreadcrumbs } from '@/lib/seo/breadcrumbs'

interface BreadcrumbJsonLdProps {
  pathname: string
}

export function BreadcrumbJsonLd({ pathname }: BreadcrumbJsonLdProps) {
  const breadcrumbs = generateBreadcrumbs(pathname)

  // ホームのみの場合は breadcrumb なし（JSON-LD 出力しない）
  if (breadcrumbs.length === 1) return null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `https://www.package-lab.com${item.href}`,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
