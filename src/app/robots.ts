import { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo/canonical'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = SITE_URL

  return {
    rules: [
      {
        userAgent: '*',
        // 명시적으로 허용할 경로 (다국어 지원)
        allow: ['/'],
        disallow: [
          // Admin and authenticated areas
          '/api/',
          '/admin/',
          '/auth/',
          '/member/',
          '/portal/',
          '/b2b/',

          // E-commerce transient pages
          '/cart',
          '/checkout',
          '/order-confirmation',

          // Interactive tools (not indexable content)
          '/quote-simulator',

          // Internal pages
          '/profile',
          '/members',
        ],
      },
      {
        userAgent: 'Googlebot',
        // Googlebot에 명시적으로 허용
        allow: ['/'],
        disallow: [
          '/api/',
          '/admin/',
          '/auth/',
          '/member/',
        ],
      },
      // 特定ボットの個別制御（旧 public/robots.txt から統合）
      {
        userAgent: 'Bingbot',
        allow: ['/'],
      },
      {
        userAgent: 'Slurp',
        allow: ['/'],
      },
      {
        userAgent: 'AhrefsBot',
        disallow: ['/'],
      },
      {
        userAgent: 'SemrushBot',
        disallow: ['/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
