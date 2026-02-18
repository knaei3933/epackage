/**
 * Blog Index Page
 * Lists all published blog posts with pagination and category filters
 */

import { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { getPublishedPosts, getCategoriesWithCounts } from '@/lib/blog/queries';
import { BlogGrid } from '@/components/blog/BlogCard';
import { BlogListParams } from '@/lib/types/blog';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// =====================================================
// Metadata
// =====================================================

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://package-lab.com';

  return {
    title: 'ブログ | Epackage Lab',
    description: '包装資材・印刷の最新情報、技術情報、業界動向をお届けします。パッケージングの専門家による信頼できる情報発信。',
    openGraph: {
      title: 'ブログ | Epackage Lab',
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
      title: 'ブログ | Epackage Lab',
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
  searchParams: {
    page?: string;
    category?: string;
    tag?: string;
    q?: string;
  };
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const page = parseInt(searchParams.page || '1', 10);
  const category = searchParams.category;
  const tag = searchParams.tag;
  const search = searchParams.q;

  // Fetch posts
  const postsData = await getPublishedPosts({
    page,
    limit: 12,
    category: category as any,
    tag,
    search,
  });

  // Fetch categories with counts
  const categories = await getCategoriesWithCounts();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">ブログ</h1>
          <p className="text-lg text-gray-600">
            包装資材・印刷の最新情報、技術情報、業界動向をお届けします
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Category Filter */}
            <Suspense fallback={<CategoryFilterSkeleton />}>
              <CategoryFilter
                categories={categories}
                activeCategory={category}
              />
            </Suspense>

            {/* Posts Grid */}
            <div className="mt-8">
              {search && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-blue-800">
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
        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
          !activeCategory
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        すべて ({categories.reduce((sum, cat) => sum + cat.count, 0)})
      </Link>

      {categories.map((cat) => (
        <Link
          key={cat.category}
          href={`/blog/category/${cat.category}`}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeCategory === cat.category
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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
          className="h-10 w-24 bg-gray-200 rounded-full animate-pulse"
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
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
          currentPage > 1
            ? 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
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
                <span key={`ellipsis-${page}`} className="text-gray-400">
                  ...
                </span>
              );
            }

            return (
              <Link
                key={page}
                href={buildUrl(page)}
                className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium ${
                  page === currentPage
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
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
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
          currentPage < totalPages
            ? 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
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
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">カテゴリ</h3>
        <ul className="space-y-2">
          <li>
            <Link
              href="/blog"
              className="flex items-center justify-between text-gray-600 hover:text-blue-600 transition-colors"
            >
              <span>すべて</span>
              <span className="text-sm text-gray-400">
                {categories.reduce((sum, cat) => sum + cat.count, 0)}
              </span>
            </Link>
          </li>
          {categories.map((cat) => (
            <li key={cat.category}>
              <Link
                href={`/blog/category/${cat.category}`}
                className="flex items-center justify-between text-gray-600 hover:text-blue-600 transition-colors"
              >
                <span>{cat.name_ja}</span>
                <span className="text-sm text-gray-400">{cat.count}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* About */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">このブログについて</h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          Epackage Labのブログでは、包装資材・印刷に関する最新情報、技術情報、業界動向をお届けします。
          小ロットパッケージ製造の専門家として、実践的な情報を提供します。
        </p>
      </div>
    </div>
  );
}
