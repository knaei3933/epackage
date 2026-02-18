/**
 * Admin Blog List Page
 *
 * Server component that fetches and displays blog posts
 */

import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import { BlogPostList } from '@/components/admin/blog/BlogPostList';
import type { BlogPostListItem } from '@/lib/types/blog';

export const metadata: Metadata = {
  title: 'ブログ管理 | 管理画面',
  description: 'ブログ記事の管理',
};

// ============================================================
// Fetch blog posts (server-side)
// ============================================================

async function getBlogPosts(): Promise<{ posts: BlogPostListItem[]; total: number }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return { posts: [], total: 0 };
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data: posts, count } = await supabase
    .from('blog_posts')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(0, 19);

  // Fetch author profiles
  let postsWithAuthors: BlogPostListItem[] = [];
  if (posts && posts.length > 0) {
    const authorIds = Array.from(new Set(posts.map((p) => p.author_id).filter(Boolean)));

    let profileMap: Record<string, any> = {};
    if (authorIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, kanji_last_name, kanji_first_name, company_name')
        .in('id', authorIds);

      if (profiles) {
        profileMap = profiles.reduce((acc, profile) => {
          acc[profile.id] = profile;
          return acc;
        }, {} as Record<string, any>);
      }
    }

    postsWithAuthors = posts.map((post) => {
      const author = profileMap[post.author_id];
      const authorName = author
        ? author.company_name || `${author.kanji_last_name || ''} ${author.kanji_first_name || ''}`.trim()
        : 'Unknown';

      return {
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        category: post.category,
        status: post.status,
        author: { name: authorName },
        published_at: post.published_at,
        created_at: post.created_at,
        view_count: post.view_count || 0,
      } as BlogPostListItem;
    });
  }

  return {
    posts: postsWithAuthors,
    total: count || 0,
  };
}

// ============================================================
// Page Component
// ============================================================

export default async function AdminBlogPage() {
  const { posts, total } = await getBlogPosts();

  return (
    <div className="container mx-auto py-6">
      <BlogPostList initialPosts={posts} initialTotal={total} />
    </div>
  );
}
