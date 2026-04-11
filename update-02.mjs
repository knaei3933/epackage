import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Read markdown file
const content = fs.readFileSync('./docs/blog/articles/02-variable-printing.md', 'utf8');

// Post data
const postData = {
  title: '【印刷知識】デジタル印刷とは？グラビア印刷との違いと最適な活用シーン',
  content,
  excerpt: 'デジタル印刷は版を作らずにデータを直接印刷する方式で、初期費用がかかりません。Package-Labが専門とするデジタル印刷の仕組み、グラビア印刷との違い、メリットを分かりやすく解説します。',
  updated_at: new Date().toISOString()
};

async function updatePost() {
  try {
    console.log('📝 Updating blog post...');
    console.log(`   ID: a1b2c3d4-0001-4000-8000-000000000002`);
    console.log(`   Title: ${postData.title}`);
    console.log('');

    const { data, error } = await supabase
      .from('blog_posts')
      .update(postData)
      .eq('id', 'a1b2c3d4-0001-4000-8000-000000000002')
      .select();

    if (error) throw error;

    console.log('✅ Post updated!');
    console.log(`   Title: ${data[0].title}`);
    console.log(`   Status: ${data[0].status}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updatePost();
