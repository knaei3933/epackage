import { createServiceClient } from '@/lib/supabase'

export const revalidate = 3600 // 1 hour

const SITE_URL = 'https://www.package-lab.com'
const SITE_TITLE = 'Epackage Lab - パッケージ専門メディア'
const SITE_DESCRIPTION = 'パッケージに関する最新情報、技術解説、業界トレンドをお届けする専門メディア'

export async function GET() {
  const supabase = createServiceClient()

  let items = ''
  try {
    const { data: posts } = await supabase
      .from('blog_posts')
      .select('slug, title, excerpt, published_at, updated_at, category, tags')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(20)

    if (posts) {
      items = posts
        .map((post: { published_at: string; slug: string; title: string; excerpt: string | null; tags?: string[] | null }) => {
          const pubDate = new Date(post.published_at).toUTCString()
          const link = `${SITE_URL}/blog/${post.slug}`
          const enclosure = post.tags?.length
            ? `\n        <category>${escapeXml(post.tags[0])}</category>`
            : ''

          return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${escapeXml(post.excerpt || '')}</description>
      <pubDate>${pubDate}</pubDate>${enclosure}
    </item>`
        })
        .join('\n')
    }
  } catch (error) {
    console.error('[RSS] Failed to fetch posts:', error)
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <link>${SITE_URL}</link>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    <language>ja</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <ttl>60</ttl>
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
    },
  })
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
