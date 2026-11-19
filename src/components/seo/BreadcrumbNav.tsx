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
import { generateBreadcrumbs, type BreadcrumbItem } from '@/lib/seo/breadcrumbs'

// 認証ページのパンくず: 「auth」の階層は出さず、ページ名を日本語にする（URL は変えない）。
const AUTH_LABELS: Record<string, string> = {
  signin: 'ログイン',
  register: '会員登録',
  'forgot-password': 'パスワードの再設定',
  'reset-password': 'パスワードの再設定',
  pending: '承認待ち',
  error: 'エラー',
  suspended: '利用停止',
  signout: 'ログアウト',
}

function localizeAuthBreadcrumbs(items: BreadcrumbItem[]): BreadcrumbItem[] {
  // items: [ホーム, Auth, <ページ>, ...]。<ページ> より深い階層（signin/form-post）は出さない。
  const authIndex = items.findIndex((item) => item.href === '/auth' || item.href === '/ja/auth' || item.href === '/en/auth')
  if (authIndex !== 1 || items.length < 3) return items
  const page = items[2]
  const label = AUTH_LABELS[page.href.split('/').pop() ?? '']
  if (!label) return items
  return [items[0], { name: label, href: page.href, current: true }]
}

export function BreadcrumbNav() {
  const pathname = usePathname()
  const breadcrumbs = localizeAuthBreadcrumbs(generateBreadcrumbs(pathname))

  // ホームのみの場合は breadcrumb ナビ非表示
  if (breadcrumbs.length === 1) return null

  return (
    <nav
      aria-label="Breadcrumb"
      className="mx-auto flex max-w-[1120px] flex-wrap items-center px-4 py-2 text-sm sm:px-6 sm:py-4"
      role="navigation"
    >
      {breadcrumbs.map((item, index) => (
        <div key={item.href} className="flex items-center">
          {index > 0 && (
            <span className="px-2 text-text-muted" aria-hidden="true">/</span>
          )}
          {item.current ? (
            <span className="font-medium text-text-primary" aria-current="page">
              {item.name}
            </span>
          ) : (
            <Link
              href={item.href}
              className={cn(
                'inline-flex min-h-11 items-center gap-1 rounded-inner text-text-secondary transition-colors hover:text-brand sm:min-h-0',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2'
              )}
            >
              {index === 0 && <Home className="h-4 w-4" aria-hidden="true" />}
              <span>{item.name}</span>
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}
