/**
 * Blog Post Detail Page
 * Renders individual blog post with full SEO, structured data, and related posts
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublishedPostBySlug, getRelatedPosts, incrementViewCount } from '@/lib/blog/queries';
import { parseMarkdown } from '@/lib/blog/markdown';
import { insertCTAPlaceholders, splitContentByCTA, CTA_PLACEHOLDERS } from '@/lib/blog/cta';
import { BlogCard } from '@/components/blog/BlogCard';
import { TableOfContents } from '@/components/blog/TableOfContents';
import { ShareButtons } from '@/components/blog/ShareButtons';
import { RelatedPosts } from '@/components/blog/RelatedPosts';
import { ArticleCTA } from '@/components/blog/ArticleCTA';
import { ScrollToAnchor } from '@/components/blog/ScrollToAnchor';
import { ScrollDepthTracker } from '@/components/blog/ScrollDepthTracker';
import { getCategoryLabel } from '@/lib/types/blog';
import { seoUtils } from '@/lib/blog/seo';
import { Calendar, Clock, User, ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd';
import { SITE_URL } from '@/lib/seo/canonical';
import { PageHeader } from '@/components/layout';
import { headingFont } from '@/components/home/fonts';

// =====================================================
// Generate Metadata
// =====================================================

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata(
  { params }: BlogPostPageProps
): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    // Soft 404 シグナル回避: 存在しない slug は noindex・nofollow
    return {
      // title 本体のみ（blog/layout.tsx の template が適用される）
      title: '記事が見つかりません',
      robots: { index: false, follow: false },
    };
  }

  const baseUrl = SITE_URL;
  const url = `${baseUrl}/blog/${post.slug}`;
  // canonical_url が package-lab 自社ドメイン(.net/.com)の場合は旧ドメイン残渣のため無視。
  // 外部ドメイン（真の外部転載元）の場合のみ尊重する。
  // ※DB確認(2026-07-21): canonical_url あり16件は全件 package-lab.net（www無し・旧ドメイン）。
  //    外部ドメイン0件。そのまま使うと canonical が別ドメイン(.net)を指し、
  //    GSC「適切な canonical 無し」の直接原因になる。
  const isExternalCanonical = Boolean(
    post.canonical_url && !post.canonical_url.includes('package-lab.')
  );
  // og_image_path がある記事は専用OG画像、ない記事は動的OGP（opengraph-image.tsx）に委譲
  const imageUrl = post.og_image_path
    ? (post.og_image_path.startsWith('http') ? post.og_image_path : `${baseUrl}${post.og_image_path}`)
    : undefined;

  return {
    // title 本体のみ（blog/layout.tsx の template "%s | Epackage Lab ブログ" が適用される）
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt || '',
    authors: post.author ? [{ name: (post.author as any).name }] : undefined,
    openGraph: {
      type: 'article',
      locale: 'ja_JP',
      url,
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt || '',
      siteName: 'Epackage Lab',
      images: imageUrl
        ? [{ url: imageUrl, width: 1200, height: 630, alt: post.title }]
        : undefined, // 動的 OGP（opengraph-image.tsx）へ委譲
      publishedTime: post.published_at || undefined,
      modifiedTime: post.updated_at,
      authors: post.author ? [(post.author as any).name] : undefined,
      section: getCategoryLabel(post.category, 'ja'),
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt || '',
      images: imageUrl ? [imageUrl] : undefined, // 動的 OGP（opengraph-image.tsx）へ委譲
      creator: '@epackage_lab',
    },
    alternates: {
      canonical: isExternalCanonical ? post.canonical_url : url,
    },
  };
}

// =====================================================
// Page Component
// =====================================================

// 本文の中の h1 は、ページの h1（記事タイトル）と重なるので h2 にする（見た目は prose の h2 に従う）
function demoteH1(html: string): string {
  return html.replace(/<h1(\s|>)/g, '<h2$1').replace(/<\/h1>/g, '</h2>');
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // canonical と OGP の URL（generateMetadata と同一ロジック）
  const baseUrl = SITE_URL;
  const url = `${baseUrl}/blog/${post.slug}`;
  // canonical_url が package-lab 自社ドメイン(.net/.com)の場合は旧ドメイン残渣のため無視。
  // 外部ドメイン（真の外部転載元）の場合のみ尊重する。
  const isExternalCanonical = Boolean(
    post.canonical_url && !post.canonical_url.includes('package-lab.')
  );

  // Increment view count (non-blocking)
  incrementViewCount(post.id).catch(console.error);

  // Markdown parsing and related-post lookup depend only on the fetched post.
  // Keep the view-count RPC fire-and-catch so its errors cannot suppress content.
  const [{ html, headings, wordCount, readingTime }, relatedPosts] = await Promise.all([
    parseMarkdown(post.content),
    getRelatedPosts(post.id, post.category, 10),
  ]);

  // Insert CTA placeholders into HTML
  const htmlWithCTAs = insertCTAPlaceholders(html, {
    midPosition: 0.5,
    enabled: true,
  });

  // Split content by CTA placeholders
  const { beforeMid, afterMid, hasMidCTA } = splitContentByCTA(htmlWithCTAs);

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
    author: post.author ? { name: (post.author as any).name, email: post.author.email } : null,
    ogImagePath: post.og_image_path || null,
    metaTitle: post.meta_title || null,
    metaDescription: post.meta_description || null,
    canonicalUrl: isExternalCanonical ? (post.canonical_url || null) : url,
    readingTime,
    wordCount,
  });

  return (
    <>
      <BreadcrumbJsonLd pathname={`/blog/${slug}`} />
      <ScrollToAnchor />
      {/* スクロール深度計測（25/50/75/100% 到達で GA4 イベント発火） */}
      <ScrollDepthTracker articleId={post.id} />
      {/* Structured Data: BlogPosting（パンくずは <BreadcrumbJsonLd> が出力） */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }}
      />

      <div className={`${headingFont.variable} min-h-screen bg-bg-primary`}>
        {/* Back Button */}
        <div className="bg-bg-primary border-b border-border-medium">
          <div className="mx-auto max-w-[1120px] px-4 py-2 sm:px-6">
            <Link
              href="/blog"
              className="inline-flex min-h-11 items-center gap-2 text-brand hover:text-brand-pressed transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              導入事例一覧に戻る
            </Link>
          </div>
        </div>

        <PageHeader
          title={post.title}
        >
          <div className="mb-4">
            <Link
              href={`/blog/category/${post.category}`}
              className="inline-flex min-h-10 items-center rounded-inner bg-brand-muted px-3 text-sm font-medium text-on-brand-muted transition-colors hover:bg-brand-subtle max-sm:min-h-11"
            >
              {getCategoryLabel(post.category, 'ja')}
            </Link>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted">
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
                <span>{(post.author as any).name}</span>
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
                  className="inline-flex min-h-10 items-center rounded-md border border-border-medium bg-bg-primary px-3 text-sm text-text-secondary transition-colors hover:bg-bg-secondary max-sm:min-h-11"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </PageHeader>

        <div className="mx-auto max-w-[1120px] px-4 py-12 sm:px-6 relative">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <article className="flex-1 min-w-0 lg:w-2/3 lg:pr-8">
              {/* Featured Image */}
              {post.og_image_path && (
                <div className="mb-8 rounded-container overflow-hidden border border-border-medium">
                  <img
                    src={post.og_image_path}
                    alt={post.title}
                    className="w-full h-auto"
                  />
                </div>
              )}

              {/* Article Content */}
              <div className="space-y-8">
                {/* First part - before mid-article CTA */}
                <div
                  className="prose prose-blog prose-base max-w-none prose-headings:font-bold prose-headings:text-text-primary prose-h2:text-2xl prose-h2:font-heading prose-h2:font-medium prose-h2:border-t prose-h2:border-border-medium prose-h2:pt-8 prose-h3:text-xl prose-p:leading-[1.8] prose-li:leading-[1.8] prose-p:text-text-primary prose-a:text-brand prose-a:no-underline hover:prose-a:underline prose-strong:text-text-primary prose-code:text-text-primary prose-pre:bg-bg-muted prose-blockquote:border-l-4 prose-blockquote:border-brand prose-blockquote:pl-4 prose-blockquote:text-text-primary"
                  dangerouslySetInnerHTML={{ __html: demoteH1(beforeMid) }}
                />

                {/* Mid-article CTA */}
                {hasMidCTA && (
                  <div className="my-12">
                    <ArticleCTA variant="mid-article" />
                  </div>
                )}

                {/* Second part - after mid-article CTA (includes end-article CTA) */}
                {afterMid && (
                  <div className="relative">
                    <div
                      className="prose prose-blog prose-base max-w-none prose-headings:font-bold prose-headings:text-text-primary prose-h2:text-2xl prose-h2:font-heading prose-h2:font-medium prose-h2:border-t prose-h2:border-border-medium prose-h2:pt-8 prose-h3:text-xl prose-p:leading-[1.8] prose-li:leading-[1.8] prose-p:text-text-primary prose-a:text-brand prose-a:no-underline hover:prose-a:underline prose-strong:text-text-primary prose-code:text-text-primary prose-pre:bg-bg-muted prose-blockquote:border-l-4 prose-blockquote:border-brand prose-blockquote:pl-4 prose-blockquote:text-text-primary"
                      dangerouslySetInnerHTML={{
                        __html: demoteH1(afterMid.replace(CTA_PLACEHOLDERS.END, '')),
                      }}
                    />
                  </div>
                )}

                {/* End-article CTA */}
                <div className="my-12">
                  <ArticleCTA variant="end-article" />
                </div>
              </div>

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
                <div className="mt-12 p-6 bg-bg-primary rounded-container border border-border-medium">
                  <h3 className="text-lg font-bold text-text-primary mb-2">著者について</h3>
                  <p className="text-text-primary">{(post.author as any).name}</p>
                </div>
              )}
            </article>

            {/* Sidebar */}
            <aside className="hidden lg:block lg:w-1/3 lg:flex-shrink-0">
              <div className="lg:sticky lg:top-24">
              {/* Table of Contents */}
              {headings.length > 0 && (
                <TableOfContents headings={headings} />
              )}

              {/* Related Posts */}
              {relatedPosts.length > 0 ? (
                <div>
                  <RelatedPosts
                    posts={relatedPosts}
                    currentPostId={post.id}
                    category={post.category}
                  />
                </div>
              ) : (
                /* Fallback: Category link if no related posts */
                <div className="bg-bg-primary rounded-container border border-border-medium p-6">
                  <h3 className="text-lg font-bold text-text-primary mb-4">
                    <span className="text-brand">{getCategoryLabel(post.category, 'ja')}</span>の記事をもっと見る
                  </h3>
                  <Link
                    href={`/blog/category/${post.category}`}
                    className="inline-flex items-center gap-2 text-brand hover:text-brand-pressed font-medium transition-colors"
                  >
                    すべての{getCategoryLabel(post.category, 'ja')}記事を見る
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
              </div>
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

export async function generateStaticParams(): Promise<{ params: { slug: string } }[]> {
  // This would typically fetch all published post slugs
  // For now, return empty array to use SSR
  return [];
}
