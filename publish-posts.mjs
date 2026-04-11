import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function publishPosts() {
  const posts = [
    { id: 'a1b2c3d4-0001-4000-8000-000000000001', slug: 'gazette-pouch', order: 1 },
    { id: 'a1b2c3d4-0001-4000-8000-000000000002', slug: 'variable-printing', order: 2 },
    { id: 'a1b2c3d4-0001-4000-8000-000000000004', slug: 'stand-pouch', order: 4 },
  ];

  for (const post of posts) {
    console.log(`Publishing #${post.order}: ${post.slug}...`);
    
    const { error } = await supabase
      .from('blog_posts')
      .update({
        status: 'published',
        updated_at: new Date().toISOString()
      })
      .eq('id', post.id);

    if (error) {
      console.error(`  ❌ Error: ${error.message}`);
    } else {
      console.log(`  ✅ Published!`);
    }
  }

  console.log('\nVerifying published posts...');
  const { data } = await supabase
    .from('blog_posts')
    .select('slug, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: true });

  console.log('\nPublished posts (chronological):');
  data.forEach((post, i) => {
    console.log(`${i + 1}. ${post.slug} - ${post.published_at}`);
  });
}

publishPosts();
