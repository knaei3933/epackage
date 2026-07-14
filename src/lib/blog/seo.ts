/**
 * Blog SEO Utilities
 *
 * JSON-LD 構造化データ生成（BlogPosting / BreadcrumbList）。
 * 未使用関数は整理済み（AC-7 デッドコード削除）。
 * 呼出元: src/app/blog/[slug]/page.tsx (seoUtils.generateBlogPostingSchema / seoUtils.generateBreadcrumbSchema)
 */

const SITE_CONFIG = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.package-lab.com',
  siteName: 'Epackage Lab',
  defaultOgImage: '/og-image.png',
};

/**
 * Generate breadcrumb structured data (JSON-LD)
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
 * Generate BlogPosting schema
 */
export function generateBlogPostingSchema(params: {
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  category: string;
  tags: string[];
  publishedAt: string | null;
  updatedAt?: string | null;
  author?: { name: string; email?: string } | null;
  ogImagePath?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
  readingTime?: number;
  wordCount?: number;
}) {
  const { title, slug, excerpt, content, category, tags, publishedAt, updatedAt, author, ogImagePath, metaTitle, metaDescription, canonicalUrl, readingTime, wordCount } = params;

  const baseUrl = SITE_CONFIG.siteUrl;
  const url = `${baseUrl}/blog/${slug}`;
  const imageUrl = ogImagePath && ogImagePath.startsWith('http')
    ? ogImagePath
    : (ogImagePath ? `${baseUrl}${ogImagePath}` : `${baseUrl}/og-image.png`);

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: metaTitle || title,
    description: metaDescription || excerpt || '',
    image: imageUrl,
    author: author ? {
      '@type': 'Person',
      name: author.name,
      email: author.email,
    } : {
      '@type': 'Organization',
      name: SITE_CONFIG.siteName,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.siteName,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
    datePublished: publishedAt,
    dateModified: updatedAt || publishedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl || url,
    },
    articleSection: category,
    keywords: tags.join(', '),
    ...(wordCount && { wordCount }),
    ...(readingTime && { timeRequired: `PT${readingTime}M` }),
  };
}

/**
 * SEO utilities object for easy importing
 */
export const seoUtils = {
  generateBlogPostingSchema,
  generateBreadcrumbSchema: generateBreadcrumbStructuredData,
};
