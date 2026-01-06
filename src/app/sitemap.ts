import { MetadataRoute } from 'next'
import { getAllProducts } from '@/lib/product-data'

// Define all static routes with SEO properties
interface StaticRoute {
  url: string
  changefreq: 'daily' | 'weekly' | 'monthly' | 'yearly'
  priority: number
}

const staticRoutes: StaticRoute[] = [
  // Core pages - highest priority
  { url: '', changefreq: 'daily', priority: 1.0 },
  { url: 'catalog', changefreq: 'weekly', priority: 0.9 },
  { url: 'quote-simulator', changefreq: 'monthly', priority: 0.8 },

  // Industry pages
  { url: 'industry/cosmetics', changefreq: 'monthly', priority: 0.7 },
  { url: 'industry/electronics', changefreq: 'monthly', priority: 0.7 },
  { url: 'industry/food-manufacturing', changefreq: 'monthly', priority: 0.7 },
  { url: 'industry/pharmaceutical', changefreq: 'monthly', priority: 0.7 },

  // Functional pages
  { url: 'samples', changefreq: 'monthly', priority: 0.7 },
  { url: 'contact', changefreq: 'monthly', priority: 0.6 },
  { url: 'pricing', changefreq: 'monthly', priority: 0.6 },
  { url: 'service', changefreq: 'monthly', priority: 0.6 },

  // Guide pages
  { url: 'guide', changefreq: 'monthly', priority: 0.6 },
  { url: 'guide/color', changefreq: 'monthly', priority: 0.5 },
  { url: 'guide/size', changefreq: 'monthly', priority: 0.5 },
  { url: 'guide/image', changefreq: 'monthly', priority: 0.5 },
  { url: 'guide/shirohan', changefreq: 'monthly', priority: 0.5 },
  { url: 'guide/environmentaldisplay', changefreq: 'monthly', priority: 0.5 },

  // Additional pages
  { url: 'news', changefreq: 'weekly', priority: 0.5 },
  { url: 'csr', changefreq: 'yearly', priority: 0.4 },
  { url: 'about', changefreq: 'yearly', priority: 0.5 },

  // Legal pages - lowest priority
  { url: 'privacy', changefreq: 'yearly', priority: 0.3 },
  { url: 'terms', changefreq: 'yearly', priority: 0.3 },
  { url: 'legal', changefreq: 'yearly', priority: 0.3 },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://epackage-lab.com'
  const currentDate = new Date()

  // Get all products for dynamic URLs
  const products = getAllProducts(null, 'ja')

  // Generate static URLs with hreflang support
  const staticUrls = staticRoutes.map((route) => {
    const urlPath = route.url === '' ? '' : `/${route.url}`
    return {
      url: `${baseUrl}${urlPath}`,
      lastModified: currentDate,
      changeFrequency: route.changefreq,
      priority: route.priority,
      alternates: {
        languages: {
          ja: `${baseUrl}${urlPath}`,
          en: `${baseUrl}/en${urlPath}`,
        },
      },
    }
  })

  // Generate product URLs with hreflang support
  const productUrls = products.map((product) => {
    const urlPath = `/catalog/${product.id}`
    return {
      url: `${baseUrl}${urlPath}`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      alternates: {
        languages: {
          ja: `${baseUrl}${urlPath}`,
          en: `${baseUrl}/en${urlPath}`,
        },
      },
    }
  })

  return [...staticUrls, ...productUrls]
}
