import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = 'https://epackage-lab.com';

  const robotsTxt = `User-agent: *
Allow: /

# Crawl-delay for better server performance
Crawl-delay: 1

# Allow all important crawlers
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Slurp
Allow: /

User-agent: DuckDuckBot
Allow: /

# Block unwanted crawlers
User-agent: AhrefsBot
Disallow: /

User-agent: MJ12bot
Disallow: /

User-agent: SemrushBot
Disallow: /

# Disallow admin and private areas
Disallow: /api/
Disallow: /_next/
Disallow: /admin/
Disallow: /private/

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml

# Additional host directive for Yandex
Host: ${baseUrl}`;

  return new NextResponse(robotsTxt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}