/**
 * Breadcrumb generation logic (SSOT for UI and JSON-LD).
 *
 * 旧 BreadcrumbList.tsx の generateBreadcrumbs ロジックを lib 化。
 * BreadcrumbNav (UI・クライアント) と BreadcrumbJsonLd (JSON-LD・サーバー) で共有。
 */

export interface BreadcrumbItem {
  name: string
  href: string
  current?: boolean
}

/**
 * pathname から breadcrumb items を生成する。
 * ホーム (/) の場合はホーム1件のみを返す（呼出元で length === 1 をチェックして非表示化）。
 */
export function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
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
