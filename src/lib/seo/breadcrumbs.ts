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

    // /blog/tag, /blog/category は実在しない中間ページ（404）。タグ名/カテゴリ名自体が
    // 分類を示すため冗長でもある → パンくずから除外（中間リンクの 404 回避 + item URL 重複回避）。
    // h1 が「タグ: X / カテゴリ名」で分類は明白。
    if (currentHref === '/blog/tag' || currentHref === '/blog/category') {
      return
    }

    // URL エンコードされたセグメント（日本語タグ等）をデコードして表示名に使う。
    // href はエンコード済みのまま保持（URL として正しい）。
    let decodedSegment = segment
    try {
      decodedSegment = decodeURIComponent(segment)
    } catch {
      decodedSegment = segment
    }

    // Convert segment to readable name
    let name = decodedSegment
      .replace(/-/g, ' ')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())

    // 日本語サイト（デフォルト + /ja）は日本語名にマップ。/en のみ英語名のまま。
    if (!pathname.startsWith('/en')) {
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
        // ブログカテゴリ（category id → 日本語名）
        'printing-tech': '印刷技術',
        'product-intro': '製品紹介',
        'practical-tips': '実践的ノウハウ',
      }
      name = segmentMap[decodedSegment] || name
    }

    items.push({
      name,
      href: currentHref,
      current: isLast
    })
  })

  return items
}
