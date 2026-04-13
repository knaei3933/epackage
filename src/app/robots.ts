import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.package-lab.com'

  return {
    rules: [
      {
        userAgent: '*',
        // 명시적으로 허용할 경로 (다국어 지원)
        allow: ['/en/', '/ko/', '/ja/', '/zh/', '/zh-CN/', '/zh-TW/', '/'],
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
          '/compare',
          '/data-templates',
          '/print',
          '/premium-content',
          '/inquiry',
          '/flow',
          '/profile',
          '/members',
        ],
      },
      {
        userAgent: 'Googlebot',
        // Googlebot에 명시적으로 허용
        allow: ['/en/', '/ko/', '/ja/', '/zh/', '/zh-CN/', '/zh-TW/', '/'],
        disallow: [
          '/api/',
          '/admin/',
          '/auth/',
          '/member/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
