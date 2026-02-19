/**
 * Blog Tag Page
 * Lists posts filtered by tag
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { getPublishedPosts, getTagsWithCounts } from '@/lib/blog/queries';
import { BlogGrid } from '@/components/blog/BlogCard';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';

// =====================================================
// Generate Metadata
// =====================================================

interface BlogTagPageProps {
  params: Promise<{
    tag: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
}

export async function generateMetadata(
  { params }: BlogTagPageProps
): Promise<Metadata> {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://package-lab.com';

  return {
    title: `#${decodedTag} | Epackage Lab ブログ`,
    description: `#${decodedTag}タグ付きの記事一覧です。包装資材・印刷の最新情報をお届けします。`,
    openGraph: {
      title: `#${decodedTag} | Epackage Lab ブログ`,
      description: `#${decodedTag}タグ付きの記事一覧です。`,
      url: `${baseUrl}/blog/tag/${tag}`,
      type: 'website',
    },
    alternates: {
      canonical: `${baseUrl}/blog/tag/${tag}`,
    },
  };
}

// =====================================================
// Page Component
// =====================================================

export default async function BlogTagPage({
  params,
  searchParams,
}: BlogTagPageProps) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  const { page: pageParam } = await searchParams;
  const page = parseInt(pageParam || '1', 10);

  // Fetch posts with this tag
  const postsData = await getPublishedPosts({
    page,
    limit: 12,
    tag: decodedTag,
  });

  // Get all tags for sidebar
  const allTags = await getTagsWithCounts();

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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            タグ: {tag}
          </h1>
          <p className="text-lg text-gray-600">
            #{tag}タグ付きの記事一覧（全{postsData.total}件）
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Posts Grid */}
            <div className="mb-8">
              <BlogGrid posts={postsData.posts} />
            </div>

            {/* Pagination */}
            {postsData.totalPages > 1 && (
              <nav className="flex items-center justify-between" aria-label="Pagination">
                <Link
                  href={page > 1 ? `/blog/tag/${params.tag}?page=${page - 1}` : '#'}
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
                  href={page < postsData.totalPages ? `/blog/tag/${params.tag}?page=${page + 1}` : '#'}
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

          {/* Sidebar */}
          <aside className="lg:w-1/4">
            {/* Tag Cloud */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">人気のタグ</h3>
              <div className="flex flex-wrap gap-2">
                {allTags.slice(0, 20).map((t) => (
                  <Link
                    key={t.tag}
                    href={`/blog/tag/${encodeURIComponent(t.tag)}`}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      t.tag === tag
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    #{t.tag}
                    <span className="ml-1 text-xs opacity-75">({t.count})</span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// Generate Static Params
// =====================================================

export async function generateStaticParams() {
  // Fetch all tags to generate static pages for popular tags
  const tags = await getTagsWithCounts();

  // Generate static params for top 20 tags
  return tags.slice(0, 20).map((t) => ({
    tag: encodeURIComponent(t.tag),
  }));
}
