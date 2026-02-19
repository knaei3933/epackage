/**
 * Admin Single Blog Post API
 *
 * Single blog post operations for admin
 * - GET: Get single blog post by ID
 * - PUT: Update blog post
 * - DELETE: Delete blog post
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';
import { createClient } from '@supabase/supabase-js';
import type { UpdatePostRequest } from '@/lib/types/blog';
import { generateSlug, calculateReadingTime } from '@/lib/types/blog';

// ============================================================
// GET /api/admin/blog/[id] - Get single blog post
// ============================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id: postId } = await params;

    // Fetch post
    const { data: post, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (error) {
      console.error('[Admin Blog API] Get post error:', error);
      return NextResponse.json(
        { error: 'ブログ記事の取得に失敗しました。', details: error.message },
        { status: error.code === 'PGRST116' ? 404 : 500 }
      );
    }

    return NextResponse.json({
      success: true,
      post,
    });
  } catch (error) {
    console.error('[Admin Blog API] Unexpected error:', error);
    return NextResponse.json(
      { error: '予期しないエラーが発生しました。', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// ============================================================
// PUT /api/admin/blog/[id] - Update blog post
// ============================================================

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id: postId } = await params;

    // Check if post exists
    const { data: existingPost, error: fetchError } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (fetchError || !existingPost) {
      return NextResponse.json(
        { error: 'ブログ記事が見つかりませんでした。' },
        { status: 404 }
      );
    }

    // Parse request body
    const body: UpdatePostRequest = await request.json();

    // Validate required fields if provided
    if (body.title !== undefined && (!body.title || !body.title.trim())) {
      return NextResponse.json(
        { error: 'タイトルを入力してください。' },
        { status: 400 }
      );
    }

    if (body.content !== undefined && (!body.content || !body.content.trim())) {
      return NextResponse.json(
        { error: '本文を入力してください。' },
        { status: 400 }
      );
    }

    // Generate slug from title if title changed and slug not provided
    let slug = existingPost.slug;
    if (body.title && body.title !== existingPost.title && !body.slug) {
      slug = generateSlug(body.title);
    } else if (body.slug) {
      slug = body.slug;
    }

    // Check if new slug conflicts with another post
    if (slug !== existingPost.slug) {
      const { data: conflictPost } = await supabase
        .from('blog_posts')
        .select('id')
        .eq('slug', slug)
        .neq('id', postId)
        .single();

      if (conflictPost) {
        return NextResponse.json(
          { error: 'このスラッグは既に使用されています。別のスラッグを入力してください。' },
          { status: 409 }
        );
      }
    }

    // Validate status-specific requirements
    const status = body.status ?? existingPost.status;
    const publishedAt = body.published_at ?? existingPost.published_at;

    if (status === 'published' && !publishedAt) {
      return NextResponse.json(
        { error: '公開日時を設定してください。' },
        { status: 400 }
      );
    }

    // Calculate reading time if content changed
    const readingTime = body.content
      ? calculateReadingTime(body.content)
      : existingPost.reading_time_minutes;

    // Prepare update data
    const updateData: any = {
      ...(body.title !== undefined && { title: body.title.trim() }),
      ...(slug !== existingPost.slug && { slug }),
      ...(body.content !== undefined && { content: body.content }),
      ...(body.excerpt !== undefined && { excerpt: body.excerpt?.trim() || null }),
      ...(body.category !== undefined && { category: body.category }),
      ...(body.tags !== undefined && { tags: body.tags }),
      ...(body.meta_title !== undefined && { meta_title: body.meta_title?.trim() || null }),
      ...(body.meta_description !== undefined && { meta_description: body.meta_description?.trim() || null }),
      ...(body.og_image_path !== undefined && { og_image_path: body.og_image_path || null }),
      ...(body.canonical_url !== undefined && { canonical_url: body.canonical_url?.trim() || null }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.published_at !== undefined && { published_at: body.published_at }),
      ...(body.content && { reading_time_minutes: readingTime }),
      updated_at: new Date().toISOString(),
    };

    // Update post
    const { data: post, error } = await supabase
      .from('blog_posts')
      .update(updateData)
      .eq('id', postId)
      .select()
      .single();

    if (error) {
      console.error('[Admin Blog API] Update post error:', error);
      return NextResponse.json(
        { error: 'ブログ記事の更新に失敗しました。', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      post,
      message: 'ブログ記事を更新しました。',
    });
  } catch (error) {
    console.error('[Admin Blog API] Unexpected error:', error);
    return NextResponse.json(
      { error: '予期しないエラーが発生しました。', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// ============================================================
// DELETE /api/admin/blog/[id] - Delete blog post
// ============================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id: postId } = await params;

    // Check if post exists
    const { data: existingPost, error: fetchError } = await supabase
      .from('blog_posts')
      .select('status')
      .eq('id', postId)
      .single();

    if (fetchError || !existingPost) {
      return NextResponse.json(
        { error: 'ブログ記事が見つかりませんでした。' },
        { status: 404 }
      );
    }

    // Soft delete by setting status to archived
    const { error } = await supabase
      .from('blog_posts')
      .update({ status: 'archived', updated_at: new Date().toISOString() })
      .eq('id', postId);

    if (error) {
      console.error('[Admin Blog API] Delete post error:', error);
      return NextResponse.json(
        { error: 'ブログ記事の削除に失敗しました。', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'ブログ記事をアーカイブしました。',
    });
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
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
