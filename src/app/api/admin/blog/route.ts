/**
 * Admin Blog Posts API
 *
 * Blog post CRUD operations for admin
 * - GET: List blog posts with filters and pagination
 * - POST: Create new blog post
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';
import { createClient } from '@supabase/supabase-js';
import type {
  BlogListParams,
  BlogListResponse,
  BlogPostListItem,
  CreatePostRequest,
  BlogPostStatus,
  BlogCategoryId,
  generateSlug,
  calculateReadingTime,
} from '@/lib/types/blog';

// ============================================================
// Types
// ============================================================

interface AuthorProfile {
  id: string;
  kanji_last_name?: string;
  kanji_first_name?: string;
  company_name?: string;
}

// ============================================================
// GET /api/admin/blog - List blog posts
// ============================================================

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = (page - 1) * limit;
    const status = searchParams.get('status') as BlogPostStatus | 'all' | null;
    const category = searchParams.get('category') as BlogCategoryId | null;
    const searchQuery = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    // Build query
    let query = supabase
      .from('blog_posts')
      .select('*', { count: 'exact' });

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (category) {
      query = query.eq('category', category);
    }
    if (searchQuery) {
      query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
    }

    // Apply sorting and pagination
    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    const { data: posts, error, count } = await query;

    if (error) {
      console.error('[Admin Blog API] Get posts error:', error);
      return NextResponse.json(
        { error: 'ブログ記事の取得に失敗しました。', details: error.message },
        { status: 500 }
      );
    }

    // Fetch author profiles
    let postsWithAuthors: BlogPostListItem[] = [];
    if (posts && posts.length > 0) {
      const authorIds = Array.from(new Set(posts.map((p: any) => p.author_id).filter(Boolean)));

      let profileMap: Record<string, AuthorProfile> = {};
      if (authorIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, kanji_last_name, kanji_first_name, company_name')
          .in('id', authorIds);

        if (profiles) {
          profileMap = profiles.reduce((acc, profile) => {
            acc[profile.id] = profile;
            return acc;
          }, {} as Record<string, AuthorProfile>);
        }
      }

      // Map posts with author names
      postsWithAuthors = posts.map((post: any) => {
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

    const response: BlogListResponse = {
      posts: postsWithAuthors,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Admin Blog API] Unexpected error:', error);
    return NextResponse.json(
      { error: '予期しないエラーが発生しました。', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// ============================================================
// POST /api/admin/blog - Create blog post
// ============================================================

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get authenticated user
    const userId = auth.userId;

    // Parse request body
    const body: CreatePostRequest = await request.json();

    // Validate required fields
    if (!body.title || !body.title.trim()) {
      return NextResponse.json(
        { error: 'タイトルを入力してください。' },
        { status: 400 }
      );
    }

    if (!body.content || !body.content.trim()) {
      return NextResponse.json(
        { error: '本文を入力してください。' },
        { status: 400 }
      );
    }

    if (!body.category) {
      return NextResponse.json(
        { error: 'カテゴリを選択してください。' },
        { status: 400 }
      );
    }

    // Generate slug if not provided
    const slug = body.slug || generateSlug(body.title);

    // Check if slug already exists
    const { data: existingPost } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingPost) {
      return NextResponse.json(
        { error: 'このスラッグは既に使用されています。別のスラッグを入力してください。' },
        { status: 409 }
      );
    }

    // Validate status-specific requirements
    if (body.status === 'published' && !body.published_at) {
      return NextResponse.json(
        { error: '公開日時を設定してください。' },
        { status: 400 }
      );
    }

    // Calculate reading time
    const readingTime = calculateReadingTime(body.content);

    // Prepare post data
    const postData = {
      title: body.title.trim(),
      slug,
      content: body.content,
      excerpt: body.excerpt?.trim() || null,
      category: body.category,
      tags: body.tags || [],
      meta_title: body.meta_title?.trim() || null,
      meta_description: body.meta_description?.trim() || null,
      og_image_path: body.og_image_path || null,
      canonical_url: body.canonical_url?.trim() || null,
      author_id: userId,
      status: body.status,
      published_at: body.status === 'published' ? body.published_at : null,
      reading_time_minutes: readingTime,
      view_count: 0,
    };

    // Insert post
    const { data: post, error } = await supabase
      .from('blog_posts')
      .insert(postData)
      .select()
      .single();

    if (error) {
      console.error('[Admin Blog API] Create post error:', error);
      return NextResponse.json(
        { error: 'ブログ記事の作成に失敗しました。', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      post,
      message: 'ブログ記事を作成しました。',
    }, { status: 201 });
  } catch (error) {
    console.error('[Admin Blog API] Unexpected error:', error);
    return NextResponse.json(
      { error: '予期しないエラーが発生しました。', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// ============================================================
// OPTIONS handler for CORS
// ============================================================

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
