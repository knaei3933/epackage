/**
 * BlogCard Component
 * Displays a blog post card with image, title, excerpt, date, and category
 */

'use client';

import Link from 'next/link';
import { Calendar, Clock, Eye } from 'lucide-react';
import { BlogPostListItem } from '@/lib/types/blog';
import { getCategoryLabel } from '@/lib/types/blog';
import { formatDate } from '@/lib/format-date';

interface BlogCardProps {
  post: BlogPostListItem;
  showAuthor?: boolean;
  showViews?: boolean;
}

export function BlogCard({ post, showAuthor = true, showViews = false }: BlogCardProps) {
  const categoryLabel = getCategoryLabel(post.category, 'ja');

  // Get OG image or use default
  const imageUrl = post.og_image_path || '/images/blog-placeholder.jpg';

  return (
    <article className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <Link href={`/blog/${post.slug}`} className="block">
        {/* Image */}
        <div className="aspect-video overflow-hidden bg-gray-200">
          <img
            src={imageUrl}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Category Badge */}
          <div className="mb-3">
            <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
              {categoryLabel}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {post.title}
          </h3>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-gray-600 mb-4 line-clamp-2">
              {post.excerpt}
            </p>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Meta */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            {/* Date */}
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <time dateTime={post.published_at || post.created_at}>
                {formatDate(post.published_at || post.created_at)}
              </time>
            </div>

            {/* Reading Time */}
            {post.reading_time_minutes && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{post.reading_time_minutes}分</span>
              </div>
            )}

            {/* Author */}
            {showAuthor && post.author && (
              <div className="flex items-center gap-1">
                <span>{post.author.name}</span>
              </div>
            )}

            {/* View Count */}
            {showViews && post.view_count > 0 && (
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{post.view_count}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}

// =====================================================
// Blog Grid Component
// =====================================================

interface BlogGridProps {
  posts: BlogPostListItem[];
  showAuthor?: boolean;
  showViews?: boolean;
}

export function BlogGrid({ posts, showAuthor, showViews }: BlogGridProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">記事が見つかりませんでした。</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <BlogCard
          key={post.id}
          post={post}
          showAuthor={showAuthor}
          showViews={showViews}
        />
      ))}
    </div>
  );
}

// =====================================================
// Blog List Component (horizontal layout)
// =====================================================

interface BlogListProps {
  posts: BlogPostListItem[];
  showAuthor?: boolean;
  showViews?: boolean;
}

export function BlogList({ posts, showAuthor, showViews }: BlogListProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">記事が見つかりませんでした。</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <article key={post.id} className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <Link href={`/blog/${post.slug}`} className="block md:flex">
            {/* Image */}
            <div className="md:w-1/3 aspect-video md:aspect-square overflow-hidden bg-gray-200">
              <img
                src={post.og_image_path || '/images/blog-placeholder.jpg'}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>

            {/* Content */}
            <div className="md:w-2/3 p-6">
              {/* Category Badge */}
              <div className="mb-2">
                <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                  {getCategoryLabel(post.category, 'ja')}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {post.title}
              </h3>

              {/* Excerpt */}
              {post.excerpt && (
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {post.excerpt}
                </p>
              )}

              {/* Meta */}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <time dateTime={post.published_at || post.created_at}>
                    {formatDate(post.published_at || post.created_at)}
                  </time>
                </div>

                {post.reading_time_minutes && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{post.reading_time_minutes}分</span>
                  </div>
                )}

                {showViews && post.view_count > 0 && (
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{post.view_count}</span>
                  </div>
                )}
              </div>
            </div>
          </Link>
        </article>
      ))}
    </div>
  );
}
