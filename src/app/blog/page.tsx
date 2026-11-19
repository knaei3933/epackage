/**
 * Blog Index Page
 * Lists all published blog posts with pagination and category filters
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { getPublishedPosts, getCategoriesWithCounts } from '@/lib/blog/queries';
import { BlogGrid } from '@/components/blog/BlogCard';
import { BlogListParams } from '@/lib/types/blog';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd';
import { SITE_URL } from '@/lib/seo/canonical';
import { PageHeader } from '@/components/layout';
import { headingFont } from '@/components/home/fonts';

// =====================================================
// Metadata
// =====================================================

export async function generateMetadata(
  { searchParams }: { searchParams: Promise<{ q?: string; category?: string; tag?: string; page?: string }> }
): Promise<Metadata> {
  const baseUrl = SITE_URL;
  const params = await searchParams;
  // 検索・カテゴリ・タグのクエリ付きURLは Soft 404 判定を避けるため noindex。
  // page のみは index を維持（ページネーション自体は許容）。
  // カテゴリ独立ページ /blog/category/x は index（別ページで正規化済み）。
  const hasNoindexQuery = Boolean(params.q || params.category || params.tag);

  return {
    // /blog（index）は blog/layout.tsx と同階層のため同 layout の template が適用されず、
    // ルート template（"%s | Epackage Lab"）になる。absolute でブランド「| Epackage Lab ブログ」を明示。
    title: { absolute: 'ブログ | Epackage Lab ブログ' },
    description: '包装資材・印刷の最新情報、技術情報、業界動向をお届けします。パッケージングの専門家による信頼できる情報発信。ソフトパウチ、スタンドパウチ、ガゼットパウチなどの軟包裝材に関するノウハウ、選び方、導入事例を詳しくご紹介。小ロットから大ロットまで、最適な包装ソリューションを見つけるための実践的な情報を提供。',
    // クエリパラメータ付きは noindex（?q / ?category / ?tag）
    ...(hasNoindexQuery ? { robots: { index: false } } : {}),
    openGraph: {
      // openGraph.title は省略（resolved title "ブログ | Epackage Lab ブログ" がフォールバック）
      description: '包装資材・印刷の最新情報、技術情報、業界動向をお届けします。',
      url: `${baseUrl}/blog`,
      type: 'website',
      images: [
        {
          url: `${baseUrl}/images/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: 'Epackage Lab ブログ',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      // twitter.title は省略（resolved title "ブログ | Epackage Lab ブログ" がフォールバック）
      description: '包装資材・印刷の最新情報、技術情報、業界動向をお届けします。',
      images: [`${baseUrl}/images/og-image.jpg`],
    },
    alternates: {
      canonical: `${baseUrl}/blog`,
    },
  };
}

// =====================================================
// Page Component
// =====================================================

interface BlogPageProps {
  searchParams: Promise<{
    page?: string;
    category?: string;
    tag?: string;
    q?: string;
  }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || '1', 10);
  const category = params.category;
  const tag = params.tag;
  const search = params.q;

  // Fetch posts
  const postsData = await getPublishedPosts({
    page,
    limit: 12,
    category: category as any,
    tag,
    search,
  });

  // ページネーション範囲外は Soft 404 回避のため真の404を返す。
  // page < 1（0・負数）と page > totalPages の両端をカバー。
  // ※ totalPages=0（記事ゼロ）のとき page=1 は notFound にしない（空の BlogGrid を表示）。
  if (page < 1 || (postsData.totalPages > 0 && page > postsData.totalPages)) {
    notFound();
  }

  // Fetch categories with counts
  const categories = await getCategoriesWithCounts();

  return (
    <div className={`${headingFont.variable} min-h-screen bg-bg-primary`}>
      <BreadcrumbJsonLd pathname="/blog" />
      <PageHeader
        title="導入事例"
        lead="包装資材・印刷の最新情報、技術情報、業界動向をお届けします"
      />

      <div className="mx-auto max-w-[1120px] px-4 py-16 sm:px-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Category Filter - Brixa style pill buttons */}
            <Suspense fallback={<CategoryFilterSkeleton />}>
              <CategoryFilter
                categories={categories}
                activeCategory={category}
              />
            </Suspense>

            {/* Posts Grid */}
            <div className="mt-8">
              {search && (
                <div className="mb-6 rounded-container border border-brand-soft bg-brand-muted p-4">
                  <p className="text-on-brand-muted">
                    検索結果: <strong>&quot;{search}&quot;</strong>
                    <span className="ml-2">({postsData.total}件)</span>
                  </p>
                </div>
              )}

              <BlogGrid posts={postsData.posts} />

              {/* Pagination */}
              {postsData.totalPages > 1 && (
                <Pagination
                  currentPage={page}
                  totalPages={postsData.totalPages}
                  category={category}
                  tag={tag}
                  search={search}
                />
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:w-1/4">
            <Sidebar categories={categories} />
          </aside>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// Category Filter Component
// =====================================================

interface CategoryFilterProps {
  categories: Array<{
    category: string;
    name_ja: string;
    name_en: string;
    count: number;
  }>;
  activeCategory?: string;
}

function CategoryFilter({ categories, activeCategory }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/blog"
        className={`inline-flex min-h-10 items-center rounded-md border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 max-sm:min-h-11 ${
          !activeCategory
            ? 'border-brand bg-brand text-on-brand'
            : 'border-border-medium bg-bg-primary text-text-primary hover:bg-bg-secondary'
        }`}
      >
        すべて ({categories.reduce((sum, cat) => sum + cat.count, 0)})
      </Link>

      {categories.map((cat) => (
        <Link
          key={cat.category}
          href={`/blog/category/${cat.category}`}
          className={`inline-flex min-h-10 items-center rounded-md border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 max-sm:min-h-11 ${
            activeCategory === cat.category
              ? 'border-brand bg-brand text-on-brand'
              : 'border-border-medium bg-bg-primary text-text-primary hover:bg-bg-secondary'
          }`}
        >
          {cat.name_ja} ({cat.count})
        </Link>
      ))}
    </div>
  );
}

function CategoryFilterSkeleton() {
  return (
    <div className="flex flex-wrap gap-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="h-10 w-24 bg-bg-muted rounded-md animate-pulse"
        />
      ))}
    </div>
  );
}

