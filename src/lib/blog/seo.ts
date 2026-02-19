/**
 * Blog SEO Utilities
 *
 * Handles metadata generation, JSON-LD structured data,
 * OpenGraph, Twitter Cards, sitemap, and RSS feed generation.
 */

import type {
  BlogPost,
  BlogFrontmatter,
  SEOMetadata,
  StructuredData,
  OpenGraphMetadata,
  TwitterCardMetadata,
  SitemapEntry,
  RSSFeedItem,
} from '@/types/blog';

/**
 * Site configuration (should be moved to environment variables or config file)
 */
const SITE_CONFIG = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://epackage-lab.com',
  siteName: 'Epackage Lab',
  defaultTitle: 'Epackage Lab - 小ロットパッケージ製造の専門家',
  defaultDescription: 'AI即時見積もりシステムで、小ロットパッケージ製造を革命。包装資材調達の新しいスタイルを提案します。',
  defaultOgImage: '/og-image.png',
  twitterSite: '@epackage_lab',
  locale: 'ja_JP',
};

/**
 * Generate complete SEO metadata for a blog post
 */
export function generateSEOMetadata(post: BlogPost | BlogFrontmatter, fullUrl: string): SEOMetadata {
  const title = post.meta_title || post.title;
  const description = post.meta_description || post.excerpt;
  const imageUrl = post.og_image || post.featured_image || SITE_CONFIG.defaultOgImage;
  const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${SITE_CONFIG.siteUrl}${imageUrl}`;

  return {
    title,
    description,
    canonical: post.canonical_url || fullUrl,
    openGraph: generateOpenGraph(post, fullUrl, fullImageUrl),
    twitterCard: generateTwitterCard(post, fullImageUrl),
    structuredData: generateStructuredData(post, fullUrl, fullImageUrl),
    noindex: post.noindex,
    nosnippet: post.nosnippet,
  };
}

/**
 * Generate OpenGraph metadata
 */
function generateOpenGraph(
  post: BlogPost | BlogFrontmatter,
  url: string,
  imageUrl: string
): OpenGraphMetadata {
  const title = post.meta_title || post.title;
  const description = post.meta_description || post.excerpt;

  return {
    title,
    description,
    image: imageUrl,
    imageAlt: `${title} - ${SITE_CONFIG.siteName}`,
    imageWidth: 1200,
    imageHeight: 630,
    type: 'article',
    publishedTime: post.published_at,
    modifiedTime: 'updated_at' in post ? post.updated_at : undefined,
    authors: post.author ? [post.author] : undefined,
    section: post.category,
    tags: post.tags,
  };
}

/**
 * Generate Twitter Card metadata
 */
function generateTwitterCard(
  post: BlogPost | BlogFrontmatter,
  imageUrl: string
): TwitterCardMetadata {
  const title = post.meta_title || post.title;
  const description = post.meta_description || post.excerpt;

  return {
    card: post.twitter_card || 'summary_large_image',
    title,
    description,
    image: imageUrl,
    imageAlt: `${title} - ${SITE_CONFIG.siteName}`,
  };
}

/**
 * Generate JSON-LD structured data
 */
function generateStructuredData(
  post: BlogPost | BlogFrontmatter,
  url: string,
  imageUrl: string
): StructuredData {
  const title = post.meta_title || post.title;
  const description = post.meta_description || post.excerpt;
  const wordCount = 'word_count' in post ? post.word_count : undefined;

  return {
    '@context': 'https://schema.org',
    '@type': post.schema_type || 'BlogPosting',
    headline: title,
    description,
    image: [imageUrl],
    author: {
      '@type': 'Person',
      name: post.author || SITE_CONFIG.siteName,
      url: post.author ? `${SITE_CONFIG.siteUrl}/author/${encodeURIComponent(post.author)}` : undefined,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.siteName,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_CONFIG.siteUrl}/logo.png`,
      },
    },
    datePublished: post.published_at,
    dateModified: 'updated_at' in post ? post.updated_at : post.published_at,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    articleSection: post.category,
    keywords: post.tags.join(', '),
    ...(wordCount && { wordCount }),
  };
}

