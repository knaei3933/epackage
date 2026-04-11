import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function listPosts() {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('id, title, slug, status, published_at, category')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Published Posts (latest 10):');
  console.log('=====================================');
  data.forEach((post, index) => {
    console.log(`${index + 1}. ${post.title}`);
    console.log(`   Slug: ${post.slug}`);
    console.log(`   Category: ${post.category}`);
    console.log(`   Published: ${post.published_at}`);
    console.log('');
  });
}

listPosts();
