/**
 * Blog Category Page
 * Lists posts filtered by category
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPublishedPosts, getCategoriesWithCounts } from '@/lib/blog/queries';
import { BlogGrid } from '@/components/blog/BlogCard';
import { getCategoryLabel, BLOG_CATEGORIES } from '@/lib/types/blog';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd';
import { SITE_URL } from '@/lib/seo/canonical';
import { PageHeader } from '@/components/layout';
import { headingFont } from '@/components/home/fonts';

// =====================================================
// Generate Metadata
// =====================================================

interface BlogCategoryPageProps {
  params: Promise<{
    category: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
}

export async function generateMetadata(
  { params }: BlogCategoryPageProps
): Promise<Metadata> {
  const { category } = await params;
  const categoryName = getCategoryLabel(category, 'ja');
  const baseUrl = SITE_URL;

  // Check if category is valid
  if (!BLOG_CATEGORIES.find(c => c.id === category)) {
    // Soft 404 シグナル回避: 不正カテゴリは noindex
    return {
      // title 本体のみ（blog/layout.tsx の template が適用される）
      title: 'カテゴリが見つかりません',
      robots: { index: false },
    };
  }

  return {
    // title 本体のみ（blog/layout.tsx の template "%s | Epackage Lab ブログ" が適用される）
    title: `${categoryName}`,
    description: `${categoryName}に関する記事一覧です。包装資材・印刷の最新情報をお届けします。`,
    openGraph: {
      // openGraph.title は省略（resolved title "${categoryName} | Epackage Lab ブログ" がフォールバック）
      description: `${categoryName}に関する記事一覧です。`,
      url: `${baseUrl}/blog/category/${category}`,
      type: 'website',
    },
    alternates: {
      canonical: `${baseUrl}/blog/category/${category}`,
    },
  };
}

// =====================================================
// Page Component
// =====================================================

export default async function BlogCategoryPage({
  params,
  searchParams,
}: BlogCategoryPageProps) {
  const { category } = await params;
  const search = await searchParams;
  const page = parseInt(search.page || '1', 10);

  // Validate category
  if (!BLOG_CATEGORIES.find(c => c.id === category)) {
    notFound();
  }

  const categoryName = getCategoryLabel(category, 'ja');

  // Fetch posts
  const postsData = await getPublishedPosts({
    page,
    limit: 12,
    category,
  });

  return (
    <div className={`${headingFont.variable} min-h-screen bg-bg-primary`}>
      <BreadcrumbJsonLd pathname={`/blog/category/${category}`} />
      <PageHeader
        title={categoryName}
        lead={`${categoryName}に関する記事一覧（全${postsData.total}件）`}
        actions={
          <Link
            href="/blog"
            className="inline-flex min-h-11 items-center gap-2 text-brand underline underline-offset-4 hover:text-brand-pressed"
          >
            <ArrowLeft className="w-4 h-4" />
            ブログ一覧に戻る
          </Link>
        }
      />

      <div className="mx-auto max-w-[1120px] px-4 py-16 sm:px-6">
        {/* Posts Grid */}
        <div className="mb-8">
          <BlogGrid posts={postsData.posts} />
        </div>

        {/* Pagination */}
        {postsData.totalPages > 1 && (
          <nav className="flex items-center justify-between" aria-label="Pagination">
            <Link
              href={page > 1 ? `/blog/category/${category}?page=${page - 1}` : '#'}
              className={`inline-flex min-h-10 items-center gap-2 rounded-md border px-4 max-sm:min-h-11 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${
                page > 1
                  ? 'border-border-medium bg-bg-primary text-text-primary hover:bg-bg-secondary'
                  : 'cursor-not-allowed border-border-medium bg-bg-muted text-text-muted'
              }`}
              aria-disabled={page <= 1}
            >
              <ChevronLeft className="w-5 h-5" />
              前へ
            </Link>

            <div className="text-text-secondary">
              {page} / {postsData.totalPages} ページ
            </div>

            <Link
              href={page < postsData.totalPages ? `/blog/category/${category}?page=${page + 1}` : '#'}
              className={`inline-flex min-h-10 items-center gap-2 rounded-md border px-4 max-sm:min-h-11 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${
                page < postsData.totalPages
                  ? 'border-border-medium bg-bg-primary text-text-primary hover:bg-bg-secondary'
                  : 'cursor-not-allowed border-border-medium bg-bg-muted text-text-muted'
              }`}
              aria-disabled={page >= postsData.totalPages}
            >
              次へ
              <ChevronRight className="w-5 h-5" />
            </Link>
          </nav>
        )}
      </div>
    </div>
  );
}

// =====================================================
// Generate Static Params
// =====================================================

export async function generateStaticParams() {
  return BLOG_CATEGORIES.map((category) => ({
    category: category.id,
  }));
}
