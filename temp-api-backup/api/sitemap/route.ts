import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = 'https://epackage-lab.com';
  const currentDate = new Date().toISOString();

  const staticPages = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFreq: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/catalog`,
      lastModified: currentDate,
      changeFreq: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/simulation`,
      lastModified: currentDate,
      changeFreq: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFreq: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/samples`,
      lastModified: currentDate,
      changeFreq: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/design-system`,
      lastModified: currentDate,
      changeFreq: 'yearly',
      priority: 0.5,
    },
    // Industry Solution Pages
    {
      url: `${baseUrl}/industry/food-manufacturing`,
      lastModified: currentDate,
      changeFreq: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/industry/cosmetics`,
      lastModified: currentDate,
      changeFreq: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/industry/pharmaceutical`,
      lastModified: currentDate,
      changeFreq: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/industry/electronics`,
      lastModified: currentDate,
      changeFreq: 'weekly',
      priority: 0.85,
    },
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  ${staticPages
    .map(
      (page) => `
  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastModified}</lastmod>
    <changefreq>${page.changeFreq}</changefreq>
    <priority>${page.priority}</priority>
    <xhtml:link rel="alternate" hreflang="ja" href="${page.url}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${page.url.replace(baseUrl, `${baseUrl}/en`)}"/>
  </url>`
    )
    .join('')}
</urlset>`;

  return new NextResponse(sitemap, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}