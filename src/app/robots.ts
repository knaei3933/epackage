import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://epackage-lab.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
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
          '/simulation',

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
        allow: '/',
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
