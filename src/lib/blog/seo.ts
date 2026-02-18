/**
 * SEO Utilities for Blog Posts
 * Generates meta tags, Open Graph data, and structured data
 */

import { Metadata } from 'next';

// =====================================================
// Type Definitions
// =====================================================

export interface BlogPostSEOData {
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  category: string;
  tags: string[];
  publishedAt: string | null;
  updatedAt: string;
  author: {
    name: string;
    email?: string;
  } | null;
  ogImagePath: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  readingTime: number;
  wordCount: number;
}

export interface StructuredData {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

// =====================================================
// Constants
// =====================================================

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://package-lab.com';
const SITE_NAME = 'Epackage Lab';
const DEFAULT_OG_IMAGE = '/images/og-image.jpg';
const LOCALE = 'ja_JP';

// =====================================================
// Metadata Generation
// =====================================================

export function generateBlogMetadata(post: BlogPostSEOData): Metadata {
  const title = post.metaTitle || post.title;
  const description = post.metaDescription || post.excerpt || generateDescription(post.content);
  const url = `${SITE_URL}/blog/${post.slug}`;
  const imageUrl = post.ogImagePath
    ? (post.ogImagePath.startsWith('http') ? post.ogImagePath : `${SITE_URL}${post.ogImagePath}`)
    : `${SITE_URL}${DEFAULT_OG_IMAGE}`;

  return {
    title: `${title} | ${SITE_NAME} ブログ`,
    description,
    keywords: [...post.tags, post.category, 'ブログ'].join(', '),
    authors: post.author ? [{ name: post.author.name }] : undefined,
    alternates: {
      canonical: post.canonicalUrl || url,
    },
    openGraph: {
      type: 'article',
      locale: LOCALE,
      url,
      title,
      description,
      siteName: SITE_NAME,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      publishedTime: post.publishedAt || undefined,
      modifiedTime: post.updatedAt,
      authors: post.author ? [post.author.name] : undefined,
      section: getCategoryName(post.category),
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
      creator: '@epackage_lab',
    },
  };
}

// =====================================================
// Structured Data Generation
// =====================================================

/**
 * Generate BlogPosting schema
 */
export function generateBlogPostingSchema(post: BlogPostSEOData): StructuredData {
  const url = `${SITE_URL}/blog/${post.slug}`;
  const imageUrl = post.ogImagePath
    ? (post.ogImagePath.startsWith('http') ? post.ogImagePath : `${SITE_URL}${post.ogImagePath}`)
    : `${SITE_URL}${DEFAULT_OG_IMAGE}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.metaDescription || post.excerpt || generateDescription(post.content),
    image: {
      '@type': 'ImageObject',
      url: imageUrl,
      width: 1200,
      height: 630,
    },
    datePublished: post.publishedAt || post.created_at,
    dateModified: post.updatedAt,
    author: post.author ? {
      '@type': 'Person',
      name: post.author.name,
    } : {
      '@type': 'Organization',
      name: SITE_NAME,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    wordCount: post.wordCount,
    timeRequired: `PT${post.readingTime}M`,
    articleSection: getCategoryName(post.category),
    keywords: post.tags.join(', '),
    inLanguage: 'ja-JP',
  };
}

/**
 * Generate BreadcrumbList schema
 */
export function generateBreadcrumbSchema(post: BlogPostSEOData): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'ホーム',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'ブログ',
        item: `${SITE_URL}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: getCategoryName(post.category),
        item: `${SITE_URL}/blog/category/${post.category}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: post.title,
      },
    ],
  };
}

/**
 * Generate Organization schema
 */
export function generateOrganizationSchema(): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/logo.png`,
    },
    description: '500枚から28日納品の小ロットパッケージ製造。年間300万円の在庫廃棄コストを70%削減。',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'JP',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      language: 'Japanese',
    },
    sameAs: [
      'https://twitter.com/epackage_lab',
    ],
  };
}

/**
 * Generate WebSite schema
 */
export function generateWebSiteSchema(): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: 'パッケージングの専門会社。革新的な包装ソリューション、自動見積もり、豊富な製品カタログを提供。',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/blog?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

// =====================================================
// Helper Functions
// =====================================================

/**
 * Generate description from content
 */
function generateDescription(content: string, maxLength = 160): string {
  // Remove markdown syntax
  let text = content
    .replace(/^#+\s+/gm, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    .replace(/`{1,3}/g, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/\n\s*\n/g, '\n')
    .trim();

  // Get first paragraph
  const firstParagraph = text.split('\n\n')[0];

  // Truncate if too long
  if (firstParagraph.length > maxLength) {
    return firstParagraph.substring(0, maxLength - 3) + '...';
  }

  return firstParagraph;
}

/**
 * Get Japanese category name
 */
function getCategoryName(category: string): string {
  const categoryNames: Record<string, string> = {
    news: 'ニュース',
    technical: '技術情報',
    industry: '業界情報',
    company: '会社情報',
  };
  return categoryNames[category] || category;
}

/**
 * Combine all schemas for a page
 */
export function generateAllSchemas(post: BlogPostSEOData): string {
  const schemas = [
    generateBlogPostingSchema(post),
    generateBreadcrumbSchema(post),
    generateOrganizationSchema(),
    generateWebSiteSchema(),
  ];

  return schemas.map(schema => JSON.stringify(schema)).join('\n');
}

// =====================================================
// Export utilities
// =====================================================

export const seoUtils = {
  generateMetadata: generateBlogMetadata,
  generateBlogPostingSchema,
  generateBreadcrumbSchema,
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateAllSchemas,
};
