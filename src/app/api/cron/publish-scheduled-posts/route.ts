import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // =====================================================
  // Cron Secret Verification
  // archive-orders/route.ts と同一パターン。
  // 従来は `Bearer ${cronSecret}` の直接比較だったため、CRON_SECRET が
  // 未設定 (undefined) のとき `Bearer undefined` との比較になり、攻撃者が
  // `Bearer undefined` ヘッダーを送れば認証を通過できた。
  // 未設定なら production は 500（設定エラー）・dev は警告して通す。
  // =====================================================
  const CRON_SECRET = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');
  const expectedAuth = CRON_SECRET ? `Bearer ${CRON_SECRET}` : null;

  if (CRON_SECRET) {
    if (!authHeader || authHeader !== expectedAuth) {
      console.warn('[Cron publish-scheduled-posts] ⚠️ Unauthorized access attempt - Invalid or missing auth header');
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Valid CRON_SECRET authorization header required' },
        { status: 401 }
      );
    }
  } else if (process.env.NODE_ENV === 'production') {
    console.warn('[Cron publish-scheduled-posts] ⚠️ CRON_SECRET not set in production');
    return NextResponse.json(
      { error: 'Server configuration error', message: 'CRON_SECRET environment variable is required' },
      { status: 500 }
    );
  } else {
    console.log('[Cron publish-scheduled-posts] ⚠️ Running in dev mode without CRON_SECRET (for testing only)');
  }

  // Create Supabase client with service role key
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Query scheduled posts that should be published
  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'scheduled')
    .lte('published_at', new Date().toISOString());

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch scheduled posts', details: error.message },
      { status: 500 }
    );
  }

  // Update found posts to published status
  let updateCount = 0;
  const publishedPosts: any[] = [];

  if (posts && posts.length > 0) {
    const postIds = posts.map((post) => post.id);

    const { data: updatedPosts, error: updateError } = await supabase
      .from('blog_posts')
      .update({ status: 'published' })
      .in('id', postIds)
      .select();

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update posts', details: updateError.message },
        { status: 500 }
      );
    }

    updateCount = updatedPosts?.length || 0;
    publishedPosts.push(...(updatedPosts || []));
  }

  return NextResponse.json({
    message: 'Scheduled posts processed',
    count: updateCount,
    posts: publishedPosts,
  });
}
