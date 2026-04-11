import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Read markdown file
const content = fs.readFileSync('./docs/blog/articles/02-variable-printing.md', 'utf8');

async function updatePost() {
  const { error } = await supabase
    .from('blog_posts')
    .update({
      content,
      updated_at: new Date().toISOString()
    })
    .eq('id', 'a1b2c3d4-0001-4000-8000-000000000002');

  if (error) {
    console.error('❌ Error:', error.message);
  } else {
    console.log('✅ Post #02 updated!');
    console.log('   Cost comparison table corrected:');
    console.log('   - Gravure initial cost: 30万 → 12万 (4色 × 3万/色)');
    console.log('   - Added note: Gravure printing for 10,000+ units');
  }
}

updatePost();
