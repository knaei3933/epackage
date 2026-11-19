/**
 * Blog Tag Page
 * Lists posts filtered by tag
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPublishedPosts, getTagsWithCounts } from '@/lib/blog/queries';
import { BlogGrid } from '@/components/blog/BlogCard';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd';
import { SITE_URL } from '@/lib/seo/canonical';
import { PageHeader } from '@/components/layout';
import { headingFont } from '@/components/home/fonts';

// =====================================================
// Generate Metadata
// =====================================================

interface BlogTagPageProps {
  // Next.js 16: params / searchParams は Promise
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
  const { tag: tagParam } = await params;
  const tag = decodeURIComponent(tagParam);
  const baseUrl = SITE_URL;

  // Soft 404 対策: 該当タグの記事が0件（存在しない無効タグ）なら noindex にして
  // インデックス候補から除外する。generateMetadata はページ本体の notFound() より
  // 先に解決されるため、ここで明示的にクロールを拒否しないと #undefined などの
  // 無意味なタグページが index,follow で露出してしまう。
  const { total } = await getPublishedPosts({ tag, limit: 1 });
  const isValidTag = total > 0;

  return {
    // title 本体のみ（blog/layout.tsx の template "%s | Epackage Lab ブログ" が適用される）
    title: `#${tag}`,
    description: `#${tag}タグ付きの記事一覧です。包装資材・印刷の最新情報をお届けします。`,
    openGraph: {
      // openGraph.title は省略（resolved title "#${tag} | Epackage Lab ブログ" がフォールバック）
      description: `#${tag}タグ付きの記事一覧です。`,
      url: `${baseUrl}/blog/tag/${tagParam}`,
      type: 'website',
    },
    alternates: {
      canonical: `${baseUrl}/blog/tag/${tagParam}`,
    },
    // 無効タグ（記事0件）はインデックスさせない
    ...(isValidTag ? {} : { robots: { index: false, follow: false } }),
  };
}

// =====================================================
// Page Component
// =====================================================

export default async function BlogTagPage({
  params,
  searchParams,
}: BlogTagPageProps) {
  const { tag: tagParam } = await params;
  const tag = decodeURIComponent(tagParam);
  const { page: pageParam } = await searchParams;
  const page = parseInt(pageParam || '1', 10);

  // Fetch posts with this tag
  const postsData = await getPublishedPosts({
    page,
    limit: 12,
    tag,
  });

  // Soft 404 対策: 該当タグの記事が0件、またはページ範囲外の場合は 404 を返す
  // （total=0 なら totalPages=0 となり page(>=1) > 0 で notFound 発火）
  if (page > postsData.totalPages) {
    notFound();
  }

  // Get all tags for sidebar
  const allTags = await getTagsWithCounts();

  return (
    <div className={`${headingFont.variable} min-h-screen bg-bg-primary`}>
      <BreadcrumbJsonLd pathname={`/blog/tag/${tagParam}`} />
      <PageHeader
        title={`タグ: ${tag}`}
        lead={`#${tag}タグ付きの記事一覧（全${postsData.total}件）`}
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
                  href={page > 1 ? `/blog/tag/${tagParam}?page=${page - 1}` : '#'}
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
                  href={page < postsData.totalPages ? `/blog/tag/${tagParam}?page=${page + 1}` : '#'}
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

          {/* Sidebar */}
          <aside className="lg:w-1/4">
            {/* Tag Cloud */}
            <div className="rounded-container border border-border-medium bg-bg-primary p-6">
              <h2 className="text-lg font-bold text-text-primary mb-4">人気のタグ</h2>
              <div className="flex flex-wrap gap-2">
                {allTags.slice(0, 20).map((t) => (
                  <Link
                    key={t.tag}
                    href={`/blog/tag/${encodeURIComponent(t.tag)}`}
                    className={`inline-flex min-h-10 items-center rounded-md border px-3 text-sm transition-colors max-sm:min-h-11 ${
                      t.tag === tag
                        ? 'border-brand bg-brand text-on-brand'
                        : 'border-border-medium bg-bg-primary text-text-primary hover:bg-bg-secondary'
                    }`}
                  >
                    #{t.tag}
                    <span className="ml-1 text-[13px]">({t.count})</span>
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
