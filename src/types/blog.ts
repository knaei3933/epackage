/**
 * Blog System Type Definitions
 *
 * Types for markdown-based blog management system with SEO support.
 * Includes frontmatter metadata, content parsing, and Supabase integration.
 */

/**
 * Blog post status
 */
export type BlogStatus = 'draft' | 'published' | 'archived';

/**
 * Blog post category
 */
export type BlogCategory =
  | 'technical'
  | 'case-study'
  | 'news'
  | 'tutorial'
  | 'announcement'
  | 'industry';

/**
 * Frontmatter metadata from markdown files
 */
export interface BlogFrontmatter {
  /** Post title */
  title: string;

  /** URL-friendly slug */
  slug: string;

  /** Short excerpt for listings */
  excerpt: string;

  /** Post category */
  category: BlogCategory;

  /** Post tags for filtering and SEO */
  tags: string[];

  /** SEO-specific title (may differ from title) */
  meta_title?: string;

  /** SEO description for meta tags */
  meta_description?: string;

  /** Estimated reading time in minutes */
  reading_time_minutes: number;

  /** Post status */
  status: BlogStatus;

  /** Published date (ISO 8601) */
  published_at: string;

  /** Featured image path (relative to blog/images/) */
  featured_image?: string;

  /** Author name */
  author?: string;

  /** Author avatar URL */
  author_avatar?: string;

  /** OpenGraph image URL (overrides featured_image for social sharing) */
  og_image?: string;

  /** Twitter card type */
  twitter_card?: 'summary' | 'summary_large_image' | 'app' | 'player';

  /** Canonical URL (if different from default) */
  canonical_url?: string;

  /** No-index for search engines (for draft/testing posts) */
  noindex?: boolean;

  /** Schema.org type (defaults to Article) */
  schema_type?: 'Article' | 'BlogPosting' | 'NewsArticle' | 'TechArticle';

  /** Prevent Snippet on SERP */
  nosnippet?: boolean;
}

/**
 * Parsed blog post content
 */
export interface BlogContent {
  /** Frontmatter metadata */
  metadata: BlogFrontmatter;

  /** HTML content (processed markdown) */
  html: string;

  /** Raw markdown content */
  markdown: string;

  /** Table of contents (if available) */
  toc?: TableOfContents[];

  /** Word count */
  word_count: number;

  /** File path */
  file_path: string;
}

/**
 * Table of contents entry
 */
export interface TableOfContents {
  /** Heading id for anchor links */
  id: string;

  /** Heading text */
  text: string;

  /** Heading level (1-6) */
  level: number;
}

/**
 * Blog post with Supabase data
 */
export interface BlogPost extends BlogFrontmatter {
  /** Database ID */
  id?: string;

  /** HTML content (processed markdown) */
  content_html: string;

  /** Raw markdown content */
  content_markdown: string;

  /** View count */
  view_count?: number;

  /** Created timestamp */
  created_at?: string;

  /** Updated timestamp */
  updated_at?: string;

  /** Featured image URL (from Supabase Storage) */
  featured_image_url?: string;

  /** Author information */
  author_name?: string;
  author_avatar_url?: string;
}

/**
 * Blog post listing item (for list views)
 */
export interface BlogPostListItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: BlogCategory;
  tags: string[];
  featured_image_url?: string;
  reading_time_minutes: number;
  published_at: string;
  author_name?: string;
  author_avatar_url?: string;
  view_count?: number;
}

/**
 * SEO metadata
 */
export interface SEOMetadata {
  /** Page title */
  title: string;

  /** Meta description */
  description: string;

  /** Canonical URL */
  canonical: string;

  /** Open Graph data */
  openGraph: OpenGraphMetadata;

  /** Twitter Card data */
  twitterCard: TwitterCardMetadata;

  /** Structured data (JSON-LD) */
  structuredData: StructuredData;

  /** No-index flag */
  noindex?: boolean;

  /** No-snippet flag */
  nosnippet?: boolean;
}

/**
 * Open Graph metadata
 */
export interface OpenGraphMetadata {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  imageWidth?: number;
  imageHeight?: number;
  type: 'article' | 'website';
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  section?: string;
  tags?: string[];
}

/**
 * Twitter Card metadata
 */
export interface TwitterCardMetadata {
  card: 'summary' | 'summary_large_image' | 'app' | 'player';
  title: string;
  description: string;
  image: string;
  imageAlt: string;
}

/**
 * Structured data (JSON-LD)
 */
export interface StructuredData {
  '@context': string;
  '@type': string;
  headline: string;
  description: string;
  image: string[];
  author: {
    '@type': string;
    name: string;
    url?: string;
  };
  publisher: {
    '@type': string;
    name: string;
    logo: {
      '@type': string;
      url: string;
    };
  };
  datePublished: string;
  dateModified?: string;
  mainEntityOfPage?: {
    '@type': string;
    '@id': string;
  };
  articleSection?: string;
  keywords?: string;
  wordCount?: number;
}

/**
 * Image optimization options
 */
export interface ImageOptimizeOptions {
  /** Maximum width (default: 1920) */
  maxWidth?: number;

  /** Maximum height (default: 1080) */
  maxHeight?: number;

  /** JPEG quality (default: 85) */
  quality?: number;

  /** Convert to WebP (default: true) */
  convertToWebP?: boolean;

  /** Generate multiple sizes for responsive images (default: true) */
  generateSizes?: boolean;

  /** Responsive image sizes (default: [640, 768, 1024, 1280, 1920]) */
  sizes?: number[];
}

/**
 * Optimized image result
 */
export interface OptimizedImage {
  /** Original file path */
  originalPath: string;

  /** Optimized file path */
  optimizedPath: string;

  /** Supabase Storage URL */
  storageUrl?: string;

  /** Image width */
  width: number;

  /** Image height */
  height: number;

  /** File format */
  format: string;

  /** File size in bytes */
  size: number;

  /** Blurhash for placeholder */
  blurhash?: string;

  /** Responsive image variants */
  variants?: ResponsiveImageVariant[];
}

/**
 * Responsive image variant
 */
export interface ResponsiveImageVariant {
  width: number;
  height: number;
  path: string;
  storageUrl?: string;
  size: number;
}

/**
 * Blog sync statistics
 */
export interface BlogSyncStats {
  /** Number of posts processed */
  processed: number;

  /** Number of posts created */
  created: number;

  /** Number of posts updated */
  updated: number;

  /** Number of posts deleted */
  deleted: number;

  /** Number of images processed */
  imagesProcessed: number;

  /** Processing time in milliseconds */
  duration: number;

  /** Errors encountered */
  errors: Array<{
    file: string;
    message: string;
  }>;
}

/**
 * Blog sync options
 */
export interface BlogSyncOptions {
  /** Delete posts not in source (default: false) */
  deleteMissing?: boolean;

  /** Process images (default: true) */
  processImages?: boolean;

  /** Upload to Supabase (default: true) */
  uploadToSupabase?: boolean;

  /** Verbose output (default: false) */
  verbose?: boolean;

  /** Filter by category */
  category?: BlogCategory;

  /** Filter by status */
  status?: BlogStatus;
}

/**
 * Sitemap entry
 */
export interface SitemapEntry {
  url: string;
  lastModified: string;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

/**
 * RSS feed item
 */
export interface RSSFeedItem {
  title: string;
  description: string;
  content: string;
  link: string;
  guid: string;
  pubDate: string;
  category?: string;
  author?: string;
  enclosure?: {
    url: string;
    length: number;
    type: string;
  };
}
