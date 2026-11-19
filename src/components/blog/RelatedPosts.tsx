/**
 * RelatedPosts Component
 * Displays related posts from the same category
 */

'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { BlogPostListItem } from '@/lib/types/blog';
import { getCategoryLabel } from '@/lib/types/blog';
import { formatDate } from '@/lib/format-date';

interface RelatedPostsProps {
  posts: BlogPostListItem[];
  currentPostId: string;
  category: string;
}

export function RelatedPosts({ posts, currentPostId, category }: RelatedPostsProps) {
  // Filter out current post and limit to 3 posts
  const relatedPosts = posts
    .filter(post => post.id !== currentPostId)
    .slice(0, 3);

  if (relatedPosts.length === 0) {
    return null;
  }

  const categoryLabel = getCategoryLabel(category as any, 'ja');

  return (
    <div className="bg-bg-primary rounded-container border border-border-medium p-6 mb-6">
      <h3 className="text-xl font-bold text-text-primary mb-6">
        <span className="text-brand">{categoryLabel}</span>の関連記事
      </h3>

      <div className="space-y-4">
        {relatedPosts.map((post) => (
          <RelatedPostCard key={post.id} post={post} />
        ))}
      </div>

      {/* View All Link */}
      <Link
        href={`/blog/category/${category}`}
        className="mt-6 inline-flex items-center gap-2 text-brand hover:text-brand-pressed font-medium transition-colors"
      >
        すべての{categoryLabel}記事を見る
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

interface RelatedPostCardProps {
  post: BlogPostListItem;
}

function RelatedPostCard({ post }: RelatedPostCardProps) {
  const imageUrl = post.og_image_path || '/images/og-image.jpg';

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex gap-4 p-3 rounded-lg hover:bg-bg-secondary transition-colors"
    >
      {/* Thumbnail */}
      <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-bg-muted">
        <img
          src={imageUrl}
          alt={post.title}
          className="w-full h-full object-cover  transition-transform duration-300"
          loading="lazy"
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title */}
        <h4 className="font-medium text-text-primary mb-1 line-clamp-2 group-hover:text-brand transition-colors">
          {post.title}
        </h4>

        {/* Date & Reading Time */}
        <div className="flex items-center gap-3 text-sm text-text-muted">
          <time dateTime={post.published_at || post.created_at}>
            {formatDate(post.published_at || post.created_at)}
          </time>

          {post.reading_time_minutes && (
            <>
              <span>·</span>
              <span>{post.reading_time_minutes}分で読めます</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

// =====================================================
// Compact Related Posts (sidebar version)
// =====================================================

interface CompactRelatedPostsProps {
  posts: BlogPostListItem[];
  currentPostId: string;
  maxPosts?: number;
}

export function CompactRelatedPosts({ posts, currentPostId, maxPosts = 5 }: CompactRelatedPostsProps) {
  const relatedPosts = posts
    .filter(post => post.id !== currentPostId)
    .slice(0, maxPosts);

  if (relatedPosts.length === 0) {
    return null;
  }

  return (
    <div className="bg-bg-primary rounded-container border border-border-medium p-6 mb-6">
      <h3 className="text-lg font-bold text-text-primary mb-4">関連記事</h3>

      <ul className="space-y-3">
        {relatedPosts.map((post) => (
          <li key={post.id}>
            <Link
              href={`/blog/${post.slug}`}
              className="group block"
            >
              <h4 className="text-sm font-medium text-text-primary line-clamp-2 group-hover:text-brand transition-colors">
                {post.title}
              </h4>
              <time className="text-xs text-text-muted">
                {formatDate(post.published_at || post.created_at)}
              </time>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