/**
 * Generate meta tags for Next.js Metadata API
 */
export function generateMetaTags(metadata: SEOMetadata) {
  return {
    title: metadata.title,
    description: metadata.description,
    alternates: {
      canonical: metadata.canonical,
    },
    openGraph: {
      title: metadata.openGraph.title,
      description: metadata.openGraph.description,
      images: [
        {
          url: metadata.openGraph.image,
          width: metadata.openGraph.imageWidth,
          height: metadata.openGraph.imageHeight,
          alt: metadata.openGraph.imageAlt,
        },
      ],
      type: metadata.openGraph.type,
      publishedTime: metadata.openGraph.publishedTime,
      modifiedTime: metadata.openGraph.modifiedTime,
      authors: metadata.openGraph.authors,
      section: metadata.openGraph.section,
      tags: metadata.openGraph.tags,
      locale: SITE_CONFIG.locale,
      siteName: SITE_CONFIG.siteName,
    },
    twitter: {
      card: metadata.twitterCard.card,
      title: metadata.twitterCard.title,
      description: metadata.twitterCard.description,
      images: [metadata.twitterCard.image],
    },
    robots: {
      index: !metadata.noindex,
      follow: !metadata.noindex,
      googleBot: {
        index: !metadata.noindex,
        follow: !metadata.noindex,
        'max-snippet': metadata.nosnippet ? -1 : undefined,
      },
    },
  };
}

/**
 * Generate sitemap entries for blog posts
 */
export function generateSitemapEntries(posts: BlogPost[]): SitemapEntry[] {
  return posts
    .filter(post => post.status === 'published' && !post.noindex)
    .map(post => {
      const url = `${SITE_CONFIG.siteUrl}/blog/${post.slug}`;
      return {
        url,
        lastModified: post.updated_at || post.published_at,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      };
    });
}

/**
 * Generate sitemap XML
 */
export function generateSitemapXML(entries: SitemapEntry[]): string {
  const xmlEntries = entries.map(entry => `
  <url>
    <loc>${escapeXml(entry.url)}</loc>
    <lastmod>${entry.lastModified}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlEntries}
</urlset>`;
}

/**
 * Generate RSS feed items
 */
export function generateRSSFeedItems(posts: BlogPost[]): RSSFeedItem[] {
  return posts
    .filter(post => post.status === 'published')
    .slice(0, 20) // Latest 20 posts
    .map(post => {
      const url = `${SITE_CONFIG.siteUrl}/blog/${post.slug}`;
      const description = post.excerpt;

      return {
        title: post.title,
        description,
        content: post.content_html,
        link: url,
        guid: url,
        pubDate: post.published_at,
        category: post.category,
        author: post.author,
        enclosure: post.featured_image_url ? {
          url: post.featured_image_url,
          length: 0, // Would need to fetch actual length
          type: 'image/jpeg',
        } : undefined,
      };
    });
}

/**
 * Generate RSS feed XML
 */
export function generateRSSFeedXML(items: RSSFeedItem[]): string {
  const xmlItems = items.map(item => `
  <item>
    <title><![CDATA[${escapeXml(item.title)}]]></title>
    <description><![CDATA[${escapeXml(item.description)}]]></description>
    <content:encoded><![CDATA[${item.content}]]></content:encoded>
    <link>${escapeXml(item.link)}</link>
    <guid>${escapeXml(item.guid)}</guid>
    <pubDate>${new Date(item.pubDate).toUTCString()}</pubDate>
    ${item.category ? `<category>${escapeXml(item.category)}</category>` : ''}
    ${item.author ? `<author>${escapeXml(item.author)}</author>` : ''}
    ${item.enclosure ? `<enclosure url="${escapeXml(item.enclosure.url)}" type="${item.enclosure.type}" />` : ''}
  </item>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title><![CDATA[${SITE_CONFIG.siteName}]]></title>
    <description><![CDATA[${SITE_CONFIG.defaultDescription}]]></description>
    <link>${SITE_CONFIG.siteUrl}/blog</link>
    <language>ja</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${xmlItems}
  </channel>
</rss>`;
}

/**
 * Escape XML special characters
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbStructuredData(
  items: Array<{ name: string; url: string }>
): string {
  const itemListElement = items.map((item, index) => ({
    '@type': 'ListItem' as const,
    position: index + 1,
    name: item.name,
    item: item.url,
  }));

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement,
  });
}

/**
 * Generate FAQ structured data
 */
export function generateFAQStructuredData(
  faqs: Array<{ question: string; answer: string }>
): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  });
}

