/**
 * Blog Data Fetching Functions
 * Server-side data fetching for blog posts
 */

import { createServiceClient } from '@/lib/supabase';
import { BlogPost, BlogPostListItem, BlogListParams, BlogListResponse, BlogCategoryId, BlogPostStatus } from '@/lib/types/blog';

// =====================================================
// Public Queries (for blog pages)
// =====================================================

/**
 * Get published blog posts with pagination
 */
export async function getPublishedPosts(params: BlogListParams = {}): Promise<BlogListResponse> {
  const {
    page = 1,
    limit = 12,
    category,
    search,
    sortBy = 'published_at',
    sortOrder = 'desc',
  } = params;

  const supabase = createServiceClient();

  // Build query
  let query = supabase
    .from('blog_posts')
    .select('id', { count: 'exact' })
    .eq('status', 'published');

  if (category) {
    query = query.eq('category', category);
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%,excerpt.ilike.%${search}%`);
  }

  // Get total count
  const { count, error: countError } = await query;

  if (countError || count === null) {
    console.error('[getPublishedPosts] Error fetching count:', countError);
    return {
      posts: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
    };
  }

  // Calculate range
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // Fetch posts with author data
  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select(`
      id,
      title,
      slug,
      excerpt,
      category,
      tags,
      meta_title,
      meta_description,
      og_image_path,
      published_at,
      created_at,
      updated_at,
      view_count,
      reading_time_minutes,
      profiles!author_id (
        kanji_last_name,
        kanji_first_name
      )
    `)
    .eq('status', 'published')
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .range(from, to);

  if (error) {
    console.error('[getPublishedPosts] Error fetching posts:', error);
    return {
      posts: [],
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
  }

  // Transform data
  const transformedPosts: BlogPostListItem[] = (posts || []).map((post: any) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    category: post.category,
    status: 'published',
    published_at: post.published_at,
    created_at: post.created_at,
    view_count: post.view_count,
    author: post.profiles ? {
      name: `${post.profiles.kanji_last_name} ${post.profiles.kanji_first_name}`.trim(),
    } : undefined,
  }));

  return {
    posts: transformedPosts,
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
  };
}

/**
 * Get a single published blog post by slug
 */
export async function getPublishedPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      profiles!author_id (
        id,
        email,
        kanji_last_name,
        kanji_first_name,
        company_name
      )
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error || !data) {
    console.error('[getPublishedPostBySlug] Error:', error);
    return null;
  }

  const post = data as any;
  return {
    ...post,
    author: post.profiles || undefined,
  };
}

/**
 * Get related posts from the same category
 */
export async function getRelatedPosts(
  currentPostId: string,
  category: BlogCategoryId,
  limit = 3
): Promise<BlogPostListItem[]> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      id,
      title,
      slug,
      excerpt,
      category,
      tags,
      og_image_path,
      published_at,
      created_at,
      updated_at,
      view_count,
      reading_time_minutes,
      profiles!author_id (
        kanji_last_name,
        kanji_first_name
      )
    `)
    .eq('status', 'published')
    .eq('category', category)
    .neq('id', currentPostId)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error || !data) {
    console.error('[getRelatedPosts] Error:', error);
    return [];
  }

  return (data || []).map((post: any) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    category: post.category,
    status: 'published',
    published_at: post.published_at,
    created_at: post.created_at,
    view_count: post.view_count,
    author: post.profiles ? {
      name: `${post.profiles.kanji_last_name} ${post.profiles.kanji_first_name}`.trim(),
    } : undefined,
  }));
}

/**
 * Get all categories with post counts
 */
export async function getCategoriesWithCounts(): Promise<Array<{
  category: BlogCategoryId;
  name_ja: string;
  name_en: string;
  count: number;
}>> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('blog_posts')
    .select('category')
    .eq('status', 'published');

  if (error || !data) {
    console.error('[getCategoriesWithCounts] Error:', error);
    return [];
  }

  // Count posts per category
  const counts: Record<string, number> = {};
  (data || []).forEach((post: any) => {
    counts[post.category] = (counts[post.category] || 0) + 1;
  });

  // Map to category labels
  const categoryLabels: Record<BlogCategoryId, { ja: string; en: string }> = {
    news: { ja: 'ニュース', en: 'News' },
    technical: { ja: '技術情報', en: 'Technical' },
    industry: { ja: '業界情報', en: 'Industry' },
    company: { ja: '会社情報', en: 'Company' },
  };

  return Object.entries(counts).map(([category, count]) => ({
    category: category as BlogCategoryId,
    ...categoryLabels[category as BlogCategoryId],
    count,
  }));
}

/**
 * Get all tags with post counts
 */
export async function getTagsWithCounts(): Promise<Array<{ tag: string; count: number }>> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('blog_posts')
    .select('tags')
    .eq('status', 'published');

  if (error || !data) {
    console.error('[getTagsWithCounts] Error:', error);
    return [];
  }

  // Count tags
  const counts: Record<string, number> = {};
  (data || []).forEach((post: any) => {
    (post.tags || []).forEach((tag: string) => {
      counts[tag] = (counts[tag] || 0) + 1;
    });
  });

  // Sort by count
  return Object.entries(counts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Increment view count for a post
 */
export async function incrementViewCount(postId: string): Promise<void> {
  const supabase = createServiceClient();

  // First get current count
  const { data: currentPost } = await supabase
    .from('blog_posts')
    .select('view_count')
    .eq('id', postId)
    .single();

  if (currentPost) {
    await supabase
      .from('blog_posts')
      .update({ view_count: (currentPost.view_count || 0) + 1 })
      .eq('id', postId);
  }
}

// =====================================================
// Admin Queries (for blog management)
// =====================================================

/**
 * Get all posts (including drafts) for admin
 */
export async function getAllPosts(params: BlogListParams = {}): Promise<BlogListResponse> {
  const {
    page = 1,
    limit = 20,
    status,
    category,
    search,
    sortBy = 'created_at',
    sortOrder = 'desc',
  } = params;

  const supabase = createServiceClient();

  // Build query
  let query = supabase
    .from('blog_posts')
    .select('id', { count: 'exact' });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  if (category) {
    query = query.eq('category', category);
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
  }

  // Get total count
  const { count, error: countError } = await query;

  if (countError || count === null) {
    console.error('[getAllPosts] Error fetching count:', countError);
    return {
      posts: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
    };
  }

  // Fetch posts
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      profiles!author_id (
        kanji_last_name,
        kanji_first_name
      )
    `)
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .range(from, to);

  if (error) {
    console.error('[getAllPosts] Error:', error);
    return {
      posts: [],
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
  }

  const transformedPosts: BlogPostListItem[] = (posts || []).map((post: any) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    category: post.category,
    status: post.status,
    published_at: post.published_at,
    created_at: post.created_at,
    view_count: post.view_count,
    author: post.profiles ? {
      name: `${post.profiles.kanji_last_name} ${post.profiles.kanji_first_name}`.trim(),
    } : undefined,
  }));

  return {
    posts: transformedPosts,
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
  };
}

/**
 * Get a single post by ID (for admin)
 */
export async function getPostById(id: string): Promise<BlogPost | null> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      profiles!author_id (
        id,
        email,
        kanji_last_name,
        kanji_first_name,
        company_name
      )
    `)
    .eq('id', id)
    .single();

  if (error || !data) {
    console.error('[getPostById] Error:', error);
    return null;
  }

  const post = data as any;
  return {
    ...post,
    author: post.profiles || undefined,
  };
}
