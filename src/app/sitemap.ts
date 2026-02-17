import { MetadataRoute } from 'next'
import { getAllProducts } from '@/lib/product-data'

// サイト設定
const SITE_URL = 'https://package-lab.com'

// 製品データを取得
const allProducts = getAllProducts(null, 'ja')

// 静的ページの定義
const staticPages = [
  {
    url: '',
    changefreq: 'daily' as const,
    priority: 1.0,
    lastmod: new Date()
  },
  {
    url: '/catalog',
    changefreq: 'weekly' as const,
    priority: 0.9,
    lastmod: new Date()
  },
  {
    url: '/service',
    changefreq: 'monthly' as const,
    priority: 0.6,
    lastmod: new Date()
  },
  {
    url: '/archives',
    changefreq: 'weekly' as const,
    priority: 0.8,
    lastmod: new Date()
  },
  {
    url: '/contact',
    changefreq: 'monthly' as const,
    priority: 0.6,
    lastmod: new Date()
  },
  {
    url: '/samples',
    changefreq: 'monthly' as const,
    priority: 0.7,
    lastmod: new Date()
  },
  {
    url: '/about',
    changefreq: 'yearly' as const,
    priority: 0.5,
    lastmod: new Date()
  },
  {
    url: '/quote-simulator',
    changefreq: 'monthly' as const,
    priority: 0.8,
    lastmod: new Date()
  },
  {
    url: '/news',
    changefreq: 'weekly' as const,
    priority: 0.5,
    lastmod: new Date()
  },
  {
    url: '/guide',
    changefreq: 'monthly' as const,
    priority: 0.6,
    lastmod: new Date()
  },
  // 業界ページ
  {
    url: '/industry/cosmetics',
    changefreq: 'monthly' as const,
    priority: 0.7,
    lastmod: new Date()
  },
  {
    url: '/industry/food-manufacturing',
    changefreq: 'monthly' as const,
    priority: 0.7,
    lastmod: new Date()
  },
  {
    url: '/industry/pharmaceutical',
    changefreq: 'monthly' as const,
    priority: 0.7,
    lastmod: new Date()
  },
  {
    url: '/industry/electronics',
    changefreq: 'monthly' as const,
    priority: 0.7,
    lastmod: new Date()
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
          ja: `${SITE_URL}${page.url}`,
          en: `${SITE_URL}/en${page.url || ''}`,
          ko: `${SITE_URL}/ko${page.url || ''}`
        }
      }
    })
  }

  // 製品ページを追加
  for (const product of allProducts) {
    const productUrl = `/catalog/${product.id}`
    urls.push({
      url: `${SITE_URL}${productUrl}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: {
        languages: {
          ja: `${SITE_URL}${productUrl}`,
          en: `${SITE_URL}/en${productUrl}`,
          ko: `${SITE_URL}/ko${productUrl}`
        }
      }
    })
  }

  // ガイドページを追加
  for (const guide of guidePages) {
    const guideUrl = `/guide/${guide}`
    urls.push({
      url: `${SITE_URL}${guideUrl}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
      alternates: {
        languages: {
          ja: `${SITE_URL}${guideUrl}`,
          en: `${SITE_URL}/en${guideUrl}`,
          ko: `${SITE_URL}/ko${guideUrl}`
        }
      }
    })
  }

  return urls
}
