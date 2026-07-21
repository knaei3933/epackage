import { MetadataRoute } from 'next'
import { getAllProducts } from '@/lib/product-data'
import { createServiceClient } from '@/lib/supabase'
import { SITE_URL } from '@/lib/seo/canonical'

// Revalidate sitemap every hour to reduce CPU usage while keeping data fresh
// This prevents RSC 404 errors and reduces database queries
export const revalidate = 3600; // 1 hour

// IMPORTANT: 静的ページの lastmod は固定値。コンテンツ更新時は手動で更新すること。
// 自動化（git commit date 連携等）は Phase 2 で検討。
const STATIC_PAGES_LASTMOD = new Date('2026-07-13');

// 製品データを取得
const allProducts = getAllProducts(null, 'ja')

// 静的ページの定義
const staticPages = [
  {
    url: '',
    changefreq: 'daily' as const,
    priority: 1.0,
    lastmod: STATIC_PAGES_LASTMOD
  },
  {
    url: '/blog',
    changefreq: 'daily' as const,
    priority: 0.9,
    lastmod: STATIC_PAGES_LASTMOD
  },
  {
    url: '/catalog',
    changefreq: 'weekly' as const,
    priority: 0.9,
    lastmod: STATIC_PAGES_LASTMOD
  },
  {
    url: '/service',
    changefreq: 'monthly' as const,
    priority: 0.6,
    lastmod: STATIC_PAGES_LASTMOD
  },
  {
    url: '/archives',
    changefreq: 'weekly' as const,
    priority: 0.8,
    lastmod: STATIC_PAGES_LASTMOD
  },
  {
    url: '/contact',
    changefreq: 'monthly' as const,
    priority: 0.6,
    lastmod: STATIC_PAGES_LASTMOD
  },
  {
    url: '/samples',
    changefreq: 'monthly' as const,
    priority: 0.7,
    lastmod: STATIC_PAGES_LASTMOD
  },
  {
    url: '/about',
    changefreq: 'yearly' as const,
    priority: 0.5,
    lastmod: STATIC_PAGES_LASTMOD
  },
  {
    url: '/news',
    changefreq: 'weekly' as const,
    priority: 0.5,
    lastmod: STATIC_PAGES_LASTMOD
  },
  {
    url: '/guide',
    changefreq: 'monthly' as const,
    priority: 0.6,
    lastmod: STATIC_PAGES_LASTMOD
  },
  {
    url: '/terms',
    changefreq: 'yearly' as const,
    priority: 0.3,
    lastmod: STATIC_PAGES_LASTMOD
  },
  {
    url: '/privacy',
    changefreq: 'yearly' as const,
    priority: 0.3,
    lastmod: STATIC_PAGES_LASTMOD
  },
  // 業界ページ
  {
    url: '/industry/cosmetics',
    changefreq: 'monthly' as const,
    priority: 0.7,
    lastmod: STATIC_PAGES_LASTMOD
  },
  {
    url: '/industry/food-manufacturing',
    changefreq: 'monthly' as const,
    priority: 0.7,
    lastmod: STATIC_PAGES_LASTMOD
  },
  {
    url: '/industry/pharmaceutical',
    changefreq: 'monthly' as const,
    priority: 0.7,
    lastmod: STATIC_PAGES_LASTMOD
  },
  {
    url: '/industry/electronics',
    changefreq: 'monthly' as const,
    priority: 0.7,
    lastmod: STATIC_PAGES_LASTMOD
  },
  // コンテンツページ（旧 Disallow 解除・sitemap でクロール可能性を確保）
  {
    url: '/flow',
    changefreq: 'monthly' as const,
    priority: 0.7,
    lastmod: STATIC_PAGES_LASTMOD
  },
  {
    url: '/print',
    changefreq: 'monthly' as const,
    priority: 0.7,
    lastmod: STATIC_PAGES_LASTMOD
  },
  {
    url: '/compare',
    changefreq: 'monthly' as const,
    priority: 0.6,
    lastmod: STATIC_PAGES_LASTMOD
  },
  {
    url: '/premium-content',
    changefreq: 'monthly' as const,
    priority: 0.6,
    lastmod: STATIC_PAGES_LASTMOD
  },
  // /inquiry は実在しない（実在するのは /inquiry/detailed のみ）。
  // sitemap 収録すると 404 → Soft 404 の温床になるため除外。
  {
    url: '/data-templates',
    changefreq: 'monthly' as const,
    priority: 0.6,
    lastmod: STATIC_PAGES_LASTMOD
  }
]

// ガイドページ
const guidePages = [
  'shirohan',
  'size',
  'color',
  'environmentaldisplay',
  'image'
]

// ブログカテゴリ
const blogCategories = [
  { id: 'news', name: 'news' },
  { id: 'technical', name: 'technical' },
  { id: 'industry', name: 'industry' },
  { id: 'company', name: 'company' }
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const urls: MetadataRoute.Sitemap = []

  // 静的ページを追加
  for (const page of staticPages) {
    urls.push({
      url: `${SITE_URL}${page.url}`,
      lastModified: page.lastmod,
      changeFrequency: page.changefreq,
      priority: page.priority,
      alternates: {
        languages: {
          'x-default': `${SITE_URL}${page.url}`,
          ja: `${SITE_URL}${page.url}`
        }
      }
    })
  }

  // 製品ページを追加
  for (const product of allProducts) {
    const productUrl = `/catalog/${product.id}`
    urls.push({
      url: `${SITE_URL}${productUrl}`,
      lastModified: STATIC_PAGES_LASTMOD,
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: {
        languages: {
          'x-default': `${SITE_URL}${productUrl}`,
          ja: `${SITE_URL}${productUrl}`
        }
      }
    })
  }

  // ガイドページを追加
  for (const guide of guidePages) {
    const guideUrl = `/guide/${guide}`
    urls.push({
      url: `${SITE_URL}${guideUrl}`,
      lastModified: STATIC_PAGES_LASTMOD,
      changeFrequency: 'monthly',
      priority: 0.6,
      alternates: {
        languages: {
          'x-default': `${SITE_URL}${guideUrl}`,
          ja: `${SITE_URL}${guideUrl}`
        }
      }
    })
  }

  // ブログ記事を追加
  try {
    const supabase = createServiceClient()
    const { data: blogPosts } = await supabase
      .from('blog_posts')
      .select('slug, updated_at, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(1000)

    if (blogPosts) {
      for (const post of blogPosts) {
        const postUrl = `/blog/${post.slug}`
        urls.push({
          url: `${SITE_URL}${postUrl}`,
          lastModified: new Date(post.updated_at || post.published_at),
          changeFrequency: 'weekly',
          priority: 0.7,
          alternates: {
            languages: {
              'x-default': `${SITE_URL}${postUrl}`,
              ja: `${SITE_URL}${postUrl}`
            }
          }
        })
      }
    }

    // ブログカテゴリページを追加
    for (const category of blogCategories) {
      const categoryUrl = `/blog/category/${category.id}`
      urls.push({
        url: `${SITE_URL}${categoryUrl}`,
        lastModified: STATIC_PAGES_LASTMOD,
        changeFrequency: 'weekly',
        priority: 0.6,
        alternates: {
          languages: {
            'x-default': `${SITE_URL}${categoryUrl}`,
            ja: `${SITE_URL}${categoryUrl}`
          }
        }
      })
    }
  } catch (error) {
    console.error('[Sitemap] Failed to fetch blog posts:', error)
    // Continue without blog posts if fetch fails
  }

  return urls
}
