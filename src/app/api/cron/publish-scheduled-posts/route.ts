import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Verify CRON_SECRET authorization
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
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
