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

// =====================================================
// Generate Metadata
// =====================================================

interface BlogCategoryPageProps {
  params: {
    category: string;
  };
  searchParams: {
    page?: string;
  };
}

export async function generateMetadata(
  { params }: BlogCategoryPageProps
): Promise<Metadata> {
  const category = params.category as any;
  const categoryName = getCategoryLabel(category, 'ja');
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://package-lab.com';

  // Check if category is valid
  if (!BLOG_CATEGORIES.find(c => c.id === category)) {
    return {
      title: 'カテゴリが見つかりません | Epackage Lab',
    };
  }

  return {
    title: `${categoryName} | Epackage Lab ブログ`,
    description: `${categoryName}に関する記事一覧です。包装資材・印刷の最新情報をお届けします。`,
    openGraph: {
      title: `${categoryName} | Epackage Lab ブログ`,
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
  const category = params.category as any;
  const page = parseInt(searchParams.page || '1', 10);

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            ブログ一覧に戻る
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{categoryName}</h1>
          <p className="text-lg text-gray-600">
            {categoryName}に関する記事一覧（全{postsData.total}件）
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Posts Grid */}
        <div className="mb-8">
          <BlogGrid posts={postsData.posts} />
        </div>

        {/* Pagination */}
        {postsData.totalPages > 1 && (
          <nav className="flex items-center justify-between" aria-label="Pagination">
            <Link
              href={page > 1 ? `/blog/category/${category}?page=${page - 1}` : '#'}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
                page > 1
                  ? 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
              aria-disabled={page <= 1}
            >
              <ChevronLeft className="w-5 h-5" />
              前へ
            </Link>

            <div className="text-gray-600">
              {page} / {postsData.totalPages} ページ
            </div>

            <Link
              href={page < postsData.totalPages ? `/blog/category/${category}?page=${page + 1}` : '#'}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
                page < postsData.totalPages
                  ? 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
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