// =====================================================
// Pagination Component
// =====================================================

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  category?: string;
  tag?: string;
  search?: string;
}

function Pagination({ currentPage, totalPages, category, tag, search }: PaginationProps) {
  const buildUrl = (page: number) => {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    if (category) params.set('category', category);
    if (tag) params.set('tag', tag);
    if (search) params.set('q', search);
    return `/blog?${params.toString()}`;
  };

  return (
    <nav className="mt-12 flex items-center justify-between" aria-label="Pagination">
      {/* Previous Button */}
      <Link
        href={currentPage > 1 ? buildUrl(currentPage - 1) : '#'}
        className={`inline-flex min-h-10 items-center gap-2 rounded-md border px-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 max-sm:min-h-11 ${
          currentPage > 1
            ? 'border-border-medium bg-bg-primary text-text-primary hover:bg-bg-secondary'
            : 'cursor-not-allowed border-border-medium bg-bg-muted text-text-muted'
        }`}
        aria-disabled={currentPage <= 1}
      >
        <ChevronLeft className="w-5 h-5" />
        前へ
      </Link>

      {/* Page Numbers */}
      <div className="flex items-center gap-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(
            (page) =>
              page === 1 ||
              page === totalPages ||
              (page >= currentPage - 1 && page <= currentPage + 1)
          )
          .map((page, i, arr) => {
            // Show ellipsis for skipped pages
            if (i > 0 && arr[i - 1] !== page - 1) {
              return (
                <span key={`ellipsis-${page}`} className="text-text-muted">
                  ...
                </span>
              );
            }

            return (
              <Link
                key={page}
                href={buildUrl(page)}
                className={`flex h-10 w-10 items-center justify-center rounded-md border font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 max-sm:h-11 max-sm:w-11 ${
                  page === currentPage
                    ? 'border-brand bg-brand text-on-brand'
                    : 'border-border-medium bg-bg-primary text-text-primary hover:bg-bg-secondary'
                }`}
              >
                {page}
              </Link>
            );
          })}
      </div>

      {/* Next Button */}
      <Link
        href={currentPage < totalPages ? buildUrl(currentPage + 1) : '#'}
        className={`inline-flex min-h-10 items-center gap-2 rounded-md border px-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 max-sm:min-h-11 ${
          currentPage < totalPages
            ? 'border-border-medium bg-bg-primary text-text-primary hover:bg-bg-secondary'
            : 'cursor-not-allowed border-border-medium bg-bg-muted text-text-muted'
        }`}
        aria-disabled={currentPage >= totalPages}
      >
        次へ
        <ChevronRight className="w-5 h-5" />
      </Link>
    </nav>
  );
}

// =====================================================
// Sidebar Component
// =====================================================

interface SidebarProps {
  categories: Array<{
    category: string;
    name_ja: string;
    name_en: string;
    count: number;
  }>;
}

function Sidebar({ categories }: SidebarProps) {
  return (
    <div className="space-y-6">
      {/* Categories */}
      <div className="rounded-container border border-border-medium bg-bg-primary p-6">
        <h2 className="mb-4 text-lg font-bold text-text-primary">カテゴリ</h2>
        <ul className="space-y-2">
          <li>
            <Link
              href="/blog"
              className="group flex min-h-11 items-center justify-between text-text-secondary transition-colors hover:text-brand"
            >
              <span>すべて</span>
              <span className="rounded-inner bg-bg-muted px-2 py-0.5 text-[13px] text-text-secondary">
                {categories.reduce((sum, cat) => sum + cat.count, 0)}
              </span>
            </Link>
          </li>
          {categories.map((cat) => (
            <li key={cat.category}>
              <Link
                href={`/blog/category/${cat.category}`}
                className="group flex min-h-11 items-center justify-between text-text-secondary transition-colors hover:text-brand"
              >
                <span>{cat.name_ja}</span>
                <span className="rounded-inner bg-bg-muted px-2 py-0.5 text-[13px] text-text-secondary">{cat.count}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* About */}
      <div className="rounded-container border border-border-medium bg-bg-primary p-6">
        <h2 className="mb-4 text-lg font-bold text-text-primary">このブログについて</h2>
        <p className="text-sm leading-[1.8] text-text-secondary">
          Epackage Labのブログでは、包装資材・印刷に関する最新情報、技術情報、業界動向をお届けします。
          小ロットパッケージ製造の専門家として、実践的な情報を提供します。
        </p>
      </div>
    </div>
  );
}
