/**
 * Blog Post Detail Page
 * Renders individual blog post with full SEO, structured data, and related posts
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublishedPostBySlug, getRelatedPosts, incrementViewCount } from '@/lib/blog/queries';
import { parseMarkdown } from '@/lib/blog/markdown';
import { seoUtils } from '@/lib/blog/seo';
import { BlogCard } from '@/components/blog/BlogCard';
import { TableOfContents } from '@/components/blog/TableOfContents';
import { ShareButtons } from '@/components/blog/ShareButtons';
import { RelatedPosts } from '@/components/blog/RelatedPosts';
import { getCategoryLabel } from '@/lib/types/blog';
import { Calendar, Clock, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// =====================================================
// Generate Metadata
// =====================================================

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata(
  { params }: BlogPostPageProps
): Promise<Metadata> {
  const post = await getPublishedPostBySlug(params.slug);

  if (!post) {
    return {
      title: '記事が見つかりません | Epackage Lab',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://package-lab.com';
  const url = `${baseUrl}/blog/${post.slug}`;
  const imageUrl = post.og_image_path
    ? (post.og_image_path.startsWith('http') ? post.og_image_path : `${baseUrl}${post.og_image_path}`)
    : `${baseUrl}/images/og-image.jpg`;

  return {
    title: `${post.meta_title || post.title} | Epackage Lab ブログ`,
    description: post.meta_description || post.excerpt || '',
    keywords: [...post.tags, post.category].join(', '),
    authors: post.author ? [{ name: post.author.name }] : undefined,
    openGraph: {
      type: 'article',
      locale: 'ja_JP',
      url,
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt || '',
      siteName: 'Epackage Lab',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      publishedTime: post.published_at || undefined,
      modifiedTime: post.updated_at,
      authors: post.author ? [post.author.name] : undefined,
      section: getCategoryLabel(post.category, 'ja'),
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt || '',
      images: [imageUrl],
      creator: '@epackage_lab',
    },
    alternates: {
      canonical: post.canonical_url || url,
    },
  };
}

// =====================================================
// Page Component
// =====================================================

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getPublishedPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  // Increment view count (non-blocking)
  incrementViewCount(post.id).catch(console.error);

  // Parse markdown content
  const { html, headings, wordCount, readingTime } = await parseMarkdown(post.content);

  // Get related posts
  const relatedPosts = await getRelatedPosts(post.id, post.category, 3);

  // Generate structured data
  const blogPostingSchema = seoUtils.generateBlogPostingSchema({
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt || null,
    content: post.content,
    category: post.category,
    tags: post.tags,
    publishedAt: post.published_at || null,
    updatedAt: post.updated_at,
    author: post.author ? { name: post.author.name, email: post.author.email } : null,
    ogImagePath: post.og_image_path || null,
    metaTitle: post.meta_title || null,
    metaDescription: post.meta_description || null,
    canonicalUrl: post.canonical_url || null,
    readingTime,
    wordCount,
  });

  const breadcrumbSchema = seoUtils.generateBreadcrumbSchema({
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt || null,
    content: post.content,
    category: post.category,
    tags: post.tags,
    publishedAt: post.published_at || null,
    updatedAt: post.updated_at,
    author: post.author ? { name: post.author.name } : null,
    ogImagePath: post.og_image_path || null,
    metaTitle: post.meta_title || null,
    metaDescription: post.meta_description || null,
    canonicalUrl: post.canonical_url || null,
    readingTime,
    wordCount,
  });

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://package-lab.com';

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <nav className="bg-white border-b" aria-label="パンくずリスト">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <ol className="flex items-center gap-2 text-sm">
              <li>
                <Link href="/" className="text-gray-500 hover:text-gray-700">
                  ホーム
                </Link>
              </li>
              <li className="text-gray-400">/</li>
              <li>
                <Link href="/blog" className="text-gray-500 hover:text-gray-700">
                  ブログ
                </Link>
              </li>
              <li className="text-gray-400">/</li>
              <li className="text-gray-900">{post.title}</li>
            </ol>
          </div>
        </nav>

        {/* Back Button */}
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              ブログ一覧に戻る
            </Link>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <article className="flex-1">
              {/* Article Header */}
              <header className="mb-8">
                {/* Category Badge */}
                <div className="mb-4">
                  <Link
                    href={`/blog/category/${post.category}`}
                    className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                  >
                    {getCategoryLabel(post.category, 'ja')}
                  </Link>
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {post.title}
                </h1>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  {post.published_at && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <time dateTime={post.published_at}>
                        {new Date(post.published_at).toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </time>
                    </div>
                  )}

                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{readingTime}分で読めます</span>
                  </div>

                  {post.author && (
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{post.author.name}</span>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/blog/tag/${encodeURIComponent(tag)}`}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                )}
              </header>

              {/* Featured Image */}
              {post.og_image_path && (
                <div className="mb-8 rounded-lg overflow-hidden shadow-md">
                  <img
                    src={post.og_image_path}
                    alt={post.title}
                    className="w-full h-auto"
                  />
                </div>
              )}

              {/* Article Content */}
              <div
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: html }}
              />

              {/* Share Buttons */}
              <div className="mt-12">
                <ShareButtons
                  url={`${baseUrl}/blog/${post.slug}`}
                  title={post.title}
                  description={post.excerpt || undefined}
                />
              </div>

              {/* Author Bio */}
              {post.author && (
                <div className="mt-12 p-6 bg-gray-100 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">著者について</h3>
                  <p className="text-gray-700">{post.author.name}</p>
                </div>
              )}
            </article>

            {/* Sidebar */}
            <aside className="lg:w-80">
              {/* Table of Contents */}
              {headings.length > 0 && (
                <div className="mb-6">
                  <TableOfContents headings={headings} />
                </div>
              )}

              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <div>
                  <RelatedPosts
                    posts={relatedPosts}
                    currentPostId={post.id}
                    category={post.category}
                  />
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}

// =====================================================
// Generate Static Params (for static generation)
// =====================================================

export async function generateStaticParams() {
  // This would typically fetch all published post slugs
  // For now, return empty array to use SSR
  return [];
}
