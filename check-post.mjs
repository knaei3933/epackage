import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkPost() {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', 'small-lot-oem-package-guide')
    .single();

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Post Status:');
  console.log('ID:', data.id);
  console.log('Title:', data.title);
  console.log('Slug:', data.slug);
  console.log('Status:', data.status);
  console.log('Published At:', data.published_at);
  console.log('Created At:', data.created_at);
}

checkPost();