/**
 * Generate organization structured data
 */
export function generateOrganizationStructuredData(): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_CONFIG.siteName,
    url: SITE_CONFIG.siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_CONFIG.siteUrl}/logo.png`,
      width: 512,
      height: 512,
    },
    description: SITE_CONFIG.defaultDescription,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'JP',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      url: `${SITE_CONFIG.siteUrl}/contact`,
    },
    sameAs: [
      // Add social media URLs here
    ],
  });
}

/**
 * Generate website structured data (for search action)
 */
export function generateWebsiteStructuredData(): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: SITE_CONFIG.siteUrl + '/',
    name: SITE_CONFIG.siteName,
    description: SITE_CONFIG.defaultDescription,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_CONFIG.siteUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  });
}

/**
 * Generate article schema for a list of related posts
 */
export function generateArticleListStructuredData(posts: BlogPost[]): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: posts.map((post, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'BlogPosting',
        headline: post.title,
        url: `${SITE_CONFIG.siteUrl}/blog/${post.slug}`,
        datePublished: post.published_at,
        author: {
          '@type': 'Person',
          name: post.author || SITE_CONFIG.siteName,
        },
      },
    })),
  });
}

/**
 * Validate SEO metadata
 */
export function validateSEOMetadata(metadata: SEOMetadata): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Title length (recommended: 50-60 characters)
  if (metadata.title.length < 30) {
    warnings.push('Title is too short (recommended: 50-60 characters)');
  } else if (metadata.title.length > 60) {
    warnings.push('Title is too long (recommended: 50-60 characters)');
  }

  // Description length (recommended: 150-160 characters)
  if (metadata.description.length < 120) {
    warnings.push('Description is too short (recommended: 150-160 characters)');
  } else if (metadata.description.length > 160) {
    warnings.push('Description is too long (recommended: 150-160 characters)');
  }

  // Canonical URL
  if (!metadata.canonical.startsWith('http')) {
    errors.push('Canonical URL must be absolute');
  }

  // OpenGraph image
  if (!metadata.openGraph.image.startsWith('http')) {
    warnings.push('OpenGraph image should be absolute URL');
  }

  // OpenGraph image dimensions (recommended: 1200x630)
  if (metadata.openGraph.imageWidth && metadata.openGraph.imageWidth < 1200) {
    warnings.push('OpenGraph image width should be at least 1200px (recommended: 1200x630)');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Calculate reading time from word count
 */
export function calculateReadingTime(wordCount: number, wordsPerMinute = 200): number {
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Generate excerpt from content
 */
export function generateExcerpt(content: string, maxLength = 160): string {
  // Remove markdown syntax
  const cleanContent = content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#*_~\[\]]/g, '')
    .trim();

  if (cleanContent.length <= maxLength) {
    return cleanContent;
  }

  // Truncate at word boundary
  const truncated = cleanContent.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  return truncated.substring(0, lastSpace) + '...';
}

/**
 * Generate slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}
