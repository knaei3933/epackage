import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkDuplicates() {
  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('slug, title, og_image_path')
    .eq('status', 'published')
    .order('slug');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('=== サムネイル画像の重複チェック ===\n');

  const thumbMap = new Map();
  posts.forEach(p => {
    const thumb = p.og_image_path;
    if (!thumbMap.has(thumb)) {
      thumbMap.set(thumb, []);
    }
    thumbMap.get(thumb).push(p.slug);
  });

  let hasDuplicates = false;
  thumbMap.forEach((slugs, thumb) => {
    if (slugs.length > 1) {
      console.log(`⚠️ 重複: ${thumb}`);
      slugs.forEach(s => console.log(`  - ${s}`));
      console.log('');
      hasDuplicates = true;
    }
  });

  if (!hasDuplicates) {
    console.log('✅ 重複はありません');
    console.log('\n=== すべてのサムネイル画像 ===');
    posts.forEach((p, i) => {
      console.log(`${String(i + 1).padStart(2, '0')}. ${p.slug.padEnd(35)} → ${p.og_image_path}`);
    });
  }
}

checkDuplicates();
